import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { discoveryApi } from "../api/discovery.api";
import type { MatchContactsDto } from "../types/discovery.types";

export function useSearchUsers(query: string, limit = 20) {
  const debouncedQuery = useDebouncedValue(query.trim(), 300);

  return useInfiniteQuery({
    queryKey: ["discovery", "searchUsers", debouncedQuery],
    queryFn: ({ pageParam }: { pageParam?: string }) =>
      discoveryApi.searchUsers({
        q: debouncedQuery,
        limit,
        cursor: pageParam,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: debouncedQuery.length > 0,
  });
}

export function useMatchContacts() {
  return useMutation({
    mutationFn: (payload: MatchContactsDto) =>
      discoveryApi.matchContacts(payload),
  });
}
