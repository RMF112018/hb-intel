# UI System Reconciliation and Execution Note

> Prompt-00 deliverable -- repo-truth reconciliation of `@hbc/ui-kit` v2.2.19 against the two-lane UI system direction.
>
> **Status:** Accepted with corrective addendum applied (see `Prompt-00-Acceptance-and-Corrective-Addendum.md`).

## Governing references

- `docs/reference/ui-kit/UI-System-Layer-Model.md` -- canonical 4-layer architecture
- `docs/reference/ui-kit/Presentation-Lane-Standard.md` -- presentation lane visual standards
- `docs/reference/ui-kit/Productive-Lane-Standard.md` -- productive lane visual standards
- `docs/architecture/blueprint/ui-system-target-architecture.md` -- target architecture
- `docs/explanation/ui-system/Why-Two-Lanes.md` -- rationale

## Current state summary

`@hbc/ui-kit` v2.5.5 exports 160+ public symbols from a layered entry point system (W01-P06):

| Entry point | Layer | Purpose | Status |
|---|---|---|---|
| `@hbc/ui-kit` | All | Main barrel -- full library | Stable (transitional exports deprecated) |
| `@hbc/ui-kit/theme` | 1 | Foundation tokens, hooks, density | Stable |
| `@hbc/ui-kit/icons` | 1 | SVG icon factory | Stable |
| `@hbc/ui-kit/branding` | 1 | Brand asset registry | Stable |
| `@hbc/ui-kit/primitives` | 2 | 30 Layer-2 building blocks (W01-P02) | Stable |
| `@hbc/ui-kit/homepage` | 3 | Presentation-lane surface families + tokens (W01-P03) | Stable |
| `@hbc/ui-kit/app-shell` | Cross | Lean shell for SPFx customizer | Stable |
| `@hbc/ui-kit/fluent` | Adapter | Fluent UI passthroughs for R3 compliance (W01-P06) | New -- consumers should migrate from main barrel |

**Deprecated main-barrel exports (W01-P06):**
- Fluent UI passthroughs (`FluentProvider`, `Text`, `Badge`, `Switch`, `Spinner`, `TabList`, `Tab`, `Card`, `CardHeader`, `Button`, `tokens`) -- use `@hbc/ui-kit/fluent` or prefer HBC equivalents from `@hbc/ui-kit/primitives`
- Module config re-exports (`scorecardsLanding`, `rfisLanding`, etc.) -- use `@hbc/shell` directly

250+ consumer files import from `@hbc/ui-kit` across 14 PWA apps, homepage webparts, and ~10 feature packages.

**Named consumers using deprecated Fluent passthroughs (should migrate to `@hbc/ui-kit/fluent`):**
- `apps/pwa` (Text, Spinner, Button, Card, CardHeader, tokens)
- `apps/dev-harness` (Button, Switch, TabList, Tab, tokens)
- `apps/hb-site-control` (Text, Card, CardHeader, Button, tokens)
- `apps/accounting` (Text, Card, CardHeader via pwa shared pages)

---

## 1. Layer-and-lane mismatch register

### Layer 1 -- Foundations: mostly healthy

The foundation layer (`src/theme/`) is well-structured with dedicated files for tokens, radii, themes, animations, typography, elevation, hierarchy, z-index, spacing, breakpoints, and density.

**Mismatches:**

| Issue | Location | Severity |
|---|---|---|
| Shell-layout constants in token file | `HBC_HEADER_HEIGHT`, `HBC_CONNECTIVITY_HEIGHT_ONLINE/OFFLINE`, `HBC_SIDEBAR_WIDTH_COLLAPSED/EXPANDED`, `HBC_BOTTOM_NAV_HEIGHT` in `src/theme/tokens.ts` (lines 18-27 of barrel) | Low -- app-shell composition values, not design tokens |
| Deprecated typography aliases still exported | `displayHero`, `displayLarge`, `displayMedium`, `titleLarge`, `titleMedium`, `bodyLarge`, `bodyMedium`, `caption`, `monospace` (lines 72-80) | Low -- tagged deprecated but inflate public surface |
| Deprecated elevation aliases still exported | `elevationRest`, `elevationHover`, `elevationRaised`, `elevationOverlay`, `elevationDialog` (lines 100-104) | Low -- same pattern |

