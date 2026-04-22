// Safety webpart router + Wave-1 nav tests.
// See plan §6 (phase-02 audit remediation).
import { describe, it, expect } from 'vitest';
import { createWebpartRouter } from '../router/index.js';
import { matchActiveTabId, SAFETY_NAV_TABS } from '../router/root-route.js';

describe('createWebpartRouter (safety)', () => {
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

describe('Wave 1 — matchActiveTabId (plan §6 #1)', () => {
  it.each([
    ['/', 'upload'],
    ['/upload', 'upload'],
    ['/periods', 'periods'],
    ['/projects/2024-118/weeks/2026-04-20', 'periods'],
    ['/review', 'review'],
    ['/inspections', 'inspections'],
    ['/inspections/ie-3001', 'inspections'],
  ])('pathname %s → tab %s', (pathname, expected) => {
    expect(matchActiveTabId(pathname)).toBe(expected);
  });

  it('falls back to upload for unknown paths', () => {
    expect(matchActiveTabId('/nope')).toBe('upload');
  });
});

describe('Wave 1 — Incidents removed from nav (plan §6 #2, G-11)', () => {
  it('SAFETY_NAV_TABS does not include incidents', () => {
    const ids = SAFETY_NAV_TABS.map((t) => t.id.toLowerCase());
    const labels = SAFETY_NAV_TABS.map((t) => t.label.toLowerCase());
    expect(ids).not.toContain('incidents');
    expect(labels).not.toContain('incidents');
  });

  it('SAFETY_NAV_TABS contains exactly the four Wave-1 tabs', () => {
    expect(SAFETY_NAV_TABS.map((t) => t.id)).toEqual([
      'upload',
      'periods',
      'review',
      'inspections',
    ]);
  });
});

describe('Wave 1 — /incidents redirect (plan §6 #3, G-11)', () => {
  it('navigating to /incidents redirects to /periods with from=incidents', async () => {
    const router = createWebpartRouter();
    await router.navigate({ to: '/incidents' as never });
    expect(router.state.location.pathname).toBe('/periods');
    const search = router.state.location.search as Record<string, unknown>;
    expect(search?.from).toBe('incidents');
  });
});
