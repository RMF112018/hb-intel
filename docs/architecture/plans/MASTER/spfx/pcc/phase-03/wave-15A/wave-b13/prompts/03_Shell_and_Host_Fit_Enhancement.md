# Phase 08 Prompt 03 — Shell and Host-Fit Enhancement — UPDATED

## Objective

Strengthen the PCC shell and SharePoint canvas host-fit so the application feels more intentional, durable, and productized inside the SharePoint page while preserving the current Phase 05/06/07 runtime architecture.

This is the first Phase 08 runtime enhancement prompt. It must remain narrowly focused on shell/canvas containment, host-fit, visual separation, layout resilience, active-panel ownership, and bento canvas stability. Do not drift into the later hero, command header, tab, launcher, analytics, card-content, or surface-specific enhancement prompts.

## Current Execution Baseline

Treat the following as the current committed and pushed Phase 08 baseline unless local repo truth proves otherwise:

```text
Branch: main
Baseline HEAD: d7ff02968117ebcc66e81144ec4273bbd1d2ea56
Package / manifest version: 1.0.0.219
Lockfile md5: 7c19ccfa8718a42f7f55ce178a626996
Prompt 01 plan: committed
Prompt 02 screenshot findings matrix: committed and pushed
```

The historical package-generation baseline `7d8bae430ab999d4fb38abe8de6689b89d8f4d27` is reference context only. Do not roll back to it and do not treat it as the active execution baseline.

Before editing, confirm local HEAD is at or after `d7ff02968117ebcc66e81144ec4273bbd1d2ea56`. If local repo truth differs, classify the drift and proceed only if the drift is forward-only, in-scope, and safe. Any unrelated modified or untracked path must block execution until the operator resolves it.

## Required Phase 08 Reference Inputs

Use these repo-local planning artifacts as the governing sources for this prompt:

```text
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b13/00_PCC_Phase_08_Product_Experience_Enhancement_Plan.md
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b13/01_Screenshot_Baseline_Findings.md
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b13/README.md
```

Use only the parts relevant to shell/host-fit. Do not re-read files that are still within current context or memory. Open only the files needed to verify current repo truth, inspect current implementation, and complete this scoped runtime change.

## Global Execution Rules

These rules apply to this prompt and every later Phase 08 prompt.

1. Work in the `RMF112018/hb-intel` repo.
2. Treat this phase as **PCC Product Experience Enhancement**, not a CSS-only polish pass.
3. Preserve the current Phase 05/06/07 runtime architecture unless this prompt explicitly authorizes a narrow shell/host-fit adjustment.
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
15. Do not use `git add .`.
16. Do not commit unless the operator explicitly asks for a commit.
17. Do not delete, overwrite, rename, or prune historical evidence.
18. Do not stage auth/session artifacts, local screenshots outside the approved evidence path, or unrelated generated files.
19. Do not introduce broad/global CSS resets. Any containment, overflow, or sizing rule must be scoped to PCC shell/canvas classes or established PCC primitives.
20. Do not introduce one-off raw color values, shadows, radii, spacing, or animation constants when an existing PCC token, CSS variable, or shared primitive can be used. If a new design token is absolutely required, justify it in closeout and keep it PCC-scoped.
21. Preserve reduced-motion behavior. Any transition/animation refinement must respect the existing reduced-motion contract.
22. Preserve accessibility behavior, keyboard behavior, semantic roles, labels, focus visibility, and disabled-state reason copy.
23. If local repo truth differs from this package, classify the drift and proceed only when the change can be safely aligned without overwriting operator-owned work.

## Scope

Improve shell/canvas presentation and host-fit resilience so PCC reads as a contained command-center product surface inside SharePoint, not as a loose collection of cards dropped into a page.

This prompt is authorized to adjust only the shell/canvas/bento-frame layer needed to:

- improve the visual seam between SharePoint chrome and the PCC surface;
- improve the perceived product container, surface background, and canvas depth;
- prevent horizontal overflow/clipping across the supported responsive footprint modes;
- preserve clean scroll behavior without sticky/fixed takeover conflicts;
- preserve active-panel ownership on shell `main[role="tabpanel"]`;
- preserve bento direct-child structure and row-span behavior;
- add small stable data markers only when needed for evidence/tests.