### Layer 2 -- Primitives: structurally present, boundary is implicit

24 clean primitives exist but share a flat barrel with surfaces, module-specific UI, and adapters. No `@hbc/ui-kit/primitives` entry point exists.

**Healthy primitives (keep as-is):**

| Primitive | Lines in barrel |
|---|---|
| `HbcButton` | 311-312 |
| `HbcTypography` | 314-315 |
| `HbcStatusBadge` | 170-171 |
| `HbcSpinner` | 412-413 |
| `HbcBreadcrumbs` | 416-417 |
| `HbcTabs` | 419-420 |
| `HbcPagination` | 422-423 |
| `HbcSearch` | 425-431 |
| `HbcSegmentedControl` | 185-186 |
| `HbcDescriptionList` | 188-189 |
| `HbcTooltip` | 409-410 |
| `HbcCard` | 227-228 |
| `HbcModal` | 230-231 |
| `HbcPanel` | 223-224 |
| `HbcTearsheet` | 233-234 |
| `HbcPopover` | 236-237 |
| `HbcConfirmDialog` | 344-345 |
| `HbcBanner` | 396-397 |
| `HbcToast*` (Provider, useToast, Container) | 399-407 |
| `HbcEmptyState` | 182-183 |
| `HbcErrorBoundary` | 191-192 |
| `HbcTree` | 433-434 |
| `HbcBottomNav` | 356-357 |
| Form system (TextField, Select, Checkbox, Form, FormLayout, FormSection, FormRow, StickyFormFooter, FormGuard) | 194-221 |
| `HbcTextArea`, `HbcRichTextEditor` | 317-323 |

**Primitive mismatches (resolved W01-P02):**

| Issue | Resolution |
|---|---|
| `HbcPeoplePicker` bundles `useGraphPeopleSearch` -- data-fetching hook in a primitive (line 172) | Classified as **surface**, excluded from `@hbc/ui-kit/primitives`. Available only through main barrel. |
| No explicit primitive-layer entry point | **Resolved**: `@hbc/ui-kit/primitives` entry point created (W01-P02) with 30 primitive components. |

**Promoted to primitive (W01-P02):** `HbcRiskBadge`, `HbcScoreBar`, `HbcStatusTimeline`, `HbcCoachingCallout`, `HbcFormField`, `HbcApprovalStepper` -- all generic, no data-fetching, reused across domains.

**Excluded from primitives (remain in main barrel as surfaces):** `HbcPeoplePicker` (Graph data-fetching), `HbcAuditTrailPanel` (domain-specific stub), `HbcPermissionMatrix` (domain-specific composition).

### Layer 3 -- Surface families: major mismatch zone

This layer has the highest violation density. Three distinct problems:

#### 3a. Presentation surfaces: formalized as first-class surface family system (W01-P03)

The `homepage.ts` entry point is well-governed with import discipline enforced by tests. Eight production-grade presentation surface families are correctly scoped to `@hbc/ui-kit/homepage`:

| Surface family | Component | Zone | Status |
|---|---|---|---|
| Signature Hero | `HbcSignatureHeroSurface` | Identity band | Production — quality floor |
| Editorial | `HbcEditorialSurface` | Communications | Production |
| Operational | `HbcOperationalSurface` | Operational intelligence | Production |
| Command | `HbcCommandSurface` | Utility / priority actions | Production |
| Launcher | `HbcLauncherSurface` | Tool access / wayfinding | Production |
| Discovery | `HbcDiscoverySurface` | Onboarding / search | Production |
| Section Shell | `HbcHomepageSectionShell` | Section container | Production |
| Surface Card | `HbcHomepageSurfaceCard` | Zone-aware card | Production |

