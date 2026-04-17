# 05 — Embed Company Pulse, Leadership Message, and Project Portfolio Spotlight

## Objective

Embed the three lowest-risk public modules into `hb-homepage` shell zones.

## Files changed

| File | Change |
|------|--------|
| `src/webparts/hbHomepage/zones/CompanyPulseZone.tsx` | Created. Extracts `companyPulse` config slice and `activeAudience` from shell config, wraps `CompanyPulse` in error boundary and section. |
| `src/webparts/hbHomepage/zones/LeadershipMessageZone.tsx` | Created. Extracts `leadershipMessage` config slice, wraps `LeadershipMessage`. |
| `src/webparts/hbHomepage/zones/ProjectPortfolioSpotlightZone.tsx` | Created. Extracts `projectPortfolioSpotlight` config slice and `activeAudience`, wraps `ProjectPortfolioSpotlight`. |
| `src/webparts/hbHomepage/HbHomepageShell.tsx` | Composes all three zone wrappers in fixed zone order positions 1-3. |

## Shell integration points

Each zone wrapper:
1. Extracts its module-specific config from `config.{moduleName}` (typed as `Record<string, unknown>`)
2. Passes `activeAudience` from the shell config (for audience-scoped modules)
3. Wraps the module in `<section aria-label="...">` for shell-owned accessibility
4. Wraps in `ZoneErrorBoundary` for fault isolation

## Ownership boundary

- **Shell owns:** Zone placement order, outer vertical rhythm (gap between zones), section aria labeling, error boundary
- **Modules keep:** Internal config normalization, surface rendering through `@hbc/ui-kit/homepage` (HbcNewsroomSurface, HbcEditorialSurface, HbcProjectSpotlightSurface), loading/empty/error states, authoring governance

## Module internals preserved

- CompanyPulse: `normalizeCompanyPulseConfig` → `HbcNewsroomSurface` delegation unchanged
- LeadershipMessage: `normalizeLeadershipMessageConfig` → `HbcEditorialSurface` delegation unchanged
- ProjectPortfolioSpotlight: `normalizeProjectPortfolioSpotlightConfig` + `useProjectSpotlightData` → `HbcProjectSpotlightSurface` delegation unchanged

## No regression proof

- Existing standalone manifest GUIDs and mount.tsx registrations untouched
- Existing standalone webparts continue to render independently when placed on a page
- No module source files were modified

## Compile verification

- `check-types` passes
- `build` succeeds

## Boundary for PeopleCulturePublic

Zone wrapper for PeopleCulturePublic is implemented. It passes `profilePhotoResolver` constructed from `siteUrl` and handles the split-runtime boundary. See Prompt 06 closure.
