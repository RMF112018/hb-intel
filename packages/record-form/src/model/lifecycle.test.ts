import { describe, it, expect } from 'vitest';
import { createRecordFormSession, transitionRecordFormStatus, VALID_RECORD_TRANSITIONS } from './lifecycle.js';
import type { IRecordFormCreateInput } from './lifecycle.js';

const baseInput: IRecordFormCreateInput = {
  moduleKey: 'financial',
  projectId: 'proj-001',
  mode: 'create',
  complexityTier: 'standard',
  authorUpn: 'pm@example.com',
};
const fixedNow = new Date('2026-03-23T14:00:00.000Z');

describe('createRecordFormSession', () => {
  it('creates session with not-started-equivalent state', () => {
    const s = createRecordFormSession(baseInput, fixedNow);
    expect(s.draft.draftId).toBeTruthy();
    expect(s.draft.isDirty).toBe(false);
    expect(s.confidence.level).toBe('local-unsynced');
  });

  it('initializes telemetry', () => {
    const s = createRecordFormSession(baseInput, fixedNow);
    expect(s.telemetry.openTimestampIso).toBe('2026-03-23T14:00:00.000Z');
    expect(s.telemetry.formMode).toBe('create');
  });

  it('throws on missing moduleKey', () => {
    expect(() => createRecordFormSession({ ...baseInput, moduleKey: '' }, fixedNow)).toThrow('moduleKey');
  });

  it('throws on missing projectId', () => {
    expect(() => createRecordFormSession({ ...baseInput, projectId: '' }, fixedNow)).toThrow('projectId');
  });

  it('throws on missing mode', () => {
    expect(() => createRecordFormSession({ ...baseInput, mode: '' as never }, fixedNow)).toThrow('mode');
  });

  it('throws on missing authorUpn', () => {
    expect(() => createRecordFormSession({ ...baseInput, authorUpn: '' }, fixedNow)).toThrow('authorUpn');
  });

  it('uses current time when now not provided', () => {
    const s = createRecordFormSession(baseInput);
    expect(new Date(s.telemetry.openTimestampIso).getTime()).toBeGreaterThan(0);
  });
});

