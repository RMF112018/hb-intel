# Phase 01 Deliverable — Project Spotlight Repo-Truth Baseline and Ownership Map

> **Phase:** 01 of 08
> **Status:** Complete
> **Date:** 2026-04-06
> **Scope:** Audit, anatomy freeze, and ownership map — no code changes
> **Governing docs:** UI Doctrine SPFx Governing Standard, SPFx Homepage Overlay, SharePoint Homepage Design Brief, Phase Implementation Summary

---

## A. Repo-Truth Starting Point

### A.1 What Currently Exists

#### Component files

| File | Path | Purpose |
|------|------|---------|
| `ProjectPortfolioSpotlight.tsx` | `apps/hb-webparts/src/webparts/projectPortfolioSpotlight/` | Main component (106 lines). Renders via `HbcOperationalSurface`. |
| `index.ts` | same directory | Barrel export of component and props type. |
| `ProjectPortfolioSpotlightWebPart.manifest.json` | same directory | SPFx manifest. `version: "*"`, `hiddenFromToolbox: true`. |

#### Configuration contracts

| File | Path | Exports |
|------|------|---------|
| `operationalAwarenessContracts.ts` | `src/homepage/webparts/` | `ProjectPortfolioSpotlightConfig`, `ProjectPortfolioSpotlightItem`, `ProjectMilestone`, `OperationalStatusSignal`, `OperationalFreshness`, `DEFAULT_PROJECT_PORTFOLIO_SPOTLIGHT_CONFIG` |
| `contentModels.ts` | `src/homepage/models/` | `HomepageCtaLink`, `HomepageMediaSlot`, `HomepageSpotlightItem` |

#### Normalization and helpers

| File | Path | Exports |
|------|------|---------|
| `operationalAwarenessConfig.ts` | `src/homepage/helpers/` | `normalizeProjectPortfolioSpotlightConfig()`, `CuratedOperationalCollection<T>`, `NormalizedProjectPortfolioSpotlightItem`, `byPriority()` sort |
| `authoringGovernance.ts` | `src/homepage/helpers/` | `HOMEPAGE_AUTHORING_GOVERNANCE_REGISTRY.projectPortfolioSpotlight`, `resolveAuthoringMessage()` |
| `visibility.ts` | `src/homepage/helpers/` | `isVisibleForAudience()` |

#### Shared homepage primitives

| Component | Path | Purpose |
|-----------|------|---------|
| `HomepageEmptyState` | `src/homepage/shared/` | Wraps `HbcEmptyState` with homepage styling and ARIA |
| `HomepageLoadingState` | `src/homepage/shared/` | Wraps `HbcSpinner` with homepage styling and ARIA |
| `HomepageSectionShell` | `src/homepage/shared/` | Section wrapper with zone-specific accent |
| `HomepageOperationalAwarenessCluster` | `src/homepage/shared/` | Cluster layout (not used by Spotlight directly) |

#### UI-kit primitives consumed

| Primitive | Entry point | Usage |
|-----------|-------------|-------|
| `HbcOperationalSurface` | `@hbc/ui-kit/homepage` | Primary render container (cool-blue dashboard surface) |
| `HbcPremiumBadge` | `@hbc/ui-kit/homepage` | Strategic / status / stale badges |
| `HbcPremiumCta` | `@hbc/ui-kit/homepage` | Featured item CTA |
| `HbcEmptyState` | `@hbc/ui-kit/homepage` | Empty state (via `HomepageEmptyState`) |
| `HbcSpinner` | `@hbc/ui-kit/homepage` | Loading state (via `HomepageLoadingState`) |
| `BarChart3`, `Briefcase`, `Clock`, `CheckCircle2` | `@hbc/ui-kit/homepage` | Lucide icons for operational accents |

#### Ranking and sorting

`byPriority()` in `operationalAwarenessConfig.ts` sorts by:
1. `featured` flag (featured first)
2. `order` numeric field (ascending, unbounded defaults to `MAX_SAFE_INTEGER`)
3. `title` alphabetical (locale-aware fallback)

After sorting, array destructuring separates the first item as `featured` and the rest as `secondary` (capped by `maxSecondaryItems`, default 3).

#### Freshness and staleness

