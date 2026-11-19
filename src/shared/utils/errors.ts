// src/utils/errors.ts
import { isAxiosError, type AxiosError } from "axios";

function extractCodeFromData(data: unknown): string | undefined {
  if (typeof data !== "object" || data === null) return undefined;
  const obj = data as Record<string, unknown>;
  if (typeof obj.code === "string") return obj.code;
  if (typeof obj.error === "object" && obj.error !== null) {
    const nested = obj.error as Record<string, unknown>;
    if (typeof nested.code === "string") return nested.code;
  }
  return undefined;
}

function extractMessageFromData(data: unknown): string | undefined {
  if (typeof data === "string") return data;
  if (typeof data === "object" && data !== null) {
    const obj = data as Record<string, unknown>;
    if (typeof obj.message === "string") return obj.message;
    if (typeof obj.error === "object" && obj.error !== null) {
      const nested = obj.error as Record<string, unknown>;
      if (typeof nested.message === "string") return nested.message;
    }
    if (typeof obj.error === "string") return obj.error;
  }
  return undefined;
}

function getAxiosErrorMessage(error: AxiosError, fallback: string): string {
  // Server responded with an error status — try to pull a message from the body
  if (error.response) {
    const msg = extractMessageFromData(error.response.data);
    if (msg) return msg;
    return `Request failed (${error.response.status})`;
  }
  // Request was made but no response came back (network/timeout)
  if (error.request) {
    return error.code === "ECONNABORTED"
      ? "Request timed out. Check your connection and try again."
      : "Network error. Check your connection and try again.";
  }
  // Something went wrong setting up the request
  return error.message || fallback;
}

export function getErrorMessage(
  error: unknown,
  fallback = "Something went wrong",
): string {
  if (!error) return fallback;

  if (isAxiosError(error)) {
    return getAxiosErrorMessage(error, fallback);
  }

  if (error instanceof Error) {
    return error.message || fallback;
  }

  if (typeof error === "string") return error;

  return fallback;
}

// Helper for react-query's `onError` / `error` state, which is typed `unknown`
// but almost always wraps an AxiosError in this app.
export function isNotFound(error: unknown): boolean {
  return isAxiosError(error) && error.response?.status === 404;
}

export function isUnauthorized(error: unknown): boolean {
  return isAxiosError(error) && error.response?.status === 401;
}

/** Machine-readable error code from the API body (`{ code }` or `{ error: { code } }`). */
export function getApiErrorCode(error: unknown): string | undefined {
  if (!isAxiosError(error)) return undefined;
  return extractCodeFromData(error.response?.data);
}

export function isApiStatus(error: unknown, status: number): boolean {
  return isAxiosError(error) && error.response?.status === status;
}

/** The pending upload authorization expired and its clientUploadId cannot be reused. */
export function isMediaUploadExpired(error: unknown): boolean {
  return (
    isApiStatus(error, 410) || getApiErrorCode(error) === "MEDIA_UPLOAD_EXPIRED"
  );
}

/**
 * Sending with a clientMessageId that already exists for a different payload.
 * Retrying cannot succeed: the client must surface a terminal state instead.
 */
export function isMessageIdempotencyConflict(error: unknown): boolean {
  const code = getApiErrorCode(error);
  if (code) return code === "MESSAGE_IDEMPOTENCY_CONFLICT";
  // Message send only documents 409 for idempotency conflicts.
  return isApiStatus(error, 409);
}
