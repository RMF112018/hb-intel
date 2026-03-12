import type { ISuggestedIntelligenceMatch } from '../../types/index.js';

export const createSuggestedIntelligenceMatch = (
  overrides?: Partial<ISuggestedIntelligenceMatch>
): ISuggestedIntelligenceMatch => ({
  suggestionId: 'suggestion-default',
  entryId: 'entry-default',
  matchScore: 0,
  matchedDimensions: [],
  reason: 'No suggestion reason provided.',
  reuseHistoryCount: 0,
  ...overrides,
});