**W01-P03 token adoption:**
- `HbcHomepageSurfaceCard`: wired `elevationHero` (hero surface) and `elevationEditorial` (editorial surface) for presentation-grade depth
- `HbcHomepageSectionShell`: wired `HBC_SPACE_2XL` (64px) for editorial vertical rhythm
- `homepage.ts` entry: exports W01-P01 foundation tokens (`displayXl`, `displayLg`, `HBC_SPACE_2XL`, `HBC_SPACE_3XL`, `elevationHero`, `elevationEditorial`, `TRANSITION_DRAMATIC`, `HBC_SURFACE_PRESENTATION`, `hbcPresentationCSSVars`)
- `HBC_HOMEPAGE_TYPOGRAPHY`: added `heroHeadline` (displayXl, 48px) and `heroTitle` (displayLg, 40px)
- `HBC_HOMEPAGE_SPACING`: added `heroGap` (80px) and `sectionBreak` (64px)
- `hbcPresentationCSSVars()`: CSS custom property bridge for CSS-module surfaces

**Remaining CSS-module surfaces** (SignatureHero, Editorial, Operational, Command, Launcher, Discovery) use design-driven hardcoded values in CSS modules. The `hbcPresentationCSSVars()` bridge is available but not yet adopted by these surfaces — intentionally deferred to avoid visual regression against the quality floor.

#### 3b. Productive surfaces: audited and hardened (W01-P04)

All productive-lane surfaces and representative consumers audited for presentation-lane contamination. **No contamination found.** The productive lane maintains clear separation with proper density discipline, restrained motion (TRANSITION_FAST/TRANSITION_NORMAL only), standard elevation (elevationRest, elevationRaised, elevationLevel1-2), and zero presentation-lane imports.

**Productive-lane surface family (confirmed clean):**

| Surface | Key pattern | Status |
|---|---|---|
| `WorkspacePageShell` | Standard elevation, density tokens, shimmer loading | Clean |
| `HbcDataTable` | TRANSITION_FAST, elevationRest, useAdaptiveDensity, virtualization | Clean |
| `HbcCommandBar` | No animation, elevationRaised, auto-density, semantic urgency tokens | Clean |
| `HbcKpiCard` | clamp() responsive, standard hover elevation, minimal gradient wash (8% opacity) | Clean |
| `HbcChart` / `HbcBarChart` / `HbcDonutChart` / `HbcLineChart` | Echarts wrapper, no presentation tokens | Clean |
| 6 page layouts | Pure productive composition patterns | Clean |
| Multi-column primitives (`NavRail`, `ContextRail`, `ActivityStrip`, `QuickActionBar`, `SyncStatusBar`) | Productive composition utilities | Clean |

**Consumer apps audited (all clean — zero `@hbc/ui-kit/homepage` imports across 11 productive apps):**

| Consumer | Pattern |
|---|---|
| `apps/accounting` (ProjectReviewQueuePage) | WorkspacePageShell + DataTable + Tabs |
| `apps/estimating` (ProjectSetupPage) | WorkspacePageShell + forms + DataTable, excellent token usage |
| `apps/admin` (App) | Minimal providers only |
| `apps/project-hub` (DashboardPage) | WorkspacePageShell + delegated canvas |
| `apps/hb-site-control` (HomePage) | WorkspacePageShell + cards (minor: Fluent palette tokens should migrate to HBC tokens) |

**No productive-lane code changes required** — surfaces are architecturally sound, density-disciplined, and free of presentation-lane drama.

#### 3c. Module-specific UI in ui-kit: layer violation

36 module-specific component exports live in `@hbc/ui-kit` but represent domain-specific compositions that belong in their existing feature packages:

