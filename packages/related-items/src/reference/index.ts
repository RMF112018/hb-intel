/**
 * Reference integrations barrel — D-SF14-T07
 */

// Types
export type {
  IBdScorecardRecord,
  IEstimatingPursuitRecord,
  IProjectRecord,
} from './types.js';

// Mock data
export {
  MOCK_BD_SCORECARD_001,
  MOCK_BD_SCORECARD_002,
  MOCK_BD_SCORECARDS,
  MOCK_ESTIMATING_PURSUIT_001,
  MOCK_ESTIMATING_PURSUIT_002,
  MOCK_ESTIMATING_PURSUIT_003,
  MOCK_ESTIMATING_PURSUITS,
  MOCK_PROJECT_001,
  MOCK_PROJECT_002,
  MOCK_PROJECTS,
} from './mockSourceRecords.js';

// Registrations
export {
  registerReferenceRelationships,
  _resetReferenceRegistrationFlagForTests,
} from './referenceRegistrations.js';

// AI suggestion hook
export {
  registerReferenceAIHooks,
  _resetReferenceAIHookFlagForTests,
} from './referenceAISuggestionHook.js';

// Activity timeline adapter
export { emitGovernanceEvent } from './activityTimelineAdapter.js';
export type { IGovernanceTimelineEvent } from './activityTimelineAdapter.js';
