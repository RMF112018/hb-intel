# Phase 08 Prompt 09C — Project Home Row-2 Bento Re-Choreography and Operational / Analytics Adjacency

## Role
Act as the implementation owner for **Phase 08 Prompt 09C** in the `RMF112018/hb-intel` repo. Execute this only after Prompt 09B is landed, validate the result, and return a concise but complete closeout.

---

## Baseline / Preflight
Before editing:

1. Confirm the actual current local branch and HEAD.
2. Confirm Prompt 09B is committed and present in local HEAD. The reviewed upstream baseline for this prompt is:
   ```text
   0159f408e3b81f223327afb84ce7d6624707dc52
   pcc: redesign project-home document control card feed tabs
   ```
   If local HEAD has moved forward, classify the drift and proceed only if the Prompt 09C scope can be merged safely.
3. Confirm the current aligned package / manifest posture remains operator-approved. The Prompt 09 follow-on sequence is still expected to begin from **`1.0.0.222`** unless newer intentional local drift has already been recorded.
4. Capture:
   ```bash
   git rev-parse --abbrev-ref HEAD
   git rev-parse HEAD
   git status --short
   md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
   ```
5. Preserve operator-owned WIP. Do not revert, normalize, restage, or clean up out-of-scope working-tree changes.
6. Re-open only the prompt-relevant files you will edit immediately before patching.

Do **not** re-read files still within current context or memory unless local drift is suspected, an exact edit location is needed, or a validation failure requires re-verification.

---

## Parallel Dedicated Document Control Surface Safety — Mandatory
Prompt 09C is a **Project Home choreography** prompt. Dedicated Document Control surface work may continue in parallel.

Rules:

- Do **not** edit any file under:
  ```text
  apps/project-control-center/src/surfaces/documents/
  ```
- Do **not** touch the Prompt 09B `PccDocumentControlCard` feed UI body, tab behavior, feed markers, or CSS in this prompt. Prompt 09B is complete.
- Do **not** revert concurrent Document Control model or Prompt 10 surface work.
- If shared model files drifted from parallel work, this prompt should not touch them.
- If local drift exists in Project Home files, merge only the precise Prompt 09C order/span changes into the latest local state and report the drift.

---

## Current Repo-Truth Anchors
Prompt 09C is **not** a broad first-fold redesign anymore. After Prompt 09B, the current Project Home implementation is already very close to the target. The remaining change is a focused **Row 2 re-choreography**.

### Current first-12 card order
Both `PccProjectHome.tsx` and `PccProjectHomeReadModelContent.tsx` currently render the first 12 cards in this order:

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

### Required Prompt 09C order
Prompt 09C changes **only Row 2 ordering**, producing:

1. Priority Actions
2. Project Readiness
3. Document Control Center
4. Action Exposure Mix
5. Site Health Summary
6. Project Health Trend
7. Approvals & Checkpoints
8. Readiness / Approval Rollup
9. Missing Configurations
10. External Platforms
11. Team Snapshot
12. Recent Activity

Rows 1, 3, and 4 retain the same card membership and the same semantic order.

### Current span state
Current repo truth already matches the desired target **except** for the Row 2 span allocation:

#### Current 12-column Row 2
- Site Health Summary — span **4**
- Action Exposure Mix — span **4**
- Project Health Trend — span **4**

#### Target 12-column Row 2
- Action Exposure Mix — span **5**
- Site Health Summary — span **3**
- Project Health Trend — span **4**

#### Current 10-column Row 2
- Site Health Summary — span **4**
- Action Exposure Mix — span **3**
- Project Health Trend — span **3**

#### Target 10-column Row 2
- Action Exposure Mix — span **4**
- Site Health Summary — span **3**
- Project Health Trend — span **3**

Everything else in the Prompt 09 first-fold matrix is already aligned and must remain unchanged.

---

## Objective
Refine the **first-fold / operational-dashboard section** of Project Home by:

1. moving `Action Exposure Mix` ahead of `Site Health Summary` in both Project Home render paths;
2. redistributing Row 2 spans so the analytics / operational pairing uses space more deliberately after the Prompt 09B Document Control compaction;
3. preserving every other first-fold card, tail card, gateway, card identity, and surface-level invariant.

This is a targeted **Row 2 adjacency + span** prompt, not a general bento rewrite.

---

## Product Decisions — Closed
1. Same 12-card first-fold universe is preserved.
2. Rows 1, 3, and 4 keep their existing card membership and existing span values.
3. Row 2 becomes:
   - `Action Exposure Mix`
   - `Site Health Summary`
   - `Project Health Trend`
