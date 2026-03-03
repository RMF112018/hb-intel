/**
 * Router factory — Blueprint §2f (TanStack Router).
 * Browser history for standalone mobile app (deep linking + back button).
 */
import { createRouter, createBrowserHistory } from '@tanstack/react-router';
import { rootRoute } from './root-route.js';
import { appRoutes } from './routes.js';

const routeTree = rootRoute.addChildren(appRoutes);

export function createAppRouter() {
  return createRouter({
    routeTree,
    history: createBrowserHistory(),
    defaultPreload: 'intent',
  });
}

export type AppRouter = ReturnType<typeof createAppRouter>;

declare module '@tanstack/react-router' {
  interface Register {
    router: AppRouter;
  }
}
