import { describe, expect, it } from 'vitest';
import type { IRequestClarification } from '@hbc/models';
import {
  getOpenClarifications,
  buildClarificationReturnState,
  buildClarificationResponsePayload,
} from '../config/clarificationReturn.js';
import { PROJECT_SETUP_CLARIFICATION_DRAFT_KEY_PREFIX } from '../types/index.js';

/** Factory helper for creating test clarification items. */
function makeClarification(
  overrides: Partial<IRequestClarification> = {},
): IRequestClarification {
  return {
    clarificationId: 'c-1',
    fieldId: 'projectName',
    stepId: 'project-info',
    message: 'Please clarify the project name.',
    raisedBy: 'controller-1',
    raisedAt: '2026-03-10T10:00:00Z',
    status: 'open',
    ...overrides,
  };
}

describe('getOpenClarifications', () => {
  it('returns empty array for empty input', () => {
    expect(getOpenClarifications([])).toEqual([]);
  });

  it('returns all items when all are open', () => {
    const items = [
      makeClarification({ clarificationId: 'c-1' }),
      makeClarification({ clarificationId: 'c-2', fieldId: 'department', stepId: 'department' }),
    ];
    expect(getOpenClarifications(items)).toHaveLength(2);
  });

  it('returns empty array when all are responded', () => {
    const items = [
      makeClarification({ status: 'responded' }),
      makeClarification({ clarificationId: 'c-2', status: 'responded' }),
    ];
    expect(getOpenClarifications(items)).toEqual([]);
  });

  it('returns only open items from a mixed set', () => {
    const items = [
      makeClarification({ clarificationId: 'c-1', status: 'open' }),
      makeClarification({ clarificationId: 'c-2', status: 'responded' }),
      makeClarification({ clarificationId: 'c-3', status: 'open', fieldId: 'department' }),
    ];
    const result = getOpenClarifications(items);
    expect(result).toHaveLength(2);
    expect(result.map((r) => r.clarificationId)).toEqual(['c-1', 'c-3']);
  });
});

