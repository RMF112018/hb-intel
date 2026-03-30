// D-PH7-BW-10: Router test for estimating webpart — Project Setup only deployment
import { describe, it, expect } from 'vitest';
import { createWebpartRouter } from '../router/index.js';

describe('createWebpartRouter (estimating — Project Setup only)', () => {
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

  it('does NOT register Bids route (/)', () => {
    const router = createWebpartRouter();
    // The index route exists but redirects — it does not render BidsPage
    // Bids and Templates are not registered as standalone routes
    const routePaths = router.routesByPath ? Object.keys(router.routesByPath) : [];
    expect(routePaths).not.toContain('/templates');
  });

  it('does NOT register Templates route', () => {
    const router = createWebpartRouter();
    const routePaths = router.routesByPath ? Object.keys(router.routesByPath) : [];
    expect(routePaths).not.toContain('/templates');
  });
});
