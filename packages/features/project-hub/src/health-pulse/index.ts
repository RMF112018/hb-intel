/**
 * SF21 runtime root barrel for Project Health Pulse.
 */

export * from './types/index.js';
export * from './constants/index.js';
export * from './computors/index.js';
export * from './governance/index.js';
export * from './telemetry/index.js';
export * from './hooks/index.js';
export * from './components/index.js';
export * from './integrations/index.js';

// BIC Registration (P2-C5 Blocker #4)
export {
  PROJECT_HEALTH_PULSE_BIC_KEY,
  PROJECT_HEALTH_PULSE_BIC_LABEL,
  createProjectHealthPulseBicRegistration,
} from './bic-registration.js';

// Notification Registrations (P2-C5 Blocker #7)
export { PROJECT_HEALTH_PULSE_NOTIFICATION_REGISTRATIONS } from './notification-registrations.js';