`resolveFreshness()` computes staleness from:
- `expiresAt` date (stale if past)
- `updatedAt` date + `staleAfterHours` threshold (default 168 hours / 7 days)
- Produces `isStale: boolean` and `freshnessLabel: string`

### A.2 What Is Reusable

| Asset | Reuse verdict | Notes |
|-------|---------------|-------|
| `normalizeProjectPortfolioSpotlightConfig()` | **Reuse as-is** | Sound validation, trimming, sorting, staleness. Extend input contract for new fields (media, team). |
| `byPriority()` | **Reuse as-is** | Correct featured/order/alpha cascade. |
| `resolveFreshness()` | **Reuse as-is** | Clean dual-path staleness with label derivation. |
| `normalizeCta()` | **Reuse as-is** | Defensive CTA validation. |
| `normalizeMilestones()` | **Reuse as-is** | Defensive milestone validation. |
| `CuratedOperationalCollection<T>` | **Reuse, rename later** | Generic enough. Name is operational-flavored but structure is correct. |
| `ProjectPortfolioSpotlightConfig` | **Extend** | Add `media`, `team`, and image-related fields in Phase 02+. |
| `ProjectPortfolioSpotlightItem` | **Extend** | Add `image`, `teamMembers`, and editorial fields in Phase 02+. |
| `HomepageEmptyState` | **Reuse as-is** | Standard shared primitive. |
| `HomepageLoadingState` | **Reuse as-is** | Standard shared primitive. |
| `HbcPremiumCta` | **Reuse as-is** | Premium CTA with motion, variants, sizes. |
| `HbcPremiumBadge` | **Reuse as-is** | Premium badge with status variants. |
| `HbcEditorialSurface` | **Candidate replacement surface** | Warm editorial composition with featured/secondary rhythm. See A.4 for evaluation. |
| Design tokens (`HP_SPACE`, `HP_RADIUS`, etc.) | **Reuse as-is** | Available for Spotlight-specific composition. |
| Authoring governance entry | **Reuse, update messages** | Zone and cadence correct. Messages may need editorial-tone update. |

### A.3 What Is Insufficient for the Premium Direction

1. **`HbcOperationalSurface` as the render container.** This is a cool-blue, dashboard-adjacent signal grid designed for operational awareness (safety alerts, status dashboards). Project Spotlight requires a warm editorial storytelling surface with image-led hierarchy. The surface family is structurally wrong.

2. **No image or media handling.** The current component is entirely text-based. The premium direction requires a dominant project image, editorial photography, and visual storytelling. Neither the contract (`ProjectPortfolioSpotlightItem`) nor the component support media.

3. **Secondary items as severity-colored signal rows.** Currently rendered as `OperationalSignal[]` with severity colors (green/orange/red) and `Briefcase` icons. The premium direction requires lighter editorial tiles with image thumbnails and restrained metadata — not alert-style rows.

4. **No project team representation.** The design brief requires a project team avatar strip inside the featured surface and a lightweight detail layer for team expansion. No avatar or team data exists in the current contract.

5. **No detail layer interaction.** The premium direction calls for a restrained anchored detail layer (project team expansion, milestone detail). The current component has no interactive expansion or overlay capability.

6. **Dashboard-flavored iconography.** `BarChart3` as the header icon and `Briefcase` for signal items reinforce the operational dashboard metaphor. The premium direction needs editorial-aligned iconography.

### A.4 What Must Be Avoided

1. **Do not preserve `HbcOperationalSurface` as the primary render container.** It is the wrong surface family for editorial storytelling.

2. **Do not let dashboard-card patterns define the solution.** The current `OperationalSignal` mapping (severity, signal icon, alert-style rows) must not carry forward into the rebuilt component.

3. **Do not create equal-weight card grids.** The Phase Implementation Summary explicitly requires one dominant featured project with a visually subordinate supporting rail.

4. **Do not add KPI, report-card, or dense metadata behavior.** The design brief prohibits these patterns for the homepage.

5. **Do not prematurely promote Spotlight-specific orchestration into `@hbc/ui-kit`.** Featured/supporting separation, project-specific ranking, and team-strip choreography are Spotlight-local concerns until reuse is proven.

