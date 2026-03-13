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
export {
  LearningInsightsDashboard,
  type LearningInsightsDashboardProps,
} from './LearningInsightsDashboard.js';
export type {
  AutopsyAiSuggestion,
  AutopsyComparatorCallout,
  AutopsyComplexityTier,
  AutopsyDeepLink,
  AutopsyImpactPreview,
  AutopsyListPursuitMetadata,
  AutopsyPursuitSnapshot,
  AutopsyTriageQueue,
  BusinessDevelopmentAutopsyViewerRole,
  PostBidAutopsyWizardSubmitPayload,
} from './displayModel.js';

export const BUSINESS_DEVELOPMENT_POST_BID_LEARNING_COMPONENTS = Object.freeze([
  'PostBidAutopsyWizard',
  'AutopsySummaryCard',
  'AutopsyListView',
  'LearningInsightsDashboard',
] as const);

export const createBusinessDevelopmentPostBidLearningComponents = () =>
  BUSINESS_DEVELOPMENT_POST_BID_LEARNING_COMPONENTS;
