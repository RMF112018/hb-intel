/**
 * Router factory — Blueprint §2f (TanStack Router).
 * Creates the app router with type registration.
 */
import { createRouter } from '@tanstack/react-router';
import { rootRoute } from './root-route.js';
import { allRoutes } from './workspace-routes.js';

const routeTree = rootRoute.addChildren(allRoutes);

export function createAppRouter() {
  return createRouter({
    routeTree,
    defaultPreload: 'intent',
  });
}

export type AppRouter = ReturnType<typeof createAppRouter>;

// Type registration for TanStack Router
declare module '@tanstack/react-router' {
  interface Register {
    router: AppRouter;
  }
}
