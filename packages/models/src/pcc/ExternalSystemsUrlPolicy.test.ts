import { describe, expect, it } from 'vitest';
import {
  CREDENTIAL_LIKE_QUERY_PARAM_NAMES,
  EXTERNAL_URL_POLICY_CONTRACT,
  URL_POLICY_REASON_CODES,
  evaluateExternalUrlPolicy,
  type IExternalUrlPolicyRule,
} from './ExternalSystemsUrlPolicy.js';

const APPROVED_EXAMPLE_INVALID: readonly IExternalUrlPolicyRule[] = [
  { approvedHosts: ['example.invalid'] },
];

describe('External URL policy contract literal', () => {
  it('mirrors the canonical artifact verbatim', () => {
    expect(EXTERNAL_URL_POLICY_CONTRACT.allowedSchemes).toEqual(['https']);
    expect(EXTERNAL_URL_POLICY_CONTRACT.blockedSchemes).toEqual([
      'http',
      'javascript',
      'data',
      'file',
      'ftp',
    ]);
    expect(EXTERNAL_URL_POLICY_CONTRACT.blockedHosts).toEqual([
      'localhost',
      '127.0.0.1',
      '0.0.0.0',
    ]);
    expect(EXTERNAL_URL_POLICY_CONTRACT.blockPrivateIpRanges).toBe(true);
    expect(EXTERNAL_URL_POLICY_CONTRACT.customLinksRequireApproval).toBe(true);
    expect(EXTERNAL_URL_POLICY_CONTRACT.requiredApproverRoles).toEqual([
      'project-manager',
      'project-executive',
    ]);
    expect(EXTERNAL_URL_POLICY_CONTRACT.iframeDefault).toBe('blocked');
    expect(EXTERNAL_URL_POLICY_CONTRACT.currentImageDefault).toBe('blocked');
  });

  it('exposes the full reason-code tuple', () => {
    expect([...URL_POLICY_REASON_CODES]).toEqual([
      'allowed',
      'invalid-url',
      'scheme-blocked',
      'host-not-approved',
      'host-blocked-local',
      'query-contains-credential-like-parameter',
      'custom-link-requires-approval',
      'iframe-blocked-by-default',
      'current-image-blocked-by-default',
      'policy-unavailable',
    ]);
  });

  it('exposes the credential-like query parameter blocklist', () => {
    expect([...CREDENTIAL_LIKE_QUERY_PARAM_NAMES]).toContain('token');
    expect([...CREDENTIAL_LIKE_QUERY_PARAM_NAMES]).toContain('access_token');
    expect([...CREDENTIAL_LIKE_QUERY_PARAM_NAMES]).toContain('sharedaccesssignature');
  });
});

describe('evaluateExternalUrlPolicy — context precedence', () => {
  it('blocks iframe context regardless of URL', () => {
    const result = evaluateExternalUrlPolicy({
      candidateUrl: 'https://example.invalid/x',
      approvedDomainPolicy: APPROVED_EXAMPLE_INVALID,
      isIframeContext: true,
    });
    expect(result.isAllowed).toBe(false);
    expect(result.reason).toBe('iframe-blocked-by-default');
  });

  it('blocks current-image context regardless of URL', () => {
    const result = evaluateExternalUrlPolicy({
      candidateUrl: 'https://example.invalid/x',
      approvedDomainPolicy: APPROVED_EXAMPLE_INVALID,
      isCurrentImageContext: true,
    });
    expect(result.isAllowed).toBe(false);
    expect(result.reason).toBe('current-image-blocked-by-default');
  });
});

describe('evaluateExternalUrlPolicy — URL parsing', () => {
  it('returns invalid-url for malformed input without throwing', () => {
    const result = evaluateExternalUrlPolicy({ candidateUrl: 'not a url' });
    expect(result.isAllowed).toBe(false);
    expect(result.reason).toBe('invalid-url');
  });

  it('returns invalid-url for empty string', () => {
    const result = evaluateExternalUrlPolicy({ candidateUrl: '' });
    expect(result.isAllowed).toBe(false);
    expect(result.reason).toBe('invalid-url');
  });
});

