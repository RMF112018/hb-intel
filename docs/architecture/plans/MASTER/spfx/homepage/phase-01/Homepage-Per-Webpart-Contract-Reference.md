# Homepage Per-Webpart Contract Reference

Authoritative contract reference for all 10 HB Central homepage webparts. Each contract defines the webpart's purpose, zone, configuration, state handling, dependencies, and authoring expectations.

---

## Contract Conventions

All webparts share these conventions unless noted otherwise:

- **Config normalization:** Every webpart calls its zone normalizer on the raw `Partial<Config>` before rendering
- **Empty state classification:** Webparts distinguish `noData` (no config provided) from `invalid` (config provided but invalid/empty after normalization), using `resolveAuthoringMessage()` from the authoring governance registry
- **Loading state:** Webparts with `isLoading` prop render `HomepageLoadingState` with a descriptive label
- **Audience filtering:** Webparts with `activeAudience` prop delegate to `isVisibleForAudience()` during normalization — items without `allowedAudiences` are always visible
- **Independent rendering:** Every webpart renders inside an `HbcCard` wrapper and can be mounted independently via the `mount.tsx` dispatch seam
- **UI entry point:** All imports from `@hbc/ui-kit/homepage` only

---

## Top Band Zone

### 1. Personalized Welcome Header

| Field | Value |
|-------|-------|
| **Zone** | Top Band |
| **Purpose** | Personalized greeting with contextual support line and optional alert banner |
| **Manifest ID** | `46bfde64-f0cb-4f62-9f6b-a466f8fadc1f` |
| **Folder** | `src/webparts/personalizedWelcomeHeader/` |

**Props:**
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `identity` | `HomepageIdentityInput` | Yes | User identity for personalized greeting |
| `config` | `Partial<PersonalizedWelcomeHeaderConfig>` | No | Support line, context line, alert properties |
| `now` | `Date` | No | Override for current time (testing) |

**Config fields:**
| Field | Type | Default | Required |
|-------|------|---------|----------|
| `supportLine` | `string` | `'Welcome back to HB Central.'` | No |
| `contextLine` | `string` | — | No |
| `alertSeverity` | `WelcomeAlertSeverity` | `'none'` | No |
| `alertTitle` | `string` | — | No |
| `alertMessage` | `string` | — | No |

**State handling:**
| State | Behavior |
|-------|----------|
| Loading | Not applicable — synchronous rendering |
| Empty | Renders greeting with default support line; no visual empty state |
| Invalid config | Alert severity whitelist (`none`, `info`, `warning`, `critical`) — invalid values normalize to `'none'` |
| Stale data | Not applicable |

**Dependencies:** Requires `identity` input. Uses `resolveWelcomeMessage()` for greeting composition. No audience filtering.

**Authoring expectations:** Content authors control the support line, context line, and alert banner through property pane. The greeting is system-generated from user identity + time of day. Alert severity is constrained to the enum whitelist.

---

### 2. HB Hero Banner

| Field | Value |
|-------|-------|
| **Zone** | Top Band |
| **Purpose** | Authorable editorial hero banner with headline, message, and CTA |
| **Manifest ID** | `39762a4d-c7fd-44a6-a11e-4f8de9f5778d` |
| **Folder** | `src/webparts/hbHeroBanner/` |

**Props:**
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `config` | `Partial<HbHeroBannerConfig>` | No | Headline, message, metadata, CTA |

**Config fields:**
| Field | Type | Default | Required |
|-------|------|---------|----------|
| `headline` | `string` | `'Build with confidence.'` | Yes (empty state if missing) |
| `message` | `string` | — | No |
| `metadata` | `string` | — | No |
| `background` | `object` | — | No |
| `cta` | `HomepageCtaLink` | — | No (requires both label AND href) |