6. **Do not broaden scope into unrelated homepage webparts.** This phase concerns only the Project Spotlight component and its direct dependencies.

---

## B. Ownership Matrix

### B.1 `@hbc/ui-kit/homepage` — Already available, safe to consume

| Primitive | Status | Spotlight usage |
|-----------|--------|-----------------|
| `HbcEditorialSurface` | Exported | Candidate primary surface (warm editorial featured/secondary) |
| `HbcPremiumCta` | Exported | Featured CTA, supporting rail CTAs |
| `HbcPremiumBadge` | Exported | Status badges (restrained use) |
| `HbcPremiumIcon` | Exported | Icon wrapper with motion |
| `HbcHomepageEyebrow` | Exported | Editorial eyebrow text |
| `HbcHomepageMetadataRow` | Exported | Metadata presentation |
| `HbcHomepageSurfaceCard` | Exported | Surface-class card wrapper |
| `HbcEmptyState` | Exported | Empty state (via `HomepageEmptyState`) |
| `HbcSpinner` | Exported | Loading state (via `HomepageLoadingState`) |
| `motion`, `AnimatePresence` | Re-exported | Reveal choreography |
| `clsx`, `cva` | Re-exported | Variant systems |
| Lucide icon set (18 icons) | Re-exported | Editorial metadata accents |

### B.2 `@hbc/ui-kit/homepage` — May need promotion later (Phase 05+)

| Candidate | Current state | Promotion trigger |
|-----------|---------------|-------------------|
| Generic avatar strip primitive | Does not exist | If avatar strip proves reusable beyond Spotlight (Phase 05 decision) |
| Generic anchored detail wrapper | Does not exist | If detail layer proves reusable beyond Spotlight (Phase 05 decision) |
| Generic homepage media shell | Does not exist | If image-led tile pattern proves reusable beyond Spotlight (Phase 02–03 decision) |

**None of these should be created speculatively.** Build locally first, promote only when reuse is proven.

### B.3 `src/homepage/shared/` — Homepage-local shared primitives

| Primitive | Status | Spotlight usage |
|-----------|--------|-----------------|
| `HomepageEmptyState` | Exists | Reuse as-is |
| `HomepageLoadingState` | Exists | Reuse as-is |
| `HomepageSectionShell` | Exists | Available for section wrapping |
| Homepage media tile shell | **Build in Phase 02–03** | Image-led editorial tile for featured/secondary. Start local here, promote to ui-kit only if reuse proven. |
| Homepage avatar teaser strip | **Build in Phase 05** | Compact avatar row for project team. Start local here. |

### B.4 `src/webparts/projectPortfolioSpotlight/` — Spotlight-local

| Concern | Status | Notes |
|---------|--------|-------|
| `ProjectPortfolioSpotlight.tsx` | Exists — **rebuild in Phase 02** | Replace `HbcOperationalSurface` with editorial composition |
| Featured vs supporting orchestration | Exists (via normalization) | Keep in normalization helper, not in component |
| Spotlight-specific property mapping | Exists (manifest) | Extend with media/team fields in Phase 02+ |
| Spotlight-specific ranking | Exists (`byPriority()`) | Reuse from shared helper |
| Spotlight-specific interaction choreography | **Build in Phase 05** | Team strip expand/collapse, detail layer |
| Spotlight-specific image treatment | **Build in Phase 02** | Featured image composition, aspect ratios, scrim overlays |

### B.5 `src/homepage/helpers/` and `src/homepage/webparts/` — Contracts and normalization

| File | Status | Phase impact |
|------|--------|--------------|
| `operationalAwarenessContracts.ts` | Exists | Extend `ProjectPortfolioSpotlightItem` with `image?: HomepageMediaSlot`, `teamMembers?: ProjectTeamMember[]` in Phase 02/05 |
| `operationalAwarenessConfig.ts` | Exists | Extend normalization for new fields. Core logic reused as-is. |
| `authoringGovernance.ts` | Exists | Update messages to editorial tone in Phase 08 |
| `contentModels.ts` | Exists | `HomepageMediaSlot` already defined — reuse for Spotlight images |

---

## C. Component Anatomy Freeze

### C.1 Target anatomy — Featured Spotlight

