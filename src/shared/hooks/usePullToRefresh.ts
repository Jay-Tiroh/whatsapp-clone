import { useCallback, useState } from "react";

export function usePullToRefresh(onRefresh: () => void | Promise<unknown>) {
  const [isPulling, setIsPulling] = useState(false);

  const handleRefresh = useCallback(async () => {
    setIsPulling(true);
    try {
      await onRefresh();
    } finally {
      setIsPulling(false);
    }
  }, [onRefresh]);

  return { isPulling, handleRefresh };
}
