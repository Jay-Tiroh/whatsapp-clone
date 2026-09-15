import type { CreateMediaUploadPayload } from "../types/media.types";

const EXTENSION_MAP: Record<string, CreateMediaUploadPayload["contentType"]> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  aac: "audio/aac",
  m4a: "audio/m4a",
  mp3: "audio/mpeg",
  ogg: "audio/ogg",
  wav: "audio/wav",
  mp4: "video/mp4",
  mov: "video/quicktime",
  webm: "video/webm",
  pdf: "application/pdf",
  txt: "text/plain",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
};

export function inferContentType(
  uriOrFilename: string,
): CreateMediaUploadPayload["contentType"] {
  const ext = uriOrFilename.split(".").pop()?.toLowerCase().split("?")[0] ?? "";
  const contentType = EXTENSION_MAP[ext];
  if (!contentType) throw new Error(`Unsupported file extension: .${ext}`);
  return contentType;
}
