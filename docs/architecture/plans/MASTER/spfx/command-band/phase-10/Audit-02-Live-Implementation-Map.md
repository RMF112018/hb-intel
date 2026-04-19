# Audit-02 — Live Implementation Map

## Purpose

Map the real active seams in `main` that govern the homepage launcher experience today.

## A. Runtime ownership map

### 1. Wrapper composition owner

**File:** `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageEntryStack.tsx`

Responsibilities:

- positions the launcher between hero and shell
- owns the actions region
- carries the outer-envelope metadata
- proves the launcher is wrapper-owned, not shell-hosted as a lane occupant

### 2. Homepage launcher runtime owner

**File:** `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageLauncherBand.tsx`

Responsibilities:

- resolves device class from the shared entry-state
- loads data with `usePriorityActionsData`
- filters by device
- partitions visible/overflow items
- renders loading, empty, and error states
- mounts `HbcHomepageLauncher`

### 3. Data acquisition owner

**File:** `apps/hb-webparts/src/homepage/data/usePriorityActionsData.ts`

Responsibilities:

- resolves the canonical host URL for the Priority Actions lists
- fetches config + item rows
- caches responses
- normalizes results indirectly through downstream helpers
- preserves audience/schedule behavior

This seam is strong and should be preserved.

### 4. Normalization owner

**File:** `apps/hb-webparts/src/homepage/data/priorityActionsNormalization.ts`

Responsibilities:

- maps raw SharePoint rows into `PriorityActionsItemNormalized`
- preserves `iconKey`
- preserves grouping fields
- preserves device-visibility flags
- preserves `openInNewTab`
- preserves scheduling and audience metadata

Important fact:
The normalized model is materially richer than the current homepage launcher chip model.

### 5. Presentation-resolution owner

**File:** `apps/hb-webparts/src/homepage/data/priorityActionsPresentation.ts`

Responsibilities:

- maps shell entry-state to Priority Actions device class
- governs menu vs sheet choice
- carries compatibility shims from the earlier rail family

### 6. Homepage adapter owner

**File:** `apps/hb-webparts/src/homepage/data/priorityActionsLauncherAdapter.ts`

Responsibilities:

- maps normalized items into the launcher chip contract
- maps device classes into homepage-launcher vocabulary
- partitions visible vs overflow chips

Important weakness:
This seam is currently the principal semantic compression point.

### 7. Shared launcher primitive owner

**Files:** `packages/ui-kit/src/HbcHomepageLauncher/*`

Responsibilities:

- root launcher band rendering
- chip rendering
- overflow menu/sheet rendering
- visible-count markers and surface markers
- final CSS behavior via container queries and breakpoint rules

## B. Legacy / adjacent seam that still exists but does not govern the homepage runtime

### Standalone rail path

**Files:**

- `apps/hb-webparts/src/webparts/priorityActionsRail/*`
- `packages/ui-kit/src/HbcPriorityRail/*`

Status:

- still real
- still usable in non-homepage paths
- still relevant as a comparison seam
- **not** the homepage runtime authority

## C. Key current implementation characteristics

### 1. Chip contract is too small

Current homepage chip model only carries:

- `id`
- `title`
- `href`
- `icon`
- `external`

That is too thin for the long-term homepage launcher role.

### 2. Current icon mapping is severity-driven, not service-driven

Current mapping prefers badge-variant-derived icons rather than authoritative service/tool semantics from `iconKey` or explicit service identity.

### 3. Current chip layout is equal-width stretch-driven

The current CSS makes primary chips stretch horizontally to fill the row, which causes overgrowth and awkward density when counts are low.

### 4. Overflow is flat

The current overflow surface renders as a simple flat list of items with mode switching between anchored menu and bottom sheet.

### 5. Runtime markers are already present

The current launcher root exposes version, device class, visible count, overflow count, overflow mode, and short-height state. This is a good seam to preserve and possibly expand.

## D. Most important live-implementation conclusion

The repo does **not** need a data-pipeline rewrite to fix the homepage launcher.

It needs:

- contract expansion
- semantic restoration at the adapter layer
- a better launcher primitive family
- stronger overflow information architecture
- governance cleanup around count rules and old authored knobs
