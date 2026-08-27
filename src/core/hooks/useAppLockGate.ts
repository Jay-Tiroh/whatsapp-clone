// core/hooks/useAppLockGate.ts
import { usePinStore } from "@/core/store/pinStore";
import { useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";

// how long the app can be backgrounded before requiring the PIN again
const LOCK_GRACE_PERIOD_MS = 0; // 0 = lock immediately on every resume

export function useAppLockGate() {
  const appState = useRef(AppState.currentState);
  const { hasSetupPin, lock, setLastBackgroundedAt, lastBackgroundedAt } =
    usePinStore();

  useEffect(() => {
    const sub = AppState.addEventListener("change", (next: AppStateStatus) => {
      const prev = appState.current;

      if (prev === "active" && (next === "background" || next === "inactive")) {
        setLastBackgroundedAt(Date.now());
      }

      if (prev.match(/inactive|background/) && next === "active") {
        if (hasSetupPin) {
          const elapsed = lastBackgroundedAt
            ? Date.now() - lastBackgroundedAt
            : Infinity;
          if (elapsed >= LOCK_GRACE_PERIOD_MS) {
            lock();
          }
        }
        setLastBackgroundedAt(null);
      }

      appState.current = next;
    });

    return () => sub.remove();
  }, [hasSetupPin, lastBackgroundedAt, lock, setLastBackgroundedAt]);
}
