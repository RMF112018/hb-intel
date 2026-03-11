/**
 * Reference integration mock source records — D-SF14-T07, D-08
 *
 * Demo data constants with cross-referencing IDs for the three
 * canonical bidirectional relationship pairs.
 */
import type {
  IBdScorecardRecord,
  IEstimatingPursuitRecord,
  IProjectRecord,
} from './types.js';

// ── BD Scorecards ────────────────────────────────────────────────

export const MOCK_BD_SCORECARD_001: IBdScorecardRecord = {
  id: 'bd-sc-001',
  name: 'Acme Corporate Campus',
  clientName: 'Acme Corp',
  region: 'Southeast',
  pursuitIds: ['est-pur-001', 'est-pur-002'],
};

export const MOCK_BD_SCORECARD_002: IBdScorecardRecord = {
  id: 'bd-sc-002',
  name: 'Globex Distribution Center',
  clientName: 'Globex Inc',
  region: 'Midwest',
  pursuitIds: ['est-pur-003'],
};

// ── Estimating Pursuits ──────────────────────────────────────────

export const MOCK_ESTIMATING_PURSUIT_001: IEstimatingPursuitRecord = {
  id: 'est-pur-001',
  name: 'Acme Campus Phase 1 GMP',
  estimatedValue: 42_000_000,
  status: 'won',
  convertedProjectId: 'proj-001',
  originatingScorecardId: 'bd-sc-001',
};

export const MOCK_ESTIMATING_PURSUIT_002: IEstimatingPursuitRecord = {
  id: 'est-pur-002',
  name: 'Acme Campus Phase 2 Preconstruction',
  estimatedValue: 18_500_000,
  status: 'active',
  convertedProjectId: undefined,
  originatingScorecardId: 'bd-sc-001',
};

export const MOCK_ESTIMATING_PURSUIT_003: IEstimatingPursuitRecord = {
  id: 'est-pur-003',
  name: 'Globex DC Expansion',
  estimatedValue: 75_000_000,
  status: 'won',
  convertedProjectId: 'proj-002',
  originatingScorecardId: 'bd-sc-002',
};

// ── Projects ─────────────────────────────────────────────────────

export const MOCK_PROJECT_001: IProjectRecord = {
  id: 'proj-001',
  name: 'Acme Campus Phase 1',
  projectManager: 'Sarah Chen',
  status: 'active',
  originatingPursuitId: 'est-pur-001',
};

export const MOCK_PROJECT_002: IProjectRecord = {
  id: 'proj-002',
  name: 'Globex DC Expansion',
  projectManager: 'Marcus Williams',
  status: 'pre-construction',
  originatingPursuitId: 'est-pur-003',
};

/** All mock BD Scorecards. */
export const MOCK_BD_SCORECARDS: readonly IBdScorecardRecord[] = [
  MOCK_BD_SCORECARD_001,
  MOCK_BD_SCORECARD_002,
];

/** All mock Estimating Pursuits. */
export const MOCK_ESTIMATING_PURSUITS: readonly IEstimatingPursuitRecord[] = [
  MOCK_ESTIMATING_PURSUIT_001,
  MOCK_ESTIMATING_PURSUIT_002,
  MOCK_ESTIMATING_PURSUIT_003,
];

/** All mock Projects. */
export const MOCK_PROJECTS: readonly IProjectRecord[] = [
  MOCK_PROJECT_001,
  MOCK_PROJECT_002,
];
