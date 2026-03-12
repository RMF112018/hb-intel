import type { IVersionMetadata } from '@hbc/versioned-record';
import type { IHeritageSnapshot } from '../../types/index.js';

const DEFAULT_VERSION: IVersionMetadata = {
  snapshotId: 'strategic-snapshot-v1',
  version: 1,
  createdAt: '2026-03-12T00:00:00.000Z',
  createdBy: {
    userId: 'strategic-intelligence-system',
    displayName: 'Strategic Intelligence System',
    role: 'system',
  },
  changeSummary: 'T02 contract scaffold snapshot',
  tag: 'draft',
};

export const createHeritageSnapshot = (
  overrides?: Partial<IHeritageSnapshot>
): IHeritageSnapshot => ({
  snapshotId: 'heritage-snapshot-default',
  scorecardId: 'scorecard-default',
  scorecardVersion: 1,
  capturedAt: '2026-03-12T00:00:00.000Z',
  capturedBy: 'strategic-intelligence-system',
  decision: 'WAIT',
  decisionRationale: 'T02 scaffold heritage rationale',
  clientPriorities: [],
  competitiveContext: '',
  relationshipIntelligence: '',
  riskAssumptions: [],
  pursuitStrategy: '',
  immutable: true,
  version: DEFAULT_VERSION,
  ...overrides,
});