| Component group | Exports | Barrel lines | Existing feature package |
|---|---|---|---|
| **Activity Timeline** | `ActivityEventIcon`, `ActivityEventRow`, `HbcActivityTimeline`, `ActivityFilterBar`, `ActivityDiffPopover`, `ActivityEmptyState` | 566-579 | `packages/activity-timeline` |
| **Export System** | `ExportActionMenu`, `ExportFormatPicker`, `ExportProgressToast`, `ExportReceiptCard` | 582-591 | `packages/export-runtime` |
| **Record Form** | `HbcRecordForm`, `HbcRecordSubmitBar`, `HbcRecordReviewPanel`, `HbcRecordRecoveryBanner` | 594-603 | `packages/record-form` |
| **Saved Views** | `SavedViewPicker`, `SavedViewChip`, `SaveViewDialog`, `SavedViewScopeBadge`, `DefaultViewToggle`, `ViewCompatibilityBanner` | 606-619 | `packages/saved-views` |
| **Publish System** | `HbcPublishPanel`, `PublishTargetSelector`, `PublishApprovalChecklist`, `PublishReceiptCard` | 622-631 | `packages/publish-workflow` |
| **Bulk Actions** | `BulkSelectionBar`, `BulkActionMenu`, `BulkActionConfirmDialog`, `BulkActionInputDialog`, `BulkActionResultsPanel`, `SelectAllFilteredBanner` | 634-645 | `packages/bulk-actions` |
| **Safety/Risk** | `HbcRiskBadge`, `HbcSafetyBanner`, `HbcImpactSummaryList`, `HbcScopeSummaryCard`, `HbcRecoveryGuidancePanel`, `HbcEvidenceSummaryBar` | 648-659 | Consumer-local (safety app) or `packages/health-indicator` |

Each destination feature package already exists. The current pattern has those packages importing their own domain UI from ui-kit, creating an inverted dependency.

#### 3d. Module config re-exports: deprecated shims

14 module configuration objects (lines 521-542) are re-exported from `@hbc/shell` for backward compatibility:

```
scorecardsLanding, scorecardsDetail, rfisLanding, rfisDetail,
punchListLanding, punchListDetail, drawingsLanding, disciplineFilters,
budgetLanding, dailyLogSections, dailyLogVoiceFields,
turnoverLanding, turnoverDetail, turnoverTearsheetSteps, documentsLanding
```

These are already marked "moved to @hbc/shell" and should be removed after a deprecation period.

### Adapters: Fluent UI passthroughs with naming collisions

11 Fluent UI symbols re-exported at lines 550-563 (`FluentProvider`, `Text`, `Badge`, `Switch`, `Spinner`, `TabList`, `Tab`, `Card`, `CardHeader`, `Button`, `tokens`). These enforce the no-direct-Fluent-import rule but create naming collisions with HB Intel primitives (`Button` vs `HbcButton`, `Spinner` vs `HbcSpinner`, `Card` vs `HbcCard`).

### App Shell: cross-lane concern, sparse sub-entry

The `app-shell.ts` entry point exports only `HbcConnectivityBar`, `HbcAppShell`, and `Popover` (16 lines). All 13 shell sub-components (`HbcHeader`, `HbcSidebar`, `HbcProjectSelector`, etc.) are only available through the main barrel (lines 360-393). Shell-layout constants live in the foundation barrel instead of the shell.

### Homepage entry point: third-party re-exports

`homepage.ts` (lines 75-107) re-exports external library symbols to avoid SPFx webparts needing direct `package.json` dependencies:

- `motion`, `AnimatePresence` from `motion/react`
- `clsx` from `clsx`
- `cva`, `VariantProps` from `class-variance-authority`
- `Separator` from `@radix-ui/react-separator`
- 23 named Lucide icon exports

These are intentional and documented but leak implementation details. Classified as transitional.

---

## 2. Export health classification

### Healthy (~75 exports)

Correctly layered, well-owned, no action needed:

