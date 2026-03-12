import type { ISuggestedIntelligenceMatch } from '../src/types/index.js';
import { createSuggestedIntelligenceMatch } from '../src/model/index.js';

const merge = <T extends object>(base: T, overrides?: Partial<T>): T => ({
  ...base,
  ...(overrides ?? {}),
});

export const createMockSuggestedIntelligenceMatch = (
  overrides?: Partial<ISuggestedIntelligenceMatch>
): ISuggestedIntelligenceMatch =>
  merge(createSuggestedIntelligenceMatch(), {
    suggestionId: 'suggestion-mock',
    entryId: 'living-entry-mock',
    matchScore: 0.82,
    matchedDimensions: ['client', 'sector'],
    reason: 'heritage snapshot match',
    reuseHistoryCount: 4,
    ...overrides,
  });
