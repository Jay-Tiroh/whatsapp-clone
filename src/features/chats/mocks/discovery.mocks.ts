// features/discovery/mocks/discovery.mocks.ts
import type { ContactMatchDto } from "../types/discovery.types";

export const mockContactMatches: ContactMatchDto[] = [
  {
    matchedPhoneNumber: "+2348012345678",
    user: {
      id: "user_10",
      displayName: "Mom",
      avatarUrl: "https://i.pravatar.cc/150?u=user_10",
    },
  },
  {
    matchedPhoneNumber: "+2348023456789",
    user: {
      id: "user_11",
      displayName: "Sir Albert",
      avatarUrl: null,
    },
  },
  {
    matchedPhoneNumber: "+2348034567890",
    user: {
      id: "user_12",
      displayName: "Cody Fisher",
      avatarUrl: "https://i.pravatar.cc/150?u=user_12",
    },
  },
  // pad out to simulate "26+ more contacts"
  ...Array.from({ length: 26 }, (_, i) => ({
    matchedPhoneNumber: `+234801000${String(i).padStart(4, "0")}`,
    user: {
      id: `user_${100 + i}`,
      displayName: `Contact ${i + 1}`,
      avatarUrl: null,
    },
  })),
];
