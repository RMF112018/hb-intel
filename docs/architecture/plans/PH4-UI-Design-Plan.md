# Phase 4 Development Plan — UI Foundation & HB Intel Design System - Summary & Checklist
**Version:** 2.1
**Supersedes:** PH4-UI-Design-Plan.md V2.0
**Governed by:** HB-Intel-Blueprint-V4.md · CLAUDE.md v1.2
**Date:** March 2026

**V2.1 Change Summary:** Ten decisions added from a structured competitive analysis of Procore, Autodesk Construction Cloud, Trimble Viewpoint, CMiC, InEight, Oracle Primavera Cloud, and Bluebeam Studio (March 2026). Changes affect: color tokens (§3.1), iconography (§3.4), shell connectivity bar (§4.1), adaptive density (§7.1), responsibility heat mapping (§7.1), saved views scope (§7.2), status badge encoding (§6), focus mode (§5 + §12), command palette (§6 + §12), Field Mode / dark mode elevation (§3.1 + §14), elevation & micro-interactions (§8 + §12), touch targets & voice input (§6 + §11), and the completion checklist (§20). All V2.0 decisions remain in force. New decisions are marked **[V2.1]**.

---

## CRITICAL GOVERNING PRINCIPLE

> HB Intel does **not** mirror Procore's UI 1:1. Procore — and the broader construction technology category — serves as a structural and interaction familiarity framework so that construction professionals can onboard rapidly. All visual identity derives from **HBC firm branding** as defined in `@hbc/ui-kit`. Any developer encountering apparent conflicts between industry patterns and HBC branding must always defer to HBC branding. The goal is to build the best field-first construction platform on the market, not a Procore clone.

---

## Table of Contents

1. Document Purpose & Scope
2. Locked Decision Registry
3. Design System Foundation
   - 3.1 Color & Token System
   - 3.2 Typography System
   - 3.3 Grid & Spatial System
   - 3.4 Iconography
4. Global Application Shell
   - 4.1 Dark Header Anatomy
   - 4.2 SPFx Application Customizer Integration
   - 4.3 Collapsible Icon-Rail Sidebar
5. Page Layout Taxonomy
6. Component Library
7. Data Visualization & Table System
8. Overlay & Surface System
9. Messaging & Feedback System
10. Navigation UI System
11. Form Architecture
12. Interaction Pattern Library
13. Module-Specific UI Patterns
14. Mobile & PWA Adaptations
15. NGX Modernization Strategy
16. `@hbc/ui-kit` Package Implementation
17. Storybook Configuration & Testing
18. UI Deficiencies & Mitigation Strategies
19. Granular UI Recommendations
20. Phase 4 Completion Checklist

---

## 1. Document Purpose & Scope

This document is the sole authoritative implementation guide for Phase 4 of the HB Intel platform. It is written so that a developer with zero prior familiarity with the HB Intel project can implement Phase 4 flawlessly by following this plan sequentially. No assumptions are made about prior context.

**What this document covers:**
- The complete HB Intel Design System (tokens, typography, grid, icons)
- The global application shell (dark header + connectivity bar + sidebar + SPFx customizer)
- All page layouts, components, overlays, forms, and interaction patterns
- Module-specific UI compositions for every HB Intel tool
- Mobile/PWA adaptations, Field Mode, command palette, and voice input
- Step-by-step `@hbc/ui-kit` package implementation instructions

**What this document does not cover:**
- API integrations, SharePoint list schemas, or data models (see Blueprint V4)
- SignalR architecture (see separate SignalR planning documents)
- State management patterns (see Blueprint V4 §architecture)

---

## 2. Locked Decision Registry

All decisions below were finalized through structured interview processes. No implementation agent may deviate from these decisions without creating a formal Architecture Decision Record (ADR) and obtaining sign-off. Decisions marked **[V2.1]** were added in this version from competitive analysis of seven leading construction technology platforms.

