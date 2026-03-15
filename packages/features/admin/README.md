# @hbc/features-admin

Admin Intelligence feature package for HB Intel — monitors, infrastructure probes, approval authority management, and administrative dashboards.

## Overview

This package provides the Admin Intelligence layer for HB Intel, enabling platform administrators to monitor infrastructure health, manage approval workflows, and respond to operational alerts.

## Architecture

The package follows the ports-and-adapters pattern established across HB Intel:

- **Types** — Domain interfaces (`IAdminAlert`, `IInfrastructureProbe`, `IApprovalAuthorityRule`)
- **Monitors** — Event-driven monitors that detect operational anomalies
- **Probes** — Infrastructure health probes that verify service availability
- **API** — Adapter layer for backend communication
- **Hooks** — React hooks for state access
- **Components** — UI components for admin dashboards

## G6 Alert & Monitoring

### Dependency injection for monitors

Monitors that need provisioning data accept an `IProvisioningDataProvider` via factory functions. This preserves the package boundary — `@hbc/features-admin` never imports `@hbc/provisioning` directly.

```typescript
import { createDefaultMonitorRegistry } from '@hbc/features-admin';
import type { IProvisioningDataProvider } from '@hbc/features-admin';

// Wire with your provisioning API client
const provider: IProvisioningDataProvider = {
  listRequests: (state) => apiClient.listRequests(state),
  listProvisioningRuns: (status) => apiClient.listProvisioningRuns(status),
};

const registry = createDefaultMonitorRegistry(provider);
const alerts = await registry.runAll(new Date().toISOString());
```

### AdminAlertsApi (in-memory store)

```typescript
import { AdminAlertsApi } from '@hbc/features-admin';

const api = new AdminAlertsApi();
api.ingestAlerts(alerts);                          // write from monitor runs
const active = await api.listActive();             // read unacknowledged/unresolved
await api.acknowledge('alert-id', 'admin@co.com'); // mark acknowledged
```

### TeamsWebhookDispatchAdapter

```typescript
import { TeamsWebhookDispatchAdapter } from '@hbc/features-admin';

const adapter = new TeamsWebhookDispatchAdapter({
  webhookUrl: process.env.TEAMS_WEBHOOK_URL,
  emailRelay: 'hbtech@hedrickbrothers.com',
});
const event = adapter.dispatch(alert);
```

### Wave 0 known limitations

- Alert store is in-memory only — does not persist across page reloads. SharePoint-list–backed persistence (`HBC_AdminAlerts`) is the Wave 1 target.
- Teams webhook delivery is best-effort fire-and-forget.
- Email relay is console-logged only (no SMTP client in Wave 0).
- Only `provisioning-failure` and `stuck-workflow` monitors are wired; remaining four monitors are P3/deferred stubs.
- Probe snapshot store is in-memory only — SharePoint-list–backed persistence (`HBC_InfrastructureProbeSnapshots`) is the Wave 1 target.
- Only `azure-functions` and `sharepoint-infrastructure` probes have live connections; remaining three probes (`search`, `notification`, `module-record-health`) are deferred stubs.
- `ErrorLogPage` is intentionally deferred (SF17-T05) with a clear empty state.
- `ApprovalAuthorityApi` is a stub — rules are not persisted until SF17-T05.

## Installation

```bash
pnpm add @hbc/features-admin
```

## Usage

```typescript
import {
  useAdminAlerts,
  useInfrastructureProbes,
  AdminAlertDashboard,
} from '@hbc/features-admin';
```

### Testing sub-path

```typescript
import {
  createMockAdminAlert,
  createMockProbeSnapshot,
  mockAdminIntelligenceStates,
} from '@hbc/features-admin/testing';
```

## Development

```bash
pnpm --filter @hbc/features-admin build        # Build
pnpm --filter @hbc/features-admin check-types   # Type-check
pnpm --filter @hbc/features-admin test           # Run tests
pnpm --filter @hbc/features-admin test:coverage  # Run tests with coverage
pnpm --filter @hbc/features-admin lint           # Lint
```

## Exports

