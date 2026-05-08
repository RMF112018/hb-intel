# Common Requirements — PCC Phase 03 Conditional Command Header Content

## Purpose

These requirements apply to every local-code-agent prompt in this package.

The goal is to complete **Phase 03 — Conditional Command Header Content** for the Project Control Center (`apps/project-control-center`) in `RMF112018/hb-intel`.

Phase 03 must build on Phase 2 by making the shell command header render deterministic, meaningful, surface-specific content for every current PCC MVP surface. The command header should begin absorbing the informational role of old top-level surface cards without removing those cards in this phase.

## Mandatory Efficiency Directive

Every local-code-agent prompt must include and follow:

```text
Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.
```

## Global Scope Guardrails

### Required

- Inspect current repo truth before editing.
- Treat current `main` as authoritative.
- Verify Phase 2 shell ownership before making Phase 03 changes.
- Preserve SharePoint host-fit.
- Preserve read-only / preview / no-writeback posture.
- Preserve the distinction between PCC surfaces and work centers/modules.
- Preserve bento direct-child invariants.
- Preserve tab / tabpanel accessibility.
- Keep command-search posture truthful and non-interactive unless a prompt explicitly authorizes a visual-only adjustment.
- Keep Phase 03 strictly focused on conditional command-header content.
- Use `apps/project-control-center/config/package-solution.json` for package-solution references.

### Prohibited

- Do not reintroduce a PCC sidebar.
- Do not assume a full-page takeover.
- Do not rely on tenant-specific facts that are not present in fixtures or repo truth.
- Do not implement live writeback, mutation routes, approval execution, repair execution, file operations, or external-system sync.
- Do not implement full Modules launcher behavior.
- Do not implement command routing.
- Do not introduce active module state.
- Do not remove duplicate top-level header cards in Phase 03.
- Do not rework Project Home bento composition.
- Do not perform broad visual redesign.
- Do not claim Phase 4 readiness.
- Do not claim final scorecard pass.

## Controlling Repo-Truth Anchors

The package was generated from an audit that found these current repo-truth anchors. The local agent must still re-check them before editing because the repo is moving quickly.

```text
apps/project-control-center/src/PccApp.tsx
apps/project-control-center/src/shell/PccShell.tsx
apps/project-control-center/src/shell/PccHorizontalTabs.tsx
apps/project-control-center/src/shell/PccProjectHeroBand.tsx
apps/project-control-center/src/shell/PccProjectHeroBand.module.css
apps/project-control-center/src/shell/PccCommandSearch.tsx
apps/project-control-center/src/shell/surfaceHeaderMetadata.ts
apps/project-control-center/src/shell/surfaceHeroCopy.ts
apps/project-control-center/src/preview/projectShellViewModel.ts
apps/project-control-center/src/state/usePccShellState.ts
packages/models/src/pcc/PccMvpSurfaces.ts
apps/project-control-center/config/package-solution.json
```

## Required Package-Solution Path

Use this PCC package-solution path:

```text
apps/project-control-center/config/package-solution.json
```

Do **not** use stale root-level references like:

```text
config/package-solution.json
```

unless current repo truth proves a new valid path.

## Baseline Validation Commands

Every runtime/test prompt must require:

```bash
git status --short
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm exec prettier --check <changed-files>
git diff --check
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

## Docs-Only Validation Commands

Docs-only prompts may use:

```bash
git status --short
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
pnpm exec prettier --check <changed-files>
git diff --check
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

## Optional Live Evidence Commands

Run only if selector output, Playwright evidence, screenshot evidence, or live evidence lanes are touched.

```bash
pnpm exec playwright test --config=playwright.pcc-live.config.ts --list
pnpm pcc:e2e:evidence:registry
pnpm pcc:e2e:live
```

## Required Reporting Discipline

Every local-agent completion report must include:

- files inspected;
- files changed;
- scoped objective completed;
- tests added/updated;
- validation commands and results;
- package/lockfile/manifest audit;
- confirmation that duplicate-card removal did not occur;
- residual risks or handoff items.