describe('buildClarificationReturnState', () => {
  it('returns all steps complete and null activeStepId when no clarifications', () => {
    const result = buildClarificationReturnState([]);
    expect(result.flaggedStepIds).toEqual([]);
    expect(result.completedStepIds).toEqual([
      'project-info',
      'department',
      'project-team',
      'template-addons',
      'review-submit',
    ]);
    expect(result.activeStepId).toBeNull();
    expect(result.openClarifications).toEqual([]);
    expect(result.mode).toBe('clarification-return');
  });

  it('returns all steps complete when all clarifications are responded', () => {
    const items = [
      makeClarification({ status: 'responded' }),
      makeClarification({ clarificationId: 'c-2', status: 'responded', fieldId: 'department', stepId: 'department' }),
    ];
    const result = buildClarificationReturnState(items);
    expect(result.flaggedStepIds).toEqual([]);
    expect(result.activeStepId).toBeNull();
    expect(result.openClarifications).toEqual([]);
  });

  it('flags a single step when one field is clarified', () => {
    const items = [makeClarification({ stepId: 'project-team', fieldId: 'projectLeadId' })];
    const result = buildClarificationReturnState(items);
    expect(result.flaggedStepIds).toEqual(['project-team']);
    expect(result.completedStepIds).toEqual([
      'project-info',
      'department',
      'template-addons',
      'review-submit',
    ]);
    expect(result.activeStepId).toBe('project-team');
    expect(result.openClarifications).toHaveLength(1);
  });

  it('deduplicates multiple fields in the same step', () => {
    const items = [
      makeClarification({ clarificationId: 'c-1', fieldId: 'projectName', stepId: 'project-info' }),
      makeClarification({ clarificationId: 'c-2', fieldId: 'clientName', stepId: 'project-info' }),
      makeClarification({ clarificationId: 'c-3', fieldId: 'startDate', stepId: 'project-info' }),
    ];
    const result = buildClarificationReturnState(items);
    expect(result.flaggedStepIds).toEqual(['project-info']);
    expect(result.openClarifications).toHaveLength(3);
  });

  it('flags multiple steps across wizard in sequential order', () => {
    const items = [
      makeClarification({ clarificationId: 'c-1', fieldId: 'addOns', stepId: 'template-addons' }),
      makeClarification({ clarificationId: 'c-2', fieldId: 'projectName', stepId: 'project-info' }),
      makeClarification({ clarificationId: 'c-3', fieldId: 'groupMembers', stepId: 'project-team' }),
    ];
    const result = buildClarificationReturnState(items);
    expect(result.flaggedStepIds).toEqual(['project-info', 'project-team', 'template-addons']);
    expect(result.activeStepId).toBe('project-info');
    expect(result.completedStepIds).toEqual(['department', 'review-submit']);
  });

  it('sets activeStepId to first flagged step in wizard order', () => {
    const items = [
      makeClarification({ clarificationId: 'c-1', fieldId: 'department', stepId: 'department' }),
      makeClarification({ clarificationId: 'c-2', fieldId: 'addOns', stepId: 'template-addons' }),
    ];
    const result = buildClarificationReturnState(items);
    expect(result.activeStepId).toBe('department');
  });

  it('ignores clarification items with unrecognized stepId values', () => {
    const items = [
      makeClarification({ clarificationId: 'c-1', fieldId: 'unknown', stepId: 'nonexistent-step' }),
      makeClarification({ clarificationId: 'c-2', fieldId: 'department', stepId: 'department' }),
    ];
    const result = buildClarificationReturnState(items);
    expect(result.flaggedStepIds).toEqual(['department']);
    // The item with unrecognized stepId is still in openClarifications (it's open)
    expect(result.openClarifications).toHaveLength(2);
  });

  it('only considers open items when mixed with responded', () => {
    const items = [
      makeClarification({ clarificationId: 'c-1', fieldId: 'projectName', stepId: 'project-info', status: 'responded' }),
      makeClarification({ clarificationId: 'c-2', fieldId: 'department', stepId: 'department', status: 'open' }),
    ];
    const result = buildClarificationReturnState(items);
    expect(result.flaggedStepIds).toEqual(['department']);
    expect(result.completedStepIds).toContain('project-info');
  });

  it('all clarifications in one step → only that step flagged, rest complete', () => {
    const items = [
      makeClarification({ clarificationId: 'c-1', fieldId: 'department', stepId: 'department' }),
      makeClarification({ clarificationId: 'c-2', fieldId: 'contractType', stepId: 'department' }),
    ];
    const result = buildClarificationReturnState(items);
    expect(result.flaggedStepIds).toEqual(['department']);
    expect(result.completedStepIds).toHaveLength(4);
    expect(result.activeStepId).toBe('department');
  });
});

describe('buildClarificationResponsePayload', () => {
  it('assembles correct shape with all fields', () => {
    const requestId = 'req-123';
    const updatedFields = { projectName: 'Updated Name', department: 'commercial' };
    const responses = [
      { clarificationId: 'c-1', responseNote: 'Fixed the name' },
      { clarificationId: 'c-2' },
    ];
    const result = buildClarificationResponsePayload(requestId, updatedFields, responses);

    expect(result.requestId).toBe('req-123');
    expect(result.updatedFields).toEqual(updatedFields);
    expect(result.responses).toEqual(responses);
    expect(result.draftKeyToClear).toBe(`${PROJECT_SETUP_CLARIFICATION_DRAFT_KEY_PREFIX}req-123`);
  });

  it('handles empty updatedFields', () => {
    const result = buildClarificationResponsePayload('req-456', {}, []);
    expect(result.updatedFields).toEqual({});
    expect(result.responses).toEqual([]);
    expect(result.requestId).toBe('req-456');
  });

  it('handles empty responses array', () => {
    const result = buildClarificationResponsePayload(
      'req-789',
      { projectName: 'Test' },
      [],
    );
    expect(result.responses).toEqual([]);
    expect(result.draftKeyToClear).toBe(`${PROJECT_SETUP_CLARIFICATION_DRAFT_KEY_PREFIX}req-789`);
  });

  it('preserves response notes when provided', () => {
    const responses = [
      { clarificationId: 'c-1', responseNote: 'Updated as requested' },
    ];
    const result = buildClarificationResponsePayload('req-100', {}, responses);
    expect(result.responses[0].responseNote).toBe('Updated as requested');
  });

  it('handles responses without optional responseNote', () => {
    const responses = [{ clarificationId: 'c-1' }];
    const result = buildClarificationResponsePayload('req-200', {}, responses);
    expect(result.responses[0].responseNote).toBeUndefined();
  });
});
