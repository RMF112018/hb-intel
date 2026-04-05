# Homepage Shared Seam Taxonomy

Authoritative classification of shared code in `apps/hb-webparts/src/homepage/` with placement rules, implicit contract documentation, and ownership boundaries.

---

## Directory Placement Rules

### `src/homepage/shared/` — Composition Primitives

**Purpose:** Homepage-specific React layout and display components consumed by multiple webparts.

**Placement rule:** A component belongs here when it is:
- used by 2+ homepage webparts or the reference composition
- a structural/layout concern (section shells, card variants, rail layouts, cluster patterns)
- not a full webpart (no manifest, no standalone SPFx identity)
- not yet proven for `@hbc/ui-kit` promotion (requires 2+ non-homepage consumers)

**Does NOT belong here:** Webpart-specific rendering logic, business logic, data fetching, config normalization.

### `src/homepage/helpers/` — Normalization and Utility Functions

**Purpose:** Pure functions for config normalization, identity resolution, greeting generation, visibility filtering, and authoring governance.

**Placement rule:** A helper belongs here when it is:
- a pure function (no React, no side effects, no state)
- consumed by 2+ webparts OR is a package-wide utility (identity, greeting, visibility)
- testable in isolation

**Sub-classification:**

| Category | Files | Scope |
|----------|-------|-------|
| Package-wide | `identity.ts`, `greeting.ts`, `welcomeMessage.ts`, `visibility.ts`, `authoringGovernance.ts` | All zones — foundational utilities |
| Zone-specific | `topBandConfig.ts`, `utilityConfig.ts`, `communicationsConfig.ts`, `operationalAwarenessConfig.ts`, `discoveryConfig.ts` | Single zone — normalization + validation |
| Scaffold-era (deprecated) | `config.ts`, `normalization.ts` | See §Deprecated Files below |

### `src/homepage/webparts/` — Zone Configuration Contracts

**Purpose:** TypeScript interfaces and DEFAULT constants defining the configuration shape for each homepage zone.

**Placement rule:** A file belongs here when it:
- defines the `*Config` interface a webpart receives as props
- defines DEFAULT_* constants for top-level config fields (heading, maxItems, etc.)
- defines item/entry types specific to a zone

**Does NOT belong here:** Normalization logic (belongs in helpers), React components (belongs in shared or webpart folders), content model types shared across zones (belongs in models).

### `src/homepage/models/` — Cross-Zone Content Types

**Purpose:** Shared content type interfaces used by multiple zone contracts.

**Placement rule:** A type belongs here when it is:
- referenced by 2+ zone contract files
- a fundamental content shape (CTA links, media slots)
- not zone-specific

---

## Shared Composition Primitives Inventory

| Component | Responsibility | Consuming Zones |
|-----------|---------------|-----------------|
| `HomepageTopBandPair` | Layout wrapper for welcome + hero pair | Top Band |
| `HomepageRailShell` | Horizontal rail layout | Utility |
| `HomepageSectionShell` | Standard section with heading + spacing | All |
| `HomepageEditorialCard` | Editorial content card (title/summary/metadata) | Communications, Operational |
| `HomepageSpotlightCard` | Featured card with status + CTA | Operational |
| `HomepagePersonRecognitionCard` | People card with avatar/role | Communications |
| `HomepageCuratedContentCluster` | Featured + secondary editorial hierarchy | Communications |
| `HomepageOperationalAwarenessCluster` | Operational status cluster with freshness | Operational |
| `HomepageDiscoveryCluster` | Search/wayfinding result cluster | Discovery |
| `HomepageUtilityTile` | Compact action/tool tile | Utility |
| `HomepageUtilityDenseGroup` | Dense grouping of utility tiles | Utility |
| `HomepageEmptyState` | Homepage-styled empty state | All |
| `HomepageLoadingState` | Homepage-styled loading spinner | All |

---

## Package-Wide Helper Contracts

### `identity.ts` — User Identity Resolution

- **Exports:** `HomepageIdentityInput` interface, `resolveFirstName(input)`
- **Fallback chain:** `preferredName` → `displayName` → email first-token → `'there'`
- **Contract:** Always returns a non-empty string suitable for greeting display

### `greeting.ts` — Time-Based Greeting

- **Exports:** `TimeOfDayGreeting` type, `resolveGreetingForHour(hour)`, `resolveGreetingAt(date)`
- **Hour buckets:** 5–12 morning, 12–18 afternoon, 18+ evening
- **Contract:** Deterministic, no side effects, no state

