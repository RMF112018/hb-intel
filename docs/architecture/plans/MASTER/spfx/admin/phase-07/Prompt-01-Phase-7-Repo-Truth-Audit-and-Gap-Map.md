# Prompt-01 — Phase 7 Repo-Truth Audit and Gap Map

## Objective

Audit the current repo state for **Phase 7 — Provisioning saga refinement and seamless rollout hardening** and create a durable gap map that distinguishes:

- existing strengths,
- confirmed drift,
- confirmed missing work,
- and areas that Phase 7 must leave for later phases.

This is an evidence prompt first, not a rewrite prompt.

## Important execution rules

- Read the **smallest authoritative set** needed.
- Do **not** re-read files still in active context unless they changed or the task widened.
- Treat live repo truth as authoritative for current implementation state.
- Preserve healthy provisioning foundations; this prompt is not permission to replace them.

## Governing Phase 7 direction

Treat these as locked for this phase:
- provisioning should run straight through unless failure occurs,
- dependency validation must improve before run launch,
- diagnostics, recovery visibility, and operator guidance must improve,
- provisioning must integrate with install/bootstrap and Entra setup,
- privileged execution must remain in backend/control-plane code.

## Read this authority set first

1. `docs/architecture/plans/MASTER/spfx/admin/admin-spfx-target-architecture.md`
2. `apps/admin/README.md`
3. `apps/admin/src/router/routes.ts`
4. `apps/admin/src/pages/ProvisioningFailuresPage.tsx`
5. `packages/features/admin/README.md`
6. `packages/provisioning/**` (read only what is necessary to understand the public provisioning client surface)
7. `backend/functions/README.md`
8. `backend/functions/src/functions/provisioningSaga/index.ts`
9. `backend/functions/src/functions/provisioningSaga/saga-orchestrator.ts`
10. `backend/functions/src/functions/provisioningSaga/steps/**` (only where needed to understand current failure and dependency behavior)
11. `backend/functions/src/services/table-storage-service.ts`
12. `backend/functions/src/services/sharepoint-service.ts`
13. `backend/functions/src/services/graph-service.ts`
14. Any existing provisioning tests directly adjacent to the touched saga code

## Create

- `docs/architecture/plans/MASTER/spfx/admin/phase-7/admin-spfx-phase-7-provisioning-gap-map.md`

## Required sections in the new file

1. **Purpose**
2. **Authority set actually used**
3. **Confirmed repo strengths already present**
4. **Confirmed route / UI drift**
5. **Confirmed provisioning control-plane strengths already present**
6. **Confirmed dependency-validation gaps**
7. **Confirmed diagnostics / failure-visibility gaps**
8. **Confirmed recovery / repair-visibility gaps**
9. **Confirmed documentation drift**
10. **Explicit non-gaps**
11. **Phase 7 implementation implications**
12. **Later-phase concerns that should not be solved here**

## Minimum facts that must be captured if still true

- the admin README and actual route wiring are not fully aligned,
- `ProvisioningFailuresPage.tsx` exists and already performs retry/escalate actions,
- the backend saga already has real step sequencing, retry/compensation behavior, and durable status persistence,
- backend README already defines provisioning staging gates / prerequisite expectations,
- `@hbc/features-admin` still has notable in-memory/deferred observability limits, so Phase 7 can improve provisioning diagnostics without claiming full observability completion,
- docs under `docs/architecture/plans/MASTER/spfx/admin/` are still very thin relative to what Phase 7 needs.

## Writing standard

Keep the output factual and specific:
- short paragraphs,
- strong bullets,
- named repo paths,
- no target-state claims presented as current fact.

## Validation

Before finishing:
- verify all referenced paths exist,
- ensure every claimed gap is backed by current repo evidence,
- ensure no Phase 8/9/12 work is mislabeled as a Phase 7 gap.

## Completion condition

Stop after the gap-map document is complete and internally consistent.
Do not start implementing hardening logic in this prompt.
