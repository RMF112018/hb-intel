export { businessDevelopmentStrategicIntelligenceProfile } from './profiles/index.js';

export {
  mapStrategicIntelligenceStateToBdView,
  projectCommitmentRegister,
  projectSuggestionCards,
  type BdStrategicIntelligenceViewModel,
  type CommitmentRegisterProjection,
  type SuggestionCardProjection,
} from './adapters/index.js';

export {
  useStrategicIntelligence,
  type UseStrategicIntelligenceInput,
  type UseStrategicIntelligenceResult,
  type BdStrategicIntelligenceBicOwnerAvatarProjection,
  type BdStrategicIntelligenceCanvasAssignmentProjection,
  useBusinessDevelopmentStrategicIntelligence,
  type UseBusinessDevelopmentStrategicIntelligenceInput,
  type UseBusinessDevelopmentStrategicIntelligenceResult,
} from './hooks/index.js';

export {
  BdHeritagePanel,
  StrategicIntelligenceFeed,
  HandoffReviewPanel,
  CommitmentRegisterPanel,
  SuggestedIntelligenceCard,
  IntelligenceExplainabilityDrawer,
  type BdHeritagePanelProps,
  type StrategicIntelligenceFeedProps,
  type HandoffReviewPanelProps,
  type CommitmentRegisterPanelProps,
  type SuggestedIntelligenceCardProps,
  type IntelligenceExplainabilityDrawerProps,
} from './components/index.js';
