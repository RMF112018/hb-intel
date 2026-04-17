# 01 — Current Implementation Map

## 1. Entrypoints and runtime seams

### Local homepage root
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepage.tsx`
  - Pure pass-through into `HbHomepageShell`.

### Shell
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.tsx`
  - Constructs a narrow `zoneProps` object.
  - Creates a profile-photo resolver from `siteUrl`.
  - Renders five zones in a fixed vertical order:
    1. `CompanyPulseZone`
    2. `LeadershipMessageZone`
    3. `ProjectPortfolioSpotlightZone`
    4. `PeopleCulturePublicZone`
    5. `HbKudosZone`

### Shell styling
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.module.css`
  - Single-column flex stack
  - max-width `1440px`
  - centered layout
  - fixed gap progression
  - global reduced-motion clamp inside the shell subtree

### Manifest
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageWebPart.manifest.json`
  - `supportsFullBleed: true`
  - full-width homepage intent is therefore declared in packaging

## 2. Contract seams

### Shell contract
- `apps/hb-webparts/src/webparts/hbHomepage/hbHomepageContract.ts`
  - `HbHomepageProps` includes:
    - `config`
    - `identity`
    - `assetBaseUrl`
    - `siteUrl`
    - `getGraphToken`
    - `getApiToken`
    - `kudosListHostUrl`
  - `HbHomepageZoneProps` includes:
    - `config`
    - `identity`
    - `assetBaseUrl`
    - `siteUrl`
    - `getGraphToken`
    - `profilePhotoResolver`
    - `kudosListHostUrl`

### Practical drift
The shell only forwards a subset of the top-level props into `zoneProps`. That is a mild but real contract-drift smell: the published contract is broader than the actual composed runtime.

## 3. Zone boundary ownership

### Shared error wrapper
- `apps/hb-webparts/src/webparts/hbHomepage/ZoneErrorBoundary.tsx`
  - class boundary
  - logs to console
  - renders `null` on failure

### Zone wrappers
Each zone wrapper is very small and mostly:
- resolves local config slice
- wraps the target webpart in `ZoneErrorBoundary`
- renders a labeled `<section>`

#### Company Pulse
- `zones/CompanyPulseZone.tsx`
- delegates to `../../companyPulse/CompanyPulse.tsx`

#### Leadership Message
- `zones/LeadershipMessageZone.tsx`
- delegates to `../../leadershipMessage/LeadershipMessage.tsx`

#### Project Portfolio Spotlight
- `zones/ProjectPortfolioSpotlightZone.tsx`
- delegates to `../../projectPortfolioSpotlight/ProjectPortfolioSpotlight.tsx`

#### People & Culture Public
- `zones/PeopleCulturePublicZone.tsx`
- delegates to `../../peopleCulturePublic/PeopleCulturePublic.tsx`
- can derive its own profile-photo resolver if one is not already supplied

#### HB Kudos
- `zones/HbKudosZone.tsx`
- delegates to `../../hbKudos/HbKudos.tsx`

## 4. Shared homepage surface ownership

### Governed homepage entrypoint
- `packages/ui-kit/src/homepage.ts`
  - exports the constrained homepage presentation surface family
  - re-exports premium dependencies (`motion`, `clsx`, `cva`, radix separator, curated lucide icons)
  - declares homepage import guardrails and anti-patterns
  - exports shared surface families:
    - `HbcSignatureHeroSurface`
    - `HbcEditorialSurface`
    - `HbcProjectSpotlightSurface`
    - `HbcNewsroomSurface`
    - `HbcPeopleCultureSurface`
    - others

### Zone families currently using governed shared surfaces
- `companyPulse/CompanyPulse.tsx`
  - uses `HbcNewsroomSurface`
- `leadershipMessage/LeadershipMessage.tsx`
  - uses `HbcEditorialSurface`
- `projectPortfolioSpotlight/ProjectPortfolioSpotlight.tsx`
  - uses `HbcProjectSpotlightSurface`

### Zone family with local divergence
- `peopleCulturePublic/PeopleCulturePublicSurface.tsx`
  - deliberately stays outside `@hbc/ui-kit/homepage`
  - self-contained local composition
  - inline-style heavy

### Benchmark reference runtime
- `hbKudos/HbKudos.tsx`
  - richer local runtime with its own product surface family, hooks, host-safe behavior, and deeper journey coverage

## 5. Data and state seams

### Project Spotlight
- `apps/hb-webparts/src/homepage/data/useProjectSpotlightData.ts`
  - SharePoint list is primary source when site context exists
  - returns `undefined` outside SPFx to trigger manifest-config fallback
  - 5-minute cache
  - explicit loading/error return object

### People & Culture Public
- `PeopleCulturePublic.tsx`
  - resolves either split config or legacy bridge
  - normalizes into public output
  - renders local surface only

### HB Kudos
- `HbKudos.tsx`
  - orchestrates multiple hooks for:
    - current user
    - public/archive data
    - photo hydration
    - celebrate action
    - host-safe layout
    - composer flow
    - feed panel
    - article reader
  - strongest evidence of benchmark-grade runtime depth in the footprint

## 6. Styling and top-band seams

### What exists
- premium shared zone surfaces
- full-bleed-capable manifest
- governed homepage entrypoint
- shared signature hero primitive in UI kit

### What does not exist in `hbHomepage`
- no rendered flagship top-band
- no shell-level hero orchestration
- no shell-level transition between hero and subordinate zones
- no shell-level asymmetry or focal-plane control
- no explicit layout registry or zone composition metadata

## 7. Current composition reality

The current homepage is best described as:

- a clean orchestrator
- a premium-adjacent stacked section sequence
- a zone-composition shell with limited authored authority

It is **not yet** a commanding flagship homepage shell in its own right.
