import { describe, it, expect } from 'vitest';
import { createAuditEntry } from './governance.js';
import type { ExportAuditAction } from './governance.js';

const fixedNow = new Date('2026-03-23T14:00:00.000Z');

describe('createAuditEntry', () => {
  it('generates unique entryId', () => {
    const a = createAuditEntry('req-1', 'request-created', 'user@example.com', null, fixedNow);
    const b = createAuditEntry('req-1', 'request-created', 'user@example.com', null, fixedNow);
    expect(a.entryId).not.toBe(b.entryId);
  });

  it('sets correct timestamp', () => {
    const entry = createAuditEntry('req-1', 'render-complete', 'user@example.com', null, fixedNow);
    expect(entry.performedAtIso).toBe('2026-03-23T14:00:00.000Z');
  });

  it('propagates detail', () => {
    const entry = createAuditEntry('req-1', 'dismissed', 'user@example.com', 'User cleared receipt', fixedNow);
    expect(entry.detail).toBe('User cleared receipt');
  });

  it('defaults detail to null', () => {
    const entry = createAuditEntry('req-1', 'downloaded', 'user@example.com', undefined, fixedNow);
    expect(entry.detail).toBeNull();
  });

  it('uses current time when now is not provided', () => {
    const entry = createAuditEntry('req-1', 'downloaded', 'user@example.com');
    expect(entry.performedAtIso).toBeTruthy();
    expect(new Date(entry.performedAtIso).getTime()).toBeGreaterThan(0);
  });

  it('accepts all 10 audit actions', () => {
    const actions: ExportAuditAction[] = [
      'request-created', 'render-started', 'render-complete', 'render-failed',
      'retry-initiated', 'dismissed', 'downloaded', 'review-approved', 'review-rejected', 'restored',
    ];
    for (const action of actions) {
      const entry = createAuditEntry('req-1', action, 'user@example.com', null, fixedNow);
      expect(entry.action).toBe(action);
    }
  });
});