- **All foundation tokens** (~42): colors, radii, themes, spacing, breakpoints, animations, typography scale (canonical names), elevation (canonical names), hierarchy, z-index, density tokens, canonical hooks (`useHbcTheme`, `useConnectivity`, `useDensity`)
- **Core primitives** (~24): Button, Typography, StatusBadge, Spinner, Breadcrumbs, Tabs, Pagination, Search, SegmentedControl, DescriptionList, Tooltip, Card, Modal, Panel, Tearsheet, Popover, ConfirmDialog, Banner, Toast, EmptyState, ErrorBoundary, Tree, BottomNav, Form system
- **Icons** (~60): SVG icon factory with size/weight presets
- **Branding** (5): logo assets and brand registry
- **Utility hooks** (7): `useFocusTrap`, `useIsMobile`, `useIsTablet`, `useMinDisplayTime`, `usePrefersReducedMotion`, `useOptimisticMutation`, `useUnsavedChangesBlocker`

### Transitional (~45 exports)

Correctly placed but needs refinement, lane classification, or entry-point consolidation:

- **Productive surface families** (~20): DataTable, Charts, KpiCard, CommandBar, WorkspacePageShell, 6 page layouts, multi-column composition primitives (NavRail, ContextRail, ActivityStrip, QuickActionBar, SyncStatusBar)
- **Presentation surface families** (~20): Homepage*, Premium*, SignatureHeroSurface, CommandSurface, LauncherSurface, DiscoverySurface, EditorialSurface, OperationalSurface -- correctly segregated in `homepage.ts` with no main-barrel leakage; transitional because visual quality obligations and proof requirements are not yet formally integrated into the development workflow
- **App Shell** (~13): all shell sub-components -- need consolidation into `app-shell` entry point
- **Borderline module primitives** (~5): `HbcScoreBar`, `HbcApprovalStepper`, `HbcPhotoGrid`, `HbcCalendarGrid`, `HbcDrawingViewer` -- labeled PH4.13 module-specific but some have cross-module reuse potential; need case-by-case review
- **Complexity-aware components** (~5): `HbcAuditTrailPanel`, `HbcFormField`, `HbcStatusTimeline`, `HbcPermissionMatrix`, `HbcCoachingCallout` -- most generic enough to be primitives; AuditTrailPanel and PermissionMatrix are borderline

### Legacy (~50 exports)

Misplaced, should migrate or be deprecated:

- **Module-specific UI** (36): Activity Timeline (6), Export System (4), Saved Views (6), Bulk Actions (6), Publish System (4), Record Form (4), Safety/Risk (6)
- **Module config re-exports** (14): all `@hbc/shell` backward-compatibility shims
- **Fluent passthroughs** (11): `FluentProvider`, `Text`, `Badge`, `Switch`, `Spinner`, `TabList`, `Tab`, `Card`, `CardHeader`, `Button`, `tokens`
- **Deprecated foundation aliases** (~15): typography aliases (`displayHero`, `displayLarge`, etc.) and elevation aliases (`elevationRest`, `elevationHover`, etc.)

---

## 3. Recommended first migration wave

**Saved Views** and **Bulk Actions** are the best first migration targets:

| Criterion | Saved Views | Bulk Actions |
|---|---|---|
| Existing feature package | `packages/saved-views` | `packages/bulk-actions` |
| Export count | 6 components | 6 components |
| Consumer file count | ~4 | ~6 |
| Shell wrapper pattern | Yes -- destination package already has shell wrappers | Yes |
| Cross-domain coupling | Low -- types shared with DataTable's `useSavedViews` hook | None |
| Risk | Low-medium (DataTable type coupling) | Low |

**Migration pattern for both:**

1. Move source files from `packages/ui-kit/src/<Component>/` to the feature package
2. Add deprecated re-export shim in `packages/ui-kit/src/index.ts` pointing to new location
3. Update the feature package's `package.json` dependencies
4. Update consumer imports in affected files
5. Run targeted verification (typecheck + lint for ui-kit and affected consumers)