describe('evaluateExternalUrlPolicy — scheme matrix', () => {
  it.each([
    ['http://example.invalid/x', 'scheme-blocked'],
    ['javascript:alert(1)', 'scheme-blocked'],
    ['data:text/html,hello', 'scheme-blocked'],
    ['file:///etc/passwd', 'scheme-blocked'],
    ['ftp://example.invalid/x', 'scheme-blocked'],
  ])('blocks %s', (candidateUrl, reason) => {
    const result = evaluateExternalUrlPolicy({
      candidateUrl,
      approvedDomainPolicy: APPROVED_EXAMPLE_INVALID,
    });
    expect(result.isAllowed).toBe(false);
    expect(result.reason).toBe(reason);
  });

  it('allows https with approved host', () => {
    const result = evaluateExternalUrlPolicy({
      candidateUrl: 'https://example.invalid/x',
      approvedDomainPolicy: APPROVED_EXAMPLE_INVALID,
    });
    expect(result.isAllowed).toBe(true);
    expect(result.reason).toBe('allowed');
    expect(result.hostname).toBe('example.invalid');
  });
});

describe('evaluateExternalUrlPolicy — host blocklist', () => {
  it.each([
    'https://localhost/x',
    'https://127.0.0.1/x',
    'https://0.0.0.0/x',
    'https://10.0.0.1/x',
    'https://10.255.255.255/x',
    'https://172.16.0.1/x',
    'https://172.20.5.7/x',
    'https://172.31.255.255/x',
    'https://192.168.0.1/x',
    'https://192.168.1.1/x',
    'https://[::1]/x',
    'https://[::]/x',
  ])('rejects loopback or private host %s', (candidateUrl) => {
    const result = evaluateExternalUrlPolicy({
      candidateUrl,
      approvedDomainPolicy: APPROVED_EXAMPLE_INVALID,
    });
    expect(result.isAllowed).toBe(false);
    expect(result.reason).toBe('host-blocked-local');
  });

  it('does NOT classify 172.32.0.1 as private (outside RFC 1918)', () => {
    const result = evaluateExternalUrlPolicy({
      candidateUrl: 'https://172.32.0.1/x',
      approvedDomainPolicy: [{ approvedHosts: ['172.32.0.1'] }],
    });
    expect(result.reason).not.toBe('host-blocked-local');
  });
});

describe('evaluateExternalUrlPolicy — credential-like query parameters', () => {
  it.each([
    'token',
    'Token',
    'TOKEN',
    'secret',
    'password',
    'passwd',
    'pwd',
    'key',
    'api_key',
    'apikey',
    'code',
    'sig',
    'signature',
    'credential',
    'client_secret',
    'access_token',
    'refresh_token',
    'sharedaccesssignature',
  ])('detects %s parameter case-insensitively', (paramName) => {
    const url = `https://example.invalid/x?${paramName}=value`;
    const result = evaluateExternalUrlPolicy({
      candidateUrl: url,
      approvedDomainPolicy: APPROVED_EXAMPLE_INVALID,
    });
    expect(result.isAllowed).toBe(false);
    expect(result.reason).toBe('query-contains-credential-like-parameter');
    expect(result.detectedCredentialLikeParams).toBeDefined();
  });

  it('allows benign query parameters', () => {
    const result = evaluateExternalUrlPolicy({
      candidateUrl: 'https://example.invalid/x?id=42&page=2',
      approvedDomainPolicy: APPROVED_EXAMPLE_INVALID,
    });
    expect(result.isAllowed).toBe(true);
    expect(result.reason).toBe('allowed');
  });
});

