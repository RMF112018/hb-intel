# Admin SPFx IT Control Center — Phase 5 Summary Plan

## Purpose

Phase 5 exists to turn the current Admin SPFx app into the **operator-console foundation** for the HB Intel IT Control Center.

This phase is not the phase that delivers full install/bootstrap execution, full SharePoint control, full Entra administration, or a finished audit platform. Those belong to later phases.

Phase 5 is the phase that establishes the **operator shell, route taxonomy, page/workflow structure, navigation model, and command-entry posture** that later phases will plug into.

## Governing Phase 5 direction

Phase 5 is governed by the Admin IT Control Center end-state plan, which defines this phase as:

- reworking IA/navigation around operator workflows:
  - Setup / Install
  - Validation
  - Runs / History
  - SharePoint Control
  - Entra Control
  - Standards / Config
  - Health / Alerts
  - Error / Audit
- adding scoped execution previews and risk-aware action entry points
- making the Admin app the real control-center shell

## Confirmed repo-truth starting point

The current repo already includes a real Admin SPFx app, but it is still structurally narrow compared with the intended Phase 5 end state.

### Current shell posture
- `apps/admin/src/App.tsx` already mounts the admin app through the router, theme, query, error, toast, and complexity providers.
- `apps/admin/src/router/root-route.tsx` uses `ShellLayout` in **simplified** mode with a basic tool-picker.
- The current simplified tool picker exposes only:
  - System Settings
  - Dashboards
  - Error Log
  - Provisioning Oversight

### Current route posture
- `apps/admin/src/router/routes.ts` currently defines only four routes:
  - `/`
  - `/dashboards`
  - `/error-log`
  - `/provisioning-failures`

### Current page posture
- `SystemSettingsPage` is primarily an access-control + approval-authority administration page.
- `OperationalDashboardPage` is queue/alert/probe visibility, not a full operator-console landing shell.
- `ProvisioningOversightPage` is the strongest current run-oriented page and already contains detailed run diagnostics and admin recovery actions.
- `ErrorLogPage` is still intentionally deferred and currently renders an empty-state placeholder.

### Current supporting package posture
- `@hbc/features-admin` remains an admin-intelligence package (monitors, probes, alert/dashboard components, approval authority pieces) and should not be treated as the control plane.
- `@hbc/shell` is already the canonical owner of shell composition and workspace navigation boundaries.
- The backend already owns privileged execution and run persistence, which means Phase 5 should focus on the operator shell and route/workflow composition, not on moving logic into SPFx.

### Existing Phase 5 review evidence already in repo
The repo already contains Phase 5 review artifacts around:
- admin exception-path audit
- admin recovery boundary and authorization hardening

These should be treated as supporting evidence, not as a substitute for current code inspection during implementation.

## Major objectives

1. Establish the canonical **operator-console IA** for the Admin app.
2. Replace the narrow simplified tool-picker mentality with a stronger operator-console navigation model.
3. Create the route registry / lane taxonomy for the major operator workflows.
4. Rehome the current admin pages into the new IA without breaking healthy existing functionality.
5. Introduce page shells for future control-center lanes so later phases have stable UI anchors.
6. Add risk-aware action-entry and scoped preview posture where Phase 5 can do so without pulling later-phase backend scope into the frontend.
7. Fix cross-app handoff and inbound context handling so links into Admin land on the right workflow surfaces.
8. Align docs and tests around the new shell structure.

## In-scope repo/doc/code areas

### Primary in-scope code
- `apps/admin/src/App.tsx`
- `apps/admin/src/router/**`
- `apps/admin/src/pages/**`
- `apps/admin/src/components/**` where needed
- `apps/admin/src/constants/**` where needed
- `apps/admin/src/utils/**` where needed

### Supporting packages
- `packages/shell/**` only if the current shell package lacks the minimum primitive needed for the new operator-console shell
- `packages/ui-kit/**` only if a missing shell/page primitive is truly required
- `packages/features/admin/**` only for integration/reuse, not for converting it into the shell owner

### Documentation
- `docs/architecture/plans/MASTER/spfx/admin/**`
- `apps/admin/README.md`
- any directly relevant reference docs affected by route or shell changes

## Expected Phase 5 deliverables

1. A canonical Phase 5 operator-console baseline doc
2. A canonical route / lane taxonomy doc
3. A canonical page-ownership / IA mapping doc
4. A refactored admin shell/navigation model
5. A route registry that reflects the operator-console lane structure
6. New or updated page shells for:
   - Setup / Install
   - Validation
   - Runs / History
   - SharePoint Control
   - Entra Control
   - Standards / Config
   - Health / Alerts
   - Error / Audit
7. Rehomed current pages within the new IA
8. Cross-app handoff fixes and inbound route-context handling
9. README / doc alignment
10. Validation + exit reconciliation doc

## Risks Phase 5 is addressing

- The Admin app remaining a provisioning-recovery utility instead of becoming the operator console
- Navigation and route structure drifting from the end-state lane model
- Existing pages becoming orphaned or mislabeled during shell refactor
- Cross-app routing continuing to deep-link into stale or incorrect Admin routes
- Shell work accidentally bleeding into backend or control-plane implementation
- `@hbc/features-admin` or page-local code being stretched into shell-ownership responsibilities that belong to `@hbc/shell`

## Why Phase 5 must come now

The backend and persistence work from earlier phases can exist without the final control-center shell, but the product still will not behave like the intended IT Control Center until the Admin app is reorganized around operator workflows.

Later phases depend on this shell structure because they need stable, intentional places to land:
- install/bootstrap flows
- validation flows
- run history
- SharePoint control
- Entra control
- standards/config governance
- observability and audit

Without Phase 5, later capability work would be forced into a page structure that is too narrow and too provisioning-centric.

## Recommended implementation sequence inside the phase

1. Audit and freeze the operator-console IA baseline.
2. Create the canonical route/lane registry and ownership mapping.
3. Refactor the admin shell and primary navigation around the lane model.
4. Scaffold the lane pages and page shells.
5. Rehome the current pages into the new lane structure.
6. Add operator entry-point conventions and context handoff fixes.
7. Reconcile docs and local guidance.
8. Validate navigation, preservation of existing behavior, and exit criteria.

## Acceptance criteria

Phase 5 is complete when all of the following are true:

- The Admin app clearly presents itself as an operator console, not just a narrow admin utility.
- There is a canonical route/lane structure for the control-center workflows.
- Current healthy pages still work and are rehomed coherently inside the new IA.
- The app has stable route/page shells for the major operator workflows listed in the end-state plan.
- Existing provisioning oversight remains functional inside the new structure.
- The shell/navigation layer is owned through the correct boundaries (`apps/admin` + `@hbc/shell`, with minimal justified supporting changes elsewhere).
- Cross-app deep links into Admin land on valid, intentional routes.
- Documentation explains the new shell structure and page ownership clearly.
- Validation confirms the refactor did not break existing routes, permission gating, or core admin surfaces.

## Explicit non-goals

Do **not** let Phase 5 drift into:
- generalized backend run contracts
- install/bootstrap backend execution
- full validation engine implementation
- full SharePoint control flows
- full Entra admin workflows
- full standards/config governance runtime
- full durable error/audit platform implementation

Phase 5 should create the operator-console shell and workflow anchors for those later phases.
