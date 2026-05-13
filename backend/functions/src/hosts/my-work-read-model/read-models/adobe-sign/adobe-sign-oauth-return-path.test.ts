import { describe, expect, it } from 'vitest';

import {
  ADOBE_SIGN_OAUTH_DEFAULT_RETURN_PATH,
  ADOBE_SIGN_OAUTH_RETURN_PATH_ALLOWLIST,
  validateAdobeSignReturnPath,
} from './adobe-sign-oauth-return-path.js';

describe('validateAdobeSignReturnPath', () => {
  it('returns the default when input is undefined or empty', () => {
    for (const input of [undefined, '', '   '] as const) {
      const result = validateAdobeSignReturnPath(input);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.path).toBe(ADOBE_SIGN_OAUTH_DEFAULT_RETURN_PATH);
    }
  });

  it('accepts allowlisted SitePages and sites/ prefixes', () => {
    expect(validateAdobeSignReturnPath('/SitePages/MyDashboard.aspx').ok).toBe(true);
    expect(validateAdobeSignReturnPath('/sites/spfx-my-dashboard/SitePages/Home.aspx').ok).toBe(
      true,
    );
  });

  it('rejects absolute http/https URLs', () => {
    for (const input of [
      'http://evil.example.com/SitePages/MyDashboard.aspx',
      'https://attacker.test/SitePages/MyDashboard.aspx',
    ]) {
      const result = validateAdobeSignReturnPath(input);
      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.reason).toBe('not-relative');
    }
  });

  it('rejects protocol-relative URLs (//evil)', () => {
    const result = validateAdobeSignReturnPath('//evil.example.com/');
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe('protocol-relative');
  });

  it('rejects backslash tricks like /\\evil', () => {
    const result = validateAdobeSignReturnPath('/\\evil.example.com');
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe('contains-backslash');
  });

  it('rejects query/fragment characters so we control the UX status field', () => {
    expect(validateAdobeSignReturnPath('/SitePages/MyDashboard.aspx?x=1').ok).toBe(false);
    expect(validateAdobeSignReturnPath('/SitePages/MyDashboard.aspx#frag').ok).toBe(false);
  });

  it('rejects paths that do not match any allowlist prefix', () => {
    const result = validateAdobeSignReturnPath('/admin/secret');
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe('not-allowlisted');
  });

  it('honors a caller-supplied allowlist', () => {
    const result = validateAdobeSignReturnPath('/custom/page', {
      allowlist: ['/custom/'],
      defaultPath: '/custom/page',
    });
    expect(result.ok).toBe(true);
  });

  it('exports a non-empty default and allowlist', () => {
    expect(ADOBE_SIGN_OAUTH_RETURN_PATH_ALLOWLIST.length).toBeGreaterThan(0);
    expect(ADOBE_SIGN_OAUTH_DEFAULT_RETURN_PATH).toMatch(/^\//);
  });
});