**State handling:**
| State | Behavior |
|-------|----------|
| Loading | Not applicable — synchronous rendering |
| Empty (no config) | `HomepageEmptyState` with `noData` authoring message |
| Empty (invalid) | `HomepageEmptyState` with `invalid` authoring message (headline missing or empty-after-trim) |
| Stale data | Not applicable |

**Dependencies:** None — fully independent. Uses `useHomepageReducedMotion` for motion-safe rendering.

**Authoring expectations:** Headline is the minimum required field. CTA is validated — both label and href must be present or the CTA is dropped. Authors see a clear empty state message when no content is configured.

---

## Utility Zone

### 3. Priority Actions Rail

| Field | Value |
|-------|-------|
| **Zone** | Utility |
| **Purpose** | Compact rail of prioritized action links grouped by category |
| **Manifest ID** | `b3f07190-79cf-437d-a1d6-ecbf3f77e616` |
| **Folder** | `src/webparts/priorityActionsRail/` |

**Props:**
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `config` | `Partial<PriorityActionsRailConfig>` | No | Heading, groups, actions, maxItems |
| `activeAudience` | `string` | No | Audience filter |
| `isLoading` | `boolean` | No | Loading state flag |

**Config fields:**
| Field | Type | Default | Required |
|-------|------|---------|----------|
| `heading` | `string` | `'Priority Actions'` | No |
| `groups` | `PriorityActionGroup[]` | — | No |
| `actions` | `PriorityActionItem[]` | — | No |
| `maxItems` | `number` | `8` | No |

**State handling:**
| State | Behavior |
|-------|----------|
| Loading | `HomepageLoadingState` — "Loading priority actions" |
| Empty (no config) | `HomepageEmptyState` with `noData` authoring message |
| Empty (invalid) | `HomepageEmptyState` with `invalid` authoring message (actions/groups provided but all filtered/invalid) |
| Stale data | Not applicable |

**Dependencies:** `activeAudience` for filtering. Groups items by `group.id` (missing group defaults to `'general'`). Empty groups are dropped.

---

### 4. Tool Launcher / Work Hub

| Field | Value |
|-------|-------|
| **Zone** | Utility |
| **Purpose** | Grouped launcher tiles for tools, forms, and systems |
| **Manifest ID** | `cb7060f5-b852-4600-b912-a5f6f7221ce2` |
| **Folder** | `src/webparts/toolLauncherWorkHub/` |

**Props:**
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `config` | `Partial<ToolLauncherWorkHubConfig>` | No | Heading, groups, limits |
| `activeAudience` | `string` | No | Audience filter |
| `isLoading` | `boolean` | No | Loading state flag |

**Config fields:**
| Field | Type | Default | Required |
|-------|------|---------|----------|
| `heading` | `string` | `'Tool Launcher / Work Hub'` | No |
| `groups` | `ToolLauncherGroup[]` | — | No |
| `maxGroups` | `number` | `4` | No |
| `maxItemsPerGroup` | `number` | `6` | No |

**State handling:**
| State | Behavior |
|-------|----------|
| Loading | `HomepageLoadingState` — "Loading tool launchers" |
| Empty (no config) | `HomepageEmptyState` with `noData` authoring message |
| Empty (invalid) | `HomepageEmptyState` with `invalid` authoring message |
| Stale data | Not applicable |

**Dependencies:** `activeAudience` for filtering. Includes `ICON_MAP` for icon token resolution with fallback to `'APP'`.

---

## Communications Zone

### 5. Company Pulse

| Field | Value |
|-------|-------|
| **Zone** | Communications |
| **Purpose** | Curated internal updates with featured and secondary editorial hierarchy |
| **Manifest ID** | `0b53f651-fd92-4f7f-a9da-f7797017f5eb` |
| **Folder** | `src/webparts/companyPulse/` |

**Props:**
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `config` | `Partial<CompanyPulseConfig>` | No | Heading, items, maxSecondaryItems |
| `activeAudience` | `string` | No | Audience filter |
| `isLoading` | `boolean` | No | Loading state flag |

