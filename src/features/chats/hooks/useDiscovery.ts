// hooks/useDiscovery.ts
import { discoveryApi } from "@/features/chats/api/discovery.api";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { MatchContactsPayload } from "../types/discovery.types";

export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);

  return debounced;
}

export function useSearchUsers(query: string, limit = 20) {
  const debouncedQuery = useDebouncedValue(query.trim(), 300);

  return useInfiniteQuery({
    queryKey: ["discovery", "searchUsers", debouncedQuery],
    queryFn: ({ pageParam }: { pageParam?: string }) =>
      discoveryApi.searchUsers({ q: debouncedQuery, limit, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: debouncedQuery.length > 0,
  });
}

export function useMatchContacts() {
  return useMutation({
    mutationFn: (payload: MatchContactsPayload) =>
      discoveryApi.matchContacts(payload),
  });
}
