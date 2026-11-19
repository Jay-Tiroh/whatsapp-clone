import * as FileSystem from "expo-file-system/legacy";

import { mediaApi } from "../api/media.api";
import type {
  CreateMediaUploadDto,
  MediaAssetResponseDto,
} from "../types/media.types";

export class UploadCancelledError extends Error {
  constructor() {
    super("Upload cancelled");
    this.name = "UploadCancelledError";
  }
}

// Module-level: an upload outlives the screen that started it.
const tasks = new Map<string, FileSystem.UploadTask>();
const cancelled = new Set<string>();

export function cancelUpload(clientUploadId: string) {
  cancelled.add(clientUploadId);
  void tasks
    .get(clientUploadId)
    ?.cancelAsync()
    .catch(() => {});
}

export function cancelAllUploads() {
  for (const id of tasks.keys()) cancelUpload(id);
}

export type UploadStage = "new" | "uploaded" | "ready";

type Params = {
  clientUploadId: string; // stable identity: same value on every retry
  fileUri: string;
  contentType: CreateMediaUploadDto["contentType"];
  sizeBytes: number;
  purpose: CreateMediaUploadDto["purpose"];
  originalFilename?: string;
  // Resume state, persisted by the caller:
  stage: UploadStage;
  mediaId?: string;
  onMediaCreated?: (mediaId: string) => void;
  onUploaded?: () => void; // bytes are on Cloudinary
  onProgress?: (fraction: number) => void;
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function uploadMedia(p: Params): Promise<MediaAssetResponseDto> {
  const id = p.clientUploadId;
  cancelled.delete(id);
  const check = () => {
    if (cancelled.has(id)) throw new UploadCancelledError();
  };

  try {
    let mediaId = p.mediaId;

    // Skip create + upload when a previous attempt already got the bytes up.
    if (p.stage === "new" || !mediaId) {
      const { media, upload } = await mediaApi.createUpload({
        clientUploadId: id,
        purpose: p.purpose,
        contentType: p.contentType,
        sizeBytes: p.sizeBytes,
        originalFilename: p.originalFilename,
      });
      check();
      mediaId = media.id;
      p.onMediaCreated?.(mediaId);

      if (upload) {
        const task = FileSystem.createUploadTask(
          upload.url,
          p.fileUri,
          {
            httpMethod: "POST",
            uploadType: FileSystem.FileSystemUploadType.MULTIPART,
            fieldName: "file",
            mimeType: p.contentType,
            parameters: upload.fields as unknown as Record<string, string>,
          },
          ({ totalBytesSent, totalBytesExpectedToSend }) => {
            if (totalBytesExpectedToSend > 0) {
              p.onProgress?.(totalBytesSent / totalBytesExpectedToSend);
            }
          },
        );
        tasks.set(id, task);

        let result: FileSystem.FileSystemUploadResult | null | undefined;
        try {
          result = await task.uploadAsync();
        } finally {
          tasks.delete(id);
        }
        check();

        // uploadAsync resolves null/undefined when the task is cancelled or
        // paused. A cancellation is already reported by check() above, so this
        // is an interrupted upload: fail it rather than treating it as success.
        if (!result) {
          throw new Error("Upload failed: the upload was interrupted");
        }

        if (result.status < 200 || result.status >= 300) {
          let message = `Upload failed (status ${result.status})`;
          try {
            const parsed = result.body ? JSON.parse(result.body) : null;
            if (parsed?.error?.message) message = parsed.error.message;
          } catch {
            // body wasn't JSON
          }
          throw new Error(message);
        }
      }
      p.onUploaded?.();
    }

    // Finalize with the backend, polling while it verifies with Cloudinary.
    let asset = await mediaApi.completeUpload(mediaId);
    for (
      let attempt = 0;
      asset.status === "pending" && attempt < 5;
      attempt++
    ) {
      check();
      await sleep(1000 * 2 ** attempt);
      asset = await mediaApi.completeUpload(mediaId);
    }
    check();
    if (asset.status !== "ready") throw new Error("Media processing failed");
    return asset;
  } catch (error) {
    // cancelAsync makes uploadAsync reject/resolve oddly; normalise it.
    if (cancelled.has(id)) throw new UploadCancelledError();
    throw error;
  }
}
