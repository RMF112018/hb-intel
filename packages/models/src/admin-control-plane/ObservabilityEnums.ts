/**
 * Admin Control Plane — Observability Enums
 *
 * Canonical enumerations for the Phase 12 observability layer. These enums
 * define the closed value sets used across backend persistence, query APIs,
 * and SPFx operator-console rendering.
 *
 * @module admin-control-plane
 */

// ─── Alert Severity ───────��─────────────────────────────────────────────────────

/**
 * Severity levels for admin observability alerts.
 *
 * Severity drives notification routing (immediate vs digest), badge rendering,
 * and operator triage priority.
 */
export enum ObservabilityAlertSeverity {
  /** System-level or safety-critical failure requiring immediate operator action */
  Critical = 'critical',

  /** Significant failure or degradation requiring prompt attention */
  High = 'high',

  /** Non-critical issue that should be reviewed during normal operations */
  Medium = 'medium',

  /** Informational or minor issue for awareness */
  Low = 'low',
}

// ���── Alert Status ───────���───────────────────────────────��───────────────────────

/**
 * Lifecycle status of an observability alert.
 */
export enum ObservabilityAlertStatus {
  /** Alert is active and unacknowledged */
  Active = 'active',

  /** Operator has acknowledged the alert but not yet resolved it */
  Acknowledged = 'acknowledged',

  /** Operator has resolved the alert */
  Resolved = 'resolved',

  /** Alert was automatically superseded by a newer evaluation */
  Superseded = 'superseded',
}

// ��── Alert Category ─────────────��───────────────────────────���───────────────────

/**
 * Monitored alert categories.
 *
 * Each category maps to a specific monitor implementation in
 * `@hbc/features-admin`. Categories are extensible as new monitors are wired.
 */
export enum ObservabilityAlertCategory {
  /** A provisioning run has failed */
  ProvisioningFailure = 'provisioning-failure',

  /** Unexpected permission state detected */
  PermissionAnomaly = 'permission-anomaly',

  /** A workflow has been stuck in a transitional state */
  StuckWorkflow = 'stuck-workflow',

  /** A provisioning task is overdue */
  OverdueProvisioningTask = 'overdue-provisioning-task',

  /** A managed resource or credential is approaching expiration */
  UpcomingExpiration = 'upcoming-expiration',

  /** A record has not been updated within expected freshness window */
  StaleRecord = 'stale-record',
}

// ─── Alert Affected Entity Type ─���───────────────────────��───────────────────────

/**
 * Classification of the entity affected by an alert.
 */
export enum ObservabilityAffectedEntityType {
  /** A data record (e.g., project setup request) */
  Record = 'record',

  /** A user account or identity */
  User = 'user',

  /** A SharePoint site or resource */
  Site = 'site',

  /** A background job or saga run */
  Job = 'job',

  /** A system-level component or service */
  System = 'system',
}

// ─── Probe Kind ─────────────────────────��───────────────────────────────────────

/**
 * Infrastructure probe identifiers.
 *
 * Each probe kind maps to a specific probe implementation that checks
 * a distinct infrastructure component.
 */
export enum ObservabilityProbeKind {
  /** SharePoint Online site and list connectivity */
  SharePointInfrastructure = 'sharepoint-infrastructure',

  /** Azure Functions backend health endpoint */
  AzureFunctions = 'azure-functions',

  /** Azure Cognitive Search service connectivity */
  AzureSearch = 'azure-search',

  /** Notification delivery system health */
  NotificationSystem = 'notification-system',

  /** Module record integrity and freshness */
  ModuleRecordHealth = 'module-record-health',
}

// ─── Probe Health Status ───────���────────────────────────────────────────────────

/**
 * Health status reported by an infrastructure probe.
 */
export enum ObservabilityProbeHealthStatus {
  /** Component is functioning normally */
  Healthy = 'healthy',

  /** Component is operational but showing degraded performance or partial issues */
  Degraded = 'degraded',

  /** Component is unreachable or returning errors */
  Error = 'error',

  /** Probe has not yet run or result is indeterminate */
  Unknown = 'unknown',
}

// ─── Incident Status ─────────────────────────────────────���──────────────────────

/**
 * Lifecycle status of an observability incident.
 *
 * An incident groups related alerts, errors, and timeline events into
 * a single correlated operational situation.
 */
export enum ObservabilityIncidentStatus {
  /** Incident opened, not yet triaged */
  Open = 'open',

  /** Operator is actively investigating */
  Investigating = 'investigating',

  /** Root cause addressed, pending verification */
  Resolved = 'resolved',

  /** Incident verified closed */
  Closed = 'closed',
}

// ─── Error Event Classification ─────────────────────────────────────────────────

/**
 * Classification of error events surfaced on the error log.
 *
 * Aligns with the provisioning saga failure taxonomy where applicable,
 * and extends to cover non-provisioning admin domains.
 */
export enum ObservabilityErrorClassification {
  /** Transient infrastructure or network failure (likely retriable) */
  Transient = 'transient',

  /** Permission or authorization failure */
  Permissions = 'permissions',

  /** Structural or configuration error (requires code or config fix) */
  Structural = 'structural',

  /** Repeated failure after retries (escalation warranted) */
  Repeated = 'repeated',

  /** Admin-class failure requiring operator intervention */
  AdminClass = 'admin-class',

  /** Unclassified or unknown error */
  Unclassified = 'unclassified',
}

// ─── Error Event Source ─────────────────────────────────────────────────────────

/**
 * Source system or layer that produced an error event.
 */
export enum ObservabilityErrorSource {
  /** Provisioning saga execution */
  ProvisioningSaga = 'provisioning-saga',

  /** Admin control-plane run execution */
  AdminRun = 'admin-run',

  /** SharePoint control action */
  SharePointControl = 'sharepoint-control',

  /** Entra / identity control action */
  EntraControl = 'entra-control',

  /** Infrastructure probe failure */
  InfrastructureProbe = 'infrastructure-probe',

  /** Notification dispatch failure */
  NotificationDispatch = 'notification-dispatch',

  /** Configuration governance action */
  ConfigGovernance = 'config-governance',

  /** White-glove device deployment */
  WhiteGloveDeployment = 'white-glove-deployment',
}

// ─── Operator Action Type ───────────���───────────────────────────────────────────

/**
 * Types of operator actions recorded against observability state.
 */
export enum ObservabilityOperatorActionType {
  /** Operator acknowledged an alert */
  AlertAcknowledged = 'alert.acknowledged',

  /** Operator resolved an alert */
  AlertResolved = 'alert.resolved',

  /** Operator escalated an alert or incident */
  Escalated = 'escalated',

  /** Operator triggered a manual probe run */
  ProbeTriggered = 'probe.triggered',

  /** Operator opened an incident from one or more alerts */
  IncidentOpened = 'incident.opened',

  /** Operator resolved an incident */
  IncidentResolved = 'incident.resolved',

  /** Operator closed an incident */
  IncidentClosed = 'incident.closed',

  /** Operator dismissed an error event */
  ErrorDismissed = 'error.dismissed',
}

// ─── Timeline Item Kind ─────────────────────────────────────────────────────────

/**
 * Discriminant for items in a correlated observability timeline.
 */
export enum ObservabilityTimelineItemKind {
  /** An audit event from the admin audit spine */
  AuditEvent = 'audit-event',

  /** An alert evaluation result */
  Alert = 'alert',

  /** An error event */
  Error = 'error',

  /** A probe snapshot result */
  ProbeSnapshot = 'probe-snapshot',

  /** An operator action */
  OperatorAction = 'operator-action',
}
