export {
  PostBidAutopsyWizard,
  type PostBidAutopsyWizardProps,
} from './PostBidAutopsyWizard.js';
export {
  AutopsySummaryCard,
  type AutopsySummaryCardProps,
} from './AutopsySummaryCard.js';
export type {
  AutopsyAiSuggestion,
  AutopsyComparatorCallout,
  AutopsyComplexityTier,
  AutopsyDeepLink,
  AutopsyImpactPreview,
  AutopsyPursuitSnapshot,
  PostBidAutopsyWizardSubmitPayload,
} from './displayModel.js';

export const ESTIMATING_POST_BID_LEARNING_COMPONENTS = Object.freeze([
  'PostBidAutopsyWizard',
  'AutopsySummaryCard',
] as const);

export const createEstimatingPostBidLearningComponents = () =>
  ESTIMATING_POST_BID_LEARNING_COMPONENTS;
