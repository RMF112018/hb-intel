# Phase 08 Prompt 09 — Project Home Experience Enhancement — Repo-Truth / Foleon Direction Updated

## Objective

Make **Project Home** feel like PCC’s daily command dashboard with a clear first-fold hierarchy, stronger end-user value, and surface composition that fully benefits from the Phase 08 command-surface and Foleon-direction card-system refinements already delivered.

**Priority Actions should dominate, Project Readiness and Document Control should support, analytics should explain insight, and the rest of the operational spine should feel purposeful.** Site Health remains part of the Project Home operational spine, but it is **not** one of the two headline supporting cards for this Prompt 09 first-fold hierarchy.

This is a bounded **Project Home composition and hierarchy** prompt. It is not a new workflow implementation, not an analytics redesign, not a shell/tab/hero redesign, and not a source-system integration change.

---

## Current Execution Baseline

Use the current pushed Prompt 07 Foleon-direction baseline as the operative repo-truth baseline unless local repo truth proves a newer, operator-authorized safe forward drift:

```text
Branch: main
Expected baseline HEAD: 3fee6e02b66fb86bcf208177bbd4be7d04001bfe
Prompt 07: committed and pushed
Package / manifest version posture: 1.0.0.221 aligned across PCC loci
Expected lockfile md5: 7c19ccfa8718a42f7f55ce178a626996
```

The prior version alignment to `1.0.0.221` is accepted as intentional. Do **not** roll it back.

If local repo truth is forward of `3fee6e02b...` because the Prompt 06 Foleon-direction tab-bar work has since been committed, classify that as safe forward drift only if:

1. The forward drift is committed/operator-authorized.
2. It does not already touch Project Home files within this prompt’s scope.
3. Package / manifest versions remain intentionally aligned.
4. Lockfile md5 remains unchanged.

If local Prompt 06 Foleon-direction WIP still exists as uncommitted work in `PccHorizontalTabs.module.css` or package/version files, record it as operator-owned and **do not edit, stage, reformat, or include it**. If that WIP conflicts with a clean validation posture, stop and report before editing.

---

## Required Pre-Edit Repo-Truth Gate

Before editing, run and record:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git rev-parse origin/main
git log --oneline -7
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

Proceed only if:

1. Branch is `main`.
2. HEAD is `3fee6e02b66fb86bcf208177bbd4be7d04001bfe` or safe forward-only committed/operator-authorized drift.
3. `origin/main` alignment or divergence is classified before edits.
4. Working tree is clean except explicitly identified operator-owned WIP that is out of scope and will remain untouched.
5. Lockfile md5 remains `7c19ccfa8718a42f7f55ce178a626996`.
6. Package / manifest version posture remains intentionally aligned at `1.0.0.221` or at a later operator-authorized aligned version.

If unrelated runtime, package, manifest, lockfile, evidence, or operator-owned WIP is present and not clearly classified, stop and report before editing.

---

## Global Execution Rules

1. Work in the `RMF112018/hb-intel` repo.
2. Treat this phase as **PCC Product Experience Enhancement**, not a CSS-only polish pass.
3. Preserve the current Phase 05/06/07/08 runtime architecture unless this prompt explicitly authorizes a narrow Project Home change.
4. Preserve the current eight primary-tab model exactly:
   - `project-home`
   - `core-tools`
   - `documents`
   - `estimating-preconstruction`
   - `startup-closeout`
   - `project-controls`
   - `cost-time`
   - `systems-administration`
5. Do not reintroduce a permanent PCC sidebar, rail, drawer, modal, portal, or left navigation.
6. Do not move `data-pcc-active-surface-panel` back to a card. It remains shell-owned on `main[role="tabpanel"]`.
7. Preserve the bento direct-child invariant. Do **not** add wrappers between `PccBentoGrid` and `PccDashboardCard`.
8. Do not add dependencies. Do not add `echarts-for-react`. Direct `echarts` usage remains the approved analytics approach.
9. Do not create live SharePoint, Graph, Procore, Sage, Azure, tenant, or app-catalog mutations.
10. Preserve read-only / preview / launch-only / no-writeback posture.
11. Do not introduce fake affordances. A non-working search/action/control must not appear live without clear preview or disabled state.
12. Do not put developer copy in the UI. Avoid end-user-visible words like `mock`, `placeholder`, `TODO`, `fixture`, `demo`, prompt numbers, wave names, repo terms, or implementation sequencing unless a governed preview/sample label already exists and is intentionally user-facing.
13. Do not weaken tests to pass. Update tests only when the expected product contract intentionally changes.
14. Use stable `[data-*]` markers and semantic roles for tests. Do not test CSS module class names as behavior contracts.
15. Do not re-read files that are still within current context or memory. Open only files required to verify repo truth, inspect drift, or make the scoped change.
16. Do not run `git add .`.
17. Do not commit or push unless the operator explicitly requests it after closeout.
18. Do not regenerate hosted / tenant / Playwright evidence unless explicitly authorized by the operator.