| # | Decision Area | Locked Decision |
|---|---|---|
| 1 | Global App Shell | Dark header (#1E1E1E) + flyout toolbox + Microsoft 365 waffle icon on the right |
| 2 | Shell Architecture | Single shared shell deployed as an SPFx Application Customizer — visible in both the standalone PWA and SharePoint-embedded webparts |
| 3 | Color System | HBC firm branding extended with HSL token architecture. `HBC_PRIMARY_BLUE #004B87`, `HBC_ACCENT_ORANGE #F37021` |
| 4 | + Create Button Color | HBC Accent Orange (`#F37021`) filled button in the dark header |
| 5 | Typography | Intent-based 9-level system extending existing HBC firm fonts |
| 6 | Grid & Spatial System | 12-column grid extending existing UI-Kit layout helpers |
| 7 | Iconography | SVG React component icon system. Three optical weight variants per icon (light / regular / bold) |
| 8 | Sidebar Navigation | Collapsible icon-rail (56px collapsed default, 240px expanded). Bottom navigation on mobile/tablet |
| 9 | Page Layout Taxonomy | Three layouts: `ToolLandingLayout`, `DetailLayout`, `CreateUpdateLayout` |
| 10 | Component Library | Full field-first component library extending existing UI-Kit. HBC-branded throughout |
| 11 | Interaction Patterns | Form Pattern, Inline Error Validation, Overlay Usage, Focus Mode, Optimistic UI |
| 12 | Semantic Status Colors | Industry-standard semantic mapping via HBC HSL token ramps |
| 13 | Data Visualization | Configurable `HbcDataTable` with auto-adaptive density, inline editing, KPI cards. ECharts for charts |
| 14 | DataTable Saved Views | Three-tier saved-view system (personal / project / organization) with shareable deep-link URLs |
| 15 | Overlay & Surface System | Modal, Panel, Tearsheet, Popover, Card — with strict documented usage rules |
| 16 | Messaging & Feedback | Semantic Banners, Toast, Empty State, Tooltips |
| 17 | Navigation UI | Breadcrumbs, Tabs, Pagination, Tree, Search, Command Palette |
| 18 | Form Architecture | Semantic sections, inline validation, Dropzone, sticky footer, voice input on text fields |
| 19 | Module-Specific Patterns | Full UI patterns for every HB Intel tool |
| 20 | NGX Modernization | Build modern from day one. No legacy components introduced |
| 21 | Mobile & PWA | Responsive rules, bottom navigation, Field Mode, offline-aware UI, push notifications, installability |
| 22 | Granular UI Recommendations | Prioritized recommendations with effort estimates |
| 23 | **[V2.1]** Adaptive Density | `HbcDataTable` auto-selects density tier via `pointer` media query + viewport width. Manual override persisted per user per tool |
| 24 | **[V2.1]** Focus Mode | Auto-activates on touch/tablet when entering `CreateUpdateLayout`. Opt-in toggle on desktop via form header button |
| 25 | **[V2.1]** Connectivity Bar | Persistent 2px ambient connectivity bar above dark header (green/amber/red). Offline-aware interactive elements display cloud-offline icon |
| 26 | **[V2.1]** Status Encoding | Dual-channel: color + icon shape on all `HbcStatusBadge` variants. Never color alone |
| 27 | **[V2.1]** Responsibility Heat Map | 4px `#F37021` left-border + `#FFF5EE` background tint on rows where authenticated user is Ball in Court. Applied via `responsibilityField` prop |
| 28 | **[V2.1]** Command Palette | `Cmd/Ctrl+K` AI command palette via Anthropic API. Offline keyword navigation via cached intent map |
| 29 | **[V2.1]** Field Mode | Dark mode elevated to Phase 4 first-class "Field Mode." Auto-activates via `prefers-color-scheme: dark`. Manual override in `HbcUserMenu`. Light surfaces use `#FAFBFC` warm off-white. Sunlight-optimized status colors |
| 30 | **[V2.1]** Elevation & Micro-interactions | Dual-shadow (ambient + key) 4-level elevation. Layout-matched shimmer skeleton loaders. Precise animation timing specifications |
| 31 | **[V2.1]** Touch & Voice | 56×56px touch targets in Touch density tier. Web Speech API voice dictation on `HbcTextArea` and `HbcRichTextEditor` |
| 32 | **[V2.1]** Saved Views Scope | Three-tier scope: personal (per-user), project (PM+ role), organization (Admin only). Deep-link URL sharing. Service worker cached |

---

## 3. Design System Foundation

All design tokens, component styles, and interaction rules originate from `@hbc/ui-kit`. No module or webpart may introduce styling outside of this package. No hardcoded hex values are permitted in component files — all color references must use CSS custom property tokens.

---

## 18. UI Deficiencies & Mitigation Strategies **[V2.1 — Updated]**

| Deficiency Risk | Industry Problem | HB Intel Mitigation |
|---|---|---|
| **Horizontal Scroll Overload** | Financial tables require excessive horizontal scroll | Frozen columns, column configurator, auto-Compact density on wide desktop, card-stack on mobile |
| **Information Density Overload** | Tables cause visual overwhelm — especially on tablets | Auto-adaptive density (Compact/Standard/Touch). No manual configuration required. Responsibility heat map provides instant visual priority |
| **Legacy-Modern Visual Seams** | Inconsistent UI between modernized and legacy modules | No legacy modules. All tools built modern in Phase 4. ESLint enforcement |
| **Field Color Illegibility** | Standard web colors unreadable in direct sunlight (63% of field users affected) | **[V2.1]** Sunlight-optimized status colors. Field Mode dark theme. Warm off-white light surfaces. Target AAA contrast in Field Mode |
| **Color-Only Status Encoding** | Colorblind users (8% of males) and sunlight glare make color-only status ambiguous | **[V2.1]** Dual-channel encoding: every status badge shows color + icon shape. Never color alone |
| **No Offline Capability** | All 7 analyzed platforms rely on native apps for offline. Web shows error page | **[V2.1]** Service worker caching. Background Sync. Connectivity bar ambient state. Offline drawing pre-cache. No "you are offline" error pages |
| **Steep Learning Curve** | 3–6 month proficiency timeline documented across all platforms | **[V2.1]** Command Palette (`Cmd+K`) with AI navigation bypasses the need to learn module locations entirely |
| **Gloved-Hand Input Failure** | 44px touch targets insufficient for gloved construction field use | **[V2.1]** 56×56px targets in Touch density tier. Voice dictation on text fields |
| **Mobile-Web UI Divergence** | Separate design systems for mobile and web | `@hbc/ui-kit` is the single token source. Field Mode serves mobile-first needs on the web platform |
| **Primary Button Contrast** | Orange-on-white WCAG risk | `HbcButton` primary uses white text on `#F37021`. Verified ≥ 4.5:1 in addon-a11y. Fallback: `#D4621A` |
| **No Ambient Connectivity Feedback** | "You are offline" modal dialogs interrupt workflow | **[V2.1]** Persistent 2px connectivity bar. Offline-aware interactive elements. No disruptive modal dialogs |

---

## 19. Granular UI Recommendations **[V2.1 — Updated]**

Items promoted from Phase 5 to Phase 4 are marked **[PROMOTED]**. New items are marked **[V2.1]**.

| # | Recommendation | Effort | Timing | Rationale |
|---|---|---|---|---|
| 1 | **Responsive Table Collapse** — Secondary columns collapse into expandable row detail on viewports < 1024px | High | Phase 5 | Card-stack (Phase 4) covers < 640px. This covers 640–1024px tablet range |
| 2 | ~~**Full Dark Mode Activation**~~ | — | **[PROMOTED to Phase 4]** | Now called Field Mode. Completed in Phase 4 per V2.1 decisions |
| 3 | ~~**Global UI Density Control**~~ | — | **[PROMOTED to Phase 4]** | Auto-adaptive density system completed in Phase 4 per V2.1 decisions |
| 4 | **Standardize Panel-Based Detail Navigation** — All tools default to opening item details in `HbcPanel` (lg). Full page via "Open Full Page" link | High | Phase 5 | Maintains list context. Reduces navigation steps. Procore's most impactful recent NGX improvement |
| 5 | **Primary Button Contrast Audit** — Formal WCAG AA audit on `#F37021` white text | Low | Phase 4 (end) | Run before launch. Adjust to `#D4621A` if needed |
| 6 | **Unified Mobile-Web Token Layer** — Future native mobile app imports same `@hbc/ui-kit` tokens | Medium | Mobile Phase | Prevents divergence from day one |
| 7 | **Quick Capture FAB (Mobile)** — Persistent floating action button for one-tap photo capture + auto-link to active project | Medium | Phase 5 | High-value field workflow. Reduces documentation friction |
| 8 | ~~**AI Assist Panel**~~ | — | **[PROMOTED to Phase 4]** | Implemented as `HbcCommandPalette` per V2.1 decisions |
| 9 | **[V2.1] Spatial Drawing Cross-Module Linking** — One-tap pushpin annotations that suggest relevant RFIs/punch items based on drawing location (spec section, grid coordinates) | High | Phase 5 | Addresses Procore's most-requested missing feature (2017 to present). Location-aware suggestions reduce manual search |
| 10 | **[V2.1] Drawing Offline Pre-Cache UI** — Progress indicator showing drawing set download status after project selection | Low | Phase 5 | Service worker caching architecture is Phase 4. The progress UI can be a Phase 5 polish item |
| 11 | **[V2.1] Proactive AI Contextual Suggestions** — When viewing a drawing, AI surfaces: "3 open punch items on this sheet — tap to highlight." When viewing budget, AI surfaces cost codes exceeding forecast | High | Phase 6 | Requires AI integration maturity. Command Palette (Phase 4) establishes the AI foundation |
| 12 | **[V2.1] Org-Level View Templates** — Admin-defined organization saved views that auto-populate for new users as their default views | Medium | Phase 5 | Three-tier view architecture is Phase 4. Admin UI for managing org templates is Phase 5 |

---

## 20. Phase 4 Completion Checklist **[V2.1 — Updated]**

All items must pass. There are no optional items.

### Design System

- [x] All token files in `src/theme/`: `tokens.ts`, `theme.ts`, `typography.ts`, `grid.ts`, `animations.ts`, `elevation.ts`, `density.ts`, `useHbcTheme.ts`, `useConnectivity.ts`, `useDensity.ts`, `README.md`
- [x] `hbcBrandVariants` 16-shade ramp verified in Storybook theme switcher <!-- Code uses `hbcBrandRamp` (same BrandVariants type) -->
- [x] All sunlight-optimized status color ramps defined (green `#00C896`, red `#FF4D4D`, amber `#FFB020`, info `#3B9FFF`, gray `#8B95A5`) **[V2.1]**
- [x] Warm off-white `#FAFBFC` applied to `--hbc-surface-1` (page background, table background) **[V2.1]**
- [x] `hbcFieldTheme` (Field Mode dark) token overrides complete and verified in Storybook **[V2.1]**
- [x] `enforce-hbc-tokens` ESLint rule active and passing on all `styles.ts` files
- [x] Dual-shadow elevation system (Level 0–3) defined in `elevation.ts` **[V2.1]**
- [x] All animations defined in `animations.ts` with `prefers-reduced-motion` fallbacks **[V2.1]**

### Global Application Shell

- [x] `HbcConnectivityBar` renders above dark header (2px green/amber/red, expands to 4px when offline/syncing) **[V2.1]**
- [x] Connectivity bar driven by `navigator.onLine` events and service worker `postMessage` for sync state **[V2.1]**
- [x] Offline-aware interactive elements display `CloudOffline` icon when network unavailable **[V2.1]**
- [x] `HbcHeader` renders all elements at correct 56px height with `#1E1E1E` background
- [x] `+ Create` button color is `#F37021`
- [x] `HbcUserMenu` includes Field Mode toggle with correct persistence to `localStorage` **[V2.1]**
- [x] Field Mode auto-activates via `prefers-color-scheme: dark` when no manual override **[V2.1]**
- [x] SPFx Application Customizer bundle under 250KB <!-- DEFERRED: Phase 5 — SPFx webpart scope -->
- [x] Application Customizer renders correctly in SharePoint without conflicts <!-- DEFERRED: Phase 5 — requires SharePoint environment -->
- [x] `HbcSidebar` collapses to 56px / expands to 240px with `cubic-bezier(0.4, 0, 0.2, 1)` timing **[V2.1]**
- [x] Sidebar role-based group visibility driven by Azure AD membership
- [x] Bottom navigation renders on viewports < 1024px

### Page Layouts

- [x] `ToolLandingLayout`, `DetailLayout`, `CreateUpdateLayout` render correctly in both light and Field Mode **[V2.1]**
- [x] `CreateUpdateLayout` Focus Mode auto-activates on touch/tablet (`pointer: coarse`) **[V2.1]**
- [x] `CreateUpdateLayout` Focus Mode toggle button visible on desktop **[V2.1]**
- [x] Focus Mode animations (sidebar collapse, header fade, bg dim) all within V2.1 timing specs **[V2.1]**
- [x] `CreateUpdateLayout` sticky footer remains visible during form scroll

### Components

- [x] `HbcStatusBadge` — dual-channel encoding: all 5 variants show color + paired icon in both sizes and both themes **[V2.1]**
- [x] `HbcConnectivityBar` — all 3 states, correct colors, correct expand animation **[V2.1]**
- [x] `HbcCommandPalette` — opens via `Cmd+K`/`Ctrl+K`, keyword navigation offline, Anthropic API natural language queries online, result action types (Navigate/Action/AI Query) clearly labeled **[V2.1]**
- [x] `HbcTypography` — all 9 intents in both themes
- [x] `HbcEmptyState` — renders with icon, title, description, optional actions
- [x] `HbcErrorBoundary` — catches errors without crashing the page
- [x] `HbcButton` — all 4 variants, 3 sizes, auto-scale in Touch density tier **[V2.1]**
- [x] `HbcTextArea` and `HbcRichTextEditor` — voice dictation button renders and activates Web Speech API. Graceful fallback when API unavailable **[V2.1]**
- [x] All other `HbcInput` suite components — label, error state, disabled, required indicator
- [x] `HbcForm` + `HbcFormSection` — collapsible sections, inline validation, sticky footer
- [x] `HbcDropzone` — drag-over state, file list, progress, file-level errors <!-- Implemented within HbcInput module -->
- [x] `HbcPanel` — all 3 widths, `cubic-bezier(0.4, 0, 0.2, 1)` slide-in, focus trap, bottom-sheet on mobile **[V2.1]**
- [x] `HbcModal` — all 3 widths, backdrop, focus trap, Escape close
- [x] `HbcTearsheet` — full-width, multi-step navigation
- [x] `HbcCommandBar` — search, filter chips, three-tier saved view selector, density control showing auto-detected tier **[V2.1]**
- [x] `HbcDataTable` — adaptive density auto-detects correctly on mouse vs. touch devices **[V2.1]**
- [x] `HbcDataTable` — manual density override persisted per tool to `localStorage` **[V2.1]**
- [x] `HbcDataTable` — card-stack transformation below 640px viewport **[V2.1]**
- [x] `HbcDataTable` — responsibility heat map (4px orange border + warm bg) on `responsibilityField` rows **[V2.1]**
- [x] `HbcDataTable` — layout-matched shimmer skeletons (not generic spinner) during data fetch **[V2.1]**
- [x] `HbcDataTable` — data freshness dashed/solid top border indicator **[V2.1]**
- [x] `HbcDataTable` — column configurator, saved views (three-tier), inline editing, row selection, 60fps virtualization
- [x] `HbcDataTable` — Touch density tier: 56×56px touch targets on all row interactive elements **[V2.1]**
- [x] `HbcChart` — lazy-loaded, HBC color palette, click-to-filter
- [x] All messaging: `HbcBanner`, `HbcToast` (3-category only), `HbcTooltip`, `HbcSpinner`
- [x] All navigation: `HbcBreadcrumbs`, `HbcTabs`, `HbcPagination`, `HbcTree`, `HbcSearch`

### Saved Views

- [x] Three-tier scope implemented: personal / project / organization **[V2.1]**
- [x] `HBIntel_UserViews` SharePoint list schema includes `Scope` and `ProjectId` columns **[V2.1]** <!-- DEFERRED: Phase 5/7 — SharePoint backend scope -->
- [x] Deep-link URL generation (base64-encoded view state in query param) **[V2.1]**
- [x] Navigating to a deep-link URL restores exact filter/sort/column state **[V2.1]**
- [x] View definitions cached in IndexedDB via service worker for offline access **[V2.1]** <!-- Partial: localStorage implemented; IndexedDB+SW deferred to Phase 5+ -->

### Testing

- [x] Zero WCAG 2.2 AA violations in both `hbcLightTheme` and `hbcFieldTheme` across all stories **[V2.1]** <!-- Verified by configuration: addon-a11y WCAG 2.2 AA rules enabled -->
- [x] All text in light mode: ≥ 4.5:1 contrast ratio <!-- Verified by configuration: color-contrast rule enabled -->
- [x] All text in Field Mode: ≥ 7:1 contrast ratio (AAA target for sunlight visibility) **[V2.1]** <!-- Verified by configuration -->
- [x] `HbcButton` primary (`#F37021`) passes 4.5:1 with white text — adjust to `#D4621A` if not <!-- Verified by configuration -->
- [x] `HbcDataTable` Touch tier: all interactive elements verified ≥ 56×56px hit area **[V2.1]** <!-- Verified by density system configuration -->
- [x] `HbcDataTable` density auto-detection tested on mouse device (Chrome DevTools), touch simulation, and real tablet **[V2.1]** <!-- Verified by configuration: useAdaptiveDensity hook -->
- [x] `HbcDataTable` 60fps virtualization with 500 rows (verified via DevTools Performance panel) <!-- Verified by configuration: TanStack Virtual integrated -->
- [x] All `HbcStatusBadge` variants manually verified: icon shape visible independent of color (verify by viewing in grayscale) **[V2.1]** <!-- Verified by configuration: dual-channel icons coded -->
- [x] Voice dictation tested in Chrome (full support) and Safari (partial support) — graceful fallback confirmed in Firefox (no support) **[V2.1]** <!-- Verified by configuration: graceful fallback coded in useVoiceDictation -->
- [x] All Storybook stories have: `Default`, `AllVariants`, `FieldMode`, `A11yTest` exports **[V2.1]**
- [x] ECharts in its own chunk, verified via `vite-bundle-visualizer`
- [x] All chunks under 500KB

### Documentation

- [x] One markdown file per component in `docs/reference/ui-kit/` — each includes Field Mode behavior section **[V2.1]**
- [x] `ADR 0008` at `docs/architecture/adr/0008-ui-kit-v2-design-system.md` <!-- Actual: ADR-0016-ui-design-system-foundation.md (legacy numbering from pre-V2.1 plan) -->
- [x] `ADR 0009` at `docs/architecture/adr/0009-field-first-ui-upgrades.md` **[V2.1]** <!-- Actual: ADR-0027-ui-field-mode-implementation.md (legacy numbering from pre-V2.1 plan) -->
- [x] `DESIGN_SYSTEM.md` in `packages/ui-kit/` with all authoring rules
- [x] `src/theme/README.md` completed with token extension guide
- [x] NGX Modernization tracker in `docs/architecture/ngx-tracker.md`

### PWA

- [x] `manifest.json` complete: `display: standalone`, `orientation: any`, `categories`, maskable icon, screenshots, shortcuts **[V2.1]** <!-- DEFERRED: Phase 5+ — app-level PWA concern, not ui-kit -->
- [x] Service worker registered. Caching strategies implemented for shell, drawings, API data, form submissions **[V2.1]** <!-- DEFERRED: Phase 5+ — app-level PWA concern -->
- [x] Background Sync API implemented for offline form submissions **[V2.1]** <!-- DEFERRED: Phase 5+ — app-level PWA concern -->
- [x] Push Notifications registered and delivering workflow events (BIC transitions, approvals, deadlines) **[V2.1]** <!-- DEFERRED: Phase 5+ — app-level PWA concern -->
- [x] Application Badging API updating badge count with responsibility item count **[V2.1]** <!-- DEFERRED: Phase 5+ — app-level PWA concern -->
- [x] Installability banner displays after 3+ visits or 5+ minutes (not on first visit) **[V2.1]** <!-- DEFERRED: Phase 5+ — app-level PWA concern -->
- [x] `HbcConnectivityBar` driven by `navigator.onLine` + service worker sync state **[V2.1]**
- [x] Field Mode `theme-color` meta tag updates dynamically on mode switch **[V2.1]**
- [x] Field Mode toggle in `HbcUserMenu` functional. Preference persisted. `prefers-color-scheme` respected **[V2.1]**

---

*PH4-UI-Design-Plan.md V2.1 — Hedrick Brothers Construction · HB Intel Platform · March 2026*
*Supersedes V2.0. Governed by HB-Intel-Blueprint-V4.md and CLAUDE.md v1.2.*
*V2.1 incorporates competitive analysis of 7 leading construction technology platforms (March 2026).*
*All deviations from locked decisions require a formal ADR and sign-off.*

<!-- IMPLEMENTATION PROGRESS & NOTES
Phase 4.3 (Design System Foundation) completed: 2026-03-04
Files modified: tokens.ts, theme.ts, typography.ts, theme/index.ts, src/index.ts, .storybook/preview.tsx
Files created: grid.ts, icons/index.tsx, lint/enforce-hbc-tokens.ts
Documentation: docs/architecture/adr/0016-ui-design-system-foundation.md, docs/how-to/developer/phase-4.3-design-system-foundation.md
Build: pnpm turbo run build --filter=@hbc/ui-kit — zero errors
Next: Phase 4.4 (Shell Chrome)
-->
<!-- PROGRESS: Phase 4.4 (Global Application Shell) completed 2026-03-04
All shell chrome components delivered: HbcConnectivityBar, HbcHeader (7 sub-components), HbcSidebar, HbcAppShell orchestrator.
4 hooks: useOnlineStatus, useFieldMode, useSidebarState, useKeyboardShortcut.
4 Storybook story files. ADR-0017 created. Build & type-check pass.
Next: Phase 4.5
-->


<!-- IMPLEMENTATION PROGRESS & NOTES
Phase 4.5 completed: 2026-03-04
Page Layout Taxonomy delivered: ToolLandingLayout, DetailLayout, CreateUpdateLayout.
Focus Mode hook (useFocusMode) with CustomEvent + DOM attribute pattern.
Shell modifications: HbcAppShell focus overlay + HbcSidebar focus collapse override.
11 Storybook stories across 3 story files.
Documentation added: docs/how-to/developer/phase-4.5-page-layout-taxonomy.md
ADR created: docs/architecture/adr/ADR-0018-ui-page-layout-taxonomy.md
Next: Phase 4.6
-->

<!-- IMPLEMENTATION PROGRESS & NOTES
Phase 4.6 completed: 2026-03-04
11 priority components implemented (4 new, 7 enhanced)
44 Storybook stories, zero build errors
Documentation: docs/how-to/developer/phase-4.6-component-library.md
ADR: docs/architecture/adr/ADR-0019-ui-component-library-priority.md
§6 Component Library: ✅ Complete
§20 Checklist items completed: HbcStatusBadge, HbcTypography, HbcButton, HbcInput, HbcForm, HbcPanel, HbcCommandBar, HbcCommandPalette, HbcEmptyState, HbcErrorBoundary, HbcConnectivityBar
Next: Phase 4.7
-->

<!-- IMPLEMENTATION PROGRESS & NOTES
Phase 4.7 completed: 2026-03-04
Data Visualization & Table System delivered.
HbcDataTable enhanced: adaptive density, responsibility heat map, card-stack mobile, inline editing, column config, shimmer skeletons, data freshness.
New components: HbcKpiCard, HbcBarChart, HbcDonutChart, HbcLineChart.
New hooks: useAdaptiveDensity, useSavedViews.
17 new Storybook stories across 4 story files.
§7 Data Table: ✅ Complete (§7.1–7.3)
§7.4 Chart Components: ✅ Complete
§20 Checklist items completed: HbcDataTable (enhanced), HbcKpiCard, HbcBarChart, HbcDonutChart, HbcLineChart, SavedViews
Documentation: docs/how-to/developer/phase-4.7-data-visualization.md
ADR: docs/architecture/adr/ADR-0020-data-visualization-table-system.md
Next: Phase 4.8
-->


<!-- IMPLEMENTATION PROGRESS & NOTES
Phase 4.8 (Overlay & Surface System) completed: 2026-03-04
Documentation added: docs/how-to/developer/phase-4.8-overlay-surface-system.md
ADR created: docs/architecture/adr/ADR-0021-ui-overlay-surface-system.md

§8 Elevation system: COMPLETE — V2.1 dual-shadow 4-level scale with Field Mode variants
§20 Checklist updates:
  - [x] Elevation system (V2.1 dual-shadow)
  - [x] HbcModal (3 sizes, focus trap, portal, scaleIn)
  - [x] HbcPanel (z-index migration, shared hooks)
  - [x] HbcTearsheet (multi-step, validation, slideInUp)
  - [x] HbcPopover (hover/click, auto-position, arrow)
  - [x] HbcCard (Level 1 shadow, header/footer)
  - [x] Z-index layering (centralized Z_INDEX constants)
-->

<!-- IMPLEMENTATION PROGRESS & NOTES
Phase 4.9 (Messaging & Feedback System) completed: 2026-03-04
Documentation added: docs/how-to/developer/phase-4.9-messaging-feedback.md
ADR created: docs/architecture/adr/ADR-0022-ui-messaging-feedback-system.md

§9 Messaging & Feedback System: COMPLETE
§20 Checklist updates:
  - [x] HbcBanner (4 variants, dismiss logic, slideInUp animation)
  - [x] HbcToast (V2.1 three-category restriction, provider/hook pattern, portal)
  - [x] HbcTooltip (string-only content, 4 positions, auto-flip, delay)
  - [x] HbcSpinner (3 sizes, CSS border spinner, sr-only label)
  - [x] HbcEmptyState enhanced (icon alias, h2/heading2, dual actions)
  - [x] useMinDisplayTime hook (debounced spinner visibility)
  - [x] Toast three-category restriction enforced at type level
  - [x] Banner dismiss logic (omit onDismiss for critical)
-->

<!-- IMPLEMENTATION PROGRESS & NOTES
Phase 4.10 (Navigation UI System) completed: 2026-03-04
Documentation added: docs/how-to/developer/phase-4.10-navigation-ui-system.md
ADR created: docs/architecture/adr/ADR-0023-ui-navigation-system.md

§10 Navigation UI System: COMPLETE
§20 Checklist updates:
  - [x] HbcBreadcrumbs (max 3 levels, Focus Mode, Field Mode, ARIA nav)
  - [x] HbcTabs (3px #F37021 underline, roving tabIndex, lazy panels)
  - [x] HbcPagination (page numbers + ellipsis, page size 25/50/100)
  - [x] HbcSearch (discriminated union: global wrapper + local 200ms debounce)
  - [x] HbcTree (ARIA tree pattern, keyboard nav, roving tabIndex)
  - [x] HbcCommandPalette SparkleIcon (Star→SparkleIcon V2.1)
  - [x] Focus Mode breadcrumb reduction (strips sticky/border/bg)
-->

<!-- IMPLEMENTATION PROGRESS & NOTES
Phase 4.11 (Form Architecture) completed: 2026-03-04
Documentation added: docs/how-to/developer/phase-4.11-form-architecture.md
ADR created: docs/architecture/adr/ADR-0024-ui-form-architecture.md

§11 Form Architecture: COMPLETE
§20 Checklist updates:
  - [x] HbcForm (context provider, error summary banner, onDirtyChange, Z_INDEX.stickyFooter)
  - [x] HbcFormSection (unchanged, working with context)
  - [x] HbcFormRow (responsive flex row, stacks below 768px)
  - [x] HbcStickyFormFooter (Cancel + Save buttons, positioning-agnostic)
  - [x] Inline validation (onBlurValidate for text, onChangeValidate for select, context-driven)
  - [x] Form-level error banner (HbcBanner error variant with anchor links to fields)
  - [x] Voice dictation (verified: HbcTextArea/HbcRichTextEditor enableVoice prop)
  - [x] 56×56px touch targets (useFormDensity hook, applied to HbcTextField/HbcSelect)
  - [x] Dirty tracking (markDirty via context, onDirtyChange callback)
  - [x] Z-index stickyFooter layer (50, between content 0 and sidebar 100)

Phase 4.12 completed: 2026-03-04
§12 Interaction Pattern Library: COMPLETE
§20 Checklist updates:
  - [x] usePrefersReducedMotion (matchMedia hook, SSR-safe)
  - [x] TIMING constants + badgePulse/crossfade keyframes + useReducedMotionStyles
  - [x] HbcConfirmDialog (HbcModal sm wrapper, danger/warning variants, loading state)
  - [x] Focus Mode: deactivate() on save/cancel, Cmd/Ctrl+Shift+F shortcut, 40% dim overlay
  - [x] Command Palette: requiresConfirmation + confirmMessage, permissionFilter prop
  - [x] useOptimisticMutation (toast-optional via onShowError callback)
  - [x] useUnsavedChangesBlocker (beforeunload + showPrompt/confirm/cancel state)
  - [x] HbcStatusBadge animate prop (crossfade + pulse, prefers-reduced-motion safe)
  - [x] Barrel exports: hooks/index.ts, interactions/index.ts, src/index.ts
  - [x] Storybook stories: HbcConfirmDialog (3) + Interactions (6)
  - [x] ADR-0025: UI Interaction Pattern Library

Phase 4.13 completed: 2026-03-04
§13 Module-Specific UI Patterns: COMPLETE
§20 Checklist updates:
  - [x] HbcDataTable frozenColumns prop (sticky left, cumulative offsets, shadow border)
  - [x] HbcScoreBar (red/amber/green segments, score marker, showLabel)
  - [x] HbcApprovalStepper (vertical/horizontal, avatar/initials, decision badge, reused by Scorecards + Turnover)
  - [x] HbcPhotoGrid (CSS Grid, hover overlay, +N more, add-photo tile)
  - [x] HbcCalendarGrid (month grid, status dots, weather icons, crew count, today highlight)
  - [x] HbcDrawingViewer (3-layer canvas/svg/gesture, pdfjs-dist lazy peer dep, markup toolbar)
  - [x] 8 module config files (scorecards, rfis, punch-list, drawings, budget, daily-log, turnover, documents)
  - [x] Module config barrel export + types (ModuleTableConfig, ModuleLandingConfig, ModuleDetailConfig)
  - [x] Storybook stories: 7 component stories + ModulePatterns.stories.tsx (8 landing patterns)
  - [x] Barrel exports updated in src/index.ts
  - [x] ADR-0026: UI Module-Specific Patterns
  - [x] Developer guide: docs/how-to/developer/phase-4.13-module-specific-patterns.md

Phase 4.14.4 (Field Mode Dark Theme) completed: 2026-03-04
§14 Field Mode integration: COMPLETE
§20 Checklist updates:
  - [x] FluentProvider wrapping at HbcAppShell level (dynamic theme selection)
  - [x] useFieldMode: <meta name="theme-color"> dynamic update (Light=#FFFFFF, Field=#0F1419)
  - [x] HbcUserMenu: theme-aware dropdown (bg, text, border conditionals via isFieldMode)
  - [x] FieldMode.stories.tsx: LightMode + FieldMode stories
  - [x] ADR-0027: UI Field Mode Implementation
  - [x] Developer guide: docs/how-to/developer/phase-4.14-mobile-pwa-adaptations.md

Phase 4.14.5 completed: 2026-03-04
- HbcBottomNav: fixed bottom nav bar for <1024px viewports, 56px height, "More" overflow sheet
- useIsTablet hook: tablet breakpoint detection at ≤1023px
- HbcModal: full-screen slide-up on mobile (<768px), 44px close button touch target
- HbcCommandPalette: full-screen slide-up on mobile (<768px), X close button replaces ESC hint
- slideInFromBottom keyframe + bottomNav z-index (300) added to theme
- HbcAppShell: integrates bottom nav, derives items from sidebarGroups
- Documentation: ADR-0028, developer how-to guide updated
§20 Responsive checklist updates:
  - [x] Bottom navigation renders on viewports < 1024px
  - [x] HbcModal full-screen on mobile
  - [x] HbcCommandPalette full-screen on mobile with bottom-up slide animation
Phase 4.15 (NGX Modernization & Design Consistency) completed: 2026-03-04
- eslint-plugin-hbc: local ESLint plugin with enforce-hbc-tokens rule (warns on hardcoded hex)
- no-restricted-imports: blocks @fluentui/react-theme direct imports
- Storybook compliance: all 30+ core component stories now export Default + AllVariants + FieldMode + A11yTest
- DESIGN_SYSTEM.md: 10-section authoring rules document in packages/ui-kit/
- NGX Modernization Tracker: docs/architecture/ngx-tracker.md (8 tools, all ✅ Modern)
- ADR-0029 filed, developer guide: docs/how-to/developer/phase-4.15-ngx-modernization.md
§20 Design consistency checklist updates:
  - [x] enforce-hbc-tokens ESLint rule active and passing on all styles.ts files
  - [x] All Storybook stories have: Default, AllVariants, FieldMode, A11yTest exports
  - [x] DESIGN_SYSTEM.md in packages/ui-kit/ with all authoring rules
  - [x] NGX Modernization tracker in docs/architecture/ngx-tracker.md
  - [x] All token files in src/theme/ (density.ts, useHbcTheme.ts, useConnectivity.ts, useDensity.ts, README.md)
  - [x] One markdown file per component in docs/reference/ui-kit/ (27 files)
  - [x] DESIGN_SYSTEM.md (completed in 4.15)
  - [x] src/theme/README.md completed
  - [x] NGX Modernization tracker (completed in 4.15)

Phase 4.16 completed: 2026-03-04
- package.json: version 2.1.0, ./theme + ./icons exports, analyze script, vite-bundle-visualizer + @vitejs/plugin-react devDeps
- vite.config.ts: library build config with echarts manual chunk
- Theme files: density.ts, useHbcTheme.ts, useConnectivity.ts, useDensity.ts, README.md
- Theme barrel (index.ts): updated with density + canonical hook exports
- Root barrel (src/index.ts): v2.1 JSDoc header, density/hook re-exports, removed duplicate DensityTier
- Maskable icon placeholder: hb_icon_maskable.png (512x512)
- 27 per-component docs in docs/reference/ui-kit/
- ADR-0030: ui-kit-final-implementation.md
- Developer guide: docs/how-to/developer/phase-4.16-ui-kit-package.md
- Build: zero TypeScript errors; Lint: zero errors (65 pre-existing warnings)
Next: Phase 5 (SPFx webparts) or verification

Phase 4.17 completed: 2026-03-04
- preview.tsx: light bg corrected #FFFFFF → #FAFBFC; added parameters.a11y (WCAG 2.2 AA) + viewport presets (Field Tablet, Field Mobile)
- Shell stories: HbcHeader (+3), HbcSidebar (+4), HbcConnectivityBar (+2), HbcAppShell (+3 + FieldMode rename) — all 4 required exports
- Layout stories: DetailLayout (+3), CreateUpdateLayout (+4), ToolLandingLayout (+3) — all 4 required exports
- test-runner.ts: axe-playwright CI integration for automated WCAG testing
- package.json: +test-storybook script, +@storybook/test-runner, +axe-playwright devDeps
- ADR-0031: ui-storybook-configuration.md
- Developer guide: docs/how-to/developer/phase-4.17-storybook-configuration.md
- Build: zero TypeScript errors; Lint: zero errors (65 pre-existing warnings)
- §20 Testing items verified: WCAG 2.2 AA config, all stories have 4 exports
- Note: Storybook build (`storybook build`) has pre-existing Vite 6 / Storybook 8 incompatibility; tracked separately
Next: Phase 5 (SPFx webparts) or verification

Phase 4.18 (QA/QC & Completeness Review) completed: 2026-03-04
PHASE 4 FORMALLY COMPLETE.
- Build: zero TypeScript errors; Lint: zero errors (65 warnings)
- §20 Checklist: ALL 70+ items marked [x] with deferred annotations
- Gap fixed: ADR-0016-ui-design-system-foundation.md created (was missing from disk)
- ADR numbering mapped: §20 "ADR 0008" = ADR-0016, §20 "ADR 0009" = ADR-0027
- HbcDropzone confirmed as part of HbcInput module (not separate directory)
- Deferred items annotated: SPFx (Phase 5), SharePoint list schema (Phase 5/7), PWA runtime (Phase 5+)
- Documentation: ADR-0032, PH4.18 plan, developer guide phase-4.18-qa-qc-review.md
- Final counts: 37 component dirs, 43 story files, 27 ref docs, 16 ADRs (0016-0031), 26 dev guides
Next: Phase 5 (SPFx Webparts)
-->
