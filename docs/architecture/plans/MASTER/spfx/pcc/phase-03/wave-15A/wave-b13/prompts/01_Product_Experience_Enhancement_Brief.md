# Phase 08 Prompt 01 — Product Experience Enhancement Brief

## Objective

Create or update the repo-local Phase 08 product experience brief that governs all subsequent enhancement prompts for:

```text
Phase 08 — PCC Product Experience Enhancement, Visual System Refinement, Accessibility, and Evidence Closeout
```

This prompt is **planning / documentation only**. It must not edit runtime source, tests, package files, manifests, lockfile, evidence screenshots, or generated assets unless this prompt explicitly allows a narrow documentation reference update.

The output must frame Phase 08 as a **product-experience enhancement initiative**, not a CSS-only polish pass. The resulting plan must be specific enough for later prompts to execute targeted visual, interaction, accessibility, and evidence work without leaving architectural or product decisions open.

## Current Execution Baseline

Prompt 00 established the current Phase 08 execution baseline:

```text
Branch: main
Current Phase 08 execution baseline HEAD: 877493c31c3a8aa9e2316ca5d958b78b479be059
Historical package baseline reference: 7d8bae430ab999d4fb38abe8de6689b89d8f4d27
Package / manifest version: 1.0.0.219
Lockfile md5: 7c19ccfa8718a42f7f55ce178a626996
```

Treat `877493c31c3a8aa9e2316ca5d958b78b479be059` as the current Phase 08 execution baseline unless local repo truth proves otherwise. Treat `7d8bae430ab999d4fb38abe8de6689b89d8f4d27` as historical package context only. Do not roll back, overwrite, or discount the forward package/evidence commits unless the operator explicitly instructs otherwise.

## Global Execution Rules

These rules apply to this prompt and every later Phase 08 prompt unless a later prompt explicitly narrows or strengthens them.

1. Work in the `RMF112018/hb-intel` repo.
2. Treat this phase as **PCC Product Experience Enhancement**, not a CSS-only polish pass.
3. Preserve the current Phase 05/06/07 runtime architecture unless a prompt explicitly authorizes a narrow contract revision.
4. Preserve the current eight primary-tab runtime model:
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
8. Do not add dependencies. Do not add `echarts-for-react`. Direct `echarts` usage remains the approved analytics approach.
9. Do not create live SharePoint, Graph, Procore, Sage, Azure, tenant, or app-catalog mutations.
10. Preserve read-only / preview / launch-only / no-writeback posture.
11. Do not weaken Sage no-writeback posture. Do not imply Sage mutation, sync, posting, update, or writeback.
12. Do not introduce fake affordances. A non-working search/action/control must not appear live without clear preview or disabled state and user-facing reason copy.
13. Do not hide disabled-state reason copy.
14. Do not put developer copy in the UI. Avoid end-user-visible words like `mock`, `placeholder`, `TODO`, `fixture`, or `demo` unless a governed preview/sample label already exists and is intentionally user-facing.
15. Do not weaken tests to pass. Update tests only when the expected product contract has intentionally changed and the reason is documented.
16. Use stable `[data-*]` markers and semantic roles for tests. Do not test CSS module class names as behavior contracts.
17. Do not introduce broad/global CSS resets as a runtime shortcut. Later runtime prompts must use scoped PCC primitives, tokens, component contracts, or targeted layout fixes.
18. Do not introduce raw one-off color values into the product direction. Later runtime prompts must use existing PCC tokens, theme variables, or intentionally documented token additions.
19. Do not re-read files that are still within the agent's current context or memory. Only open files needed to verify current repo truth, inspect drift, or make the scoped change.
20. If local repo truth differs from this package or Prompt 00 closeout, classify the drift before editing. Proceed only when the change can be safely aligned without overwriting operator-owned work.
21. Do not use `git add .`. Stage only files that are explicitly in this prompt's scope.
22. Do not delete, move, overwrite, or prune historical evidence unless the operator explicitly authorizes it.
23. Do not commit unless the operator explicitly instructs the agent to commit.

## Required Pre-Edit Repo-Truth Check

Before making any edits, run and record:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git rev-parse origin/main
git log --oneline -5
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

Also inspect, read-only, the package / manifest version posture and confirm whether all relevant PCC package/manifest locations remain aligned at `1.0.0.219` unless local repo truth has intentionally advanced.

If the working tree is not clean, classify each modified/untracked path as:

- operator-owned WIP;
- expected Phase 08 package/evidence drift;
- generated evidence output;
- unrelated local artifact;
- safe prompt-owned file.

Do not overwrite operator-owned WIP.

## Scope

Create or update the Phase 08 planning brief at the target path. The brief must become the governing plan for later Phase 08 work and must include:

