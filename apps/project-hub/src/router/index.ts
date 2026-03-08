/**
 * Memory-based router for SPFx webpart — Project Hub.
 * No browser URL manipulation (memory history).
 */
import { createRouter, createMemoryHistory } from '@tanstack/react-router';
import { rootRoute } from './root-route.js';
import { webpartRoutes } from './routes.js';

const routeTree = rootRoute.addChildren(webpartRoutes);

export function createWebpartRouter() {
  return createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: ['/'] }),
  });
}

export type WebpartRouter = ReturnType<typeof createWebpartRouter>;