**Note on Saved Views / DataTable coupling:** The `useSavedViews` hook and `SavedViewConfig`/`SavedViewEntry`/`SavedViewsPersistenceAdapter` types are currently exported from `HbcDataTable/hooks/` and `HbcDataTable/saved-views-types.ts`. When saved-views UI moves to its own package, these shared types should move with it, and DataTable should import them from the saved-views package. This inverts the current dependency direction correctly.

---

## 4. Rebuild vs. adapt

| Component group | Decision | Rationale |
|---|---|---|
| **Foundations** | Keep as-is | Clean, well-structured. Minor cleanup: move shell constants, deprecate aliases. |
| **Icons** | Keep as-is | Factory pattern is clean. No layer violation. |
| **Branding** | Keep as-is | Small, stable, correctly isolated. |
| **Core primitives** | Keep as-is | Healthy, well-typed, well-tested. |
| **Overlay primitives** | Keep as-is | Correctly layered. |
| **Form system** | Keep as-is | Good react-hook-form + zod integration. |
| **Toast / Banner** | Keep as-is | Correct primitive layer. |
| **Charts** | Keep as-is | Correctly a productive surface family. |
| **App Shell** | **Adapt** | Consolidate entry point. Move shell constants from tokens. Use compatibility shims. No structural rebuild. |
| **Layouts** | **Adapt** | Add explicit productive-lane classification. No structural rebuild. |
| **DataTable** | **Adapt** | Extract `useSavedViews` types to saved-views package. Table itself stays as productive surface primitive. |
| **Homepage surfaces** | Keep in ui-kit, governed by `homepage.ts` | Entry-point governance is already correct. Focus shifts to visual quality obligations. |
| **Premium surfaces** | Keep as-is | Part of presentation lane, correctly governed. |
| **Activity Timeline** | **Move** to `packages/activity-timeline` | Domain-specific UI with no cross-domain reuse. Source should relocate entirely. |
| **Export System** | **Move** to `packages/export-runtime` | Domain-specific UI. Source should relocate. |
| **Record Form** | **Move** to `packages/record-form` | Domain-specific compositions. Source should relocate. |
| **Saved Views** | **Move** to `packages/saved-views` | Domain-specific UI. Source should relocate. First migration wave. |
| **Publish System** | **Move** to `packages/publish-workflow` | Domain-specific UI. Source should relocate. |
| **Bulk Actions** | **Move** to `packages/bulk-actions` | Domain-specific UI. Source should relocate. First migration wave. |
| **Safety/Risk** | **Move** to consumer | Domain-specific. Move to safety app or `packages/health-indicator`. |
| **Fluent adapters** | **Adapt** | Move to `@hbc/ui-kit/fluent` entry point. Long-term, shape into HB Intel wrappers or retire as HbcPrimitives cover the same needs. |
| **Module configs** | **Remove** | Already live in `@hbc/shell`. Remove shim after deprecation period. |
| **HbcScoreBar, HbcApprovalStepper** | **Review** | Cross-module reuse potential. Defer to Wave 3 review. |
| **HbcPhotoGrid, HbcCalendarGrid, HbcDrawingViewer** | **Move** to consumer | Module-specific without clear reuse outside their domain. |
| **HbcAuditTrailPanel, HbcPermissionMatrix** | **Review** | Cross-domain reuse potential (audit trails and permissions appear in multiple modules). Defer to Wave 3. |
| **HbcStatusTimeline, HbcCoachingCallout** | Keep as-is | Generic enough to be primitives. |

---

## 5. Execution plan

### Wave 0 -- Foundation cleanup

- Move shell-layout constants from `theme/tokens.ts` to `HbcAppShell/constants.ts`; re-export from theme with `@deprecated` JSDoc
- Add `@deprecated` JSDoc to all legacy typography and elevation aliases if not already present
- No breaking changes; all moves use re-export shims

### Wave 1 -- Entry point restructuring

