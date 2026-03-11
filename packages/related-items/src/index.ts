// Types
export type {
  RelationshipDirection,
  IGovernanceMetadata,
  IRelationshipDefinition,
  IRelatedItem,
  IBicNextMoveState,
} from './types/index.js';

// Constants
export {
  RELATED_ITEMS_PANEL_TITLE,
  DEFAULT_RELATIONSHIP_PRIORITY,
  MAX_TILE_ITEMS,
} from './constants/index.js';

// Registry
export { RelationshipRegistry } from './registry/index.js';
export type { IRelationshipRegistry } from './registry/index.js';

// API
export { RelatedItemsApi } from './api/index.js';
export type { IRelatedItemsApi } from './api/index.js';

// Hooks
export { useRelatedItems } from './hooks/index.js';
export type { UseRelatedItemsResult } from './hooks/index.js';

// Governance
export { HbcRelatedItemsGovernance } from './governance/index.js';
export type { HbcRelatedItemsGovernanceProps } from './governance/index.js';

// Reference integrations
export {
  registerReferenceRelationships,
  registerReferenceAIHooks,
  emitGovernanceEvent,
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
} from './reference/index.js';

export type {
  IBdScorecardRecord,
  IEstimatingPursuitRecord,
  IProjectRecord,
  IGovernanceTimelineEvent,
} from './reference/index.js';

// Components
export {
  HbcRelatedItemsPanel,
  HbcRelatedItemCard,
  HbcRelatedItemsTile,
} from './components/index.js';

export type {
  HbcRelatedItemsPanelProps,
  HbcRelatedItemCardProps,
  HbcRelatedItemsTileProps,
} from './components/index.js';
