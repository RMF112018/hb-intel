# Admin Intelligence Adoption Guide

> **Doc Classification:** Living Reference (Diataxis) — How-to quadrant; developer audience; `@hbc/features-admin` admin-intelligence module adoption.

This guide covers integrating the Admin Intelligence layer from `@hbc/features-admin` into HB Intel feature packages and admin surfaces.

---

## 1. Registering and Tuning Alert Monitors

Alert monitors detect operational anomalies and produce `IAdminAlert` records. The `MonitorRegistry` manages all active monitors:

```tsx
import {
  MonitorRegistry,
  createDefaultMonitorRegistry,
  provisioningFailureMonitor,
  permissionAnomalyMonitor,
} from '@hbc/features-admin';

// Use the default registry with all six built-in monitors
const registry = createDefaultMonitorRegistry();

// Or build a custom registry with selected monitors
const custom = new MonitorRegistry();
custom.register(provisioningFailureMonitor);
custom.register(permissionAnomalyMonitor);
```

The six built-in monitors cover: provisioning failure, permission anomaly, stuck workflow, overdue provisioning, upcoming expiration, and stale record. Each monitor declares its `AlertSeverity` and `AlertCategory`.

To route alerts to notification channels, use `routeAlert`:

```tsx
import { routeAlert } from '@hbc/features-admin';

const route = routeAlert(alert);
// route.immediate — true for critical/high severity
// route.digest — true for medium/low severity
```

---

## 2. Implementing and Scheduling Infrastructure Probes

Infrastructure probes verify service availability and produce `IProbeSnapshot` records. The `ProbeScheduler` manages probe execution:

```tsx
import {
  ProbeScheduler,
  createDefaultProbeScheduler,
  sharePointProbe,
  azureFunctionsProbe,
  PROBE_SCHEDULER_DEFAULT_MS,
} from '@hbc/features-admin';

// Default scheduler with all five probes on 15-minute cadence
const scheduler = createDefaultProbeScheduler();

// Or create a custom scheduler
const custom = new ProbeScheduler({ intervalMs: 60_000 });
custom.register(sharePointProbe);
custom.register(azureFunctionsProbe);
```

The five built-in probes cover: SharePoint, Azure Functions, Search, Notification service, and Module Record Health. Each probe returns an `IInfrastructureProbeResult` with a `ProbeHealthStatus` (`healthy | degraded | down | unknown`).

---

## 3. Integrating Badge, Dashboard, and Truth-Layer Views

Three UI components provide admin-intelligence surfaces at different complexity tiers:

### AdminAlertBadge (Essential tier)

```tsx
import { AdminAlertBadge, useAdminAlerts } from '@hbc/features-admin';

function AdminNav() {
  const { badge } = useAdminAlerts();
  return <AdminAlertBadge badge={badge} />;
}
```

### AdminAlertDashboard (Standard tier)

```tsx
import { AdminAlertDashboard, useAdminAlerts } from '@hbc/features-admin';

function AlertsPage() {
  const alerts = useAdminAlerts();
  return <AdminAlertDashboard {...alerts} />;
}
```

### ImplementationTruthDashboard (Expert tier)

```tsx
import {
  ImplementationTruthDashboard,
  useInfrastructureProbes,
} from '@hbc/features-admin';

function TruthPage() {
  const probes = useInfrastructureProbes();
  return <ImplementationTruthDashboard {...probes} />;
}
```

All components use app-shell-safe composition (D-09) and are suitable for SPFx surfaces.

---

## 4. Configuring Approval Authority Rules and Testing Eligibility

Approval authority rules define who can approve actions in specific contexts. The `ApprovalAuthorityApi` manages rules and resolves approvers:

```tsx
import {
  ApprovalAuthorityApi,
  useApprovalAuthority,
  type IApprovalAuthorityRule,
  type ApprovalContext,
} from '@hbc/features-admin';

// Query rules and eligibility via the hook
function ApprovalAdmin() {
  const { rules, eligibility, createRule, updateRule, deleteRule } =
    useApprovalAuthority();
  // ...
}

// Resolve approvers programmatically
const api = new ApprovalAuthorityApi();
const result = await api.getApprovers({ module: 'accounting', action: 'submit' });
```

The `ApprovalAuthorityTable` and `ApprovalRuleEditor` components provide admin UX for rule management:

```tsx
import {
  ApprovalAuthorityTable,
  ApprovalRuleEditor,
} from '@hbc/features-admin';
```

---

## 5. Integrating with Acknowledgment and Notification-Intelligence

Admin Intelligence integrates with platform primitives through adapter interfaces:

### Notification dispatch

```tsx
import {
  ReferenceNotificationDispatchAdapter,
  type INotificationDispatchAdapter,
} from '@hbc/features-admin';

// The reference adapter routes critical/high alerts as immediate notifications
// and medium/low alerts to digest flow via notification-intelligence
const dispatcher = new ReferenceNotificationDispatchAdapter();
```

### Acknowledgment approval resolution

```tsx
import {
  ReferenceAcknowledgmentAdapter,
  type IAcknowledgmentApprovalAdapter,
} from '@hbc/features-admin';

// Resolves approval parties from approval authority rules
const adapter = new ReferenceAcknowledgmentAdapter();
```

### BIC next-move context

```tsx
import {
  ReferenceBicNextMoveAdapter,
  type IBicNextMoveAdapter,
} from '@hbc/features-admin';
```

### Governance snapshot

```tsx
import {
  ReferenceGovernanceSnapshotAdapter,
  type IGovernanceSnapshotAdapter,
} from '@hbc/features-admin';
```

### Complexity gating

```tsx
import {
  ReferenceComplexityGatingAdapter,
  type IAdminComplexityGatingAdapter,
} from '@hbc/features-admin';
```

---

## 6. Using Testing Fixtures from `@hbc/features-admin/testing`

The testing sub-path provides canonical fixtures for unit and integration tests:

```tsx
import {
  createMockAdminAlert,
  createMockProbeResult,
  createMockProbeSnapshot,
  createMockApprovalAuthorityRule,
  mockAdminIntelligenceStates,
} from '@hbc/features-admin/testing';

// Create a mock alert with optional overrides
const alert = createMockAdminAlert({ severity: 'critical', category: 'provisioning-failure' });

// Create mock probe results and snapshots
const result = createMockProbeResult({ status: 'healthy' });
const snapshot = createMockProbeSnapshot();

// Create mock approval rules
const rule = createMockApprovalAuthorityRule({ module: 'accounting' });

// Access predefined state combinations for component testing
const { idle, loading, error, withAlerts, withProbes } = mockAdminIntelligenceStates;
```

All fixtures produce valid contract-compliant objects suitable for snapshot testing and component rendering.