describe('transitionRecordFormStatus', () => {
  it('transitions to draft', () => {
    const s = createRecordFormSession(baseInput, fixedNow);
    const next = transitionRecordFormStatus(s, 'draft', fixedNow);
    expect(next.explanation.summaryMessage).toBe('Draft saved');
  });

  it('transitions draft → dirty (via draft state)', () => {
    let s = createRecordFormSession(baseInput, fixedNow);
    s = transitionRecordFormStatus(s, 'draft', fixedNow);
    // After transitioning to draft, set lastSavedAtIso to establish draft state
    s = { ...s, draft: { ...s.draft, lastSavedAtIso: fixedNow.toISOString() } };
    s = transitionRecordFormStatus(s, 'dirty', fixedNow);
    expect(s.draft.isDirty).toBe(true);
  });

  it('transitions through submit lifecycle', () => {
    let s = createRecordFormSession(baseInput, fixedNow);
    s = transitionRecordFormStatus(s, 'draft', fixedNow);
    s = { ...s, draft: { ...s.draft, lastSavedAtIso: fixedNow.toISOString() } };
    s = transitionRecordFormStatus(s, 'dirty', fixedNow);
    s = transitionRecordFormStatus(s, 'valid-with-warnings', fixedNow);
    s = transitionRecordFormStatus(s, 'submitting', new Date('2026-03-23T14:05:00.000Z'));
    s = transitionRecordFormStatus(s, 'submitted', new Date('2026-03-23T14:05:05.000Z'));
    expect(s.explanation.summaryMessage).toBe('Successfully submitted');
    expect(s.telemetry.timeToSubmitMs).toBe(5000);
  });

  it('throws on invalid transition not-started → submitting', () => {
    const s = createRecordFormSession(baseInput, fixedNow);
    expect(() => transitionRecordFormStatus(s, 'submitting')).toThrow('invalid transition');
  });

  it('transitions to failed from submitting', () => {
    let s = createRecordFormSession(baseInput, fixedNow);
    s = transitionRecordFormStatus(s, 'draft', fixedNow);
    s = { ...s, draft: { ...s.draft, lastSavedAtIso: fixedNow.toISOString() } };
    s = transitionRecordFormStatus(s, 'dirty', fixedNow);
    s = transitionRecordFormStatus(s, 'valid-with-warnings', fixedNow);
    s = transitionRecordFormStatus(s, 'submitting', fixedNow);
    s = transitionRecordFormStatus(s, 'failed', fixedNow);
    expect(s.explanation.summaryMessage).toBe('Submission failed');
  });

  it('transitions blocked → dirty', () => {
    let s = createRecordFormSession(baseInput, fixedNow);
    s = transitionRecordFormStatus(s, 'draft', fixedNow);
    s = { ...s, explanation: { ...s.explanation, isBlocked: true } };
    s = transitionRecordFormStatus(s, 'dirty', fixedNow);
    expect(s.draft.isDirty).toBe(true);
  });

  it('transitions failed → dirty for retry', () => {
    let s = createRecordFormSession(baseInput, fixedNow);
    s = transitionRecordFormStatus(s, 'draft', fixedNow);
    s = { ...s, draft: { ...s.draft, lastSavedAtIso: fixedNow.toISOString() } };
    s = transitionRecordFormStatus(s, 'dirty', fixedNow);
    s = { ...s, explanation: { ...s.explanation, hasWarnings: true } };
    s = transitionRecordFormStatus(s, 'submitting', fixedNow);
    s = transitionRecordFormStatus(s, 'failed', fixedNow);
    s = { ...s, failure: { failureCode: 'submission-error' as const, userMessage: 'Failed', technicalDetail: null, occurredAtIso: fixedNow.toISOString() } };
    // Reset telemetry for retry
    s = { ...s, telemetry: { ...s.telemetry, submitStartTimestampIso: null, submitCompleteTimestampIso: null } };
    s = transitionRecordFormStatus(s, 'dirty', fixedNow);
    expect(s.draft.isDirty).toBe(true);
  });

  it('sets hasWarnings=false on submitting', () => {
    let s = createRecordFormSession(baseInput, fixedNow);
    s = transitionRecordFormStatus(s, 'draft', fixedNow);
    s = { ...s, draft: { ...s.draft, lastSavedAtIso: fixedNow.toISOString() } };
    s = transitionRecordFormStatus(s, 'dirty', fixedNow);
    s = { ...s, explanation: { ...s.explanation, hasWarnings: true } };
    s = transitionRecordFormStatus(s, 'submitting', fixedNow);
    expect(s.explanation.hasWarnings).toBe(false);
  });

  it('inferCurrentStatus returns submitted for completed without failure', () => {
    let s = createRecordFormSession(baseInput, fixedNow);
    // Simulate submitted state via telemetry
    s = { ...s, telemetry: { ...s.telemetry, submitStartTimestampIso: fixedNow.toISOString(), submitCompleteTimestampIso: fixedNow.toISOString() } };
    // submitted has no valid transitions, so trying any should throw with "submitted" in error
    expect(() => transitionRecordFormStatus(s, 'draft')).toThrow('submitted');
  });

  it('inferCurrentStatus returns failed for completed with failure', () => {
    let s = createRecordFormSession(baseInput, fixedNow);
    s = { ...s, telemetry: { ...s.telemetry, submitStartTimestampIso: fixedNow.toISOString(), submitCompleteTimestampIso: fixedNow.toISOString() }, failure: { failureCode: 'submission-error', userMessage: 'err', technicalDetail: null, occurredAtIso: fixedNow.toISOString() } };
    // failed allows dirty and draft transitions
    const next = transitionRecordFormStatus(s, 'dirty', fixedNow);
    expect(next.draft.isDirty).toBe(true);
  });

  it('uses current time when now not provided in transition', () => {
    const s = createRecordFormSession(baseInput, fixedNow);
    const next = transitionRecordFormStatus(s, 'draft');
    expect(next.explanation.summaryMessage).toBe('Draft saved');
  });
});

describe('VALID_RECORD_TRANSITIONS', () => {
  it('defines transitions for all 8 statuses', () => {
    expect(Object.keys(VALID_RECORD_TRANSITIONS)).toHaveLength(8);
  });
});