```
┌─────────────────────────────────────────────────────────┐
│  FEATURED SPOTLIGHT                                     │
│                                                         │
│  ┌──────────────────────────┐  ┌──────────────────────┐ │
│  │                          │  │ Eyebrow              │ │
│  │    Project Image         │  │ PROJECT TITLE        │ │
│  │    (16:9 or 4:3)         │  │                      │ │
│  │    with subtle scrim     │  │ Editorial excerpt     │ │
│  │                          │  │ (2–3 lines max)      │ │
│  │                          │  │                      │ │
│  │                          │  │ ┌─────┐ ┌─────────┐  │ │
│  │                          │  │ │Badge│ │ Badge   │  │ │
│  │                          │  │ └─────┘ └─────────┘  │ │
│  │                          │  │                      │ │
│  │                          │  │ 📅 Updated · 🎯 M/N  │ │
│  │                          │  │                      │ │
│  │                          │  │ [Avatar Strip ····]  │ │
│  │                          │  │                      │ │
│  │                          │  │ [View project →]     │ │
│  └──────────────────────────┘  └──────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

**Slots:**
1. **Image zone** — project photography with aspect ratio (`16:9` default, `4:3` option), subtle readability scrim, `object-fit: cover`
2. **Eyebrow** — editorial context label (e.g., "Featured Project", "Strategic Initiative")
3. **Title** — project name, strong hierarchy (`1.5rem`+, `fontWeight: 700`)
4. **Excerpt** — editorial summary, constrained to 2–3 lines (`line-clamp`), warm secondary text
5. **Badge row** — up to 2 badges (status + strategic), restrained size (`sm`)
6. **Metadata row** — freshness label + milestone progress, icon-accented, subdued opacity
7. **Project Team strip** — compact avatar row (3–5 faces + overflow count), clickable to expand detail layer
8. **CTA** — `HbcPremiumCta` (ghost or secondary variant, `sm` size, arrow)

### C.2 Target anatomy — Supporting Rail

```
┌────────────────────┐ ┌────────────────────┐ ┌────────────────────┐
│ ┌────────────────┐ │ │ ┌────────────────┐ │ │ ┌────────────────┐ │
│ │  Thumbnail     │ │ │ │  Thumbnail     │ │ │ │  Thumbnail     │ │
│ │  (4:3)         │ │ │ │  (4:3)         │ │ │ │  (4:3)         │ │
│ └────────────────┘ │ │ └────────────────┘ │ │ └────────────────┘ │
│ Project Title      │ │ Project Title      │ │ Project Title      │
│ Status badge       │ │ Status badge       │ │ Status badge       │
│ Freshness label    │ │ Freshness label    │ │ Freshness label    │
│ [Link →]           │ │ [Link →]           │ │ [Link →]           │
└────────────────────┘ └────────────────────┘ └────────────────────┘
```

**Slots per tile:**
1. **Thumbnail** — smaller project image (`4:3` aspect ratio), `object-fit: cover`
2. **Title** — project name, subordinate hierarchy (`1rem`, `fontWeight: 600`)
3. **Badge** — single status badge (`sm`), optional
4. **Meta** — freshness label, subdued
5. **Link** — optional CTA or clickable card

**Rail behavior:**
- 3–5 tiles, horizontal on desktop, vertical stack on mobile
- Visually subordinate to featured spotlight (smaller images, lighter typography, less spacing)
- No excerpt text (title + badge + meta only)

### C.3 Target anatomy — Metadata Layer

Shared metadata presentation for both featured and supporting items:

| Element | Featured | Supporting |
|---------|----------|------------|
| Freshness label | Icon (`Calendar` or `Clock`, 11px) + date/label | Text-only label |
| Milestone progress | Icon (`CheckCircle2`, 11px) + "M/N milestones" | Omitted |
| Status badge | `HbcPremiumBadge` (`sm`) | `HbcPremiumBadge` (`sm`) |
| Strategic badge | `HbcPremiumBadge` (`sm`, "Strategic") | Omitted |
| Stale badge | `HbcPremiumBadge` (`sm`, "Stale", warning) | Omitted (degrade gracefully) |

### C.4 Target anatomy — CTA Layer

| Context | CTA treatment |
|---------|---------------|
| Featured spotlight | `HbcPremiumCta` — `ghost` or `secondary` variant, `sm` size, arrow icon, links to project detail |
| Supporting rail tile | Clickable card or inline text link, no button CTA |
| Section header | Optional `HbcPremiumCta` — "View all projects" or similar |

### C.5 Target anatomy — Project Team Strip (Phase 05)

```
[👤] [👤] [👤] [+2]
```

- Compact horizontal avatar row inside the featured spotlight
- 3–5 visible faces with overflow count
- Small circular avatars (28–32px)
- Clickable to expand the detail layer
- Graceful fallback for missing photos (initials or generic icon)
- **Ownership:** Build in `src/homepage/shared/` first as a homepage-local avatar teaser strip

### C.6 Target anatomy — Project Team Detail Layer (Phase 05)

```
┌──────────────────────────────────────┐
│  Project Team                    [×] │
│                                      │
│  [👤] Jane Smith — Project Manager   │
│  [👤] Mike Torres — Superintendent   │
│  [👤] Sarah Chen — Safety Director   │
│  [👤] Alex Rivera — Estimator        │
│  [👤] Chris Park — Field Engineer    │
└──────────────────────────────────────┘
```

- Anchored detail panel (not a modal — use `@floating-ui/react` for positioning)
- Shows full name + role for each team member
- Larger avatars (36–40px) with name and role text
- Close button, keyboard-dismissible, focus-trapped
- Reduced-motion aware
- **Ownership:** Build in `src/webparts/projectPortfolioSpotlight/` as Spotlight-local interaction

---

## D. Implementation Readiness Decision

### Decision: Ready to proceed to Phase 02

**Rationale:**

1. **Current structure is clearly mapped.** All component files, contracts, helpers, shared primitives, and ui-kit dependencies are identified and inventoried.

2. **Reuse strategy is defined.** Normalization logic, ranking, staleness computation, CTA validation, and milestone normalization are all sound and reusable without modification. The `ProjectPortfolioSpotlightConfig` contract is extensible.

3. **Surface family decision is clear.** `HbcOperationalSurface` must be replaced. `HbcEditorialSurface` is the strongest candidate from the existing ui-kit surface family set, providing warm editorial composition with featured/secondary rhythm. If the Spotlight anatomy requires more than `HbcEditorialSurface` offers (e.g., image zone, team strip slot), a Spotlight-specific composition wrapper built on editorial warm-accent patterns is the correct approach — not a new ui-kit surface.

4. **Ownership boundaries are locked.** No premature ui-kit promotions. Media tiles and avatar strips start as homepage-local shared primitives. Spotlight-specific orchestration stays local. Contracts extend in place.

5. **Anatomy is frozen.** The featured spotlight, supporting rail, metadata layer, CTA layer, project team strip, and detail layer are defined with enough precision to guide Phase 02 implementation without ambiguity.

6. **No blocking gaps.** `HomepageMediaSlot` already exists in `contentModels.ts` for image handling. The premium stack (motion, lucide, cva, clsx, radix) is approved and available via `@hbc/ui-kit/homepage`. No new external dependencies are required.

### Phase 02 entry requirements satisfied

- [x] Current Project Spotlight path correctly identified
- [x] Hero comparison path correctly identified (`hbHeroBanner/`, `HbcSignatureHeroSurface`)
- [x] No proposed shared-kit promotions are Spotlight-specific
- [x] Recommended implementation path preserves homepage product boundaries
- [x] Anatomy freeze is detailed enough to guide Phase 02 without ambiguity

### Phase sequence readiness

| Phase | Ready? | Dependencies |
|-------|--------|--------------|
| Phase 02 — Featured Spotlight Anatomy | **Yes** | This deliverable |
| Phase 03 — Supporting Rail | Blocked | Phase 02 featured shell |
| Phase 04 — Hero Alignment | Blocked | Phase 02–03 surfaces |
| Phase 05 — Team Strip + Detail | Blocked | Phase 02 featured shell |
| Phase 06 — Responsive | Blocked | Phase 02–03 layout |
| Phase 07 — Ranking + Freshness | Blocked | Phase 02–03 rendering |
| Phase 08 — Hardening + Docs | Blocked | Phase 02–07 completion |