1. Phase objective and success definition.
2. Current repo-truth baseline and historical baseline distinction.
3. Product-experience principles.
4. Visual system principles.
5. Card taxonomy and hierarchy rules.
6. Surface-by-surface intent for all eight tabs.
7. Shell / hero / tab bar / command center direction.
8. Bento grid and card composition rules.
9. Analytics card direction, including direct `echarts` posture and no `echarts-for-react`.
10. Accessibility and keyboard behavior rules.
11. Preview / launch-only / disabled-state / no-false-affordance rules.
12. No-writeback and source-of-record guardrails.
13. Evidence and screenshot acceptance plan.
14. Human/operator visual review requirement before any final flagship completion claim.
15. Later-prompt workstream map.
16. Closed decisions register with no open decisions left unresolved.
17. Validation and closeout expectations.
18. Explicit statement that redundant top-level bento cards are prohibited unless they provide operational value beyond repeating the hero/header.

The plan must be written for a developer implementing later prompts. It must be specific, product-facing, and actionable. Avoid vague language such as `make it nicer`, `modernize`, or `improve polish` unless accompanied by concrete implementation direction and evidence criteria.

## Expected File Targets

Primary target:

```text
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b13/00_PCC_Phase_08_Product_Experience_Enhancement_Plan.md
```

Secondary target only if it already exists or is needed to keep the package index accurate:

```text
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b13/README.md
```

If updating `README.md`, verify that prompt file names and sequencing match actual repo-local files. Correct any package-index mismatch discovered during this prompt, including prompt-name discrepancies between the README and the actual prompt files.

## Allowed Changes

- Create or update the Phase 08 plan document at the primary target path.
- Update the Phase 08 README only to keep package indexing, prompt mapping, baseline references, and usage instructions accurate.
- Add a closeout document only if the repository already uses a durable closeout-file convention for this phase and the path is clearly in-scope.

## Prohibited Changes

- Do not edit runtime source.
- Do not edit tests.
- Do not regenerate screenshots or live evidence.
- Do not delete existing screenshots or evidence.
- Do not update `pnpm-lock.yaml`.
- Do not change package versions or manifests.
- Do not add or remove dependencies.
- Do not alter app catalog, tenant, SharePoint, Graph, Procore, Sage, or Azure configuration.

## Required Plan Content

The plan must include the following sections, using clear headings:

1. **Objective**
   - Define Phase 08 as product-experience enhancement.
   - State that the goal is a more useful, premium, end-user-facing command-center experience.
   - State that this is not a CSS-only pass.

2. **Current Repo-Truth Baseline**
   - Record the Prompt 00 execution baseline HEAD.
   - Record package / manifest version and lockfile md5 from Prompt 00 unless local checks prove drift.
   - Distinguish the historical package baseline from the current execution baseline.

3. **Non-Negotiable Architecture Guardrails**
   - Eight-tab model.
   - No sidebar.
   - Shell-owned active-panel marker.
   - Bento direct-child invariant.
   - No dependency additions.
   - No `echarts-for-react`.
   - No live writeback or mutation.
   - Sage no-writeback posture.
   - No fake affordances.
   - No developer copy in UI.

4. **Target Product Experience**
   - Describe how PCC should feel to an end user after Phase 08.
   - Tie the direction to command-center usefulness, source confidence, action clarity, reduced visual flatness, and stronger hierarchy.
   - Avoid unsupported marketing language unless tied to measurable acceptance criteria.

5. **Visual System Direction**
   - Define use of depth, spacing, rhythm, typography, visual hierarchy, status treatment, and motion.
   - Require theme-token or PCC-token alignment.
   - Prohibit one-off visual hacks and broad/global CSS resets.

6. **Shell, Hero, and Navigation Direction**
   - Define expectations for the shell/host fit, project identity, hero band, tab bar, command/search preview posture, and module-launcher treatment.
   - Preserve no-sidebar posture.
   - Preserve accessible keyboard behavior.

7. **Card Taxonomy and Composition Rules**
   - Define card types such as primary, standard, supporting, action, insight, analytics, source-status, and launch/preview.
   - Explain when a card earns first-fold prominence.
   - Explicitly prohibit redundant top-level bento cards that merely repeat hero/header content.
   - Allow operational status cards only where they provide surface-specific value and do not recreate the duplicate-header problem.

8. **Surface-by-Surface Intent**
   - Provide concrete intent and enhancement direction for all eight tabs:
     - `project-home`
     - `core-tools`
     - `documents`
     - `estimating-preconstruction`
     - `startup-closeout`
     - `project-controls`
     - `cost-time`
     - `systems-administration`
   - Each surface must include:
     - intended user outcome;
     - first-fold priority;
     - card hierarchy direction;
     - source-confidence / disabled-state requirements where applicable;
     - future enhancement boundary where applicable.