- Create `@hbc/ui-kit/primitives` entry point exporting only Layer 2 components
- Consolidate all app-shell exports into `@hbc/ui-kit/app-shell`; add deprecation markers on main-barrel shell exports
- Create `@hbc/ui-kit/fluent` entry point for Fluent passthrough adapters; deprecate their main-barrel export
- Verify presentation surface families remain unexposed through the main barrel (currently correct; add regression guard if not already covered by `importDiscipline.test.ts`)
- Remove module config re-exports from ui-kit with deprecation notice (they already live in `@hbc/shell`)
- Update `package.json` exports map

### Wave 2 -- Module-specific UI migration

Priority order based on existing feature-package readiness and consumer count:

1. **Saved Views** (6 exports) -- move to `packages/saved-views`
2. **Bulk Actions** (6 exports) -- move to `packages/bulk-actions`
3. **Export System** (4 exports) -- move to `packages/export-runtime`
4. **Publish System** (4 exports) -- move to `packages/publish-workflow`
5. **Record Form** (4 exports) -- move to `packages/record-form`
6. **Activity Timeline** (6 exports) -- move to `packages/activity-timeline`
7. **Safety/Risk** (6 exports) -- move to consumer-local or `packages/health-indicator`

Each migration: move source, add deprecated re-export shim, update feature package dependencies, update consumer imports, verify.

### Wave 3 -- Primitive layer review

- Review `HbcPeoplePicker` -- extract `useGraphPeopleSearch` to data-access layer or keep injection-based
- Classify borderline module primitives (`HbcScoreBar`, `HbcApprovalStepper`, `HbcPhotoGrid`, `HbcCalendarGrid`, `HbcDrawingViewer`) as primitive (keep) or feature-local (move)
- Review complexity-aware components (`HbcAuditTrailPanel`, `HbcPermissionMatrix`) for primitive fitness

### Wave 4 -- Documentation reconciliation

- Update `docs/reference/ui-kit/` to reflect new entry-point structure
- Retire any doctrine that conflicts with the 4-layer model
- Update conformance reviewer agent config if entry-point guidance changed

---

## Risk register

| Risk | Impact | Mitigation |
|---|---|---|
| Saved Views types coupled to DataTable hooks | Medium -- moving types requires DataTable to depend on saved-views package | Define shared interface types in saved-views package; DataTable imports from there |
| Feature package shell wrappers become redundant | Low -- the shell wrapper pattern collapses cleanly when source moves | Shell wrappers become the actual components; remove the indirection layer |
| Homepage import discipline regression | Medium -- `importDiscipline.test.ts` enforces `@hbc/ui-kit/homepage` as sole entry | Maintain the existing test guard; ensure future barrel changes do not accidentally re-export presentation surfaces through the main entry point |
| Third-party re-exports in homepage entry | Medium -- removing `motion`, `clsx`, `cva`, `lucide-react` later is breaking | Evaluate moving to peer dependencies of homepage consumers in Wave 4 |
| Fluent naming collisions during transition | Low -- both `Button` and `HbcButton` exported | Moving Fluent re-exports to `@hbc/ui-kit/fluent` resolves collisions cleanly |

---

## 6. Homepage migration wave 1 status (W01-P05)

### Migration target audit

All 9 homepage webpart modules audited against the shared presentation surface family system.

| Module | Surface family | Status | Justification |
|---|---|---|---|
| **HbHeroBanner** | `HbcSignatureHeroSurface` | Migrated | Full-width editorial hero with brand lockup |
| **LeadershipMessage** | `HbcEditorialSurface` | Migrated | Featured leader + secondary items editorial |
| **PeopleCulture** | `HbcEditorialSurface` | Migrated | Person recognition with event-type badges |
| **PriorityActionsRail** | `HbcCommandSurface` | Migrated | Urgency-grouped action items |
| **SafetyFieldExcellence** | `HbcOperationalSurface` | Migrated | Severity-aware operational signals |
| **SmartSearchWayfinding** | `HbcDiscoverySurface` | Migrated | Search + quick paths + categories |
| **CompanyPulse** | Local (newsroom CSS modules) | Keep local | Specialized 3-layout-mode newsroom system (Rich/Sparse/Headline-only) with magazine-style featured story + headline rail; exceeds shared surface API |
| **PeopleCultureMerged** | Local (inline CSS) | Keep local | Three-band merged composition (Band A announcements + Kudos composer + Band B celebrations) with integrated approval workflow; no single shared surface can accommodate |
| **ProjectPortfolioSpotlight** | Local (inline CSS) | Keep local | Image-led editorial with responsive 3-tier layout, team strips, avatar stacks, bottom-sheet mobile fallback; far exceeds `HbcEditorialSurface` API surface |

