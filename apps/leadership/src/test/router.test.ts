// D-PH7-BW-10: Router test for leadership webpart
import { describe, it, expect } from 'vitest';
import { createWebpartRouter } from '../router/index.js';

describe('createWebpartRouter (leadership)', () => {
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
