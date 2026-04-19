# 06 — Implementation Waves and Closure Sequence

## Wave 1 — Outer fit contract
**Purpose:** create the single outer page-canvas contract.

**Primary files:**
- `HbHomepageEntryStack.tsx`
- `HbHomepageEntryStack.module.css`
- `HbHomepageShell.module.css`
- any new shared fit seam introduced for wrapper/shell consumption

**Must finish with:**
- a clearly named outer contract
- no ambiguity about who owns outer width/max-width/centering
- no regression of wrapper/shell ownership boundaries

## Wave 2 — Usable-width measurement
**Purpose:** make shell behavior derive from the right width truth.

**Primary files:**
- `useShellContainer.ts`
- `HbHomepageShell.tsx`
- any new measurement helper or utility
- tests for threshold behavior

**Must finish with:**
- usable width is intentional and inspectable
- entry-state and layout logic consume the corrected width truth

## Wave 3 — Wrapper-owned actions-region containment
**Purpose:** bind the top strip into the same fit contract without collapsing ownership boundaries.

**Primary files:**
- `HbHomepageEntryStack.tsx`
- `HbHomepageEntryStack.module.css`
- possibly `PriorityActionsRail.tsx` only where boundary proof requires it

**Must finish with:**
- actions strip aligned to the shared outer contract
- rail still outside shell semantics
- top strip may remain visually distinct without regressing fit

## Wave 4 — Diagnostics and proof
**Purpose:** make closure durable.

**Primary files:**
- `HbHomepageShell.tsx`
- `shellConformance.ts`
- current tests and any focused new tests/harnesses

**Must finish with:**
- inspectable width truth
- threshold tests
- no-overflow regression proof
- hosted validation matrix
- explicit closure report

## Closure rule
Do not call this work complete until all four waves are closed.