## Explicit Non-Scope

Do **not** use this prompt to implement later Prompt 04+ work:

- no command-header redesign beyond shell spacing/seam support;
- no hero content restructuring;
- no tab bar or module launcher redesign;
- no analytics card work;
- no card taxonomy/content rewrite except CSS primitives that support shell/canvas hierarchy;
- no surface-specific module choreography;
- no evidence regeneration except local test artifacts produced by required validations.

If you discover a later-prompt issue while working, document it in closeout as a downstream finding. Do not fix it in this prompt.

## Expected File Targets

Inspect first, then edit only the files genuinely needed. Expected targets may include:

```text
apps/project-control-center/src/shell/PccShell.tsx
apps/project-control-center/src/shell/PccShell.module.css
apps/project-control-center/src/layout/PccBentoGrid.tsx
apps/project-control-center/src/layout/PccBentoGrid.module.css
apps/project-control-center/src/layout/PccDashboardCard.module.css
apps/project-control-center/src/layout/footprints.ts
apps/project-control-center/src/tests/*Shell*
apps/project-control-center/src/tests/*Bento*
apps/project-control-center/src/tests/*Surface*
```

Do not edit all listed files by default. Keep the diff narrow. Prefer CSS/module refinements and test additions over structural rewrites.

## Allowed Changes

- PCC-scoped CSS refinements to shell, canvas, bento grid surface, and dashboard-card frame behavior.
- Narrow TSX marker additions only if they improve test/evidence stability and do not alter product behavior.
- Focused tests for:
  - active-panel ownership;
  - no card-level `data-pcc-active-surface-panel` ownership;
  - no sidebar structure;
  - bento direct-child posture;
  - shell/canvas host-fit markers;
  - overflow/clipping guardrails where existing test infrastructure supports it.
- Targeted documentation note in closeout only; do not create new planning docs unless explicitly necessary.

## Prohibited Changes

- Do not reorder shell children unless necessary and explicitly justified in closeout.
- Do not introduce sticky/fixed positioning that conflicts with SharePoint chrome.
- Do not add global CSS resets outside PCC scope.
- Do not modify the eight primary-tab model.
- Do not move active-panel ownership to any bento card, compatibility card, or inner wrapper.
- Do not add sidebar, drawer-navigation, or persistent left-rail layout.
- Do not weaken or delete existing shell, surface, accessibility, or bento tests.
- Do not change package versions, manifest versions, dependencies, or lockfile.
- Do not regenerate hosted/live screenshot evidence.
- Do not edit `package_manifest.json` or clean up historical plan references in this prompt.
- Do not collapse README duplicate-heading drift in this prompt unless directly required by changed runtime evidence instructions, which is not expected.

## Required Pre-Edit Checks

Run and record:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git rev-parse origin/main
git log --oneline -5
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

Then verify:

- local HEAD is at or after `d7ff02968117ebcc66e81144ec4273bbd1d2ea56`;
- working tree is clean before runtime edits;
- package / manifest version remains `1.0.0.219` before edits;
- `00_PCC_Phase_08_Product_Experience_Enhancement_Plan.md` exists;
- `01_Screenshot_Baseline_Findings.md` exists;
- no unrelated operator-owned WIP is present.

If any unrelated WIP exists, stop and return a blocked closeout.

## Required Implementation Steps

1. Inspect the current shell/canvas and bento layout implementation only as needed.
2. Inspect existing tests for shell ownership, active-panel markers, bento direct-child behavior, and surface layout invariants.
3. Review the Prompt 02 findings matrix for shell/host-fit and cross-surface findings only.
4. Identify the smallest safe set of CSS/marker/test changes that improves host-fit and product-container quality without changing surface content or navigation contracts.
5. Implement PCC-scoped shell/canvas refinements that improve:
   - outer PCC app containment inside SharePoint;
   - page-to-product seam;
   - shell background and canvas depth;
   - consistent horizontal padding and max-width behavior;
   - safe overflow containment without clipping legitimate content;
   - first-fold visual stability;
   - bento grid spacing consistency and row stability.
