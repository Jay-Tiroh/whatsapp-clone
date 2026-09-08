// core/lib/cloudinary.ts
import * as FileSystem from "expo-file-system/legacy";

const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export async function uploadToCloudinary(
  fileUri: string,
  resourceType: "image" | "video" = "image",
) {
  const response = await FileSystem.uploadAsync(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`,
    fileUri,
    {
      httpMethod: "POST",
      uploadType: FileSystem.FileSystemUploadType.MULTIPART,
      fieldName: "file",
      parameters: {
        upload_preset: UPLOAD_PRESET!,
      },
    },
  );

  if (response.status !== 200) {
    throw new Error(`Cloudinary upload failed: ${response.body}`);
  }

  return JSON.parse(response.body); // { secure_url, public_id, ... }
}