9. **Analytics and Data Visualization Direction**
   - Confirm direct `echarts` only.
   - Explain where analytics should support decision-making, not decoration.
   - Require accessible summaries and non-color-only meaning.
   - Require no live data implication beyond current approved read-model posture.

10. **Accessibility, Keyboard, and Reduced-Motion Requirements**
    - Define expected keyboard behavior for tabs, launchers, controls, and preview states.
    - Require semantic roles and visible focus states.
    - Require `prefers-reduced-motion` handling for later runtime motion work.

11. **No-Writeback, Preview, and False-Affordance Rules**
    - Define launch-only and preview-only behavior.
    - Require disabled-state reason copy.
    - Prohibit UI that suggests unavailable mutation, sync, posting, or writeback.

12. **Evidence and Acceptance Plan**
    - Require later screenshot evidence across all eight surfaces.
    - Require first-fold and full-page screenshots where applicable.
    - Require module launcher open state, selected module state, command/search preview state, disabled/deferred state, Cost & Time Sage cue, and Systems Administration source/config posture evidence where applicable.
    - Require standard laptop, desktop, and ultrawide viewport coverage for final visual closeout.
    - Require before/after comparison notes.
    - Require scorecard mapping to the governing 56-point UI/UX doctrine or current repo-local equivalent.
    - State that Playwright is required evidence but not the final expert visual scorecard.
    - State that a final flagship completion claim requires screenshot evidence and operator visual review.

13. **Prompt Workstream Map**
    - Map later prompts/workstreams to the plan:
      - screenshot findings matrix;
      - shell/host fit;
      - hero/command center;
      - tab/module navigation;
      - card system;
      - surface-by-surface enhancements;
      - analytics enhancements;
      - accessibility/motion;
      - evidence closeout.

14. **Closed Decisions Register**
    - List key decisions as closed.
    - Do not leave `TBD`, `open decision`, or unresolved choice language unless it is explicitly marked out of Phase 08 scope and does not block implementation.

15. **Validation and Closeout Requirements**
    - Include expected validation commands and closeout content for Prompt 01 and later prompts.

## Required Steps

1. Run the required pre-edit repo-truth checks.
2. Inspect the existing Phase 08 wave-b13 directory and identify whether the target plan and README already exist.
3. Create or update the target plan document.
4. Update README only if needed to correct package indexing, baseline references, or prompt-file mapping.
5. Ensure the plan references the current eight-tab runtime model.
6. Ensure no open decisions remain.
7. Ensure the plan is specific enough for later prompts to execute without re-deciding architecture.
8. Ensure the plan includes the explicit evidence and operator visual review gates.
9. Run required validation.
10. Return a closeout using the closeout requirements below.

## Acceptance Criteria

- Plan exists at the target path.
- Plan treats `877493c31c3a8aa9e2316ca5d958b78b479be059` as the current Phase 08 execution baseline unless local repo truth proves otherwise.
- Plan uses the current eight-tab model.
- Plan explicitly prohibits sidebar, writeback, fake affordances, dependency additions, `echarts-for-react`, Sage mutation/writeback implications, and active-panel ownership regressions.
- Plan explicitly protects the bento direct-child invariant.
- Plan includes surface-by-surface intent for all eight tabs.
- Plan includes card taxonomy and visual-system direction.
- Plan includes evidence expectations and operator visual review before final flagship completion claims.
- Plan prohibits redundant top-level bento cards that only repeat hero/header content.
- Plan leaves no implementation-blocking decisions open.
- README prompt mapping is corrected if README is touched.
- No runtime code changed.
- No tests changed.
- No lockfile change.
- No package / manifest version change.

## Required Validation

Run:

```bash
git status --short
pnpm exec prettier --check docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b13/00_PCC_Phase_08_Product_Experience_Enhancement_Plan.md
git diff --check
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

If `README.md` is changed, also run:

```bash
pnpm exec prettier --check docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b13/README.md
```

If `pnpm exec prettier` is unavailable or fails for reasons unrelated to formatting, record the failure exactly and run the closest repo-local markdown formatting check available. Do not install dependencies.

## Closeout Requirements

Use `templates/Closeout_Template.md` if present and applicable. Return closeout in chat unless the repo-local phase convention clearly requires a saved closeout file.

Include:

- Verdict: PASS / PASS WITH NOTES / BLOCKED.
- Prompt number and title.
- Branch.
- Starting HEAD.
- Ending HEAD.
- Local drift classification.
- Files changed with concise change summary.
- Validation commands run and results.
- Lockfile md5 before/after.
- Package / manifest version before/after.
- Evidence generated or blocked reason.
- Guardrails confirmed.
- Any residual risk or follow-up.
- Commit summary and description only if the operator explicitly requested a commit and a commit was actually authored.
