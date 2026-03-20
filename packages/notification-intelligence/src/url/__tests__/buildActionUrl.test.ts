/**
 * Gate 6 (P2-C2 §7): Action URL resolution validation.
 * Verifies relative-path contract for cross-surface action URLs.
 * Same relative paths resolve on both PWA and SPFx (each supplies origin).
 */
import { describe, it, expect } from 'vitest';
import { buildActionUrl } from '../buildActionUrl.js';

describe('buildActionUrl (P2-C2 §7)', () => {
  it('returns base path when no params provided', () => {
    expect(buildActionUrl('/accounting/req-42')).toBe('/accounting/req-42');
  });

  it('appends query params to base path', () => {
    const url = buildActionUrl('/project-setup/new', {
      mode: 'clarification-return',
      requestId: 'req-42',
    });
    expect(url).toBe('/project-setup/new?mode=clarification-return&requestId=req-42');
  });

  it('omits undefined params', () => {
    const url = buildActionUrl('/foo', { a: 'yes', b: undefined });
    expect(url).toBe('/foo?a=yes');
  });

  it('produces relative paths without origin', () => {
    const url = buildActionUrl('/my-work', { tab: 'team' });
    expect(url.startsWith('/')).toBe(true);
    expect(url).not.toContain('://');
  });

  it('handles empty params object', () => {
    expect(buildActionUrl('/bar', {})).toBe('/bar');
  });

  it('returns base path when params is undefined', () => {
    expect(buildActionUrl('/baz', undefined)).toBe('/baz');
  });
});
