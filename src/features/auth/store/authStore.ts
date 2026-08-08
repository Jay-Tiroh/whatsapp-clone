import { storage } from "@/core/lib/storage";

const zustandMmkvStorage = {
  setItem: (name: string, value: string) => storage.set(name, value),
  getItem: (name: string) => storage.getString(name) ?? null,
  removeItem: (name: string) => storage.remove(name),
};

// type AuthState = {
//   user: User | null;
//   setUser: (user: User | null) => void;
// };

// export const useAuthStore = create<AuthState>()(
//   persist(
//     (set) => ({
//       user: null,
//       setUser: (user) => set({ user }),
//     }),
//     {
//       name: "chatme-auth-storage",
//       storage: createJSONStorage(() => zustandMmkvStorage),
//     }
//   )
// );