### `welcomeMessage.ts` — Greeting Composition

- **Exports:** `WelcomeMessage` interface, `resolveWelcomeMessage(identity, now)`
- **Composes:** identity.ts + greeting.ts into a headline string
- **Contract:** Returns `{ greeting, firstName, headline }` — always safe for display

### `visibility.ts` — Audience Filtering Predicate

- **Exports:** `isVisibleForAudience(allowedAudiences, activeAudience)`
- **Contract:** No `allowedAudiences` array = visible to everyone. If array exists, `activeAudience` must match at least one entry.
- **Usage:** Called by every zone-specific normalizer

### `authoringGovernance.ts` — Webpart Governance Registry

- **Exports:** `HOMEPAGE_AUTHORING_GOVERNANCE_REGISTRY` (Map, 10 entries), `resolveAuthoringMessage(key, scenario)`
- **Per-entry metadata:** webpartKey, zone, ownerRole, freshnessCadence, rotationExpectation, zoneIntent, allowedContentScope, messages (noData, invalid, noResults?)
- **Message cascade:** noResults (if exists) → invalid → noData
- **Test lock:** `authoringGovernance.test.ts` locks all 10 webpart keys — adding a webpart without a registry entry will fail the test

---

## Zone-Specific Normalizer Contracts

All zone normalizers follow a common implicit contract. This section makes it explicit.

### Common Normalization Contract

Every zone normalizer:

1. **Accepts** `Partial<ZoneConfig>` + optional `activeAudience?: string` + optional `now?: Date`
2. **Applies defaults** from the zone's `DEFAULT_*_CONFIG` constant for top-level fields (heading, maxItems, etc.)
3. **Filters by audience** using `isVisibleForAudience()` — items without `allowedAudiences` are always included
4. **Deduplicates by ID** — first occurrence wins, duplicates silently dropped
5. **Validates required fields** — items missing required text fields (title, etc.) are silently dropped
6. **Trims text** — all string fields are trimmed; empty-after-trim is treated as missing
7. **Sorts** using zone-appropriate comparators (featured-first → order → title)
8. **Returns** a normalized output suitable for direct rendering by the webpart component

### Per-Zone Specifics

| Zone | Normalizer | Extra Behavior |
|------|-----------|----------------|
| Top Band | `normalizeWelcomeHeaderConfig`, `normalizeHeroBannerConfig` | Alert severity whitelist (`none`, `info`, `warning`, `critical`); CTA requires both label AND href |
| Utility | `normalizePriorityActionsRailConfig`, `normalizeToolLauncherWorkHubConfig` | Groups items by group.id (defaults missing group to `'general'`); drops empty groups |
| Communications | `normalizeCompanyPulseConfig`, `normalizeLeadershipMessageConfig`, `normalizePeopleCultureConfig` | Featured/secondary split; media validation (requires alt text for leadership/people); CTA validation |
| Operational | `normalizeProjectPortfolioSpotlightConfig`, `normalizeSafetyFieldExcellenceConfig` | Freshness calculation (`updatedAt` vs `staleAfterHours`); milestone normalization; status/indicator variant defaults |
| Discovery | `normalizeSmartSearchWayfindingConfig` | Most complex — category mapping, searchableText construction, query matching, promoted resource selection, strategy label |

### Cross-Zone Patterns (Repeated But Not Shared)

These patterns appear in multiple zone normalizers. They are currently duplicated rather than extracted. This is acceptable for now — extraction would add abstraction without clear benefit.

| Pattern | Description | Present In |
|---------|-------------|------------|
| `hasText(s)` | `typeof s === 'string' && s.trim().length > 0` | communications, discovery, operational, utility |
| `normalizeCta(cta)` | Validates both label AND href are present; returns `undefined` if invalid | communications, operational, top-band |
| `byPriority()` | Sort: featured first → lower order → alphabetical title | communications, operational |
| `byOrderThenTitle()` | Sort: lower order → alphabetical title (no featured concept) | utility, discovery |
| Audience filter | `isVisibleForAudience(item.audiences, activeAudience)` | All zones |
| ID deduplication | `seen.has(id) ? skip : add` | All zones |

---

## Zone Configuration Contracts

