# Prompt 00 — Pre-Edit Repo-Truth Gate

## Role

You are my PCC Phase 06 local implementation agent for the `RMF112018/hb-intel` repo.

You are implementing focused Phase 06 work for:

```text
PCC Phase 06 — Span Overrides, Intentional Dashboard Choreography, and Project-Specific Analytics Preview System
```

## Objective

Establish repo truth, confirm the Phase 06 baseline, verify dependency/version state, and produce a concise implementation readiness report without making runtime code changes.

## Global Instructions

- Do not re-read files that are still within your current context or memory unless they have changed, your context is stale, or validation requires it.
- Do not install dependencies.
- Do not add `echarts-for-react`.
- Do not run broad repo scans when targeted reads are sufficient.
- Do not introduce live integrations, writeback, approval execution, source mutation, or random render-time data.
- Do not render developer/internal copy in the UI.
- Preserve PCC read-only / preview / no-writeback posture.
- Keep every bento card as a direct child of `[data-pcc-bento-grid]`.
- Do not use `grid-auto-flow: dense` as the primary layout fix.
- Preserve shell-owned `main[role="tabpanel"][data-pcc-active-surface-panel]`.
- Do not reintroduce `Project Intelligence` as a Project Home bento card.
- Use production-grade, end-user-facing copy only.

## Scope

Read only. No code changes unless the user explicitly authorizes a documentation-only note.

## Required Repo-Truth Checks

1. Confirm branch and working tree:
   ```bash
   git status --short
   git branch --show-current
   git rev-parse HEAD
   md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
   ```

2. Inspect these files:
   ```text
   docs/reference/spfx-surfaces/project-control-center/PCC_Project_Control_Center_Basis_of_Design_Contract.md
   docs/architecture/blueprint/sp-project-control-center/phase-3/01_PCC_Product_Architecture_and_User_Journey_Blueprint.md
   apps/project-control-center/config/package-solution.json
   apps/project-control-center/package.json
   apps/project-control-center/src/layout/PccDashboardCard.tsx
   apps/project-control-center/src/layout/PccBentoGrid.tsx
   apps/project-control-center/src/layout/footprints.ts
   apps/project-control-center/src/surfaces/projectHome/PccProjectHome.tsx
   apps/project-control-center/src/surfaces/projectHome/PccProjectHomeReadModelContent.tsx
   apps/project-control-center/src/surfaces/phase05Dashboard/PccPrimaryDashboardSurface.tsx
   apps/project-control-center/src/state/usePccShellState.ts
   apps/project-control-center/src/shell/PccSurfaceRouter.tsx
   packages/models/src/pcc/PccPrimaryNavigation.ts
   ```

3. Confirm:
   - whether `echarts` is already installed;
   - whether `echarts-for-react` is absent;
   - whether package solution and feature versions are `1.0.0.215`;
   - current Project Home order;
   - current read-model Project Home order;
   - current primary tab IDs;
   - whether current `PccDashboardCard` lacks span overrides;
   - whether the active panel marker is shell-owned;
   - whether `Project Intelligence` remains absent.

## Required Readiness Report

Produce a report with:

- repo HEAD;
- branch;
- working tree status;
- lockfile md5;
- dependency state;
- version state;
- files inspected;
- current gaps against Phase 06;
- whether user must install `echarts` before Prompt 03;
- any blocker.

## Non-Goals

- Do not implement span overrides.
- Do not implement analytics.
- Do not edit code.
- Do not install dependencies.

## Required Validation

Run the narrowest validation needed during implementation, then at closeout run:

```bash
git status --short
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm exec prettier --check <changed-files>
git diff --check
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

If Playwright evidence is in scope for this prompt, also run the requested Playwright commands.

## Closeout Report

Report:

- files changed;
- dependency/package/lockfile changes observed;
- validation commands and results;
- whether SPFx solution/feature version changed;
- risks or follow-up items;
- confirmation that you did not install dependencies;
- confirmation that `echarts-for-react` was not added.