**Config fields:**
| Field | Type | Default | Required |
|-------|------|---------|----------|
| `heading` | `string` | `'Company Pulse'` | No |
| `items` | `CompanyPulseItem[]` | — | No |
| `maxSecondaryItems` | `number` | `3` | No |

**State handling:**
| State | Behavior |
|-------|----------|
| Loading | `HomepageLoadingState` — "Loading company pulse" |
| Empty (no config) | `HomepageEmptyState` with `noData` authoring message |
| Empty (invalid) | `HomepageEmptyState` with `invalid` authoring message |
| Stale data | Not explicitly handled — freshness is content-author responsibility |

**Dependencies:** `activeAudience` for filtering. Maps `category` to badge variants (update, safety, recognition, milestone). Uses `HomepageCuratedContentCluster` for featured/secondary hierarchy.

---

### 6. Leadership Message

| Field | Value |
|-------|-------|
| **Zone** | Communications |
| **Purpose** | Featured leadership communication with leader attribution and media |
| **Manifest ID** | `e8fa8a84-a48a-41d2-85a6-b7c7df70aeca` |
| **Folder** | `src/webparts/leadershipMessage/` |

**Props:**
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `config` | `Partial<LeadershipMessageConfig>` | No | Heading, entries, maxArchivedEntries |
| `isLoading` | `boolean` | No | Loading state flag |

**Config fields:**
| Field | Type | Default | Required |
|-------|------|---------|----------|
| `heading` | `string` | `'Leadership Message'` | No |
| `entries` | `LeadershipMessageEntry[]` | — | No |
| `maxArchivedEntries` | `number` | `2` | No |

**State handling:**
| State | Behavior |
|-------|----------|
| Loading | `HomepageLoadingState` — "Loading leadership message" |
| Empty (no config) | `HomepageEmptyState` with `noData` authoring message |
| Empty (invalid) | `HomepageEmptyState` with `invalid` authoring message |
| Stale data | Not applicable |

**Dependencies:** None — fully independent. Media validation requires alt text (media without alt is dropped by normalizer).

---

### 7. People & Culture

| Field | Value |
|-------|-------|
| **Zone** | Communications |
| **Purpose** | People recognition, milestones, and culture highlights |
| **Manifest ID** | `27ac10f4-4054-4dd2-bd53-3b4ef4379ab4` |
| **Folder** | `src/webparts/peopleCulture/` |

**Props:**
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `config` | `Partial<PeopleCultureConfig>` | No | Heading, entries, maxSecondaryEntries |
| `activeAudience` | `string` | No | Audience filter |
| `isLoading` | `boolean` | No | Loading state flag |

**Config fields:**
| Field | Type | Default | Required |
|-------|------|---------|----------|
| `heading` | `string` | `'People and Culture'` | No |
| `entries` | `PeopleCultureEntry[]` | — | No |
| `maxSecondaryEntries` | `number` | `4` | No |

**State handling:**
| State | Behavior |
|-------|----------|
| Loading | `HomepageLoadingState` — "Loading people and culture" |
| Empty (no config) | `HomepageEmptyState` with `noData` authoring message |
| Empty (invalid) | `HomepageEmptyState` with `invalid` authoring message |
| Stale data | Not explicitly handled |

**Dependencies:** `activeAudience` for filtering. Maps `eventType` to badge variants (newHire, anniversary, promotion, recognition).

---

## Operational Awareness Zone

### 8. Project / Portfolio Spotlight

| Field | Value |
|-------|-------|
| **Zone** | Operational Awareness |
| **Purpose** | Curated project and portfolio status with freshness tracking |
| **Manifest ID** | `8370ab0c-b6df-4db0-82f1-24b54750f508` |
| **Folder** | `src/webparts/projectPortfolioSpotlight/` |

