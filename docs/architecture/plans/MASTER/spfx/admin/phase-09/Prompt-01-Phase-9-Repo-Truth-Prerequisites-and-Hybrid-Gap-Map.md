# Prompt-01 — Phase 9 Repo Truth, Prerequisites, and Hybrid Gap Map

## Objective

Audit the current repo specifically for **Phase 9 — Hybrid Identity Administration foundation**, verify the actual prerequisite state, and produce the canonical Phase 9 repo-truth + hybrid gap map.

This prompt must prevent Phase 9 implementation from guessing, including around how required backend connections are currently configured and whether any part of that setup is still code-edit-only.


## Hard gate

Treat the following as mandatory for this prompt and all later prompts:

After the final `.sppkg` is delivered, IT must be able to install the app and complete required operational setup and ongoing maintenance **without editing source code, manifests, environment files, backend configuration files, deployment templates, or package files**.

This prompt must therefore drive the repo toward:

- UI-managed setup, testing, rotation, and maintenance of required backend connections,
- secure backend custody/resolution of secrets and credentials,
- explicit operator-visible preflight checks for any external prerequisite the app cannot create itself,
- and documentation that distinguishes allowed admin-page approvals from prohibited code-edit setup.

Standard Microsoft admin approval pages are allowed where unavoidable. Code interaction is not.


## Important execution rules

- Read the smallest authoritative set required.
- Do **not** re-read files that are still in active context or memory unless they changed or the prompt requires a fresh check.
- Do not begin implementation of user/group workflows in this prompt.
- Keep this prompt evidence-first.

## Mandatory authority set

Start with:

1. `CLAUDE.md`
2. `docs/architecture/blueprint/current-state-map.md`
3. `docs/architecture/plans/MASTER/spfx/admin/admin-spfx-target-architecture.md`
4. `docs/architecture/plans/MASTER/spfx/admin/admin-spfx-it-control-center-end-state-plan.md`
5. `apps/admin/package.json`
6. `apps/admin/src/App.tsx`
7. `apps/admin/src/router/routes.ts`
8. `apps/admin/src/pages/SystemSettingsPage.tsx`
9. `apps/admin/src/pages/ProvisioningFailuresPage.tsx`
10. `apps/admin/src/pages/ErrorLogPage.tsx`
11. `packages/features/admin/README.md`
12. `packages/features/admin/src/index.ts`
13. `backend/functions/src/services/graph-service.ts`
14. `backend/functions/src/services/graph-service.test.ts`
15. `backend/functions/src/services/service-factory.ts`
16. `backend/functions/src/services/table-storage-service.ts`
17. `backend/functions/src/services/sharepoint-service.ts`
18. `backend/functions/src/functions/provisioningSaga/saga-orchestrator.ts`
19. any existing backend API / admin-run / adapter / queue / worker patterns materially affecting privileged execution
20. any current admin / provisioning / runbook docs that materially affect identity execution

## Scope of work

Create:

- `docs/architecture/plans/MASTER/spfx/admin/phase-9/admin-spfx-phase-9-repo-truth-and-hybrid-gap-map.md`
- `docs/architecture/plans/MASTER/spfx/admin/phase-9/admin-spfx-phase-9-connection-topology-and-config-gap-map.md`
- `docs/architecture/plans/MASTER/spfx/admin/phase-9/admin-spfx-phase-9-no-code-handoff-gate-checklist.md`

## Required sections in the document

1. Purpose
2. Authority set actually used
3. Confirmed repo facts
4. Confirmed foundations Phase 9 can reuse
5. Confirmed limits of current Entra / Graph capability
6. Confirmed evidence of any AD DS / on-prem / hybrid identity execution patterns
7. Confirmed frontend/admin limits that Phase 9 must address
8. Phase 9 prerequisite status
9. Real gaps this phase must close
10. Explicit non-gaps
11. Minimal unresolved items to carry forward

## Minimum findings that must be checked and captured if still true

- The admin app exists and is already a real SPFx surface.
- Admin routing currently exposes only a small page set and no true Hybrid Identity control lane.
- `SystemSettingsPage` is centered on access-control administration, not hybrid identity administration.
- `ProvisioningFailuresPage` is a live provisioning inbox and not the identity lane.
- `ErrorLogPage` remains intentionally deferred or placeholder-grade.
- `@hbc/features-admin` is an admin-intelligence package with monitors/probes/hooks/components and not a privileged control plane.
- `graph-service.ts` already exists but is currently limited to provisioning-era group/site-access tasks.
- The provisioning saga/orchestration pattern is substantial enough to reuse conceptually for hybrid identity execution.
- The repo does **not** already contain a fully built Hybrid Identity control lane unless repo truth now proves otherwise.
- The repo does or does not already contain an on-prem / AD DS execution boundary; this must be stated explicitly instead of assumed.
- The repo does or does not already contain reusable admin-run / audit / adapter patterns suitable for source-of-authority-aware workflows.

## Required output quality

The gap map must clearly separate:

- present truth,
- reusable foundations,
- missing capability,
- stale/drifted docs,
- and later-phase work.

It must also distinguish:

- missing **frontend lane** capability,
- missing **backend control-plane** capability,
- missing **AD DS / on-prem execution** capability,
- missing **Graph/cloud-side** capability,
- and missing **source-of-authority modeling**.

## Validation

Before finishing:

- verify all referenced paths exist,
- remove any speculation disguised as fact,
- ensure the document is specific enough to drive the remaining prompts,
- and identify any repo-truth contradiction that would require the rest of the package to stop or narrow scope.

## Completion condition

Stop after the Phase 9 repo-truth, connection-topology, and hybrid gap-map documents are complete.
Do not implement code in this prompt.


## Required no-code-handoff-gate-checklist content

The checklist must explicitly answer:

- what IT can configure entirely through the UI after deployment,
- what connection details / secrets / identifiers must be UI-manageable,
- what secure backend storage / resolution path exists or is missing,
- what external admin approvals are still required,
- what external infrastructure prerequisites are still required,
- and what current repo realities would still force code interaction.

It must classify each blocker as one of:
- must fix in Phase 9,
- acceptable external admin-page step,
- acceptable external infrastructure prerequisite,
- or later-phase improvement.

## Validation addendum

Before finishing, explicitly confirm whether the current repo would let a developer hand off the `.sppkg` and walk away today. If not, enumerate every blocker plainly.
