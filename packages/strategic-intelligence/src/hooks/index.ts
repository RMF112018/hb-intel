export {
  useStrategicIntelligenceState,
  type UseStrategicIntelligenceStateInput,
  type UseStrategicIntelligenceStateResult,
} from './useStrategicIntelligenceState.js';

export {
  useStrategicIntelligenceApprovalQueue,
  type UseStrategicIntelligenceApprovalDraft,
  type UseStrategicIntelligenceApprovalQueueInput,
  type UseStrategicIntelligenceApprovalQueueResult,
} from './useStrategicIntelligenceApprovalQueue.js';

export {
  useHandoffReviewWorkflow,
  type UseHandoffReviewWorkflowInput,
  type UseHandoffReviewWorkflowResult,
} from './useHandoffReviewWorkflow.js';

export {
  useSuggestedIntelligence,
  type UseSuggestedIntelligenceInput,
  type UseSuggestedIntelligenceResult,
  type ISuggestedIntelligenceExplainabilityPayload,
} from './useSuggestedIntelligence.js';

export {
  createStrategicIntelligenceStateQueryKey,
  createStrategicIntelligenceApprovalQueueQueryKey,
  createStrategicIntelligenceFeedQueryKey,
  createStrategicIntelligenceCanvasProjectionQueryKey,
} from './queryKeys.js';

export type {
  StrategicIntelligenceSyncBadge,
  StrategicIntelligenceSuggestionOutcome,
  IStrategicIntelligenceTelemetryDelta,
} from './stateStore.js';
