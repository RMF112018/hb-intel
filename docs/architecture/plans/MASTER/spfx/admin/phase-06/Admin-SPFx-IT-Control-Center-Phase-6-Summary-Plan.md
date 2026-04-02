# Admin SPFx IT Control Center — Phase 6 Summary Plan

## Purpose

Phase 6 exists to deliver the first real **in-app backend install and bootstrap** lane for the Admin SPFx IT Control Center.

This phase is where the Admin app must stop being only an admin shell and begin acting like the operator console for controlled environment setup, readiness validation, install execution, checkpoint handling, and post-install verification.

## Why this phase matters

The end-state plan makes backend install/bootstrap an early-class responsibility, not a late enhancement. The Admin SPFx app is expected to own setup/install workflow UX, validation and preflight UX, run initiation, run history, operator approvals/checkpoints, and status visibility, while the backend remains the privileged executor. Phase 6 is the implementation wave that ties those responsibilities together for install/bootstrap. 

## Repo-truth starting point

Current repo truth indicates strong reusable foundations but no finished Phase 6 lane yet:

- `docs/architecture/plans/MASTER/spfx/admin/` currently contains only `admin-spfx-target-architecture.md`
- `apps/admin/src/router/root-route.tsx` currently exposes only:
  - System Settings
  - Error Log
  - Provisioning Failures
- `apps/admin/src/router/routes.ts` maps those routes to current settings-oriented surfaces
- `@hbc/features-admin` is still an admin-intelligence package with in-memory limitations for several observability pieces
- `backend/functions` already has real service-container wiring, Graph and SharePoint adapters, Azure Table persistence, and a provisioning saga foundation
- `backend/functions/README.md` already documents production use of a user-assigned managed identity with `DefaultAzureCredential` plus key environment variables such as app catalog URL and SPFx app ID
- `graph-service.ts` already includes a `grantSiteAccess(...)` capability and explicitly calls out a future automation extension point for site-access grant behavior

That means Phase 6 should **preserve and extend** current foundations rather than starting over.

## Major objectives

1. Add a real setup/install lane to the Admin operator console.
2. Add preflight validation with structured readiness results.
3. Add install/bootstrap run-launch support in the privileged backend.
4. Add checkpoint-aware handling for unavoidable approval/manual actions.
5. Add post-install verification and environment health confirmation.
6. Preserve boundary discipline:
   - SPFx = operator console and review surfaces
   - backend = privileged executor and durable run owner
7. Leave room for later generalization without re-implementing all of Phases 2–5 inside Phase 6.

## Recommended in-scope repo areas

### Frontend
- `apps/admin/**`
- relevant shell/navigation composition in `@hbc/shell` only if needed for Admin routing or command-rail fit
- `@hbc/ui-kit` only if a reusable presentation primitive must be added

### Backend
- `backend/functions/**`
- existing provisioning and adapter foundations
- any existing admin/proxy function patterns already in repo

### Shared contracts/types
- whichever shared package currently owns cross-surface admin/provisioning models
- if none is appropriate, add the smallest forward-compatible shared model surface needed

### Documentation
- `docs/architecture/plans/MASTER/spfx/admin/phase-6/**`
- admin/app/backend README or runbook docs as needed

## Expected Phase 6 deliverables

1. Phase 6 prerequisite + compatibility audit
2. Install/bootstrap architecture slice for this phase
3. Setup/install step model and manual-checkpoint policy
4. Shared install/preflight/verification run contracts
5. Backend preflight validator
6. Backend install/bootstrap orchestration + execution routing
7. Manual checkpoint / resume / cancel support where unavoidable
8. Post-install verification flow
9. Admin SPFx setup/install UX
10. Admin SPFx run tracking / checkpoint / verification UX
11. Updated docs, runbook guidance, and validation reconciliation

## Risks this phase is addressing

- install/bootstrap remaining outside the app and therefore outside the operator-console model
- privileged logic leaking into SPFx
- browser UX existing without durable backend run ownership
- install actions being opaque or non-auditable
- phase drift turning this into either:
  - “just add more admin pages”, or
  - a giant generalized platform rebuild
- hidden dependency failures surfacing only after install attempt rather than in preflight
- manual approval steps being ad hoc instead of modeled as explicit checkpoints

## Recommended implementation sequence inside the phase

1. Audit prerequisites and identify any minimum compatibility shims required
2. Freeze the Phase 6 install/bootstrap architecture slice
3. Define the install/preflight/verification step model and checkpoint policy
4. Add shared contracts and persistence slice
5. Implement backend preflight validation
6. Implement backend install/bootstrap orchestration
7. Implement checkpoint/resume semantics
8. Implement post-install verification
9. Build SPFx setup/install workflow UX
10. Build SPFx run-status, checkpoint, and verification UX
11. Reconcile docs, tests, and operator guidance

## Acceptance criteria for Phase 6 completion

Phase 6 is complete when all of the following are true:

- An admin can initiate setup/install/bootstrap from inside the Admin app.
- The app provides structured preflight results before install launch.
- Install/bootstrap execution runs through the backend/control plane, not the browser.
- Unavoidable manual or approval gates surface as explicit checkpoint states with clear operator instructions.
- Install progress, status, and final outcome are reviewable in the Admin app.
- Post-install verification can be run and reviewed in the Admin app.
- Phase 6 docs clearly explain the install/bootstrap flow, checkpoints, validation, and operator responsibilities.
- Validation demonstrates the touched frontend and backend surfaces compile and behave according to repo-truth scripts.
- The implementation does not collapse frontend/backend boundaries or redefine `@hbc/features-admin` as the control plane.

## Explicit non-goals

Do not let this phase drift into:
- full tenant-wide SharePoint active governance,
- broad Entra admin workflow completion,
- full standards/config registry implementation,
- full observability completion,
- or a total generalized admin platform rewrite.

Where earlier-phase substrate is missing, create only the **smallest forward-compatible compatibility slice** required to make Phase 6 coherent and executable.
