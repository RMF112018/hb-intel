# Current Runtime Architecture Map

## Runtime Ownership

### Hosted path in practice
The live Project Sites experience is not primarily owned by the direct `ProjectSitesWebPart.ts` class. The active hosted runtime is the **IIFE bundle + generic shell webpart** path:

1. `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts`
   - resolves bundle and CSS asset URLs
   - loads the app bundle via `SPComponentLoader.loadScript(...)`
   - injects runtime configuration
   - calls `appModule.mount(this.domElement, this.context, runtimeConfig)` from `render()`

2. `apps/project-sites/src/mount.tsx`
   - bootstraps SPFx auth
   - creates a `QueryClient`
   - creates a React root
   - renders `ProjectSitesRoot` inside `QueryClientProvider` and `HbcThemeProvider`

3. `packages/spfx/src/webparts/projectSites/ProjectSitesRoot.tsx`
   - loads available years
   - resolves initial scope authority
   - fetches project-site entries for the selected scope
   - derives facets and visible entries
   - renders header, control bar, filter panel, chips, loading states, and card grid

### Important contrast
`packages/spfx/src/webparts/projectSites/ProjectSitesWebPart.ts` contains a safer direct-SPFx pattern:
- bootstrap once in `onInit()`
- create `QueryClient` once
- create React root only if missing
- render incrementally
- clear on dispose

That direct pattern is **not** the same as the live IIFE shell path and is materially more stable.

## Data / Query Path

### Available years
`useAvailableYears.ts`
- uses React Query key `['project-sites-available-years']`
- reads from repository singleton
- stale time 10 minutes
- retry 1

### Project sites
`useProjectSites.ts`
- accepts `ProjectSitesScope | null`
- uses query key `['project-sites', scopeCacheKey(scope)]`
- server scope is coarse only:
  - year scope → filtered query
  - all scope → bounded read
- normalizes raw items into UI entries in the hook render path

### Repository adapter
`projectSitesRepository.ts`
- repository singleton
- PnPjs + SPFx context
- list title `Projects`
- year fetch = distinct years scan
- project fetch = explicit select contract, year filter or bounded all-scope read

## UI State Ownership

### Root-local state
`ProjectSitesRoot.tsx` owns:
- `scope`
- `searchInput`
- debounced search term
- `sortKey`
- `filters`
- `isFilterPanelOpen`
- `resolvedScope`

### Layout state
`useProjectSitesContainerState(rootRef)` owns:
- observed width
- observed height
- derived layout mode (`wide`, `medium`, `compact`)
- `isShortHeight`

This hook is especially important because it measures the **rendered root section itself**, not an external stable shell viewport contract.

## Rendering Path

1. years query resolves
2. initial scope resolved from runtime authority / fallback
3. project query resolves for scope
4. entries normalized
5. facets extracted from normalized entries
6. people display labels queried from UPNs
7. visible entries derived by client pipeline
8. grid rendered as cards

## Transition Surfaces

### Loading and success transitions
- years loading → shimmer
- years error / empty → empty container
- projects loading → shimmer
- projects success → context summary + control bar + grid
- filtered zero → no-results empty state

### Animation-bearing surfaces
- filter panel: enter animation
- grid: fade/translate animation
- provisioning dot: pulsing animation
- shimmer: opacity pulsing

## High-Risk Runtime Seams

### Seam A — shell render to mount contract
The shell calls `mount()` from `render()`, but the app-host mount implementation is not idempotent.

### Seam B — self-observed layout mode
The layout hook uses a `ResizeObserver` on the root section and derives mode from content height.

### Seam C — forced grid remount
The success grid is keyed by scope + sort, guaranteeing subtree replacement on ordinary user interactions.

### Seam D — render-time normalization
The project hook rebuilds normalized entry objects during render rather than preserving stable entry identity across unrelated rerenders.
