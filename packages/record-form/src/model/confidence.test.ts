import { describe, it, expect } from 'vitest';
import { computeRecordConfidence, detectDraftConflict } from './confidence.js';
import { createMockRecordFormState } from '../../testing/createMockRecordFormState.js';
import type { IRecordFormDraft } from '../types/index.js';

describe('computeRecordConfidence', () => {
  it('returns trusted-synced for synced state', () => {
    const s = createMockRecordFormState({ sync: { state: 'synced', queuePosition: null, lastSyncAttemptIso: null } });
    expect(computeRecordConfidence(s)).toBe('trusted-synced');
  });

  it('returns local-unsynced for local-only', () => {
    const s = createMockRecordFormState({ sync: { state: 'local-only', queuePosition: null, lastSyncAttemptIso: null } });
    expect(computeRecordConfidence(s)).toBe('local-unsynced');
  });

  it('returns partially-resolved for partially-recovered', () => {
    const s = createMockRecordFormState({ sync: { state: 'partially-recovered', queuePosition: null, lastSyncAttemptIso: null } });
    expect(computeRecordConfidence(s)).toBe('partially-resolved');
  });

  it('returns degraded-submission for degraded', () => {
    const s = createMockRecordFormState({ sync: { state: 'degraded', queuePosition: null, lastSyncAttemptIso: null } });
    expect(computeRecordConfidence(s)).toBe('degraded-submission');
  });

  it('returns local-unsynced for saved-locally', () => {
    const s = createMockRecordFormState({ sync: { state: 'saved-locally', queuePosition: null, lastSyncAttemptIso: null } });
    expect(computeRecordConfidence(s)).toBe('local-unsynced');
  });

  it('returns local-unsynced for queued-to-sync', () => {
    const s = createMockRecordFormState({ sync: { state: 'queued-to-sync', queuePosition: 1, lastSyncAttemptIso: null } });
    expect(computeRecordConfidence(s)).toBe('local-unsynced');
  });

  it('returns recovered-needs-review for active recovery', () => {
    const s = createMockRecordFormState({
      sync: { state: 'saved-locally', queuePosition: null, lastSyncAttemptIso: null },
      explanation: { isBlocked: false, blockReasons: [], hasWarnings: false, warnings: [], isRecoveryActive: true, summaryMessage: '', deferReason: null },
    });
    expect(computeRecordConfidence(s)).toBe('recovered-needs-review');
  });

  it('returns local-unsynced as fallback', () => {
    const s = createMockRecordFormState({
      sync: { state: 'unknown' as never, queuePosition: null, lastSyncAttemptIso: null },
    });
    expect(computeRecordConfidence(s)).toBe('local-unsynced');
  });
});

describe('detectDraftConflict', () => {
  const baseDraft: IRecordFormDraft = {
    draftId: 'd1', recordId: null, projectId: 'proj-001', moduleKey: 'financial',
    mode: 'create', isDirty: false, lastSavedAtIso: '2026-03-23T14:00:00.000Z',
    createdAtIso: '2026-03-23T14:00:00.000Z', authorUpn: 'pm@example.com', schemaVersion: '1.0',
  };

  it('returns null for identical drafts', () => {
    expect(detectDraftConflict(baseDraft, { ...baseDraft })).toBeNull();
  });

  it('detects changed fields', () => {
    const delta = detectDraftConflict(baseDraft, { ...baseDraft, isDirty: true });
    expect(delta).not.toBeNull();
    expect(delta!.fields).toContain('isDirty');
  });

  it('detects schema version change', () => {
    const delta = detectDraftConflict(baseDraft, { ...baseDraft, schemaVersion: '2.0' });
    expect(delta).not.toBeNull();
    expect(delta!.fields).toContain('schemaVersion');
  });

  it('detects lastSavedAtIso change', () => {
    const delta = detectDraftConflict(baseDraft, { ...baseDraft, lastSavedAtIso: '2026-03-23T16:00:00.000Z' });
    expect(delta).not.toBeNull();
    expect(delta!.fields).toContain('lastSavedAtIso');
  });

  it('detects mode change', () => {
    const delta = detectDraftConflict(baseDraft, { ...baseDraft, mode: 'edit' });
    expect(delta).not.toBeNull();
    expect(delta!.fields).toContain('mode');
  });

  it('uses current time when now not provided', () => {
    const delta = detectDraftConflict(baseDraft, { ...baseDraft, isDirty: true });
    expect(new Date(delta!.detectedAtIso).getTime()).toBeGreaterThan(0);
  });
});
