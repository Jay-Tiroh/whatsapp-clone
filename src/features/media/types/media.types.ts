// ---- Request Payloads ----

// POST /v1/media/uploads
export interface CreateMediaUploadDto {
  clientUploadId: string;
  purpose: "profile_avatar" | "group_avatar" | "message_attachment";
  contentType:
    | "image/jpeg"
    | "image/png"
    | "image/webp"
    | "audio/aac"
    | "audio/mp4"
    | "audio/m4a"
    | "audio/x-m4a"
    | "audio/mpeg"
    | "audio/ogg"
    | "audio/wav"
    | "audio/x-wav"
    | "video/mp4"
    | "video/quicktime"
    | "video/webm"
    | "application/pdf"
    | "text/plain"
    | "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    | "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    | "application/vnd.openxmlformats-officedocument.presentationml.presentation";
  sizeBytes: number;
  contentSha256?: string;
  originalFilename?: string;
}

// ---- Response DTOs ----

// Nested inside CreateMediaUploadResponseDto
export interface CloudinaryUploadFieldsDto {
  api_key: string;
  timestamp: string;
  signature: string;
  public_id: string;
  context: string;
  type: "upload";
  overwrite: "false";
  allowed_formats:
    | "jpg,jpeg,png,webp"
    | "aac,m4a,mp3,ogg,wav"
    | "mp4,mov,webm"
    | "pdf,txt,docx,xlsx,pptx";
  upload_preset: string;
  transformation?: string;
}

// Nested inside CreateMediaUploadResponseDto
export interface CloudinaryUploadAuthorizationDto {
  url: string;
  method: "POST";
  expiresAt: string;
  fields: CloudinaryUploadFieldsDto;
}

// POST /v1/media/uploads/{mediaId}/complete | Nested inside CreateMediaUploadResponseDto
export interface MediaAssetResponseDto {
  id: string;
  purpose: "profile_avatar" | "group_avatar" | "message_attachment";
  status: "pending" | "ready" | "failed" | "deleted";
  type: "image" | "audio" | "video" | "document";
  contentType:
    | "image/jpeg"
    | "image/png"
    | "image/webp"
    | "audio/aac"
    | "audio/mp4"
    | "audio/m4a"
    | "audio/x-m4a"
    | "audio/mpeg"
    | "audio/ogg"
    | "audio/wav"
    | "audio/x-wav"
    | "video/mp4"
    | "video/quicktime"
    | "video/webm"
    | "application/pdf"
    | "text/plain"
    | "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    | "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    | "application/vnd.openxmlformats-officedocument.presentationml.presentation";
  sizeBytes: number;
  originalFilename?: string | null;
  width?: number | null;
  height?: number | null;
  durationMs?: number | null;
  secureUrl?: string | null;
  createdAt: string;
  expiresAt: string;
  completedAt?: string | null;
}

// POST /v1/media/uploads
export interface CreateMediaUploadResponseDto {
  media: MediaAssetResponseDto;
  upload?: CloudinaryUploadAuthorizationDto | null;
}
