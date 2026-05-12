# Phase 08 Prompt 09D — Project Home Read-Model Tail Bento Re-Choreography

## Role
Act as the implementation owner for **Phase 08 Prompt 09D** in the `RMF112018/hb-intel` repo. Execute only after Prompt 09C is landed, validate the result, and return a concise but complete closeout.

---

## Baseline / Preflight
Before editing:

1. Confirm the actual current local branch and HEAD.
2. Confirm Prompt 09C is committed and present in local HEAD. The reviewed upstream runtime baseline for this prompt is:
   ```text
   0ff708201521ad722942057265345f523a62c7a8
   pcc: rechoreograph project-home row 2 spans and order
   ```
   If local HEAD has moved forward, classify the drift and proceed only if the Prompt 09D scope can be merged safely.
3. Confirm the current aligned package / manifest posture remains operator-approved. The Prompt 09 follow-on sequence is still expected to remain at **`1.0.0.222`** unless newer intentional local drift has already been recorded.
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
The dedicated Document Control surface may continue moving in parallel. Prompt 09D is a **Project Home read-model tail choreography** prompt and must not disrupt it.

Rules:

- Do **not** edit any file under:
  ```text
  apps/project-control-center/src/surfaces/documents/
  ```
- Do **not** touch Prompt 09A/09B Document Control home-feed contract, card body, feed markers, or feed CSS unless a compile failure proves a strictly necessary import adjustment. None is expected.
- Do **not** alter shared Document Control model files in this prompt.
- If local drift exists in Project Home or shared files, preserve it unless it directly conflicts with Prompt 09D, classify it in closeout, and merge only the tail choreography work.

---

## Current Repo-Truth Anchors
Prompt 09D must be executed against the actual current Project Home tail architecture, not against an abstract tail concept.

### Current read-model tail order
As of the reviewed Prompt 09C baseline, the read-model-only tail renders after the first 12 Project Home cards in this direct-child order:

1. Lifecycle Timeline
2. Ask HBI — Grounded Project Answers
3. Procore snapshot
4. Project Memory
5. Project Lens
6. Related Records

This order is currently locked in:
- `PccProjectHome.phase06Composition.test.tsx`
- `PccProjectHome.composition.test.tsx`
- `PccProjectHome.test.tsx`

### Current tail composition seam
The current render architecture is:

1. `PccProjectHomeReadModelContent.tsx`
   - renders `PccProjectHomeUnifiedLifecycleSection`;
   - injects a `renderAfterTimeline` fragment containing:
     ```text
     Ask HBI
     Procore snapshot
     ```

2. `PccProjectHomeUnifiedLifecycleSection.tsx`
   - renders:
     ```text
     Lifecycle Timeline
     {renderAfterTimeline}
     Project Memory
     Project Lens
     Related Records
     ```

Therefore, the Prompt 09D target order can be achieved with a **minimal deterministic recomposition**:

- In `renderAfterTimeline`, flip:
  ```text
  Ask HBI -> Procore snapshot
  ```
  to:
  ```text
  Procore snapshot -> Ask HBI
  ```

- Inside `PccProjectHomeUnifiedLifecycleSection`, reorder the lower three lifecycle detail cards from:
  ```text
  Project Memory -> Project Lens -> Related Records
  ```
  to:
  ```text
  Project Memory -> Related Records -> Project Lens
  ```

Do **not** introduce wrappers or a new grouping component to accomplish this. The existing fragment-based direct-child invariant must remain intact.

---

## Objective
Refine the **read-model-only Project Home tail** so the lower page transitions from operational dashboard cards into a deliberate, deterministic context/traceability sequence without the current loose vertical spillover feel.

Prompt 09D must:

1. establish the target tail order;
2. add explicit responsive span overrides for the six tail cards;
3. preserve the first 12 Project Home cards exactly as completed in Prompt 09C;
4. preserve Ask HBI idle-on-mount behavior;
5. preserve Procore snapshot read-only / no-writeback behavior;
6. preserve direct-child bento invariants and shell-owned active-panel ownership.

---

## Product Decisions — Closed

### Target tail sequence
The final read-model-only tail order is:

1. Lifecycle Timeline
2. Procore snapshot
3. Ask HBI — Grounded Project Answers
4. Project Memory
5. Related Records
6. Project Lens

