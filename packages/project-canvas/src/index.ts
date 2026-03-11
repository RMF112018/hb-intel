// Types
export type {
  ComplexityTier,
  DataSourceBadge,
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
} from './constants/index.js';

// Registry
export { register, getAll, get } from './registry/index.js';

// API
export { getConfig, saveConfig } from './api/index.js';

// Hooks
export {
  useProjectCanvas,
  useCanvasEditor,
  useRoleDefaultCanvas,
  useCanvasRecommendations,
} from './hooks/index.js';

// Components
export {
  HbcProjectCanvas,
  HbcCanvasEditor,
  HbcTileCatalog,
  AIInsightTile,
} from './components/index.js';
