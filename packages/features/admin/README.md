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

## Related

- [SF17 Admin Intelligence Plan](../../docs/architecture/plans/shared-features/SF17-Admin-Intelligence.md)
- [HB Intel Blueprint V4](../../docs/architecture/blueprint/HB-Intel-Blueprint-V4.md)
