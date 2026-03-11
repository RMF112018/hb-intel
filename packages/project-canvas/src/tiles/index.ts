/**
 * Tiles barrel — D-SF13-T07
 *
 * Re-exports reference tile definitions, aggregated array, and registration function.
 */
export {
  bicMyItemsDef,
  activeConstraintsDef,
  projectHealthPulseDef,
  permitStatusDef,
  pendingApprovalsDef,
  bdHeritageDef,
  workflowHandoffInboxDef,
  documentActivityDef,
  estimatingPursuitDef,
  notificationSummaryDef,
  relatedItemsDef,
  aiInsightDef,
  referenceTiles,
} from './referenceTileDefinitions.js';

export { registerReferenceTiles, _resetRegistrationFlagForTests } from './registerReferenceTiles.js';

export { createReferenceTileComponents } from './createReferenceTileComponent.js';
