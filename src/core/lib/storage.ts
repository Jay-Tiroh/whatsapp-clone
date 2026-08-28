import * as SecureStore from "expo-secure-store";
import { createMMKV } from "react-native-mmkv";

const ENCRYPTION_KEY_ALIAS = "mmkv.encryptionKey";

function generateFallbackKey(): string {
  // NOT cryptographically secure — Math.random() is predictable in theory.
  // TODO: replace with expo-crypto's getRandomBytes (or
  // react-native-get-random-values) once a new dev build is available.
  let key = "";
  for (let i = 0; i < 64; i++) {
    key += Math.floor(Math.random() * 16).toString(16);
  }
  return key;
}

function getOrCreateEncryptionKey(): string {
  let key = SecureStore.getItem(ENCRYPTION_KEY_ALIAS);

  if (!key) {
    key = generateFallbackKey();
    SecureStore.setItem(ENCRYPTION_KEY_ALIAS, key);
  }

  return key;
}

export const storage = createMMKV({
  id: "chatme-storage",
  encryptionKey: getOrCreateEncryptionKey(),
});