### Migration summary

- **6/9 modules (67%)** fully migrated to shared presentation surface families
- **3/9 modules (33%)** remain local — all three are genuinely specialized compositions that exceed shared surface family APIs, not weak local-card treatments
- All 3 local modules compose shared primitives (`HbcPremiumCta`, `HbcPremiumBadge`, `HbcHomepageEyebrow`, `HbcHomepageMetadataRow`) from `@hbc/ui-kit/homepage`
- Zero modules are "weak local-card compositions" — the original concern that prompted this migration wave is resolved

### Shared wrapper components (keep local, correctly delegating)

| Component | Pattern |
|---|---|
| `HomepageCuratedContentCluster` | Wrapper using `HbcHomepageSectionShell` + `HbcHomepageSurfaceCard` |
| `HomepageOperationalAwarenessCluster` | Wrapper using `HbcHomepageSectionShell` + `HbcHomepageSurfaceCard` |
| `HomepageEditorialCard` | Thin wrapper over `HbcCard` |
| `HomepageSpotlightCard` | Thin wrapper over `HbcCard` + `HbcStatusBadge` |
| `NewsroomFeaturedStory` | Specialized image-led editorial, justified local |

### No code changes required

The migration wave 1 is complete. No additional module migrations are warranted — the remaining local compositions are architecturally justified and already compose shared presentation-lane primitives.

---

## 7. Presentation-lane quality obligations

> Applied per Prompt-00 Acceptance and Corrective Addendum.

### Structural correctness is necessary but not sufficient

Layer cleanup, package placement, barrel cleanup, and migration mechanics are required but do not define success for presentation-lane work. This refactor exists because current homepage and presentation surfaces are too close to functional internal application UI and do not consistently achieve premium, attention-grabbing, authored web-content quality. Structural work that does not advance visual quality is incomplete.

### Visual obligations for presentation-lane work

All presentation-lane prompts and implementation waves must preserve and strengthen:

- Large-scale composition
- Strong visual hierarchy
- Editorial rhythm
- Premium image treatment
- Stronger focal points
- Premium motion and reveal choreography where appropriate
- Clearly differentiated homepage/editorial surfaces that do not collapse back into productive-card UI

Presentation-lane work must not be solved with disguised productive-lane surfaces.

### Visual proof requirements

For presentation-lane work, verification must include visual proof, not just code-level validation. At a minimum, require as applicable:

- Before/after screenshots
- Storybook stories or equivalent isolated examples for new or rebuilt surface families
- Side-by-side comparison against the pre-refactor state
- Explicit statement of how the outcome improved the presentation lane rather than merely preserving functionality

Do not mark presentation-lane work complete based solely on lint, typecheck, tests, or packaging success.

### Signature hero quality floor

The existing `HbcSignatureHeroSurface` is the current presentation-lane quality floor, not merely one example among many. Subsequent presentation-lane work must avoid regressing toward generic card UI and must meet or exceed:

- Compositional intent
- Branded presence
- Layered background/readability treatment
- Asymmetry and focal control
- Premium homepage suitability

### Reporting structure for later prompts

When reporting completion for Prompt-01 and later, explicitly distinguish:

- **Structural / architectural progress** -- layer placement, export hygiene, entry-point governance
- **Visual / presentation-quality progress** -- how the result advances the homepage/web-content lane beyond generic internal-app feel
- **Verification performed** -- code-level and visual proof
- **Remaining risks or regressions** -- structural and visual
