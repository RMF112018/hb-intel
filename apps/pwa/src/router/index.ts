/**
 * Router factory — Blueprint §2f (TanStack Router).
 * Creates the app router with type registration.
 * Accepts an optional `history` override so the dev-harness can mount a
 * memory-history router (D-PH7-DH-1) without altering browser URL state.
 */
import { createRouter } from '@tanstack/react-router';
import type { RouterHistory } from '@tanstack/react-router';
import { rootRoute } from './root-route.js';
import { allRoutes } from './workspace-routes.js';

const routeTree = rootRoute.addChildren(allRoutes);

export function createAppRouter(history?: RouterHistory) {
  return createRouter({
    routeTree,
    defaultPreload: 'intent',
    ...(history !== undefined ? { history } : {}),
  });
}

export type AppRouter = ReturnType<typeof createAppRouter>;

// Type registration for TanStack Router
declare module '@tanstack/react-router' {
  interface Register {
    router: AppRouter;
  }
}
