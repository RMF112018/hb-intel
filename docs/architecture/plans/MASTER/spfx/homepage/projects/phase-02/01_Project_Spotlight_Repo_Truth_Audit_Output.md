# Project Spotlight — Repo-Truth Audit and Doctrine Gate Output

**Phase:** P06-01 — Entry gate for Phase 02 (List Integration and Polish)
**Date:** 2026-04-06
**Status:** Complete

---

## 1. Repo-truth starting point

### Key files

| File | Purpose |
|------|---------|
| `apps/hb-webparts/src/webparts/projectPortfolioSpotlight/ProjectPortfolioSpotlight.tsx` | Main component (972 lines). Inline sub-components: `ProjectTeamStrip`, `SupportingTile`. All styles inline. |
| `apps/hb-webparts/src/webparts/projectPortfolioSpotlight/ProjectPortfolioSpotlightWebPart.manifest.json` | SPFx manifest with 4 seed projects in `preconfiguredEntries`. Manifest ID: `8370ab0c-b6df-4db0-82f1-24b54750f508`. |
| `apps/hb-webparts/src/webparts/projectPortfolioSpotlight/index.ts` | Exports component + props type. |
| `apps/hb-webparts/src/homepage/webparts/operationalAwarenessContracts.ts` | Type contracts: `ProjectPortfolioSpotlightConfig`, `ProjectPortfolioSpotlightItem`, `ProjectMilestone`, `ProjectTeamMember`, `OperationalStatusSignal`, `OperationalFreshness`. |
| `apps/hb-webparts/src/homepage/helpers/operationalAwarenessConfig.ts` | Normalization pipeline: `normalizeProjectPortfolioSpotlightConfig()` (lines 162–229). Validates, filters, sorts, splits featured/secondary. |
| `apps/hb-webparts/src/homepage/tokens.ts` | Design tokens: `HP_SPACE`, `HP_RADIUS`, `HP_IMAGE`, `HP_BORDER`, `HP_MOTION`, warm accent palette `rgb(229,126,70)`. |
| `apps/hb-webparts/src/homepage/shared/useResponsiveTier.ts` | Responsive hook: mobile (<=767px), tablet (768–1199px), desktop (>=1200px). |
| `apps/hb-webparts/src/homepage/helpers/authoringGovernance.ts` | Empty/error state messages for `operationalAwareness` zone. Owner: "Project Controls", cadence: "weekly". |
| `apps/hb-webparts/src/homepage/helpers/visibility.ts` | Audience filtering: `isVisibleForAudience()`. |
| `apps/hb-webparts/src/homepage/shared/HomepageEmptyState.tsx` | Shared empty state component. |
| `apps/hb-webparts/src/homepage/shared/HomepageLoadingState.tsx` | Shared loading state component. |
| `apps/hb-webparts/src/homepage/models/contentModels.ts` | Shared types: `HomepageMediaSlot`, `HomepageCtaLink`. |
| `apps/hb-webparts/src/homepage/homepage-interactive.module.css` | CSS module: `.teamStripButton`, `.teamDetailBackdrop` for interactive states. |

### Current content path

The webpart is **100% manifest-driven**. No SharePoint list queries, no REST calls, no PnPjs usage.

Data flow:
1. `preconfiguredEntries` in manifest JSON defines 4 seed projects (1 featured, 3 secondary).
2. SPFx runtime passes `webPartProperties` to mount dispatcher (`mount.tsx`).
3. Mount dispatcher routes by `webPartId` to `ProjectPortfolioSpotlight` component.
4. Component receives `config?: Partial<ProjectPortfolioSpotlightConfig>` as props.
5. `normalizeProjectPortfolioSpotlightConfig()` validates, filters by audience, sorts by priority, splits into `featured` + `secondary`.
6. Component renders the normalized output.

No property pane controls exist — configuration is static from manifest or programmatic.

### Current layout model

- **Desktop (>=1200px):** Featured (62%) + rail (33%) side-by-side flex.
- **Tablet (768–1199px):** Featured full-width, rail below.
- **Mobile (<=767px):** Stacked vertical. Team detail renders as bottom-sheet overlay.
- **Root surface:** `borderRadius: 10px`, `borderLeft: 3px solid rgba(229,126,70,0.40)`, dual-layer box-shadow.
- **Featured image zone:** 48% flex on desktop, 40% on tablet, 200–240px height on mobile. Scrim gradient overlay for text legibility.
- **Rail tiles:** flex gap 10px, 72px thumbnail width. Optional anchor wrapping for CTA.
- **Header:** Flex with space-between. Left: heading. Right: "View all projects" ghost CTA.

### Current supporting helpers

