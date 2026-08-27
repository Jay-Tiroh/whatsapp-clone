// features/discovery/hooks/useDiscovery.ts
import { useMutation, useQuery } from "@tanstack/react-query";
import { discoveryApi } from "../api/discovery.api";
import type {
  MatchContactsRequestDto,
  SearchUsersQueryDto,
} from "../types/discovery.types";

export const useMatchContacts = () => {
  return useMutation({
    mutationFn: (data: MatchContactsRequestDto) =>
      discoveryApi.matchContacts(data),
  });
};

export const useSearchUsers = (params: SearchUsersQueryDto) => {
  return useQuery({
    queryKey: ["users", "search", params],
    queryFn: () => discoveryApi.searchUsers(params),
    // Ensures the query only runs if the required search term 'q' is provided
    enabled: !!params?.q,
  });
};
