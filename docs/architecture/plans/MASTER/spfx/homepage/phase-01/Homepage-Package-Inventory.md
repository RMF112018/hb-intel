# Homepage Package Inventory

Complete inventory of `apps/hb-webparts` with folder-to-responsibility mapping.

## Package metadata

| Field | Value |
|-------|-------|
| Package name | `@hbc/spfx-hb-webparts` |
| Version | `0.0.1` |
| Solution ID | `39b8f2ea-59bd-45b7-b4ec-b590b316833b` |
| Package version | `1.0.0.30` (4-part SPFx format) |
| Build | Vite IIFE (`hb-webparts-app-{hash}.js`) |
| Test | Vitest (13 test files, jsdom environment) |
| UI entry point | `@hbc/ui-kit/homepage` |
| Packaging model | Multi-webpart cumulative `.sppkg` |

---

## Entry / mount seams

| File | Responsibility | Production? |
|------|---------------|-------------|
| `src/mount.tsx` | Primary mount/dispatch seam. Exports `mount()`/`unmount()` on `globalThis.__hbIntel_hbWebparts`. Maps webpart IDs to React components via `WEBPART_RENDERERS`. Falls back to `ReferenceHomepageComposition`. | **Yes** — production SPFx contract |
| `src/mount-hero-proof-case.tsx` | Isolated entry for HbHeroBanner tenant validation | No — proof-case only |
| `src/mount-priority-actions-rail-proof-case.tsx` | Isolated entry for PriorityActionsRail tenant validation | No — proof-case only |

## Shared homepage primitives (`src/homepage/shared/`)

| Component | Responsibility | Consuming zones |
|-----------|---------------|-----------------|
| `HomepageTopBandPair` | Layout wrapper for welcome header + hero banner pair | Top Band |
| `HomepageRailShell` | Horizontal rail layout for utility-zone webparts | Utility |
| `HomepageSectionShell` | Standard section wrapper with heading and spacing | All zones |
| `HomepageEditorialCard` | Editorial content card with title, summary, metadata | Communications, Operational |
| `HomepageSpotlightCard` | Featured/spotlight card with status, media, CTA | Operational |
| `HomepagePersonRecognitionCard` | People/recognition card with avatar and role | Communications |
| `HomepageCuratedContentCluster` | Curated content cluster with featured + secondary hierarchy | Communications |
| `HomepageOperationalAwarenessCluster` | Operational status cluster with freshness indicators | Operational |
| `HomepageDiscoveryCluster` | Search/wayfinding result cluster | Discovery |
| `HomepageUtilityTile` | Compact utility tile for actions and tools | Utility |
| `HomepageUtilityDenseGroup` | Dense grouping of utility tiles | Utility |
| `HomepageEmptyState` | Homepage-styled empty state wrapper | All zones |
| `HomepageLoadingState` | Homepage-styled loading spinner wrapper | All zones |
| `index.ts` | Barrel re-export for all shared primitives | — |

## Helper seams (`src/homepage/helpers/`)

### Package-wide helpers

| Helper | Responsibility |
|--------|---------------|
| `identity.ts` | Resolve user identity (name, email) from SPFx context with fallback chain |
| `greeting.ts` | Time-based greeting resolution (morning/afternoon/evening) |
| `welcomeMessage.ts` | Personalized welcome message composition |
| `config.ts` | Homepage-level config normalization |
| `normalization.ts` | Generic data normalization utilities |
| `visibility.ts` | Role/audience visibility filtering |
| `authoringGovernance.ts` | Authoring validation, error messaging, governance registry |

### Zone-specific helpers

| Helper | Zone | Responsibility |
|--------|------|---------------|
| `topBandConfig.ts` | Top Band | Welcome header + hero banner config normalization |
| `utilityConfig.ts` | Utility | Priority actions + tool launcher config normalization |
| `communicationsConfig.ts` | Communications | Company pulse, leadership, people config normalization |
| `operationalAwarenessConfig.ts` | Operational | Project spotlight + safety config normalization |
| `discoveryConfig.ts` | Discovery | Smart search/wayfinding config normalization |

## Zone configuration contracts (`src/homepage/webparts/`)

