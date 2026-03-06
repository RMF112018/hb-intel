# ADR-0063: Access-Control Backend and Data Model

- **Status:** Accepted
- **Date:** 2026-03-06
- **Phase:** 5.10 (Access-Control Backend and Data Model)
- **Related Plans:** `docs/architecture/plans/PH5.10-Auth-Shell-Plan.md`, `docs/architecture/plans/PH5-Auth-Shell-Plan.md`

## Context

Phase 5.10 requires a production-ready authorization backend model where HB Intel owns the role/grant/override governance records as the system of record. Microsoft/SharePoint identity remains upstream identity input only. The phase also requires explicit override lifecycle modeling, deterministic review-flagging on base-role drift, and centralized typed configuration for shell/auth runtime policy.

## Decision

1. Implement a dedicated auth backend model module in `packages/auth/src/backend/accessControlModel.ts` with typed contracts for:
   - base role definitions and grants
   - override review metadata
   - status normalization
   - renewal-state resolution
   - structured access-control audit event records/taxonomy
2. Implement explicit override workflow modeling in `packages/auth/src/backend/overrideRecord.ts`:
   - full override record fields for target user, base role, requested grant/restriction, reason, requester, approver, approval timestamp, expiration, renewal state, emergency/review flags, and active/revoked/archived status
   - guarded lifecycle transition helpers (request, approve, renew, revoke, archive)
3. Implement deterministic drift-review behavior:
   - `getChangedBaseRoleReferences` computes changed base roles by version
   - `markDependentOverridesForRoleReview` sets `reviewRequired=true` on dependent overrides instead of silently rebasing/ignoring
4. Implement central typed shell/auth configuration in `packages/auth/src/backend/configurationLayer.ts`:
   - runtime rules
   - redirect defaults/fallbacks
   - session policy windows
   - access-control policy settings with enforced default-deny invariant
5. Extend `packages/auth/src/types.ts` and `packages/auth/src/index.ts` to expose the Phase 5.10 model/config contracts without introducing feature-level bypass APIs.

## Consequences

### Positive

- Authorization governance data is app-owned and auditable under Option C boundaries.
- Base-role changes produce explicit review obligations for dependent overrides.
- Override lifecycle and policy rules are deterministic and centrally typed.
- Runtime/auth policy defaults and invariants are centrally validated.

### Tradeoffs

- Additional model complexity is introduced before full Phase 5.11+ admin UX.
- Lifecycle helpers remain in-memory contract utilities; persistence orchestration is deferred to downstream backend/admin implementation phases.

## Rejected Alternatives

1. **Provider-owned authorization truth (SharePoint/Microsoft roles as direct SoR):** rejected because it violates locked Option C requirement that HB Intel owns authorization governance data.
2. **Silent override rebasing on base-role changes:** rejected because it hides drift and weakens governance/auditability.
3. **Distributed ad hoc runtime policy configuration in feature modules:** rejected because it fragments enforcement and increases policy drift risk.

## Traceability

- `docs/architecture/plans/PH5.10-Auth-Shell-Plan.md` §5.10 items 1-5
- `docs/architecture/plans/PH5-Auth-Shell-Plan.md` locked Option C decisions for app-owned access-control records, explicit overrides, and default-deny behavior
- `docs/architecture/blueprint/HB-Intel-Blueprint-V4.md` §§1e, 1f, 2b, 2c, 2e