4. `Action Exposure Mix` becomes the leading Row 2 card because it remains conceptually closest to `Priority Actions` and receives the larger analytical span.
5. `Site Health Summary` remains paired with `Project Health Trend` in the same row but narrows to a supporting operational-card span.
6. `Readiness / Approval Rollup` remains between `Approvals & Checkpoints` and `Missing Configurations`.
7. No read-model tail work lands here. Lifecycle / Ask HBI / Procore Snapshot / Project Memory / Project Lens / Related Records remain Prompt 09D territory.
8. No dense grid / masonry behavior is introduced:
   - no `grid-auto-flow: dense`;
   - no absolute positioning;
   - no reading-order instability;
   - no uncontrolled masonry.
9. If true masonry/dense behavior appears attractive during review, record it as a deferred architecture note only.

---

## Target Matrices

### Target 12-column choreography
At `largeLaptop`, `desktop`, and `ultrawide`:

#### Row 1 — unchanged
- Priority Actions — span 5
- Project Readiness — span 3
- Document Control Center — span 4

#### Row 2 — Prompt 09C change
- Action Exposure Mix — span 5
- Site Health Summary — span 3
- Project Health Trend — span 4

#### Row 3 — unchanged
- Approvals & Checkpoints — span 4
- Readiness / Approval Rollup — span 4
- Missing Configurations — span 4

#### Row 4 — unchanged
- External Platforms — span 4
- Team Snapshot — span 3
- Recent Activity — span 5

Each row sums to 12.

### Target 10-column choreography
At `standardLaptop`:

#### Row 1 — unchanged
- Priority Actions — span 4
- Project Readiness — span 3
- Document Control Center — span 3

#### Row 2 — Prompt 09C change
- Action Exposure Mix — span 4
- Site Health Summary — span 3
- Project Health Trend — span 3

#### Row 3 — unchanged
- Approvals & Checkpoints — span 3
- Readiness / Approval Rollup — span 4
- Missing Configurations — span 3

#### Row 4 — unchanged
- External Platforms — span 3
- Team Snapshot — span 3
- Recent Activity — span 4

Each row sums to 10.

### Smaller modes
Do not introduce new overrides for smaller responsive modes. Retain existing footprint behavior at smaller modes.

---

## Required Implementation

### 1. Reorder only the Row 2 first-fold render sequence
Update both:

```text
apps/project-control-center/src/surfaces/projectHome/PccProjectHome.tsx
apps/project-control-center/src/surfaces/projectHome/PccProjectHomeReadModelContent.tsx
```

Retarget only the Row 2 ordering:

#### Before
```text
Site Health Summary
Action Exposure Mix
Project Health Trend
```

#### After
```text
Action Exposure Mix
Site Health Summary
Project Health Trend
```

Do not:
- alter Row 1;
- alter Rows 3 or 4;
- alter lifecycle / read-model tail content;
- alter card props, gateways, titles, or card state mapping.

### 2. Update only the necessary span overrides
#### In `projectHomeChoreography.ts`
Change only:

```ts
siteHealthSummary: projectHomeSpan(4, 4)
```

to:

```ts
siteHealthSummary: projectHomeSpan(3, 3)
```

All other operational-card span overrides remain unchanged.

#### In `projectHomeAnalytics.ts`
Change only:

```ts
actionExposureMix: projectHomeAnalyticsSpan(4, 3)
```

to:

```ts
actionExposureMix: projectHomeAnalyticsSpan(5, 4)
```

All other analytics span overrides remain unchanged.

Do not modify analytics view-model content, chart data, chart kinds, titles, summaries, source labels, or analytics sample copy.

### 3. Update only stale order/span comments
Refresh comments or JSDoc **only where Prompt 09 Row 2 ordering or span math is explicitly enumerated**.

Expected candidates include:
- Row-order comments in tests;
- row-sum comments in `PccPhase06RegressionCoverage.test.tsx`;
- any source comments that explicitly state the old Row 2 sequence.

Do not churn unrelated commentary. The operational-only nine-card spine remains unchanged, so comments that describe only that filtered spine should not be rewritten merely for style.

---

## Test Updates — Required

### A. Exact order and composition tests
Update tests that lock the current first-12 order:

```text
apps/project-control-center/src/tests/PccProjectHome.phase06Composition.test.tsx
```

Required changes:
- `PROJECT_HOME_FIXTURE_ORDER` row 2 becomes:
  ```text
  Action Exposure Mix
  Site Health Summary
  Project Health Trend
  ```
- `READ_MODEL_FULL_ORDER` updates automatically through the first-12 order but preserves the existing lifecycle / Ask HBI / Procore / Memory / Lens / Related Records tail.
- Operational-only filtered spine remains unchanged.

### B. Operational span assertions
In `PccProjectHome.phase06Composition.test.tsx` update only:

#### 12-column operational span map
```text
Site Health Summary: 4 -> 3
```

#### standardLaptop operational span map
```text
Site Health Summary: 4 -> 3
```

No other operational-card span values should change.

### C. Analytics adjacency and analytics spans
Update:

```text
apps/project-control-center/src/tests/PccProjectHomeAnalyticsCards.test.tsx
```