| File | Zone | Config Interfaces | Default Constants |
|------|------|-------------------|-------------------|
| `topBandContracts.ts` | Top Band | `PersonalizedWelcomeHeaderConfig`, `HbHeroBannerConfig`, `WelcomeAlertSeverity` | `DEFAULT_WELCOME_HEADER_CONFIG`, `DEFAULT_HERO_BANNER_CONFIG` |
| `utilityContracts.ts` | Utility | `PriorityActionsRailConfig`, `ToolLauncherWorkHubConfig`, item/group/badge types | `DEFAULT_PRIORITY_ACTIONS_CONFIG`, `DEFAULT_TOOL_LAUNCHER_CONFIG` |
| `communicationsContracts.ts` | Communications | `CompanyPulseConfig`, `LeadershipMessageConfig`, `PeopleCultureConfig`, item/entry types | `DEFAULT_COMPANY_PULSE_CONFIG`, `DEFAULT_LEADERSHIP_MESSAGE_CONFIG`, `DEFAULT_PEOPLE_CULTURE_CONFIG` |
| `operationalAwarenessContracts.ts` | Operational | `ProjectPortfolioSpotlightConfig`, `SafetyFieldExcellenceConfig`, status/milestone/freshness types | `DEFAULT_PROJECT_PORTFOLIO_SPOTLIGHT_CONFIG`, `DEFAULT_SAFETY_FIELD_EXCELLENCE_CONFIG` |
| `discoveryContracts.ts` | Discovery | `SmartSearchWayfindingConfig`, resource/category/quickPath types | `DEFAULT_SMART_SEARCH_WAYFINDING_CONFIG` |
| `authoringGovernanceContracts.ts` | Cross-zone | `HomepageZone`, `FreshnessCadence`, `AuthoringMessageSet`, `HomepageAuthoringGovernanceEntry` | — |

**Defaults convention:** DEFAULT constants cover only top-level config fields (heading, maxItems, staleAfterHours). Nested item/entry defaults are handled by zone normalizers during runtime normalization.

---

## Content Models

| File | Types | Active Consumers |
|------|-------|-----------------|
| `contentModels.ts` | `HomepageCtaLink`, `HomepageMediaSlot`, `HomepageCuratedListItem`, `HomepageSpotlightItem`, `HomepageMessageNotice`, `HomepagePersonRecognition` | `HomepageCtaLink` and `HomepageMediaSlot` are actively used by zone contracts. Others are scaffold-era types with minimal/no active usage. |

---

## Deprecated / Scaffold-Era Files

### `helpers/normalization.ts` — ORPHANED

Exports `normalizeCuratedListItems()`. Zero imports in the codebase. The zone-specific normalizers handle their own deduplication and trimming. This file is a scaffold-era artifact that was never wired to production normalization.

**Disposition:** Retained for historical reference. Not imported. Will be removed when cleanup is warranted.

### `helpers/config.ts` — SCAFFOLD-ERA

Exports `normalizeHomepageConfig()` and `HomepageScaffoldConfig`. Used only by `ReferenceHomepageComposition.tsx` (reference/demo). Not used by any production webpart normalization path.

**Disposition:** Retained for `ReferenceHomepageComposition` usage. The interface name (`HomepageScaffoldConfig`) and generic fields (maxItems, showSectionHeaders, enableAudienceFilter) reflect its scaffold origin. Production config normalization uses zone-specific normalizers with zone-specific contracts.

### `webparts/hbWebparts/` — LEGACY MANIFEST

Contains only `HbWebpartsWebPart.manifest.json`. Excluded from builds by `HB_WEBPARTS_EXCLUDED_MANIFEST_IDS` in the build tool. Retained for historical reference only.

---

## Known Gaps (Deferred)

1. **Cross-zone pattern extraction** — `hasText`, `normalizeCta`, `byPriority` are duplicated. Extraction would reduce duplication but add abstraction. Deferred unless duplication causes maintenance issues.
2. **Normalized output types** — Zone normalizers return heterogeneous output shapes. A shared `NormalizedZoneConfig<T>` interface could standardize validation metadata. Deferred to avoid premature abstraction.
3. **Content model cleanup** — `HomepageSpotlightItem`, `HomepageMessageNotice`, `HomepagePersonRecognition` in contentModels.ts appear unused. Cleanup deferred to avoid breaking scaffold-era test references.
4. **Authoring governance enforcement** — The governance registry is test-locked but not code-generated. Structural enforcement (e.g., derive registry from webpart metadata) is deferred.
