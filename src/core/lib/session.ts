import { clientStoragePersister } from "@/core/lib/persister";
import { queryClient } from "@/core/lib/queryClient";
import { bumpSessionGeneration } from "@/core/lib/sessionGeneration";
import { disconnectSocket } from "@/core/lib/socket";
import { tokenStorage } from "@/core/lib/tokenStorage";
import { useAuthStore } from "@/features/auth/store/authStore";

/**
 * The only place a session is destroyed. Safe to call more than once.
 * Order matters: invalidate in-flight work first, then credentials, then data.
 */
export function teardownSession() {
  bumpSessionGeneration(); // any refresh or request from the old session is now stale
  tokenStorage.clearTokens(); // nothing can refetch with the old token
  disconnectSocket();

  void queryClient.cancelQueries();
  queryClient.getMutationCache().clear();
  queryClient.clear(); // in-memory cache
  clientStoragePersister.removeClient(); // persisted cache (includes contact matches)

  useAuthStore.getState().clearSession(); // flips isAuthenticated, resets feature stores
}
