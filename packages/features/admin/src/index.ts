/**
 * @hbc/features-admin
 *
 * Admin Intelligence feature package — monitors, probes, approval authority,
 * and infrastructure health for HB Intel.
 *
 * @see docs/architecture/plans/shared-features/SF17-Admin-Intelligence.md
 */

// Empty State (preserved from initial scaffold)
export { adminProvisioningEmptyStateConfig } from './empty-state/index.js';

// Types
export type {
  AlertSeverity,
  AlertCategory,
  ProbeHealthStatus,
  ApprovalContext,
  IAdminAlert,
  IAdminAlertBadge,
  IInfrastructureProbeResult,
  IInfrastructureProbe,
  IProbeSnapshot,
  IApprovalAuthorityRule,
  IApprovalEligibilityResult,
  UseAdminAlertsResult,
  UseInfrastructureProbesResult,
  UseApprovalAuthorityResult,
  IAlertMonitor,
  IInfrastructureProbeDefinition,
  NotificationRoute,
} from './types/index.js';

// Constants
export {
  ADMIN_ALERTS_POLL_MS,
  PROBE_SCHEDULER_DEFAULT_MS,
  PROBE_MAX_RETRY,
  APPROVAL_RULE_LIST_TITLE,
  ADMIN_ALERT_LIST_TITLE,
  INFRA_PROBE_LIST_TITLE,
} from './constants/index.js';

// Monitors
export {
  MonitorRegistry,
  provisioningFailureMonitor,
  permissionAnomalyMonitor,
  stuckWorkflowMonitor,
  overdueProvisioningMonitor,
  upcomingExpirationMonitor,
  staleRecordMonitor,
  routeAlert,
  createDefaultMonitorRegistry,
} from './monitors/index.js';

// Probes
export {
  ProbeScheduler,
  sharePointProbe,
  azureFunctionsProbe,
  searchProbe,
  notificationProbe,
  moduleRecordHealthProbe,
  createDefaultProbeScheduler,
} from './probes/index.js';

// API
export {
  ApprovalAuthorityApi,
  AdminAlertsApi,
  InfrastructureProbeApi,
} from './api/index.js';

// Hooks
export {
  useAdminAlerts,
  useInfrastructureProbes,
  useApprovalAuthority,
} from './hooks/index.js';

// Components
export {
  AdminAlertBadge,
  AdminAlertDashboard,
  ImplementationTruthDashboard,
  ApprovalAuthorityTable,
  ApprovalRuleEditor,
} from './components/index.js';
