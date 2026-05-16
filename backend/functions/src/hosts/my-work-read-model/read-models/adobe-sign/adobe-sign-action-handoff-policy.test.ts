import { describe, expect, it } from 'vitest';

import { evaluateAdobeSignActionHandoff } from './adobe-sign-action-handoff-policy.js';

describe('evaluateAdobeSignActionHandoff', () => {
  it('allows https Adobe-hosted action URLs', () => {
    expect(
      evaluateAdobeSignActionHandoff(
        'https://secure.na1.adobesign.com/public/apiesign?foo=bar',
      ),
    ).toEqual({
      status: 'allowed',
      redirectUrl: 'https://secure.na1.adobesign.com/public/apiesign?foo=bar',
    });
  });

  it('rejects malformed URLs', () => {
    expect(evaluateAdobeSignActionHandoff('not-a-url')).toEqual({
      status: 'rejected',
      reason: 'invalid-url',
    });
  });

  it('rejects non-https URLs', () => {
    expect(
      evaluateAdobeSignActionHandoff('http://secure.na1.adobesign.com/public/apiesign?foo=bar'),
    ).toEqual({
      status: 'rejected',
      reason: 'scheme-blocked',
    });
  });

  it('rejects non-approved hosts', () => {
    expect(
      evaluateAdobeSignActionHandoff('https://attacker.example.com/public/apiesign?foo=bar'),
    ).toEqual({
      status: 'rejected',
      reason: 'host-not-approved',
    });
  });
});
