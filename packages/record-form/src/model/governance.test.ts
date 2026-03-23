import { describe, it, expect } from 'vitest';
import { createRecordFormAuditEntry } from './governance.js';
import type { RecordFormAuditAction } from './governance.js';

const fixedNow = new Date('2026-03-23T14:00:00.000Z');

describe('createRecordFormAuditEntry', () => {
  it('generates unique entryId', () => {
    const a = createRecordFormAuditEntry('d1', 'session-created', 'u@e.com', null, fixedNow);
    const b = createRecordFormAuditEntry('d1', 'session-created', 'u@e.com', null, fixedNow);
    expect(a.entryId).not.toBe(b.entryId);
  });

  it('sets timestamp', () => {
    const e = createRecordFormAuditEntry('d1', 'draft-saved', 'u@e.com', null, fixedNow);
    expect(e.performedAtIso).toBe('2026-03-23T14:00:00.000Z');
  });

  it('propagates detail', () => {
    const e = createRecordFormAuditEntry('d1', 'draft-discarded', 'u@e.com', 'User confirmed', fixedNow);
    expect(e.detail).toBe('User confirmed');
  });

  it('defaults detail to null', () => {
    const e = createRecordFormAuditEntry('d1', 'submit-complete', 'u@e.com', undefined, fixedNow);
    expect(e.detail).toBeNull();
  });

  it('uses current time when now not provided', () => {
    const e = createRecordFormAuditEntry('d1', 'submit-complete', 'u@e.com');
    expect(new Date(e.performedAtIso).getTime()).toBeGreaterThan(0);
  });

  it('accepts all 10 audit actions', () => {
    const actions: RecordFormAuditAction[] = [
      'session-created', 'draft-saved', 'draft-restored', 'draft-discarded',
      'submit-started', 'submit-complete', 'submit-failed', 'retry-initiated',
      'review-approved', 'review-rejected',
    ];
    for (const action of actions) {
      const e = createRecordFormAuditEntry('d1', action, 'u@e.com', null, fixedNow);
      expect(e.action).toBe(action);
    }
  });
});
