# Phase 08 Prompt 09D — Project Home Read-Model Tail Bento Re-Choreography

## Role
Act as the implementation owner for Phase 08 Prompt 09D. Execute after Prompt 09C lands.

## Baseline / Preflight
Before editing:
1. Confirm Prompt 09C is present in HEAD.
2. Confirm current branch / HEAD.
3. Confirm aligned package/manifest posture using the current operator-approved baseline.
4. Capture `git status --short`.
5. Preserve operator WIP.

Do **not** re-read files still within current context or memory unless local drift is suspected or an exact edit location is needed.

## Parallel Document Control Surface Safety — Mandatory
The dedicated Document Control surface is being worked in parallel. Prompt 09D must not disrupt it.

Rules:
- Do not edit any file under `apps/project-control-center/src/surfaces/documents/`.
- Do not touch Prompt 09A/09B feed contract or card body unless a compile issue from prior work is proven.
- Do not alter shared Document Control model files in this prompt.

## Objective
Refine the **read-model-only tail** of Project Home so the lower page no longer reads as a loose vertical spillover with large whitespace pockets.

Tail cards currently include:
- Lifecycle Timeline
- Ask HBI — Grounded Project Answers
- Procore snapshot
- Project Memory
- Project Lens
- Related Records

The deployed tenant screenshots showed:
- large blank canvas areas between tail cards;
- height mismatches that make the page feel unfinished;
- weak visual grouping between related intelligence cards.

Prompt 09D should establish a deliberate, deterministic tail choreography.

## Dynamic-Best-Fit Definition — Closed
Use deterministic responsive choreography:
- explicit render ordering;
- explicit tail span override matrices;
- pair cards with related content and comparable visual weight where practical.

Do not introduce:
- uncontrolled masonry;
- `grid-auto-flow: dense`;
- absolute positioning;
- DOM order that conflicts with intended reading order.

## Target Tail Composition — Closed

### Desired Tail Sequence
1. Lifecycle Timeline
2. Procore snapshot
3. Ask HBI — Grounded Project Answers
4. Project Memory
5. Related Records
6. Project Lens

### Rationale
- `Lifecycle Timeline` anchors the tail section and should transition from operational dashboard into historical/project context.
- `Procore snapshot` is a compact source-posture companion that can sit beside Lifecycle without consuming a full row.
- `Ask HBI` and `Project Memory` should visually pair as grounded context + retained project knowledge.
- `Related Records` and `Project Lens` should close the tail with traceability and viewing context.

## Target 12-Column Tail Choreography
At `largeLaptop`, `desktop`, `ultrawide`:

### Tail Row 1
- Lifecycle Timeline — span 8
- Procore snapshot — span 4

### Tail Row 2
- Ask HBI — Grounded Project Answers — span 8
- Project Memory — span 4

### Tail Row 3
- Related Records — span 8
- Project Lens — span 4

Each row sums to 12.

## Target 10-Column Tail Choreography
At `standardLaptop`:

### Tail Row 1
- Lifecycle Timeline — span 7
- Procore snapshot — span 3

### Tail Row 2
- Ask HBI — Grounded Project Answers — span 7
- Project Memory — span 3

### Tail Row 3
- Related Records — span 7
- Project Lens — span 3

Each row sums to 10.

## Required Implementation

### 1. Tail-specific choreography seam
Create or extend a focused Project Home tail choreography seam. Prefer a new dedicated file if it keeps the operational/analytics choreography contract cleaner, for example:
- `projectHomeTailChoreography.ts`

The seam should expose:
- tail span overrides by card;
- optionally a canonical tail title/order list for tests.

Do not overload unrelated operational card choreography if a separate tail seam is cleaner and locally consistent.

### 2. Thread span overrides into tail cards
The following card renderers may need optional `spanOverrides` props added:
- `PccProjectHomeUnifiedLifecycleSection` cards:
  - Lifecycle Timeline
  - Project Memory
  - Project Lens
  - Related Records
- `PccProjectHomeAskHbiSection`
- `PccProjectHomeProcoreSnapshotCard`

Use existing `PccDashboardCard` span-override patterns. Preserve:
- footprints;
- tiers;
- regions;
- loading/error preview behavior;
- HBI idle-on-mount behavior;
- Procore no-writeback posture.

### 3. Update render order
The current render path injects Ask HBI and Procore through `renderAfterTimeline`, then Memory/Lens/Related Records follow from the unified lifecycle section. Recompose the local Project Home read-model tail so the final direct-child card order matches the target sequence.

Do this without introducing wrappers between `PccBentoGrid` and cards.

### 4. Update docs/comments
Refresh in-file comments/JSDoc that describe tail order:
- `PccProjectHomeReadModelContent.tsx`
- `PccProjectHomeUnifiedLifecycleSection.tsx`
- any other touched tail files.

Do not leave stale order commentary behind.

### 5. Tests
Add/update tests to pin:
1. Tail order in the full read-model sequence.
2. Tail span overrides at 12-column modes.
3. Tail span overrides at standardLaptop.
4. TabletLandscape / smaller modes fall back to footprint behavior unless existing repo policy says otherwise.
5. Direct-child bento invariant still holds.
6. HBI remains idle-on-mount.
7. Procore snapshot remains preview/degraded-state truthful and no-writeback.
8. Shell-owned active panel marker remains unaffected.

Expected existing test files to inspect/update:
- `PccProjectHome.phase06Composition.test.tsx`
- `PccProjectHome.composition.test.tsx`
- any unified lifecycle integration closeout tests
- Ask HBI closeout tests only if tail order/span changes require them
- Procore snapshot tests only if span props are added

## Out of Scope / Hard Stops
- No Document Control surface edits.
- No Document Control card redesign in this prompt.
- No changes to first 12 Project Home card order except accidental test reshuffle corrections caused by tail sequence expectations.
- No live data / writeback / deep links.
- No package/manifest/version bump unless separately operator-owned.
- No lockfile changes.
- No dependency additions.
- No grid primitive rewrite.
- No `grid-auto-flow: dense`.

## Validation
Run:
```bash
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm exec prettier --check <all prompt-touched files>
git diff --check
```

Record lockfile MD5 before/after.

## Closeout Format
Return:
1. Verdict
2. Starting/ending HEAD
3. Changed files
4. Final read-model tail order
5. Final 12-column tail matrix
6. Final 10-column tail matrix
7. Validation results
8. Direct-child / HBI idle / Procore no-writeback guard confirmation
9. Explicit statement that Documents surface files were untouched
10. Lockfile MD5 before/after
11. Commit summary/description if committed
