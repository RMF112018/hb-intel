# Phase 08 Prompt 02 — Screenshot Findings Matrix — UPDATED

## Objective

Create the repo-local Phase 08 screenshot findings matrix that converts the current PCC screenshot baseline into developer-actionable, surface-by-surface enhancement findings.

This prompt is a **docs/evidence planning prompt only**. It must not implement runtime changes. Its purpose is to make later Phase 08 prompts more precise by documenting what the screenshots show, what end-user problem each issue creates, what target state is required, and which later prompt/workstream should address it.

## Current Execution Baseline

Prompt 00 established the current Phase 08 execution baseline as:

```text
877493c31c3a8aa9e2316ca5d958b78b479be059
```

The package-generation baseline remains historical reference only:

```text
7d8bae430ab999d4fb38abe8de6689b89d8f4d27
```

Prompt 01 may have added or updated the canonical governing plan and README. Before editing, verify current repo truth and classify any carry-forward Prompt 01 documentation changes.

## Global Execution Rules

These rules apply to this prompt and every later Phase 08 prompt.

1. Work in the `RMF112018/hb-intel` repo.
2. Treat this phase as **PCC Product Experience Enhancement**, not a CSS-only polish pass.
3. Preserve the current Phase 05/06/07 runtime architecture unless a later prompt explicitly authorizes a narrow runtime change.
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
7. Preserve the bento direct-child invariant. Do not add wrappers between `PccBentoGrid` and `PccDashboardCard` unless a later runtime prompt intentionally authorizes and tests the wrapper as the grid child.
8. Do not add dependencies. Do not add `echarts-for-react`. `echarts` direct usage remains the approved analytics approach.
9. Do not create live SharePoint, Graph, Procore, Sage, Azure, tenant, or app-catalog mutations.
10. Preserve read-only / preview / launch-only / no-writeback posture.
11. Do not introduce fake affordances. A non-working search/action/control must not appear live without clear preview or disabled state.
12. Do not put developer copy in the UI. Avoid end-user-visible words like `mock`, `placeholder`, `TODO`, `fixture`, or `demo` unless a governed preview/sample label already exists and is intentionally user-facing.
13. Do not weaken tests to pass. Later runtime prompts may update tests only when the expected product contract has intentionally changed.
14. Use stable `[data-*]` markers and semantic roles for later test recommendations. Do not recommend CSS module class names as behavior contracts.
15. Do not re-read files that are still within the current context or memory. Only open files needed to verify current repo truth, inspect drift, locate screenshot evidence, or author the scoped findings document.
16. If local repo truth differs from this prompt, classify the drift before editing. Proceed only when the change can be safely aligned without overwriting operator-owned work.
17. Do not use broad/global CSS resets as a future recommendation. Any later runtime remediation must remain scoped to PCC-owned primitives, surfaces, or documented host-fit wrappers.
18. Do not recommend raw one-off color values. Later visual recommendations must point to existing PCC tokens, theme variables, or a specifically proposed token addition.
19. Do not use `git add .`.
20. Do not commit unless the operator explicitly instructs the agent to commit.

## Pre-Edit Repo-Truth Verification

Run and record the following before editing:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git rev-parse origin/main
git log --oneline -5
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

Also verify that the canonical Phase 08 plan exists:

```text
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b13/00_PCC_Phase_08_Product_Experience_Enhancement_Plan.md
```

If the canonical plan does not exist, stop and report that Prompt 01 must be completed first.

If the Prompt 01 canonical plan and README are present as modified/untracked carry-forward WIP, treat them as approved operator-owned Prompt 01 output only if no unrelated files are dirty. Do not overwrite them. Record this as carry-forward WIP in closeout.

## Scope

Create or update this findings document:

```text
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b13/01_Screenshot_Baseline_Findings.md
```

This prompt may read existing screenshot evidence under:

```text
docs/architecture/evidence/pcc-live/**
```

It may not regenerate live evidence unless the operator explicitly authorizes a separate evidence run.

## Allowed Changes

- Create or update `01_Screenshot_Baseline_Findings.md`.
- Add a small reference/link to the findings document from the Phase 08 README only if the README is already being maintained as the package index and the change is necessary for package navigability.
- Correct obvious path references in the findings document.
- No runtime source changes.

## Prohibited Changes

- Do not edit runtime source.
- Do not edit tests.
- Do not update lockfile.
- Do not change package or manifest versions.
- Do not add dependencies.
- Do not regenerate screenshots, Playwright evidence, tenant evidence, or app-catalog artifacts unless the operator explicitly authorizes it.
- Do not delete, rename, compress, or overwrite existing screenshot evidence.
- Do not alter historical evidence folders.
- Do not modify package manifest files unless the operator separately authorizes that follow-up.

## Evidence Discovery Requirements

1. Locate the latest relevant PCC screenshot baseline, prioritizing the `1.0.0.219` screenshot reliability / evidence package if present.
2. Identify the evidence source(s) used in the findings document by repo-relative path.
3. If a contact sheet is available, use it as the primary high-level visual baseline.
4. If individual surface screenshots are available, use them to confirm surface-level findings.
5. If a screenshot is missing for any of the eight surfaces, record that as an evidence gap rather than inventing a finding.
6. Do not claim final visual quality or flagship completion from screenshots alone. This matrix is an input to implementation, not the final scorecard.

## Required Analysis Dimensions

Evaluate every current primary tab against the following dimensions:

