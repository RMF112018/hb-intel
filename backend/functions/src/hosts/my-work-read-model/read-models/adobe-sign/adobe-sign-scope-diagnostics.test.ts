import { describe, expect, it } from 'vitest';

import {
  buildAdobeScopeDiagnostics,
  sanitizeAdobeScopeTelemetryValue,
} from './adobe-sign-scope-diagnostics.js';

describe('sanitizeAdobeScopeTelemetryValue', () => {
  it('returns lowercase normalized scope for valid input', () => {
    expect(sanitizeAdobeScopeTelemetryValue('agreement_read:self')).toBe('agreement_read:self');
    expect(sanitizeAdobeScopeTelemetryValue('  Agreement_Write:Self  ')).toBe(
      'agreement_write:self',
    );
  });

  it('accepts the documented character set (letters, digits, _-:.)', () => {
    expect(sanitizeAdobeScopeTelemetryValue('a.b-c_d:e0')).toBe('a.b-c_d:e0');
  });

  it('rejects non-string input', () => {
    expect(sanitizeAdobeScopeTelemetryValue(undefined)).toBeUndefined();
    expect(sanitizeAdobeScopeTelemetryValue(null)).toBeUndefined();
    expect(sanitizeAdobeScopeTelemetryValue(42)).toBeUndefined();
    expect(sanitizeAdobeScopeTelemetryValue({ scope: 'x' })).toBeUndefined();
    expect(sanitizeAdobeScopeTelemetryValue([])).toBeUndefined();
  });

  it('rejects empty / whitespace-only strings', () => {
    expect(sanitizeAdobeScopeTelemetryValue('')).toBeUndefined();
    expect(sanitizeAdobeScopeTelemetryValue('   ')).toBeUndefined();
  });

  it('rejects values longer than 96 characters', () => {
    const ninetySix = 'a'.repeat(96);
    const ninetySeven = 'a'.repeat(97);
    expect(sanitizeAdobeScopeTelemetryValue(ninetySix)).toBe(ninetySix);
    expect(sanitizeAdobeScopeTelemetryValue(ninetySeven)).toBeUndefined();
  });

  it('rejects values containing disallowed characters', () => {
    expect(sanitizeAdobeScopeTelemetryValue('agreement read:self')).toBeUndefined(); // space
    expect(sanitizeAdobeScopeTelemetryValue('agreement/read:self')).toBeUndefined(); // slash
    expect(sanitizeAdobeScopeTelemetryValue('agreement_read@self')).toBeUndefined(); // @
    expect(sanitizeAdobeScopeTelemetryValue('agreement\nread:self')).toBeUndefined(); // interior control char
    expect(sanitizeAdobeScopeTelemetryValue('https://example.com')).toBeUndefined(); // slashes
    expect(sanitizeAdobeScopeTelemetryValue('Bearer ey.token.value')).toBeUndefined(); // space
  });
});

