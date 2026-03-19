import { describe, it, expect } from 'vitest';
import {
  generateIdempotencyKey,
  isExpired,
  type IdempotencyContext,
} from './idempotency.js';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

describe('Idempotency key generation', () => {
  it('generateIdempotencyKey returns valid UUID and operation', () => {
    const ctx = generateIdempotencyKey('create-lead');
    expect(ctx.key).toMatch(UUID_PATTERN);
    expect(ctx.operation).toBe('create-lead');
    expect(ctx.createdAt).toBeGreaterThan(0);
    expect(ctx.expiresAt).toBeGreaterThan(ctx.createdAt);
  });

  it('generateIdempotencyKey sets 24h TTL by default', () => {
    const ctx = generateIdempotencyKey('update-project');
    const ttlMs = ctx.expiresAt - ctx.createdAt;
    expect(ttlMs).toBe(24 * 60 * 60 * 1000);
  });

  it('generateIdempotencyKey accepts custom TTL', () => {
    const customTtlMs = 60 * 1000; // 1 minute
    const ctx = generateIdempotencyKey('update-estimating', customTtlMs);
    const ttl = ctx.expiresAt - ctx.createdAt;
    expect(ttl).toBe(customTtlMs);
  });

  it('each call generates a unique key', () => {
    const ctx1 = generateIdempotencyKey('create-lead');
    const ctx2 = generateIdempotencyKey('create-lead');
    expect(ctx1.key).not.toBe(ctx2.key);
  });
});

describe('isExpired()', () => {
  it('returns false for fresh context', () => {
    const ctx: IdempotencyContext = {
      key: 'test-key',
      operation: 'create-lead',
      createdAt: Date.now(),
      expiresAt: Date.now() + 10 * 60 * 1000,
    };
    expect(isExpired(ctx)).toBe(false);
  });

  it('returns true for expired context', () => {
    const ctx: IdempotencyContext = {
      key: 'test-key',
      operation: 'create-lead',
      createdAt: Date.now() - 25 * 60 * 60 * 1000,
      expiresAt: Date.now() - 1 * 60 * 60 * 1000,
    };
    expect(isExpired(ctx)).toBe(true);
  });

  it('returns true when now() equals expiresAt (strict comparison)', () => {
    const now = Date.now();
    const ctx: IdempotencyContext = {
      key: 'test-key',
      operation: 'create-lead',
      createdAt: now - 1000,
      expiresAt: now,
    };
    expect(isExpired(ctx)).toBe(true);
  });
});
