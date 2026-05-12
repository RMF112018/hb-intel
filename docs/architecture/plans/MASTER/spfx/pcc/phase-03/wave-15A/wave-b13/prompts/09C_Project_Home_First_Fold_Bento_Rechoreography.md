# Phase 08 Prompt 09C — Project Home First-Fold Bento Re-Choreography and Operational/Analytics Adjacency

## Role
Act as the implementation owner for Phase 08 Prompt 09C. Execute this only after Prompt 09B lands and the `PccDocumentControlCard` has been materially compacted.

## Baseline / Preflight
Before editing:
1. Confirm Prompt 09B is present in HEAD.
2. Confirm current branch / HEAD.
3. Confirm current aligned package/manifest posture; the Prompt 09 package began from intentional `1.0.0.222`, but use the actual operator-approved current version at execution.
4. Capture `git status --short`.
5. Preserve operator WIP.

Do **not** re-read files still within current context or memory unless local drift is suspected or an exact edit location is needed.

## Parallel Document Control Surface Safety — Mandatory
Prompt 09C is a Project Home choreography prompt. Dedicated Document Control surface work is proceeding in parallel.

Rules:
- Do not edit any file under `apps/project-control-center/src/surfaces/documents/`.
- Do not rework Prompt 09B `PccDocumentControlCard` information architecture unless a minimal span/order integration change is required.
- Do not revert concurrent document-control model work.
- If shared model files drifted from parallel work, this prompt should not touch them.

## Objective
Refine the **first 12 Project Home cards** so the bento grid makes better use of available space and operational cards sit nearer to related analytics.

The deployed screenshots showed:
- excess dead space created by the pre-redesign tall Document Control card;
- related analytics and operational cards not always reading as paired systems;
- row composition that is semantically improving, but still not spatially optimized.

Prompt 09C should capitalize on the compact Prompt 09B Document Control card and re-choreograph the first-fold / operational-dashboard section.

## Dynamic-Best-Fit Definition — Closed
The user wants the bento to be “as dynamic as is realistic,” with cards shifting based on best fit within defined choreography parameters.

For Prompt 09C, “dynamic” means:
- responsive, deterministic span matrices by PCC responsive mode;
- card order and adjacency designed to fit observed content heights;
- cards may shift position/order within the Project Home operational/analytics block if that improves semantic clustering and utilization;
- keep semantic DOM order aligned with the intended reading order;
- do **not** introduce uncontrolled masonry, CSS `grid-auto-flow: dense`, absolute placement, or reading-order instability in this prompt.

If the agent believes dense/masonry behavior would be materially superior, record that as a **deferred architecture note**, not an implementation change.

## Target First-12 Composition — Closed
Keep the same 12-card universe:
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

### Rationale
- `Action Exposure Mix` should sit as close as practical to `Priority Actions`.
- `Project Health Trend` should sit as close as practical to `Site Health Summary`.
- `Readiness / Approval Rollup` should remain tightly associated with `Project Readiness` / `Approvals & Checkpoints`.
- The newly compacted `Document Control Center` card remains a first-fold support card.

## Target 12-Column Choreography
At `largeLaptop`, `desktop`, and `ultrawide`, implement this row intent:

### Row 1
- Priority Actions — span 5
- Project Readiness — span 3
- Document Control Center — span 4

### Row 2
- Action Exposure Mix — span 5
- Site Health Summary — span 3
- Project Health Trend — span 4

### Row 3
- Approvals & Checkpoints — span 4
- Readiness / Approval Rollup — span 4
- Missing Configurations — span 4

### Row 4
- External Platforms — span 4
- Team Snapshot — span 3
- Recent Activity — span 5

Each row sums to 12.

## Target 10-Column Choreography
At `standardLaptop`, implement:

### Row 1
- Priority Actions — span 4
- Project Readiness — span 3
- Document Control Center — span 3

### Row 2
- Action Exposure Mix — span 4
- Site Health Summary — span 3
- Project Health Trend — span 3

### Row 3
- Approvals & Checkpoints — span 3
- Readiness / Approval Rollup — span 4
- Missing Configurations — span 3

### Row 4
- External Platforms — span 3
- Team Snapshot — span 3
- Recent Activity — span 4

Each row sums to 10.

## Smaller Modes
Do not introduce new span overrides for smaller footprints unless repo-truth demonstrates an existing supported policy. Retain footprint behavior at smaller modes.

## Required Implementation Areas

### 1. Update operational / analytics ordering
Adjust both fixture and read-model Project Home render paths so the first 12 cards follow the target order above.

Expected files likely include:
- `PccProjectHome.tsx`
- `PccProjectHomeReadModelContent.tsx`

Update in-file comments/JSDoc that enumerate canonical order.

### 2. Update span override matrices
Update the operational and analytics span matrices so the new row groupings match the target.

Expected files likely include:
- `projectHomeChoreography.ts`
- `projectHomeAnalytics.ts`

Do not mutate unrelated analytics chart content.

### 3. Preserve card identity and behavior
Do not:
- change card titles;
- change gateway semantics;
- change card state mapping;
- add or remove cards;
- change the read-model tail in this prompt.

### 4. Tests
Update all order/span/row-sum/adjacency tests that encode the prior Prompt 09 composition.

Expected test surfaces likely include:
- `PccProjectHome.test.tsx`
- `PccProjectHome.composition.test.tsx`
- `PccProjectHome.phase06Composition.test.tsx`
- `PccProjectHomeAnalyticsCards.test.tsx`
- `PccPhase06RegressionCoverage.test.tsx`

Required test updates:
1. Canonical fixture order.
2. Canonical read-model first-12 order.
3. Operational-only spine sequence if tested separately.
4. Row-sum assertions for 12- and 10-column modes.
5. Span matrices.
6. Analytics adjacency:
   - Priority Actions precedes / is near Action Exposure Mix in the sequence;
   - Site Health Summary remains adjacent to Project Health Trend in the intended row;
   - Readiness Rollup remains between Approvals / Missing Configurations.
7. No Project Intelligence regression.
8. Bento direct-child invariant retained.
9. Shell-owned active panel marker retained.

## Out of Scope / Hard Stops
- No Documents surface edits.
- No card-body redesign beyond Prompt 09B integration.
- No read-model tail / Lifecycle / HBI / Memory / Lens / Related Records changes yet.
- No package/manifest/version bump unless separately operator-owned.
- No lockfile changes.
- No dependency additions.
- No `grid-auto-flow: dense`.
- No global CSS/grid primitive rewrite.

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
4. Final 12-column row matrix
5. Final 10-column row matrix
6. Tests updated
7. Validation results
8. Explicit statement that Documents surface files were untouched
9. Lockfile MD5 before/after
10. Commit summary/description if committed
11. Deferred architecture note if true masonry/dense behavior was considered but not implemented
