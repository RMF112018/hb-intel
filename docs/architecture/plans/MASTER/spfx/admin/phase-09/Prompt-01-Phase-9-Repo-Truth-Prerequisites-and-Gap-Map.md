# Prompt-01 — Phase 9 Repo Truth, Prerequisites, and Gap Map

## Objective

Audit the current repo specifically for **Phase 9 — Broad Entra administration foundation**, verify the actual prerequisite state, and produce the canonical Phase 9 repo-truth + gap map.

This prompt must prevent Phase 9 implementation from guessing.

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
4. `apps/admin/package.json`
5. `apps/admin/src/App.tsx`
6. `apps/admin/src/router/routes.ts`
7. `apps/admin/src/pages/SystemSettingsPage.tsx`
8. `apps/admin/src/pages/ProvisioningFailuresPage.tsx`
9. `apps/admin/src/pages/ErrorLogPage.tsx`
10. `packages/features/admin/README.md`
11. `packages/features/admin/src/index.ts`
12. `backend/functions/src/services/graph-service.ts`
13. `backend/functions/src/services/graph-service.test.ts`
14. `backend/functions/src/services/service-factory.ts`
15. `backend/functions/src/services/table-storage-service.ts`
16. `backend/functions/src/services/sharepoint-service.ts`
17. `backend/functions/src/functions/provisioningSaga/saga-orchestrator.ts`
18. any current admin/provisioning/runbook docs that materially affect identity execution

## Scope of work

Create:
- `docs/architecture/plans/MASTER/spfx/admin/phase-9/admin-spfx-phase-9-repo-truth-and-gap-map.md`

## Required sections in the document

1. Purpose
2. Authority set actually used
3. Confirmed repo facts
4. Confirmed foundations Phase 9 can reuse
5. Confirmed limits of current Entra/Graph capability
6. Confirmed frontend/admin limits that Phase 9 must address
7. Phase 9 prerequisite status
8. Real gaps this phase must close
9. Explicit non-gaps
10. Minimal unresolved items to carry forward

## Minimum findings that must be checked and captured if still true

- The admin app exists and is already a real SPFx surface.
- Admin routing currently exposes only a small page set and no true Entra control lane.
- `SystemSettingsPage` is centered on access-control administration, not broad Entra administration.
- `ProvisioningFailuresPage` is a live provisioning inbox and not the Entra lane.
- `ErrorLogPage` remains intentionally deferred or placeholder-grade.
- `@hbc/features-admin` is an admin-intelligence package with monitors/probes/hooks/components and not a privileged control plane.
- `graph-service.ts` already exists but is currently limited to provisioning-era group/site-access tasks.
- the provisioning saga/orchestration pattern is substantial enough to reuse conceptually for Entra execution.
- the repo does not already contain a fully built broad Entra control lane.

## Required output quality

The gap map must clearly separate:
- present truth,
- reusable foundations,
- missing capability,
- stale/drifted docs,
- and later-phase work.

## Validation

Before finishing:
- verify all referenced paths exist,
- remove any speculation disguised as fact,
- ensure the document is specific enough to drive the remaining prompts.

## Completion condition

Stop after the Phase 9 repo-truth and gap map document is complete.
Do not implement code in this prompt.