### Rationale
- `Lifecycle Timeline` anchors the tail section and transitions the user from operational scan to project context.
- `Procore snapshot` is a compact source-posture companion beside Lifecycle.
- `Ask HBI` and `Project Memory` read as grounded interpretation plus retained institutional context.
- `Related Records` and `Project Lens` close the tail with traceability followed by user-facing perspective framing.

### Dynamic-best-fit definition
Use deterministic responsive choreography only:
- explicit render ordering;
- explicit tail span override matrices;
- related content paired by deliberate row composition;
- DOM order aligned with reading order.

Do **not** introduce:
- uncontrolled masonry;
- `grid-auto-flow: dense`;
- absolute positioning;
- wrapper grids between `PccBentoGrid` and `PccDashboardCard` direct children;
- DOM order that conflicts with intended reading order.

If true masonry/dense behavior appears attractive during review, record it as a deferred architecture note only.

---

## Target Tail Matrices

### 12-column modes
At `largeLaptop`, `desktop`, and `ultrawide`:

#### Tail Row 1
- Lifecycle Timeline — span 8
- Procore snapshot — span 4

#### Tail Row 2
- Ask HBI — Grounded Project Answers — span 8
- Project Memory — span 4

#### Tail Row 3
- Related Records — span 8
- Project Lens — span 4

Each row sums to 12.

### 10-column mode
At `standardLaptop`:

#### Tail Row 1
- Lifecycle Timeline — span 7
- Procore snapshot — span 3

#### Tail Row 2
- Ask HBI — Grounded Project Answers — span 7
- Project Memory — span 3

#### Tail Row 3
- Related Records — span 7
- Project Lens — span 3

Each row sums to 10.

### Smaller modes
Do not introduce new overrides for smaller responsive modes. Retain existing footprint behavior at smaller modes.

---

## Required Implementation

### 1. Create a dedicated tail choreography seam
Create:

```text
apps/project-control-center/src/surfaces/projectHome/projectHomeTailChoreography.ts
```

The seam must export:

1. A typed tail-card key union:
   ```ts
   export type PccProjectHomeTailCardKey =
     | 'lifecycleTimeline'
     | 'procoreSnapshot'
     | 'askHbiGrounding'
     | 'projectMemory'
     | 'relatedRecords'
     | 'projectLens';
   ```

2. A canonical tail title map:
   ```ts
   PROJECT_HOME_TAIL_CARD_TITLES
   ```

3. A canonical tail order list:
   ```ts
   PROJECT_HOME_TAIL_CARD_KEYS_IN_ORDER
   ```

4. A `projectHomeTailSpan(...)` helper consistent with existing Project Home span helpers.

5. A tail span override map:
   ```ts
   PROJECT_HOME_TAIL_SPAN_OVERRIDES
   ```

using:

```text
lifecycleTimeline: 8 / 7
procoreSnapshot: 4 / 3
askHbiGrounding: 8 / 7
projectMemory: 4 / 3
relatedRecords: 8 / 7
projectLens: 4 / 3
```

where the values are:

```text
12-column span / standardLaptop span
```

Do **not** place this matrix inside operational or analytics choreography files. Tail choreography is its own seam.

---

### 2. Apply span overrides to tail cards

#### A. Ask HBI card
Update:

```text
apps/project-control-center/src/surfaces/projectHome/PccProjectHomeAskHbiSection.tsx
```

Add an optional prop:

```ts
readonly spanOverrides?: PccCardSpanOverrides;
```

Forward it to the internal `PccDashboardCard`.

Do **not** change:
- title;
- footprint;
- tier;
- region;
- idle-on-mount `initialQuery={null}`;
- sample-query behavior;
- disclaimers or authority copy.

#### B. Procore snapshot card
Update:

```text
apps/project-control-center/src/surfaces/projectHome/PccProjectHomeProcoreSnapshotCard.tsx
```

Add an optional prop:

```ts
readonly spanOverrides?: PccCardSpanOverrides;
```

Forward it to the internal `PccDashboardCard`.

Do **not** change:
- title;
- footprint;
- tier;
- region;
- degraded-state rendering;
- source-boundary copy;
- no-writeback posture;
- preview/error state behavior.

#### C. Unified lifecycle section cards
Update:

```text
apps/project-control-center/src/surfaces/projectHome/PccProjectHomeUnifiedLifecycleSection.tsx
```

Import `PROJECT_HOME_TAIL_SPAN_OVERRIDES` directly from the new tail choreography seam and apply the relevant spans to the four internal `PccDashboardCard`s:

- `lifecycleTimeline`
- `projectMemory`
- `relatedRecords`
- `projectLens`

Do **not** add a new wrapper or abstract the section into a different layout primitive.

---

### 3. Recompose the tail order using the existing seams

#### A. Flip the `renderAfterTimeline` order
Update:

```text
apps/project-control-center/src/surfaces/projectHome/PccProjectHomeReadModelContent.tsx
```

Change the injected tail fragment from:

```text
Ask HBI
Procore snapshot
```

to:

```text
Procore snapshot
Ask HBI
```

Pass explicit tail span overrides:

```text
Procore snapshot -> PROJECT_HOME_TAIL_SPAN_OVERRIDES.procoreSnapshot
Ask HBI -> PROJECT_HOME_TAIL_SPAN_OVERRIDES.askHbiGrounding
```

#### B. Reorder the lower lifecycle cards
Inside:

```text
PccProjectHomeUnifiedLifecycleSection.tsx
```

Change the post-`renderAfterTimeline` lower-card sequence from:

```text
Project Memory
Project Lens
Related Records
```

to:

```text
Project Memory
Related Records
Project Lens
```

This yields the final direct-child tail order:

```text
Lifecycle Timeline
Procore snapshot
Ask HBI — Grounded Project Answers
Project Memory
Related Records
Project Lens
```

---

### 4. Refresh only stale order commentary
Update comments/JSDoc only where they explicitly state the old tail order or `Ask HBI -> Procore snapshot` slot posture.

Expected files:
- `PccProjectHomeReadModelContent.tsx`
- `PccProjectHomeUnifiedLifecycleSection.tsx`
- test files that enumerate full read-model order.

Do not churn unrelated commentary.

---

## Required Test Updates

### A. Update existing full-order composition tests
Update the tail order expectations in:

```text
apps/project-control-center/src/tests/PccProjectHome.phase06Composition.test.tsx
apps/project-control-center/src/tests/PccProjectHome.composition.test.tsx
apps/project-control-center/src/tests/PccProjectHome.test.tsx
```

The first 12 Project Home cards remain exactly as completed in Prompt 09C. Only the final six read-model tail titles move to:

```text
Lifecycle Timeline
Procore snapshot
Ask HBI — Grounded Project Answers
Project Memory
Related Records
Project Lens
```

In `PccProjectHome.test.tsx`, update the specific promoted-tail order test that currently asserts:
- Ask HBI before Procore snapshot;
- lower detail sequence after Procore snapshot in the old lens-before-records order.

It must instead assert:
- Lifecycle Timeline before Procore snapshot;
- Procore snapshot before Ask HBI;
- Ask HBI before Project Memory;
- Project Memory before Related Records;
- Related Records before Project Lens.

Do not weaken the direct-child, no-routing-marker, Ask HBI idle, or no-live-anchor assertions already present in that test.

---

### B. Add a dedicated tail choreography test
Create a focused test file:

```text
apps/project-control-center/src/tests/PccProjectHomeTailChoreography.test.tsx
```

This test suite must cover:

1. **Tail order on the read-model path**
   - final six direct child card titles match the target tail order.

2. **12-column span matrix**
   - at `desktop`, `largeLaptop`, and `ultrawide`:
     ```text
     Lifecycle Timeline = 8
     Procore snapshot = 4
     Ask HBI = 8
     Project Memory = 4
     Related Records = 8
     Project Lens = 4
     ```

3. **10-column span matrix**
   - at `standardLaptop`:
     ```text
     Lifecycle Timeline = 7
     Procore snapshot = 3
     Ask HBI = 7
     Project Memory = 3
     Related Records = 7
     Project Lens = 3
     ```

4. **Row-sum posture**
   - each tail row sums to 12 in 12-column modes;
   - each tail row sums to 10 at `standardLaptop`.

5. **Smaller-mode fallback**
   - at `tabletLandscape`, tail cards fall back to footprint span behavior with no tail override mode marker.

6. **Direct-child invariant**
   - each tail card remains a direct child of `[data-pcc-bento-grid]`.