6. Confirm `main[role="tabpanel"]` remains the only element carrying `data-pcc-active-surface-panel`.
7. Confirm `PccBentoGrid` direct children remain valid dashboard-card grid children or intentionally tested grid children.
8. Add or update focused tests only where the current suite does not already protect the contract.
9. Run required validation.
10. Return closeout in chat using the required closeout format. Do not commit unless the operator explicitly asks.

## Design / UX Direction

The after-state should make the shell/canvas feel more like a premium command-center product embedded in SharePoint. Use the following direction without overbuilding:

- PCC should read as a deliberate product surface with an identifiable boundary and depth.
- The host seam should be cleaner, but PCC should not become a full-page takeover.
- The bento canvas should feel intentional and stable, not like free-floating cards on a blank page.
- Spacing should remain compact enough for construction operations workflows and external-display use.
- Visual improvements must support readability and hierarchy, not decorative density.
- Shell/canvas treatment should support later hero, tab, module launcher, analytics, and card-system prompts without forcing rework.

## Acceptance Criteria

- No PCC sidebar introduced.
- No global CSS reset introduced.
- No horizontal overflow or clipping introduced by shell/canvas changes.
- `data-pcc-active-surface-panel` remains shell-owned on `main[role="tabpanel"]`.
- No card-level active-panel ownership exists.
- Bento direct-child invariant remains intact.
- Shell/canvas looks more intentional, contained, and productized inside SharePoint.
- Spacing remains compact and usable at standard laptop, desktop, and ultrawide footprints.
- Reduced-motion and accessibility behavior remain intact.
- No package, manifest, dependency, or lockfile change.
- Tests and typecheck pass.

## Required Validation

Run the following after edits:

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

If the test suite is large, still run the full package test command above unless it is impossible. If it fails, do not weaken tests. Diagnose whether the failure is caused by this prompt's changes, unrelated pre-existing drift, or environment instability. Record the classification in closeout.

Do not run hosted Playwright screenshot regeneration unless separately authorized by the operator.

## Required Manual Review Before Closeout

Before returning closeout, manually inspect the final diff and confirm:

- no sidebar or sidebar-like structure was added;
- no broad/global CSS reset was added;
- no active-panel marker moved into a card;
- no wrapper was inserted between bento grid and dashboard cards in a way that breaks layout;
- no `position: fixed` or unsafe sticky behavior was introduced;
- no new dependency, import, lockfile drift, package version, or manifest version change occurred;
- no end-user-facing developer copy was added;
- no raw one-off colors or decorative effects were introduced without token justification;
- no later-prompt work was accidentally implemented;
- no evidence directories were deleted or regenerated.

## Closeout Requirements

Use `templates/Closeout_Template.md` if available. Return closeout in chat unless the repo-local phase convention clearly requires a saved closeout file.

Include:

- Verdict.
- Prompt number and title.
- Branch.
- Starting and ending HEAD.
- Local drift classification.
- Package / manifest version before and after.
- Lockfile md5 before and after.
- Files changed with change summaries.
- Tests run and results.
- Evidence generated or blocked reason.
- Guardrails confirmed.
- Any residual risks or downstream follow-ups.
- Commit summary and description only if the operator explicitly requested a commit and a commit was actually authored.

## Proceed / Stop Rules

Proceed only if:

- repo truth is clean or safely classified;
- Prompt 01 and Prompt 02 artifacts are present;
- the planned diff remains shell/host-fit scoped;
- the implementation can preserve active-panel ownership, bento invariants, no-sidebar posture, no-writeback posture, and accessibility.

Stop and return a blocked closeout if:

- local repo has unrelated uncommitted changes;
- runtime model has drifted in a way this prompt cannot safely reconcile;
- the fix requires dependency/package/manifest/lockfile changes;
- the fix requires hosted evidence regeneration without operator authorization;
- the fix would require broad/global CSS resets or SharePoint chrome takeover;
- the fix would move active-panel ownership out of shell `main[role="tabpanel"]`.
