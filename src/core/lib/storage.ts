import { getRandomBytes } from "expo-crypto";
import * as SecureStore from "expo-secure-store";
import { createMMKV } from "react-native-mmkv";

const STORAGE_ID = "chatme-storage";
const KEY_V1 = "mmkv.encryptionKey"; // old Math.random() key
const KEY_V2 = "mmkv.encryptionKey.v2"; // CSPRNG key

const KEY_ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

function generateSecureKey(): string {
  // 16 chars x 6 bits = 96 bits, all single-byte ASCII.
  // 256 % 64 === 0, so `% 64` introduces no modulo bias.
  const bytes = getRandomBytes(16);
  return Array.from(bytes, (b) => KEY_ALPHABET[b % 64]).join("");
}
function openStorage() {
  // 1. Already migrated, or a fresh install that has run before.
  const v2 = SecureStore.getItem(KEY_V2);
  if (v2) {
    return createMMKV({ id: STORAGE_ID, encryptionKey: v2 });
  }

  const newKey = generateSecureKey();
  const v1 = SecureStore.getItem(KEY_V1);

  // 2. Existing install: re-encrypt in place, then switch keys.
  if (v1) {
    const instance = createMMKV({ id: STORAGE_ID, encryptionKey: v1 });
    instance.recrypt(newKey);
    SecureStore.setItem(KEY_V2, newKey);
    void SecureStore.deleteItemAsync(KEY_V1);
    return instance;
  }

  // 3. Fresh install: nothing to migrate.
  SecureStore.setItem(KEY_V2, newKey);
  return createMMKV({ id: STORAGE_ID, encryptionKey: newKey });
}

export const storage = openStorage();