describe('evaluateExternalUrlPolicy — custom-link approval gate', () => {
  it('blocks custom links that require approval', () => {
    const result = evaluateExternalUrlPolicy({
      candidateUrl: 'https://example.invalid/x',
      approvedDomainPolicy: APPROVED_EXAMPLE_INVALID,
      requiresApproval: true,
    });
    expect(result.isAllowed).toBe(false);
    expect(result.reason).toBe('custom-link-requires-approval');
  });

  it('allows links that do not require approval', () => {
    const result = evaluateExternalUrlPolicy({
      candidateUrl: 'https://example.invalid/x',
      approvedDomainPolicy: APPROVED_EXAMPLE_INVALID,
      requiresApproval: false,
    });
    expect(result.isAllowed).toBe(true);
    expect(result.reason).toBe('allowed');
  });
});

describe('evaluateExternalUrlPolicy — approved-domain matching', () => {
  it('rejects unapproved host when an allowlist is provided', () => {
    const result = evaluateExternalUrlPolicy({
      candidateUrl: 'https://other.invalid/x',
      approvedDomainPolicy: APPROVED_EXAMPLE_INVALID,
    });
    expect(result.isAllowed).toBe(false);
    expect(result.reason).toBe('host-not-approved');
  });

  it('allows host that exact-matches', () => {
    const result = evaluateExternalUrlPolicy({
      candidateUrl: 'https://exact.example.invalid/x',
      approvedDomainPolicy: [{ approvedHosts: ['exact.example.invalid'] }],
    });
    expect(result.isAllowed).toBe(true);
  });

  it('allows host that matches a wildcard suffix rule (*.suffix form)', () => {
    const result = evaluateExternalUrlPolicy({
      candidateUrl: 'https://api.example.invalid/x',
      approvedDomainPolicy: [{ approvedHostSuffixes: ['*.example.invalid'] }],
    });
    expect(result.isAllowed).toBe(true);
  });

  it('allows host that matches a wildcard suffix rule (.suffix form)', () => {
    const result = evaluateExternalUrlPolicy({
      candidateUrl: 'https://api.example.invalid/x',
      approvedDomainPolicy: [{ approvedHostSuffixes: ['.example.invalid'] }],
    });
    expect(result.isAllowed).toBe(true);
  });

  it('allows the apex when only a suffix rule is present', () => {
    const result = evaluateExternalUrlPolicy({
      candidateUrl: 'https://example.invalid/x',
      approvedDomainPolicy: [{ approvedHostSuffixes: ['*.example.invalid'] }],
    });
    expect(result.isAllowed).toBe(true);
  });

  it('skips a rule that is scoped to a different system', () => {
    const result = evaluateExternalUrlPolicy({
      candidateUrl: 'https://example.invalid/x',
      systemKey: 'procore',
      approvedDomainPolicy: [{ approvedHosts: ['example.invalid'], perSystemKey: 'sage-intacct' }],
    });
    expect(result.isAllowed).toBe(false);
    expect(result.reason).toBe('host-not-approved');
  });

  it('skips a rule that is scoped to a different link type', () => {
    const result = evaluateExternalUrlPolicy({
      candidateUrl: 'https://example.invalid/x',
      linkType: 'system',
      approvedDomainPolicy: [{ approvedHosts: ['example.invalid'], perLinkType: 'custom' }],
    });
    expect(result.isAllowed).toBe(false);
    expect(result.reason).toBe('host-not-approved');
  });

  it('allows when no approved-domain policy is provided', () => {
    const result = evaluateExternalUrlPolicy({
      candidateUrl: 'https://example.invalid/x',
    });
    expect(result.isAllowed).toBe(true);
    expect(result.reason).toBe('allowed');
  });
});

describe('evaluateExternalUrlPolicy — purity and stability', () => {
  it('returns deterministic structural result for identical input', () => {
    const input = {
      candidateUrl: 'https://example.invalid/x',
      approvedDomainPolicy: APPROVED_EXAMPLE_INVALID,
    } as const;
    const a = evaluateExternalUrlPolicy(input);
    const b = evaluateExternalUrlPolicy(input);
    expect(a).toEqual(b);
  });

  it('does not throw on any input shape — only returns a result', () => {
    expect(() =>
      evaluateExternalUrlPolicy({
        candidateUrl: ' ￿',
        approvedDomainPolicy: APPROVED_EXAMPLE_INVALID,
      }),
    ).not.toThrow();
  });
});
