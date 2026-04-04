# @hbc/features-admin

Admin Intelligence feature package for HB Intel — monitors, infrastructure probes, approval authority management, and administrative dashboards.

## Overview

This package provides the Admin Intelligence layer for HB Intel, enabling platform administrators to monitor infrastructure health, manage approval workflows, and respond to operational alerts.

**Boundary**: This package is the reusable admin intelligence layer — monitors, probes, hooks, APIs, and dashboard components. It is **not** the privileged control plane. Privileged execution, durable orchestration, retry/compensation, audit persistence, hybrid identity workflows, and Phase 10 standards/configuration governance services belong in `backend/functions`. The Phase 10 Standards & Configuration lane (`/standards-config`) lives in `apps/admin` — this package has no config governance role. See the [Phase 1 boundary matrix](../../docs/architecture/plans/MASTER/spfx/admin/phase-01/admin-spfx-boundary-matrix.md) and [locked decisions](../../docs/architecture/plans/MASTER/spfx/admin/phase-01/admin-spfx-locked-decisions-and-phase-boundary-guards.md) (LD-03).

**Contract alignment**: This package may import shared types from `@hbc/models/admin-control-plane` for type alignment (e.g., correlating alerts to run IDs). It must not implement control-plane runtime, orchestrator logic, or adapter execution. See the [package placement map](../../docs/architecture/plans/MASTER/spfx/admin/phase-02/admin-control-plane-package-placement-and-boundary-map.md).

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
  emailRelay: 'alert-relay@example.com',
});
const event = adapter.dispatch(alert);
```

### Current limitations (post Phase 12)

**Resolved by Phase 12:**
- Alert and probe stores are now backed by durable Azure Table Storage persistence via backend observability APIs (P12-04, P12-05). The in-memory `AdminAlertsApi` and `InfrastructureProbeApi` remain as local caches; durable state lives in the backend `ObservabilityAlerts` and `ObservabilityProbeSnapshots` tables.
- `ErrorLogPage` is now a real observability surface querying the backend error store (P12-08). Lane status upgraded from scaffold to active.
- `overdueProvisioningMonitor` is now live — 3 of 6 monitors are wired with real data providers (P12-06).
- Deferred probes (`search`, `notification`, `module-record-health`) now return `unknown` status instead of misleading `healthy` (P12-06).
- Alert `resolve()` action added alongside `acknowledge()` (P12-09).
- Teams webhook dispatch now includes delivery status tracking (`INotificationDeliveryRecord`), acknowledged-alert suppression, and 5-minute cooldown duplicate suppression (P12-09).

**Still open:**
- Email relay is console-logged only (no SMTP client).
- 3 of 6 monitors remain deferred stubs: `permission-anomaly` (no permission audit source), `upcoming-expiration` (no expiration model), `stale-record` (no freshness metadata). See P12-06 deferral rationale.
- 3 of 5 probes remain deferred: `search` (no Azure Search), `notification` (no health endpoint), `module-record-health` (no integrity queries). See P12-06 deferral rationale.
- `ApprovalAuthorityApi` is a stub — rules are not persisted until SF17-T05.
- Teams webhook delivery is fire-and-forget (no retry queue). Failures are tracked in the delivery log but not retried.

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

## White-Glove Device Deployment

The white-glove feature is implemented across the backend (`backend/functions/src/services/white-glove/` and `backend/functions/src/services/device-management/`) and the admin app (`apps/admin/src/pages/WhiteGlove*.tsx`). This package (`@hbc/features-admin`) does not contain white-glove runtime logic — it remains the admin-intelligence layer (monitors, probes, hooks, dashboards).

White-glove hooks and pages live directly in `apps/admin/` because they consume backend API endpoints specific to the admin operator console. Shared domain types live in `@hbc/models/admin-control-plane`.

**White-glove documentation:**
- [Architecture Index](../../docs/architecture/plans/MASTER/spfx/admin/white-glove/README.md)
- [Developer Guide](../../docs/how-to/developer/white-glove-development-guide.md)
- [IT Tenant Prerequisites](../../docs/maintenance/white-glove-tenant-prerequisites.md)

## Related

- [SF17 Admin Intelligence Plan](../../docs/architecture/plans/shared-features/SF17-Admin-Intelligence.md)
- [SF17-T09 Testing and Deployment](../../docs/architecture/plans/shared-features/SF17-T09-Testing-and-Deployment.md)
- [ADR-0106 — Admin Intelligence Layer](../../docs/architecture/adr/ADR-0106-admin-intelligence-layer.md)
- [Admin Intelligence Adoption Guide](../../docs/how-to/developer/admin-intelligence-adoption-guide.md)
- [Admin Intelligence API Reference](../../docs/reference/admin-intelligence/api.md)
- [HB Intel Blueprint V4](../../docs/architecture/blueprint/HB-Intel-Blueprint-V4.md)
