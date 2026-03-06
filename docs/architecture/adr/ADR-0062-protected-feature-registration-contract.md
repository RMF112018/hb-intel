# ADR-0062: Protected Feature Registration Contract

- **Status:** Accepted
- **Date:** 2026-03-06
- **Phase:** 5.9 (Protected Feature Registration Contract)
- **Related Plans:** `docs/architecture/plans/PH5.9-Auth-Shell-Plan.md`, `docs/architecture/plans/PH5-Auth-Shell-Plan.md`

## Context

Phase 5.9 requires HB Intel to prevent protected features from self-wiring directly into shell access patterns. Protected features must register through a standard, centralized contract so route visibility, permissions, locked/discoverable behavior, and compatibility metadata are governed consistently. The phase also requires a practical enforcement mechanism and a documented extension seam for exceptional features without implementing broader future behavior now.

## Decision

1. Create a shell-owned contract module `packages/shell/src/featureRegistration.ts` with canonical registration metadata:
   - feature identifier
   - route metadata
   - navigation visibility metadata
   - required feature-level permissions
   - required action-level permissions
   - locked/discoverable visibility designation
   - shell/runtime compatibility metadata
2. Add centralized contract validators/builders and registry helpers:
   - `validateProtectedFeatureRegistration`
   - `defineProtectedFeatureRegistration`
   - `createProtectedFeatureRegistry`
   - `assertProtectedFeatureRegistered`
3. Add explicit extension seam (`extensionPath`) for exceptional feature integration, documented as deferred behavior for later phases.
4. Preserve auth default-deny behavior while adding practical registration enforcement helper (`isProtectedFeatureRegistered`) in centralized permission resolution flow.
5. Add practical automated enforcement via lint/boundary restriction:
   - new ESLint rule `@hb-intel/hbc/require-feature-registration-contract`
   - enabled for `apps/**` in root lint configuration.
6. Add typed shell-to-auth adapters so one registration vocabulary is maintained (`toFeaturePermissionRegistration(s)`).

## Consequences

### Positive

- Protected feature access wiring is centralized and consistent across shell/auth layers.
- Default-deny behavior remains intact and auditable for unregistered features.
- Route/nav/permission/visibility compatibility metadata is standardized and reusable.
- Practical lint/boundary checks reduce drift from Option C registration governance.

### Tradeoffs

- Teams must register protected features before integrating guard/access checks.
- Exceptional feature handling remains metadata-only in this phase (no advanced runtime semantics yet).

## Deferred Expansion Path

The extension seam is intentionally limited in Phase 5.9. Future phases may add:
- richer extension behavior tied to `extensionPath.extensionKey`
- feature-specific lifecycle hooks
- advanced registration-time validation against backend governance catalogs

These expansions are deferred and not implemented in Phase 5.9.

## Traceability

- `docs/architecture/plans/PH5.9-Auth-Shell-Plan.md` §5.9 items 1-4
- `docs/architecture/plans/PH5-Auth-Shell-Plan.md` §5.9 locked Option C decisions
- `docs/architecture/blueprint/HB-Intel-Blueprint-V4.md` §§1e, 1f, 2b, 2c, 2e