describe('buildAdobeScopeDiagnostics', () => {
  it('the only-read-granted production case: configured=2, granted=1, missing=1, csv populated', () => {
    const result = buildAdobeScopeDiagnostics({
      configuredScopes: ['agreement_read:self', 'agreement_write:self'],
      grantedScopes: ['agreement_read:self'],
    });
    expect(result.configuredScopeCount).toBe(2);
    expect(result.grantedScopeCount).toBe(1);
    expect(result.missingGovernedScopeCount).toBe(1);
    expect(result.hasAgreementReadSelfConfigured).toBe(true);
    expect(result.hasAgreementWriteSelfConfigured).toBe(true);
    expect(result.hasAgreementReadSelfGranted).toBe(true);
    expect(result.hasAgreementWriteSelfGranted).toBe(false);
    expect(result.missingGovernedScopesCsv).toBe('agreement_write:self');
    expect(result.grantedScopesCsv).toBe('agreement_read:self');
  });

  it('both granted: missing=0, missing csv omitted', () => {
    const result = buildAdobeScopeDiagnostics({
      configuredScopes: ['agreement_read:self', 'agreement_write:self'],
      grantedScopes: ['agreement_read:self', 'agreement_write:self'],
    });
    expect(result.missingGovernedScopeCount).toBe(0);
    expect(result.hasAgreementReadSelfGranted).toBe(true);
    expect(result.hasAgreementWriteSelfGranted).toBe(true);
    expect(result.missingGovernedScopesCsv).toBeUndefined();
    expect(result.grantedScopesCsv).toBe('agreement_read:self,agreement_write:self');
  });

  it('neither granted: missing=configuredCount, both granted booleans false', () => {
    const result = buildAdobeScopeDiagnostics({
      configuredScopes: ['agreement_read:self', 'agreement_write:self'],
      grantedScopes: [],
    });
    expect(result.configuredScopeCount).toBe(2);
    expect(result.grantedScopeCount).toBe(0);
    expect(result.missingGovernedScopeCount).toBe(2);
    expect(result.hasAgreementReadSelfGranted).toBe(false);
    expect(result.hasAgreementWriteSelfGranted).toBe(false);
    expect(result.missingGovernedScopesCsv).toBe('agreement_read:self,agreement_write:self');
    expect(result.grantedScopesCsv).toBeUndefined();
  });

  it('empty configured: missing=0, both csv handled', () => {
    const result = buildAdobeScopeDiagnostics({
      configuredScopes: [],
      grantedScopes: ['agreement_read:self'],
    });
    expect(result.configuredScopeCount).toBe(0);
    expect(result.grantedScopeCount).toBe(1);
    expect(result.missingGovernedScopeCount).toBe(0);
    expect(result.hasAgreementReadSelfConfigured).toBe(false);
    expect(result.hasAgreementWriteSelfConfigured).toBe(false);
    expect(result.missingGovernedScopesCsv).toBeUndefined();
    expect(result.grantedScopesCsv).toBe('agreement_read:self');
  });

  it('granted superset of configured: still no missing', () => {
    const result = buildAdobeScopeDiagnostics({
      configuredScopes: ['agreement_read:self'],
      grantedScopes: ['agreement_read:self', 'agreement_write:self', 'agreement_send:self'],
    });
    expect(result.missingGovernedScopeCount).toBe(0);
    expect(result.grantedScopeCount).toBe(3);
    expect(result.grantedScopesCsv).toBe(
      'agreement_read:self,agreement_send:self,agreement_write:self',
    );
  });

  it('deduplicates and sorts input on both sides', () => {
    const result = buildAdobeScopeDiagnostics({
      configuredScopes: [
        'agreement_write:self',
        'AGREEMENT_READ:SELF',
        'agreement_read:self', // duplicate of the uppercase entry after normalization
      ],
      grantedScopes: ['agreement_read:self', 'agreement_read:self'],
    });
    expect(result.configuredScopeCount).toBe(2);
    expect(result.grantedScopeCount).toBe(1);
    expect(result.missingGovernedScopeCount).toBe(1);
    expect(result.missingGovernedScopesCsv).toBe('agreement_write:self');
  });

  it('silently drops invalid scope-like strings rather than throwing', () => {
    const result = buildAdobeScopeDiagnostics({
      configuredScopes: ['agreement_read:self', 'Bearer abc'],
      grantedScopes: ['agreement_read:self', '', null, 12, 'https://attacker.example.com'],
    });
    expect(result.configuredScopeCount).toBe(1);
    expect(result.grantedScopeCount).toBe(1);
    expect(result.missingGovernedScopesCsv).toBeUndefined();
    expect(result.grantedScopesCsv).toBe('agreement_read:self');
    const serialized = JSON.stringify(result);
    expect(serialized).not.toContain('Bearer');
    expect(serialized).not.toContain('attacker');
    expect(serialized).not.toContain('https://');
  });

  it('omits grantedScopesCsv when there are more than 20 distinct granted scopes', () => {
    const grantedScopes = Array.from(
      { length: 21 },
      (_, i) => `scope_${String(i).padStart(2, '0')}`,
    );
    const result = buildAdobeScopeDiagnostics({
      configuredScopes: ['agreement_read:self'],
      grantedScopes,
    });
    expect(result.grantedScopeCount).toBe(21);
    expect(result.grantedScopesCsv).toBeUndefined();
    expect(result.missingGovernedScopesCsv).toBe('agreement_read:self');
  });

  it('omits CSV fields entirely (no truncation) when the joined CSV exceeds 1024 chars', () => {
    // 20 entries (under the entry cap) but each long enough that the joined
    // CSV exceeds the 1024-char cap.
    const grantedScopes = Array.from(
      { length: 20 },
      (_, i) =>
        // 90 chars each + comma separators: 20*90 + 19 = 1819 chars > 1024.
        `${'s'.repeat(80)}_${String(i).padStart(8, '0')}`,
    );
    const result = buildAdobeScopeDiagnostics({
      configuredScopes: [],
      grantedScopes,
    });
    expect(result.grantedScopeCount).toBe(20);
    expect(result.grantedScopesCsv).toBeUndefined();
  });

  it('is non-throwing for malformed inputs (undefined / null / non-array)', () => {
    expect(() =>
      buildAdobeScopeDiagnostics({
        configuredScopes: undefined as unknown as readonly string[],
        grantedScopes: null as unknown as readonly string[],
      }),
    ).not.toThrow();
    const result = buildAdobeScopeDiagnostics({
      configuredScopes: 'agreement_read:self' as unknown as readonly string[],
      grantedScopes: { 0: 'agreement_read:self' } as unknown as readonly string[],
    });
    expect(result.configuredScopeCount).toBe(0);
    expect(result.grantedScopeCount).toBe(0);
  });
});