**Props:**
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `config` | `Partial<ProjectPortfolioSpotlightConfig>` | No | Heading, items, maxSecondaryItems, staleAfterHours |
| `activeAudience` | `string` | No | Audience filter |
| `isLoading` | `boolean` | No | Loading state flag |

**Config fields:**
| Field | Type | Default | Required |
|-------|------|---------|----------|
| `heading` | `string` | `'Project and Portfolio Spotlight'` | No |
| `items` | `ProjectPortfolioSpotlightItem[]` | — | No |
| `maxSecondaryItems` | `number` | `3` | No |
| `staleAfterHours` | `number` | `168` (7 days) | No |

**State handling:**
| State | Behavior |
|-------|----------|
| Loading | `HomepageLoadingState` — "Loading project and portfolio spotlight" |
| Empty (no config) | `HomepageEmptyState` with `noData` authoring message |
| Empty (invalid) | `HomepageEmptyState` with `invalid` authoring message |
| **Stale data** | Items with `isStale === true` render "Stale" badge (warning variant) + `freshnessLabel` timestamp |

**Dependencies:** `activeAudience` for filtering. Freshness calculation uses `updatedAt` date against `staleAfterHours` threshold. Supports milestone lists with completion status and strategic emphasis badges.

---

### 9. Safety & Field Excellence

| Field | Value |
|-------|-------|
| **Zone** | Operational Awareness |
| **Purpose** | Safety highlights, recognitions, reminders, and operational notices with freshness tracking |
| **Manifest ID** | `89ca5ff3-21f4-4b23-a953-4b7306ea1029` |
| **Folder** | `src/webparts/safetyFieldExcellence/` |

**Props:**
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `config` | `Partial<SafetyFieldExcellenceConfig>` | No | Heading, items, maxSecondaryItems, staleAfterHours |
| `activeAudience` | `string` | No | Audience filter |
| `isLoading` | `boolean` | No | Loading state flag |

**Config fields:**
| Field | Type | Default | Required |
|-------|------|---------|----------|
| `heading` | `string` | `'Safety and Field Excellence'` | No |
| `items` | `SafetyFieldExcellenceItem[]` | — | No |
| `maxSecondaryItems` | `number` | `4` | No |
| `staleAfterHours` | `number` | `168` (7 days) | No |

**State handling:**
| State | Behavior |
|-------|----------|
| Loading | `HomepageLoadingState` — "Loading safety and field excellence" |
| Empty (no config) | `HomepageEmptyState` with `noData` authoring message |
| Empty (invalid) | `HomepageEmptyState` with `invalid` authoring message |
| **Stale data** | Items with `isStale === true` render "Stale" badge (warning variant) + `freshnessLabel` timestamp |

**Dependencies:** `activeAudience` for filtering. Maps `eventType` to badge variants (highlight, recognition, reminder, notice). Optional `indicator` badge for additional status.

---

## Discovery Zone

### 10. Smart Search / Wayfinding

| Field | Value |
|-------|-------|
| **Zone** | Discovery |
| **Purpose** | Interactive search and curated wayfinding for tools, forms, policies, and destinations |
| **Manifest ID** | `11d72b36-a92f-4e2d-9918-75df2cb0d11e` |
| **Folder** | `src/webparts/smartSearchWayfinding/` |

**Props:**
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `config` | `Partial<SmartSearchWayfindingConfig>` | No | Heading, searchPlaceholder, categories, resources, quickPaths, strategy, limits |
| `activeAudience` | `string` | No | Audience filter |
| `isLoading` | `boolean` | No | Loading state flag |

**Config fields:**
| Field | Type | Default | Required |
|-------|------|---------|----------|
| `heading` | `string` | `'Smart Search and Wayfinding'` | No |
| `searchPlaceholder` | `string` | `'Find tools, forms, policies, teams, and destinations'` | No |
| `categories` | `DiscoveryCategory[]` | — | No |
| `resources` | `DiscoveryResourceItem[]` | — | No |
| `quickPaths` | `DiscoveryQuickPath[]` | — | No |
| `strategy` | `object` | — | No |
| `maxPromotedItems` | `number` | `4` | No |
| `maxResultsPerCategory` | `number` | `6` | No |

