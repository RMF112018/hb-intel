import type { IConfidenceRecord } from '../src/schedule/types/index.js';

export const createMockConfidenceRecord = (
  overrides?: Partial<IConfidenceRecord>,
): IConfidenceRecord => ({
  confidenceId: 'conf-001',
  projectId: 'proj-001',
  publicationId: 'pub-001',
  computedAt: '2026-03-23T12:00:00Z',
  overallConfidenceScore: 75,
  overallConfidenceLabel: 'Moderate',
  factorScores: [
    { factorCode: 'SCHEDULE_QUALITY', factorLabel: 'Schedule Quality', score: 82, weight: 0.20, rawInputValue: '82', explanation: 'Grade B' },
    { factorCode: 'COMMITMENT_RELIABILITY', factorLabel: 'Commitment Reliability', score: 70, weight: 0.10, rawInputValue: '70%', explanation: 'Rolling PPC 70%' },
  ],
  policyVersionId: 'policy-v1',
  narrativeSummary: 'Schedule confidence is moderate with schedule quality as a strength.',
  ...overrides,
});
