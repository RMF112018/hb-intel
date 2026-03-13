export {
  PostBidAutopsyWizard,
  type PostBidAutopsyWizardProps,
} from './PostBidAutopsyWizard.js';
export {
  AutopsySummaryCard,
  type AutopsySummaryCardProps,
} from './AutopsySummaryCard.js';
export {
  AutopsyListView,
  type AutopsyListViewProps,
} from './AutopsyListView.js';
export type {
  AutopsyAiSuggestion,
  AutopsyComparatorCallout,
  AutopsyComplexityTier,
  AutopsyDeepLink,
  AutopsyImpactPreview,
  AutopsyListPursuitMetadata,
  AutopsyPursuitSnapshot,
  AutopsyTriageQueue,
  EstimatingAutopsyViewerRole,
  PostBidAutopsyWizardSubmitPayload,
} from './displayModel.js';

export const ESTIMATING_POST_BID_LEARNING_COMPONENTS = Object.freeze([
  'PostBidAutopsyWizard',
  'AutopsySummaryCard',
  'AutopsyListView',
] as const);

export const createEstimatingPostBidLearningComponents = () =>
  ESTIMATING_POST_BID_LEARNING_COMPONENTS;
