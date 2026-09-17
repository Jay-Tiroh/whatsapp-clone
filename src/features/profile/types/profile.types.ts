// types/profile.types.ts

// ---- Application Domain Models ----

export interface UserProfile {
  id: string;
  phoneNumber: string;
  displayName: string | null;
  avatarUrl: string | null;
  profileComplete: boolean;
  createdAt: string;
}

export interface BlockedUser {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
  blockedAt: string;
}
