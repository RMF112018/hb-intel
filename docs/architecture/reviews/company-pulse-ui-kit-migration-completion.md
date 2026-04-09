# Company Pulse UI-Kit Migration Completion

> Wave 01 follow-on. Named-consumer migration of `CompanyPulse` from a
> local newsroom CSS-module composition (custom blue-led editorial surface
> with three layout modes) into a shared `HbcNewsroomSurface` family in
> `@hbc/ui-kit/homepage`.
>
> Authority basis:
> `docs/architecture/plans/MASTER/ui-kit/wave-01/UI-System-Reconciliation-Execution-Note.md`,
> `docs/architecture/reviews/ui-system-refactor-audit-findings-validation.md`,
> `docs/reference/ui-kit/UI-System-Layer-Model.md`,
> `docs/reference/ui-kit/Presentation-Lane-Standard.md`,
> `docs/architecture/reviews/people-culture-ui-kit-migration-completion.md`
> and `docs/architecture/reviews/project-spotlight-ui-kit-migration-completion.md`
> (sibling precedents for cohesive surface-family migrations).

## 1. Objective completed

Move the durable presentation grammar of the Company Pulse homepage webpart out of the local consumer and into the governed shared layer, while keeping data normalization, audience filtering, authoring-governance messaging, and webpart integration local to the consumer. The result materially improves the named-consumer migration status of `CompanyPulse` from **"Local by design"** (a specialized 3-layout-mode newsroom system not previously considered a shared-family migration target) to **"Cleanly migrated"** via a new cohesive `HbcNewsroomSurface` family. Layer discipline is restored; the blue-led editorial register is preserved; and the consumer collapses into a thin integration adapter.

The work was scoped to Company Pulse only. No other webparts, surfaces, or audit findings were touched.

## 2. Shared UI ownership decisions

The migration ships **one cohesive surface family**. This was deliberately chosen over (a) flattening into `HbcEditorialSurface` (which would have collapsed the newsroom-specific 3-layout-mode behavior and tertiary quick-read zone into a generic editorial register), and (b) exploding the kit into multiple newsroom primitives (`HbcNewsroomFeaturedStory`, `HbcNewsroomHeadlineStack`, `HbcNewsroomCategoryChip`) which would have fractured the cohesive newsroom identity and made composition the consumer's responsibility. The sibling precedents `HbcPeopleCultureSurface` and `HbcProjectSpotlightSurface` both ship as cohesive single-family surfaces with inline sub-components, and `HbcNewsroomSurface` mirrors that convention.

### Foundations (Layer 1)

