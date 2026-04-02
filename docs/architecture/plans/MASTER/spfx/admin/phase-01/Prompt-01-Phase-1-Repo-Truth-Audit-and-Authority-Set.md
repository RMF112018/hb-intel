# Prompt-01 — Phase 1 Repo-Truth Audit and Authority Set

## Objective

Verify the minimum authoritative source set and produce a concise, durable repo-truth verification artifact for the Admin SPFx IT Control Center Phase 1 work.

This prompt is a **repo-audit and evidence prompt**, not a later-phase implementation prompt.

## Important execution rules

- Read the **smallest authoritative set** needed.
- Do **not** re-read files that are already in current agent context unless they changed, context is stale, or the task scope widened.
- Do **not** jump into Phase 2+ design work.
- Do **not** create speculative architecture claims unsupported by current repo truth or the locked direction below.

## Locked direction for this phase

Treat the following as already decided for Phase 1:
- Admin SPFx is the **operator console**, not the privileged executor.
- Privileged and long-running execution belongs in the backend/control plane.
- `@hbc/features-admin` is a reusable **admin-intelligence** package, not the control plane.
- Existing provisioning/backend foundations should be generalized later, not discarded.
- This phase exists to freeze boundaries and scope, not to add major runtime capability.

## Read this authority set first

1. `CLAUDE.md`
2. `docs/reference/developer/agent-authority-map.md`
3. `docs/architecture/blueprint/current-state-map.md`
4. `docs/architecture/plans/MASTER/spfx/admin/admin-spfx-target-architecture.md`
5. `apps/admin/package.json`
6. `apps/admin/src/App.tsx`
7. `apps/admin/src/router/root-route.tsx`
8. `apps/admin/src/router/routes.ts`
9. `apps/admin/src/pages/SystemSettingsPage.tsx`
10. `apps/admin/src/pages/ProvisioningFailuresPage.tsx`
11. `apps/admin/src/pages/ErrorLogPage.tsx`
12. `apps/admin/src/webparts/admin/AdminWebPart.tsx`
13. `packages/features/admin/README.md`
14. `packages/features/admin/src/index.ts`
15. `backend/functions/README.md`
16. `backend/functions/src/services/service-factory.ts`
17. `backend/functions/src/services/graph-service.ts`
18. `backend/functions/src/services/sharepoint-service.ts`
19. `backend/functions/src/services/table-storage-service.ts`
20. `backend/functions/src/functions/provisioningSaga/saga-orchestrator.ts`

## Scope of work

Create:

- `docs/architecture/plans/MASTER/spfx/admin/phase-1/admin-spfx-phase-1-repo-truth-verification.md`

## Required content in the new file

Write a concise verification artifact with these sections:

1. **Purpose**
2. **Authority set actually used**
3. **Confirmed repo facts**
4. **Confirmed partial foundations already present**
5. **Confirmed gaps Phase 1 still needs to close**
6. **Explicit non-gaps**  
   Call out anything that already exists and therefore should not be re-invented in Phase 1.
7. **Phase 1 implications**
8. **Open issues requiring later-phase handling, not Phase 1 implementation**

## Minimum facts that must be captured if still true after verification

- `apps/admin` already exists and already has a real SPFx entry point.
- Admin routing and permission gating already exist.
- `SystemSettingsPage` is currently centered on access-control admin UI rather than a full control-center workflow shell.
- `ProvisioningFailuresPage` is already a live/admin-facing surface tied to provisioning failure actions.
- `ErrorLogPage` remains placeholder/deferred.
- `@hbc/features-admin` already exports monitors, probes, APIs, hooks, integrations, and dashboard components.
- `backend/functions` already contains a real service factory, Graph/SharePoint adapters, Azure Table persistence, and a provisioning saga with retry/compensation/audit/progress behavior.
- The current admin target-architecture doc is directionally useful but too thin to serve as the whole Phase 1 baseline.

## Deliverable quality bar

The document must distinguish:
- verified present truth,
- partial maturity,
- real gaps,
- and later-phase work.

Do **not** blur those categories.

## Documentation constraints

- Keep the document factual and concise.
- Do not duplicate large source excerpts.
- Prefer bullets and direct statements.
- Where a repo path is material, name it explicitly.

## Validation

Before finishing:
- verify all referenced repo paths exist,
- ensure the document contains no target-state speculation presented as current fact,
- ensure the output is still clearly Phase 1 only.

## Completion condition

Stop after the verification artifact is complete and internally consistent.
Do not start writing the architecture baseline in this prompt.
