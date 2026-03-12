import type { IVersionMetadata } from '@hbc/versioned-record';
import type { IStrategicIntelligenceEntry } from '../../types/index.js';

const DEFAULT_VERSION: IVersionMetadata = {
  snapshotId: 'strategic-entry-v1',
  version: 1,
  createdAt: '2026-03-12T00:00:00.000Z',
  createdBy: {
    userId: 'strategic-intelligence-system',
    displayName: 'Strategic Intelligence System',
    role: 'system',
  },
  changeSummary: 'T02 contract scaffold entry',
  tag: 'draft',
};

export const createLivingStrategicIntelligenceEntry = (
  overrides?: Partial<IStrategicIntelligenceEntry>
): IStrategicIntelligenceEntry => ({
  entryId: 'living-entry-default',
  type: 'observation',
  title: 'Strategic intelligence entry',
  body: 'Compile-safe T02 scaffold entry.',
  metadata: {},
  trust: {
    reliabilityTier: 'review-required',
    provenanceClass: 'meeting-summary',
    lastValidatedAt: null,
    reviewBy: null,
    isStale: false,
    aiTrustDowngraded: false,
  },
  lifecycleState: 'submitted',
  sensitivity: 'public-internal',
  conflicts: [],
  suggestedMatches: [],
  commitmentIds: [],
  createdAt: '2026-03-12T00:00:00.000Z',
  createdBy: 'strategic-intelligence-system',
  version: DEFAULT_VERSION,
  ...overrides,
});
