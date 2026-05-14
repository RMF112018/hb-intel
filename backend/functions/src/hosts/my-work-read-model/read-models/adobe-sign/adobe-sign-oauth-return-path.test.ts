import { describe, expect, it } from 'vitest';

import {
  ADOBE_SIGN_OAUTH_FRONTEND_ORIGIN_ENV_KEY,
  ADOBE_SIGN_OAUTH_DEFAULT_RETURN_PATH,
  ADOBE_SIGN_OAUTH_RETURN_PATH_ALLOWLIST,
  buildAdobeSignCallbackRedirectLocation,
  resolveAdobeSignFrontendOrigin,
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

describe('resolveAdobeSignFrontendOrigin', () => {
  it('accepts an https origin with no path/query/hash', () => {
    const result = resolveAdobeSignFrontendOrigin({
      [ADOBE_SIGN_OAUTH_FRONTEND_ORIGIN_ENV_KEY]: 'https://hedrickbrotherscom.sharepoint.com',
    });
    expect(result).toEqual({ ok: true, origin: 'https://hedrickbrotherscom.sharepoint.com' });
  });

  it('rejects missing/invalid/insecure or path-bearing values', () => {
    expect(resolveAdobeSignFrontendOrigin({}).ok).toBe(false);
    expect(
      resolveAdobeSignFrontendOrigin({
        [ADOBE_SIGN_OAUTH_FRONTEND_ORIGIN_ENV_KEY]: 'not-a-url',
      }),
    ).toEqual({ ok: false, reason: 'invalid-url' });
    expect(
      resolveAdobeSignFrontendOrigin({
        [ADOBE_SIGN_OAUTH_FRONTEND_ORIGIN_ENV_KEY]: 'http://contoso.sharepoint.com',
      }),
    ).toEqual({ ok: false, reason: 'not-https' });
    expect(
      resolveAdobeSignFrontendOrigin({
        [ADOBE_SIGN_OAUTH_FRONTEND_ORIGIN_ENV_KEY]:
          'https://contoso.sharepoint.com/sites/MyDashboard',
      }),
    ).toEqual({ ok: false, reason: 'has-path' });
  });
});

describe('buildAdobeSignCallbackRedirectLocation', () => {
  it('builds an absolute URL with the oauth status query set by the callback', () => {
    const location = buildAdobeSignCallbackRedirectLocation({
      origin: 'https://hedrickbrotherscom.sharepoint.com',
      returnPath: '/sites/MyDashboard/SitePages/MyDashboard.aspx',
      status: 'invalid-state',
    });
    expect(location).toBe(
      'https://hedrickbrotherscom.sharepoint.com/sites/MyDashboard/SitePages/MyDashboard.aspx?adobeSignAuthorization=invalid-state',
    );
  });
});
