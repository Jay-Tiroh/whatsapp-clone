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
        const clientUploadId = Crypto.randomUUID();

        const payload: CreateMediaUploadDto = {
          clientUploadId,
          purpose,
          contentType: resolvedContentType,
          sizeBytes: info.size ?? 0,
          originalFilename,
        };

        // 2. Ask the backend to authorize the upload
        setStatus("requesting");
        const { media, upload: authorization } = await withRetry(
          () => mediaApi.createUpload(payload),
          maxAuthRetries,
        );
        if (cancelledRef.current) throw new Error("Upload cancelled");

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
            console.log(authorization);
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

        // 4. Tell the backend the upload landed, so it can verify with Cloudinary
        //    and finalize the MediaAsset (may need a retry or two if it checks
        //    Cloudinary status synchronously and that isn't ready yet).
        setStatus("completing");
        let finalAsset = await withRetry(
          () => mediaApi.completeUpload(media.id),
          0,
        );

        let attempts = 0;
        while (
          finalAsset.status === "pending" &&
          attempts < maxCompleteRetries
        ) {
          if (cancelledRef.current) throw new Error("Upload cancelled");
          await new Promise((r) => setTimeout(r, 1000 * 2 ** attempts));
          finalAsset = await mediaApi.completeUpload(media.id);
          attempts++;
        }
        if (finalAsset.status === "failed")
          throw new Error("Media processing failed");

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
