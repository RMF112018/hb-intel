// state/__tests__/stepStateMachine.test.ts
import { describe, it, expect } from 'vitest';
import {
  guardMarkComplete, guardGoTo, guardReopen,
  applyStatusUpdate, applyVisit, applyCompletionFired,
  buildWizardState,
} from '../stepStateMachine';
import { mergeStepStatus } from '../draftPayload';
import { createMockWizardConfig, mockWizardStates } from '@hbc/step-wizard/testing';

// ── Monotonic merge (D-02) ──────────────────────────────────────────────────
describe('mergeStepStatus', () => {
  it('complete beats in-progress', () =>
    expect(mergeStepStatus('complete', 'in-progress')).toBe('complete'));
  it('in-progress beats not-started', () =>
    expect(mergeStepStatus('in-progress', 'not-started')).toBe('in-progress'));
  it('stored wins on tie', () =>
    expect(mergeStepStatus('in-progress', 'in-progress')).toBe('in-progress'));
  it('terminal blocked beats complete', () =>
    expect(mergeStepStatus('blocked', 'complete')).toBe('blocked'));
  it('terminal skipped beats in-progress', () =>
    expect(mergeStepStatus('skipped', 'in-progress')).toBe('skipped'));
  it('inMemory terminal beats non-terminal stored', () =>
    expect(mergeStepStatus('not-started', 'blocked')).toBe('blocked'));
});

// ── guardMarkComplete (D-03) ────────────────────────────────────────────────
describe('guardMarkComplete', () => {
  const config = createMockWizardConfig({ orderMode: 'parallel' });
  const step = config.steps[0];
  const baseDraft = mockWizardStates.notStarted;

  it('allows completion of in-progress required step', () => {
    const result = guardMarkComplete(step, undefined, baseDraft.draft, config, false);
    expect(result.ok).toBe(true);
  });

  it('blocks required step with validation error', () => {
    const stepWithValidation = { ...step, validate: () => 'Field required' };
    const result = guardMarkComplete(stepWithValidation, undefined, baseDraft.draft, config, false);
    expect(result.ok).toBe(false);
    expect((result as { ok: false; reason: string }).reason).toBe('Field required');
  });

  it('allows force-complete despite validation error', () => {
    const stepWithValidation = { ...step, validate: () => 'Field required' };
    const result = guardMarkComplete(stepWithValidation, undefined, baseDraft.draft, config, true);
    expect(result.ok).toBe(true);
  });

  it('allows optional step completion with validation error (soft warn only, D-03)', () => {
    const optionalStep = { ...step, required: false, validate: () => 'Optional field incomplete' };
    const result = guardMarkComplete(optionalStep, undefined, baseDraft.draft, config, false);
    expect(result.ok).toBe(true); // optional steps not blocked
  });

  it('rejects completion of terminal blocked step (D-02)', () => {
    const blockedDraft = { ...baseDraft.draft, stepStatuses: { [step.stepId]: 'blocked' as const } };
    const result = guardMarkComplete(step, undefined, blockedDraft, config, false);
    expect(result.ok).toBe(false);
  });
});

// ── sequential-with-jumps unlock (D-01) ────────────────────────────────────
describe('guardGoTo — sequential-with-jumps', () => {
  it('allows navigation to visited step', () => {
    const result = guardGoTo('step-2', 'step-1', new Set(['step-1', 'step-2']), 'sequential-with-jumps');
    expect(result.ok).toBe(true);
  });

  it('blocks navigation to unvisited/unlocked step', () => {
    const result = guardGoTo('step-3', 'step-1', new Set(['step-1', 'step-2']), 'sequential-with-jumps');
    expect(result.ok).toBe(false);
  });

  it('blocks all jumps in sequential mode', () => {
    const result = guardGoTo('step-2', 'step-1', new Set(['step-1', 'step-2']), 'sequential');
    expect(result.ok).toBe(false);
  });

  it('allows any jump in parallel mode', () => {
    const result = guardGoTo('step-3', 'step-1', new Set(['step-1', 'step-2', 'step-3']), 'parallel');
    expect(result.ok).toBe(true);
  });
});

// ── onAllCompleteFired idempotency (D-07) ──────────────────────────────────
describe('applyCompletionFired', () => {
  it('sets flag to true', () => {
    const draft = { ...mockWizardStates.complete.draft, onAllCompleteFired: false };
    expect(applyCompletionFired(draft, true).onAllCompleteFired).toBe(true);
  });

  it('resets flag on reopen', () => {
    const draft = { ...mockWizardStates.complete.draft, onAllCompleteFired: true };
    expect(applyCompletionFired(draft, false).onAllCompleteFired).toBe(false);
  });
});

// ── guardReopen (D-05) ──────────────────────────────────────────────────────
describe('guardReopen', () => {
  it('allows reopen when allowReopen=true and step is complete', () => {
    const config = createMockWizardConfig({ allowReopen: true });
    const draft = { ...mockWizardStates.complete.draft };
    const result = guardReopen(config.steps[0].stepId, config, draft);
    expect(result.ok).toBe(true);
  });

  it('blocks reopen when allowReopen is not set', () => {
    const config = createMockWizardConfig({ allowReopen: undefined });
    const draft = { ...mockWizardStates.complete.draft };
    const result = guardReopen(config.steps[0].stepId, config, draft);
    expect(result.ok).toBe(false);
  });
});
