# Project Spotlight — Header CTA, Authoring, and Property Pane Refinement Output

**Phase:** P06-06 — Header CTA, authoring, and property pane refinement
**Date:** 2026-04-06
**Status:** Complete

---

## 1. Files changed

| File | Action | Purpose |
|------|--------|---------|
| `apps/hb-webparts/src/homepage/webparts/operationalAwarenessContracts.ts` | **Modified** | Added `allProjectsLabel` and `allProjectsUrl` to `ProjectPortfolioSpotlightConfig` and defaults. |
| `apps/hb-webparts/src/homepage/helpers/operationalAwarenessConfig.ts` | **Modified** | Extended `CuratedOperationalCollection<T>` with section-level CTA fields. Normalization now resolves and passes through `allProjectsLabel`/`allProjectsUrl` with defaults. |
| `apps/hb-webparts/src/webparts/projectPortfolioSpotlight/ProjectPortfolioSpotlight.tsx` | **Modified** | Header CTA now renders from `normalized.allProjectsUrl` and `normalized.allProjectsLabel` instead of `feat.cta.href`. |
| `apps/hb-webparts/src/homepage/helpers/authoringGovernance.ts` | **Modified** | Updated empty/error messages to reference the list-driven authoring model ("Homepage Project Spotlights list" instead of "property pane"). |
| `apps/hb-webparts/src/webparts/projectPortfolioSpotlight/ProjectPortfolioSpotlightWebPart.manifest.json` | **Modified** | Added `allProjectsLabel` and `allProjectsUrl` to seed properties. Version bumped to `0.0.6.0`. |

---

## 2. Header/CTA change summary

### Before
- Header CTA label: hardcoded `"View all projects"`
- Header CTA href: `feat.cta.href` (coupled to featured project's CTA)
- Condition: rendered only when `feat.cta` existed

### After
- Header CTA label: `normalized.allProjectsLabel` (configurable, default: `"View all projects"`)
- Header CTA href: `normalized.allProjectsUrl` (configurable, default: `"/sites/hb-central/portfolio"`)
- Condition: rendered when `normalized.allProjectsUrl` is truthy (independent of featured item)
- Featured project CTA remains separate and unchanged

---

## 3. Authoring model summary

### Config fields (section-level)

| Field | Type | Default | Purpose |
|-------|------|---------|---------|
| `heading` | `string?` | `"Project and Portfolio Spotlight"` | Section heading |
| `maxSecondaryItems` | `number?` | `3` | Rail item limit |
| `staleAfterHours` | `number?` | `168` (7 days) | Freshness threshold |
| `allProjectsLabel` | `string?` | `"View all projects"` | Section-level CTA label |
| `allProjectsUrl` | `string?` | `"/sites/hb-central/portfolio"` | Section-level CTA URL |

### Visibility and governance logic (verified, no changes needed)

| Rule | Implementation | Location |
|------|---------------|----------|
| `HomepageEnabled` | Server-side OData filter `eq 1` | `projectSpotlightListSource.ts` fetch |
| Publish window | `isWithinPublishWindow()` client-side filter | `projectSpotlightListSource.ts` |
| Audience filtering | `isVisibleForAudience()` during normalization | `operationalAwarenessConfig.ts:181` |
| Stale thresholds | `resolveFreshness()` with `StaleAfterDays` × 24 → `staleAfterHours` | `operationalAwarenessConfig.ts:183` |
| Featured/ordering | `byPriority()`: featured → order → recency → title | `operationalAwarenessConfig.ts:218` |
| Stale demotion | Fresh items before stale in secondary rail | `operationalAwarenessConfig.ts:224-226` |

### Empty/error state messages (updated for list-driven model)

| State | Before | After |
|-------|--------|-------|
| `noData` title | "No project spotlight items configured" | "No project spotlight items available" |
| `noData` description | "Add featured or secondary project spotlight items in the property pane..." | "Publish items in the Homepage Project Spotlights list with HomepageEnabled set to Yes." |
| `invalid` title | "Project spotlight configuration is invalid" | "Project spotlight items could not be displayed" |
| `invalid` description | "Review project IDs, summaries, status signals..." | "Verify that list items have a Title, Summary, and valid status fields." |

---

## 4. Validation

| Check | Result |
|-------|--------|
| `pnpm check-types` | Pass — no type errors |
| `pnpm lint` | Pass — no errors or warnings |
| `pnpm build` | Pass — 4351 modules, 474.00 kB |
| Section CTA decoupled | Header renders from `normalized.allProjectsUrl`, not `feat.cta.href` |
| List governance intact | HomepageEnabled, publish window, audience, stale, ordering all verified in normalization pipeline |
| Empty states updated | Messages reference "Homepage Project Spotlights list" and "HomepageEnabled" |
