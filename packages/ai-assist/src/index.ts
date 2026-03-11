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
} from './registry/AiActionRegistry.js';
export { AiModelRegistry } from './registry/AiModelRegistry.js';
export { RelevanceScoringEngine } from './registry/RelevanceScoringEngine.js';

// Governance
export { AiGovernanceApi } from './governance/AiGovernanceApi.js';
export { AiAuditWriter } from './governance/AiAuditWriter.js';

// API
export { AiAssistApi } from './api/index.js';
export type { IAiAssistApi } from './api/index.js';

// Hooks
export { useAiAction, useAiActions } from './hooks/index.js';
export type { UseAiActionResult, UseAiActionsResult } from './hooks/index.js';

// Components
export {
  HbcAiSmartInsertOverlay,
  HbcAiTrustMeter,
  HbcAiGovernancePortal,
  HbcAiActionMenu,
  HbcAiLoadingState,
} from './components/index.js';

export type {
  HbcAiSmartInsertOverlayProps,
  HbcAiTrustMeterProps,
  HbcAiGovernancePortalProps,
  HbcAiActionMenuProps,
  HbcAiLoadingStateProps,
} from './components/index.js';
