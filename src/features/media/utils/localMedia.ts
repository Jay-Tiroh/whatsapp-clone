import * as FileSystem from "expo-file-system/legacy";

export type PickedImage = {
  uri: string;
  width?: number;
  height?: number;
};

const ALLOWED_EXT = new Set(["jpg", "jpeg", "png", "webp"]);

const dir = () => `${FileSystem.documentDirectory ?? ""}outbox/`;

export const resolveLocalUri = (file: string) => `${dir()}${file}`;

// Copy out of the picker/camera cache, which the OS can purge before a retry.
export async function persistLocalCopy(
  sourceUri: string,
  baseName: string,
): Promise<{ file: string; sizeBytes: number }> {
  const ext = sourceUri.split("?")[0].split(".").pop()?.toLowerCase() ?? "";
  if (!ALLOWED_EXT.has(ext)) {
    throw new Error("Only JPG, PNG or WebP images can be sent");
  }

  await FileSystem.makeDirectoryAsync(dir(), { intermediates: true }).catch(
    () => {},
  );

  const file = `${baseName}.${ext}`;
  await FileSystem.copyAsync({ from: sourceUri, to: resolveLocalUri(file) });

  const info = await FileSystem.getInfoAsync(resolveLocalUri(file));
  if (!info.exists) throw new Error("Could not read the selected image");
  return { file, sizeBytes: info.size ?? 0 };
}

export function deleteLocalCopy(file: string) {
  FileSystem.deleteAsync(resolveLocalUri(file), { idempotent: true }).catch(
    () => {},
  );
}

export function clearLocalOutboxFiles() {
  FileSystem.deleteAsync(dir(), { idempotent: true }).catch(() => {});
}
