# @hbc/features-admin — API Reference

> **Doc Classification:** Living Reference (Diataxis) — Reference quadrant; developer audience; `@hbc/features-admin` admin-intelligence API reference.

Complete export reference for the `@hbc/features-admin` package. All symbols are available from `'@hbc/features-admin'` unless noted otherwise.

---

## Types

| Export | Kind | Description |
|--------|------|-------------|
| `AlertSeverity` | Type | `'critical' \| 'high' \| 'medium' \| 'low'` |
| `AlertCategory` | Type | Six monitored admin condition categories |
| `ProbeHealthStatus` | Type | `'healthy' \| 'degraded' \| 'down' \| 'unknown'` |
| `ApprovalContext` | Type | Context object for approval resolution (`module`, `action`, etc.) |
| `IAdminAlert` | Interface | Alert record with severity, category, source, timestamps, acknowledge/resolve state |
| `IAdminAlertBadge` | Interface | Badge summary: total count, critical count, highest severity |
| `IInfrastructureProbeResult` | Interface | Single probe execution result with status, latency, error detail |
| `IInfrastructureProbe` | Interface | Probe definition with `probeKey`, `execute`, health-check contract |
| `IProbeSnapshot` | Interface | Point-in-time snapshot of all probe results with aggregate health |
| `IApprovalAuthorityRule` | Interface | Approval policy rule: module, action, approvers (user/group), `any\|all` mode |
| `IApprovalEligibilityResult` | Interface | Eligibility evaluation result with resolved approvers and status |
| `UseAdminAlertsResult` | Type | Return type for `useAdminAlerts` hook |
| `UseInfrastructureProbesResult` | Type | Return type for `useInfrastructureProbes` hook |
| `UseApprovalAuthorityResult` | Type | Return type for `useApprovalAuthority` hook |
| `IAlertMonitor` | Interface | Monitor definition with detection logic and auto-resolve criteria |
| `IInfrastructureProbeDefinition` | Interface | Probe registration definition for `ProbeScheduler` |
| `NotificationRoute` | Type | Routing decision for alert notifications (immediate vs. digest) |

## Constants

| Export | Description |
|--------|-------------|
| `ADMIN_ALERTS_POLL_MS` | Default polling interval for alert refresh |
| `PROBE_SCHEDULER_DEFAULT_MS` | Default probe schedule cadence (15 minutes) |
| `PROBE_MAX_RETRY` | Maximum retry attempts for failed probes |
| `APPROVAL_RULE_LIST_TITLE` | Display title for approval rule lists |
| `ADMIN_ALERT_LIST_TITLE` | Display title for alert lists |
| `INFRA_PROBE_LIST_TITLE` | Display title for infrastructure probe lists |
| `ADMIN_ALERTS_QUERY_KEY` | TanStack Query key for admin alerts |
| `INFRA_PROBES_QUERY_KEY` | TanStack Query key for infrastructure probes |
| `APPROVAL_RULES_QUERY_KEY` | TanStack Query key for approval rules |

## Monitors

| Export | Kind | Description |
|--------|------|-------------|
| `MonitorRegistry` | Class | Registry for alert monitors — register, unregister, evaluate all |
| `provisioningFailureMonitor` | Monitor | Detects provisioning saga failures |
| `permissionAnomalyMonitor` | Monitor | Detects unexpected permission changes |
| `stuckWorkflowMonitor` | Monitor | Detects workflows exceeding SLA time |
| `overdueProvisioningMonitor` | Monitor | Detects overdue provisioning tasks |
| `upcomingExpirationMonitor` | Monitor | Detects approaching expiration deadlines |
| `staleRecordMonitor` | Monitor | Detects stale/abandoned draft records |
| `routeAlert` | Function | Routes an alert to immediate or digest notification path |
| `createDefaultMonitorRegistry` | Function | Factory creating a `MonitorRegistry` with all six built-in monitors |

## Probes

| Export | Kind | Description |
|--------|------|-------------|
| `ProbeScheduler` | Class | Scheduled probe executor with retry and degraded-state management |
| `sharePointProbe` | Probe | SharePoint connectivity and list-access health check |
| `azureFunctionsProbe` | Probe | Azure Functions endpoint availability check |
| `searchProbe` | Probe | Azure Cognitive Search service health check |
| `notificationProbe` | Probe | Notification service availability check |
| `moduleRecordHealthProbe` | Probe | Module record integrity and schema validation |
| `createDefaultProbeScheduler` | Function | Factory creating a `ProbeScheduler` with all five built-in probes |

