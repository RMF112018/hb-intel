# White-Glove Connections and Readiness UX

## Purpose

Document the SPFx operator console pages for white-glove connector configuration, health monitoring, and environment readiness.

## Pages

### White-Glove Connections (`/white-glove/connections`)

Displays all white-glove device management connectors with:
- Connector name and class
- Health status badge (healthy / unhealthy / untested)
- Configuration version
- Credential presence (configured / not set — value never displayed)
- Last test result and timestamp
- Policy toggle badges (enabled, dry-run only, production allowed)
- "Test Connection" action per connector
- "Refresh" action to reload connector list

**Data source:** `GET /api/admin/connections` filtered to white-glove connector classes.

**Test action:** `POST /api/admin/connections/{connectorId}/test` — updates health status, auto-refreshes list.

### White-Glove Readiness (`/white-glove/readiness`)

Summarizes environment readiness with:
- Overall readiness verdict (Ready / Not Ready)
- Blocking failure count
- Connector status section (per-connector pass/fail)
- Missing connector detection
- Package template completeness
- Run store availability
- "Run Readiness Check" action

**Data source:** Aggregates `GET /api/admin/connections` with client-side readiness evaluation.

## Routing

| Lane ID | Path | Label | Order | Status |
|---------|------|-------|-------|--------|
| `white-glove-connections` | `/white-glove/connections` | WG Connections | 9 | active |
| `white-glove-readiness` | `/white-glove/readiness` | WG Readiness | 10 | active |

Both lanes are permission-gated with `admin:access-control:view` and lazy-loaded.

## Hooks

| Hook | File | Purpose |
|------|------|---------|
| `useWhiteGloveConnections` | `apps/admin/src/hooks/useWhiteGloveConnections.ts` | Fetch/filter connectors, test action |
| `useWhiteGloveReadiness` | `apps/admin/src/hooks/useWhiteGloveReadiness.ts` | Aggregate readiness checks |

## UI patterns used

- `WorkspacePageShell` for page layout
- `HbcCard` for connector cards and readiness verdict
- `HbcStatusBadge` for health/status indicators (via `label` prop)
- `HbcBanner` for error messages and informational notices
- `HbcTypography` for headings and text
- `HbcButton` for actions
- `makeStyles` with HBC spacing tokens for layout

## Security boundaries

- No secrets exposed in SPFx — `hasCredential` boolean only
- All connector operations through backend API endpoints
- Permission gating via `adminBeforeLoad` on all routes
- Token-based API authentication via `createSessionTokenFactory`

## Cross-references

- [Architecture baseline](white-glove-architecture-baseline.md)
- [Connector governance](../../../../../reference/configuration/white-glove-connector-governance.md)
- [Run spine](../../../../../reference/white-glove/white-glove-run-spine.md)
