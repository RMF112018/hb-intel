// D-PH7-BW-10: Router test for admin webpart
import { describe, it, expect, beforeEach } from 'vitest';
import { usePermissionStore } from '@hbc/auth';
import { createWebpartRouter } from '../router/index.js';

describe('createWebpartRouter (admin)', () => {
  beforeEach(() => {
    // Admin routes require admin:access-control:view to avoid redirect loop
    usePermissionStore.setState({ permissions: ['admin:access-control:view', 'admin:read'] });
  });

  it('creates a router with memory history', () => {
    const router = createWebpartRouter();
    expect(router.history.location.pathname).toBe('/');
  });

  it('resolves the root route', async () => {
    const router = createWebpartRouter();
    await router.navigate({ to: '/' });
    expect(router.state.location.pathname).toBe('/');
  });
});
