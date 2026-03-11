// Types
export type {
  EmptyStateClassification,
  EmptyStateVariant,
  IEmptyStateAction,
  IEmptyStateContext,
  IEmptyStateConfig,
  ISmartEmptyStateConfig,
  IEmptyStateVisitStore,
  IUseFirstVisitResult,
  IUseEmptyStateResult,
} from './types/index.js';

// Constants
export {
  EMPTY_STATE_VISIT_KEY_PREFIX,
  EMPTY_STATE_COACHING_COLLAPSE_LABEL,
  emptyStateClassificationLabel,
} from './constants/index.js';

// Classification
export { classifyEmptyState } from './classification/index.js';
export { noopVisitStore } from './classification/index.js';
export { createEmptyStateVisitStore } from './classification/index.js';

// Hooks
export { useFirstVisit } from './hooks/index.js';
export type { UseFirstVisitParams } from './hooks/index.js';
export { useEmptyState } from './hooks/index.js';
export type { UseEmptyStateParams } from './hooks/index.js';

// Components
export { HbcSmartEmptyState } from './components/index.js';
export type { HbcSmartEmptyStateProps } from './components/index.js';
export { HbcEmptyStateIllustration } from './components/index.js';