No new tokens introduced. All newsroom styling routes through existing governed presentation-lane tokens (expressed as literal hex values inside the surface's CSS module, matching the sibling surface-family convention):

- `HBC_PRESENTATION_BLUE` (`#225391` / `rgb(34, 83, 145)`) — dominant editorial brand accent, left border, category-chip `update` swatch, separator gradient, header title, rail background, image scrim, focus outlines
- `HBC_PRESENTATION_ORANGE` (`#e57e46` / `rgb(229, 126, 70)`) — restrained warm accent in the separator gradient and in the `milestone` category-chip swatch
- `elevationEditorial` — equivalent box-shadow profile on the root surface (expressed as the literal dual-shadow used by sibling surfaces)
- Segoe UI type stack — matches sibling surface families

The safety / recognition category-chip swatches (amber, teal) are preserved from the previous local `NR_CATEGORY_COLORS` mapping as editorial grammar, scoped to the newsroom family as a module-internal constant — they are not promoted to shared foundation tokens because they are newsroom-specific and not reused across surfaces.

### Primitives (Layer 2)

No new primitives. The surface reuses existing Layer-2 primitives already exported through `@hbc/ui-kit/homepage`:

- `HbcPremiumCta` — header "See all", lead-story CTA, sparse-footer archive CTA, tertiary archive CTA
- `FileText` / `Clock` Lucide icons — lead-story placeholder, headline-item icon, publish-date metadata icon
- `motion` from `motion/react` — reveal choreography for featured story, headline rail, and sparse footer (with reduced-motion gating)
- `usePrefersReducedMotion` (shared ui-kit hook) — accessible motion gating

### Surface families (Layer 3)

**`HbcNewsroomSurface`** — new presentation-lane surface family.
Cohesive section combining:

- A premium image-led **featured story** with scrim overlay, byline/date metadata, and optional CTA
- A subordinate **headline stack rail** with editorial-category chips, dividers, and hover/focus affordances
- A **tertiary quick-read zone** of category chips + archive CTA
- A **sparse-state footer** CTA for the lead-only layout
- A cool blue-led editorial frame (white body + blue left accent + subtle cool tint panels) that keeps Company Pulse visually distinct from the warm `HbcPeopleCultureSurface`, the image-led `HbcProjectSpotlightSurface`, and the warm-accent `HbcEditorialSurface`

The surface internally chooses one of three layout modes via a pure `resolveNewsroomLayout(model)` helper shipped alongside the component:

- `rich` — lead + supporting headline rail (+ optional tertiary zone)
- `sparse` — lead only + archive-footer CTA
- `headline-only` — full-width headline stack, no lead (+ optional tertiary zone)

This preserves the data-driven layout selection from the legacy consumer while moving the structural decision into the shared layer. Layout mode is exposed on the root as `data-hbc-newsroom-layout={layout}` for deterministic visual testing.

The surface accepts a typed `HbcNewsroomSurfaceModel` decoupled from the consumer's SharePoint contracts. Single `index.tsx` + co-located CSS module + CSS-module `.d.ts` + Storybook story (Default, Sparse, HeadlineOnly, Mobile). Naming follows the `Hbc<SemanticName>Surface` convention used by Phase 17-03 and Wave 01 follow-on surface families.

Responsive behavior moved from JS tier props (`useResponsiveTier`) to CSS media queries at `min-width: 768px` and `min-width: 1200px`, matching the sibling `HbcProjectSpotlightSurface` convention. This removes JS-driven re-renders on resize and lets the surface respond naturally to its container width.

### Consumers (Layer 4)

**`CompanyPulse`** — now a thin consumer.
Handles `isLoading` / `noData` / `invalid` fallback states via the existing `HomepageLoadingState` / `HomepageEmptyState` + `resolveAuthoringMessage`, normalizes via `normalizeCompanyPulseConfig`, adapts the SharePoint-shaped `NewsroomOutput` to the surface view-model with a tiny local mapper (`toSurfaceModel`), and delegates the entire visual composition to `HbcNewsroomSurface`.

Final size: **108 lines** (down from 167 lines in the previous Wave 04 implementation, and materially less than the ~800 cumulative lines once the deleted newsroom module is factored in).

### What stayed local

- `apps/hb-webparts/src/homepage/helpers/communicationsConfig.ts` — `normalizeCompanyPulseConfig` is part of a monolithic normalizer shared with Leadership Message and People & Culture; splitting it out would widen scope and contributes no shared-layer value.
- `apps/hb-webparts/src/homepage/helpers/authoringGovernance.ts` — webpart-specific authoring messages (`'No newsroom content configured'`, `'Newsroom configuration needs attention'`) and zone/owner metadata.
- `apps/hb-webparts/src/homepage/webparts/communicationsContracts.ts` — `CompanyPulseItem`, `CompanyPulseCategory`, `CompanyPulseConfig`, `NewsroomOutput` remain as consumer domain contracts alongside Leadership Message and People & Culture contracts.
- `apps/hb-webparts/src/homepage/shared/useResponsiveTier.ts` and `apps/hb-webparts/src/homepage/shared/usePrefersReducedMotion.ts` — explicitly gated behind a 2-consumer promotion rule in repo comments; not promoted now. The consumer no longer uses `useResponsiveTier` at all (CSS media queries inside the surface replaced that concern); `usePrefersReducedMotion` remains local but is no longer referenced from CompanyPulse because the shared surface uses its own `@hbc/ui-kit` copy.
- `apps/hb-webparts/src/webparts/companyPulse/CompanyPulseWebPart.manifest.json` GUID `0b53f651-fd92-4f7f-a9da-f7797017f5eb` and the `mount.tsx` registration.

## 3. Changes implemented

### Files created (4)

| File | Purpose |
|---|---|
| `packages/ui-kit/src/HbcNewsroomSurface/index.tsx` | Surface family component, view-model contract, inline sub-components (FeaturedStory, HeadlineStack, HeadlineItem, CategoryChip, TertiaryZone, SparseFooter), motion helpers, category color map, `resolveNewsroomLayout` helper |
| `packages/ui-kit/src/HbcNewsroomSurface/newsroom-surface.module.css` | Surface family styles — blue-led editorial root, responsive featured/rail composition via CSS media queries (`min-width: 768px` / `min-width: 1200px`), tertiary zone, sparse footer, category-chip structural rules |
| `packages/ui-kit/src/HbcNewsroomSurface/newsroom-surface.module.css.d.ts` | CSS module ambient types |
| `packages/ui-kit/src/HbcNewsroomSurface/HbcNewsroomSurface.stories.tsx` | Default (rich), Sparse, HeadlineOnly, and Mobile stories |
| `docs/architecture/reviews/company-pulse-ui-kit-migration-completion.md` | This report |

### Files modified (7)

| File | Change |
|---|---|
| `packages/ui-kit/src/homepage.ts` | Re-export `HbcNewsroomSurface` + `resolveNewsroomLayout` and all view-model / prop types (`HbcNewsroomSurfaceProps`, `HbcNewsroomSurfaceModel`, `HbcNewsroomFeaturedItem`, `HbcNewsroomHeadlineItem`, `HbcNewsroomTertiaryItem`, `HbcNewsroomMedia`, `HbcNewsroomCta`, `HbcNewsroomCategoryKey`, `HbcNewsroomLayoutMode`). Add `'newsroom'` to `HomepageSurfaceClass` and `HbcNewsroomSurface` to `HomepagePrimitiveName`. Add `newsroom` entry to `HBC_HOMEPAGE_SURFACE_FAMILIES` metadata. |
| `packages/ui-kit/src/HbcHomepageSurfaceCard/index.tsx` | Add `newsroom` surface-class entry (blue left accent + `elevationEditorial` + 12px radius) to keep `HbcHomepageSurfaceCard` exhaustive against the widened `HomepageSurfaceClass` union. |
| `apps/hb-webparts/src/webparts/companyPulse/CompanyPulse.tsx` | Refactor from 167-line local newsroom composition to a 108-line thin consumer that normalizes, adapts `NewsroomOutput` → `HbcNewsroomSurfaceModel`, and delegates to `HbcNewsroomSurface`. All local newsroom imports (`NewsroomFeaturedStory`, `NewsroomHeadlineStack`, `NewsroomCategoryChip`, `NR_NO_MOTION`, `newsroom-surface.module.css`), tertiary-zone / sparse-footer helper components, and `useResponsiveTier` / `usePrefersReducedMotion` hooks removed from the consumer path. |
| `apps/hb-webparts/src/webparts/companyPulse/CompanyPulseWebPart.manifest.json` | Bump webpart `version` from `0.0.23.0` to `0.0.24.0` (SPFx 4-part patch bump). |
| `apps/hb-webparts/src/homepage/__tests__/communicationsWebparts.test.tsx` | Update surface-attribute assertion from `data-hbc-premium="newsroom-surface"` to `data-hbc-presentation="newsroom-surface"` to match the sibling surface-family convention now used by `HbcNewsroomSurface`. No other test assertions changed. |
| `docs/architecture/plans/MASTER/ui-kit/wave-01/UI-System-Reconciliation-Execution-Note.md` | Update CompanyPulse row to "Cleanly migrated (W01 follow-on)". Update the migration summary count (5/9 → 6/9 cleanly migrated; 1/9 → 0/9 local by design). Update the visual-proof status table to move CompanyPulse from "Not visually proven" to "surface-family proof present". |
| `docs/architecture/reviews/ui-system-refactor-audit-findings-validation.md` | Append section 11 closure update describing the Company Pulse migration and revising the recommended next move. |

### Files deleted (7)

| File | Reason |
|---|---|
| `apps/hb-webparts/src/homepage/shared/newsroom/index.ts` | Replaced by `HbcNewsroomSurface` re-export through `@hbc/ui-kit/homepage` |
| `apps/hb-webparts/src/homepage/shared/newsroom/NewsroomFeaturedStory.tsx` | Replaced by the inline `FeaturedStory` sub-component in `HbcNewsroomSurface/index.tsx` |
| `apps/hb-webparts/src/homepage/shared/newsroom/NewsroomHeadlineStack.tsx` | Replaced by the inline `HeadlineStack` / `HeadlineItem` sub-components in `HbcNewsroomSurface/index.tsx` |
| `apps/hb-webparts/src/homepage/shared/newsroom/NewsroomCategoryChip.tsx` | Replaced by the inline `CategoryChip` sub-component in `HbcNewsroomSurface/index.tsx` |
| `apps/hb-webparts/src/homepage/shared/newsroom/NewsroomPalette.ts` | Replaced by module-internal `CATEGORY_SWATCHES` + motion helpers co-located in `HbcNewsroomSurface/index.tsx` |
| `apps/hb-webparts/src/homepage/shared/newsroom/newsroom-surface.module.css` | Replaced by `packages/ui-kit/src/HbcNewsroomSurface/newsroom-surface.module.css` |
| `apps/hb-webparts/src/homepage/shared/newsroom/newsroom-surface.module.css.d.ts` | Replaced by the sibling `.d.ts` in the new shared surface folder |

The entire `apps/hb-webparts/src/homepage/shared/newsroom/` directory is removed. Isolation confirmed via `rg 'homepage/shared/newsroom'` post-delete — no remaining references in active source.

## 4. Named consumer impact

**`CompanyPulse` (named consumer):**
Status changes from `Local by design — specialized 3-layout-mode newsroom system with magazine-style featured story + headline rail; exceeds shared surface API` → **`Cleanly migrated to HbcNewsroomSurface`**. The webpart still owns its GUID `0b53f651-fd92-4f7f-a9da-f7797017f5eb`, its `mount.tsx` registration, its manifest, its normalization, and its authoring governance — but its visual grammar now lives entirely in the shared layer.

The "Local by design" characterization in the previous execution note was an understatement: the 3-layout-mode behavior, the featured-story grammar, the headline-rail grammar, and the tertiary quick-read zone are all durable shared-family presentation concerns that belonged in the kit all along. `HbcNewsroomSurface` makes that ownership explicit.

**Other named consumers:**
No other webparts were touched. The migration count moves from 5/9 (56%) cleanly migrated to **6/9 (67%)**. The "local by design" category drops from 1/9 to **0/9** — Company Pulse was the sole entry, and it no longer belongs there.

The remaining "should likely migrate" set continues to contain `{HbSignatureHero, ProjectPortfolioSpotlight}` per the execution-note text. (See "Remaining gaps" for a note about stale ProjectPortfolioSpotlight status in the execution note relative to live git state; that is pre-existing drift and out of scope for this migration.) `HbSignatureHero` remains the lowest-risk next migration target.

## 5. Verification performed

### Commands run

```bash
pnpm --filter @hbc/ui-kit check-types            # ✅ pass
pnpm --filter @hbc/ui-kit lint                   # 1 pre-existing error (HbcInput/__tests__/useVoiceDictation.test.ts — Function-as-type), unchanged from main; 0 new errors
pnpm --filter @hbc/ui-kit build                  # ✅ pass
pnpm --filter @hbc/ui-kit test                   # 3 pre-existing failed test files (HbcBanner, HbcKpiCard, HbcHeader), unchanged from main; the new HbcNewsroomSurface has no Vitest unit tests — only Storybook stories (matches sibling HbcPeopleCultureSurface / HbcProjectSpotlightSurface convention)
pnpm --filter @hbc/spfx-hb-webparts check-types  # ✅ pass
pnpm --filter @hbc/spfx-hb-webparts lint         # ✅ pass — homepage import-discipline rules satisfied (CompanyPulse imports only from @hbc/ui-kit/homepage)
pnpm --filter @hbc/spfx-hb-webparts build        # ✅ pass — bundle 564.47 KB JS / 200.89 KB gzip, 51.33 KB CSS / 9.33 KB gzip
pnpm --filter @hbc/spfx-hb-webparts exec vitest run \
    src/homepage/__tests__/communicationsWebparts.test.tsx \
    src/homepage/__tests__/communicationsConfig.test.ts \
    src/homepage/__tests__/authoringGovernance.test.ts      # ✅ 26/26 pass
pnpm --filter @hbc/spfx-hb-webparts test         # 7 pre-existing failed test files (bundleBudget, compositionPreview, discoveryWebpart, interactiveStates, motionAndAccessibility, operationalAwarenessWebparts, utilityWebparts) — same set as post-People-Culture baseline, unchanged from main; 115/128 tests pass
```

### Bundle delta

| Metric | Post People & Culture (pre-migration baseline) | After migration | Delta |
|---|---:|---:|---:|
| spfx-hb-webparts JS | 569.94 KB | 564.47 KB | **−5.47 KB** |
| spfx-hb-webparts JS (gzip) | 202.99 KB | 200.89 KB | **−2.10 KB** |
| spfx-hb-webparts CSS | ~45.53 KB | 51.33 KB | +5.80 KB |
| spfx-hb-webparts CSS (gzip) | ~8.63 KB | 9.33 KB | +0.70 KB |

The JS bundle **shrank** by 5.47 KB (2.10 KB gzip). The small CSS growth reflects the fact that the shared `HbcNewsroomSurface` CSS module now lives in `@hbc/spfx-hb-webparts` via the ui-kit import graph rather than in the hb-webparts app shell layer — net total (JS + CSS) is essentially flat with a slight JS reduction, consistent with eliminating the duplicated inline motion / tier-based class switching from the local consumer.

### Pre-existing failures explicitly separated from new failures

Pre-existing failures were confirmed against the post-People-Culture baseline recorded in `docs/architecture/reviews/people-culture-ui-kit-migration-completion.md`. All failures present after the migration are also present without the migration:

- `@hbc/ui-kit` lint: 1 pre-existing error in `src/HbcInput/hooks/__tests__/useVoiceDictation.test.ts:61:34` (`Function` type usage). Not introduced by this change.
- `@hbc/ui-kit` test: 3 pre-existing failed test files (`HbcBanner` — 12 failed tests, `HbcKpiCard` — 2, `HbcHeader` — 2) — none reference newsroom, Company Pulse, or any new component. Not introduced by this change.
- `@hbc/spfx-hb-webparts` test: 7 pre-existing failed test files (`bundleBudget.test.ts`, `compositionPreview.test.tsx`, `discoveryWebpart.test.tsx`, `interactiveStates.test.ts`, `motionAndAccessibility.test.ts`, `operationalAwarenessWebparts.test.tsx`, `utilityWebparts.test.tsx`). The bundle-budget tests continue to fail because the bundle is still over the 400 KB JS / 10 KB CSS hard budgets — confirmed pre-existing. None reference Company Pulse. Not introduced by this change.
- The Company Pulse-specific tests in `communicationsWebparts.test.tsx` (15 tests covering rich layout, sparse layout, headline-only fallbacks, bare metadata, non-CTA headline static rendering, invalid-state authoring messaging, tertiary-zone chip rendering, loading state) + `communicationsConfig.test.ts` (8 normalization tests) + `authoringGovernance.test.ts` (3 tests) — **26 tests total — all pass**.

### Visual proof

- `HbcNewsroomSurface.stories.tsx` — Default (rich layout: lead + 3 secondary headlines + 2 tertiary chips + archive), Sparse (lead-only with archive footer), HeadlineOnly (3 secondary headlines, no lead), Mobile (constrained 420px width)

Storybook stories cover the three layout modes intrinsic to the surface family plus a narrow-width proof to validate the responsive CSS media queries. This matches the sibling `HbcProjectSpotlightSurface.stories.tsx` proof convention.

## 6. Remaining gaps

| Gap | Notes |
|---|---|
| Per-component Vitest unit tests for `HbcNewsroomSurface` | Storybook stories cover visual proof; no Vitest unit tests were added. Sibling `HbcPeopleCultureSurface` and `HbcProjectSpotlightSurface` also ship without unit tests, so this matches existing convention. Optional follow-up. |
| Consumer-level visual proof (live SPFx workbench screenshots) | Storybook stories prove the surface family in isolation. Live SPFx workbench before/after screenshots remain a wave-wide gap (true for all previously migrated consumers) and require an SPFx runtime environment. |
| Bundle budget test still failing | The 400 KB hard budget was already exceeded before this migration. This migration *reduced* the JS bundle by 5.47 KB but did not bring it under budget. Bundle budget remediation is its own scoped task. |
| Pre-existing `useVoiceDictation.test.ts` Function-type lint error | Not in scope. |
| Pre-existing ui-kit test failures (`HbcBanner`, `HbcKpiCard`, `HbcHeader`) and spfx-hb-webparts test failures (7 files) | Not in scope. Confirmed unrelated to this migration via the baseline recorded in the People & Culture completion report. |
| Stale `ProjectPortfolioSpotlight` row in the Wave 01 Execution Note | The execution-note table at line 385 still lists `ProjectPortfolioSpotlight` as "Local — should likely migrate" even though the sibling `docs/architecture/reviews/project-spotlight-ui-kit-migration-completion.md` records its Wave 01 follow-on migration to `HbcProjectSpotlightSurface`. This is **pre-existing drift**, not caused by this migration, and intentionally not corrected here to keep the Company Pulse scope surgical. Recommended follow-up: reconcile the ProjectPortfolioSpotlight row + the 2/9 "should likely migrate" count in a separate small doc pass. |

There are no remaining structural gaps in the Company Pulse migration itself.

## 7. Final repo-truth posture for Company Pulse

**Cleanly migrated.**

The named consumer `CompanyPulse` now delegates 100% of its durable presentation grammar — section shell, featured story, headline rail, tertiary quick-read zone, sparse-state footer, and all three layout modes (rich / sparse / headline-only) — to `@hbc/ui-kit/homepage` shared layers (`HbcNewsroomSurface` + supporting re-exported primitives `HbcPremiumCta`, `motion`, Lucide icons, `usePrefersReducedMotion`). The webpart's responsibilities are now data normalization, audience filtering, authoring-governance fallback messaging, view-model adaptation, and SPFx integration — exactly the consumer-layer concerns that should remain local. Homepage import discipline is preserved; the webpart consumes only `@hbc/ui-kit/homepage`. Cross-package type-checks, build, and the full 26-test Company Pulse-related test suite all pass. The local `apps/hb-webparts/src/homepage/shared/newsroom/` directory has been removed in its entirety.
