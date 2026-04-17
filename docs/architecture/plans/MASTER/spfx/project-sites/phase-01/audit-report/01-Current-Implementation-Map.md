# Phase 2 — Current Implementation Map

## Architectural footprint

### 1. SPFx shell / packaging layer
- **Shell runtime:** `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts`
- **App package metadata:** `apps/project-sites/config/package-solution.json`
- **Manifest:** `apps/project-sites/src/webparts/projectSites/ProjectSitesWebPart.manifest.json`
- **Vite build / alias seam:** `apps/project-sites/vite.config.ts`

This layer is responsible for:
- loading the Vite-built IIFE bundle into SharePoint
- publishing build-time runtime config
- passing `spfxContext` and `webPartProperties`
- preserving manifest intent such as `supportsFullBleed`

### 2. App-host mount boundary
- **Entry point:** `apps/project-sites/src/mount.tsx`

This layer:
- bootstraps SPFx auth
- creates the React Query client
- forces light theme
- renders `ProjectSitesRoot`
- publishes `__hbIntel_projectSites` on the global object

Important seam:
- the shell’s `IAppModule` interface expects `mount(el, spfxContext, config?)`
- Project Sites’ app-host mount currently accepts only `(el, spfxContext?)`

That is a material boundary issue because shell-supplied runtime config is not consumed by the app.

### 3. Surface root / control system
- **Root component:** `packages/spfx/src/webparts/projectSites/ProjectSitesRoot.tsx`

Responsibilities:
- load available years
- choose default scope
- render the search / scope / sort / filter control bar
- derive visible entries through the pure client-side pipeline
- handle loading, empty, error, and filtered-zero states
- render the card grid

### 4. Query and normalization layer
- **Years hook:** `hooks/useAvailableYears.ts`
- **Project hook:** `hooks/useProjectSites.ts`
- **Normalizer:** `normalizeProjectSiteEntry.ts`
- **Contracts:** `types.ts`

Responsibilities:
- query the `Projects` list
- deduplicate years
- fetch project records by year or “all”
- normalize legacy and newer SharePoint field names into one flat UI contract

### 5. Client-side decision layer
- **Pipeline:** `projectSitesFilter.ts`

Responsibilities:
- search corpus construction
- search token matching
- advanced filter predicates
- sort comparators
- facet extraction
- heuristic UPN humanization

### 6. Card / launch layer
- **Card component:** `components/ProjectSiteCard.tsx`

Responsibilities:
- render project identity
- classify card state
- differentiate live vs provisioning vs “archived/other”
- expose the launch affordance for `siteUrl` rows

## Current data-flow summary

1. SharePoint shell loads the Project Sites bundle.
2. `mount.tsx` bootstraps auth and renders `ProjectSitesRoot`.
3. `ProjectSitesRoot` loads distinct years.
4. On first success it chooses a default scope itself:
   - current year if available
   - else newest year
   - else all
5. `useProjectSites(scope)` fetches raw `Projects` list items.
6. `normalizeProjectSiteEntries()` turns raw SharePoint rows into UI records.
7. `applyProjectSitesPipeline()` performs search → filter → sort.
8. Visible records are rendered as `ProjectSiteCard`s.

## Trust and fallback seams present today

### Present
- loading / error / empty state handling
- visible count and live-region announcements
- typed normalization of mixed internal field naming
- fallback parsing from `Title` when name / number fields are absent
- clear no-site “provisioning” visual treatment

### Missing or weak
- authoritative host year context
- runtime config consumption from the shell
- truthful distinction between missing data vs real provisioning
- authoritative people display resolution
- explicit access / launch confidence treatment
- breakpoint contract for narrow / constrained states
