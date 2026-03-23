import type { IRecommendationRecord } from '../src/schedule/types/index.js';

export const createMockRecommendationRecord = (
  overrides?: Partial<IRecommendationRecord>,
): IRecommendationRecord => ({
  recommendationId: 'rec-001',
  projectId: 'proj-001',
  targetType: 'Activity',
  targetId: 'src-001::A1000',
  recommendationType: 'FloatRisk',
  title: 'Critical float erosion on A1000',
  rationale: 'Activity A1000 float has decreased from 40hrs to 0hrs over last 3 updates',
  evidenceBasis: ['float-snap-001', 'float-snap-002', 'float-snap-003'],
  confidence: 85,
  confidenceLabel: 'High',
  disposition: 'Pending',
  promotionPath: null,
  promotedToId: null,
  respondedBy: null,
  respondedAt: null,
  responseNote: null,
  generatedAt: '2026-03-23T12:00:00Z',
  policyVersionId: 'policy-v1',
  ...overrides,
});