---

## Current Repo-Truth to Respect

At the Prompt 07 pushed baseline:

### Project Home render paths

- `PccProjectHome.tsx` renders the fixture path.
- `PccProjectHomeReadModelContent.tsx` renders the read-model path.
- Both paths currently render the same 12-card Project Home spine + analytics sequence before the read-model-only lifecycle / Ask HBI / Procore / detail tail.
- The read-model path appends:
  - `Lifecycle Timeline`
  - `Ask HBI — Grounded Project Answers`
  - `Procore snapshot`
  - `Project Memory`
  - `Project Lens`
  - `Related Records`

### Current fixture/read-model Project Home order before Prompt 09

```text
1. Priority Actions
2. Site Health Summary
3. Document Control Center
4. Action Exposure Mix
5. Project Health Trend
6. Project Readiness
7. Approvals & Checkpoints
8. Readiness / Approval Rollup
9. Missing Configurations
10. External Platforms
11. Team Snapshot
12. Recent Activity
```

### Current Project Home choreography / spans before Prompt 09

Operational card span overrides currently include:

```text
Priority Actions:        5 / 4  (12-column / standardLaptop)
Site Health Summary:     3 / 3
Document Control Center: 4 / 3
Project Readiness:       4 / 4
Approvals & Checkpoints: 4 / 3
Missing Configurations:  4 / 3
External Platforms:      4 / 3
Team Snapshot:           3 / 3
Recent Activity:         5 / 4
```

Analytics spans currently include:

```text
Action Exposure Mix:          4 / 3
Project Health Trend:         4 / 3
Readiness / Approval Rollup:  4 / 4
```

### Existing contracts that must remain intact

- `Project Intelligence` bento card is removed and must not return.
- `Priority Actions` is already the first bento card.
- `PccDashboardCard` now supports the Prompt 07 visual system and taxonomy markers:
  - `data-pcc-card-tier`
  - `data-pcc-card-region`
  - `data-pcc-card-tone`
  - `data-pcc-card-source-system`
  - plus all existing footprint/span/heading/source markers.
- Project Home gateway actions already use native button behavior with disabled reason copy and tested no-anchor/no-false-affordance contracts.
- Project Home analytics are preview/advisory cards. Prompt 12 owns deeper analytics insight refinements; this prompt may reposition analytics in the surface order but must not redesign chart data, titles, datasets, or source disclosure unless a narrow test correction is required.

---

## Governing Design Direction for Prompt 09

Project Home must read as the **daily project command dashboard** directly beneath the unified command surface delivered in Prompt 04 and refined in Prompts 05–07.

The first fold should answer, in this order:

1. **What needs action now?** → `Priority Actions`
2. **What must be ready or unblocked?** → `Project Readiness`
3. **What project records need trusted visibility?** → `Document Control Center`

Site Health remains important, but Prompt 09 should position it as a next-tier project posture card rather than one of the two headline first-fold supporting cards.

---

## Required Product / Layout Outcome

### 1. Re-choreograph the Project Home first fold

Reorder both Project Home render paths so the 12-card fixture/read-model shared sequence becomes:

```text
1. Priority Actions
2. Project Readiness
3. Document Control Center
4. Site Health Summary
5. Action Exposure Mix
6. Project Health Trend
7. Approvals & Checkpoints
8. Readiness / Approval Rollup
9. Missing Configurations
10. External Platforms
11. Team Snapshot
12. Recent Activity
```

The read-model path must preserve the same 12 cards in the same order, followed by its existing lifecycle/HBI/Procore/detail tail unchanged.

### 2. Adjust Project Home span choreography to support the new first-fold hierarchy

Update Project Home operational span overrides so the first two rows fill cleanly at both 12-column and 10-column modes:

#### New target operational spans

```text
Priority Actions:        5 / 4  (unchanged)
Project Readiness:       3 / 3  (from 4 / 4)
Document Control Center: 4 / 3  (unchanged)
Site Health Summary:     4 / 4  (from 3 / 3)
Approvals & Checkpoints: 4 / 3  (unchanged)
Missing Configurations:  4 / 3  (unchanged)
External Platforms:      4 / 3  (unchanged)
Team Snapshot:           3 / 3  (unchanged)
Recent Activity:         5 / 4  (unchanged)
```

