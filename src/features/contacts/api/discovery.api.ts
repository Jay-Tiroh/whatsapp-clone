import { api } from "@/core/lib/api";
import type {
  ContactMatch,
  ContactMatchDto,
  ContactMatchesResponseDto,
  DiscoveredUser,
  MatchContactsDto,
  PublicDiscoveryUserDto,
  SearchUsersQueryPayload,
  UserSearchResponseDto,
} from "../types/discovery.types";

const mapDiscoveredUser = (dto: PublicDiscoveryUserDto): DiscoveredUser => ({
  id: dto.id,
  displayName: typeof dto.displayName === "string" ? dto.displayName : null,
  avatarUrl: dto.avatarUrl,
});

const mapContactMatch = (dto: ContactMatchDto): ContactMatch => ({
  matchedPhoneNumber: dto.matchedPhoneNumber,
  user: mapDiscoveredUser(dto.user),
});

export const discoveryApi = {
  matchContacts: async (
    payload: MatchContactsDto,
  ): Promise<{ matches: ContactMatch[] }> => {
    const { data } = await api.post<ContactMatchesResponseDto>(
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
    const { data } = await api.get<UserSearchResponseDto>("/v1/users/search", {
      params,
    });
    return {
      items: data.items.map(mapDiscoveredUser),
      nextCursor: data.nextCursor,
    };
  },
};
