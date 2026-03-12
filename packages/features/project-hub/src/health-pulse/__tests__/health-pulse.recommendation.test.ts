import { describe, expect, it } from 'vitest';

import {
  rankRecommendationCandidates,
  selectTopRecommendedAction,
} from '../computors/recommendation/index.js';

describe('health pulse recommendation', () => {
  it('ranks candidates deterministically by priority inputs', () => {
    const ranked = rankRecommendationCandidates([
      {
        actionText: 'Action B',
        actionLink: '/b',
        reasonCode: 'b',
        owner: 'Owner B',
        urgency: 70,
        impact: 80,
        reversibilityWindowHours: 40,
        ownerAvailability: 60,
        confidenceWeight: 70,
      },
      {
        actionText: 'Action A',
        actionLink: '/a',
        reasonCode: 'a',
        owner: 'Owner A',
        urgency: 90,
        impact: 90,
        reversibilityWindowHours: 10,
        ownerAvailability: 90,
        confidenceWeight: 90,
      },
    ]);

    expect(ranked[0]?.actionText).toBe('Action A');
  });

  it('returns null when no recommendation candidates are provided', () => {
    expect(selectTopRecommendedAction([])).toBeNull();
  });
});
