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
