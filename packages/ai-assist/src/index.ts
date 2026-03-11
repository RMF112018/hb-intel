// Types
export type {
  AiTrustLevel,
  AiOutputType,
  IAiAction,
  AiActionDefinition,
  IAiPromptPayload,
  IAiConfidenceDetails,
  IAiActionResult,
  IAiSmartInsertMapping,
  IAiSmartInsertResult,
  IAiAuditRecord,
  IAiModelRegistration,
  IAiModelRegistry,
  IAiActionInvokeContext,
  IAiAssistPolicy,
  IAiAssistConfig,
  IAiActionRegistration,
  IRelevanceScore,
  ComplexityTier,
} from './types/index.js';

// Constants
export {
  AI_ASSIST_DEFAULTS,
  AI_TRUST_LEVELS,
  AI_ACTION_CATEGORIES,
  AI_OUTPUT_TYPES,
  AI_CONFIDENCE_BADGES,
  AI_POLICY_DECISIONS,
  AI_ACTION_OUTCOMES,
} from './constants/index.js';

// Registry
export {
  AiActionRegistry,
  registerAiAction,
  registerAiActions,
  AiModelRegistry,
  RelevanceScoringEngine,
} from './registry/index.js';

// Governance
export { AiGovernanceApi, AiAuditWriter } from './governance/index.js';
export type { IPolicyEvaluation, IRateLimitStatus, IAuditTrailFilters } from './governance/index.js';

// API
export { AiAssistApi } from './api/index.js';
export type { IAiAssistApi, IAiActionExecutor } from './api/index.js';

// Hooks
export { useAiAction, useAiActions } from './hooks/index.js';
export type { UseAiActionResult, UseAiActionsResult, UseAiActionsParams } from './hooks/index.js';

// Components
export {
  HbcAiSmartInsertOverlay,
  HbcAiTrustMeter,
  HbcAiGovernancePortal,
  HbcAiActionMenu,
  HbcAiLoadingState,
  HbcAiResultPanel,
} from './components/index.js';

export type {
  HbcAiSmartInsertOverlayProps,
  HbcAiTrustMeterProps,
  HbcAiGovernancePortalProps,
  HbcAiActionMenuProps,
  HbcAiLoadingStateProps,
  HbcAiResultPanelProps,
} from './components/index.js';

// Reference integrations
export {
  REFERENCE_MODELS,
  REFERENCE_ACTIONS,
  REFERENCE_ACTION_BINDINGS,
  REFERENCE_POLICY,
  ReferenceExecutor,
  createReferenceExecutor,
  seedReferenceIntegrations,
} from './reference/index.js';
