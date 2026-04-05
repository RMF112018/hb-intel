# Homepage Zone Architecture

Authoritative reference for the HB Central homepage composition zone model inside `apps/hb-webparts`.

## Zone Model

The homepage page-canvas product is composed of 5 ordered zones. Each zone has a distinct visual identity, owns specific webparts, and uses a dedicated zone tint from the homepage token system (`HP_ZONE`).

### Zone 1: Top Band

**Purpose:** Signature greeting and authored hero region — the first thing users see.

| Webpart | Role |
|---------|------|
| Personalized Welcome Header | System-generated greeting with identity, support line, and optional alert |
| HB Hero Banner | Author-driven editorial hero with headline, message, media, CTA |

**Composition:** `HomepageTopBandPair` wraps both webparts in a flex layout (welcome 1:1 / hero 2:1 ratio).
**Zone tint:** `rgba(34,83,145,0.03)` — warm blue-neutral.
**Asymmetry:** Welcome Header always renders (synchronous, identity-driven). Hero Banner can be empty (author-dependent).

### Zone 2: Utility

**Purpose:** Dense, action-oriented quick-use surface for prioritized tasks and tool access.

| Webpart | Role |
|---------|------|
| Priority Actions Rail | Grouped priority actions with badges and audience filtering |
| Tool Launcher / Work Hub | Grouped tool/system launchers with icons |

**Composition:** `HomepageSectionShell` with title. Webparts use `hpZoneFlexLayout` for dense horizontal arrangement.
**Zone tint:** `transparent` — density and structure create zone identity instead of color.

### Zone 3: Communications

**Purpose:** Editorial content — curated updates, leadership messages, and people recognition.

| Webpart | Role |
|---------|------|
| Company Pulse | Curated internal updates with featured/secondary hierarchy |
| Leadership Message | Featured leadership communication with attribution and media |
| People & Culture | People recognition, milestones, and culture highlights |

**Composition:** `HomepageSectionShell` with title. Uses `HomepageCuratedContentCluster` for featured/secondary hierarchy.
**Zone tint:** `rgba(229,126,70,0.02)` — warm orange-neutral.

### Zone 4: Operational Awareness

**Purpose:** Project and safety status with freshness tracking and operational emphasis.

| Webpart | Role |
|---------|------|
| Project / Portfolio Spotlight | Curated project status with milestones and stale-data handling |
| Safety & Field Excellence | Safety highlights, recognitions, and reminders with freshness |

**Composition:** `HomepageSectionShell` with title. Uses `HomepageOperationalAwarenessCluster` for featured/secondary hierarchy with freshness indicators.
**Zone tint:** `rgba(34,83,145,0.02)` — cool blue-neutral.
**Unique behavior:** Both webparts support stale-data detection via `staleAfterHours` config and `isStale`/`freshnessLabel` rendering.

### Zone 5: Discovery

**Purpose:** Interactive search and curated wayfinding for tools, forms, policies, and destinations.

| Webpart | Role |
|---------|------|
| Smart Search / Wayfinding | Interactive search, quick paths, promoted resources, category browsing |

**Composition:** `HomepageSectionShell` with title. Uses `HomepageDiscoveryCluster` for search/browse layout.
**Zone tint:** `rgba(0,0,0,0.015)` — neutral.
**Unique behavior:** Interactive `useState` for search query. Dual normalization (base + query-filtered). `noResults` empty state.

## Composition Wrappers

| Wrapper | Responsibility | Used By |
|---------|---------------|---------|
| `HomepageTopBandPair` | Flex layout for welcome + hero with responsive ratios | Zone 1 |
| `HomepageSectionShell` | Section container with title and subtitle | Zones 2–5 |
| `HomepageRailShell` | Horizontal rail layout | Utility webparts |
| `HomepageCuratedContentCluster` | Featured/secondary editorial hierarchy | Communications webparts |
| `HomepageOperationalAwarenessCluster` | Featured/secondary with freshness | Operational webparts |
| `HomepageDiscoveryCluster` | Search + browse layout | Discovery webpart |

## Zone Rhythm

The composed homepage uses a grid layout with `HP_SPACE['2xl']` (16px) gap between zones. Each zone is wrapped with `hpZoneSection(zone)` which applies the zone's background tint, standard card radius, and 16px padding.

## ReferenceHomepageComposition Role

`ReferenceHomepageComposition.tsx` is the **governed composition reference** for the homepage package. It is:

1. **Development preview** — renders when `mount.tsx` receives no `webPartId` (local dev, non-SPFx context)
2. **Visual integration surface** — confirms all 10 webparts compose correctly in the 5-zone structure
3. **Zone architecture reference** — demonstrates the governed zone order, tinting, and section rhythm

It is **NOT** the production rendering path. In production, each webpart renders independently via `mount.tsx` dispatch.

### Scaffold-era behavior removed
The `normalizeHomepageConfig()` call (scaffold-era generic normalizer) was removed from the composition. Sample data is now specified directly — the composition reference no longer depends on scaffold-era config helpers.

## Independent Rendering Guarantee

Each webpart must continue to render independently when mounted via the `mount.tsx` dispatch seam. The zone composition is additive — it demonstrates how webparts compose together but does not create runtime dependencies between them. A webpart placed on a SharePoint page via the app catalog renders without any zone wrapper.
