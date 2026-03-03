/**
 * Imperative route guards — Blueprint §4a.
 * Called from TanStack Router beforeLoad (outside React tree).
 * Uses Zustand .getState() for store access.
 */
import { redirect } from '@tanstack/react-router';
import { useAuthStore, usePermissionStore } from '@hbc/auth';

/**
 * Require authenticated user. Redirect to root if not logged in.
 */
export function requireAuth(): void {
  const user = useAuthStore.getState().currentUser;
  if (!user) {
    throw redirect({ to: '/' });
  }
}

/**
 * Require specific permission. Redirect to project-hub if unauthorized.
 */
export function requirePermission(action: string): void {
  requireAuth();
  const hasIt = usePermissionStore.getState().hasPermission(action);
  const hasWildcard = usePermissionStore.getState().hasPermission('*:*');
  if (!hasIt && !hasWildcard) {
    throw redirect({ to: '/project-hub' });
  }
}
