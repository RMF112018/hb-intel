# Current Homepage Shell Implementation Map

## Scope under audit
This map covers the composed homepage host in `apps/hb-webparts/src/webparts/hbHomepage/` and the currently participating homepage modules it orchestrates.

## Shell entrypoints

### Root entry
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepage.tsx`
  - thin entry component
  - delegates directly to `HbHomepageShell`

### Shell contract
- `apps/hb-webparts/src/webparts/hbHomepage/hbHomepageContract.ts`
  - defines shell props and zone props
  - currently carries generic runtime inputs only:
    - `config`
    - `identity`
    - `assetBaseUrl`
    - `siteUrl`
    - `getGraphToken`
    - `getApiToken`
    - optional `kudosListHostUrl`
  - **not** a layout contract
  - no slot schema
  - no zone metadata
  - no allowed footprints
  - no responsive configuration model

### Shell composition
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.tsx`
  - creates `profilePhotoResolver`
  - constructs shared `zoneProps`
  - renders the zone wrappers in fixed order

## Actual rendered order today
1. `CompanyPulseZone`
2. `LeadershipMessageZone`
3. `ProjectPortfolioSpotlightZone`
4. `PeopleCulturePublicZone`
5. `HbKudosZone`

This ordering is authored directly in JSX and is therefore static.

## Shell layout seam
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.module.css`

### Current shell behavior
- single-column flex stack
- max-width: 1440px
- centered page container
- vertical gap increases at 768 and 1200
- padding increases at 768 and 1200
- reduced-motion rule zeroes timing inside shell scope

### Important implication
The shell owns:
- outer width
- outer spacing
- section stacking

The shell does **not** own:
- multi-lane behavior
- shell-level hierarchy logic
- breakpoint reordering
- slot-specific density rules
- shell-specific grouping rules
- control-panel-friendly placement metadata

## Fault isolation seam
- `apps/hb-webparts/src/webparts/hbHomepage/ZoneErrorBoundary.tsx`

### Current behavior
- each zone has isolated render protection
- failing zone logs to console
- failed zone renders `null`
- remaining zones continue

### Architectural assessment
This is a good resilience seam, but it is minimal:
- no shell-level degraded placeholder
- no authored fallback panel
- no visibility into lost homepage value when a major zone fails

## Zone wrapper seams
Each zone wrapper follows the same structural pattern:
- read one config slice
- sometimes read `activeAudience`
- render `<section aria-label="...">`
- wrap in `ZoneErrorBoundary`
- delegate entirely to child module

### Company Pulse
- `zones/CompanyPulseZone.tsx`
- reads `config.companyPulse`
- passes `activeAudience`

### Leadership Message
- `zones/LeadershipMessageZone.tsx`
- reads `config.leadershipMessage`

### Project Portfolio Spotlight
- `zones/ProjectPortfolioSpotlightZone.tsx`
- reads `config.projectPortfolioSpotlight`
- passes `activeAudience`

### People & Culture Public
- `zones/PeopleCulturePublicZone.tsx`
- reads `config.peopleCulturePublic`
- passes identity / asset base / profile photo resolver
- maintains split-runtime boundary logic

### HB Kudos
- `zones/HbKudosZone.tsx`
- reads `config.hbKudos`
- passes identity / graph token / asset base

## Runtime mount seam
- `apps/hb-webparts/src/mount.tsx`

### Why this matters
This file proves the broader homepage ecosystem and clarifies what is and is not inside the composed shell.

### Key findings
- `HbHomepage` is a distinct composed webpart
- `HbHomepage` currently orchestrates:
  - Company Pulse
  - Leadership Message
  - Project Portfolio Spotlight
  - People & Culture Public
  - HB Kudos
- `SafetyFieldExcellence` exists as a standalone homepage-capable webpart but is **not** currently embedded in the shell
- other homepage-adjacent surfaces still exist independently, including hero-related and utility webparts

## Shared presentation dependencies

### Strong shared-surface consumers
These modules are thin integration consumers of shared premium surfaces:
- `CompanyPulse` → `HbcNewsroomSurface`
- `LeadershipMessage` → `HbcEditorialSurface`
- `ProjectPortfolioSpotlight` → `HbcProjectSpotlightSurface`
- `SafetyFieldExcellence` → `HbcOperationalSurface`
- `HbKudos` → richer local/shared product family with strong shell-safe behavior

### Important outlier
- `PeopleCulturePublicSurface`
  - self-contained inside the webpart folder
  - explicitly avoids the older merged shared surface
  - relies heavily on inline style objects
  - is therefore weaker as a shell-fit, future-configurable, productized surface family

## Growth seams

### Good seams already present
- per-zone wrapper boundary
- shell-to-module prop passing
- shared surface adoption in multiple modules
- isolated error handling
- strong runtime mount map

### Missing seams needed for the future control panel
- slot registry
- semantic zone roles
- shell layout schema
- allowed footprint model
- app capability metadata
- compatibility / exclusion rules
- per-breakpoint placement contract
- persisted layout profile model
- system-authored vs maintainer-configurable split

## Implementation maturity by module

### Strong
- Company Pulse
- Leadership Message
- Project Portfolio Spotlight
- HB Kudos

### Promising but not in shell
- Safety Field Excellence

### Needs alignment
- People & Culture Public

## Overall architectural reading
The current shell is a **clean host wrapper** around increasingly mature child modules.

That is a strong base for phase one shell composition.

It is **not yet** a mature orchestration architecture.
