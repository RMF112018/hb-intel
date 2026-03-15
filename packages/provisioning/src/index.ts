// @hbc/provisioning — headless provisioning logic only.
// D-PH6-09 package boundary: no visual React component exports.
export * from './types.js';
export * from './api-client.js';
export * from './store.js';
export * from './visibility.js';
export * from './notification-templates.js';
export * from './notification-registrations.js';
export { useProvisioningSignalR } from './hooks/useProvisioningSignalR.js';
export {
  isValidTransition,
  STATE_NOTIFICATION_TARGETS,
  STATE_TRANSITIONS,
} from './state-machine.js';

// W0-G3-T02: BIC ownership contract
export {
  PROJECT_SETUP_BIC_CONFIG,
  PROJECT_SETUP_ACTION_MAP,
  PROJECT_SETUP_ESCALATED_FAILURE_ACTION,
  PROJECT_SETUP_URGENCY_MAP,
  deriveCurrentOwner,
  BIC_ROLE_CONTROLLER,
  BIC_ROLE_REQUESTER,
  BIC_ROLE_ADMIN,
  BIC_ROLE_PROJECT_LEAD,
} from './bic-config.js';

// W0-G3-T02: BIC module registration seam
export {
  PROVISIONING_BIC_MODULE_KEY,
  PROVISIONING_BIC_MODULE_LABEL,
  createProjectSetupBicRegistration,
} from './bic-registration.js';

// W0-G3-T02: Handoff contract (Estimating → Project Hub)
export type { IProjectHubSeedData } from './handoff-config.js';
export {
  SETUP_TO_PROJECT_HUB_HANDOFF_CONFIG,
  validateSetupHandoffReadiness,
  resolveProjectHubUrl,
} from './handoff-config.js';

// W0-G3-T06: Summary field registry, status labels, department labels, urgency indicators
export type { SummaryFieldSource, ISummaryFieldDescriptor, IUrgencyIndicator } from './summary-field-registry.js';
export {
  PROJECT_SETUP_STATUS_LABELS,
  DEPARTMENT_DISPLAY_LABELS,
  URGENCY_INDICATOR_MAP,
  PROJECT_SETUP_SUMMARY_FIELDS,
  CORE_SUMMARY_FIELD_IDS,
  STATE_BADGE_VARIANTS,
  getStateBadgeVariant,
  REQUEST_STATE_KEBAB_MAP,
} from './summary-field-registry.js';

// W0-G3-T06: History level model and content descriptors
export type { HistoryLevel, IHistoryContentDescriptor } from './history-level-registry.js';
export {
  HISTORY_LEVEL_LABELS,
  PROJECT_SETUP_HISTORY_CONTENT,
  getHistoryContentByLevel,
  isHistoryLevelVisible,
} from './history-level-registry.js';

// W0-G3-T06: Coaching prompt registry
export type { ICoachingPrompt } from './coaching-prompt-registry.js';
export {
  PROJECT_SETUP_COACHING_PROMPTS,
  getCoachingPrompt,
} from './coaching-prompt-registry.js';

// W0-G3-T06: Complexity gate visibility helpers
export {
  isSummaryFieldVisible,
  isHistoryContentVisible,
  getVisibleSummaryFields,
  getVisibleHistoryContent,
} from './complexity-gate-helpers.js';

// W0-G3-T07: Integration rule registry
export type { IIntegrationRule } from './integration-rules.js';
export {
  PROJECT_SETUP_INTEGRATION_RULES,
  getIntegrationRule,
} from './integration-rules.js';

// W0-G3-T07: Failure mode registry
export type { IFailureMode } from './failure-modes.js';
export {
  PROJECT_SETUP_FAILURE_MODES,
  getFailureMode,
} from './failure-modes.js';