| Category | Exports |
|----------|---------|
| Types | `AlertSeverity`, `AlertCategory`, `ProbeHealthStatus`, `ApprovalContext`, `IAdminAlert`, `IAdminAlertBadge`, `IInfrastructureProbeResult`, `IInfrastructureProbe`, `IProbeSnapshot`, `IApprovalAuthorityRule`, `IApprovalEligibilityResult`, `UseAdminAlertsResult`, `UseInfrastructureProbesResult`, `UseApprovalAuthorityResult`, `IAlertMonitor`, `IInfrastructureProbeDefinition`, `NotificationRoute`, `IProvisioningDataProvider`, `ProbeConnectionConfig` |
| Constants | `ADMIN_ALERTS_POLL_MS`, `PROBE_SCHEDULER_DEFAULT_MS`, `PROBE_MAX_RETRY`, `PROBE_STALENESS_MS`, `ADMIN_RETRY_CEILING`, `APPROVAL_RULE_LIST_TITLE`, `ADMIN_ALERT_LIST_TITLE`, `INFRA_PROBE_LIST_TITLE`, `ADMIN_ALERTS_QUERY_KEY`, `INFRA_PROBES_QUERY_KEY`, `APPROVAL_RULES_QUERY_KEY` |
| Monitors | `MonitorRegistry`, `provisioningFailureMonitor`, `createProvisioningFailureMonitor`, `permissionAnomalyMonitor`, `stuckWorkflowMonitor`, `createStuckWorkflowMonitor`, `overdueProvisioningMonitor`, `upcomingExpirationMonitor`, `staleRecordMonitor`, `routeAlert`, `createDefaultMonitorRegistry` |
| Probes | `ProbeScheduler`, `sharePointProbe`, `createSharePointProbe`, `azureFunctionsProbe`, `createAzureFunctionsProbe`, `searchProbe`, `notificationProbe`, `moduleRecordHealthProbe`, `createDefaultProbeScheduler` |
| API | `ApprovalAuthorityApi`, `AdminAlertsApi`, `InfrastructureProbeApi` |
| Hooks | `useAdminAlerts`, `useInfrastructureProbes`, `useApprovalAuthority`, `computeAlertBadge`, `buildProbeStatusMap`, `resolveEligibility` |
| Integrations | `ReferenceBicNextMoveAdapter`, `ReferenceNotificationDispatchAdapter`, `ReferenceAcknowledgmentAdapter`, `ReferenceGovernanceSnapshotAdapter`, `ReferenceComplexityGatingAdapter`, `TeamsWebhookDispatchAdapter` |
| Components | `AdminAlertBadge`, `AdminAlertDashboard`, `ImplementationTruthDashboard`, `ApprovalAuthorityTable`, `ApprovalRuleEditor` |
| Testing | `createMockAdminAlert`, `createMockProbeResult`, `createMockProbeSnapshot`, `createMockApprovalAuthorityRule`, `mockAdminIntelligenceStates` |

## Boundary Rules

- Admin-intelligence lives within `@hbc/features-admin`; no standalone package (ADR-0106 D-01)
- No direct imports from other `packages/features/*` packages at runtime
- Approval writes only through `ApprovalAuthorityApi` — no direct storage access
- Monitor and probe engines are isolated from UI component concerns
- Components use app-shell-safe composition only (D-09)
- Testing sub-path (`@hbc/features-admin/testing`) is excluded from production bundle
- ESLint boundary rules enforced via `@hb-intel/eslint-plugin-hbc`

## Related

- [SF17 Admin Intelligence Plan](../../docs/architecture/plans/shared-features/SF17-Admin-Intelligence.md)
- [SF17-T09 Testing and Deployment](../../docs/architecture/plans/shared-features/SF17-T09-Testing-and-Deployment.md)
- [ADR-0106 — Admin Intelligence Layer](../../docs/architecture/adr/ADR-0106-admin-intelligence-layer.md)
- [Admin Intelligence Adoption Guide](../../docs/how-to/developer/admin-intelligence-adoption-guide.md)
- [Admin Intelligence API Reference](../../docs/reference/admin-intelligence/api.md)
- [HB Intel Blueprint V4](../../docs/architecture/blueprint/HB-Intel-Blueprint-V4.md)
