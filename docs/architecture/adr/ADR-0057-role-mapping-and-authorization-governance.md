# ADR-0057: Role Mapping and Authorization Governance

- **Status:** Accepted
- **Date:** 2026-03-06
- **Phase:** 5.4 (Role Mapping and Authorization Governance)
- **Related Plans:** `docs/architecture/plans/PH5.4-Auth-Shell-Plan.md`, `docs/architecture/plans/PH5-Auth-Shell-Plan.md`

## Context

Phase 5.4 requires HB Intel to enforce authorization through a role-mapping layer and standardized governance contracts, not through raw provider semantics in feature code. The platform also requires default-deny for new protected features, restricted feature visibility policy support, and a structured access-denied experience with safe navigation and optional request-access entry points.

## Decision

1. Add a centralized role-mapping module (`packages/auth/src/roleMapping.ts`) that translates provider/context identity into app roles.
2. Integrate role mapping into normalized session creation so `resolvedRoles` are always produced from centralized mapping logic.
3. Standardize the Phase 5.4 action permission vocabulary as:
   - `view`
   - `create`
   - `edit`
   - `approve`
   - `admin`
4. Add protected feature registration and authorization contracts in `@hbc/auth` types:
   - feature id
   - required feature-level grants
   - required action-level grants
   - visibility mode (`hidden` or `discoverable-locked`)
   - runtime compatibility seam
   - future grammar seam (`futureGrammarKey`)
5. Enforce default-deny via centralized evaluators when protected features are unregistered or unmapped.
6. Centralize feature authorization evaluation APIs (`isActionAllowed`, `isFeatureVisible`, `isFeatureAccessible`, `evaluateFeatureAccess`) so features and guards do not recompute authorization truth.
7. Update guard surfaces to consume centralized mapped roles/permissions:
   - `RoleGate` now checks `session.resolvedRoles`
   - `PermissionGate` supports feature-aware action checks
   - `FeatureGate` supports discoverable-locked presentation for strategic restricted features
8. Add a structured `AccessDenied` component with:
   - plain-language explanation
   - safe navigation actions
   - optional request-access callback seam

## Consequences

### Positive

- Authorization semantics are explicit, typed, and centralized.
- Provider-specific identity semantics stay bounded to role-mapping boundaries.
- New protected features are denied by default until explicitly registered/mapped.
- Guard behavior and access-denied UX are consistent across app surfaces.

### Tradeoffs

- Existing features that migrate to registration contracts must supply registration metadata.
- Discoverable-locked behavior introduces an additional UX state that consumers must handle intentionally.
- Unit tests for the new logic are present, but workspace-wide Vitest project initialization currently blocks direct test execution in this environment.

## Traceability

- `docs/architecture/plans/PH5.4-Auth-Shell-Plan.md` §5.4 items 1-7
- `docs/architecture/plans/PH5-Auth-Shell-Plan.md` §5.4 and locked Option C decisions:
  - role mapping independent of raw provider semantics in feature code
  - default deny for new protected features
  - clean roles + explicit exceptions
  - protected feature registration contract seam
- `docs/architecture/blueprint/HB-Intel-Blueprint-V4.md` §§1e, 1f, 2b, 2c, 2e