Required changes:

1. Row 2 adjacency test must assert:
   ```text
   Action Exposure Mix
   < Site Health Summary
   < Project Health Trend
   < Approvals & Checkpoints
   ```
   Retire the old assertion that placed `Site Health Summary` before `Action Exposure Mix`.

2. Analytics span matrices:
   - 12-column:
     ```text
     actionExposureMix: 4 -> 5
     projectHealthTrend: 4 unchanged
     readinessApprovalRollup: 4 unchanged
     ```
   - standardLaptop:
     ```text
     actionExposureMix: 3 -> 4
     projectHealthTrend: 3 unchanged
     readinessApprovalRollup: 4 unchanged
     ```

No analytics source-label, sample-state, chart-marker, or dependency-guard assertions should be weakened.

### D. Row-sum regression coverage
Update:

```text
apps/project-control-center/src/tests/PccPhase06RegressionCoverage.test.tsx
```

Required changes:
- Row 2 label order:
  ```text
  ['Action Exposure Mix', 'Site Health Summary', 'Project Health Trend']
  ```
- Row 2 12-column comment:
  ```text
  Action Exposure Mix (5) + Site Health Summary (3) + Project Health Trend (4) = 12
  ```
- Row 2 10-column note remains same row membership, summing to 10 with:
  ```text
  4 + 3 + 3 = 10
  ```

Row-sum assertions must continue to pass at:
- `ultrawide`
- `desktop`
- `largeLaptop`
- `standardLaptop`

### E. Additional tests that may require targeted updates
Update only if they encode the prior first-12 row 2 sequence or span assumptions:

```text
apps/project-control-center/src/tests/PccProjectHome.test.tsx
```

If no first-12 order/span assertions in that file need adjustment, do not churn it.

---

## Hard Invariants to Preserve
Do not:
- edit `apps/project-control-center/src/surfaces/documents/`;
- edit `PccDocumentControlCard.tsx`;
- edit `PccProjectHome.module.css`;
- edit `projectHomeViewModel.ts`;
- edit `projectHomeAdapter.ts`;
- edit backend/functions or shared PCC model files;
- change card titles;
- change gateway semantics;
- change card state mapping;
- add/remove cards;
- alter read-model tail card composition;
- add package / manifest / dependency / lockfile changes;
- introduce `grid-auto-flow: dense`;
- introduce new smaller-mode overrides;
- change direct-child bento invariants;
- change shell-owned active-panel marker ownership;
- reintroduce `Project Intelligence`.

---

## Expected File Scope
Likely touched:

```text
apps/project-control-center/src/surfaces/projectHome/PccProjectHome.tsx
apps/project-control-center/src/surfaces/projectHome/PccProjectHomeReadModelContent.tsx
apps/project-control-center/src/surfaces/projectHome/projectHomeChoreography.ts
apps/project-control-center/src/surfaces/projectHome/projectHomeAnalytics.ts
apps/project-control-center/src/tests/PccProjectHome.phase06Composition.test.tsx
apps/project-control-center/src/tests/PccProjectHomeAnalyticsCards.test.tsx
apps/project-control-center/src/tests/PccPhase06RegressionCoverage.test.tsx
```

Possibly touched only if repo-truth shows row-order assumptions there:

```text
apps/project-control-center/src/tests/PccProjectHome.test.tsx
```

Do not touch Prompt 09B feed-card implementation or tests unless an unexpected compile failure demonstrates a truly necessary adjustment. If that occurs, classify it precisely in closeout.

---

## Validation
Run at minimum:

```bash
git status --short
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm exec prettier --check <all Prompt 09C touched files>
git diff --check
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
git status --short
```

If `git diff --check` is red due pre-existing unrelated operator-owned WIP, classify the exact file and state whether any Prompt 09C-touched file contributes to the failure. Do not claim a clean diff check when the command is red.

---

## Closeout Format
Return:

1. Verdict: `PASS` / `BLOCKED`
2. Starting and ending HEAD
3. Version posture observed
4. Files changed
5. Exact Prompt 09C delta summary:
   - Row 2 order changed from `Site Health Summary -> Action Exposure Mix -> Project Health Trend`
     to `Action Exposure Mix -> Site Health Summary -> Project Health Trend`;
   - `Action Exposure Mix` span changed `4/3 -> 5/4`;
   - `Site Health Summary` span changed `4/4 -> 3/3`;
   - all other first-fold card spans unchanged.
6. Final 12-column row matrix
7. Final 10-column row matrix
8. Tests updated
9. Validation results
10. Explicit statement that:
    - dedicated Documents surface files were untouched;
    - Prompt 09B `PccDocumentControlCard` feed UI files were untouched;
    - read-model tail composition was untouched.
11. Lockfile MD5 before/after
12. Commit summary and description if committed
13. Deferred architecture note only if dense/masonry behavior was considered but not implemented