#### Resulting intended row choreography

At largeLaptop / desktop / ultrawide (`12` columns):

```text
Row 1: Priority Actions 5 + Project Readiness 3 + Document Control Center 4 = 12
Row 2: Site Health Summary 4 + Action Exposure Mix 4 + Project Health Trend 4 = 12
Row 3: Approvals & Checkpoints 4 + Readiness / Approval Rollup 4 + Missing Configurations 4 = 12
Row 4: External Platforms 4 + Team Snapshot 3 + Recent Activity 5 = 12
```

At standardLaptop (`10` columns):

```text
Row 1: Priority Actions 4 + Project Readiness 3 + Document Control Center 3 = 10
Row 2: Site Health Summary 4 + Action Exposure Mix 3 + Project Health Trend 3 = 10
Row 3: Approvals & Checkpoints 3 + Readiness / Approval Rollup 4 + Missing Configurations 3 = 10
Row 4: External Platforms 3 + Team Snapshot 3 + Recent Activity 4 = 10
```

Do not alter tablet/phone footprint fallback behavior.

### 3. Promote Priority Actions visually using the Prompt 07 card system

Update `PccPriorityActionsCard` so it reads as the dominant first-fold card:

```tsx
tier="tier1"
region="operational"
```

- Keep `footprint="wide"`.
- Keep current gateway action behavior.
- Keep the Priority Actions rail behavior and all existing row-level no-false-affordance constraints.
- Do **not** convert the card root into an interactive control.
- Update tests that intentionally assert the old `tier2` posture.

### 4. Project Readiness and Document Control become the headline support cards

- Project Readiness moves directly behind Priority Actions in DOM/render order.
- Document Control Center remains one of the first-row support cards.
- Do not remove Site Health; reposition it into the second row with analytics.
- Do not alter gateway semantics:
  - Project Readiness continues to open Startup Center under the existing MVP navigation boundary.
  - Document Control continues to open Document Control.
  - Site Health continues to open Site Health.

### 5. Missing Configurations remains the exception / control card

Preserve:

- `tier="state"`
- `region="state"`
- visible severity pills
- next-step copy
- no-writeback posture
- gateway action semantics

Do not flatten it into a generic operational card.

### 6. Analytics remain explanatory, not decorative

- Keep the three existing analytics cards and their current preview/advisory content.
- Keep `projectHomeAnalytics.ts` unchanged unless a narrow compile/test repair is necessary.
- Prompt 09 may reposition analytics only through Project Home render order and row choreography; it must not rewrite chart datasets, titles, source labels, or analytics contracts.
- Prompt 12 owns deeper analytics insight enhancement.

### 7. Optional, bounded Project Home CSS refinement

If the first-fold composition reveals a clear visual imbalance after reordering, you may apply **small, token-only, Project-Home-scoped** CSS refinements in `PccProjectHome.module.css` to reinforce hierarchy and align with the Foleon-direction card system.

Allowed targets, only if useful:

- `.listRow`
- `.metricCell`
- `.sourceTile`
- `.healthRow`
- `.contextNote`
- Project Home gateway group presentation only if a visual imbalance becomes obvious after re-choreography

Constraints:

- No global resets.
- No raw colors.
- No new tokens.
- No hover/focus/cursor behavior that implies false affordance.
- Do not restyle shared shell, card primitive, tab bar, hero, or command-search components.
- Do not rework the Priority Actions rail component unless a direct visual regression from the card tier change requires a narrowly documented fix.

---

## Scope

Authorized Project Home scope:

### Primary runtime targets

```text
apps/project-control-center/src/surfaces/projectHome/PccProjectHome.tsx
apps/project-control-center/src/surfaces/projectHome/PccProjectHomeReadModelContent.tsx
apps/project-control-center/src/surfaces/projectHome/projectHomeChoreography.ts
apps/project-control-center/src/surfaces/projectHome/PccPriorityActionsCard.tsx
```

### Conditional runtime target

```text
apps/project-control-center/src/surfaces/projectHome/PccProjectHome.module.css
```

Touch the CSS module only if needed to improve the re-choreographed Project Home experience. If no CSS change is necessary, do not edit it.

### Test targets expected to change

