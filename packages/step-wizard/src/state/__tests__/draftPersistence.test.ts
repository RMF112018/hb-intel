// state/__tests__/draftPersistence.test.ts
import { describe, it, expect } from 'vitest';
import { mergeDraft } from '../draftPayload';
import type { IStepWizardDraft } from '../draftPayload';

const baseDraft: IStepWizardDraft = {
  stepStatuses: { 'step-1': 'not-started' },
  completedAts: { 'step-1': null },
  visitedStepIds: [],
  onAllCompleteFired: false,
  savedAt: new Date().toISOString(),
};

describe('mergeDraft', () => {
  it('preserves complete status from stored draft over in-memory in-progress (D-02)', () => {
    const stored: IStepWizardDraft = {
      ...baseDraft,
      stepStatuses: { 'step-1': 'complete' },
      completedAts: { 'step-1': '2026-03-08T09:00:00Z' },
      visitedStepIds: ['step-1'],
      onAllCompleteFired: true,
    };
    const inMemory = { 'step-1': 'in-progress' as const };
    const result = mergeDraft(inMemory, stored);
    expect(result.mergedStatuses['step-1']).toBe('complete');
  });

  it('unions visitedStepIds — never removes visited entries (D-05)', () => {
    const stored: IStepWizardDraft = {
      ...baseDraft,
      visitedStepIds: ['step-1', 'step-2'],
    };
    const result = mergeDraft({ 'step-1': 'in-progress' }, stored);
    expect(result.mergedVisitedIds).toContain('step-1');
    expect(result.mergedVisitedIds).toContain('step-2');
  });

  it('onAllCompleteFired: stored true wins over false (D-07)', () => {
    const stored: IStepWizardDraft = {
      ...baseDraft,
      onAllCompleteFired: true,
    };
    const result = mergeDraft({}, stored);
    expect(result.onAllCompleteFired).toBe(true);
  });
});
