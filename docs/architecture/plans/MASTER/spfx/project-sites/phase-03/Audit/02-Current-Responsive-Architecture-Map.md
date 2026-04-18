# Current Responsive Architecture Map

## 1. Mount and host seams

### `apps/project-sites/src/mount.tsx`
Responsibilities:
- mounts the app into the SharePoint host element
- wraps with `QueryClientProvider`
- forces light theme through `HbcThemeProvider(forceTheme='light')`
- normalizes shell-injected runtime config before handing it to `ProjectSitesRoot`

Responsive implication:
- Project Sites is a nested, SharePoint-hosted surface
- responsive behavior must be robust under page-section width, SharePoint chrome, browser zoom, and host-level overlays

### `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts`
Responsibilities:
- loads the IIFE bundle
- resolves host page year
- injects runtime config including `webPartProperties`, `assetBaseUrl`, and `hostPageYear`
- exposes property-pane year override for the Project Sites webpart

Responsive implication:
- Project Sites is not entitled to assume viewport ownership
- the shell passes enough context for the app to remain host-aware, but the responsive behavior is still owned inside the Project Sites package

## 2. Layout-mode seam

### Owner
`packages/spfx/src/webparts/projectSites/projectSitesLayoutMode.ts`

### Primary exports and symbols
- `PROJECT_SITES_WIDE_MIN_WIDTH = 1180`
- `PROJECT_SITES_MEDIUM_MIN_WIDTH = 820`
- `PROJECT_SITES_SHORT_HEIGHT_MAX = 559`
- `resolveProjectSitesLayoutMode(...)`
- `resolveProjectSitesContainerState(...)`
- `useProjectSitesContainerState(ref)`

### Current behavior
- width is measured from the rendered container
- height authority comes from `visualViewport.height` or `window.innerHeight`
- `short-height` forces `compact`
- only three named modes exist: `compact`, `medium`, `wide`

### Architectural verdict
Good foundation.  
Still too coarse for doctrine-required display-class intent.

## 3. Root-surface responsive ownership

### Owner
`packages/spfx/src/webparts/projectSites/ProjectSitesRoot.tsx`

### Major responsive sub-surfaces owned here
- header bar
- scope-source pill
- context-summary strip
- control bar
- active chips row
- filter panel
- loading skeleton
- card grid

### Current control-band styles most relevant to the audit
- `controlBar`
- `controlBarMedium`
- `controlBarCompact`
- `searchSlot`
- `searchSlotStacked`
- `controlCluster`
- `controlClusterStacked`
- `controlClusterCompact`
- `sortSelect`
- `compactScopeSelect`

### Current control-band behavior
- search/control clusters wrap safely
- both `medium` and `compact` stack key control-band regions
- only `compact` gets the scope `<select>` swap
- medium therefore still lacks a strong tablet-specific composition contract

### Current context and overhead seams
- `header`
- `scopeContextPill`
- `contextSummary`
- `activeChipsRow`
- filter-panel open/closed behavior

These seams are central to the “first-screen overhead” problem.

## 4. Grid seam

### Relevant styles and state
- `grid`
- `gridModeWide`
- `gridModeMedium`
- `gridModeCompact`
- `gridSparse`
- `visibleCount`
- `isSparse`

### Current behavior
- single column by default
- tablet and desktop use auto-fill minmax grids
- medium narrows the minimum card width
- compact forces single column
- sparse state caps cards with `minmax(320px, 380px)`

### Architectural verdict
Safe and predictable.  
Not yet deliberate enough for sparse desktop and ultrawide composition.

## 5. Card responsive seam

### Owner
`packages/spfx/src/webparts/projectSites/components/ProjectSiteCard.tsx`

### Relevant symbols
- `layoutMode`
- `isCompactLayout`
- `metadataItems`
- `identityRow`
- `identityChip`
- `accessConfidence`
- `statusMessage`
- `footerCompact`
- `openSiteActionCompact`
- `provisioningLabelCompact`

### Current behavior
- `compact` mostly affects footer posture and some spacing
- body-level information strategy remains largely unchanged across modes
- metadata description list remains present whenever data exists
- compact mode therefore reduces width stress better than height stress

### Architectural verdict
The card has **layout posture variance**, not a mature **information-density system**.

## 6. Supporting seams that affect responsive outcomes indirectly

### `projectSitesFilter.ts`
Not a direct layout seam, but it governs:
- filter chips
- sparse-result conditions
- search responsiveness
- visible result counts

### `types.ts`
Defines:
- scope model
- filter state
- sort options
- runtime context
- result contracts

Responsive implication:
- any responsive redesign that changes scope, sort, filter, or card-density behavior must stay compatible with these state contracts

### `normalizeProjectSiteEntry.ts`
Not directly responsive, but it determines which optional metadata fields exist and therefore how tall cards can become.

## 7. Current test/proof seams

### Tests present now
- `projectSitesLayoutMode.test.ts`
- `ProjectSitesRoot.test.tsx`
- `ProjectSiteCard.test.tsx`
- existing hook tests for data fetch and year loading

### What the proof layer currently does well
- protects the three-mode layout constants and short-height override
- verifies compact scope-selector swap
- verifies basic card compact behavior
- verifies much of the search/filter/sort interaction model

### What it still does not fully protect
- richer display-class intent
- tablet composition quality
- density suppression rules
- sparse wide recomposition
- hosted visual regression

## 8. Architecture summary in one sentence

Project Sites already has a credible measured-container responsive base, but most of the remaining weakness now sits in **mode granularity, control-band composition, card-density policy, and proof-of-closure depth**, not in the existence of a responsive foundation itself.
