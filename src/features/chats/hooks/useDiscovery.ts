import { useMutation, useQuery } from "@tanstack/react-query";
import { discoveryApi } from "../api/discovery.api";
import type {
  MatchContactsPayload,
  SearchUsersQueryPayload,
} from "../types/discovery.types";

export const useMatchContacts = () => {
  return useMutation({
    mutationFn: (payload: MatchContactsPayload) =>
      discoveryApi.matchContacts(payload),
  });
};

export const useSearchUsers = (params: SearchUsersQueryPayload) => {
  return useQuery({
    queryKey: ["users", "search", params],
    queryFn: () => discoveryApi.searchUsers(params),
    enabled: !!params?.q,
  });
};
