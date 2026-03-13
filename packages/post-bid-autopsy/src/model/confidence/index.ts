import type { IAutopsyConfidence } from '../../types/index.js';

export const POST_BID_AUTOPSY_CONFIDENCE_BOUNDARY = Object.freeze({
  owner: 'primitive',
  area: 'confidence',
  adapterMayProvide: Object.freeze(['reason-codes']),
  adapterMustNotOwn: Object.freeze(['confidence-tiering', 'aggregate-thresholds', 'publication-gating']),
});

export const createConfidenceAssessment = (
  overrides: Partial<IAutopsyConfidence> = {}
): IAutopsyConfidence => ({
  tier: overrides.tier ?? 'moderate',
  score: overrides.score ?? 0.72,
  reasons: overrides.reasons ?? ['scaffold-confidence'],
  evidenceCoverage: overrides.evidenceCoverage ?? 1,
});
