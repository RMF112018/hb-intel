// Primitives
export type { AlertSeverity } from './AlertSeverity.js';
export type { AlertCategory } from './AlertCategory.js';
export type { ProbeHealthStatus } from './ProbeHealthStatus.js';
export type { ApprovalContext } from './ApprovalContext.js';

// Core interfaces
export type { IAdminAlert } from './IAdminAlert.js';
export type { IAdminAlertBadge } from './IAdminAlertBadge.js';
export type { IInfrastructureProbeResult } from './IInfrastructureProbeResult.js';
export type { IProbeSnapshot } from './IProbeSnapshot.js';
export type { IApprovalAuthorityRule } from './IApprovalAuthorityRule.js';
export type { IApprovalEligibilityResult } from './IApprovalEligibilityResult.js';

// Hook return types
export type { UseAdminAlertsResult } from './UseAdminAlertsResult.js';
export type { UseInfrastructureProbesResult } from './UseInfrastructureProbesResult.js';
export type { UseApprovalAuthorityResult } from './UseApprovalAuthorityResult.js';

// Legacy alias — T01 name kept for backward compatibility during T02 transition
export type { IInfrastructureProbeResult as IInfrastructureProbe } from './IInfrastructureProbe.js';