```text
apps/project-control-center/src/tests/PccProjectHome.test.tsx
apps/project-control-center/src/tests/PccProjectHome.phase06Composition.test.tsx
apps/project-control-center/src/tests/PccPhase06RegressionCoverage.test.tsx
```

### Conditional test targets only if existing focused assertions require update

```text
apps/project-control-center/src/tests/*ProjectHome*
apps/project-control-center/src/tests/*Analytics*
```

---

## Explicit Non-Scope

Do not edit unless a narrow compile/test repair proves it is unavoidable and the closeout explicitly justifies it:

```text
apps/project-control-center/src/shell/**
apps/project-control-center/src/layout/PccDashboardCard.*
apps/project-control-center/src/layout/PccBentoGrid.*
apps/project-control-center/src/layout/footprints.ts
apps/project-control-center/src/analytics/**
apps/project-control-center/src/surfaces/projectHome/projectHomeAnalytics.ts
apps/project-control-center/src/surfaces/projectHome/PccSiteHealthSummaryCard.tsx
apps/project-control-center/src/surfaces/projectHome/PccDocumentControlCard.tsx
apps/project-control-center/src/surfaces/projectHome/PccProjectReadinessCard.tsx
apps/project-control-center/src/surfaces/projectHome/PccMissingConfigurationsCard.tsx
apps/project-control-center/src/surfaces/projectHome/PccApprovalsCheckpointsCard.tsx
apps/project-control-center/src/surfaces/projectHome/PccExternalSystemsCard.tsx
apps/project-control-center/src/surfaces/projectHome/PccTeamSnapshotCard.tsx
apps/project-control-center/src/surfaces/projectHome/PccRecentActivityCard.tsx
packages/models/**
package.json
pnpm-lock.yaml
**/package-solution.json
**/*.manifest.json
docs/architecture/evidence/**
```

The prompt’s intended runtime change is **composition and hierarchy**, not a rewrite of individual card domain content.

---

## Required Implementation Steps

1. Verify repo truth and drift classification.
2. Inspect the current Project Home fixture path, read-model path, choreography matrix, and the three Project Home composition/regression test files before editing.
3. Update `projectHomeChoreography.ts`:
   - Reorder `PROJECT_HOME_OPERATIONAL_CARD_KEYS` to the new operational sequence.
   - Adjust `projectReadiness` span override to `3 / 3`.
   - Adjust `siteHealthSummary` span override to `4 / 4`.
   - Preserve all gateway mappings and disabled reason copy exactly unless a test proves a copy defect.
4. Update `PccProjectHome.tsx` fixture-path card order to the new 12-card sequence.
5. Update `PccProjectHomeReadModelContent.tsx` to match the exact same first 12 cards/order.
6. Update `PccPriorityActionsCard.tsx` from `tier="tier2"` to `tier="tier1"` while preserving `region="operational"`.
7. Apply only necessary, bounded Project Home CSS polish if the re-choreography needs small visual balancing.
8. Update tests for:
   - New 12-card order.
   - New read-model first-12 order and full tail order.
   - New row grouping / row sums.
   - New span override matrices.
   - Priority Actions now tier1 operational.
   - `Project Intelligence` remains absent.
   - Direct-child bento invariant remains intact.
   - Shell-owned active-panel marker remains intact.
   - Gateway and no-anchor/no-writeback contracts remain green.
9. Run full validation.

---

## Testing Requirements

### Required behavior/contract assertions

Update or add tests proving:

1. Project Home fixture path renders the exact new 12-card order.
2. Project Home read-model path renders the same first 12 cards in the same order before the existing lifecycle/HBI/Procore/detail tail.
3. Operational-only filtered sequence reflects the new Project Home operational order:
   - Priority Actions
   - Project Readiness
   - Document Control Center
   - Site Health Summary
   - Approvals & Checkpoints
   - Missing Configurations
   - External Platforms
   - Team Snapshot
   - Recent Activity
4. Row choreography sums remain exact at 12 columns and 10 columns using the new row groupings above.
5. Span override matrices reflect:
   - `projectReadiness: 3 / 3`
   - `siteHealthSummary: 4 / 4`
   - all other operational and analytics spans unchanged.
6. Priority Actions is still first, now with:
   - `data-pcc-card-tier="tier1"`
   - `data-pcc-card-region="operational"`
   - no card-level `data-pcc-active-surface-panel` marker.
