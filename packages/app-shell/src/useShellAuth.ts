/**
 * useShellAuth — PWA auth adapter combining auth store + current user
 * PH4B.2 §Step 4 (D2) | Blueprint §2b
 *
 * Provides a unified ShellAuthContext from @hbc/auth hooks.
 * Auth-gating stays at the route level (TanStack Router guards).
 */
import { useCurrentUser } from '@hbc/auth';
import { useAuthStore } from '@hbc/auth';

export interface ShellAuthContext {
  /** Current authenticated user, or null if not logged in */
  user: ReturnType<typeof useCurrentUser>;
  /** Whether auth state is still loading */
  isLoading: boolean;
  /** Whether the user is authenticated */
  isAuthenticated: boolean;
}

export function useShellAuth(): ShellAuthContext {
  const user = useCurrentUser();
  const isLoading = useAuthStore((s) => s.isLoading);

  return {
    user,
    isLoading,
    isAuthenticated: user !== null && !isLoading,
  };
}
