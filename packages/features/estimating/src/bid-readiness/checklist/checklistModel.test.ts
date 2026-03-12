import { describe, expect, it } from 'vitest';

import {
  applyChecklistDraft,
  computeChecklistCompletion,
  groupChecklistItems,
  sortChecklistItems,
  validateAdminChecklistDefinitions,
} from './index.js';

const sampleItems = [
  {
    checklistItemId: 'c-2',
    criterionId: 'b',
    label: 'B item',
    category: 'coverage' as const,
    weight: 20,
    isBlocker: false,
    isComplete: false,
    rationale: '',
    scoringInfluence: 20,
    actionHref: '/b',
  },
  {
    checklistItemId: 'c-1',
    criterionId: 'a',
    label: 'A item',
    category: 'compliance' as const,
    weight: 40,
    isBlocker: true,
    isComplete: false,
    rationale: '',
    scoringInfluence: 40,
    actionHref: '/a',
  },
];

describe('checklist model', () => {
  it('sorts deterministically and groups blockers/incomplete/complete', () => {
    const sorted = sortChecklistItems(sampleItems);
    expect(sorted[0]?.isBlocker).toBe(true);

    const grouped = groupChecklistItems(sorted);
    expect(grouped.blockers).toHaveLength(1);
    expect(grouped.incomplete).toHaveLength(2);
    expect(grouped.complete).toHaveLength(0);
  });

  it('tracks completion and draft overrides deterministically', () => {
    const updated = applyChecklistDraft(sampleItems, {
      'c-1': { isComplete: true, rationale: 'done' },
    });

    expect(updated.find((item) => item.checklistItemId === 'c-1')?.isComplete).toBe(true);
    expect(computeChecklistCompletion(updated)).toBe(50);
  });

  it('validates checklist definitions including blocking requirement', () => {
    const errors = validateAdminChecklistDefinitions([
      { checklistItemId: 'd-1', criterionId: 'a', required: true, blocking: true, order: 0 },
      { checklistItemId: 'd-2', criterionId: 'b', required: true, blocking: false, order: 1 },
    ]);

    expect(errors).toHaveLength(0);

    const invalidErrors = validateAdminChecklistDefinitions([
      { checklistItemId: 'd-1', criterionId: 'a', required: true, blocking: false, order: -1 },
      { checklistItemId: 'd-1', criterionId: 'b', required: true, blocking: false, order: 0 },
    ]);

    expect(invalidErrors.length).toBeGreaterThan(0);
  });
});
