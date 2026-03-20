export { businessDevelopmentStrategicIntelligenceProfile } from './profiles/index.js';

// BIC Registration (P2-C5 Blocker #3)
export {
  BD_STRATEGIC_INTELLIGENCE_BIC_KEY,
  BD_STRATEGIC_INTELLIGENCE_BIC_LABEL,
  createBdStrategicIntelligenceBicRegistration,
} from './bic-registration.js';

// Notification Registrations (P2-C5 Blocker #6)
export { BD_STRATEGIC_INTELLIGENCE_NOTIFICATION_REGISTRATIONS } from './notification-registrations.js';

export {
  mapStrategicIntelligenceStateToBdView,
  projectCommitmentRegister,
  projectSuggestionCards,
  type BdStrategicIntelligenceViewModel,
  type CommitmentRegisterProjection,
  type SuggestionCardProjection,
} from './adapters/index.js';

export {
  createStrategicIntelligenceReferenceIntegrations,
  projectStrategicIntelligenceToBicActions,
  gateStrategicIntelligenceByComplexity,
  projectStrategicIntelligenceVersionedSnapshot,
  projectStrategicIntelligenceRelatedItems,
  projectStrategicIntelligenceToCanvasPlacement,
  resolveStrategicIntelligenceNotifications,
  projectStrategicIntelligenceAcknowledgment,
  mapStrategicIntelligenceToHealthIndicator,
  projectStrategicIntelligenceToScoreBenchmark,
  projectStrategicIntelligenceToPostBidLearning,
  type IStrategicIntelligenceReferenceIntegrations,
  type IStrategicIntelligenceBicOwnerAvatarProjection,
  type IStrategicIntelligenceBicOwnershipAction,
  type IStrategicIntelligenceComplexityProjection,
  type IStrategicIntelligenceVersionedProjection,
  type IStrategicIntelligenceRelatedItemsProjection,
  type IStrategicIntelligenceCanvasProjection,
  type IStrategicIntelligenceCanvasTask,
  type StrategicIntelligenceCanvasTaskType,
  type IBdStrategicIntelligenceNotificationProjection,
  type IStrategicIntelligenceAcknowledgmentProjection,
  type IStrategicIntelligenceHealthProjection,
  type IStrategicIntelligenceScoreBenchmarkInteropProjection,
  type IStrategicIntelligenceLearningSignalProjection,
} from './integrations/index.js';

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
  IntelligenceEntryForm,
  IntelligenceApprovalQueue,
  BdHeritagePanel,
  StrategicIntelligenceFeed,
  HandoffReviewPanel,
  CommitmentRegisterPanel,
  SuggestedIntelligenceCard,
  IntelligenceExplainabilityDrawer,
  type IntelligenceEntryFormProps,
  type IntelligenceEntryFormDraft,
  type IntelligenceEntryFormAiSuggestion,
  type IntelligenceApprovalQueueProps,
  type BdHeritagePanelProps,
  type StrategicIntelligenceFeedProps,
  type HandoffReviewPanelProps,
  type CommitmentRegisterPanelProps,
  type SuggestedIntelligenceCardProps,
  type IntelligenceExplainabilityDrawerProps,
} from './components/index.js';
