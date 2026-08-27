import { api } from "@/core/lib/api";
import type {
  ContactMatch,
  DiscoveredUser,
  MatchContactsPayload,
  MatchContactsResponseDto,
  SearchUsersQueryPayload,
  SearchUsersResponseDto,
} from "../types/discovery.types";

const mapDiscoveredUser = (dto: any): DiscoveredUser => ({
  id: dto.id,
  displayName: dto.displayName,
  avatarUrl: dto.avatarUrl,
});

const mapContactMatch = (dto: any): ContactMatch => ({
  matchedPhoneNumber: dto.matchedPhoneNumber,
  user: mapDiscoveredUser(dto.user),
});

export const discoveryApi = {
  matchContacts: async (
    payload: MatchContactsPayload,
  ): Promise<{ matches: ContactMatch[] }> => {
    const { data } = await api.post<MatchContactsResponseDto>(
      "/v1/contacts/match",
      payload,
    );
    return {
      matches: data.matches.map(mapContactMatch),
    };
  },

  searchUsers: async (
    params: SearchUsersQueryPayload,
  ): Promise<{ items: DiscoveredUser[]; nextCursor: string | null }> => {
    const { data } = await api.get<SearchUsersResponseDto>("/v1/users/search", {
      params,
    });
    return {
      items: data.items.map(mapDiscoveredUser),
      nextCursor: data.nextCursor,
    };
  },
};