| File | Zone | Contracts |
|------|------|-----------|
| `topBandContracts.ts` | Top Band | `PersonalizedWelcomeHeaderConfig`, `HbHeroBannerConfig`, `WelcomeAlertSeverity` |
| `utilityContracts.ts` | Utility | `PriorityActionsRailConfig`, `ToolLauncherWorkHubConfig`, item/badge types |
| `communicationsContracts.ts` | Communications | `CompanyPulseConfig`, `LeadershipMessageConfig`, `PeopleCultureConfig`, item types |
| `operationalAwarenessContracts.ts` | Operational | `ProjectPortfolioSpotlightConfig`, `SafetyFieldExcellenceConfig`, status types |
| `discoveryContracts.ts` | Discovery | `SmartSearchWayfindingConfig`, category/resource types |
| `authoringGovernanceContracts.ts` | Cross-zone | Authoring governance types |
| `index.ts` | — | Barrel re-export for all contracts |

## Content models (`src/homepage/models/`)

| File | Responsibility |
|------|---------------|
| `contentModels.ts` | Shared content types (CTA links, media slots, badges, status indicators) |

## Production webpart folders (`src/webparts/`)

| Folder | Webpart | Zone | Manifest ID | Files |
|--------|---------|------|-------------|-------|
| `personalizedWelcomeHeader/` | Personalized Welcome Header | Top Band | `46bfde64-...` | manifest, index.ts, component.tsx |
| `hbHeroBanner/` | HB Hero Banner | Top Band | `39762a4d-...` | manifest, index.ts, component.tsx |
| `priorityActionsRail/` | Priority Actions Rail | Utility | `b3f07190-...` | manifest, index.ts, component.tsx |
| `toolLauncherWorkHub/` | Tool Launcher / Work Hub | Utility | `cb7060f5-...` | manifest, index.ts, component.tsx |
| `companyPulse/` | Company Pulse | Communications | `0b53f651-...` | manifest, index.ts, component.tsx |
| `leadershipMessage/` | Leadership Message | Communications | `e8fa8a84-...` | manifest, index.ts, component.tsx |
| `peopleCulture/` | People & Culture | Communications | `27ac10f4-...` | manifest, index.ts, component.tsx |
| `projectPortfolioSpotlight/` | Project / Portfolio Spotlight | Operational | `8370ab0c-...` | manifest, index.ts, component.tsx |
| `safetyFieldExcellence/` | Safety & Field Excellence | Operational | `89ca5ff3-...` | manifest, index.ts, component.tsx |
| `smartSearchWayfinding/` | Smart Search / Wayfinding | Discovery | `11d72b36-...` | manifest, index.ts, component.tsx |

### Legacy scaffold (excluded from builds)

| Folder | Status |
|--------|--------|
| `hbWebparts/` | Contains only `HbWebpartsWebPart.manifest.json`. Excluded from builds by `HB_WEBPARTS_EXCLUDED_MANIFEST_IDS`. Retained for historical reference. |

## Reference composition

| File | Responsibility |
|------|---------------|
| `src/homepage/ReferenceHomepageComposition.tsx` | Development preview and visual integration reference. Renders all 10 webparts with sample data in vertical zone stack. |

## Test inventory (`src/homepage/__tests__/`)

| Test file | Coverage area |
|-----------|--------------|
| `topBandWebparts.test.tsx` | Top-band webpart rendering |
| `utilityConfig.test.ts` | Utility zone config normalization |
| `utilityWebparts.test.tsx` | Utility webpart rendering |
| `communicationsConfig.test.ts` | Communications zone config normalization |
| `communicationsWebparts.test.tsx` | Communications webpart rendering |
| `operationalAwarenessConfig.test.ts` | Operational zone config normalization |
| `operationalAwarenessWebparts.test.tsx` | Operational webpart rendering |
| `discoveryConfig.test.ts` | Discovery zone config normalization |
| `discoveryWebpart.test.tsx` | Discovery webpart rendering |
| `authoringGovernance.test.ts` | Authoring governance logic |
| `helpers.test.ts` | Identity, greeting, and shared helper logic |
| `primitives.test.tsx` | Shared homepage primitives rendering |

## Configuration files

| File | Responsibility |
|------|---------------|
| `package.json` | Package metadata, scripts, dependencies |
| `config/package-solution.json` | SPFx solution metadata (ID, version, features) |
| `vite.config.ts` | Vite IIFE build config with ui-kit aliases |
| `vitest.config.ts` | Vitest config (jsdom, test includes) |
| `tsconfig.json` | TypeScript config (extends base) |
| `.eslintrc.cjs` | ESLint config with `no-restricted-imports` guardrail |

## File counts

| Category | Count |
|----------|-------|
| Production webpart components | 10 |
| Shared homepage primitives | 13 |
| Helper modules | 12 |
| Zone contract files | 7 |
| Test files | 13 (12 listed + test-setup) |
| Entry/mount files | 3 |
| Manifest files | 11 (10 production + 1 legacy) |
| Config files | 6 |
| **Total source files** | **~70** |