7. **Guard continuity**
   - Ask HBI panel remains present and idle-on-mount:
     ```text
     data-pcc-ask-hbi-panel-state="idle"
     ```
   - Procore snapshot source-boundary marker remains present:
     ```text
     data-pcc-procore-source-boundary
     ```

Prefer title-scoped card lookup helpers and stable data attributes; do not assert CSS class names.

---

### C. Preserve focused behavior suites
Keep these suites green without weakening them:

```text
apps/project-control-center/src/tests/PccProjectHomeAskHbiSection.test.tsx
apps/project-control-center/src/tests/PccProcoreSurfaceCards.test.tsx
```

Only update them if the new optional `spanOverrides` prop requires a compile-safe type adjustment or if a focused override assertion is useful and narrowly scoped. No broader behavior rewrite is required.

---

## Hard Invariants to Preserve
Do not:
- edit `apps/project-control-center/src/surfaces/documents/`;
- edit Prompt 09A/09B Document Control feed files;
- change the first 12 Project Home card order or spans from the completed 09C posture;
- change card titles;
- change gateway semantics;
- change Ask HBI idle-on-mount behavior;
- change Procore snapshot degraded-state / no-writeback semantics;
- change read-model data contracts;
- change shared model files;
- change backend/functions;
- add package / manifest / dependency / lockfile changes;
- introduce `grid-auto-flow: dense`;
- introduce new smaller-mode overrides;
- introduce wrappers between `PccBentoGrid` and card direct children;
- change shell-owned active-panel marker ownership;
- reintroduce `Project Intelligence`.

---

## Expected File Scope
Likely touched:

```text
apps/project-control-center/src/surfaces/projectHome/projectHomeTailChoreography.ts
apps/project-control-center/src/surfaces/projectHome/PccProjectHomeReadModelContent.tsx
apps/project-control-center/src/surfaces/projectHome/PccProjectHomeUnifiedLifecycleSection.tsx
apps/project-control-center/src/surfaces/projectHome/PccProjectHomeAskHbiSection.tsx
apps/project-control-center/src/surfaces/projectHome/PccProjectHomeProcoreSnapshotCard.tsx
apps/project-control-center/src/tests/PccProjectHome.phase06Composition.test.tsx
apps/project-control-center/src/tests/PccProjectHome.composition.test.tsx
apps/project-control-center/src/tests/PccProjectHome.test.tsx
apps/project-control-center/src/tests/PccProjectHomeTailChoreography.test.tsx
```

Possibly touched only if the optional span prop additions require a tightly scoped adjustment:

```text
apps/project-control-center/src/tests/PccProjectHomeAskHbiSection.test.tsx
apps/project-control-center/src/tests/PccProcoreSurfaceCards.test.tsx
```

Do not touch unrelated operational/analytics choreography files unless a compile failure proves a strictly necessary import-only correction. None is expected.

---

## Validation
Run at minimum:

```bash
git status --short
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm exec prettier --check <all Prompt 09D touched files>
git diff --check
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
git status --short
```

If `git diff --check` is red due pre-existing unrelated operator-owned WIP, classify the exact file and state whether any Prompt 09D-touched file contributes to the failure. Do not claim a clean diff check when the command is red.

---

## Closeout Format
Return:

1. Verdict: `PASS` / `BLOCKED`
2. Starting and ending HEAD
3. Version posture observed
4. Files changed
5. Exact tail order delta:
   - old:
     ```text
     Lifecycle Timeline -> Ask HBI -> Procore snapshot -> Project Memory -> Project Lens -> Related Records
     ```
   - new:
     ```text
     Lifecycle Timeline -> Procore snapshot -> Ask HBI -> Project Memory -> Related Records -> Project Lens
     ```
6. Final 12-column tail matrix
7. Final 10-column tail matrix
8. Tail choreography seam summary
9. Tests updated / added
10. Validation results
11. Direct-child / Ask HBI idle / Procore no-writeback guard confirmation
12. Explicit untouched statement that:
    - dedicated Documents surface files were untouched;
    - Prompt 09A/09B Document Control home-feed files were untouched;
    - first-12 Project Home first-fold order and spans were untouched.
13. Lockfile MD5 before/after
14. Commit summary and description if committed
15. Deferred architecture note only if dense/masonry behavior was considered but not implemented
