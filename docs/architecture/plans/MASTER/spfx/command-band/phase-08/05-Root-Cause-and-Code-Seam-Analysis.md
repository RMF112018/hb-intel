# 05 — Root Cause and Code Seam Analysis

## Objective
Identify the actual technical causes of the weak hosted result instead of treating the problem as a generic styling failure.

---

## Root Cause 01 — Hosted runtime parity is not yet proven
### Why this matters
The repo on `main` already contains:

- explicit `homepage-flagship` context threading
- a dedicated flagship context in the shared surface family
- materially upgraded flagship CSS
- container-query degradation rules
- persistent launch-chip and tile-grid grammar

The screenshot does not resemble that level of flagship treatment.

### Practical meaning
Before additional redesign work is trusted, the implementation must prove:

- the current tenant is running the current package
- the correct CSS is deployed
- the current `main` flagship path is the one actually rendering
- there is no stale deployment or stale asset drift

### Primary seams
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageEntryStack.tsx`
- `apps/hb-webparts/src/webparts/priorityActionsRail/PriorityActionsRail.tsx`
- `packages/ui-kit/src/HbcPriorityRail/HbcPriorityRailSurface.tsx`
- `packages/ui-kit/src/HbcPriorityRail/priority-rail.module.css`
- `apps/hb-webparts/config/package-solution.json`

---

## Root Cause 02 — Primary visible-set selection is still slice-then-group
### Why this matters
`resolveByBreakpoint(...)` still selects primary actions linearly, then grouping happens later.

### Practical failure it causes
A linear slice can easily produce:
- several singleton sections
- duplicated adjacent headings
- weak group balance
- poor use of flagship real estate

The code is effectively asking the render layer to rescue a badly curated visible set.

### Primary seams
- `apps/hb-webparts/src/homepage/data/priorityActionsNormalization.ts`
- `apps/hb-webparts/src/homepage/data/priorityActionsPresentation.ts`

### Corrective direction
Homepage flagship presentation needs a group-aware curation stage before final render, including:
- balancing across groups
- adjacency cleanup
- singleton compaction rules
- stronger featured-action selection

---

## Root Cause 03 — Sparse groups are rendered too literally
### Why this matters
Even a corrected visible set can still render badly if the render layer gives every sparse group a full section container and heading.

### Practical failure it causes
- blank card interiors
- heading repetition
- under-dense command field
- widget-like appearance

### Primary seams
- `packages/ui-kit/src/HbcPriorityRail/HbcPriorityRailSurface.tsx`
- `packages/ui-kit/src/HbcPriorityRail/types.ts`
- `packages/ui-kit/src/HbcPriorityRail/priority-rail.module.css`

### Corrective direction
Add homepage-flagship render rules such as:
- compact singleton sections
- merge or suppress redundant headings where appropriate
- promote featured action only where it improves scanability
- prevent section chrome from dominating the action field

---

## Root Cause 04 — Overflow strategy is still too timid on larger surfaces
### Why this matters
The shared family already supports:
- inline disclosure
- menu
- sheet

But the presentation resolution still leans too heavily toward inline disclosure on desktop/tablet modes.

### Practical failure it causes
The overflow layer reads like an appended afterthought rather than a deliberate secondary-command layer.

### Primary seams
- `apps/hb-webparts/src/homepage/data/priorityActionsPresentation.ts`
- `packages/ui-kit/src/HbcPriorityRail/HbcPriorityRailOverflow.tsx`
- `packages/ui-kit/src/HbcPriorityRail/priority-rail.module.css`

---

## Root Cause 05 — Authored layout modes are not producing enough materially distinct flagship outcomes
### Why this matters
The code has authored mode vocabulary, but much of it still normalizes into only a few visible outcomes.

### Practical failure it causes
Desktop, tablet, and compact states still feel too similar in real use.

### Primary seams
- `apps/hb-webparts/src/homepage/data/priorityActionsPresentation.ts`
- `apps/hb-webparts/src/webparts/priorityActionsRail/PriorityActionsRail.tsx`
- `packages/ui-kit/src/HbcPriorityRail/HbcPriorityRailSurface.tsx`
- `packages/ui-kit/src/HbcPriorityRail/priority-rail.module.css`

---

## Root Cause 06 — Closure proof is too weak relative to the sophistication of the surface
### Why this matters
Current tests prove important plumbing and accessibility basics, but they do not yet prove:
- curated flagship density
- singleton compaction
- real divergence by mode
- hosted parity against deployed output

### Primary seams
- `packages/ui-kit/src/HbcPriorityRail/__tests__/HbcPriorityRail.test.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/__tests__/hbHomepageEntryStack.test.tsx`

---

## Root Cause 07 — Contract honesty remains unfinished
### Why this matters
`stickyAfterHero` remains in the config contract.
If it is not materially implemented and validated, it is misleading product vocabulary.

### Primary seams
- `apps/hb-webparts/src/homepage/data/priorityActionsContracts.ts`
- any config read/write or preview seams that surface `stickyAfterHero`

---

## Final root-cause summary
The hosted result is weak because:

1. parity is unproven,
2. visible-set curation is too naïve,
3. sparse groups are rendered too literally,
4. overflow is still too timid on larger surfaces,
5. layout modes do not diverge enough,
6. proof is too weak,
7. and one contract still needs honesty cleanup.

Those are the real closure units.