**State handling:**
| State | Behavior |
|-------|----------|
| Loading | `HomepageLoadingState` — "Loading smart search and wayfinding" |
| Empty (no config) | `HomepageEmptyState` with `noData` authoring message |
| Empty (invalid) | `HomepageEmptyState` with `invalid` authoring message (resources/quickPaths/categories provided but all filtered/invalid) |
| **No search results** | `HomepageEmptyState` with `noResults` authoring message — unique to this webpart |
| Stale data | Not applicable |

**Dependencies:** `activeAudience` for filtering. Most complex webpart — dual normalization (base + query-filtered), interactive `useState` for search query, `searchableText` construction for client-side matching, category mapping, promoted resource selection.

**Authoring expectations:** Authors curate categories, resources, and quick paths. The search is client-side over `searchableText` (composed from title, description, keywords, category title). Strategy label communicates the future search enhancement roadmap.

---

## Cross-Webpart State Handling Matrix

| Webpart | `isLoading` | Empty (noData) | Empty (invalid) | Stale | No Results | Audience Filter |
|---------|:-----------:|:--------------:|:---------------:|:-----:|:----------:|:--------------:|
| Welcome Header | — | Default greeting | Alert normalized | — | — | — |
| Hero Banner | — | Yes | Yes | — | — | — |
| Priority Actions | Yes | Yes | Yes | — | — | Yes |
| Tool Launcher | Yes | Yes | Yes | — | — | Yes |
| Company Pulse | Yes | Yes | Yes | — | — | Yes |
| Leadership Message | Yes | Yes | Yes | — | — | — |
| People & Culture | Yes | Yes | Yes | — | — | Yes |
| Project Spotlight | Yes | Yes | Yes | Yes | — | Yes |
| Safety Excellence | Yes | Yes | Yes | Yes | — | Yes |
| Smart Search | Yes | Yes | Yes | — | Yes | Yes |

**Notes:**
- Welcome Header renders a greeting by default — it has no visual empty state because it always has something to show
- Hero Banner and Welcome Header lack `isLoading` because they render synchronously from config (no async data)
- Only Smart Search has a `noResults` state (search yields zero matches)
- Only operational awareness webparts (Project Spotlight, Safety Excellence) have stale-data handling

---

## Authoring Governance Alignment

All 10 webparts are registered in `HOMEPAGE_AUTHORING_GOVERNANCE_REGISTRY`. The registry test (`authoringGovernance.test.ts`) locks all 10 keys — adding a webpart without a registry entry fails the test.

| Webpart | Registry Key | Owner Role | Freshness Cadence |
|---------|-------------|------------|-------------------|
| Welcome Header | `personalizedWelcomeHeader` | Corporate Communications | daily |
| Hero Banner | `hbHeroBanner` | Corporate Communications | weekly |
| Priority Actions | `priorityActionsRail` | Operations Support | weekly |
| Tool Launcher | `toolLauncherWorkHub` | IT / Operations Support | monthly |
| Company Pulse | `companyPulse` | Corporate Communications | weekly |
| Leadership Message | `leadershipMessage` | Executive Communications | biweekly |
| People & Culture | `peopleCulture` | HR / Corporate Communications | weekly |
| Project Spotlight | `projectPortfolioSpotlight` | Operations Program Managers | eventDriven |
| Safety Excellence | `safetyFieldExcellence` | Safety Department | weekly |
| Smart Search | `smartSearchWayfinding` | IT / Operations Support | monthly |

**Governance integration:** Webparts that render empty states use `resolveAuthoringMessage(key, scenario)` to display context-aware messages from the registry. The message cascade is: `noResults` (if exists) → `invalid` → `noData`.
