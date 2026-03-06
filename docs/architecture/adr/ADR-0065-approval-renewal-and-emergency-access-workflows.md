# ADR-0065: Approval, Renewal, and Emergency Access Workflows

- **Status:** Accepted
- **Date:** 2026-03-06
- **Phase:** 5.12 (Approval, Renewal, and Emergency Access Workflows)
- **Related Plans:** `docs/architecture/plans/PH5.12-Auth-Shell-Plan.md`, `docs/architecture/plans/PH5-Auth-Shell-Plan.md`

## Context

Phase 5.12 requires production-governed workflow behavior over the access-control model introduced in Phase 5.10 and the minimal admin UX introduced in Phase 5.11. Standard override operations must use structured request/approval, default expiration for most overrides, explicit permanent-justification gating, renewal with fresh approval, and emergency access controls with strict anti-substitution boundaries.

## Decision

1. Add dedicated workflow modules in `packages/auth/src/workflows/`:
   - `overrideRequest.ts`
   - `overrideApproval.ts`
   - `renewalWorkflow.ts`
   - `emergencyAccess.ts`
   - `index.ts`
2. Standard override request intake is modeled as a strict structured command capturing:
   - requested access change
   - business reason
   - target feature/action
   - requested duration or explicit expiration
3. Standard approvals support approve/reject/set expiration and permanent marking only with explicit justification that passes policy validation.
4. Default expiration is enforced for non-permanent approvals.
5. Renewal requires a renewed structured request with updated justification and fresh approval; expired overrides are explicitly detectable to prevent silent continuation.
6. Emergency access workflow requires:
   - authorized admin role
   - mandatory emergency reason
   - short expiration cap
   - mandatory post-action review flag
   - boundary checks rejecting emergency use when normal workflow is available without explicit bypass rationale.
7. Export workflow APIs and all workflow contracts through `types.ts` and root `index.ts` to keep consumption typed and centralized.

## Consequences

### Positive

- Workflow governance rules are explicit, typed, and testable.
- Standard and emergency pathways are clearly separated with enforceable boundaries.
- Default-expiration and renewal controls reduce privilege drift risk.
- Phase 5 admin surfaces can consume one canonical workflow layer.

### Tradeoffs

- Additional command/result contracts increase workflow surface area.
- Emergency boundary policy introduces extra operational metadata requirements (bypass reason) when normal workflow is available.

## Rejected Alternatives

1. **Implicit/manual request fields with ad hoc validation:** rejected because it weakens auditability and deterministic approval behavior.
2. **Allowing permanent overrides without explicit justification:** rejected due to Option C governance and privilege drift risk.
3. **Emergency path without anti-substitution checks:** rejected because it allows break-glass to become de facto normal workflow.
4. **Silent extension of expired overrides:** rejected because renewal requires updated justification and fresh approval.

## Traceability

- `docs/architecture/plans/PH5.12-Auth-Shell-Plan.md` §5.12 items 1-8
- `docs/architecture/plans/PH5-Auth-Shell-Plan.md` locked Option C workflow decisions (formal approval, default expiration, permanent justification, emergency post-review, emergency boundaries)
- `docs/architecture/blueprint/HB-Intel-Blueprint-V4.md` §§1e, 1f, 2b, 2c, 2e
- Builds on Phase 5.10 backend model and ADR-0063; consumed by Phase 5.11 admin capability layer
