import { describe, expect, it } from 'vitest';
import {
  captureIntendedDestination,
  clearRedirectMemory,
  isSafeRedirectPath,
  rememberRedirectTarget,
  resolvePostGuardRedirect,
  restoreRedirectTarget,
} from './redirectMemory.js';

describe('redirect memory', () => {
  it('restores remembered redirect when safe and unexpired', () => {
    clearRedirectMemory();
    rememberRedirectTarget({
      pathname: '/project-hub',
      runtimeMode: 'pwa',
      now: new Date('2026-03-06T10:00:00.000Z'),
      ttlMs: 60_000,
    });

    const restored = restoreRedirectTarget({
      runtimeMode: 'pwa',
      now: new Date('2026-03-06T10:00:30.000Z'),
    });
    expect(restored?.pathname).toBe('/project-hub');
  });

  it('blocks restore when runtime mode does not match', () => {
    clearRedirectMemory();
    rememberRedirectTarget({
      pathname: '/project-hub',
      runtimeMode: 'pwa',
    });
    const restored = restoreRedirectTarget({ runtimeMode: 'spfx' });
    expect(restored).toBeNull();
  });

  it('validates safe redirect paths', () => {
    expect(isSafeRedirectPath('/project-hub')).toBe(true);
    expect(isSafeRedirectPath('//evil.com')).toBe(false);
    expect(isSafeRedirectPath('https://evil.com')).toBe(false);
  });

  it('captures intended destination for guard-driven redirects', () => {
    clearRedirectMemory();
    const captured = captureIntendedDestination({
      pathname: '/leadership/kpi',
      runtimeMode: 'pwa',
    });
    expect(captured?.pathname).toBe('/leadership/kpi');
  });

  it('resolves fallback path when restored target is no longer allowed', () => {
    clearRedirectMemory();
    rememberRedirectTarget({
      pathname: '/admin/secure',
      runtimeMode: 'pwa',
      now: new Date('2026-03-06T10:00:00.000Z'),
      ttlMs: 60_000,
    });

    const target = resolvePostGuardRedirect({
      runtimeMode: 'pwa',
      fallbackPath: '/project-hub',
      now: new Date('2026-03-06T10:00:30.000Z'),
      isTargetAllowed: () => false,
    });

    expect(target).toBe('/project-hub');
  });
});
