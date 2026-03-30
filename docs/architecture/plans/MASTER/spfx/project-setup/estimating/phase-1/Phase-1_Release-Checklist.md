# Phase 1 — Release Checklist

> Use this checklist to confirm Phase 1 Scope Control is complete before moving to Phase 2.

## Scope Inventory (Prompt 01)

- [x] Frontend route inventory created
- [x] Shell inventory created
- [x] API expectation inventory created
- [x] Backend surface inventory created
- [x] Scope decision matrix published
- [x] All items classified (Keep / Remove / Gated / Out of scope)

## Frontend Isolation (Prompt 02)

- [x] Route tree scoped to Project Setup only (4 routes)
- [x] Shell uses simplified mode (no sidebar, no tool picker)
- [x] Vestigial `useProjectStore` bootstrap seeding removed
- [x] Dead `bid-tracking` feature flag removed
- [x] `setActiveWorkspace('estimating')` confirmed as correct workspace ID
- [x] `ui-review` mode boots and supports Project Setup review

## Backend Scope Alignment (Prompt 03)

- [x] All frontend API calls verified against backend endpoints
- [x] No orphaned calls to notifications, proxy, groups, or preferences endpoints
- [x] `ComplexityProvider` preferences call documented as gracefully degrading deferred dependency
- [x] Backend scope notes published

## Contract Freeze (Prompt 04)

- [x] Contract document exists at `phase-1/Phase-1_Contract-Freeze.md`
- [x] Frontend route contract defined (4 routes)
- [x] Backend route contract defined (9 endpoints)
- [x] Type contract defined (`IProjectSetupRequest`, `IProvisioningStatus`, etc.)
- [x] Runtime mode rules explicit (production vs ui-review)
- [x] Configuration contract defined (resolution order, boot blockers)
- [x] Excluded scope enumerated
- [x] Known deferred items listed

## Acceptance Guards (Prompt 05)

- [x] Route scope guard test — asserts exact allowed route set
- [x] API client scope guard test — asserts exactly 5 contracted methods
- [x] Runtime mode guard test — asserts production defaults and ConfigError behavior
- [x] Static scope guard test — asserts no out-of-scope endpoint imports in source
- [x] Release checklist exists in repo truth

## Verification

- [ ] `pnpm turbo run check-types --filter=@hbc/spfx-project-setup` passes
- [ ] `pnpm turbo run lint --filter=@hbc/spfx-project-setup` passes (0 errors)
- [ ] `pnpm turbo run build --filter=@hbc/spfx-project-setup` passes
- [ ] `pnpm turbo run test --filter=@hbc/spfx-project-setup` passes (all scope guards green)

## Phase 1 Exit Criteria

- [x] Frontend surface limited to Project Setup
- [x] No unsupported navigation, calls, or feature seams for out-of-scope capabilities
- [x] Backend callable surface explicit and intentionally scoped
- [x] Contract document exists
- [x] Regression guards prevent silent scope reintroduction
- [ ] Final verification pass (Prompt 06)
