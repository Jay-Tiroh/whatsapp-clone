import { isMediaUploadExpired } from "@/shared/utils/errors";
import * as Crypto from "expo-crypto";
import * as FileSystem from "expo-file-system/legacy";
import { useCallback, useRef, useState } from "react";
import { mediaApi } from "../api/media.api";
import type {
  CreateMediaUploadDto,
  MediaAssetResponseDto,
} from "../types/media.types";
import { inferContentType } from "../utils/mime";

type UploadPurpose = CreateMediaUploadDto["purpose"];

export type UploadStatus =
  | "idle"
  | "preparing"
  | "requesting"
  | "uploading"
  | "completing"
  | "success"
  | "error"
  | "cancelled";

interface UploadParams {
  uri: string;
  purpose: UploadPurpose;
  originalFilename?: string;
  contentType?: CreateMediaUploadDto["contentType"];
}

interface UseUploadOptions {
  maxAuthRetries?: number;
  /** If completeUpload comes back "pending", retry it this many times before giving up. */
  maxCompleteRetries?: number;
}

export function useUpload(options: UseUploadOptions = {}) {
  const { maxAuthRetries = 2, maxCompleteRetries = 5 } = options;

  const [status, setStatus] = useState<UploadStatus>("idle");
  const [progress, setProgress] = useState(0); // 0..1
  const [error, setError] = useState<Error | null>(null);
  const [asset, setAsset] = useState<MediaAssetResponseDto | null>(null);

  const taskRef = useRef<FileSystem.UploadTask | null>(null);
  const cancelledRef = useRef(false);

  const reset = useCallback(() => {
    setStatus("idle");
    setProgress(0);
    setError(null);
    setAsset(null);
    cancelledRef.current = false;
    taskRef.current = null;
  }, []);

  const cancel = useCallback(async () => {
    cancelledRef.current = true;
    if (taskRef.current) {
      try {
        await taskRef.current.cancelAsync();
      } catch {
        // task may have already finished — safe to ignore
      }
    }
    setStatus("cancelled");
  }, []);

  const withRetry = useCallback(
    async <T>(fn: () => Promise<T>, maxAttempts: number): Promise<T> => {
      let lastError: unknown;
      for (let attempt = 0; attempt <= maxAttempts; attempt++) {
        if (cancelledRef.current) throw new Error("Upload cancelled");
        try {
          return await fn();
        } catch (err) {
          lastError = err;
          // An expired authorization is terminal for this clientUploadId.
          if (isMediaUploadExpired(err)) throw err;
          if (attempt < maxAttempts) {
            await new Promise((r) => setTimeout(r, 500 * 2 ** attempt));
          }
        }
      }
      throw lastError instanceof Error
        ? lastError
        : new Error("Request failed");
    },
    [],
  );

  const upload = useCallback(
    async ({
      uri,
      purpose,
      originalFilename,
      contentType,
    }: UploadParams): Promise<MediaAssetResponseDto> => {
      reset();
      cancelledRef.current = false;

      try {
        // 1. Gather file metadata
        setStatus("preparing");
        const info = await FileSystem.getInfoAsync(uri);
        if (!info.exists)
          throw new Error("File does not exist at the given uri");
        const resolvedContentType =
          contentType ?? inferContentType(originalFilename ?? uri);

        // 2. Ask the backend to authorize the upload. A 410 means this
        // clientUploadId expired and can never be reused: start a fresh attempt
        // under a new id (there is no renewal endpoint).
        setStatus("requesting");
        let created:
          Awaited<ReturnType<typeof mediaApi.createUpload>> | undefined;
        for (let restart = 0; ; restart++) {
          const payload: CreateMediaUploadDto = {
            clientUploadId: Crypto.randomUUID(),
            purpose,
            contentType: resolvedContentType,
            sizeBytes: info.size ?? 0,
            originalFilename,
          };

          try {
            created = await withRetry(
              () => mediaApi.createUpload(payload),
              maxAuthRetries,
            );
            break;
          } catch (error) {
            if (isMediaUploadExpired(error) && restart < 1) continue;
            throw error;
          }
        }
        if (cancelledRef.current) throw new Error("Upload cancelled");
        if (!created) throw new Error("Upload authorization failed");

        const { media, upload: authorization } = created;

        // Replay of an already-completed upload: upload is null and the media is
        // ready. Contract: skip both the transfer and the completion call.
        if (!authorization && media.status === "ready") {
          setAsset(media);
          setProgress(1);
          setStatus("success");
          return media;
        }

        // 3. If Cloudinary auth came back, push the file there directly
        if (authorization) {
          setStatus("uploading");
          const task = FileSystem.createUploadTask(
            authorization.url,
            uri,
            {
              httpMethod: "POST",
              uploadType: FileSystem.FileSystemUploadType.MULTIPART,
              fieldName: "file",
              mimeType: resolvedContentType,
              parameters: authorization.fields as unknown as Record<
                string,
                string
              >,
            },
            (uploadProgress) => {
              const { totalBytesSent, totalBytesExpectedToSend } =
                uploadProgress;
              if (totalBytesExpectedToSend > 0) {
                setProgress(totalBytesSent / totalBytesExpectedToSend);
              }
            },
          );
          taskRef.current = task;

          const result = await task.uploadAsync();
          taskRef.current = null;

          if (cancelledRef.current) throw new Error("Upload cancelled");
          if (!result || result.status < 200 || result.status >= 300) {
            let message = `Cloudinary upload failed with status ${result?.status}`;
            try {
              const parsed = result?.body ? JSON.parse(result.body) : null;
              if (parsed?.error?.message) message = parsed.error.message;
            } catch {
              // body wasn't JSON — fall back to the generic message
            }
            throw new Error(message);
          }
        }

        // 4. Tell the backend the upload landed, so it can verify with Cloudinary and finalize
        setStatus("completing");
        let finalAsset = await withRetry(
          () => mediaApi.completeUpload(media.id),
          0,
        );
        if (cancelledRef.current) throw new Error("Upload cancelled");

        let attempts = 0;
        while (
          finalAsset.status === "pending" &&
          attempts < maxCompleteRetries
        ) {
          if (cancelledRef.current) throw new Error("Upload cancelled");
          await new Promise((r) => setTimeout(r, 1000 * 2 ** attempts));
          if (cancelledRef.current) throw new Error("Upload cancelled");
          finalAsset = await mediaApi.completeUpload(media.id);
          attempts++;
        }

        // The user may have cancelled while the last completion was in flight.
        if (cancelledRef.current) throw new Error("Upload cancelled");

        // A still-pending asset after retries is NOT success.
        if (finalAsset.status !== "ready") {
          throw new Error(
            finalAsset.status === "failed"
              ? "Media processing failed"
              : "Media is still processing. Please try again.",
          );
        }

        setAsset(finalAsset);
        setProgress(1);
        setStatus("success");
        return finalAsset;
      } catch (err) {
        const normalized =
          err instanceof Error ? err : new Error("Upload failed");
        if (!cancelledRef.current) {
          setError(normalized);
          setStatus("error");
        }
        throw normalized;
      }
    },
    [maxAuthRetries, maxCompleteRetries, reset, withRetry],
  );

  return { upload, cancel, reset, status, progress, error, asset };
}
