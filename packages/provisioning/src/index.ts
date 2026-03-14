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
} from './handoff-config.js';
