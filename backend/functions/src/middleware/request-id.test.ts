import { describe, expect, it } from 'vitest';
import type { HttpRequest } from '@azure/functions';
import { extractOrGenerateRequestId } from './request-id.js';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

const makeRequest = (requestId?: string): HttpRequest =>
  ({
    headers: {
      get: (name: string) => (name === 'X-Request-Id' ? requestId ?? null : null),
    },
  }) as unknown as HttpRequest;

describe('P1-C2 extractOrGenerateRequestId', () => {
  it('returns the X-Request-Id header when present', () => {
    expect(extractOrGenerateRequestId(makeRequest('abc-123'))).toBe('abc-123');
  });

  it('generates a valid UUID when header is absent', () => {
    const id = extractOrGenerateRequestId(makeRequest());
    expect(id).toMatch(UUID_PATTERN);
  });

  it('generates a new UUID when header is empty', () => {
    const id = extractOrGenerateRequestId(makeRequest(''));
    expect(id).toMatch(UUID_PATTERN);
  });

  it('generates a new UUID when header is whitespace-only', () => {
    const id = extractOrGenerateRequestId(makeRequest('   '));
    expect(id).toMatch(UUID_PATTERN);
  });
});
