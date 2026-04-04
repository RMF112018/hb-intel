# @hbc/spfx-admin

Admin SPFx web part for HB Intel — the **operator console** for the IT Control Center.

This app is the human-facing shell where authorized admins observe, initiate, and manage IT control actions. It is **not** the privileged executor — privileged and long-running work belongs in the backend control plane (`backend/functions`). See the [Phase 1 architecture baseline](../../docs/architecture/plans/MASTER/spfx/admin/phase-01/admin-spfx-phase-1-architecture-baseline.md) for the full operating model.

**Contract consumption**: This app consumes shared admin control-plane contracts from `@hbc/models/admin-control-plane` for type-safe API calls and display. It does not own or define those contracts. See the [package placement map](../../docs/architecture/plans/MASTER/spfx/admin/phase-02/admin-control-plane-package-placement-and-boundary-map.md).

## Operator Console

The admin app is organized as an 8-lane operator console (Phase 5). The **landing page** (`/`) shows an overview grid of all workflow lanes. Eight lanes have active content: Setup (preflight + install wizard), Runs (provisioning oversight), SharePoint Control (drift detection, preview, repair, posture), Hybrid Identity (user lifecycle, connection management, audit history), Config (access control), Health (operational dashboard), Errors (observability error log — Phase 12), and the landing page itself. One lane remains a scaffold (Validation — Phase 7).

### Hybrid Identity (Phase 9)

The `/entra` lane provides authority-aware identity administration with 5 tabs: Overview (live connection status), Users (search, create, enable/disable, delete with risk-aware execution), Groups (search; lifecycle actions pending backend endpoints), Connections (AD DS and Graph connector setup/test/rotate), and History (audit trail). Actions are risk-tiered (routine/elevated/destructive) with appropriate confirmation flows. AD DS mutations show sync-pending state. Connection preflight banners block operations when connectors are unhealthy. See the [Phase 9 docs](../../docs/architecture/plans/MASTER/spfx/admin/phase-09/README.md).

Navigation is lane-driven — the shell renders all 8 lane buttons derived from the canonical lane registry (`src/router/lane-registry.ts`). Active lanes appear at full opacity; scaffold lanes appear dimmed. The alert badge on the Health lane is preserved.

### Lanes

| Route | Lane | Page | Status |
|-------|------|------|--------|
| `/` | — | Operator Landing | Active — control-center overview with lane grid |
| `/setup` | Setup / Install | SetupWizardPage | Active — preflight review, install launch, run tracking |
| `/setup/run/$runId` | Setup / Install | InstallRunDetailPage | Active — step progress, checkpoint actions, verification |
| `/setup/bindings` | Setup / Install | BindingStatusPage | Active — app-binding status, verification, and repair (Phase 6A) |
| `/validation` | Validation | ValidationLanePage | Scaffold — Phase 7 |
| `/runs` | Runs / History | ProvisioningOversightPage | Active — monitor, retry, escalate, archive provisioning runs |
| `/sharepoint` | SharePoint Control | SharePointControlPage | Active — drift detection, preview, repair, posture (Phase 8) |
| `/entra` | Hybrid Identity | EntraLanePage | Active — hybrid identity administration (Phase 9) |
| `/config` | Standards / Config | SystemSettingsPage | Active — access control and approval authority configuration |
| `/health` | Health / Alerts | OperationalDashboardPage | Active — alert summary, probe health, infrastructure status |
| `/errors` | Error / Audit | ErrorLogPage | Active — observability error log (Phase 12) |

### Legacy redirects (backward compatibility)

| Old route | Redirects to | Reason |
|-----------|-------------|--------|
| `/provisioning-failures` | `/runs` (preserves `?projectId=`) | Cross-app deep links from Accounting and Estimating |
| `/dashboards` | `/health` | Bookmarks and internal links |
| `/error-log` | `/errors` | Bookmarks and internal links |

## Development

```bash
pnpm --filter @hbc/spfx-admin dev             # Dev server (port 4006)
pnpm --filter @hbc/spfx-admin build           # Type-check + build
pnpm --filter @hbc/spfx-admin lint            # Lint
pnpm --filter @hbc/spfx-admin test            # Run tests
pnpm --filter @hbc/spfx-admin test:coverage   # Run tests with coverage
```

## Alert and Probe Polling

The admin app runs two background polling services when a backend URL is configured:

- **AlertPollingService** (`services/alertPollingService.ts`) — polls for active provisioning alerts at a configurable interval. Drives the failures inbox badge count and alert summary on the Operational Dashboards page.
- **useProbePolling** (`hooks/useProbePolling.ts`) — polls infrastructure health probes (Azure Functions, SharePoint) and surfaces results on the dashboards page.

Both services skip polling when no backend URL is configured (dev-harness without backend), preventing DOCTYPE parse errors from HTML fallback responses.

## Phase 12 Observability Surfaces

The Error Log page (`/errors`) was implemented in Phase 12 (P12-08) and is now an active lane. It queries the backend observability error store via `useObservabilityErrors` from `@hbc/features-admin`, supports domain/severity/classification filtering via `HbcSelect`, and renders error event cards with severity badges and correlation metadata. The Health dashboard (`/health`) continues to render alert and probe dashboards with durable backend-backed data.

### Deferred pages

The Validation lane (`/validation`) remains a scaffold deferred to Phase 7.

## Dependencies

- `@hbc/ui-kit` — design system components
- `@hbc/smart-empty-state` — classification-aware empty state rendering
- `@hbc/auth` — authentication, permissions, access control
- `@hbc/shell` — navigation and workspace management
- `@hbc/provisioning` — provisioning API client and store
- `@hbc/models` — shared type definitions
- `@hbc/complexity` — complexity tier gating
- `@hbc/data-access` — data access utilities
- `@hbc/query-hooks` — TanStack Query hooks
