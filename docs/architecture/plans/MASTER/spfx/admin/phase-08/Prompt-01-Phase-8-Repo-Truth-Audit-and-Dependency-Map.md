# Prompt-01 — Phase 8 Repo-Truth Audit and Dependency Map

## Objective

Audit the live repo specifically for **Phase 8 — HB Intel SharePoint control and standards enforcement** and produce a durable dependency map so implementation targets real gaps instead of redoing already-correct work.

## Important execution rules

- Read the smallest authoritative set needed.
- Do **not** re-read files that are already in active context unless they changed, context is stale, or the task scope widened.
- Treat current live code and current-state docs as higher-authority than historical assumptions.
- This prompt is an audit / mapping prompt, not a broad implementation prompt.

## Required authority set

Inspect the smallest set needed from these areas:

- `docs/architecture/blueprint/current-state-map.md`
- `docs/architecture/plans/MASTER/spfx/admin/**`
- any Phase 1–7 admin artifacts if they exist in repo
- `apps/admin/**`
- `packages/features/admin/**`
- `backend/functions/**`
- existing SharePoint service adapters
- existing provisioning saga files and related run/audit/config contracts
- any current docs or code related to:
  - app catalog posture
  - API access posture
  - SharePoint standards
  - drift detection
  - repair / reconciliation
  - rollout dependency validation

## Create

- `docs/architecture/plans/MASTER/spfx/admin/phase-8/admin-spfx-phase-8-repo-truth-audit.md`

## Required sections in the new file

1. Purpose
2. Authority set actually used
3. Confirmed existing SharePoint-control-related foundations
4. Confirmed missing or partial Phase 8 capabilities
5. Dependency map to prior phases
6. Real gaps that this phase must close
7. Non-gaps that must not be reimplemented
8. Risks / constraints the implementation must respect

## Minimum facts to verify if still true

Verify and capture whether the following remain true:

- `apps/admin` still does not have a real SharePoint control lane.
- `packages/features/admin` remains an admin-intelligence layer, not the control plane.
- backend functions already own privileged / long-running execution patterns that should be extended rather than replaced.
- provisioning/service adapters already provide useful SharePoint-facing foundations.
- admin architecture docs in the repo are still thinner than the end-state plan and will need Phase 8 alignment.

## Special audit focus

Explicitly determine whether the repo already has any of the following:
- standards snapshot or standards comparison types
- drift result types
- preview / dry-run patterns
- site repair or standards apply / reapply patterns
- app catalog posture inspectors
- API access posture inspectors
- run evidence fields suitable for SharePoint control flows

If present, identify exactly where they live and whether they are reusable.

## Validation

Before finishing:
- verify all named paths exist,
- distinguish present truth from target-state intent,
- and ensure the audit clearly identifies what Phase 8 should and should not implement.

## Completion condition

Stop after the audit doc is complete and internally consistent.
Do not start design or code changes in this prompt.
