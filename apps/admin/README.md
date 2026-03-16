# @hbc/spfx-admin

Admin Intelligence SPFx web part for HB Intel — system settings, provisioning oversight, and administrative dashboards.

## Pages

| Route | Page | Status |
|-------|------|--------|
| `/` | System Settings | Active — access control and configuration |
| `/provisioning-failures` | Provisioning Oversight | Active — monitor, retry, escalate, archive provisioning runs |
| `/dashboards` | Operational Dashboards | Active — alert summary, probe health, infrastructure status |
| `/error-log` | Error Log | Deferred — SF17-T05 |

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

## Deferred Pages

### Error Log (SF17-T05)

The Error Log page is intentionally deferred. It renders a clear `HbcSmartEmptyState` from `@hbc/smart-empty-state` so the route never appears blank. All admin alert and monitoring functionality is available in the Provisioning Oversight dashboard.

Tracked in: SF17-T05 (error logging and audit trail).

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
