# 06 — Prioritized Findings Register

## Severity model
- **P0** = closure blocker / cannot trust hosted judgment without this
- **P1** = major product-quality failure
- **P2** = meaningful quality/compliance hardening
- **P3** = secondary cleanup / contract honesty / polish

---

## Finding 01 — Hosted runtime parity is not proven
**Priority:** P0

### Issue
The screenshot does not reflect the stronger flagship path already present in `main`.

### Why it matters
Without parity proof, additional redesign work may solve the wrong problem.

### Primary files
- `HbHomepageEntryStack.tsx`
- `PriorityActionsRail.tsx`
- `HbcPriorityRailSurface.tsx`
- `priority-rail.module.css`
- `package-solution.json`

### Required closure condition
Prove the hosted tenant is running the current flagship path, or fix the package/export/deployment drift until it is.

---

## Finding 02 — Visible primary actions are selected linearly before group-aware curation
**Priority:** P1

### Issue
The visible set is sliced first, then grouped later.

### Why it matters
This directly creates singleton groups, duplicated headings, and weak balance.

### Required closure condition
Introduce homepage-flagship curation before final render.

---

## Finding 03 — Sparse sections are rendered too literally
**Priority:** P1

### Issue
Flagship render still gives too much structural weight to groups with too little visible content.

### Why it matters
This is a major cause of dead space and weak command density.

### Required closure condition
Add singleton-section compaction and redundant-heading suppression rules for flagship context.

---

## Finding 04 — Larger-surface overflow still reads as appended disclosure, not a secondary command layer
**Priority:** P1

### Issue
Desktop/tablet modes still lean too much on inline disclosure.

### Why it matters
The command band needs stronger primary-vs-secondary action rhythm.

### Required closure condition
Promote larger-surface overflow to anchored menu/popover behavior where appropriate, while preserving sheet behavior for small handheld states.

---

## Finding 05 — Layout mode vocabulary is not materially divergent enough at runtime
**Priority:** P2

### Issue
Authored modes exist, but the visible result still normalizes too aggressively.

### Why it matters
The adaptive behavior is technically credible but not product-strong enough to close.

### Required closure condition
Make desktop, tablet, and phone states produce clearly different flagship behaviors.

---

## Finding 06 — Flagship density and wide-state authority are still under-realized
**Priority:** P2

### Issue
Even after logic fixes, the flagship path still needs more confident density and width use.

### Why it matters
A homepage command band must feel deliberate, compact, and useful.

### Required closure condition
Tune tile density, spacing, and wide-state field authority after parity and curation are correct.

---

## Finding 07 — Tests do not yet prove closure-grade flagship behavior
**Priority:** P2

### Issue
Tests cover plumbing and a11y basics, but not the most important flagship quality rules.

### Required closure condition
Add tests for curation, sparse-group handling, layout divergence, and runtime markers.

---

## Finding 08 — `stickyAfterHero` contract honesty is unresolved
**Priority:** P3

### Issue
The contract exposes sticky behavior vocabulary that may not be meaningfully implemented.

### Required closure condition
Either implement it credibly and prove it, or remove / narrow the contract surface so it does not mislead maintainers.
