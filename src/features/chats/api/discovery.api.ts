import { api } from "@/core/lib/api";
import type {
  MatchContactsRequestDto,
  MatchContactsResponseDto,
  SearchUsersQueryDto,
  SearchUsersResponseDto,
} from "../types/discovery.types";

export const discoveryApi = {
  matchContacts: async (
    data: MatchContactsRequestDto,
  ): Promise<MatchContactsResponseDto> => {
    const response = await api.post<MatchContactsResponseDto>(
      "/v1/contacts/match",
      data,
    );
    return response.data;
  },

  searchUsers: async (
    params: SearchUsersQueryDto,
  ): Promise<SearchUsersResponseDto> => {
    const response = await api.get<SearchUsersResponseDto>("/v1/users/search", {
      params,
    });
    return response.data;
  },
};
