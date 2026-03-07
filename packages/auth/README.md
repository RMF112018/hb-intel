# @hbc/auth

Authentication, authorization, and access-governance foundation package for Phase 5.

## Purpose Summary

`@hbc/auth` is the canonical source for identity normalization, auth lifecycle state,
permission evaluation, access governance workflows, and admin governance surfaces.
It guarantees one shared auth model across PWA and SPFx-hosted runtime modes.

## Architecture Responsibilities

`@hbc/auth` owns:

- Runtime mode detection and controlled dev/test override handling.
- Provider adapters and identity normalization into a shared session contract.
- Central auth/session/permission store contracts and selectors.
- Role mapping and permission resolution with default-deny behavior.
- Guard contracts for protected-content access decisions.
- Override request/approval/renewal/emergency governance workflows.
- Structured audit/retention recording and admin operability seams.

`@hbc/auth` does not own:

- Shell composition or shell-status UI orchestration.
- Shell route rendering decisions outside auth/guard contracts.
- SPFx host composition behavior beyond identity input seams.

These concerns are owned by `@hbc/shell`.

## Major Public Contracts

- Session + runtime contracts: `CanonicalAuthMode`, `NormalizedAuthSession`, `AuthFailure`.
- Store contracts: `AuthStoreSlice`, selector contracts, lifecycle/restore state.
- Permission contracts: `FeaturePermissionRegistration`, `FeatureAccessEvaluation`.
- Governance contracts: request/approval/renewal/emergency workflow command/result types.
- Audit contracts: structured event metadata and retention visibility snapshots.

## Runtime Boundaries

- PWA mode uses MSAL adapter boundaries.
- SPFx mode uses strict host-identity bridge input only.
- Mock/dev-override modes are explicitly controlled for non-production/test use.
- All mode-specific behavior is adapter-bound; session/permission truth remains shared.

## Integration Rules (Locked Option C)

- Per-feature organization remains required:
  - one file per major item
  - local `types.ts`
  - local `constants.ts`
  - local `index.ts`
- JSDoc is required on public exports.
- Consumers must import through package public barrels.
- Feature modules must not bypass auth store/permission/guard contracts.
- SPFx-specific behavior must stay inside approved adapter/bridge seams.

## Documentation and Traceability

- Phase plan: `docs/architecture/plans/PH5-Auth-Shell-Plan.md`
- Task plans: `docs/architecture/plans/PH5.2-Auth-Shell-Plan.md` through `PH5.18-Auth-Shell-Plan.md`
- Architecture overview: `docs/architecture/auth-shell-phase5-documentation-overview.md`
- Contracts/reference set: `docs/reference/auth-shell-*.md`
- ADR chain: `docs/architecture/adr/ADR-0053-*.md` through `ADR-0071-*.md`
- Blueprint anchors: `docs/architecture/blueprint/HB-Intel-Blueprint-V4.md` §§1e, 1f, 2b, 2c, 2e