7. `Project Intelligence` remains absent from both fixture and read-model paths.
8. `main[role="tabpanel"][data-pcc-active-surface-panel="project-home"]` remains the sole active-panel semantic owner.
9. Every card remains a direct child of `[data-pcc-bento-grid]`.
10. No stray `grid-auto-flow: dense` or stranded-gap workaround is introduced.
11. Gateway actions remain buttons rather than live anchor launch URLs.
12. Existing card-specific severity/state markers remain intact. Use the repo’s actual markers, not a nonexistent generic “card kind/severity” contract. Examples include:
    - `data-pcc-priority-rail-action-tone`
    - `data-pcc-readiness-status`
    - `data-pcc-missing-config-severity`
    - `data-pcc-approval-state`
13. If `PccProjectHome.phase06Composition.test.tsx` comments or count descriptions are touched, correct any stale cardinality comments so the file remains self-consistent with the current 18-card read-model path.

Do **not** invent a new generic `data-pcc-card-kind` or `data-pcc-card-severity` contract in this prompt.

---

## Acceptance Criteria

- Project Home’s first fold is intentionally re-centered around:
  - Priority Actions as the dominant first card;
  - Project Readiness and Document Control as the primary support cards.
- Site Health remains present and useful but no longer claims the top supporting-card position in the first-fold hierarchy.
- The new row choreography fills cleanly at 12-column and 10-column modes with no stranded gap regression.
- Priority Actions uses the Prompt 07 card system for explicit visual prominence (`tier1` + `operational`).
- No `Project Intelligence` card returns.
- No duplicate header/overview card returns.
- Analytics remain present and logically placed without Prompt 12 scope creep.
- Missing Configurations remains an exception/control card.
- All gateway/no-writeback/no-anchor contracts remain intact.
- Bento direct-child and shell-owned active-panel invariants remain intact.
- All validations pass.

---

## Required Validation

Run:

```bash
git status --short
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm exec prettier --check \
  apps/project-control-center/src/surfaces/projectHome/PccProjectHome.tsx \
  apps/project-control-center/src/surfaces/projectHome/PccProjectHomeReadModelContent.tsx \
  apps/project-control-center/src/surfaces/projectHome/projectHomeChoreography.ts \
  apps/project-control-center/src/surfaces/projectHome/PccPriorityActionsCard.tsx \
  apps/project-control-center/src/tests/PccProjectHome.test.tsx \
  apps/project-control-center/src/tests/PccProjectHome.phase06Composition.test.tsx \
  apps/project-control-center/src/tests/PccPhase06RegressionCoverage.test.tsx

git diff --check
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
git status --short
```

If `PccProjectHome.module.css` changes, include it in the final Prettier `--check` set.

If Prettier fails, run targeted `pnpm exec prettier --write` only on changed files, then rerun `--check` and rerun tests so the validated artifact matches the final formatted artifact.

Do not broad-format unrelated files.

---

## Manual Diff Review Before Closeout

Confirm:

- No package / manifest / dependency / lockfile drift.
- No shell / tab / hero / command-search / card primitive / analytics primitive changes.
- No live data call or source-system writeback implication.
- No fake affordance.
- No card wrappers inserted between `PccBentoGrid` and `PccDashboardCard`.
- No card-level active-surface ownership reintroduced.
- No `Project Intelligence` card or duplicate header card reintroduced.
- New Project Home order is mirrored in fixture and read-model render paths.
- New choreography span matrix matches the approved first-fold rows.
- Priority Actions is visually promoted through existing card taxonomy rather than an ad hoc CSS workaround.
- Existing gateway copy/disabled-reason copy is preserved.
- Site Health remains present and tested.
- No raw color additions, no new tokens, no broad resets.
- No evidence directories touched.

---

## Evidence

Do not regenerate hosted/tenant/Playwright evidence in this prompt unless explicitly authorized.

Closeout must state:

- No screenshot/evidence generation occurred in Prompt 09.
- Final visual verification of the Project Home first-fold hierarchy, row choreography, and tier1 Priority Actions posture remains operator-review / Prompt 17 evidence scope.

---

## Closeout Requirements

Return closeout in chat using `templates/Closeout_Template.md` unless repo-local convention clearly requires a saved closeout file.

Include:

- Verdict.
- Prompt number/title.
- Branch.
- Starting and ending HEAD.
- Local drift classification.
- Package / manifest version posture.
- Lockfile md5 before/after.
- Files changed with precise summaries.
- Tests run and results.
- Evidence generated or blocked reason.
- Guardrails confirmed.
- Residual risks / Prompt 17 visual-review watchpoints.
- Commit summary and description only if the operator explicitly requested a commit and a commit was actually authored.