1. First-fold hierarchy and clarity.
2. Shell / hero / command-center strength.
3. Primary tab and module-navigation clarity.
4. Card hierarchy, density, rhythm, and visual separation.
5. Card usefulness and end-user operational value.
6. Redundant top-level bento-card risk.
7. Analytics clarity and whether the visual adds decision value.
8. Source trust / lineage / confidence visibility.
9. Interaction affordance clarity, including disabled/preview states.
10. No-writeback / launch-only clarity where external systems are referenced.
11. Visual appeal, premium feel, and perceived polish.
12. Accessibility red flags visible from screenshots, including contrast risk, focus/keyboard affordance risk, target density risk, and reduced-motion considerations.
13. Responsive/host-fit risk visible from screenshots, including horizontal clipping, compressed cards, excessive whitespace, or weak first-fold composition.

## Required Findings Matrix Structure

The findings document must include these sections.

### 1. Objective

State that the matrix converts screenshot evidence into developer-actionable Phase 08 findings and does not authorize runtime changes by itself.

### 2. Repo-Truth and Evidence Baseline

Include:

- Current HEAD.
- Current branch.
- Package/manifest version if inspected.
- Lockfile md5.
- Screenshot evidence paths reviewed.
- Missing screenshot/evidence gaps, if any.
- Statement that `877493c31...` is the current Phase 08 execution baseline unless local repo truth shows a newer accepted commit.

### 3. Executive Findings Summary

Provide 5–10 concise findings that describe the strongest cross-surface product-experience issues and opportunities.

Do not use generic language like “make it nicer.” Each summary finding must identify an observable issue and the desired target state.

### 4. Surface-by-Surface Matrix

Include one subsection for each current primary tab, in this exact order:

1. `project-home`
2. `core-tools`
3. `documents`
4. `estimating-preconstruction`
5. `startup-closeout`
6. `project-controls`
7. `cost-time`
8. `systems-administration`

For each surface, include a table with these columns:

| Finding ID | Evidence Path | Observation | End-User Impact | Target State | Later Prompt / Workstream | Guardrail / Risk | Acceptance Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- |

Rules:

- Each surface must have at least three concrete findings.
- At least one finding per surface must address hierarchy or visual appeal.
- At least one finding per applicable surface must address card usefulness, analytics clarity, or source trust.
- Findings must reference later prompts/workstreams from the canonical plan or README. If the exact prompt number is unclear, use the named workstream and mark the prompt number as “confirm from README,” rather than inventing a number.
- Findings must be implementation-guiding but must not include code.

### 5. Cross-Surface Findings

Include findings that apply across multiple surfaces, such as:

- shell/hero consistency;
- module launcher affordance;
- command/search preview posture;
- card taxonomy;
- analytics choreography;
- source-confidence treatment;
- no-writeback language;
- responsive host-fit;
- accessibility.

### 6. High-Impact Enhancements

List the highest-ROI improvements that should materially improve perceived quality and user usefulness.

### 7. High-Risk Enhancements

List changes that could accidentally violate guardrails, including:

- sidebar reintroduction;
- active-panel marker regression;
- bento wrapper regression;
- fake affordances;
- Sage mutation/writeback implication;
- dependency creep;
- broad/global CSS resets;
- raw one-off color decisions;
- redundant header card reintroduction.

### 8. Prompt Dependency Map

Map each later Phase 08 prompt/workstream to the findings it should address.

If Prompt 01’s canonical plan or README has a prompt map, use it as source truth. Do not invent new prompt names if the repo already defines them.

### 9. Acceptance Checklist for Later Prompts

Create a checklist later implementation prompts can use. Include:

- before/after screenshots;
- all eight surfaces;
- first-fold and full-page checks;
- module launcher open state;
- selected module state where applicable;
- command/search preview or disabled state where applicable;
- disabled/deferred module state;
- Cost & Time Sage cue / no-writeback clarity;
- Systems Administration source/config posture;
- standard laptop, desktop, and ultrawide viewport coverage where evidence tooling supports it;
- operator visual review before flagship-complete claim.

### 10. Open Evidence Gaps

Only evidence gaps may remain open. Do not leave implementation decisions open. If screenshot coverage is missing, state the exact missing evidence and which later evidence prompt should close it.

## Acceptance Criteria

- `01_Screenshot_Baseline_Findings.md` exists at the target path.
- Findings matrix covers all eight current primary tabs.
- Each surface includes at least three concrete, actionable findings.
- Each finding ties to a later prompt/workstream or explicitly notes that the prompt number must be confirmed from the canonical plan/README.
- Findings are grounded in screenshot evidence paths or clearly marked evidence gaps.
- High-impact and high-risk sections are present.
- No runtime code changed.
- No package/manifest/lockfile/dependency changes.
- No existing evidence deleted or overwritten.
- No generic “make it nicer” language.
- No developer copy is proposed for end-user UI.
- The matrix reinforces that final flagship-quality claims require screenshot evidence and operator visual review.

## Required Validation

Run:

```bash
git status --short
pnpm exec prettier --check docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b13/01_Screenshot_Baseline_Findings.md
git diff --check
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

Typecheck, unit tests, and Playwright are not required for this prompt unless runtime files were accidentally touched. If runtime files were touched, stop, revert the accidental runtime changes unless operator-owned, and report the issue.

## Closeout Requirements

Return closeout in chat unless the repo-local phase convention clearly requires a saved closeout file.

Use `templates/Closeout_Template.md` where applicable and include:

- Verdict.
- Prompt number and title.
- Branch.
- Starting and ending HEAD.
- Local drift classification.
- Current execution baseline used.
- Files changed.
- Evidence reviewed, with repo-relative paths.
- Evidence generated, or blocked/not-generated reason.
- Validation commands and results.
- Lockfile md5 before/after.
- Guardrails confirmed.
- Residual risks / follow-up.
- Commit summary and description only if the operator explicitly requested a commit and a commit was actually authored.