| Helper | Location | Usage |
|--------|----------|-------|
| `normalizeProjectPortfolioSpotlightConfig()` | `operationalAwarenessConfig.ts:162` | Full normalization pipeline |
| `byPriority()` | `operationalAwarenessConfig.ts:56` | Sort: featured > order > recency > alpha |
| `resolveAuthoringMessage()` | `authoringGovernance.ts:207` | Empty/invalid state messages |
| `isVisibleForAudience()` | `visibility.ts` | Runtime audience filtering |
| `useResponsiveTier()` | `useResponsiveTier.ts` | Responsive breakpoint detection |
| Freshness calculation | `operationalAwarenessConfig.ts:134` | Stale detection (default 168h/7d threshold) |
| Content completeness | `operationalAwarenessConfig.ts:186` | Rates items full/partial/minimal |

---

## 2. Doctrine constraints

### Binding rules that directly affect this webpart

| Rule | Source | Impact |
|------|--------|--------|
| Page-canvas ownership only | Governing Standard §3.1, Homepage Overlay §3.1 | Must not create shell chrome, nav, sidebar, or footer elements. |
| Premium posture required | Governing Standard §4.1 | Default Fluent visual language prohibited as dominant answer. Structural rebuild preferred over decorative refinement. |
| Import discipline (ESLint-enforced) | Homepage Overlay §3.2, entry-points.md | Primary: `@hbc/ui-kit/homepage`. Supplementary: `@hbc/ui-kit/theme`, `@hbc/ui-kit/icons`. |
| Approved premium stack mandatory | Governing Standard §5, Homepage Overlay §4 | `motion`, `lucide-react`, `@floating-ui/react`, Radix primitives, CVA, clsx. Material usage required. |
| Authoring safety | Governing Standard §8, Homepage Overlay §3.4 | Must render correctly when minimally/partially configured, moved between sections, in edit mode. |
| Empty/loading/error states mandatory | Homepage Overlay §3.5 | Author-safe defaults that communicate webpart purpose. |
| Token discipline | Homepage Overlay §3.6 | Shared semantic tokens required. Direct hex/rgb prohibited unless documented exception. |
| Accessibility | Homepage Overlay §3.3 | WCAG 2.1 AA (4.5:1 text, 3:1 interactive), visible keyboard focus, `prefers-reduced-motion`. |
| Adjacent manifest required | Governing Standard §9, Homepage Overlay §2.2 | Manifest must be co-located with webpart entry. |
| Full-bleed support | Homepage Overlay §6.3 | `"supportsFullBleed": true` required for flagship surfaces. |

### Allowed patterns

- Full-width section layouts for flagship surfaces.
- Zone-specific visual treatment (operational awareness zone tint).
- Homepage-local shared components in `apps/hb-webparts/src/homepage/shared/`.
- Brand expression stronger than generic SPFx (premium, established).
- Warm accent palette `rgb(229,126,70)` as operational zone identity.
- Inline styles using token constants from `tokens.ts`.
- CSS module for interactive states (`.teamStripButton`, `.teamDetailBackdrop`).
- Motion for reveal, hover, press transitions (lighter than PWA).
- Anchored overlays for team detail (desktop popover, mobile bottom-sheet).

### Prohibited patterns

- Importing from `@hbc/ui-kit` root or `@hbc/ui-kit/app-shell`.
- Shell chrome, navigation, footer elements.
- Fighting or suppressing SharePoint host chrome.
- Generic enterprise card-grid outcomes (thin-border white-card repetition).
- Large empty hero slabs with minor copy.
- Unicode/text-initial pseudo-icons where real icon system expected.
- Timid hierarchy, undersized modules, excessive empty canvas.
- Carousel gimmicks.
- Treating the surface as KPI/status widget, project list, report card, or dense operational grid.

### Required entry-point/import boundaries

| Entry point | Status | Notes |
|-------------|--------|-------|
| `@hbc/ui-kit/homepage` | **Required primary** | All shared visual primitives, governance constants, motion, icons |
| `@hbc/ui-kit/theme` | Allowed supplementary | Token-only imports when homepage entry lacks needed token |
| `@hbc/ui-kit/icons` | Allowed supplementary | Icon-only imports beyond homepage re-exports |
| `@hbc/ui-kit` | **Prohibited** | Full library exceeds SPFx bundle budget |
| `@hbc/ui-kit/app-shell` | **Prohibited** | Shell chrome — homepage is page-canvas surface |

**Current compliance:** The component imports from `@hbc/ui-kit/homepage` only. Compliant.

---

## 3. Change map

### What should remain

