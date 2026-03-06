import { describe, expect, it } from 'vitest';
import {
  clearRedirectMemory,
  isSafeRedirectPath,
  rememberRedirectTarget,
  restoreRedirectTarget,
} from './redirectMemory.js';

describe('redirect memory', () => {
  it('restores remembered redirect when safe and unexpired', () => {
    clearRedirectMemory();
    rememberRedirectTarget({
      pathname: '/project-hub/portfolio',
      runtimeMode: 'pwa',
      now: new Date('2026-03-06T10:00:00.000Z'),
      ttlMs: 60_000,
    });

    const restored = restoreRedirectTarget({
      runtimeMode: 'pwa',
      now: new Date('2026-03-06T10:00:30.000Z'),
    });
    expect(restored?.pathname).toBe('/project-hub/portfolio');
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
});
