// Router test for Project Setup Requests SPFx surface
import { describe, it, expect } from 'vitest';
import { createWebpartRouter } from '../router/index.js';

describe('createWebpartRouter (Project Setup Requests)', () => {
  it('creates a router with memory history starting at /project-setup', () => {
    const router = createWebpartRouter();
    expect(router.history.location.pathname).toBe('/project-setup');
  });

  it('registers Project Setup routes', () => {
    const router = createWebpartRouter();
    const routePaths = router.routesByPath ? Object.keys(router.routesByPath) : [];
    expect(routePaths).toContain('/project-setup');
    expect(routePaths).toContain('/project-setup/new');
    expect(routePaths).toContain('/project-setup/$requestId');
  });

  it('does NOT register Bids or Templates routes', () => {
    const router = createWebpartRouter();
    const routePaths = router.routesByPath ? Object.keys(router.routesByPath) : [];
    expect(routePaths).not.toContain('/bids');
    expect(routePaths).not.toContain('/templates');
  });
});
