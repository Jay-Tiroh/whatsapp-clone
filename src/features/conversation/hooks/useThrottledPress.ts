import { useCallback, useRef } from "react";

/**
 * Runs the first call immediately and ignores any further calls
 * made within `delay` ms. Always calls the latest version of `fn`.
 */
export function useThrottledPress<A extends unknown[]>(
  fn: (...args: A) => void,
  delay = 800,
) {
  const lastCall = useRef(0);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  return useCallback(
    (...args: A) => {
      const now = Date.now();
      if (now - lastCall.current < delay) return;
      lastCall.current = now;
      fnRef.current(...args);
    },
    [delay],
  );
}
