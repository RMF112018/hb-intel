# Current Homepage Launcher Implementation Map

## Runtime ownership

The launcher is a **wrapper-owned entry-stack surface**, not a standalone homepage shell concern.

The active runtime chain is:

1. `HbHomepageEntryStack.tsx`
2. `HbHomepageLauncherBand.tsx`
3. shared Priority Actions data / normalization / adapter seams
4. `@hbc/ui-kit/homepage` launcher surface family (`HbcHomepageLauncher` and related tile/overflow components)

This is a positive architectural move. The launcher is now owned by the homepage entry stack rather than behaving like a loosely attached side module.

## Entrypoints

### Entry-stack integration
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageEntryStack.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageEntryStack.module.css`

This layer decides:
- hero region
- launcher region
- shell region
- spacing between those regions
- whether the launcher reads as a true pre-shell surface

### Launcher band wrapper
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageLauncherBand.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageLauncherBand.module.css`

This layer owns:
- container measurement for the launcher band
- device resolution derived from shared shell entry-state logic
- loading / empty / error state routing
- partition handoff into `HbcHomepageLauncher`
- surrounding launcher-band material / shelf treatment

### Shared shell-fit and breakpoint seams
- `apps/hb-webparts/src/webparts/hbHomepage/shell/breakpointPolicy.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/useShellContainer.ts`

These seams own:
- entry-state selection
- short-height override behavior
- authoritative usable width calculation
- launcher breakpoint mode derivation anchored to shell truth

## Data seams

### Data fetch + cache
- `apps/hb-webparts/src/homepage/data/usePriorityActionsData.js`

### Normalization / filtering
- `apps/hb-webparts/src/homepage/data/priorityActionsNormalization.ts`

Owns:
- row normalization
- audience filtering
- schedule filtering
- device filtering
- launcher visible-cap helpers

### Presentation resolution
- `apps/hb-webparts/src/homepage/data/priorityActionsPresentation.ts`

Owns:
- device resolution for launcher band
- handheld governance
- overflow governance
- density posture
- presentation mapping from shell entry-state

### Launcher adapter
- `apps/hb-webparts/src/homepage/data/priorityActionsLauncherAdapter.ts`

Owns:
- hard-coded priority ordering
- item → tile mapping
- governed icon resolution
- partitioning between primary and overflow
- handheld single-entry-all-tools behavior

## UI-kit presentation seams

### Launcher root
- `packages/ui-kit/src/HbcHomepageLauncher/HbcHomepageLauncher.tsx`

Owns:
- the main launcher surface section
- visible primary tile rendering
- overflow trigger selection
- handheld single-entry mode behavior
- data attributes for hosted proof

### Tile primitive
- `packages/ui-kit/src/HbcHomepageLauncher/HbcHomepageLauncherTile.tsx`

Owns:
- tile anatomy
- link semantics
- icon + caption rendering
- row vs drawer family behavior

### Overflow / drawer
- `packages/ui-kit/src/HbcHomepageLauncher/HbcHomepageLauncherOverflow.tsx`

Owns:
- `More tools` trigger
- `HB Toolbox` handheld trigger label
- bottom sheet lifecycle
- focus trap
- drawer rail sizing and keyboard scroll behavior
- all-tools drawer content rendering

### Styling contract
- `packages/ui-kit/src/HbcHomepageLauncher/homepage-launcher.module.css`
- `packages/ui-kit/src/HbcHomepageLauncher/variants.ts`
- `packages/ui-kit/src/HbcHomepageLauncher/constants.ts`

Owns:
- tile geometry
- row density
- drawer styling
- handheld trigger sizing
- container-query breakpoints
- visible-count expectations

## Test seams

### Presentation tests
- `apps/hb-webparts/src/homepage/__tests__/priorityActionsPresentation.test.ts`

### Adapter tests
- `apps/hb-webparts/src/homepage/__tests__/priorityActionsLauncherAdapter.test.ts`

These tests are meaningful and should be preserved, but they currently reinforce some UX decisions that should be reconsidered, especially:
- universal sheet overflow posture
- handheld all-tools drawer posture
- authoritative fixed visible-count assumptions without enough product-layer nuance

## Architectural conclusion

The implementation map is **not monolithic**. That is a major strength.

The current problem is **not** primarily that the code is tangled.

The current problem is that the architecture is now strong enough to support a premium launcher, but several **product decisions encoded inside it are still the wrong ones**:
- over-flattened hierarchy
- overuse of the sheet
- weak secondary IA
- over-dominant mobile overflow entry
- incomplete hosted-proof discipline
