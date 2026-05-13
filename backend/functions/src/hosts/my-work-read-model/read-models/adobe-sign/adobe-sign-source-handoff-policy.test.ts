import { describe, expect, it } from 'vitest';

import type { IExternalUrlPolicyRule } from '@hbc/models/pcc';

import { evaluateAdobeSignSourceHandoff } from './adobe-sign-source-handoff-policy.js';

const APPROVED_ADOBE_DOMAINS: readonly IExternalUrlPolicyRule[] = [
  { approvedHostSuffixes: ['.adobesign.com', '.echosign.com'] },
];

describe('evaluateAdobeSignSourceHandoff', () => {
  describe('allowed cases', () => {
    it('allows an HTTPS Adobe Sign agreement URL with no credential-like params', () => {
      const url = 'https://secure.na1.adobesign.com/account/agreementView?agreementId=abc123';
      const decision = evaluateAdobeSignSourceHandoff(url, {
        approvedDomainPolicy: APPROVED_ADOBE_DOMAINS,
      });
      expect(decision).toEqual({ status: 'allowed', sourceOpenUrl: url });
    });

    it('allows any policy-passing HTTPS URL when no approved-domain rules are configured', () => {
      const url = 'https://example.org/some/page?ref=queue';
      const decision = evaluateAdobeSignSourceHandoff(url);
      expect(decision).toEqual({ status: 'allowed', sourceOpenUrl: url });
    });
  });

  describe('rejected cases', () => {
    it('rejects non-HTTPS URLs as scheme-blocked', () => {
      const decision = evaluateAdobeSignSourceHandoff('http://secure.adobesign.com/path', {
        approvedDomainPolicy: APPROVED_ADOBE_DOMAINS,
      });
      expect(decision).toEqual({ status: 'rejected', reason: 'scheme-blocked' });
    });

    it('rejects localhost as host-blocked-local', () => {
      expect(evaluateAdobeSignSourceHandoff('https://localhost/agreementView')).toEqual({
        status: 'rejected',
        reason: 'host-blocked-local',
      });
    });

    it('rejects 127.0.0.1 as host-blocked-local', () => {
      expect(evaluateAdobeSignSourceHandoff('https://127.0.0.1/path')).toEqual({
        status: 'rejected',
        reason: 'host-blocked-local',
      });
    });

    it('rejects RFC 1918 private hosts as host-blocked-local', () => {
      for (const host of ['10.0.0.5', '172.16.1.2', '192.168.1.1']) {
        expect(evaluateAdobeSignSourceHandoff(`https://${host}/agreement`)).toEqual({
          status: 'rejected',
          reason: 'host-blocked-local',
        });
      }
    });

    it('rejects IPv6 loopback as host-blocked-local', () => {
      expect(evaluateAdobeSignSourceHandoff('https://[::1]/path')).toEqual({
        status: 'rejected',
        reason: 'host-blocked-local',
      });
    });

    it('rejects credential-like query parameter names', () => {
      for (const qs of [
        'access_token=abc',
        'signature=abc',
        'password=abc',
        'client_secret=abc',
        'token=abc',
      ]) {
        const url = `https://secure.adobesign.com/agreementView?${qs}`;
        expect(
          evaluateAdobeSignSourceHandoff(url, { approvedDomainPolicy: APPROVED_ADOBE_DOMAINS }),
        ).toEqual({
          status: 'rejected',
          reason: 'query-contains-credential-like-parameter',
        });
      }
    });

    it('rejects hosts outside the configured approved-domain policy', () => {
      const url = 'https://attacker.example.com/agreement';
      expect(
        evaluateAdobeSignSourceHandoff(url, { approvedDomainPolicy: APPROVED_ADOBE_DOMAINS }),
      ).toEqual({ status: 'rejected', reason: 'host-not-approved' });
    });

    it('rejects malformed URLs as invalid-url without throwing', () => {
      expect(() => evaluateAdobeSignSourceHandoff('not a url')).not.toThrow();
      expect(evaluateAdobeSignSourceHandoff('not a url')).toEqual({
        status: 'rejected',
        reason: 'invalid-url',
      });
    });

    it('rejects a candidate as custom-link-requires-approval when requiresApproval is true', () => {
      const url = 'https://secure.adobesign.com/agreementView';
      expect(
        evaluateAdobeSignSourceHandoff(url, {
          approvedDomainPolicy: APPROVED_ADOBE_DOMAINS,
          requiresApproval: true,
        }),
      ).toEqual({ status: 'rejected', reason: 'custom-link-requires-approval' });
    });
  });

  describe('omitted cases', () => {
    it('returns `omitted` when no candidate is supplied', () => {
      expect(evaluateAdobeSignSourceHandoff(undefined)).toEqual({ status: 'omitted' });
    });

    it('returns `omitted` for an empty-string candidate', () => {
      expect(evaluateAdobeSignSourceHandoff('')).toEqual({ status: 'omitted' });
    });
  });
});