| Element | Reason |
|---------|--------|
| Component file structure (`ProjectPortfolioSpotlight.tsx`, `index.ts`, manifest) | Architecturally correct placement |
| Type contracts in `operationalAwarenessContracts.ts` | Sound foundation; extend for list fields, do not replace |
| Normalization pipeline in `operationalAwarenessConfig.ts` | Proven sort/filter/split logic; extend for list-sourced data |
| Design tokens from `tokens.ts` | Doctrine-compliant shared tokens |
| Responsive tier system (`useResponsiveTier`) | Correct breakpoint model |
| Authoring governance messages | Required by doctrine for empty/invalid states |
| Audience visibility filtering | Required for production use |
| Shared states (`HomepageEmptyState`, `HomepageLoadingState`) | Doctrine-mandated states |
| Import boundaries (`@hbc/ui-kit/homepage` primary) | ESLint-enforced, compliant today |
| Warm accent palette and editorial border | Zone-appropriate brand expression |
| Team strip + flyout interaction model | Doctrine-aligned interaction pattern |
| `HbcPremiumCta`, `HbcPremiumBadge`, `HbcHomepageEyebrow`, `HbcHomepageMetadataRow` usage | Correct ui-kit primitive usage |
| Featured/secondary split with stale demotion | Sound editorial hierarchy logic |

### What must change

| Element | Required change | Prompt |
|---------|----------------|--------|
| Data source | Add SharePoint list query (`Homepage Project Spotlights`) as primary source; manifest becomes fallback/demo seed only | P06-02 |
| Type contracts | Extend `ProjectPortfolioSpotlightItem` with list-schema fields (`ProjectId`, `ProjectUrl`, `HomepageEnabled`, `Headline`, `LocationText`, `Sector`, `PrimaryImage`, `PrimaryImageAltText`, `StatusVariant`, `StrategicEmphasis`, `FreshnessDate`, `FreshnessSource`, `MilestonesCompleted`, `MilestonesTotal`, `MilestoneSummary`, `CtaLabel`, `CtaUrl`, `ProjectTeamMembers`, `Audience`, `StaleAfterDays`, `PublishStart`, `PublishEnd`) | P06-02 |
| Normalization pipeline | Extend to map list field names to normalized item shape | P06-02 |
| Image handling | Add `onError` fallback, focal/crop support, designed placeholder states | P06-03 |
| Featured hierarchy | Strengthen 70/30 editorial split, increase image dominance, refine typography hierarchy | P06-04 |
| Supporting rail | Improve gallery-navigation feel, strengthen thumbnail presence | P06-05 |
| Team strip | Improve copy, warmth, fallback avatar handling | P06-05 |
| Header CTA | Decouple "View all projects" from featured item CTA; add explicit section-level action config | P06-06 |
| Responsive/a11y | Harden keyboard navigation, CLS prevention, `prefers-reduced-motion` | P06-07 |

### What must not be touched

| Element | Reason |
|---------|--------|
| Other homepage webparts | Out of scope — this package is Project Spotlight only |
| `@hbc/ui-kit/homepage` exports | Promotion requires separate justification |
| Shell or navigation behavior | Page-canvas ownership only |
| Signature hero surface | Governed by Phase 18 locked content rules |
| Homepage mount dispatcher (`mount.tsx`) | Routing infrastructure — no changes needed |
| Shared homepage helpers used by other webparts | Cross-cutting concern; change only the Project Spotlight normalization path |

---

## 4. Execution recommendation

The prompts should execute in order as designed. The audit confirms no blockers or resequencing needed.

| Order | Prompt | Scope | Dependencies |
|-------|--------|-------|--------------|
| 1 | P06-01 (this prompt) | Audit and doctrine lock | None — entry gate |
| 2 | P06-02 | SharePoint list data-source wiring | Requires P06-01 audit as baseline |
| 3 | P06-03 | Media reliability and image fallback | Requires P06-02 (list may provide new image URLs) |
| 4 | P06-04 | Featured hero hierarchy and typography | Requires P06-03 (image handling affects layout) |
| 5 | P06-05 | Supporting rail and team strip refinement | Requires P06-04 (hierarchy affects rail proportions) |
| 6 | P06-06 | Header/CTA and property pane refinement | Can follow P06-05 (CTA decoupling is independent but benefits from settled layout) |
| 7 | P06-07 | Responsive, accessibility, performance hardening | Requires P06-04–06 (hardens the settled implementation) |
| 8 | P06-08 | Final validation, documentation, package closure | Requires all prior prompts complete |

### Key architectural decisions for subsequent prompts

1. **List query pattern:** Follow the proven `packages/spfx/src/webparts/projectSites/` pattern — PnPjs with `spfi().using(SPFx(context))`, TanStack Query wrapper, field-mapping constants, normalization adapter.
2. **Manifest seed retention:** Keep `preconfiguredEntries` as demo/fallback seed. List-sourced data takes priority when available.
3. **Contract extension strategy:** Extend existing types in `operationalAwarenessContracts.ts` rather than creating parallel type systems. Map list internal field names to the existing normalized shape.
4. **UI-kit boundary:** All polish work stays webpart-local. No `@hbc/ui-kit/homepage` promotions are justified by this package scope.
5. **Import compliance:** Current imports are compliant. No changes to import boundaries needed.
