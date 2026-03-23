import { describe, it, expect } from 'vitest';
import { createPublishAuditEntry } from './governance.js';
import type { PublishAuditAction } from './governance.js';

const fixedNow = new Date('2026-03-23T14:00:00.000Z');

describe('createPublishAuditEntry', () => {
  it('generates unique IDs', () => {
    const a = createPublishAuditEntry('p1', 'request-created', 'u@e.com', null, fixedNow);
    const b = createPublishAuditEntry('p1', 'request-created', 'u@e.com', null, fixedNow);
    expect(a.entryId).not.toBe(b.entryId);
  });
  it('sets timestamp', () => { expect(createPublishAuditEntry('p1', 'approved', 'u@e.com', null, fixedNow).performedAtIso).toBe('2026-03-23T14:00:00.000Z'); });
  it('propagates detail', () => { expect(createPublishAuditEntry('p1', 'revoked', 'u@e.com', 'Policy', fixedNow).detail).toBe('Policy'); });
  it('defaults detail to null', () => { expect(createPublishAuditEntry('p1', 'publish-complete', 'u@e.com', undefined, fixedNow).detail).toBeNull(); });
  it('uses current time when now not provided', () => { expect(new Date(createPublishAuditEntry('p1', 'acknowledged', 'u@e.com').performedAtIso).getTime()).toBeGreaterThan(0); });
  it('accepts all 10 actions', () => {
    const actions: PublishAuditAction[] = ['request-created', 'readiness-checked', 'approved', 'rejected', 'publish-started', 'publish-complete', 'publish-failed', 'superseded', 'revoked', 'acknowledged'];
    for (const a of actions) expect(createPublishAuditEntry('p1', a, 'u@e.com', null, fixedNow).action).toBe(a);
  });
});
