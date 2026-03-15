import { describe, it, expect } from 'vitest';
import { resolveSessionToken } from '../../utils/resolveSessionToken.js';
import type { NormalizedAuthSession } from '@hbc/auth';

describe('resolveSessionToken', () => {
  it('extracts accessToken from rawContext payload', () => {
    const session = {
      rawContext: { payload: { accessToken: 'real-token-123' } },
      providerIdentityRef: 'fallback',
    } as unknown as NormalizedAuthSession;

    expect(resolveSessionToken(session)).toBe('real-token-123');
  });

  it('extracts token field from rawContext payload', () => {
    const session = {
      rawContext: { payload: { token: 'token-field-456' } },
      providerIdentityRef: 'fallback',
    } as unknown as NormalizedAuthSession;

    expect(resolveSessionToken(session)).toBe('token-field-456');
  });

  it('falls back to providerIdentityRef when no payload token', () => {
    const session = {
      rawContext: { payload: {} },
      providerIdentityRef: 'provider-ref-789',
    } as unknown as NormalizedAuthSession;

    expect(resolveSessionToken(session)).toBe('provider-ref-789');
  });

  it('returns mock-token when session is null', () => {
    expect(resolveSessionToken(null)).toBe('mock-token');
  });

  it('ignores empty string tokens', () => {
    const session = {
      rawContext: { payload: { accessToken: '   ' } },
      providerIdentityRef: 'fallback',
    } as unknown as NormalizedAuthSession;

    expect(resolveSessionToken(session)).toBe('fallback');
  });
});
