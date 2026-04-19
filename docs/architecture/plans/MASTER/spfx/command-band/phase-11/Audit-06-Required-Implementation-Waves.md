# Audit 06 — Required Implementation Waves

## Wave 1 — Launcher primitive replacement

### Goal
Replace the chip-band surface with a true launcher tile family for desktop and tablet.

### Main seams
- `packages/ui-kit/src/HbcHomepageLauncher/HbcHomepageLauncher.tsx`
- `packages/ui-kit/src/HbcHomepageLauncher/HbcHomepageLauncherChip.tsx`
- `packages/ui-kit/src/HbcHomepageLauncher/homepage-launcher.module.css`
- `packages/ui-kit/src/HbcHomepageLauncher/types.ts`

### Deliverables
- tile-family primitive
- stronger silhouette
- stronger icon block
- family-consistent spacing and hierarchy
- still container-aware
- still compatible with hosted launcher band integration

---

## Wave 2 — Inline overflow-entry tile

### Goal
Replace detached overflow trigger with an inline secondary launcher tile.

### Main seams
- `packages/ui-kit/src/HbcHomepageLauncher/HbcHomepageLauncherOverflow.tsx`
- `packages/ui-kit/src/HbcHomepageLauncher/homepage-launcher.module.css`
- `packages/ui-kit/src/HbcHomepageLauncher/types.ts`

### Deliverables
- orange secondary tile
- inline family membership
- retained accessibility
- desktop/tablet anchored overflow content model

---

## Wave 3 — Small-handheld launcher mode

### Goal
Introduce a true small-handheld mode:
- one entry tile
- drawer/sheet of all tools
- no reduced desktop row

### Main seams
- `packages/ui-kit/src/HbcHomepageLauncher/HbcHomepageLauncher.tsx`
- `packages/ui-kit/src/HbcHomepageLauncher/HbcHomepageLauncherOverflow.tsx`
- `packages/ui-kit/src/HbcHomepageLauncher/homepage-launcher.module.css`
- `apps/hb-webparts/src/homepage/data/priorityActionsLauncherAdapter.ts`
- `apps/hb-webparts/src/homepage/data/priorityActionsPresentation.ts`

### Deliverables
- explicit breakpoint trigger
- all-tools drawer data feed
- finger-safe mobile layout
- correct focus and dismissal behavior

---

## Wave 4 — Contract and breakpoint governance hardening

### Goal
Make the new modes first-class and inspectable.

### Main seams
- `packages/ui-kit/src/HbcHomepageLauncher/types.ts`
- `packages/ui-kit/src/HbcHomepageLauncher/constants.ts`
- `apps/hb-webparts/src/homepage/data/priorityActionsLauncherAdapter.ts`
- `apps/hb-webparts/src/homepage/data/priorityActionsPresentation.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/breakpointPolicy.ts`

### Deliverables
- explicit tile variants
- explicit handheld entry mode
- explicit all-tools drawer content semantics
- inspectable runtime markers

---

## Wave 5 — Proof and closure

### Goal
Make closure evidence-backed and regression-resistant.

### Main seams
- launcher-related tests in `apps/hb-webparts/src/homepage/__tests__/`
- any added ui-kit launcher tests
- runtime markers on launcher root / mobile drawer
- package version proof

### Deliverables
- rewritten tests
- screenshot set
- hosted DOM proof
- package parity proof
- closure notes tied to doctrine and benchmark rules
