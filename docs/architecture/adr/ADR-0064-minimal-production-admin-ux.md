# ADR-0064: Minimal Production Admin UX

- **Status:** Accepted
- **Date:** 2026-03-06
- **Phase:** 5.11 (Minimal Production Admin UX)
- **Related Plans:** `docs/architecture/plans/PH5.11-Auth-Shell-Plan.md`, `docs/architecture/plans/PH5-Auth-Shell-Plan.md`

## Context

Phase 5.11 requires a production-usable but intentionally narrow admin experience for access-control operations. Phase 5.10 already established the richer app-owned backend/rules model for roles, overrides, reviews, and policy settings. The Phase 5.11 UX must consume that model, support core review/approval operations, and remain expandable without backend redesign.

## Decision

1. Implement a shared admin module in `@hbc/auth` (`packages/auth/src/admin/`) containing:
   - repository interfaces
   - in-memory repository adapter
   - deterministic workflow handlers
   - data-loading hooks
   - sectioned admin UI surface (`AdminAccessControlPage`)
2. Deliver minimum required Phase 5.11 capabilities in one sectioned route experience:
   - user lookup
   - role/access lookup
   - override request review
   - approval/rejection actions
   - expiration/renewal handling
   - role-change impact review queue
   - emergency access review queue
   - basic audit visibility
3. Wire the shared admin module to both runtime surfaces:
   - PWA `/admin`
   - `apps/admin` routes (including compatibility aliases)
4. Enforce admin route access checks via explicit route guards requiring `admin:access-control:view` or wildcard permission.
5. Keep persistence abstracted behind repository contracts in Phase 5.11; production backend adapters remain a future extension.

## Consequences

### Positive

- Phase 5 now has production-usable core admin access workflows without waiting for a full governance workspace.
- Admin workflow logic is centralized and deterministic, with explicit typed command/result contracts.
- PWA and admin-hosted surfaces share one operational model while preserving environment boundaries.
- Future backend/persistence and richer UX can be added without redesigning base role/override models.

### Tradeoffs

- UX is intentionally limited to minimum required operations and does not include advanced insights.
- In-memory adapter is a bridge implementation; persistence integration is deferred.

## Deferred Expansion (Explicit)

- Broader admin dashboards
- Richer analytics and anomaly insights
- Request tracking/history timelines
- Notification/alerting workflows
- Advanced reporting/export surfaces

## Traceability

- `docs/architecture/plans/PH5.11-Auth-Shell-Plan.md` §5.11 items 1-5
- `docs/architecture/plans/PH5-Auth-Shell-Plan.md` locked Option C admin/governance decisions
- `docs/architecture/blueprint/HB-Intel-Blueprint-V4.md` §§1e, 1f, 2b, 2c, 2e
- Builds on Phase 5.10 backend model and ADR-0063
