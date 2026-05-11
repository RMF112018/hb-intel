# Phase 08 Prompt 04 — Command Header / Hero Enhancement

## Objective

Enhance the command header/hero into the primary PCC command surface with stronger hierarchy, posture chips, and surface-specific context.

## Global Execution Rules

These rules apply to this prompt and every later Phase 08 prompt.

1. Work in the `RMF112018/hb-intel` repo.
2. Treat this phase as **PCC Product Experience Enhancement**, not a CSS-only polish pass.
3. Preserve the current Phase 05/06/07 runtime architecture unless this prompt explicitly authorizes a narrow change.
4. Preserve the current eight primary-tab model:
   - `project-home`
   - `core-tools`
   - `documents`
   - `estimating-preconstruction`
   - `startup-closeout`
   - `project-controls`
   - `cost-time`
   - `systems-administration`
5. Do not reintroduce a permanent PCC sidebar.
6. Do not move `data-pcc-active-surface-panel` back to a card. It must remain shell-owned on `main[role="tabpanel"]`.
7. Preserve the bento direct-child invariant. Do not add wrappers between `PccBentoGrid` and `PccDashboardCard` unless the wrapper is itself an intentionally tested grid child and does not break layout.
8. Do not add dependencies. Do not add `echarts-for-react`. `echarts` direct usage remains the approved analytics approach.
9. Do not create live SharePoint, Graph, Procore, Sage, Azure, tenant, or app-catalog mutations.
10. Preserve read-only / preview / launch-only / no-writeback posture.
11. Do not introduce fake affordances. A non-working search/action/control must not appear live without clear preview or disabled state.
12. Do not put developer copy in the UI. Avoid end-user-visible words like `mock`, `placeholder`, `TODO`, `fixture`, or `demo` unless a governed preview/sample label already exists and is intentionally user-facing.
13. Do not weaken tests to pass. Update tests only when the expected product contract has intentionally changed.
14. Use stable `[data-*]` markers and semantic roles for tests. Do not test CSS module class names as behavior contracts.
15. Do not re-read files that are still within the current context or memory. Only open files needed to verify current repo truth, inspect drift, or make the scoped change.
16. If local repo truth differs from this package, classify the drift and proceed only when the change can be safely aligned without overwriting operator-owned work.


## Current Repo-Truth Assumptions

- Remote baseline observed when package was generated: `7d8bae430ab999d4fb38abe8de6689b89d8f4d27`.
- Current runtime model uses the eight primary tabs:
  `project-home`, `core-tools`, `documents`, `estimating-preconstruction`, `startup-closeout`, `project-controls`, `cost-time`, `systems-administration`.
- Local repo truth must be verified before edits.
- If local files have drifted, classify drift before editing.

## Scope

Improve `PccProjectHeroBand` and its view model so the header feels like a premium command surface. It must communicate project identity, active surface context, source/trust posture, and today/current focus without becoming oversized or cluttered.

## Expected File Targets

```text
apps/project-control-center/src/shell/PccProjectHeroBand.tsx
apps/project-control-center/src/shell/PccProjectHeroBand.module.css
apps/project-control-center/src/preview/projectShellViewModel.ts
apps/project-control-center/src/tests/*Hero*
apps/project-control-center/src/tests/*Shell*

```

## Allowed Changes

- View-model shape extension when fully typed and tested.
- New local header chip/summary primitives if scoped to shell.
- CSS module enhancements.

## Prohibited Changes

- Do not add live data calls.
- Do not imply command/search/HBI has autonomous authority.
- Do not remove existing project facts without relocating equivalent value.

## Required Steps

1. Inspect current hero view model and hero band rendering.
2. Define surface-specific posture chips for all eight primary tabs.
3. Refine hero layout into identity, command, posture, and summary clusters.
4. Add a Project Home 'Today’s Focus' style summary using deterministic existing/mock context.
5. Preserve existing facts and governance microcopy where useful.
6. Improve compact breakpoint behavior.
7. Add tests for surface-specific header content and required data markers.

## Acceptance Criteria

- Hero is visually dominant but not oversized.
- Header content changes by active surface.
- Project Home includes a clear current-focus/posture summary.
- No end-user-facing developer copy.
- No false action/search behavior introduced.
- Responsive hero does not clip or overflow.

## Required Validation

```bash
git status --short
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm exec prettier --check <changed-files>
git diff --check
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
git status --short
```

## Closeout Requirements

Use `templates/Closeout_Template.md` and include:

- Starting and ending HEAD.
- Local drift classification.
- Files changed.
- Tests run and results.
- Lockfile md5 before/after.
- Evidence generated or blocked reason.
- Guardrails confirmed.

