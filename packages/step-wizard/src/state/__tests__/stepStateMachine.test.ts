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
  it('both terminal: stored blocked wins over inMemory skipped', () =>
    expect(mergeStepStatus('blocked', 'skipped')).toBe('blocked'));
  it('both terminal: stored skipped wins over inMemory blocked', () =>
    expect(mergeStepStatus('skipped', 'blocked')).toBe('skipped'));
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

  it('blocks reopen when step is not complete', () => {
    const config = createMockWizardConfig({ allowReopen: true });
    const draft = { ...mockWizardStates.notStarted.draft };
    const result = guardReopen(config.steps[0].stepId, config, draft);
    expect(result.ok).toBe(false);
  });
});

// ── applyStatusUpdate ────────────────────────────────────────────────────────
describe('applyStatusUpdate', () => {
  it('updates step status and sets savedAt', () => {
    const draft = mockWizardStates.notStarted.draft;
    const updated = applyStatusUpdate(draft, 'step-1', 'in-progress');
    expect(updated.stepStatuses['step-1']).toBe('in-progress');
    expect(updated.savedAt).not.toBe(draft.savedAt);
  });

  it('sets completedAt when marking complete', () => {
    const draft = mockWizardStates.notStarted.draft;
    const updated = applyStatusUpdate(draft, 'step-1', 'complete');
    expect(updated.stepStatuses['step-1']).toBe('complete');
    expect(updated.completedAts['step-1']).toBeTruthy();
  });

  it('preserves existing completedAt when not completing', () => {
    const draft = mockWizardStates.notStarted.draft;
    const updated = applyStatusUpdate(draft, 'step-1', 'in-progress');
    expect(updated.completedAts['step-1']).toBeNull();
  });
});

// ── applyVisit ────────────────────────────────────────────────────────────────
describe('applyVisit', () => {
  it('adds step to visitedStepIds', () => {
    const draft = mockWizardStates.notStarted.draft;
    const updated = applyVisit(draft, 'step-1');
    expect(updated.visitedStepIds).toContain('step-1');
  });

  it('is idempotent — does not duplicate visited step', () => {
    const draft = { ...mockWizardStates.notStarted.draft, visitedStepIds: ['step-1'] };
    const updated = applyVisit(draft, 'step-1');
    expect(updated.visitedStepIds.filter((id) => id === 'step-1')).toHaveLength(1);
    // Should return same reference when already visited
    expect(updated).toBe(draft);
  });
});

// ── buildWizardState ────────────────────────────────────────────────────────
describe('buildWizardState', () => {
  it('derives correct state from config and draft', () => {
    const config = createMockWizardConfig({ orderMode: 'sequential' });
    const state = buildWizardState(config, {}, mockWizardStates.notStarted.draft, {}, new Set());
    expect(state.steps).toHaveLength(3);
    expect(state.activeStepId).toBe('step-1');
    expect(state.isComplete).toBe(false);
    expect(state.completedCount).toBe(0);
    expect(state.requiredCount).toBe(2);
  });

  it('returns null activeStepId when complete', () => {
    const config = createMockWizardConfig({ orderMode: 'sequential' });
    const state = buildWizardState(config, {}, mockWizardStates.complete.draft, {}, new Set());
    expect(state.activeStepId).toBeNull();
    expect(state.isComplete).toBe(true);
  });

  it('resolves assignee from step config', () => {
    const config = createMockWizardConfig({
      steps: [
        { stepId: 'step-1', label: 'Step 1', required: true, resolveAssignee: () => ({ userId: 'u1', displayName: 'Alice' }) },
      ],
    });
    const state = buildWizardState(config, {}, mockWizardStates.notStarted.draft, {}, new Set());
    expect(state.steps[0].assignee).toEqual({ userId: 'u1', displayName: 'Alice' });
  });

  it('marks overdue steps from overdueStepIds set', () => {
    const config = createMockWizardConfig();
    const state = buildWizardState(config, {}, mockWizardStates.notStarted.draft, {}, new Set(['step-1']));
    expect(state.steps[0].isOverdue).toBe(true);
    expect(state.steps[1].isOverdue).toBe(false);
  });

  it('includes validation errors from cache', () => {
    const config = createMockWizardConfig();
    const state = buildWizardState(config, {}, mockWizardStates.notStarted.draft, { 'step-1': 'Required' }, new Set());
    expect(state.steps[0].validationError).toBe('Required');
  });

  it('prefers in-progress step as active over not-started', () => {
    const config = createMockWizardConfig({ orderMode: 'sequential' });
    const draft = {
      ...mockWizardStates.notStarted.draft,
      stepStatuses: { 'step-1': 'not-started' as const, 'step-2': 'in-progress' as const, 'step-3': 'not-started' as const },
    };
    const state = buildWizardState(config, {}, draft, {}, new Set());
    expect(state.activeStepId).toBe('step-2');
  });

  it('sequential order guard: blocks completion when prior required step not done', () => {
    const config = createMockWizardConfig({ orderMode: 'sequential' });
    const step2 = config.steps[1];
    const result = guardMarkComplete(step2, {}, mockWizardStates.notStarted.draft, config, false);
    expect(result.ok).toBe(false);
  });

  it('sequential order guard: allows completion when prior required steps are complete', () => {
    const config = createMockWizardConfig({ orderMode: 'sequential' });
    const step2 = config.steps[1];
    const draft = {
      ...mockWizardStates.notStarted.draft,
      stepStatuses: { 'step-1': 'complete' as const, 'step-2': 'not-started' as const, 'step-3': 'not-started' as const },
    };
    const result = guardMarkComplete(step2, {}, draft, config, false);
    expect(result.ok).toBe(true);
  });

  it('sequential order guard: allows when prior required step is skipped', () => {
    const config = createMockWizardConfig({ orderMode: 'sequential' });
    const step2 = config.steps[1];
    const draft = {
      ...mockWizardStates.notStarted.draft,
      stepStatuses: { 'step-1': 'skipped' as const, 'step-2': 'not-started' as const, 'step-3': 'not-started' as const },
    };
    const result = guardMarkComplete(step2, {}, draft, config, false);
    expect(result.ok).toBe(true);
  });

  it('guardMarkComplete handles step with undefined status in draft (defaults to not-started)', () => {
    const config = createMockWizardConfig({ orderMode: 'parallel' });
    const step = config.steps[0];
    const draft = {
      ...mockWizardStates.notStarted.draft,
      stepStatuses: {}, // empty — step-1 missing
    };
    const result = guardMarkComplete(step, {}, draft, config, false);
    expect(result.ok).toBe(true); // not-started is not terminal
  });

  it('sequential mode: allows active step goTo', () => {
    const result = guardGoTo('step-1', 'step-1', new Set(), 'sequential');
    expect(result.ok).toBe(true);
  });
});