## API

| Export | Kind | Description |
|--------|------|-------------|
| `ApprovalAuthorityApi` | Class | CRUD operations for approval rules; `getApprovers(context)` resolution |
| `AdminAlertsApi` | Class | Alert persistence, acknowledge, and query endpoints |
| `InfrastructureProbeApi` | Class | Probe snapshot persistence and query endpoints |

## Hooks

| Export | Kind | Description |
|--------|------|-------------|
| `useAdminAlerts` | Hook | Alert lifecycle: alerts list, badge summary, acknowledge, polling |
| `useInfrastructureProbes` | Hook | Probe lifecycle: snapshot, status map, refresh, scheduler state |
| `useApprovalAuthority` | Hook | Approval rule CRUD: rules list, eligibility check, create/update/delete |
| `computeAlertBadge` | Function | Derives `IAdminAlertBadge` from an alerts array |
| `buildProbeStatusMap` | Function | Builds a probe-key-to-status map from a snapshot |
| `resolveEligibility` | Function | Evaluates approval eligibility for a given context |

## Integrations

| Export | Kind | Description |
|--------|------|-------------|
| `ReferenceBicNextMoveAdapter` | Class | Reference BIC next-move adapter for admin alert ownership context |
| `ReferenceNotificationDispatchAdapter` | Class | Reference notification dispatch adapter for alert routing |
| `ReferenceAcknowledgmentAdapter` | Class | Reference acknowledgment adapter for approval party resolution |
| `ReferenceGovernanceSnapshotAdapter` | Class | Reference governance snapshot adapter for audit/versioned-record linkage |
| `ReferenceComplexityGatingAdapter` | Class | Reference complexity gating adapter for tier-based surface visibility |
| `IBicBlockingContext` | Interface | BIC blocking context for admin alerts |
| `IBicNextMoveAdapter` | Interface | Adapter contract for BIC next-move integration |
| `IAdminNotificationEvent` | Interface | Notification event payload for alert dispatch |
| `INotificationDispatchAdapter` | Interface | Adapter contract for notification dispatch |
| `IApprovalPartyResolution` | Interface | Resolved approval party result |
| `IAcknowledgmentApprovalAdapter` | Interface | Adapter contract for acknowledgment approval resolution |
| `IGovernanceSnapshotPayload` | Interface | Governance snapshot payload for audit trail |
| `IGovernanceSnapshotAdapter` | Interface | Adapter contract for governance snapshot persistence |
| `AdminComplexityTier` | Type | `'essential' \| 'standard' \| 'expert'` |
| `IAdminComplexityGating` | Interface | Complexity gating evaluation result |
| `IAdminComplexityGatingAdapter` | Interface | Adapter contract for complexity-based surface gating |

## Components

| Export | Kind | Description |
|--------|------|-------------|
| `AdminAlertBadge` | Component | Compact alert badge showing count and highest severity |
| `AdminAlertDashboard` | Component | Full alert dashboard with filtering, acknowledge, severity grouping |
| `ImplementationTruthDashboard` | Component | Infrastructure truth dashboard with probe status, history, diagnostics |
| `ApprovalAuthorityTable` | Component | Approval rules list with status indicators and edit actions |
| `ApprovalRuleEditor` | Component | Approval rule create/edit form with approver selection |

## Testing Exports (`@hbc/features-admin/testing`)

| Export | Kind | Description |
|--------|------|-------------|
| `createMockAdminAlert` | Function | Creates a mock `IAdminAlert` with optional overrides |
| `createMockProbeResult` | Function | Creates a mock `IInfrastructureProbeResult` |
| `createMockProbeSnapshot` | Function | Creates a mock `IProbeSnapshot` with valid probe results |
| `createMockApprovalAuthorityRule` | Function | Creates a mock `IApprovalAuthorityRule` |
| `mockAdminIntelligenceStates` | Object | Predefined admin-intelligence states: `idle`, `loading`, `error`, `withAlerts`, `withProbes` |
