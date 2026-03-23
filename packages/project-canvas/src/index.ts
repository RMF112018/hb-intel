// Types
export type {
  ComplexityTier,
  DataSourceBadge,
  IDataSourceTooltip,
  ICanvasTileDefinition,
  ICanvasTileProps,
  ICanvasUserConfig,
  ICanvasTilePlacement,
} from './types/index.js';

// Constants
export {
  CANVAS_GRID_COLUMNS,
  DEFAULT_COL_SPAN,
  DEFAULT_ROW_SPAN,
  ROLE_DEFAULT_TILES,
  PROJECT_ROLE_DEFAULT_TILES,
  MIN_COL_SPAN,
  MAX_COL_SPAN,
  MIN_ROW_SPAN,
  MAX_ROW_SPAN,
  RECOMMENDATION_SIGNALS,
  DATA_SOURCE_BADGES,
  DATA_SOURCE_TOOLTIP_SCHEMA,
  MANDATORY_GOVERNANCE_APPLY_MODE,
  MANDATORY_TILE_LOCK_ICON,
} from './constants/index.js';

export type { RecommendationSignal } from './constants/index.js';

// Registry
export { register, registerMany, get, getAll } from './registry/index.js';

// API
export { CanvasApi, createSpfxCanvasStorageAdapter } from './api/index.js';
export type { ICanvasApi, ISpfxCanvasStorageAdapter } from './api/index.js';

// Hooks
export {
  useProjectCanvas,
  useCanvasConfig,
  useCanvasEditor,
  useRoleDefaultCanvas,
  useCanvasRecommendations,
  useCanvasMandatoryTiles,
  useCanvasComplexity,
} from './hooks/index.js';
export type { CanvasComplexityResult } from './hooks/index.js';

// Components
export {
  HbcProjectCanvas,
  HbcTileCatalog,
  AIInsightTile,
} from './components/index.js';

// Reference tile definitions — D-SF13-T07
export { referenceTiles, registerReferenceTiles } from './tiles/index.js';
