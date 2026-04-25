import { describe, expect, it } from 'vitest';
import {
  createFoleonOriginPolicy,
  isAllowedFoleonUrl,
  DEFAULT_FOLEON_ORIGINS,
} from '../FoleonOriginPolicy.js';

describe('FoleonOriginPolicy', () => {
  describe('createFoleonOriginPolicy', () => {
    it('defaults to the Foleon US viewer origin', () => {
      const policy = createFoleonOriginPolicy();
      expect(policy.allowedOrigins).toEqual(DEFAULT_FOLEON_ORIGINS);
      expect(policy.allowPreview).toBe(false);
    });

    it('normalizes full URLs into origins', () => {
      const policy = createFoleonOriginPolicy([
        'https://viewer.us.foleon.com/preview/abc',
        'https://stories.hedrickbrothers.com',
      ]);
      expect(policy.allowedOrigins).toEqual([
        'https://viewer.us.foleon.com',
        'https://stories.hedrickbrothers.com',
      ]);
    });

    it('rejects wildcard entries', () => {
      const policy = createFoleonOriginPolicy(['https://*.foleon.com', 'https://viewer.us.foleon.com']);
      expect(policy.allowedOrigins).toEqual(['https://viewer.us.foleon.com']);
    });

    it('rejects non-http schemes', () => {
      const policy = createFoleonOriginPolicy(['javascript:alert(1)', 'https://viewer.us.foleon.com']);
      expect(policy.allowedOrigins).toEqual(['https://viewer.us.foleon.com']);
    });

    it('rejects http origins under the default https-required policy', () => {
      const policy = createFoleonOriginPolicy(['http://viewer.us.foleon.com', 'https://viewer.us.foleon.com']);
      expect(policy.requireHttps).toBe(true);
      expect(policy.allowedOrigins).toEqual(['https://viewer.us.foleon.com']);
    });

    it('accepts http origins only when requireHttps is explicitly false', () => {
      const policy = createFoleonOriginPolicy(['http://localhost:3000'], false, false);
      expect(policy.requireHttps).toBe(false);
      expect(policy.allowedOrigins).toEqual(['http://localhost:3000']);
    });

    it('deduplicates entries', () => {
      const policy = createFoleonOriginPolicy([
        'https://viewer.us.foleon.com',
        'https://viewer.us.foleon.com/path',
      ]);
      expect(policy.allowedOrigins).toEqual(['https://viewer.us.foleon.com']);
    });
  });

  describe('isAllowedFoleonUrl', () => {
    const policy = createFoleonOriginPolicy(['https://viewer.us.foleon.com']);

    it('accepts an allowlisted production URL', () => {
      expect(isAllowedFoleonUrl(policy, 'https://viewer.us.foleon.com/published/abc/')).toEqual({
        allowed: true,
        reason: 'ok',
        normalizedOrigin: 'https://viewer.us.foleon.com',
      });
    });

    it('rejects an origin not in the allowlist', () => {
      expect(
        isAllowedFoleonUrl(policy, 'https://viewer.eu.foleon.com/published/xyz/').allowed,
      ).toBe(false);
    });

    it('blocks preview URLs by default', () => {
      const result = isAllowedFoleonUrl(policy, 'https://viewer.us.foleon.com/preview/abc/');
      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('preview-url-blocked');
    });

    it('permits preview URLs when allowPreview is true', () => {
      const permissive = createFoleonOriginPolicy(['https://viewer.us.foleon.com'], true);
      expect(
        isAllowedFoleonUrl(permissive, 'https://viewer.us.foleon.com/preview/abc/').allowed,
      ).toBe(true);
    });

    it('rejects http schemes when only https is allowlisted', () => {
      const result = isAllowedFoleonUrl(policy, 'http://viewer.us.foleon.com/published/abc/');
      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('wrong-scheme');
    });

    it('accepts http schemes only when requireHttps is explicitly false', () => {
      const permissive = createFoleonOriginPolicy(['http://localhost:3000'], false, false);
      const result = isAllowedFoleonUrl(permissive, 'http://localhost:3000/preview/abc/');
      // origin allowed; preview still blocked
      expect(result.reason).toBe('preview-url-blocked');
      const okResult = isAllowedFoleonUrl(permissive, 'http://localhost:3000/published/abc/');
      expect(okResult.allowed).toBe(true);
    });

    it('rejects malformed URLs', () => {
      expect(isAllowedFoleonUrl(policy, 'not-a-url').reason).toBe('invalid-url');
      expect(isAllowedFoleonUrl(policy, '   ').reason).toBe('invalid-url');
    });

    it('rejects empty / undefined input', () => {
      expect(isAllowedFoleonUrl(policy, undefined).reason).toBe('invalid-url');
      expect(isAllowedFoleonUrl(policy, '').reason).toBe('invalid-url');
    });

    it('rejects javascript: URLs as wrong-scheme', () => {
      const result = isAllowedFoleonUrl(policy, 'javascript:alert(1)');
      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('wrong-scheme');
    });
  });
});
