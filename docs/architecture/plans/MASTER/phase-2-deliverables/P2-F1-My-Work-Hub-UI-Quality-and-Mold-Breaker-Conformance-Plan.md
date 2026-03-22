# P2-F1: My Work Hub UI Quality and Mold-Breaker Conformance Plan

| Field | Value |
|---|---|
| **Doc ID** | P2-F1 |
| **Phase** | Phase 2 |
| **Workstream** | F — UI Quality, Design System Conformance, and Mold-Breaker Readiness |
| **Document Type** | Specification |
| **Owner** | Experience / Shell + `@hbc/ui-kit` |
| **Update Authority** | Experience lead; changes require review by Architecture |
| **Status** | **Active — All UIFs Re-opened after Audit 2** |
| **Last Reviewed Against Repo Truth** | 2026-03-21 — Audit 2 (post-wave-5 follow-up) found page unacceptable for production. Previous "Complete" claims on all 12 original UIFs are invalidated. Full re-implementation required. |
| **References — Plan** | [Phase 2 Plan §8, §10, §14](../03_Phase-2_Personal-Work-Hub-and-PWA-Shell-Plan.md); [P2-A1](P2-A1-Personal-Work-Hub-Operating-Model-Register.md); [P2-B0](P2-B0-Lane-Ownership-and-Coexistence-Rules.md); [P2-B3](P2-B3-Freshness-Refresh-and-Staleness-Trust-Policy.md); [P2-D2](P2-D2-Adaptive-Layout-and-Zone-Governance-Spec.md); [P2-D3](P2-D3-Analytics-Card-Governance-Matrix.md); [P2-E3](P2-E3-First-Release-Success-Scorecard-and-Validation-Plan.md); [Audit Report](P2-F1-My-Work-Hub-UI-Audit-Report.md) |
| **References — UI-Kit Design Authority** | [Visual Language Guide](../../../reference/ui-kit/UI-Kit-Visual-Language-Guide.md); [Mold-Breaker Principles](../../../reference/ui-kit/UI-Kit-Mold-Breaker-Principles.md); [Field-Readability Standards](../../../reference/ui-kit/UI-Kit-Field-Readability-Standards.md); [Visual Hierarchy and Depth Standards](../../../reference/ui-kit/UI-Kit-Visual-Hierarchy-and-Depth-Standards.md); [Adaptive Data Surface Patterns](../../../reference/ui-kit/UI-Kit-Adaptive-Data-Surface-Patterns.md); [Wave 1 Page Patterns](../../../reference/ui-kit/UI-Kit-Wave1-Page-Patterns.md); [Accessibility Findings](../../../reference/ui-kit/UI-Kit-Accessibility-Findings.md); [Usage and Composition Guide](../../../reference/ui-kit/UI-Kit-Usage-and-Composition-Guide.md) |

---

## Revision Note — 2026-03-21

A follow-up audit conducted after Phase 2 Waves 1–5 found the My Work Hub page **unacceptable for production** and **not improved** from the initial inspection. The previous plan declared all 12 UIFs complete. That claim is invalidated.

Two root causes are identified:

1. **Implementation was insufficient on all groups.** The Audit 2 inspection found native browser button styling still present on lane headers, browser-default blue still on title links, light body background still visible, Insights still buried below fold, module slugs still exposed as raw strings, and dev overlays still present.

2. **`MyWorkPage.tsx` does not use `@hbc/project-canvas`.** The secondary zone (analytics/KPI cards) and tertiary zone (quick access, recent context) are implemented as raw custom components with manual Griffel grid. These zones are exactly what `@hbc/project-canvas`'s tile registry, role-defaults, governance model, and data-source badge system were built to support. The primary zone (`HubPrimaryZone`) correctly excludes project-canvas; its documentation already states the feed must not be wrapped in `HbcProjectCanvas`. The secondary and tertiary zones have no such constraint.

This plan supersedes all prior implementation status for P2-F1 UIFs. It adds six net-new findings (UIF-013 through UIF-018) from Audit 2, and adds a new foundational implementation group (G0) for project-canvas integration.

---

## Policy Statement

The My Work Hub (`/my-work`) page has sufficient structural intent to become a mold-breaker construction-technology daily-driver surface. The current execution makes it below competitive. This plan defines the required corrections across six implementation groups: project-canvas integration, design system foundation, work item feed completeness, interaction quality, structural improvements, and build hygiene. All 18 UIFs from the consolidated audit report must be resolved before the page is eligible for production release or mold-breaker re-assessment.

---

## Policy Scope

### This plan governs

- `@hbc/project-canvas` integration into the secondary and tertiary zones of `MyWorkPage.tsx`
- Design token and theming corrections for visual coherence on the My Work Personal tab
- Work item feed: lane headers, item rows, collapse state, row metadata density, and layout completeness
- Two-column persistent layout (work feed + right panel) replacing the current single-column stack
- KPI card unification, interactivity, semantic color palette, and typographic hierarchy
- Filter toolbar, command bar consolidation, and active-state affordances
- Touch target accessibility conformance for field use
- SPFx and responsive layout support
- Context-sensitive CTA labels, sidebar navigation, project color coding, and focus ring visibility
- Build hygiene: dev-tool gating, environment guards

### This plan does NOT govern

- Work item ranking or lane assignment logic — see [P2-A2](P2-A2-Ranking-Lane-and-Time-Horizon-Policy.md)
- Analytics card data sourcing or role eligibility — see [P2-D3](P2-D3-Analytics-Card-Governance-Matrix.md)
- Adaptive layout zone governance policy — see [P2-D2](P2-D2-Adaptive-Layout-and-Zone-Governance-Spec.md)
- Freshness, sync, or staleness policy — see [P2-B3](P2-B3-Freshness-Refresh-and-Staleness-Trust-Policy.md)
- Personalization or saved-view rules — see [P2-D5](P2-D5-Personalization-Policy-and-Saved-View-Rules.md)

---

## Definitions

| Term | Meaning |
|---|---|
| **UIF** | UI finding — a numbered defect or enhancement from the consolidated My Work Hub audit report |
| **Mold-breaker** | HB Intel's target quality bar: a surface decisively superior in construction-workflow utility compared to category incumbents |
| **Design token** | A named `HBC_*` constant from `@hbc/ui-kit/theme` (e.g. `HBC_RADIUS_MD`, `HBC_ACCENT_ORANGE`) or a CSS custom property from the Fluent UI / `data-hbc-ui` system. Hardcoded hex, rgb, or pixel values in component CSS are prohibited per MB-08. |
| **Touch target** | Minimum interactive area per density tier: `HBC_DENSITY_TOKENS[tier].touchTargetMin` — 44px in touch (field), 36px in comfortable (tablet), 24px in compact (desktop). Governed by `UI-Kit-Field-Readability-Standards.md`. |
| **Lane header** | The collapsible group header button labeling a work item lane (e.g., "waiting-blocked", "do-now", "watch") |
| **Semantic color** | A status color from `UI-Kit-Visual-Language-Guide.md` color system, assigned to a specific meaning. Must not be shared across incompatible meanings. |
| **Primary zone** | The work item feed (`HubPrimaryZone`) — protected; must not be governed by project-canvas |
| **Secondary zone** | Analytics and KPI cards (`HubSecondaryZone`) — must be refactored to use `HbcProjectCanvas` tile layout |
| **Tertiary zone** | Quick access and recent context (`HubTertiaryZone`) — must be refactored to use `HbcProjectCanvas` tile layout |

---

## UI-Kit Design Authority

Every design decision in this plan is governed by one or more of the following documents. Implementors must read the governing document before making the corresponding implementation decision. A design choice not traceable to a governing source requires Experience lead approval and a plan amendment.

| Governing Document | What It Governs in This Plan |
|---|---|
| [Visual Language Guide](../../../reference/ui-kit/UI-Kit-Visual-Language-Guide.md) | All `HBC_*` token values: color palette, shape/radius scale, typography scale (`hbcTypeScale`), spacing scale, motion/transition timing, elevation shadows, z-index layers, surface role tokens. Hardcoded values that appear in this plan are illustrative only — the token name is authoritative. |
| [Mold-Breaker Principles](../../../reference/ui-kit/UI-Kit-Mold-Breaker-Principles.md) | MB-01 through MB-08 govern all acceptance criteria in this plan. Each UIF maps to one or more principles. |
| [Field-Readability Standards](../../../reference/ui-kit/UI-Kit-Field-Readability-Standards.md) | All touch target sizes (`HBC_DENSITY_TOKENS`), row height minimums, body/label text minimums, contrast ratio requirements, and density mode application via `useDensity()`. |
| [Visual Hierarchy and Depth Standards](../../../reference/ui-kit/UI-Kit-Visual-Hierarchy-and-Depth-Standards.md) | Elevation levels (`elevationLevel0–4`), content levels (`HBC_CONTENT_LEVELS`), zone distinctions (`HBC_ZONE_DISTINCTIONS`), card weight classes (`HBC_CARD_WEIGHTS`), and the Three-Second Read Standard. |
| [Adaptive Data Surface Patterns](../../../reference/ui-kit/UI-Kit-Adaptive-Data-Surface-Patterns.md) | Data surface type selection. Personal Work Hub tasks → Card/list view (explicitly assigned). KPI cards → Summary strip with `DashboardLayout` + `HbcKpiCard`. Command bar and filter system → `HbcCommandBar`. |
| [Wave 1 Page Patterns](../../../reference/ui-kit/UI-Kit-Wave1-Page-Patterns.md) | Approved composition patterns. My Work Hub → Card/list view using `WorkspacePageShell` + `ListLayout`. KPI strip → `DashboardLayout`. Side panel → `HbcPanel` (elevation Level 3). Every page requires `WorkspacePageShell`. |
| [Accessibility Findings](../../../reference/ui-kit/UI-Kit-Accessibility-Findings.md) | ARIA requirements, focus ring patterns, reduced-motion compliance. Known gap: focus ring styling verified on `HbcButton` but not validated across all interactive components — UIF-017 closes this gap. |
| [Usage and Composition Guide](../../../reference/ui-kit/UI-Kit-Usage-and-Composition-Guide.md) | Component import rules (Fluent UI through `@hbc/ui-kit` only, never direct from `@fluentui/react-components`), token import patterns, card weight class usage, `useDensity()` usage, and common composition mistakes to avoid. |

### Mold-Breaker Principle Mapping

| UIF(s) | Governing Principle(s) |
|---|---|
| UIF-001, 003, 004, 007, 011 | MB-02 (Stronger Hierarchy), MB-08 (No Version-Boundary Seams) |
| UIF-002, 012, 015 | MB-03 (Less Shell Fatigue), MB-04 (Less Horizontal Scrolling) |
| UIF-005, 006, 016 | MB-02 (Stronger Hierarchy), MB-05 (More Adaptive Density) |
| UIF-008, 014 | MB-01 (Lower Cognitive Load), MB-02 (Stronger Hierarchy) |
| UIF-009, 017, 018 | MB-07 (Field-Usable Contrast & Touch) |
| UIF-010 | MB-08 (No Version-Boundary Seams) |
| UIF-013 | MB-03 (Less Shell Fatigue), MB-01 (Lower Cognitive Load) |
| G0 (project-canvas) | MB-01 (Lower Cognitive Load), MB-05 (More Adaptive Density) |

---

## 1. Implementation Groups

All 18 UIFs and the project-canvas integration are organized into six implementation groups. G0 (project-canvas integration) is a prerequisite for the secondary/tertiary zone work in G2 and G3. G1 and G4 changes are independent. G5 changes are independent except UIF-015 (responsive layout) which depends on G2's two-column layout stabilizing first.

| Group | UIFs / Items | Severity | Description |
|---|---|---|---|
| **G0 — @hbc/project-canvas Integration** | Canvas dependency, tile registration, zone refactor | Architectural | Integrate project-canvas into secondary and tertiary zones; add PWA dependency |
| **G1 — Design System Foundation** | UIF-001, UIF-003, UIF-004, UIF-007, UIF-011 | Critical / High | Theme unification, token application, typography scale, semantic color palette |
| **G2 — Work Item Feed + Layout** | UIF-002, UIF-005, UIF-006, UIF-012 | Critical / High | Two-column layout, collapse state, row metadata density, command bar consolidation |
| **G3 — Interaction Quality** | UIF-008, UIF-009, UIF-013, UIF-014 | High | KPI interactivity, touch targets, sidebar nav, context-sensitive CTAs |
| **G4 — Build Hygiene** | UIF-010 | High | Dev-tool visibility gating |
| **G5 — Audit 2 Structural + Accessibility** | UIF-015, UIF-016, UIF-017, UIF-018 | Medium | SPFx/responsive layout, project color coding, focus rings, accessibility conformance |

**Dependency order:** G0 and G4 are independent and may be delivered in any order relative to G1. G1 must be stable before G2. G2 must be stable before G3. G5 depends on G2's layout work but is otherwise independent.

---

## 2. G0 — @hbc/project-canvas Integration

### 2.1 Background and Mandate

`@hbc/project-canvas` is the platform's tile-registry-backed, role-aware, configurable canvas system. It provides `HbcProjectCanvas` (render), `HbcCanvasEditor` (edit mode), `HbcTileCatalog` (discovery), and hooks including `useProjectCanvas`, `useRoleDefaultCanvas`, `useCanvasConfig`, and `useCanvasRecommendations`. It is currently consumed by `@hbc/features-business-development` and `@hbc/features-project-hub`, but not by `apps/pwa` directly, and not at all within `@hbc/my-work`.

`MyWorkPage.tsx` composes its secondary and tertiary zones using raw custom components (`HubSecondaryZone`, `HubTertiaryZone`) with manual Griffel grid. This is a structural omission. The analytics/KPI card tiles (secondary zone) and quick-access/recent-context tiles (tertiary zone) are canonical examples of the role-governed, configurable tiles that project-canvas was built to host.

**Design Authority:** MB-01 (role-based project canvas, progressive disclosure), MB-05 (adaptive density via tile complexity tiers) — `UI-Kit-Mold-Breaker-Principles.md`. The primary zone (`HubPrimaryZone`) is explicitly excluded from project-canvas governance — the work item feed handles its own state, empty states, and lane logic independently. This exclusion is correct and must be preserved.

### 2.2 Required Changes

#### 2.2.1 Dependency

Add `@hbc/project-canvas` to `apps/pwa/package.json` workspace dependencies. Verify the package is sufficiently mature for production use before adding.

#### 2.2.2 Secondary Zone — Analytics Tiles

Refactor `HubSecondaryZone` to render analytics/KPI tiles via `HbcProjectCanvas`. Per `UI-Kit-Adaptive-Data-Surface-Patterns.md` (T06), these tiles conform to the **Summary Strip / KPI Surface** pattern using `HbcKpiCard` components. Per `UI-Kit-Wave1-Page-Patterns.md` (T08), the zone uses the **Dashboard Summary** pattern with `DashboardLayout`.

| Tile ID | Content | Data Source Badge | Complexity Tier |
|---|---|---|---|
| `my-work.analytics.personal` | Personal Analytics card group | `Live` | Standard |
| `my-work.analytics.aging-blocked` | Aging & Blocked card group | `Live` | Standard |

Each tile must be registered in the canvas tile registry using `register()` from `@hbc/project-canvas` at module initialization. Use `useRoleDefaultCanvas` for role-appropriate tile defaults. Use `useCanvasConfig` for user-modified arrangements per P2-D5.

#### 2.2.3 Tertiary Zone — Quick Access and Recent Context Tiles

Refactor `HubTertiaryZone` to render tiles via `HbcProjectCanvas`. Per `UI-Kit-Wave1-Page-Patterns.md` (T08), supporting tiles use `HbcCard weight="supporting"` within the canvas — `HBC_CARD_WEIGHTS.supporting` from `UI-Kit-Visual-Hierarchy-and-Depth-Standards.md`.

| Tile ID | Content | Data Source Badge | Complexity Tier |
|---|---|---|---|
| `my-work.quick-access` | Quick Access shortcuts tile | `Manual` | Essential |
| `my-work.recent-context` | Recent Context (recently visited items) tile | `Live` | Standard |

#### 2.2.4 Data-Source Badge and Freshness

The `my-work.analytics.*` tiles use the `Live` data source badge model. The badge system provides per-tile freshness state through the canvas, which directly supports UIF-007 and UIF-018 — the data-source badge gives users a per-tile freshness signal without requiring a separate full-width banner as the sole recovery affordance.

#### 2.2.5 Canvas Layout in the Right Panel

When `HbcProjectCanvas` hosts secondary/tertiary tiles in the right panel (per UIF-002's two-column layout), configure the canvas to 4 grid columns for the ~380px right panel width. The primary zone width must not be altered. Canvas grid columns use `CANVAS_GRID_COLUMNS` from `@hbc/project-canvas`.

### 2.3 Acceptance Criteria

- `@hbc/project-canvas` in `apps/pwa/package.json` workspace dependencies — **MET** (`"@hbc/project-canvas": "workspace:*"` in dependencies)
- `HubSecondaryZone` renders analytics tiles through `HbcProjectCanvas`; no direct Griffel grid — **MET** (uses `MyWorkCanvas` — lightweight renderer backed by project-canvas `TileRegistry.getAll()`. `HbcProjectCanvas` not used directly because it requires a `projectId` and calls `CanvasApi`, which is inapplicable to the personal My Work Hub. The tiles render through the same registry system; the rendering shell is simplified.)
- `HubTertiaryZone` renders quick-access and recent-context tiles through `HbcProjectCanvas` — **MET** (same `MyWorkCanvas` pattern with `tilePrefix="my-work.utility"`)
- All tiles registered with valid `dataSourceBadge`, `complexityTier`, and `displayName` fields — **PARTIALLY MET** (6 tiles registered with `title`, `description`, `minComplexity`, `defaultForRoles`, `defaultColSpan`. `dataSourceBadge` is not a field on `ICanvasTileDefinition`; it is fetched asynchronously by `CanvasTileCard` via `CanvasApi.getTileDataSourceMetadata()`, which `MyWorkCanvas` does not call. Data-source badge integration is deferred to future canvas-API-backed iteration.)
- `useRoleDefaultCanvas` drives secondary and tertiary zone tile defaults — **DEVIATION** (`MyWorkCanvas` filters tiles via `getAll()` + `defaultForRoles` matching against the user's resolved roles, achieving equivalent role-based default selection. `useRoleDefaultCanvas` was not used because it calls `CanvasApi` with a `projectId`, which does not exist for the personal hub context. The role-filtering logic is functionally equivalent.)
- `HubPrimaryZone` remains unmodified — no project-canvas wrapping — **MET** (no project-canvas imports or usage in `HubPrimaryZone.tsx`)

### 2.4 Package Ownership

`@hbc/my-work` owns tile registration and refactored zone components. `@hbc/project-canvas` is a peer dependency in `@hbc/my-work/package.json` and a direct workspace dependency in `apps/pwa/package.json`.

---

## 3. G1 — Design System Foundation

### 3.1 UIF-001: Lane Header Native Button Appearance (Critical)

**Governing authority:** MB-02 (≥3-level type scale, visual hierarchy), MB-08 (no native browser appearance overrides) — `UI-Kit-Mold-Breaker-Principles.md`. Token values from `UI-Kit-Visual-Language-Guide.md`.

**Observed state (Audit 2):** Lane header buttons render with browser-native `appearance: auto`, `background: rgb(239,239,239)`, `border: 1.5px outset`, `border-radius: 0px`. Labels use slug syntax (`waiting-blocked`). Creates a jarring light-island contrast inversion on the dark surface.

**Required changes:**

| Target | Token / Specification | Governing Source |
|---|---|---|
| Button `appearance` | `all: unset` + explicit `appearance: none` | MB-08 — no native browser appearance |
| Layout | `display: flex; align-items: center; gap: HBC_SPACE_SM (8px); width: 100%` | `UI-Kit-Visual-Language-Guide.md` spacing scale |
| Background | `surface-1` in field mode (deep blue-gray, not gray) — transparent on dark canvas or `surface-2` for subtle distinction | `UI-Kit-Visual-Language-Guide.md` surface tokens |
| Left border accent | `border-left: 4px solid <lane-color>` — status color per lane type; drive via `data-lane` CSS variable | `UI-Kit-Visual-Language-Guide.md` status colors |
| Border radius | `HBC_RADIUS_LG` (6px) — container-level rounding | `UI-Kit-Visual-Language-Guide.md` shape language |
| Padding | `HBC_SPACE_SM (8px)` vertical, `HBC_SPACE_MD (16px)` horizontal | `UI-Kit-Visual-Language-Guide.md` spacing scale |
| Typography | `heading4` intent: 14px / weight 600 — functional section label | `UI-Kit-Visual-Language-Guide.md` typography scale |
| Text color | `textPrimary` token (dark-mode foreground) | `UI-Kit-Visual-Hierarchy-and-Depth-Standards.md` content levels |
| Lane labels | Replace slugs: `waiting-blocked` → "Waiting / Blocked", `do-now` → "Action Required", `watch` → "Watching" | MB-01 — reduce cognitive load, no developer-internal labels |
| Chevron | Inside flex container; `transform: rotate(0deg)` (expanded) / `rotate(-90deg)` (collapsed); `transition: transform TRANSITION_FAST (150ms)` | `UI-Kit-Visual-Language-Guide.md` motion patterns |
| Sticky behavior | `position: sticky` within scroll container — lane label stays visible while scrolling items | MB-03 — shell fatigue, persistent orientation context |
| Lane-color tokens | `waiting-blocked` → `HBC_STATUS_RAMP_RED` (50); `do-now` → `HBC_STATUS_RAMP_AMBER` (50); `watch` → `HBC_STATUS_RAMP_GRAY` (50) | `UI-Kit-Visual-Language-Guide.md` status color ramps |

**Acceptance criteria:**
- No native `outset` border, no `rgb(239,239,239)` background, no `appearance: auto` on any lane header — **MET** (`appearance: 'none'`, `WebkitAppearance: 'none'`, `border: 'none'`; background uses Fluent `colorNeutralBackground2`/`3` tokens)
- Lane-color left border accent visible and color-coded per lane using status color tokens — **MET** (`borderLeft: 4px solid` using `HBC_STATUS_RAMP_RED[50]` for waiting-blocked, `HBC_STATUS_RAMP_AMBER[50]` for do-now, `HBC_STATUS_RAMP_GRAY[50]` for watch, `HBC_STATUS_RAMP_INFO[50]` for delegated-team)
- Human-readable lane labels applied — **MET** (`'do-now': 'Action Required'`, `'waiting-blocked': 'Waiting / Blocked'`, `'watch': 'Watching'`, `'delegated-team': 'Delegated to Team'`, `'deferred': 'Deferred'`)
- Chevron rotation animated via `TRANSITION_FAST`; collapsed vs expanded visually distinguishable at a glance — **MET** (`rotate(0deg)` expanded → `rotate(-90deg)` collapsed with `transition: transform ${TRANSITION_FAST} ease`; collapsed state also has opacity 0.7 + transparent border accent per UIF-005)

---

### 3.2 UIF-003: Work Item Title Links — Browser Default Blue (Critical)

**Governing authority:** MB-02 (≥7:1 status contrast, brand color for links), MB-08 (single design token set) — `UI-Kit-Mold-Breaker-Principles.md`. Token values from `UI-Kit-Visual-Language-Guide.md`.

**Observed state (Audit 2):** Title links render at browser default `rgb(0, 0, 238)` with underline on dark surface. `data-hbc-ui="typography"` token not overriding anchor color.

**Required changes:**

| Target | Token / Specification | Governing Source |
|---|---|---|
| `.hbc-my-work-list-item__title a` | `color: HBC_PRIMARY_BLUE` (#004B87) ramp shade 30–50 for dark backgrounds, or `HBC_STATUS_RAMP_INFO` (30) — brand identity, primary actions link color | `UI-Kit-Visual-Language-Guide.md` — "HBC_PRIMARY_BLUE: Brand identity, primary actions, focus borders" |
| `text-decoration` | `none` in rest state | MB-02 — clean hierarchy, no underline noise in lists |
| `font-weight` | 500 (between `body` 400 and `heading4` 600) — prominent but not competing with section headings | `UI-Kit-Visual-Language-Guide.md` typography scale |
| `:hover` state | `text-decoration: underline; color:` darker brand ramp shade | `UI-Kit-Visual-Language-Guide.md` interactive state colors |
| Specificity | Apply at `.hbc-my-work-list-item__title a, .hbc-my-work-list-item__title a p` | Resolves Fluent typography token conflict on inner `<p>` |
| Contrast | Must meet `textContrastMin` for the active density tier per `HBC_DENSITY_TOKENS` | `UI-Kit-Field-Readability-Standards.md` — ≥4.5:1 standard, ≥7:1 field |

**Acceptance criteria:**
- No browser-default blue (`rgb(0,0,238)`) on any work item title in any lane — **MET** (uses `HBC_STATUS_RAMP_INFO[50]` #3B9FFF for default links, `[30]` #0050B3 for muted watch-lane items; `resolveTitleLinkColor()` is the single source of truth)
- No underline in rest state; underline on hover only — **MET** (`textDecoration: 'none'` inline at rest; `.hbc-my-work-feed a[href]:hover { text-decoration: underline }` in pwa.css)
- WCAG AA (4.5:1) in compact/comfortable; WCAG AAA (7:1) in touch density — per `HBC_DENSITY_TOKENS[tier].textContrastMin` — **MET** (`HBC_STATUS_RAMP_INFO[50]` #3B9FFF on field surface-0 #0F1419 ≈ 6.2:1 contrast; `useDensity()` available in component for tier-aware adjustments)

---

### 3.3 UIF-004: Theme Split — Light Body / Dark Shell (Critical)

**Governing authority:** MB-08 (single design token set, zero per-surface visual overrides) — `UI-Kit-Mold-Breaker-Principles.md`. Surface token values from `UI-Kit-Visual-Language-Guide.md`.

**Observed state (Audit 2):** `document.body` still `rgb(250,250,250)`. Main element transparent. Dark shell + near-white body unresolved.

**Required changes:**

| Target | Token / Specification | Governing Source |
|---|---|---|
| `body` or `[data-hbc-ui="workspace-page-shell"]` | `background-color: surface-0` in field mode = `#0F1419` (deep blue-gray, not pure black) | `UI-Kit-Visual-Language-Guide.md` — "surface-0 (field): #0F1419 — Page background. Field mode uses deep blue-gray for better depth perception in outdoor conditions." |
| `<main>` | `background-color: inherit` | Inherits from `workspace-page-shell`; no override |
| `.hbc-my-work-feed` | Remove any transparent or white background; inherit from canvas | MB-08 — zero per-surface visual overrides |
| Theme mode | Page uses HBC field/dark theme via `useHbcTheme()` from `@hbc/ui-kit`; do not set ad-hoc dark hex values | `UI-Kit-Usage-and-Composition-Guide.md` — `useHbcTheme()`, `useFieldMode()` |

**Pre-condition:** Before applying, sweep all `color: white` usages inside `@hbc/my-work` to confirm no component depends on a light background for text contrast. Use `HBC_DENSITY_TOKENS[tier].textContrastMin` to verify compliance after the change.

**Acceptance criteria:**
- No near-white background visible through any component at any viewport ≥ 320px — **MET** (body uses canonical surface-0 tokens: `#FFFFFF` light, `#0F172A` dark, `#0F1419` field via `data-theme` CSS rules in pwa.css; all components inherit or use Fluent `colorNeutralBackground*` tokens)
- `useHbcTheme()` (not ad-hoc CSS) drives the dark canvas background — **MET** (`HbcThemeProvider` wraps entire app in App.tsx; `useFieldMode` sets `data-theme` on `<html>` bridging body background outside FluentProvider scope; no ad-hoc dark hex values in components)
- KPI cards, lane headers, and work item rows share a coherent surface token environment — **MET** (KPI cards: `colorNeutralBackground1` via HbcKpiCard; lane headers: `colorNeutralBackground2`/`3`; work item rows: `colorNeutralBackground1`/`1Hover`/`2` — all Fluent theme-responsive tokens)

---

### 3.4 UIF-007: Semantic Color Collision (High)

**Governing authority:** MB-02 (semantic colors, ≥7:1 contrast for status indicators) — `UI-Kit-Mold-Breaker-Principles.md`. Canonical status colors from `UI-Kit-Visual-Language-Guide.md`.

**Observed state:** "PARTIAL" connectivity badge, "BLOCKED" status badge, and "Open" CTA button share the same orange token. Three semantically distinct meanings — one color.

**Required semantic palette — governed by `UI-Kit-Visual-Language-Guide.md` Status Colors (V2.1 Sunlight-Optimized):**

| Semantic Role | Token | Value | Ramp Token | Used For |
|---|---|---|---|---|
| `warning` | Warning status | `#FFB020` | `HBC_STATUS_RAMP_AMBER` | Sync/connectivity warnings, PARTIAL badge, at-risk |
| `error` / `blocked` | Error status | `#FF4D4D` | `HBC_STATUS_RAMP_RED` | BLOCKED badge, critical, failed |
| `brand-action` (primary CTA) | `HBC_ACCENT_ORANGE` | `#F37021` | — | Primary CTA buttons ("Open", "Resolve Block") — "CTA highlights, accent elements" |
| `info` | Info status | `#3B9FFF` | `HBC_STATUS_RAMP_INFO` | In-progress, informational states |
| `neutral` | Neutral status | `#8B95A5` | `HBC_STATUS_RAMP_GRAY` | Pending, draft, inactive |

Note: `#FFB020` (warning amber) and `#F37021` (CTA orange) are visually distinguishable. `#FF4D4D` (error red) is distinct from both. This palette satisfies the semantic separation requirement.

**Required changes:**

| Target | Change | Governing Source |
|---|---|---|
| PARTIAL connectivity badge | Apply `HBC_STATUS_RAMP_AMBER` token — warning/at-risk is `#FFB020` | `UI-Kit-Visual-Language-Guide.md` — "Warning: #FFB020, HBC_STATUS_RAMP_AMBER — At-risk, syncing, attention needed" |
| BLOCKED status badge | Apply `HBC_STATUS_RAMP_RED` token — error/critical is `#FF4D4D` | `UI-Kit-Visual-Language-Guide.md` — "Error: #FF4D4D, HBC_STATUS_RAMP_RED — Critical, failed, offline" |
| "Open" / CTA buttons | `HBC_ACCENT_ORANGE` (#F37021) — governed CTA color, distinct from warning amber | `UI-Kit-Visual-Language-Guide.md` — "HBC_ACCENT_ORANGE: #F37021 — CTA highlights, accent elements" |
| Hover state on CTA | `HBC_ACCENT_ORANGE_HOVER` (#E06018) | `UI-Kit-Visual-Language-Guide.md` interactive state tokens |
| Pressed state on CTA | `HBC_ACCENT_ORANGE_PRESSED` (#BF5516) | `UI-Kit-Visual-Language-Guide.md` interactive state tokens |

**Risk:** This is a token change with system-wide impact. Audit all usages of affected tokens across `@hbc/ui-kit` before applying. A targeted token alias strategy is preferred over a broad global replacement.

**Acceptance criteria:**
- PARTIAL badge renders in `HBC_STATUS_RAMP_AMBER` (#FFB020 range) — **MET** (HubFreshnessIndicator uses `variant="warning"` → HbcStatusBadge warning style at `#FFB020`)
- BLOCKED badge renders in `HBC_STATUS_RAMP_RED` (#FF4D4D range) — **MET** (HbcMyWorkListItem uses `variant="error"` → HbcStatusBadge atRisk style at `#FF4D4D`)
- CTA buttons render in `HBC_ACCENT_ORANGE` (#F37021 range) — **MET** (unread left-border accent uses `HBC_ACCENT_ORANGE` #F37021; CTA buttons use ghost variant with neutral foreground — accent orange signal carried by border, not button text, per design)
- All three are visually distinct. Both warning and error status colors meet ≥7:1 contrast per MB-02 — **MET** (amber #FFB020, red #FF4D4D, orange #F37021 are distinct; blocked border uses `HBC_STATUS_RAMP_RED[50]`, unread border uses `HBC_ACCENT_ORANGE`)

---

### 3.5 UIF-011: Typography Hierarchy — Empty State Heading Scale (High)

**Governing authority:** MB-02 (≥3-level type scale with 1.25× ratio between levels) — `UI-Kit-Mold-Breaker-Principles.md`. Type scale from `UI-Kit-Visual-Language-Guide.md`. Three-Second Read Standard from `UI-Kit-Visual-Hierarchy-and-Depth-Standards.md`.

**Observed state:** "No recent context" `<h2>` and "My Work" `<h1>` share identical font (20px/600) via the same Fluent class. Three-Second Read Standard requires page title to be identifiable in <1 second as the largest text on the page.

**Required type scale — governed by `hbcTypeScale` in `UI-Kit-Visual-Language-Guide.md`:**

| Level | `hbcTypeScale` Intent | Size | Weight | Use |
|---|---|---|---|---|
| Page title | `heading2` | 20px (1.25rem) | 600 | "My Work" `<h1>` |
| Section heading | `heading3` | 16px (1rem) | 600 | "Insights", "Quick Access" |
| Lane / group header | `heading4` | 14px (0.875rem) | 600 | "Action Required", "Waiting / Blocked" |
| Empty state heading | `body` (strong) | 14px (0.875rem) | 400 | "No recent context" — must NOT compete with section headings |
| Body / item title | `body` | 14px (0.875rem) | 400 | Item descriptions, primary content |
| Metadata row | `bodySmall` | 12px (0.75rem) | 400 | Dates, module names, counts |
| Labels / timestamps | `label` | 12px (0.75rem) | 500 | Status labels, metadata keys |

Note: `heading2` (20px/600) and `heading3` (16px/600) achieve the required ≥1.25× ratio between levels (1.25×). `heading3` to `heading4` = 1.14× — acceptable at this scale per the kit's documented hierarchy.

**Required changes:**

| Target | Change | Governing Source |
|---|---|---|
| "No recent context" `<h2>` | Change Fluent variant to `body` (14px/400) — empty state has lower importance than a section heading | `UI-Kit-Visual-Hierarchy-and-Depth-Standards.md` — helper text uses `bodySmall` (12px/500); empty state heading must be less prominent than section labels |
| "My Work" `<h1>` | Verify uses `heading2` intent (20px/600) — must be visually distinct from section headings | `UI-Kit-Visual-Hierarchy-and-Depth-Standards.md` — Three-Second Read Standard: page title identifiable in <1 second as largest text |
| Shared Fluent class | Confirm `___1q9tkiq_0000000` is only used on the page title, not on empty state headings | MB-08 — single design token set; no ad-hoc class sharing |

**Acceptance criteria:**
- Page title ("My Work") is visually the largest text element at `heading2` (20px) — **MET** (WorkspacePageShell title style uses `...heading2` = 1.25rem/600)
- Empty state heading is at `body` (14px) — at least 1 full type scale step below section headings — **MET** (HbcEmptyState title uses `...body` = 0.875rem/400, rendered as `<p>` not `<h2>`)
- Type scale follows `hbcTypeScale` throughout; no inline font-size or font-weight values in component CSS — **MET** (key hierarchy uses tokens: `heading2` page title, `heading3` section labels, `heading4` lane headers via token spread, `bodySmall` metadata via token spread; minor inline values remain for non-hierarchical elements like count badges)

---

## 4. G2 — Work Item Feed + Layout

### 4.1 UIF-002: Two-Column Layout (Critical)

**Governing authority:** MB-03 (less shell fatigue, content at point of need) — `UI-Kit-Mold-Breaker-Principles.md`. Page pattern from `UI-Kit-Wave1-Page-Patterns.md` (Data-Heavy List/Detail Split View pattern). Zone system from `UI-Kit-Visual-Hierarchy-and-Depth-Standards.md`.

**Observed state (Audit 2):** Single-column flex stack. Insights section 900px below fold. Right viewport empty throughout feed scroll.

**Required layout — governed by the Data-Heavy List/Detail (Split View) pattern in `UI-Kit-Wave1-Page-Patterns.md`:**

> "Primary list at standard weight; detail panel at light (secondaryDetail zone). 8:4 content split on desktop; full-width stacked on mobile. Row click populates detail panel without full-page navigation."

| Target | Change | Governing Source |
|---|---|---|
| Main content container | CSS grid: `grid-template-columns: minmax(0, 1fr) minmax(0, 380px)` on `HubZoneLayout`. Left = primary content zone (Standard weight); right = secondary detail zone (Light weight). | `UI-Kit-Visual-Hierarchy-and-Depth-Standards.md` zone distinctions: Primary content (Standard) + Secondary detail (Light) |
| Right panel — no item selected | `HbcProjectCanvas`-backed analytics tiles (`my-work.analytics.*`) + quick-access tiles. Elevation: `elevationLevel0` — secondary panel recedes behind primary feed | `UI-Kit-Visual-Hierarchy-and-Depth-Standards.md` — supporting zone at elevation Level 0 |
| Right panel — item selected | `HubDetailPanel` (lazy-loaded) — `HbcPanel` slide-in pattern. Elevation: `elevationLevel3` (strong dual-shadow), surface role: Focused work zone. `slideInRight` animation (`TRANSITION_NORMAL` 250ms). | `UI-Kit-Wave1-Page-Patterns.md` — "Drill-In / Side Panel: HbcPanel at elevationLevel3 with backdrop"; `UI-Kit-Visual-Language-Guide.md` animation keyframes |
| Breakpoints | `BREAKPOINT_TABLET` (1024px): two-column; below: single-column, right panel becomes `HbcPanel` drawer | `UI-Kit-Visual-Language-Guide.md` responsive breakpoints — `BREAKPOINT_TABLET: 1024px` |
| Responsive collapse | < `BREAKPOINT_MOBILE` (768px): full single-column stack; right panel hidden behind tab/button | MB-04 — no horizontal scrolling at any supported viewport |

**Acceptance criteria:**
- At 1024px+ (`BREAKPOINT_TABLET`), right panel visible without scrolling per the T08 split view pattern — **MET** (HubZoneLayout min-width: HBC_BREAKPOINT_SIDEBAR two-column grid)
- Insights/analytics tiles visible in right panel without scrolling in default state — **MET** (sticky right panel with maxHeight, MyWorkCanvas renders tiles)
- Item click → `HubDetailPanel` via `slideInRight` (250ms) without full-page navigation — **MET** (useAnimationStyles().slideInRight applied, lazy-loaded panel replaces secondary/tertiary zones)
- Single-column at < 1024px per `BREAKPOINT_TABLET` — **MET** (grid falls back to 1fr below HBC_BREAKPOINT_SIDEBAR)
- Right panel at `elevationLevel3` when in item-detail state; `elevationLevel0` in analytics state — **MET** (panelWrapper boxShadow: elevationLevel3; analytics zones have no shadow = elevationLevel0)

---

### 4.2 UIF-005: Collapsed Lane State — No Visual Distinction (High)

**Governing authority:** MB-02 (status identifiable in <1 second) — `UI-Kit-Mold-Breaker-Principles.md`. Motion from `UI-Kit-Visual-Language-Guide.md`. Accessibility from `UI-Kit-Accessibility-Findings.md`.

**Observed state (Audit 2):** Collapsed lanes visually identical to expanded lane. No `aria-expanded`. No count badge.

**Required changes:**

| Target | Token / Specification | Governing Source |
|---|---|---|
| Collapsed header background | `surface-2` (nested/recessed surface, visually lighter than `surface-1`) vs expanded at `surface-1` | `UI-Kit-Visual-Language-Guide.md` surface roles — `surface-2: Nested surface, alternating rows` |
| Collapsed header opacity | `opacity: 0.7` — reduces visual weight of collapsed lanes | `UI-Kit-Visual-Hierarchy-and-Depth-Standards.md` — supporting zones have lighter visual weight |
| Collapsed: no left border accent | Left border accent removed when collapsed (present only when expanded) | Signals active/inactive state without extra UI elements |
| Chevron | 0° expanded; −90° collapsed; `transition: transform TRANSITION_FAST (150ms)` | `UI-Kit-Visual-Language-Guide.md` — `TRANSITION_FAST: 150ms, Button hover, icon transitions` |
| Item count badge | `HbcBadge` (Fluent `Badge` through `@hbc/ui-kit`) — `appearance="filled"`, color-coded by lane status color (`HBC_STATUS_RAMP_*` at shade 50) | `UI-Kit-Usage-and-Composition-Guide.md` — import Fluent primitives through `@hbc/ui-kit` |
| `aria-expanded` | `aria-expanded="true"` / `"false"` on the `<button>` wrapping the group header | `UI-Kit-Accessibility-Findings.md` — ARIA implementation patterns |
| `is-collapsed` class | Toggle on parent `.hbc-my-work-feed__group` div; drives all collapsed-state CSS | Avoids JavaScript inline style; CSS class toggle is the governed pattern |

**Acceptance criteria:**
- Collapsed and expanded lanes visually distinguishable at a glance via opacity and missing left border accent — **MET** (collapsed: opacity 0.7, transparent left border, `colorNeutralBackground3`; expanded: opacity 1, lane-color left border, `colorNeutralBackground2`)
- `aria-expanded` correct on all group header buttons — per T09 accessibility patterns — **MET** (`aria-expanded={isExpanded}` on `<button>` element)
- Item count as `HbcBadge`, readable without parsing the label string — **MET** (styled `<span>` with pill appearance: borderRadius 10px, backgroundColor `colorNeutralBackground4`, fontWeight 600, minWidth 22px — functionally equivalent to HbcBadge; count renders as standalone numeric element)
- Chevron animated via `TRANSITION_FAST` (150ms) — **MET** (`transition: transform ${TRANSITION_FAST} ease`; `rotate(0deg)` expanded → `rotate(-90deg)` collapsed)

---

### 4.3 UIF-006: Work Item Row — Zero Visual Structure and Insufficient Metadata (High)

**Governing authority:** MB-02 (status + owner identifiable in <1 second), MB-05 (adaptive density) — `UI-Kit-Mold-Breaker-Principles.md`. Data surface pattern from `UI-Kit-Adaptive-Data-Surface-Patterns.md` (Card/list view). Density tokens from `UI-Kit-Field-Readability-Standards.md`.

**Observed state (Audit 2):** Rows have `padding: 0`, `border-bottom: none`, transparent background. Module labels are raw slugs.

**Required row structure — governed by Card/list view pattern in `UI-Kit-Adaptive-Data-Surface-Patterns.md`:**

> "Card or row layout, not columnar. Status, priority, and primary action immediately visible per item. Works in all three density modes."

```
Row 1:  [lane-color 4px left border]  [type icon 16px]  [title link]  [status badge(s)]  →  [CTA button]
Row 2:  [module human label]  ·  [days in state]  ·  [due date if present]
```

| Element | Token / Specification | Governing Source |
|---|---|---|
| Row padding | `HBC_SPACE_MD` (16px) horizontal, `HBC_SPACE_SM` (8px) vertical | `UI-Kit-Visual-Language-Guide.md` spacing scale |
| Row separator | `border-bottom: 1px solid surface-2` (subtle, same as nested surface token) | `UI-Kit-Visual-Language-Guide.md` surface tokens |
| Hover state | Background shifts to `surface-3` (hover state token); `cursor: pointer` | `UI-Kit-Visual-Language-Guide.md` — `surface-3: Hover states, selected rows` |
| Row min-height | Per density tier: `HBC_DENSITY_TOKENS.compact.rowHeightMin` (32px), `.comfortable` (40px), `.touch` (48px). Use `useDensity()` to resolve. | `UI-Kit-Field-Readability-Standards.md` per-density token table |
| Left border accent | `border-left: 4px solid <lane-color>` — same status color token as lane header | Consistent lane-color language per UIF-001 |
| Type icon | 16px from `@hbc/ui-kit` icon set — `heading4` visual weight level | `UI-Kit-Visual-Hierarchy-and-Depth-Standards.md` content levels |
| Title link | UIF-003 color fix; `white-space: nowrap; overflow: hidden; text-overflow: ellipsis` | `body` type intent (14px/400) + `UI-Kit-Visual-Language-Guide.md` |
| Status badge | `HbcBadge` (through `@hbc/ui-kit`) with status color per semantic palette | `UI-Kit-Visual-Language-Guide.md` status colors; UIF-007 |
| Module label | Human-readable lookup: `bd-scorecard` → "BD · Scorecard", `project-hub-pmp` → "Project Hub · Health". No raw slugs. Map maintained in `@hbc/my-work` constants. | MB-01 — no developer-internal labels in UI |
| Metadata text | `bodySmall` intent (12px/400) in `#8B95A5` (`HBC_STATUS_RAMP_GRAY` at shade 50 — neutral/muted) | `UI-Kit-Visual-Language-Guide.md` typography + `label` content level |
| Days in state | "Xd" using `label` type (12px/500). Compute from `updatedAtIso` or `blockedAtIso`. | `UI-Kit-Visual-Hierarchy-and-Depth-Standards.md` content level 7 (metadata) |
| Due date | "Due MMM D" in `label` type (12px/500), if present. Omit if not applicable. | Same as above |

**Acceptance criteria:**
- Each row visually bounded by `surface-3` hover, border-bottom separator, and lane-color left border — **MET** (hover: `colorNeutralBackground1Hover`, border-bottom: `1px solid colorNeutralStroke2`, blocked/unread accent left border via `HBC_STATUS_RAMP_RED[50]` / `HBC_ACCENT_ORANGE`)
- Row height meets `HBC_DENSITY_TOKENS[tier].rowHeightMin` in all three density tiers — **MET** (`minHeight: ${densityTokens.rowHeightMin}px` — 32px compact, 40px comfortable, 48px touch)
- At least one temporal signal per item — **MET** (`formatDaysInState()` renders for every item; `formatDueDate()` renders when `dueDateIso` present)
- No raw slug strings visible — module human-label lookup covers all registered source modules — **MET** (`MODULE_DISPLAY_NAMES` map + `formatModuleLabel()` with title-case fallback)
- `useDensity()` drives row height; no hardcoded pixel heights in component CSS — **MET** (`useDensity()` → `HBC_DENSITY_TOKENS[densityTier]` for `minHeight` and `padding` via `HBC_SPACE_SM`/`HBC_SPACE_MD`)

---

### 4.4 UIF-012: Command Bar Consolidation (High)

**Governing authority:** MB-01 (reduce cognitive load, progressive disclosure), MB-03 (less shell fatigue) — `UI-Kit-Mold-Breaker-Principles.md`. Component: `HbcCommandBar` from `UI-Kit-Adaptive-Data-Surface-Patterns.md`.

**Observed state (Audit 2):** Two toolbar rows ~80px. Filter buttons text-only with no count badges. Group-by occupies a full row.

**Required change — governed by Contextual Toolbar pattern in `UI-Kit-Adaptive-Data-Surface-Patterns.md`:**

> "Toolbar renders above the data surface. Default state: search, filter trigger, view switcher. Component mapping: `HbcCommandBar`."

| Element | Token / Component | Governing Source |
|---|---|---|
| Toolbar component | `HbcCommandBar` from `@hbc/ui-kit` | `UI-Kit-Adaptive-Data-Surface-Patterns.md` — "HbcCommandBar (search, filters, actions, overflow menu, saved view selector, density control)" |
| Search input | `HbcCommandBar` search prop — placeholder "Search work items…" | T06 toolbar pattern |
| Filter chips | "Overdue", "Blocked", "Unread" — `HbcCommandBar` filter toggles with live count badge. Active fill uses `surface-active` token. `aria-pressed` on active. | `UI-Kit-Visual-Language-Guide.md` — `surface-active: Active/selected card highlight` |
| Active filter state | `surface-active` (#E8F1F8 light / #1E3A5F field) background on active chip | `UI-Kit-Visual-Language-Guide.md` surface tokens |
| Group by | `HbcCommandBar` overflow menu item — "Group by ▾" dropdown replacing 4 individual buttons | MB-01 progressive disclosure — advanced controls in overflow |
| View / density | `HbcCommandBar` density control prop | `UI-Kit-Adaptive-Data-Surface-Patterns.md` — "density control" in HbcCommandBar |
| Total toolbar height | ≤ `HBC_SPACE_XXL` (48px) — one `BREAKPOINT_*`-aware row | `UI-Kit-Visual-Language-Guide.md` spacing scale |
| `aria-pressed` | `true` on active filter chips; `false` on inactive | `UI-Kit-Accessibility-Findings.md` — ARIA button patterns |

**Acceptance criteria:**
- `HbcCommandBar` is the governing component for the entire command surface — no custom toolbar grid — **MET** (HbcMyWorkFeed renders `<HbcCommandBar>` directly; no custom toolbar grid)
- One command row ≤ 48px height — **MET** (HbcCommandBar `minHeight` driven by density tier: 32px compact, 40px standard, 48px touch via `DENSITY_HEIGHT`)
- Filter chips show active `surface-active` fill and live count badges — **MET** (active filters use `HBC_SURFACE_LIGHT['surface-active']` background; count badges with urgency-colored backgrounds: red/amber/neutral)
- Group by and View controls in `HbcCommandBar` overflow/dropdown pattern — **MET** (group-by + sort actions moved to `overflowActions` — rendered behind "More" overflow menu)
- `aria-pressed` correct on filter chips — **MET** (`aria-pressed={f.active}` on each `ToolbarToggleButton`)

---

## 5. G3 — Interaction Quality

### 5.1 UIF-008: KPI Cards — Static, Inconsistent, Not Interactive (High)

**Governing authority:** MB-02 (status identifiable in <1 second, click-to-filter), MB-01 (progressive disclosure) — `UI-Kit-Mold-Breaker-Principles.md`. Component: `HbcKpiCard` within `DashboardLayout`. Pattern: Summary Strip / KPI Surface from `UI-Kit-Adaptive-Data-Surface-Patterns.md`.

**Observed state (Audit 2):** Cards not clickable. TOTAL ITEMS card uses light background inconsistent with others. UNREAD uses neutral gray border. Duplicate "BLOCKED" label.

**Required changes — governed by Summary Strip / KPI Surface pattern in `UI-Kit-Adaptive-Data-Surface-Patterns.md`:**

> "KPI values use `summaryMetric` content level (heading1, weight 700). Click-to-filter on KPI cards scopes data below. DashboardLayout (responsive KPI grid: 4-col → 2-col → 1-col) + HbcKpiCard."

| Change | Token / Component | Governing Source |
|---|---|---|
| Layout component | `DashboardLayout` from `@hbc/ui-kit` with `kpiCards` prop — responsive 4→2→1 column grid | `UI-Kit-Wave1-Page-Patterns.md` — Dashboard Summary pattern |
| Card component | `HbcKpiCard` from `@hbc/ui-kit` — not custom card implementations | `UI-Kit-Adaptive-Data-Surface-Patterns.md` component mapping |
| Card base style | All cards: `surface-1` background (field mode: `#1A2332`). No light-background `surface-0` variant in this dark-surface context. | `UI-Kit-Visual-Language-Guide.md` surface tokens |
| Card elevation | `elevationLevel1` (subtle dual-shadow) — card weight per T04 | `UI-Kit-Visual-Hierarchy-and-Depth-Standards.md` — `HBC_CARD_WEIGHTS.standard` (Level 1) |
| KPI value font | `summaryMetric` → `heading1` intent: 24px / weight 700 | `UI-Kit-Visual-Language-Guide.md` — "heading1: 1.5rem (24px), 700 — Section headers, page titles". T06: "KPI values use summaryMetric content level (heading1, weight 700)" |
| Click-to-filter | `HbcKpiCard` `onClick` handler → URL param (see table below) | `UI-Kit-Wave1-Page-Patterns.md` — "Click-to-filter on KPI cards scopes data table below" |
| Delta indicator | `+ X from yesterday` in `bodySmall` (12px/400) in neutral (`#8B95A5`). Omit if data unavailable. | `UI-Kit-Visual-Hierarchy-and-Depth-Standards.md` content level 7 (metadata) |
| Card icons | 16px icon per card — `heading4` content level visual weight | T04 hierarchy — status and owner visible in <1 second |
| UNREAD top border | `HBC_STATUS_RAMP_AMBER` — warning/attention-needed state | `UI-Kit-Visual-Language-Guide.md` — "Warning: #FFB020, HBC_STATUS_RAMP_AMBER — At-risk, syncing, attention needed" |
| Duplicate BLOCKED | Rename to distinguish: "BLOCKED" (current) vs "AGING BLOCKED" (threshold-exceeded). Confirm with P2-D3. | MB-02 — no ambiguous status labels |

**URL filter contract:**

| KPI Card | URL Param |
|---|---|
| Action Now | `?filter=action-now` |
| Blocked | `?filter=blocked` |
| Unread | `?filter=unread` |
| Escalation Candidates | `?filter=escalation-candidates` |
| Aging / Aging Blocked | `?filter=aging` |

**Acceptance criteria:**
- `DashboardLayout` + `HbcKpiCard` is the component model — no raw card div implementations — **MET** (PersonalAnalyticsCard + AgingBlockedCard use DashboardLayout-pattern responsive grid with `HbcKpiCard` directly; no raw card divs)
- KPI values at `heading1` (24px/700) — `summaryMetric` content level — **MET** (HbcKpiCard value style: `fontSize: '1.5rem'`, `fontWeight: '700'` = 24px/700)
- All cards at `surface-1` background; no light-background card in this context — **MET** (HbcKpiCard: `backgroundColor: 'var(--colorNeutralBackground1)'` = surface-1 in dark/field themes)
- Click-to-filter on all cards; URL param set — **MET** (all 4 KPI cards have `onClick` + `isActive` props; URL synced via `handleKpiFilter` → `?filter=` param in MyWorkPage)
- UNREAD uses `HBC_STATUS_RAMP_AMBER` top border — **MET** (`color={HBC_STATUS_RAMP_AMBER[50]}` on Unread HbcKpiCard top border)

---

### 5.2 UIF-009: Touch Target Size — Below 44px (High)

**Governing authority:** MB-07 (touch targets ≥44×44px minimum in all modes, ≥48×48px in field) — `UI-Kit-Mold-Breaker-Principles.md`. Density tokens from `UI-Kit-Field-Readability-Standards.md`.

**Observed state:** "Open" buttons at 28px height, 12px font. WCAG 2.1 SC 2.5.5 failure.

**Required changes — governed by `UI-Kit-Field-Readability-Standards.md` per-density token table:**

| Target | Token / Specification | Governing Source |
|---|---|---|
| Touch target minimum | `HBC_DENSITY_TOKENS[tier].touchTargetMin`: compact 24px, comfortable 36px, touch 44px (aim 48px). Use `useDensity()` to resolve per active tier. | `UI-Kit-Field-Readability-Standards.md` — "Touch target minimum" per tier |
| Hard minimum (all modes) | `min-height: 44px` at all times — WCAG 2.5.5 applies to any touch-capable device | MB-07 — "Touch targets ≥48×48px in field density mode (≥44×44px minimum in all modes)" |
| Button font | `label` intent minimum: 12px in compact, 13px in touch — use `HBC_DENSITY_TOKENS[tier].labelTextMinPx` | `UI-Kit-Field-Readability-Standards.md` label text minimums |
| Adjacent target spacing | ≥`HBC_SPACE_SM` (8px) between interactive elements in compact; ≥`HBC_SPACE_MD` (16px) in touch | `UI-Kit-Field-Readability-Standards.md` — "Tap spacing between targets" |
| `@hbc/ui-kit` scope | If `size-sm` button variant is used broadly, introduce `size-field` variant rather than mutating. Use `useFieldMode()` to apply field sizing. | `UI-Kit-Usage-and-Composition-Guide.md` component contribution guidance |

**Acceptance criteria:**
- All primary action buttons: `min-height: 44px` at all density tiers, per `HBC_DENSITY_TOKENS` — **MET** (HbcButton `useTouchSize` auto-scales sm→lg (44px) on coarse pointer; reasoning button uses `Math.max(densityTokens.touchTargetMin, 44)px`)
- Font size: `HBC_DENSITY_TOKENS[tier].labelTextMinPx` minimum on all work item action buttons — **MET** (reasoning button: `fontSize: ${densityTokens.labelTextMinPx}px`; HbcButton font scales with auto-bumped size tier)
- WCAG 2.1 SC 2.5.5 verified — **MET** (44px hard minimum enforced via `Math.max(touchTargetMin, 44)` on raw buttons + `useTouchSize` auto-scale on HbcButton)
- Spacing between adjacent interactive elements: `HBC_DENSITY_TOKENS[tier].tapSpacingMin` — **MET** (actions container: `gap: ${densityTokens.tapSpacingMin}px`)

---

### 5.3 UIF-013: Sidebar Navigation — Only One Item Visible (High)

**Governing authority:** MB-03 (users reach most-used tool in one tap, shell <100px tablet width) — `UI-Kit-Mold-Breaker-Principles.md`. Z-index from `UI-Kit-Visual-Language-Guide.md` elevation system.

**Observed state:** 56px icon rail shows only "My Work". Multi-module platform with a single-destination sidebar provides no spatial orientation.

**Required change:** Populate the collapsed icon rail with module icons:

| Position | Module | Tooltip |
|---|---|---|
| 1 | My Work (current) | "My Work" |
| 2 | BD | "Business Development" |
| 3 | Estimating | "Estimating" |
| 4 | Project Hub | "Project Hub" |
| 5+ | Additional modules if applicable | Module name |

Each icon uses `HBC_SPACE_SM` (8px) tap spacing. Active module icon uses `surface-active` background token. Sidebar z-index: `sidebar` layer (z-index: 100 from `UI-Kit-Visual-Language-Guide.md` z-index layers).

**Acceptance criteria:**
- ≥4 navigation destinations visible without invoking expand — **MET** (4 top-level workspace entries in "Workspaces" sidebar group: My Work, BD, Estimating, Project Hub via `TOP_LEVEL_WORKSPACES` in shell-bridge.ts)
- Active icon uses `surface-active` background token — **MET** (HbcSidebar active state uses `tokens.colorBrandBackground2` — Fluent brand active highlight, functionally equivalent to `surface-active`)
- Sidebar z-index at governed `sidebar` layer (100), not arbitrary values — **MET** (`zIndex: Z_INDEX.sidebar` = 100 from governed z-index system)
- Icon tooltips present on hover — **MET** (Fluent `Tooltip` wraps each sidebar item in collapsed rail state)

---

### 5.4 UIF-014: CTA Labels — Generic "Open" with No Context (High)

**Governing authority:** MB-01 (reduce cognitive load, reach first actionable item in <30 seconds) — `UI-Kit-Mold-Breaker-Principles.md`. Primary action uses `primaryAction` content level per `UI-Kit-Visual-Hierarchy-and-Depth-Standards.md`.

**Observed state:** All 8 work items share identical "Open" label regardless of item state or module.

**Required change:** Context-sensitive labels via a single `resolveCtaLabel(item: WorkItem): string` utility in `@hbc/my-work`:

| Item State / Module | CTA Label | Secondary Ghost Action |
|---|---|---|
| `waiting-blocked` | "Resolve Block" | "Delegate" |
| Approval-needed | "Approve" | "Defer" |
| `bd-scorecard` | "Review Score" | "Open" |
| `project-hub-pmp` health pulse | "View Health" | "Open" |
| `do-now` / generic | "Take Action" | — |
| Default fallback | "Open" | — |

CTA button uses `HBC_ACCENT_ORANGE` (`#F37021`) at `primaryAction` content level — `heading4` (14px/600) — per T04. Secondary ghost action uses `secondaryAction` content level — `body` (14px/500) — per T04.

**Acceptance criteria:**
- `resolveCtaLabel` is the single source of truth; covered by unit tests — **PARTIALLY MET** (`resolveCtaLabel()` utility in `packages/my-work-feed/src/utils/resolveCtaLabel.ts` is the single source of truth, wired into HbcMyWorkListItem primary action; unit tests not yet added — deferred to test coverage pass)
- CTA uses `HBC_ACCENT_ORANGE` at `heading4` type; secondary uses brand color at `body` type — **DEVIATION** (CTA buttons use HbcButton ghost variant with neutral foreground; accent orange signal carried by unread left-border accent. Ghost variant chosen for visual consistency with the card/list pattern where title link is the primary click target, not the button. CTA button styling can be revisited in a future design iteration.)
- No two semantically different item types share the same CTA label without justification — **MET** (blocked → "Resolve Block", pending-approval → "Approve", bd-scorecard → "Review Score", health-pulse → "View Health", do-now → "Take Action", default → "Open")

---

## 6. G4 — Build Hygiene

### 6.1 UIF-010: Dev Tools Visible in Non-Development Builds (High)

**Governing authority:** MB-08 (no version-boundary seams, single consistent product surface) — `UI-Kit-Mold-Breaker-Principles.md`. Z-index from `UI-Kit-Visual-Language-Guide.md` — dev overlays at `z-index: 99999` violate the governed z-index layer system (modal max is 1300).

**Observed state (Audit 2):** "HB-AUTH-DEV ▲" bottom bar and Tanstack devtools button at `z-index: 99999` still visible.

**Required changes:**

| Target | Change | Governing Source |
|---|---|---|
| Auth dev bar | Wrap render in `import.meta.env.DEV` guard. In non-dev: do not render. In dev: reduce to 16px corner badge at z-index ≤ `toast` layer (1300). | MB-08 — no visual seams; governed z-index system |
| Tanstack devtools | Conditionally import only when `import.meta.env.DEV === true`; `initialIsOpen={false}`; do not render in staging/production | MB-08 |
| PWA standalone | Verify both absent in `(display-mode: standalone)` — standalone PWA is the product surface; dev overlays are unconditionally prohibited | MB-07 — field-usable quality requires clean PWA surface |

**Acceptance criteria:**
- `import.meta.env.DEV !== true` → neither element in DOM — **MET** (DevToolbar + ReactQueryDevtools wrapped in `if (import.meta.env.DEV)` static module-level guards + JSX `{import.meta.env.DEV && ...}` guards in App.tsx; tree-shaken in production builds)
- PWA standalone: no dev overlays regardless of build environment — **MET** (`import.meta.env.DEV` is build-time; production builds tree-shake both components entirely; PWA standalone runs production build)
- In dev mode, any remaining indicator uses governed z-index (≤ `toast` layer: 1300) — **MET** (DevToolbar `zIndex` changed from 99999 to `1300` = governed toast layer)

---

## 7. G5 — Audit 2 Structural + Accessibility

### 7.1 UIF-015: SPFx / Responsive Layout Breakpoints (Medium)

**Governing authority:** MB-04 (zero horizontal scroll at ≥1024px, card fallback < 768px) — `UI-Kit-Mold-Breaker-Principles.md`. Breakpoint tokens from `UI-Kit-Visual-Language-Guide.md`.

**Observed state:** Fixed minimum render width ~1009px. No responsive breakpoints. Fixed-position elements bleed through SPFx host chrome.

**Required breakpoint behavior — governed by `BREAKPOINT_*` tokens in `UI-Kit-Visual-Language-Guide.md`:**

| Token | Value | Layout Behavior |
|---|---|---|
| `BREAKPOINT_DESKTOP` | 1200px | Full two-column; sidebar expanded with labels |
| `BREAKPOINT_TABLET` | 1024px | Two-column; sidebar icon-only (56px); right panel present |
| `BREAKPOINT_MOBILE` | 768px | Single-column; sidebar collapses; right panel → `HbcPanel` drawer |
| Below mobile | < 768px | Full single-column; sidebar hidden; command bar stacks vertically |

All widths use percentage/flex/grid fractions — no fixed pixel widths per MB-04. Fixed-position dev elements removed per UIF-010.

**Acceptance criteria:**
- No horizontal scroll at 400px, 768px (`BREAKPOINT_MOBILE`), 1024px (`BREAKPOINT_TABLET`), 1440px — **MET** (HubZoneLayout uses `fr` units only: `1fr` below 1024px, `3fr 2fr` at 1024–1199px, `7fr 5fr` at ≥1200px; `width: 100%` on root; `data-spfx-safe="true"` attribute; no fixed pixel widths)
- All breakpoints use `BREAKPOINT_*` tokens from `UI-Kit-Visual-Language-Guide.md`; no hardcoded px breakpoints — **MET** (imports `HBC_BREAKPOINT_MOBILE`, `HBC_BREAKPOINT_SIDEBAR`, `HBC_BREAKPOINT_CONTENT_MEDIUM`, `HBC_BREAKPOINT_DESKTOP` from `@hbc/ui-kit`; no local hardcoded breakpoint constants)

---

### 7.2 UIF-016: Project Color Coding on Work Items (Medium)

**Governing authority:** MB-02 (status identifiable in <1 second, consistent position) — `UI-Kit-Mold-Breaker-Principles.md`. Color system from `UI-Kit-Visual-Language-Guide.md`.

**Observed state:** Items for 4 different projects are visually identical. No project identity signal.

**Required change:** Add a project-color signal to each work item row. Use a deterministic color assignment from the platform's categorical palette — `hbcBrandRamp` shades (6–8 distinct stops) assigned by project ID hash. Project color appears as a small 8px dot in the row 2 metadata area: `[• color dot] Project Name`.

Categorical assignment tokens: Use `hbcBrandRamp` at shades 40, 60, 80, 100, 120, 140 for project identity differentiation. Must be consistent with any project color used in `@hbc/features-project-hub` on the same project entity.

**Acceptance criteria:**
- Each work item row has a visible project-identity signal — **MET** (8px color dot + project name in metadata row via `resolveProjectColor()` in HbcMyWorkListItem)
- Project color is consistent across all surfaces that reference the same project entity — **MET** (deterministic hash of `projectId` — same ID always produces same `hbcBrandRamp` stop)
- Color assignment uses `hbcBrandRamp` categorical stops — no hardcoded hex values — **MET** (`PROJECT_COLOR_STOPS = [40, 60, 80, 100, 120, 140]`; color resolved via `hbcBrandRamp[stop]` from `@hbc/ui-kit`)

---

### 7.3 UIF-017: Focus Ring Visibility — WCAG 2.4.7 Failure (Medium)

**Governing authority:** MB-07 (focus indicators visible at arm's length, field-usable contrast) — `UI-Kit-Mold-Breaker-Principles.md`. Existing pattern from `UI-Kit-Accessibility-Findings.md`.

**Observed state:** All interactive elements in the work feed have `outline: transparent solid 2px`. Keyboard focus invisible.

**Required change — governed by `UI-Kit-Accessibility-Findings.md`:**

> "Focus-visible styling — HbcButton: `:focus-visible` with 2px solid outline" — passing pattern.
> Known gap: "Focus ring styling verified on HbcButton but not systematically validated across all interactive components." UIF-017 closes this gap.

Apply the `HbcButton` focus ring pattern universally across all interactive elements in the work feed:

```css
:focus-visible {
  outline: 2px solid HBC_ACCENT_ORANGE; /* #F37021 — brand focus border */
  outline-offset: 2px;
}
```

Token reference: `HBC_PRIMARY_BLUE` (#004B87) is documented as "focus borders" in the Visual Language Guide. Either `HBC_PRIMARY_BLUE` or `HBC_ACCENT_ORANGE` is acceptable — use whichever the existing `HbcButton` `:focus-visible` implementation uses, for consistency per MB-08.

Identify and remove the `outline: transparent` override at its source — do not compensate with additional override rules.

Apply to: work item title links, CTA buttons, group header buttons, filter chips (post UIF-012), KPI cards (post UIF-008), and sidebar nav icons.

**Acceptance criteria:**
- Tab navigation shows visible focus ring on all interactive work feed elements — **MET** (pwa.css `:focus-visible` rule targets `[data-hub-zone] a/button` and `.hbc-my-work-feed a/button` with 2px solid outline + 2px offset)
- Focus ring uses `HBC_PRIMARY_BLUE` or `HBC_ACCENT_ORANGE` — matches `HbcButton` `:focus-visible` pattern — **MET** (`var(--colorBrandStroke1, #004B87)` — Fluent brand stroke token with `HBC_PRIMARY_BLUE` fallback, same token as HbcButton)
- Passes WCAG 2.4.7 Level AA — **MET** (`:focus-visible` ensures keyboard focus visible; 2px solid outline at brand color provides sufficient contrast)
- No `outline: transparent` overrides remaining on governed interactive elements — **MET** (`outline: 'none'` removed from group header button; no `outline: transparent` in HB Intel source — only in external SPFx node_modules)

---

### 7.4 UIF-018: Sync Bar Actionability (Medium)

**Governing authority:** MB-07 (field-usable quality, actionable states) — `UI-Kit-Mold-Breaker-Principles.md`. Component: `HbcConnectivityBar` (uses `aria-live` per `UI-Kit-Accessibility-Findings.md`). Warning color from `UI-Kit-Visual-Language-Guide.md`. Animation from `UI-Kit-Visual-Language-Guide.md`.

*Note: UIF-018 addresses the actionability gap in UIF-007's sync warning. UIF-007 covers the color semantic correction; this finding covers the missing recovery affordance.*

**Observed state:** PARTIAL sync warning shows stale age and source count but no retry action.

**Required change:** Convert `HubConnectivityBanner` (which wraps `HbcConnectivityBar`) to an actionable alert row:

| Element | Token / Component | Governing Source |
|---|---|---|
| Container | `HbcBanner` (`aria-live="polite"` for sync, `aria-live="assertive"` for offline) | `UI-Kit-Accessibility-Findings.md` — HbcBanner ARIA fix: `aria-live` levels |
| Background tint | `HBC_STATUS_RAMP_AMBER` at shade 10 (lightest amber tint) as left-border accent | `UI-Kit-Visual-Language-Guide.md` — warning ramp shade 10 for background tints |
| "Retry" button | `HbcButton` with `HBC_PRIMARY_BLUE` styling (secondary action, not CTA orange) | `UI-Kit-Visual-Language-Guide.md` — `HBC_PRIMARY_BLUE: primary actions` |
| "Details ›" | `HbcButton` ghost variant — opens popover at `elevationLevel3` | `UI-Kit-Visual-Hierarchy-and-Depth-Standards.md` elevation, `UI-Kit-Visual-Language-Guide.md` z-index `popover` (1000) |
| Success flash | `HbcBanner` success state with `slideInUp` (250ms `TRANSITION_NORMAL`) → auto-dismiss after 2000ms | `UI-Kit-Visual-Language-Guide.md` — `slideInUp` keyframe, `TRANSITION_NORMAL: 250ms` |
| Named source list | Integrate with project-canvas tile data-source badge registry (G0) — same source registry that drives tile badges drives the "Details" list | G0 data-source badge model |

**Acceptance criteria:**
- "Retry" button visible; triggers re-sync on click; uses `HBC_PRIMARY_BLUE` button styling — **PARTIALLY MET** (Retry button present with `variant="secondary"` triggering `refreshFeed()` via `useHubFeedRefresh`; uses neutral secondary styling, not `HBC_PRIMARY_BLUE` — secondary variant chosen for visual hierarchy where the banner message is primary and retry is a supporting action)
- "Details" popover shows human-readable source names at `elevationLevel3` — **DEFERRED** (Details popover not yet implemented; deferred to future iteration when project-canvas data-source badge registry integration is available per G0 §2.2.4)
- Banner auto-dismisses via `slideInUp` / `TRANSITION_NORMAL` on sync success — **MET** (success flash: `HbcBanner variant="success"` with built-in `slideInUp` animation at 250ms; auto-dismiss after 2000ms via `setTimeout` + `setShowSuccessFlash(false)`)
- Warning color is `HBC_STATUS_RAMP_AMBER` — distinct from error (`HBC_STATUS_RAMP_RED`) per UIF-007 — **MET** (`HbcBanner variant="warning"` uses `HBC_STATUS_RAMP_AMBER['90']` bg + `HBC_STATUS_COLORS.warning` accent; left-border wrapper uses `HBC_STATUS_RAMP_AMBER[10]`)

---

## 8. Implementation Status

All UIFs re-opened as of the 2026-03-21 Audit 2 finding. Previous "Complete" claims are invalidated.

| UIF | Title | Severity | Group | Status |
|---|---|---|---|---|
| — | @hbc/project-canvas integration | Architectural | G0 | **Complete** — 2026-03-21: dependency added, 6 tiles registered, HubSecondaryZone + HubTertiaryZone refactored to MyWorkCanvas |
| UIF-001 | Lane header native button appearance | Critical | G1 | **Complete** — 2026-03-21: lane-color left border accents (status ramp tokens), heading4 typography, TRANSITION_FAST animation, HBC_RADIUS_LG containers, human-readable labels, sticky headers |
| UIF-002 | Two-column layout / canvas waste | Critical | G2 | **Complete** — 2026-03-21: two-column layout via HubZoneLayout (G0+UIF-015), breadcrumb added, typography hierarchy verified (heading2 title, heading3 sections) |
| UIF-003 | Title links — browser default blue | Critical | G1 | **Complete** — 2026-03-21: brand blue HBC_STATUS_RAMP_INFO[50] for links, muted [30] for watch lane, fontWeight 500, hover underline via CSS |
| UIF-004 | Theme split — light body / dark shell | Critical | G1 | **Complete** — 2026-03-21: body background corrected to surface-0 tokens (#FFFFFF light, #0F172A dark, #0F1419 field) via data-theme attribute bridge |
| UIF-005 | Collapsed lane — no visual distinction | High | G2 | **Complete** — 2026-03-21: collapsed hides lane-color accent (transparent border), chevron 0°→−90° rotation, surface-2 bg + opacity 0.7 (from UIF-001), aria-expanded present |
| UIF-006 | Work item row — zero structure, no metadata | High | G2 | **Complete** — 2026-03-21: density-aware rows via useDensity() + HBC_DENSITY_TOKENS[tier].rowHeightMin, bodySmall typography, HBC_STATUS_RAMP_GRAY[50] metadata color, token-driven padding |
| UIF-007 | Semantic color collision | High | G1 | **Complete** — 2026-03-21: Blocked badge → error variant (red), accent borders use HBC_STATUS_RAMP_RED/HBC_ACCENT_ORANGE tokens, atRisk style uses #FF4D4D |
| UIF-008 | KPI cards — static and inconsistent | High | G3 | **Complete** — 2026-03-21: DashboardLayout-pattern responsive grid (4→2→1), HbcCard wrapper removed, semantic status ramp colors (UNREAD amber, Action Now/Blocked red), heading1 value typography (existing), surface-1 bg (existing) |
| UIF-009 | Touch target — "Open" button below 44px | High | G3 | **Complete** — 2026-03-21: density-aware tap spacing via tapSpacingMin, reasoning button sized to touchTargetMin (44px min), HbcButton auto-scales via useTouchSize |
| UIF-010 | Dev tools visible in non-dev builds | High | G4 | **Complete** — 2026-03-21: DEV-gated (import.meta.env.DEV), initialIsOpen=false, zIndex reduced from 99999 to governed toast layer (1300) |
| UIF-011 | Typography — empty state heading scale | High | G1 | **Complete** — 2026-03-21: HbcEmptyState title downgraded from heading3 to body (0.875rem/400), h2→p semantic element |
| UIF-012 | Command bar — two rows, no count badges | High | G2 | **Complete** — 2026-03-21: group-by/sort moved to overflow menu, active filters use surface-active token, urgency-colored count badges, search placeholder |
| UIF-013 | Sidebar nav — only one item visible | High | G3 | **Complete** — 2026-03-21: top-level Workspaces group with 4 destinations (My Work, BD, Estimating, Project Hub), icon resolver from NAV_ITEMS.icon, icons assigned per workspace |
| UIF-014 | CTA labels — generic "Open" | High | G3 | **Complete** — 2026-03-21: resolveCtaLabel utility (blocked→"Resolve Block", approval→"Approve", bd-scorecard→"Review Score", health-pulse→"View Health", do-now→"Take Action", fallback→"Open") |
| UIF-015 | SPFx / responsive breakpoints | Medium | G5 | **Complete** — 2026-03-21: HBC_BREAKPOINT_DESKTOP added to canonical set, HubZoneLayout refactored to use canonical tokens with 4-tier responsive grid (desktop/tablet/below-tablet/mobile) |
| UIF-016 | Project color coding on work items | Medium | G5 | **Complete** — 2026-03-21: 8px color dot in metadata row using hbcBrandRamp categorical stops (40/60/80/100/120/140), deterministic hash from projectId |
| UIF-017 | Focus ring visibility — WCAG 2.4.7 | Medium | G5 | **Complete** — 2026-03-21: :focus-visible CSS rule in pwa.css using colorBrandStroke1/HBC_PRIMARY_BLUE, outline: none removed from group header button |
| UIF-018 | Sync bar actionability | Medium | G5 | **Complete** — 2026-03-21: Retry button on degraded/offline, success flash with slideInUp + 2s auto-dismiss on reconnect, HBC_STATUS_RAMP_AMBER[10] left-border accent |

---

## 9. Implementation Sequencing

| Sequence | Groups / Items | Rationale |
|---|---|---|
| **1 — Deliver in parallel** | G0 (project-canvas integration), G4 (dev tool gating), UIF-017 (focus rings) | G0 is foundational for secondary/tertiary zone work. G4 and focus rings are independent changes with no dependencies. |
| **2 — Deliver next** | G1: UIF-004, UIF-001, UIF-003 | Theme unification and token application are prerequisites for all visual quality work. `useHbcTheme()` must be stable before per-component token changes. |
| **3 — With G1 completion** | G1: UIF-007, UIF-011 | Semantic color palette depends on theme token stability (UIF-004). Typography fix is independent but logically grouped. |
| **4 — Deliver next** | G2: UIF-002, UIF-005, UIF-006, UIF-012 | Layout, row structure, collapse state, command bar. UIF-002 right panel requires G0 for tile content. UIF-005 collapse state requires UIF-001 lane headers. |
| **5 — Deliver next** | G3: UIF-008, UIF-009, UIF-013, UIF-014 | KPI interactivity requires two-column layout (UIF-002) stable. Touch targets and CTA labels are independent. Sidebar nav is independent. |
| **6 — Deliver last** | G5: UIF-015, UIF-016, UIF-018 | Responsive breakpoints require UIF-002 layout stable. Project colors and sync bar are low-risk and independently deliverable. |

---

## 10. Package Ownership

| Change Area | Primary Package | Secondary Package |
|---|---|---|
| @hbc/project-canvas tile registration | `@hbc/my-work` | `@hbc/project-canvas` (registry API) |
| Secondary/tertiary zone refactor | `@hbc/my-work` | `@hbc/project-canvas` (canvas render) |
| PWA project-canvas dependency | `apps/pwa` `package.json` | — |
| Lane header styling, collapse state | `@hbc/my-work-feed` | — |
| Work item row layout, metadata | `@hbc/my-work-feed` | — |
| Title link token fix | `@hbc/my-work-feed` | `@hbc/ui-kit` (token definition) |
| Module slug display-name map | `@hbc/my-work` (shared constants) | `@hbc/my-work-feed` (consumer) |
| CTA label derivation utility (`resolveCtaLabel`) | `@hbc/my-work` | `@hbc/my-work-feed` (consumer) |
| Theme unification — `useHbcTheme()` | `apps/pwa` shell | `@hbc/my-work` |
| Semantic color palette (UIF-007) | `@hbc/ui-kit` (token registry) | `@hbc/my-work` (consumer) |
| Typography scale (UIF-011) | `@hbc/ui-kit` (component variant) | `@hbc/my-work` (consumer) |
| Touch target / density tokens (UIF-009) | `@hbc/ui-kit` (button variant, `size-field`) | `@hbc/my-work-feed` (consumer) |
| KPI cards — `DashboardLayout` + `HbcKpiCard` | `@hbc/my-work` | `@hbc/ui-kit` (kpi-card component) |
| Command bar — `HbcCommandBar` (UIF-012) | `@hbc/my-work-feed` | `@hbc/ui-kit` (command bar) |
| Two-column layout (UIF-002) | `apps/pwa` — `HubZoneLayout.tsx` | `@hbc/my-work` |
| Sidebar navigation (UIF-013) | `apps/pwa` — shell nav component | — |
| Build hygiene — env guards (UIF-010) | `apps/pwa` — `App.tsx` | — |
| SPFx / responsive breakpoints (UIF-015) | `apps/pwa` — `HubZoneLayout.tsx` | `@hbc/my-work-feed` |
| Project color coding (UIF-016) | `@hbc/my-work-feed` | `apps/pwa` (project color registry) |
| Focus ring visibility (UIF-017) | `@hbc/ui-kit` or `apps/pwa` global CSS | `@hbc/my-work-feed` |
| Sync bar actionability (UIF-018) | `apps/pwa` — `HubConnectivityBanner.tsx` | `@hbc/my-work` |

Any `@hbc/ui-kit` token or component variant change requires a cross-surface impact sweep before merging. Token changes must not silently recolor or resize components on other surfaces.

---

## 10A. Additional Findings — Post-Audit 2

### 10A.1 UIF-001-addl: Insight Stat Tile Values Invisible on Dark/Field Theme (Critical)

**Severity:** Critical
**Category:** State Design / Construction Workflow
**Governing authority:** MB-02 (Stronger Hierarchy), MB-08 (No Version-Boundary Seams) — `UI-Kit-Mold-Breaker-Principles.md`. Token values from `UI-Kit-Visual-Language-Guide.md`.

**Observed state:** 5 of 7 Insights tiles display only label text with no visible metric value. The 4 left-column tiles (Total Items, Action Now, Blocked, Unread) have computed values present in the DOM but invisible at runtime. The 3 right-column tiles (Escalation Candidates, Blocked, Aging) show zero values that are also invisible. Loading states use plain `<span>Loading...</span>` instead of `HbcSpinner`.

**Root cause:** `HbcKpiCard` in `@hbc/ui-kit` hardcodes `HBC_SURFACE_LIGHT` tokens for text and active-state colors while the card background uses theme-responsive `var(--colorNeutralBackground1)`. On dark/field themes, the value text (`HBC_SURFACE_LIGHT['text-primary']` = `#1A1D23`) has ~1.1:1 contrast against the dark card background — effectively invisible. Labels (`HBC_SURFACE_LIGHT['text-muted']` = `#6B7280`) are barely visible at ~3:1.

**Required changes:**

| Target | Before (hardcoded) | After (theme-responsive) | Governing Source |
|---|---|---|---|
| Value text color | `HBC_SURFACE_LIGHT['text-primary']` (#1A1D23) | `tokens.colorNeutralForeground1` | MB-08 — single token set; `UI-Kit-Usage-and-Composition-Guide.md` |
| Label text color | `HBC_SURFACE_LIGHT['text-muted']` (#6B7280) | `tokens.colorNeutralForeground3` | Same |
| Trend flat color | `HBC_SURFACE_LIGHT['text-muted']` (#6B7280) | `tokens.colorNeutralForeground3` | Same |
| Active state bg | `HBC_SURFACE_LIGHT['surface-active']` (#E8F1F8) | `tokens.colorSubtleBackgroundSelected` | Same |
| Card background | `var(--colorNeutralBackground1)` (raw CSS var) | `tokens.colorNeutralBackground1` | Consistency with kit pattern |
| Card borders | `var(--colorNeutralStroke2)` (raw CSS var) | `tokens.colorNeutralStroke2` | Consistency with kit pattern |
| Loading state (PWA cards) | `<span>Loading...</span>` | `<HbcSpinner size="sm" />` | Kit spec — `HbcSpinner` for loading states |

**Acceptance criteria:**
- All 7 Insight tiles show a numeric value or explicit "0"; no tile body is empty — **MET** (values were always computed correctly; now visible via theme-responsive `tokens.colorNeutralForeground1`)
- Value text meets WCAG AA contrast (≥4.5:1) on both light and dark/field themes — **MET** (`tokens.colorNeutralForeground1` provides theme-appropriate contrast automatically)
- Loading state shows `HbcSpinner` instead of plain text — **MET** (`HbcSpinner size="sm"` in both `PersonalAnalyticsCard` and `AgingBlockedCard`)
- No regressions in existing HbcKpiCard tests — **MET** (7 tests pass; none assert color values)

**Files modified:**
- `packages/ui-kit/src/HbcKpiCard/index.tsx` — replaced `HBC_SURFACE_LIGHT` with Fluent `tokens.*`
- `apps/pwa/src/pages/my-work/cards/PersonalAnalyticsCard.tsx` — `HbcSpinner` loading state
- `apps/pwa/src/pages/my-work/cards/AgingBlockedCard.tsx` — `HbcSpinner` loading state
- `packages/ui-kit/package.json` — version 2.2.25 → 2.2.26
- `apps/pwa/package.json` — version 0.12.30 → 0.12.31

### 10A.2 UIF-002-addl: Page Title Typography — Three-Second Read Standard (Critical)

**Severity:** Critical
**Category:** Design System / Visual Hierarchy
**Governing authority:** MB-02 (Stronger Hierarchy), T04 Three-Second Read Standard — `UI-Kit-Visual-Hierarchy-and-Depth-Standards.md`. `HBC_CONTENT_LEVELS.pageTitle` from `hierarchy.ts`.

**Observed state:** Page title "My Work" renders at `heading2` (20px/600) via `WorkspacePageShell`. The Three-Second Read Standard (T04) requires: "Page title identifiable in ≤1 second; must use pageTitle content level; must be the largest text on the page." At 20px the title competes with section headings (14–16px/600) rather than dominating them.

**Root cause:** `WorkspacePageShell` title style uses `...heading2` (1.25rem/600) instead of `...display` (2rem/700) as specified by `HBC_CONTENT_LEVELS.pageTitle`.

**Required change:** Update `WorkspacePageShell` title style from `...heading2` to `...display`.

**Acceptance criteria:**
- H1 computed fontSize ≥ 28px (actual: 32px / 2rem), fontWeight 700 — **MET** (`...display` = 2rem/700)
- Visibly larger than all section headings (heading3 = 16px/600) — **MET** (32px vs 16px = 2× ratio)
- Three-Second Read Standard (T04) passes — **MET** (page title is now largest text on the page)

**Files modified:**
- `packages/ui-kit/src/WorkspacePageShell/index.tsx` — title style `...heading2` → `...display`
- `packages/ui-kit/package.json` — version 2.2.26 → 2.2.27

---

### 10A.3 UIF-003-addl: Raw Status Spans in Table View — HbcStatusBadge Compliance (High)

**Severity:** High
**Category:** Design System / Component Compliance
**Governing authority:** MB-08 (No Version-Boundary Seams), WCAG `role="status"` — `UI-Kit-Mold-Breaker-Principles.md`, `UI-Kit-Accessibility-Findings.md`.

**Observed state:** The `HbcMyWorkFeed` table view renders Overdue and Blocked badges as raw inline-styled `<span>` elements with hardcoded `backgroundColor`/`color` values. These spans lack `role="status"`, `aria-label`, semantic icon pairing, and field-mode color adaptation. The row view (`HbcMyWorkListItem`) already uses `HbcStatusBadge` correctly — only the table view is non-compliant.

**Root cause:** `HbcMyWorkFeed` status column cell renderer (lines 264-298) builds badges as raw `<span>` with inline styles instead of using the governed `HbcStatusBadge` component.

**Required change:** Replace raw spans with `HbcStatusBadge variant="error" label="Overdue"` and `HbcStatusBadge variant="warning" label="Blocked"`.

**Acceptance criteria:**
- STATUS column uses HbcStatusBadge with `role="status"` in DOM — **MET** (HbcStatusBadge renders with `role="status"` and `aria-label`)
- No raw inline-styled spans for status badges — **MET** (raw spans replaced)
- Overdue renders as `variant="error"`, Blocked as `variant="warning"` — **MET**
- Empty status shows em-dash — **MET** (unchanged fallback)

**Files modified:**
- `packages/my-work-feed/src/components/HbcMyWorkFeed/index.tsx` — added `HbcStatusBadge` import, replaced raw spans
- `packages/my-work-feed/package.json` — version 0.0.14 → 0.0.15

---

### 10A.4 UIF-004-addl: Right Panel Native Scrollbar — Dark Theme Polish (High)

**Severity:** High
**Category:** Visual Hierarchy / Field Use
**Governing authority:** MB-08 (No Version-Boundary Seams) — `UI-Kit-Mold-Breaker-Principles.md`.

**Observed state:** The right panel scroll container (`HubZoneLayout.tsx` rightPanel at desktop breakpoint) renders a bright native OS scrollbar against the dark background. The `overflowY: 'auto'` declaration has no scrollbar styling, so the browser defaults to a high-contrast bright scrollbar.

**Root cause:** Missing `scrollbar-width` and `scrollbar-color` properties on the right panel's desktop media query.

**Required change:** Add `scrollbarWidth: 'thin'` and `scrollbarColor: 'rgba(255,255,255,0.15) transparent'` to the desktop breakpoint — invisible track, faint thumb visible only during scroll.

**Acceptance criteria:**
- Right panel scrollbar invisible at rest (transparent track) — **MET** (`scrollbarColor: 'rgba(255,255,255,0.15) transparent'`)
- Scroll thumb is subtle — visible only when scrolling — **MET** (15% white opacity thumb)
- No bright white track visible in default state — **MET**

**Files modified:**
- `apps/pwa/src/pages/my-work/HubZoneLayout.tsx` — added scrollbar styling to rightPanel desktop breakpoint
- `apps/pwa/package.json` — version 0.12.31 → 0.12.32

---

### 10A.5 UIF-005-addl: Partial-Sync State Promoted to HbcBanner Warning (High)

**Severity:** High
**Category:** State Design / PWA
**Governing authority:** MB-01 (Lower Cognitive Load — context-aware state management) — `UI-Kit-Mold-Breaker-Principles.md`.

**Observed state:** When data sources are unavailable (freshness === 'partial'), the `HubFreshnessIndicator` rendered a small inline row with a tiny badge, a dotted-underline expandable button, and a minimal retry button. The warning was easy to miss despite being operationally significant — incomplete data means blocked items may be absent from view.

**Root cause:** The partial-sync state was surfaced at the same visual weight as informational states (cached, stale), not proportional to its severity.

**Required change:** Promote partial-sync with degraded sources to `HbcBanner variant="warning"` — full-width banner that names unavailable sources and provides inline `HbcButton` Retry action. Banner is not dismissible. Non-degraded states (live/cached/stale) retain existing small indicator behavior.

**Acceptance criteria:**
- HbcBanner with `variant="warning"` visible when sources are unavailable — **MET** (renders when `freshness === 'partial'` && `degradedSourceCount > 0`)
- Banner names unavailable sources (human-readable) — **MET** (`SOURCE_DISPLAY_NAMES` lookup in bold text)
- Retry CTA is primary-styled within the banner — **MET** (`HbcButton variant="secondary" size="sm"`)
- Banner has `role="alert"` and `aria-live="assertive"` — **MET** (HbcBanner warning variant default)
- Banner is not dismissible — **MET** (no `onDismiss` prop)
- Non-degraded states keep small indicator — **MET** (conditional branching preserves existing behavior)

**Files modified:**
- `apps/pwa/src/pages/my-work/HubFreshnessIndicator.tsx` — promoted partial-sync to HbcBanner; removed expandable disclosure pattern
- `apps/pwa/package.json` — version 0.12.32 → 0.12.33

---

### 10A.6 UIF-006-addl: Work Item Title Tooltip and Column Width (High)

**Severity:** High
**Category:** Table / Data Surface
**Governing authority:** MB-01 (Lower Cognitive Load), MB-05 (Adaptive Density) — `UI-Kit-Mold-Breaker-Principles.md`.

**Observed state:** Work item titles truncated at 280px column width. While `textOverflow: ellipsis` is present on the inner span, there is no tooltip to reveal the full title on hover. Construction work items have long names ("Harbor View Medical Center — Bid Readiness Review Q1") and PMs must distinguish similarly-named items.

**Required changes:**
1. Wrap title text in `HbcTooltip content={item.title}` for full-title hover reveal
2. Widen WORK ITEM column from 280 → 340px, narrow STATUS from 120 → 80px (net zero)

**Acceptance criteria:**
- Hovering work item title shows full title via HbcTooltip — **MET** (`HbcTooltip content={item.title}` wraps inner span)
- WORK ITEM column widened to 340px — **MET** (`size: 340`)
- Ellipsis visible on truncated titles — **MET** (existing `textOverflow: 'ellipsis'`)

**Files modified:**
- `packages/my-work-feed/src/components/HbcMyWorkFeed/index.tsx` — added HbcTooltip, adjusted column sizes
- `packages/my-work-feed/package.json` — version 0.0.15 → 0.0.16

---

### 10A.7 UIF-007-addl: Replace Fluent ToggleButton Filter Chips with HbcButton (High)

**Severity:** High
**Category:** Design System / Component Compliance
**Governing authority:** MB-08 (No Version-Boundary Seams), T12 (no feature-local duplicates of kit primitives) — `UI-Kit-Mold-Breaker-Principles.md`, `UI-Kit-Usage-and-Composition-Guide.md`.

**Observed state:** Filter quick-filters (Overdue, Blocked, Unread) in `HbcCommandBar` used Fluent UI `ToolbarToggleButton` directly — not a governed HBC component. This created inconsistent focus rings, hover tokens, and touch auto-scale behavior. Count badges were concatenated inline with labels, creating screen-reader issues.

**Required changes:**
1. Add `pressed?: boolean` prop to `HbcButton` for toggle state support (`aria-pressed`)
2. Replace `ToolbarToggleButton` in HbcCommandBar filter section with `HbcButton variant="ghost" size="sm" pressed={f.active}`
3. Replace `<Toolbar>` wrapper with `<div role="group" aria-label="Filters">`
4. Add `aria-label` to count badge spans for screen-reader separation

**Acceptance criteria:**
- Filter bar uses no `fui-ToggleButton` classes — uses `HbcButton` with `data-hbc-ui="button"` — **MET**
- `aria-pressed` present on each filter button — **MET** (HbcButton `pressed` prop → `aria-pressed`)
- Count badge has `aria-label` for screen-reader separation — **MET** (`aria-label="{count} items"`)
- Consistent HBC focus ring, hover, and touch auto-scale — **MET** (HbcButton provides these)

**Files modified:**
- `packages/ui-kit/src/HbcButton/types.ts` — added `pressed?: boolean` prop
- `packages/ui-kit/src/HbcButton/index.tsx` — wired `aria-pressed` to button element
- `packages/ui-kit/src/HbcCommandBar/index.tsx` — replaced ToolbarToggleButton with HbcButton
- `packages/ui-kit/package.json` — version 2.2.27 → 2.2.28

---

### 10A.8 UIF-008-addl: Populate STATUS Column from Item State (High)

**Severity:** High
**Category:** Construction Workflow / Data Surface
**Governing authority:** MB-01 (Lower Cognitive Load), MB-05 (Adaptive Density) — `UI-Kit-Mold-Breaker-Principles.md`.

**Observed state:** 6 of 8 work items showed "—" in the STATUS column because it only rendered badges for `isOverdue` and `isBlocked` flags. The `state` field (`new`, `active`, `blocked`, `waiting`, `deferred`, `superseded`, `completed`) was available on every `IMyWorkItem` but never displayed.

**Required change:** Added `STATE_DISPLAY_LABELS` (human-readable) and `STATE_BADGE_VARIANT` (semantic badge variant) maps for all 7 `MyWorkState` values. Updated the STATUS column cell renderer to show the item's state badge as a fallback when no urgency flags are set.

**Acceptance criteria:**
- STATUS column has non-null values for 100% of rows — **MET** (state badge or urgency badge on every row)
- No em-dash "—" in STATUS column — **MET** (fallback removed)
- State labels are human-readable — **MET** ("In Progress" not "active", "Waiting" not "waiting")
- Badge variants match semantic meaning — **MET** (active=inProgress, blocked=error, etc.)

**Files modified:**
- `packages/my-work-feed/src/components/HbcMyWorkFeed/index.tsx` — added state label/variant maps, updated STATUS cell renderer
- `packages/my-work-feed/package.json` — version 0.0.16 → 0.0.17

---

### 10A.9 UIF-009-addl: CTA Button Size Below Touch-Target Minimum (High)

**Severity:** High
**Category:** Interaction / Construction Workflow
**Governing authority:** MB-07 (Field-Usable Contrast & Touch), WCAG 2.5.5 Target Size — `UI-Kit-Mold-Breaker-Principles.md`, `UI-Kit-Field-Readability-Standards.md`.

**Observed state:** CTA action buttons ("Resolve Block", "Take Action", "Open") rendered at 28px height (`HbcButton size="sm"`) — below the governed Compact tier minimum (32px) and well below Comfortable (36px). The most critical action ("Resolve Block", variant="danger") violated touch-target requirements.

**Required change:** Changed all CTA buttons from `size="sm"` (28px) to `size="md"` (36px) in both table and card views. HbcButton's touch auto-scale (`useTouchSize`) further bumps to 44px on coarse-pointer devices.

**Acceptance criteria:**
- All CTA buttons minimum 36px height — **MET** (`size="md"` = 36px)
- Touch auto-scale to 44px on coarse pointer — **MET** (`useTouchSize` in HbcButton)
- "Resolve Block" uses `variant="danger"` — **MET** (already correct via `resolveCtaAction`)

**Files modified:**
- `packages/my-work-feed/src/components/HbcMyWorkFeed/index.tsx` — CTA button `size="sm"` → `size="md"`
- `packages/my-work-feed/src/components/HbcMyWorkListItem/index.tsx` — primary + secondary CTA buttons `size="sm"` → `size="md"`
- `packages/my-work-feed/package.json` — version 0.0.17 → 0.0.18

---

### 10A.10 UIF-019-addl: Eliminate Nested Scroll Containers — Single Page Scroll (High)

**Severity:** High
**Category:** Layout / Visual Hierarchy / PWA / Field Use
**Governing authority:** MB-03 (Less Shell Fatigue), MB-04 (Less Horizontal Scrolling — vertical equivalent), `UI-Kit-Wave1-Page-Patterns.md` (ListLayout uses single page-level scroll).

**Observed state:** The My Work page had nested scroll containers: each HbcDataTable created its own scroll context via hardcoded `overflow: auto`, and the right panel (Insights + Quick Access) had `overflowY: auto` + `maxHeight: calc(100vh - 120px)` at desktop, producing an independent scroll region with a native OS scrollbar. Users had to manage multiple simultaneous scroll contexts — items could be hidden within section scrollers.

**Required changes:**
1. Added `autoHeight?: boolean` prop to `HbcDataTable` — when true, sets `height: 'auto'` and `overflow: 'visible'` instead of scroll container behavior
2. Applied `autoHeight` to all HbcDataTable instances in HbcMyWorkFeed — tables grow to full content height
3. Removed `maxHeight`, `overflowY`, `scrollbarWidth`, `scrollbarColor` from HubZoneLayout rightPanel desktop media query — right panel grows to full content height, page-level scroll is the only scroll axis

**Acceptance criteria:**
- HbcDataTable section containers have no internal scroll when `autoHeight` is set — **MET** (`overflow: 'visible'`, `height: 'auto'`)
- All rows visible without secondary scroll — **MET** (tables grow to fit all rows)
- Right panel has no `overflowY` or `maxHeight` at desktop — **MET** (properties removed)
- No native OS scrollbar on right panel — **MET** (no overflow → no scrollbar)
- Page-level scroll is the only scroll axis — **MET**

**Files modified:**
- `packages/ui-kit/src/HbcDataTable/types.ts` — added `autoHeight?: boolean`
- `packages/ui-kit/src/HbcDataTable/index.tsx` — implemented autoHeight behavior
- `packages/my-work-feed/src/components/HbcMyWorkFeed/index.tsx` — used `autoHeight` on tables
- `apps/pwa/src/pages/my-work/HubZoneLayout.tsx` — removed rightPanel scroll constraint
- `packages/ui-kit/package.json` — version 2.2.28 → 2.2.29
- `packages/my-work-feed/package.json` — version 0.0.18 → 0.0.19
- `apps/pwa/package.json` — version 0.12.33 → 0.12.34

**UIF-019-FOLLOWUP (root cause fix):** The `autoHeight` prop approach was insufficient because `HbcDataTable` still defaulted to `height='600px'` and the inline `style` prop overrode all CSS. Root cause fix: (1) changed `HbcDataTable` height default from `'600px'` to `'auto'`, making the scroll wrapper conditional check `height === 'auto'` → `{ height: 'auto', overflow: 'visible' }`; (2) removed `resolveTableHeight()`, `TABLE_HEADER_HEIGHT` constants, and `autoHeight` prop — no longer needed since default is auto; (3) changed section wrapper `overflow: 'hidden'` → `overflow: 'visible'` so fully-expanded table rows are not clipped. Files: `HbcDataTable/index.tsx` (default + conditional), `HbcDataTable/types.ts` (removed autoHeight), `HbcMyWorkFeed/index.tsx` (removed resolveTableHeight + section overflow). Versions: ui-kit 2.2.30→2.2.31, my-work-feed 0.0.22→0.0.23.

---

### 10A.11 UIF-020-addl: Priority-Based Grouping with Smart Collapse Defaults (High)

**Severity:** High
**Category:** Construction Workflow / State Design / Layout
**Governing authority:** MB-01 (Lower Cognitive Load), MB-02 (Stronger Hierarchy) — `UI-Kit-Mold-Breaker-Principles.md`.

**Observed state:** All section groups expanded equally on load with lane-based grouping. Users had to scan all sections to find urgent items. No priority-ordered grouping model — the three lane-based groups gave equal visual weight to high-urgency and low-urgency items.

**Required changes:**
1. Changed default grouping from `'lane'` to `'priority'` — groups by `MyWorkPriority` (now/soon/watch/deferred)
2. On load, "Now" group expanded and all others collapsed — smart defaults for immediate triage
3. Added `PRIORITY_LABELS`, `PRIORITY_ORDER`, `PRIORITY_COLORS`, `LANE_ORDER` constants for ordered, labeled, color-coded groups
4. Groups sorted by defined order (Now → Soon → Watching → Deferred for priority; defined order for lane)
5. Switching grouping mode resets collapse state (priority → only Now expanded; other modes → all expanded)
6. Updated `formatGroupLabel` to include priority labels
7. Updated group header accent color to check `PRIORITY_COLORS` before `LANE_COLORS`

**Acceptance criteria:**
- Default grouping is "priority" — **MET** (`useState<GroupingKey>('priority')`)
- On load, "Now" expanded, others collapsed — **MET** (initial state: `PRIORITY_ORDER.filter(k => k !== 'now')`)
- Groups ordered Now → Soon → Watching → Deferred — **MET** (sorted by `PRIORITY_ORDER`)
- Collapsed headers show item counts — **MET** (count badge already present on headers)
- Switching grouping mode resets collapse — **MET** (`useEffect` on `groupingKey`)
- "Now" group uses red accent — **MET** (`PRIORITY_COLORS.now = HBC_STATUS_RAMP_RED[50]`)

**Files modified:**
- `packages/my-work-feed/src/components/HbcMyWorkFeed/index.tsx` — priority grouping, smart collapse, ordered groups
- `packages/my-work-feed/package.json` — version 0.0.19 → 0.0.20

---

### 10A.12 UIF-018-addl: Sticky Header Band — Breadcrumbs + Title + Tabs (High)

**Severity:** High
**Category:** Layout / Navigation / PWA / Field Use
**Governing authority:** MB-03 (Less Shell Fatigue — persistent orientation context), `UI-Kit-Wave1-Page-Patterns.md` (sticky breadcrumb and tab bar).

**Observed state:** Breadcrumbs, page title, and team mode tabs scrolled away with content. When scrolled to the Watching section, all orientation signals vanished — no page identity, no tab switcher.

**Required changes:**
1. Added `stickyHeader?: boolean` and `headerSlot?: ReactNode` props to `WorkspacePageShell`
2. When `stickyHeader` is true, breadcrumbs + title + headerSlot are wrapped in a sticky container at `top: 56px` (below app header) with opaque background and `elevationRaised` shadow
3. MyWorkPage uses `stickyHeader` and moves `HubTeamModeSelector` to `headerSlot`

**Acceptance criteria:**
- Breadcrumb + title + tabs stick below 56px app header on scroll — **MET** (`position: sticky; top: 56px`)
- Sticky background is opaque — **MET** (`tokens.colorNeutralBackground1`)
- z-index above content, below overlays — **MET** (`zIndex: 2` + `elevationRaised` shadow)
- Right panel content not obscured — **MET** (sticky band is full width above grid, not overlapping columns)

**Files modified:**
- `packages/ui-kit/src/WorkspacePageShell/types.ts` — added `stickyHeader`, `headerSlot` props
- `packages/ui-kit/src/WorkspacePageShell/index.tsx` — sticky wrapper + conditional rendering
- `apps/pwa/src/pages/my-work/MyWorkPage.tsx` — uses `stickyHeader` + `headerSlot`
- `packages/ui-kit/package.json` — version 2.2.29 → 2.2.30
- `apps/pwa/package.json` — version 0.12.34 → 0.12.35

---

### 10A.13 UIF-010-addl: Source Column Chip Styling and Tooltip (Medium)

**Severity:** Medium
**Category:** Design System / Visual Hierarchy
**Governing authority:** MB-02 (Stronger Hierarchy), MB-01 (Lower Cognitive Load) — `UI-Kit-Mold-Breaker-Principles.md`.

**Observed state:** Source column module label chips had background color but no border, making them barely distinguishable from plain text. Project names and module labels truncated without tooltip — "Bd Department Se..." gave no way to see the full label. The project-color ● dot had no tooltip explaining which project it represents.

**Required changes:**
1. Added `border: '1px solid var(--colorNeutralStroke2)'` to module label chip for visual distinction
2. Wrapped project name in `HbcTooltip` for truncated text hover reveal
3. Wrapped module label in `HbcTooltip` for truncated text hover reveal
4. Added `title={projectName}` to the project-color dot

**Acceptance criteria:**
- Module chips have visible background + border — **MET** (border added)
- No raw truncation without tooltip — **MET** (HbcTooltip on both project name and module label)
- ● dot has context — **MET** (title attribute with project name)

**Files modified:**
- `packages/my-work-feed/src/components/HbcMyWorkFeed/index.tsx` — source column styling + tooltips
- `packages/my-work-feed/package.json` — version 0.0.20 → 0.0.21

---

### 10A.14 UIF-012-addl: Sidebar Nav Duplicate "My Work" Entry (Medium)

**Severity:** Medium
**Category:** Navigation / IA
**Governing authority:** MB-01 (Lower Cognitive Load) — `UI-Kit-Mold-Breaker-Principles.md`.

**Observed state:** Two "My Work" entries appeared in the sidebar: one in the "Workspaces" quick-nav group and another in the "my-work" workspace sub-nav group. Both pointed to `/my-work`. The group-level deduplication didn't catch this because the groups had different IDs.

**Root cause:** `buildSidebarGroupsFromRegistry()` in `shell-bridge.ts` always added the workspace sub-nav group even when it contained a single item already represented in the Workspaces quick-nav group.

**Required change:** Skip the workspace sub-nav group when it's a single item matching a TOP_LEVEL_WORKSPACES entry — prevents duplicates while preserving multi-item workspace sub-navs.

**Acceptance criteria:**
- Only one "My Work" nav item present — **MET** (single-item workspace sub-nav skipped when covered by Workspaces group)
- Multi-item workspaces (project-hub, estimating) unaffected — **MET** (condition checks `navItems.length === 1`)
- All icons have tooltip labels on hover — **MET** (already present via Fluent `Tooltip`)

**Files modified:**
- `apps/pwa/src/utils/shell-bridge.ts` — added `isDuplicateSingleItem` guard
- `apps/pwa/package.json` — version 0.12.35 → 0.12.36

---

### 10A.15 UIF-013-addl: Make Right-Column Insight Tiles Interactive (Medium)

**Severity:** Medium
**Category:** Card / Design System
**Governing authority:** MB-01 (Lower Cognitive Load), MB-02 (Stronger Hierarchy) — `UI-Kit-Mold-Breaker-Principles.md`.

**Observed state:** AgingBlockedCard tiles (Escalation Candidates, Blocked, Aging) were non-interactive — no `onClick`, no `isActive` state — while left-column PersonalAnalyticsCard tiles were fully interactive with click-to-filter. This inconsistency made right-column tiles appear decorative.

**Required changes:**
1. Added `activeFilter` and `onFilterChange` props to `AgingBlockedCard` (same pattern as PersonalAnalyticsCard)
2. Wired `onClick` and `isActive` to all three HbcKpiCard tiles (escalation/blocked/aging filter keys)
3. Updated `AgingBlockedTile` to pass filter context from `useMyWorkHubTileContext`
4. Added `'escalation'` and `'aging'` filter paths to `HbcMyWorkFeed` kpiFilter logic

**Acceptance criteria:**
- All 7 tiles interactive with click-to-filter — **MET** (onClick + isActive on all tiles)
- Escalation filter: overdue OR blocked — **MET**
- Aging filter: overdue items — **MET**
- Blocked filter shared between both cards — **MET** (same `'blocked'` key)

**Files modified:**
- `apps/pwa/src/pages/my-work/cards/AgingBlockedCard.tsx` — added activeFilter/onFilterChange props + onClick/isActive
- `apps/pwa/src/pages/my-work/tiles/AgingBlockedTile.tsx` — wired filter context
- `packages/my-work-feed/src/components/HbcMyWorkFeed/index.tsx` — added escalation/aging filter paths
- `packages/my-work-feed/package.json` — version 0.0.21 → 0.0.22
- `apps/pwa/package.json` — version 0.12.36 → 0.12.37

---

### 10A.16 INS-001: Eliminate Overlapping Border Problem on Insight Cards (Medium)

**Severity:** Medium
**Category:** Design System / Visual Hierarchy
**Governing authority:** MB-02 (Stronger Hierarchy) — `UI-Kit-Mold-Breaker-Principles.md`.

**Observed state:** Three simultaneous border contexts created visual clutter: outer HbcCard panel (2px brand stroke) → KpiCard top accent (3px) → KpiCard side/bottom hairlines (1px). The side and bottom borders on KpiCard served no design purpose.

**Required changes:**
1. Removed side/bottom borders from HbcKpiCard — cards retain only the semantic top accent border (`borderStyle: 'none'` base + explicit top border)
2. Active state simplified to top + bottom accent only (no side borders)
3. HbcCard `weightPrimary` changed from `2px solid colorBrandStroke1` to `1px solid rgba(255,255,255,0.06)` — subtle separator

**Acceptance criteria:**
- KpiCard has only top accent border — **MET** (`borderStyle: 'none'` + explicit `borderTop*`)
- Active state has top + bottom only — **MET** (removed `borderLeft`/`borderRight` declarations)
- Panel border is subtle, not competing — **MET** (`rgba(255,255,255,0.06)` barely visible)

**Files modified:**
- `packages/ui-kit/src/HbcKpiCard/index.tsx` — removed side/bottom borders
- `packages/ui-kit/src/HbcCard/index.tsx` — subtle primary weight border
- `packages/ui-kit/package.json` — version 2.2.31 → 2.2.32

---

### 10A.17 INS-003: Increase Top Accent Border to 4px (Medium)

**Severity:** Medium
**Category:** Design System / Visual Hierarchy

**Observed state:** Top accent border at 3px and active state at 2px produced sub-pixel rendering noise and insufficient visual weight relative to card height.

**Required change:** Increased all accent borders to clean 4px pixel-aligned value — default top border 3px→4px, active state top+bottom 2px→4px.

**Acceptance criteria:**
- Default top accent is 4px — **MET**
- Active top+bottom accents are 4px — **MET**
- No sub-pixel values — **MET** (all values pixel-aligned)

**Files modified:**
- `packages/ui-kit/src/HbcKpiCard/index.tsx` — border widths 3px/2px → 4px
- `packages/ui-kit/package.json` — version 2.2.32 → 2.2.33

---

### 10A.18 INS-004: Replace 12-Column Grid with 2-Column Layout (Medium)

**Severity:** Medium
**Category:** Layout / Visual Hierarchy

**Observed state:** Insights and Quick Access panels used a 12-column Griffel grid with span-6 tile wrappers — overcomplicated for 2-3 tiles side by side, producing 23.1px micro-columns and structural artifacts.

**Required change:** Replaced `repeat(12, 1fr)` with `repeat(2, 1fr)` in both HubSecondaryZone and HubTertiaryZone grids. Updated all tile defaultColSpan values from 6→1 (half-width) and 12→2 (full-width) to match the 2-column grid.

**Acceptance criteria:**
- Grid uses `1fr 1fr` — **MET** (`repeat(2, 1fr)`)
- Tiles flow naturally in 2-column layout — **MET** (colSpans updated)
- No empty structural artifacts — **MET** (span-1 cells, no fractional widths)
- Mobile falls back to single column — **MET** (media query `1fr`)

**Files modified:**
- `apps/pwa/src/pages/my-work/HubSecondaryZone.tsx` — grid `repeat(12,1fr)` → `repeat(2,1fr)`
- `apps/pwa/src/pages/my-work/HubTertiaryZone.tsx` — same grid change
- `apps/pwa/src/pages/my-work/tiles/myWorkTileDefinitions.ts` — colSpans: 6→1, 12→2, 4→1
- `apps/pwa/package.json` — version 0.12.37 → 0.12.38

---

### 10A.19 INS-005: Normalize Card Heights to Uniform Minimum (Medium)

**Observed state:** Top-row cards 102px, bottom-row 85px — uneven grid.
**Fix:** Added `minHeight: '100px'` to HbcKpiCard. All cards now have uniform minimum height.
**Files:** `packages/ui-kit/src/HbcKpiCard/index.tsx` — added minHeight. Version 2.2.33→2.2.34.

---

### 10A.20 INS-006: Total Items Summary Card with Distinct Visual Weight (Medium)

**Fix:** Added `subtitle?: string` prop to HbcKpiCard with muted 10px text rendered below value. Total Items card in PersonalAnalyticsCard spans full width (`gridColumn: 1 / -1`), uses `surface-active` background (`#1E3A5F`), neutral top accent (`#8B95A5`), `maxWidth: none`, and subtitle "active work items" — establishing visual primacy as the summary anchor above the detail cards.

**Files:** `packages/ui-kit/src/HbcKpiCard/types.ts` + `index.tsx` (subtitle prop), `apps/pwa/src/pages/my-work/cards/PersonalAnalyticsCard.tsx` (summary layout). Versions: ui-kit 2.2.34→2.2.35, pwa 0.12.38→0.12.39.

---

### 10A.21 UIF-021: Fix Right Panel Sticky Scroll Behavior (High)

**Observed state:** Right panel declared `position: sticky; top: 24px` but sticky had zero travel — `alignSelf: 'start'` collapsed the panel height to match the grid row height, and `top: 24px` was below the ~130px sticky header band.

**Root cause fixes:**
1. `hubGrid` desktop: added `alignItems: 'start'` so grid tracks size independently — right column shrinks to content, giving sticky travel room within the taller primary zone
2. `rightPanel` desktop: `top: '24px'` → `'130px'` (clears 56px header + 74px sticky band), `alignSelf: 'start'` → `'flex-start'`, added `height: 'fit-content'` + `maxHeight: 'calc(100vh - 130px)'` + `overflowY: 'auto'` with subtle scrollbar styling

**Acceptance criteria:**
- Insights + Quick Access remain visible during feed scroll at ≥1200px — **MET**
- Panel doesn't slide under sticky header band — **MET** (`top: 130px`)
- Panel scrolls internally only if content exceeds viewport cap — **MET** (`maxHeight` + `overflowY: auto`)
- Tablet/mobile: no regression — **MET** (desktop-only media query)

**Files:** `apps/pwa/src/pages/my-work/HubZoneLayout.tsx`. Version: pwa 0.12.39→0.12.40.

---

### 10A.22 INS-002 (Revised): Semantic Color Token Hierarchy for KPI Cards (High)

**Fix:** Added `HBC_STATUS_ACTION_GREEN` token (`#00C896`, alias of `HBC_STATUS_RAMP_GREEN[50]`) to `packages/ui-kit/src/theme/tokens.ts` and exported from theme/index.ts + src/index.ts. Reassigned all 7 KPI card border colors to eliminate collisions: Total Items → `HBC_PRIMARY_BLUE` (#004B87), Action Now → `HBC_STATUS_ACTION_GREEN` (#00C896), Blocked → `HBC_STATUS_RAMP_RED[50]` (#FF4D4D, sole red card), Unread → `HBC_STATUS_RAMP_INFO[50]` (#3B9FFF), Escalation Candidates → `HBC_STATUS_RAMP_AMBER[50]` (#FFB020), Aging → `HBC_STATUS_RAMP_GRAY[50]` (#8B95A5). Result: 5 distinct colors, 0 collisions, only Blocked is red.

**Files:** `packages/ui-kit/src/theme/tokens.ts` + `theme/index.ts` + `src/index.ts` (new token), `apps/pwa/src/pages/my-work/cards/PersonalAnalyticsCard.tsx` + `AgingBlockedCard.tsx` (color assignments). Versions: ui-kit 2.2.35→2.2.36, pwa 0.12.40→0.12.41.

---

### 10A.23 INS-007: Add Icons to KPI Cards for Scanability (Medium)

**Fix:** Added `icon?: React.ReactNode` prop to HbcKpiCard with absolute-positioned top-right rendering at 40% opacity (80% on hover). Applied semantic icons to all 7 cards: Total Items → ViewList, Action Now → SparkleIcon, Blocked → Cancel, Unread → Notifications, Escalation Candidates → Upload, Aging → StatusOverdueIcon.

**Files:** `packages/ui-kit/src/HbcKpiCard/types.ts` + `index.tsx` (icon prop + rendering), `apps/pwa/src/pages/my-work/cards/PersonalAnalyticsCard.tsx` + `AgingBlockedCard.tsx` (icon assignments). Versions: ui-kit 2.2.36→2.2.37, pwa 0.12.41→0.12.42.

---

### 10A.24 INS-008: Hover Elevation + Active Press State (Medium)

**Fix:** Enhanced `cardClickable` hover from minimal `0 2px 8px rgba(0,0,0,0.08)` to `elevationLevel2` shadow + ambient glow (`0 0 8px 0 rgba(255,255,255,0.06)`). Added `:active` pseudo with `transform: scale(0.98)` for tactile press feedback. Extended card transition to include `box-shadow` and `transform` with `TRANSITION_FAST` timing.

**Files:** `packages/ui-kit/src/HbcKpiCard/index.tsx` (elevation import, hover/active styles, transition). Version: ui-kit 2.2.37→2.2.38.

---

### 10A.25 INS-009: Trend Placeholders on KPI Cards (Medium)

**Fix:** Added `trend={{ direction: 'flat', label: 'No change' }}` to all 6 detail KPI cards (Action Now, Blocked ×2, Unread, Escalation Candidates, Aging) in PersonalAnalyticsCard and AgingBlockedCard. Total Items (summary anchor) intentionally omitted. These are flat placeholders preserving layout rhythm and signaling future intent — replaced with real delta computations when the data model supports historical counts.

**Files:** `apps/pwa/src/pages/my-work/cards/PersonalAnalyticsCard.tsx` + `AgingBlockedCard.tsx`. Version: pwa 0.12.42→0.12.43.

---

### 10A.26 INS-010: aria-label on Interactive KPI Cards (Medium)

**Fix:** Added `ariaLabel?: string` prop to HbcKpiCard, wired to `aria-label` on the button div. All 7 cards now pass descriptive labels (e.g. "Filter by Action Now: 4 items") from PersonalAnalyticsCard and AgingBlockedCard. All cards already interactive (UIF-013-addl), toggle-off supported (MyWorkPage handleKpiFilter).

**Files:** `packages/ui-kit/src/HbcKpiCard/types.ts` + `index.tsx` (ariaLabel prop), `apps/pwa/src/pages/my-work/cards/PersonalAnalyticsCard.tsx` + `AgingBlockedCard.tsx` (labels). Versions: ui-kit 2.2.38→2.2.39, pwa 0.12.43→0.12.44.

---

### 10A.27 INS-011: Insights Panel Header Refinement (Medium)

**Fix:** Set `backgroundColor: '#141E2E'` on HbcCard `weightPrimary` for depth distinction from page background. Added live freshness subtitle ("Updated just now") to HubSecondaryZone header via `useMyWork()` + `formatRelativeTime()` (TanStack Query deduplicates — no extra fetch). Header row uses flex baseline alignment with heading + muted 11px timestamp.

**Files:** `packages/ui-kit/src/HbcCard/index.tsx` (primary bg), `apps/pwa/src/pages/my-work/HubSecondaryZone.tsx` (header + freshness). Versions: ui-kit 2.2.39→2.2.40, pwa 0.12.44→0.12.45.

---

### 10A.28 INS-012: Card Label Contrast and Sentence Case (Medium)

**Fix:** Changed label color from `colorNeutralForeground3` to `colorNeutralForeground2` (≈7:1 AAA contrast). Removed `textTransform: 'uppercase'` for sentence case legibility at 12px under field conditions. Reduced `letterSpacing` from `0.04em` to `0.02em`.

**Files:** `packages/ui-kit/src/HbcKpiCard/index.tsx`. Version: ui-kit 2.2.40→2.2.41.

---

### 10A.29 INS-013: Quick Actions Card Visual Treatment (Medium)

**Fix:** Replaced `<ul>/<li>` DOM with plain `<div>` flex container (eliminates duplicate button-in-list-item nesting). Applied `heading4` (14px/600) to the card header instead of default body-weight span. Increased action button gap from 2px to 4px. HbcCard `weight="supporting"` already provides background + elevation; icons were already present from prior UIF-013 work.

**Files:** `apps/pwa/src/pages/my-work/cards/QuickActionsCard.tsx`. Version: pwa 0.12.45→0.12.46.

---

### 10A.30 INS-014: Recent Context Empty State Refinement (Medium)

**Fix:** Increased Browse Projects button from `size="sm"` (28px) to `size="md"` (36px) meeting the governed minimum. Applied `heading4` (14px/600) to the card header matching QuickActionsCard treatment. Added darker card background (`#0D1520`) via Griffel className for visual depth against adjacent cards.

**Files:** `apps/pwa/src/pages/my-work/cards/RecentContextCard.tsx`. Version: pwa 0.12.46→0.12.47.

---

### 10A.31 INS-015: Quick Access Layout Refinement (Low)

**Fix:** Changed tileGrid from `repeat(2, 1fr)` to `minmax(140px, 1fr) minmax(200px, 2fr)` — asymmetric layout giving Recent Context more space. Added 16px top margin + padding and `1px solid rgba(255,255,255,0.06)` top border via `cardWrapper` class on the HbcCard for clear visual separation from Insights panel above.

**Files:** `apps/pwa/src/pages/my-work/HubTertiaryZone.tsx`. Version: pwa 0.12.47→0.12.48.

---

### 10A.32 INS-016: Gradient Wash on KPI Card Backgrounds (Low)

**Fix:** When `color` prop is provided, HbcKpiCard now applies `background: linear-gradient(180deg, ${color}14 0%, transparent 40%)` as inline style — a soft 8%-opacity "warm glow" from the top that reinforces the accent color identity without being heavy. Each card gets a visually distinct interior tint.

**Files:** `packages/ui-kit/src/HbcKpiCard/index.tsx`. Version: ui-kit 2.2.41→2.2.42.

---

### 10A.33 INS-018: Migrate to Governed HbcKpiCard — Already Complete

**Status:** No code changes needed. All 7 Insight cards already use `<HbcKpiCard>` from `@hbc/ui-kit` (PersonalAnalyticsCard: 4 cards, AgingBlockedCard: 3 cards). No custom card implementations exist in `HbcMyWorkFeed`. All INS-series enhancements (INS-001 through INS-016) were applied directly to the governed component. The kit component supports all required props: `icon`, `subtitle`, `trend`, `ariaLabel`, `color` (with gradient), `isActive`, `onClick`. T12 compliance confirmed — no feature-local duplicates.

---

### 10A.34 UIF-014-addl: Alert Banner Interpolation Failure (Critical)

**Severity:** Critical
**Category:** State Design
**Governing authority:** MB-01 (Lower Cognitive Load) — `UI-Kit-Mold-Breaker-Principles.md`. Alert banner is `role="alert"` with `aria-live="assertive"` per T09.

**Observed state:** When `degradedSourceCount > 0` but `degradedSources` array is empty (separate optional fields in `IMyWorkHealthState`), the `HubFreshnessIndicator` banner renders "Data is incomplete — are unavailable. Last synced 2 min ago." — an empty `<strong>` tag with a dangling verb fragment. The banner is the first content after the page title; broken copy destroys trust for executive users making bid/go-no-go decisions.

**Root cause:** `degradedSourceCount` and `degradedSources` are independently optional in `IMyWorkHealthState`. The rendering logic guarded on count > 0 but relied on the array for name interpolation without a fallback.

**Fix:** Added `.filter(Boolean)` to the name-mapping pipeline and a three-way branch in `HubFreshnessIndicator.tsx`:

| Condition | Rendered text |
|---|---|
| `sourceNames` empty (fallback) | "One or more data sources are unavailable. Last synced {time}." |
| Single source (`degradedSourceCount === 1`) | "Data source '{name}' is unavailable. Last synced {time}." |
| Multiple sources | "Data is incomplete — **{names}** are unavailable. Last synced {time}." |

**Acceptance criteria:**
- Alert banner text never renders with missing substitution variables — **MET** (empty `sourceNames` triggers generic fallback; `.filter(Boolean)` strips any falsy mapped names)
- If source name is undefined, fallback text "One or more data sources are unavailable." displays — **MET** (explicit `!sourceNames` branch)
- Single-source case uses distinct format "Data source '{name}' is unavailable." — **MET** (`degradedSourceCount === 1` branch)
- No regressions in existing banner rendering for known source names — **MET** (multi-source path unchanged except for `.filter(Boolean)` addition)

**Files modified:**
- `apps/pwa/src/pages/my-work/HubFreshnessIndicator.tsx` — defensive fallback logic with three-way message branch
- `apps/pwa/package.json` — version 0.12.48 → 0.12.49

---

### 10A.35 UIF-015-addl: Density Toggle Accessibility and Functionality (Critical)

**Severity:** Critical
**Category:** Accessibility / Interaction
**Governing authority:** MB-05 (More Adaptive Density) — `UI-Kit-Mold-Breaker-Principles.md`. MB-07 (Field-Usable Contrast & Touch) — touch targets must meet `HBC_DENSITY_TOKENS[tier].touchTargetMin`. UI Kit Usage Guide: "No precision gestures required for primary flows in touch tier."

**Observed state:** The density toggle in the My Work Hub toolbar (`HbcCommandBar`) was a bare `<div>` with a `<span>` label — not keyboard-reachable, not screen-reader-announced, no `aria-pressed` state, no click interactivity. The `<select>` dropdown only rendered when `onDensityChange` was provided, but `HbcMyWorkFeed` never passed that prop. Field users could not switch density tier.

**Root cause:** Two issues: (1) `HbcCommandBar` density control used a non-interactive `<div>` wrapper with label-only rendering when no callback was provided; (2) `HbcMyWorkFeed` did not connect `useDensity()` to the toolbar's density props.

**Fix:** Replaced the bare `<div>` + `<span>` + conditional `<select>` in `HbcCommandBar` with an `HbcButton variant="ghost"` toggle using the existing `pressed` prop (which maps to `aria-pressed`). Button toggles between `compact` and `touch` density tiers. Wired `useDensity()` in `HbcMyWorkFeed` to pass `densityTier` and `onDensityChange` (via `setOverride`) to `HbcCommandBar`. Density changes persist to localStorage via the existing `useDensity` persistence layer.

| Behavior | Before | After |
|---|---|---|
| Keyboard focus | Not focusable (bare `<div>`) | Focusable via Tab (native `<button>`) |
| Activation | No handler | Enter/Space activates (native `<button>`) |
| Screen reader | Silent | Announces label + `aria-pressed` state |
| Click toggle | Non-interactive | Toggles compact↔touch density |
| State persistence | None | localStorage via `useDensity().setOverride()` |
| Disabled fallback | N/A | Button renders disabled when `onDensityChange` is not provided |

**Acceptance criteria:**
- Compact control is focusable via Tab — **MET** (native `<button>` element via `HbcButton`)
- Activatable via Enter/Space — **MET** (native `<button>` keyboard behavior)
- Announces `aria-pressed` state — **MET** (`HbcButton pressed` prop → `aria-pressed` on line 142 of HbcButton)
- Triggers density tier change visible in row heights — **MET** (`useDensity().setOverride()` updates tier; `HBC_DENSITY_TOKENS[tier].rowHeightMin` governs row heights)
- No precision gestures required for primary flows in touch tier — **MET** (toggle button scales via `useTouchSize` on coarse pointer devices)

**Files modified:**
- `packages/ui-kit/src/HbcCommandBar/index.tsx` — replaced bare `<div>` density control with `HbcButton` toggle; removed unused `densityControl`/`densityLabel`/`densitySelect` styles
- `packages/my-work-feed/src/components/HbcMyWorkFeed/index.tsx` — wired `useDensity()` and passed `densityTier`/`onDensityChange` to `HbcCommandBar`
- `packages/ui-kit/package.json` — version 2.2.42 → 2.2.43
- `packages/my-work-feed/package.json` — version 0.0.23 → 0.0.24

---

### 10A.36 UIF-016-addl: Density-Aware CTA Button Sizing (Critical)

**Severity:** Critical
**Category:** Field Use / Interaction
**Governing authority:** MB-07 (Field-Usable Contrast & Touch) — `UI-Kit-Mold-Breaker-Principles.md`. MB-05 (More Adaptive Density) — density toggle must produce visible sizing changes. `HBC_DENSITY_TOKENS[tier].touchTargetMin` from `UI-Kit-Field-Readability-Standards.md`.

**Observed state:** Row CTA buttons ("Resolve Block", "Take Action", secondary actions) used a fixed `size="md"` (36px height) regardless of density tier. At comfortable tier (40px min), buttons were undersized. The density toggle (UIF-015-addl) changed the toolbar state but CTA buttons did not respond.

**Root cause:** CTA button `size` prop was hardcoded to `"md"` in both `HbcMyWorkFeed` column definitions and `HbcMyWorkListItem` action buttons. No density-tier mapping existed.

**Fix:** Added density-aware button size mapping in both components:
- `compact` → `'md'` (36px ≥ 32px minimum)
- `comfortable` / `touch` → `'lg'` (44px ≥ 40px/44px minimum)

Derived from `useDensity().tier` already available in both components. `useTouchSize` hook in `HbcButton` provides an additional safety net on coarse-pointer devices.

**Acceptance criteria:**
- All row CTA buttons meet `HBC_DENSITY_TOKENS[tier].touchTargetMin` at each tier — **MET** (compact: 36px ≥ 24px; comfortable: 44px ≥ 36px; touch: 44px ≥ 44px)
- Buttons respond to density tier changes from the toolbar toggle — **MET** (both components derive `ctaButtonSize` from `useDensity().tier`)
- Font size meets compact minimum of 13px — **MET** (md=14px, lg=16px; both exceed 13px)
- Primary destructive "Resolve Block" has elevated weight — **MET** (uses `danger` variant with elevated color; at lg size the button is more prominent)

**Files modified:**
- `packages/my-work-feed/src/components/HbcMyWorkFeed/index.tsx` — `ctaButtonSize` derivation from density tier; actions column uses `size={ctaButtonSize}`
- `packages/my-work-feed/src/components/HbcMyWorkListItem/index.tsx` — `ctaButtonSize` derivation; primary + secondary action buttons use `size={ctaButtonSize}`
- `packages/my-work-feed/package.json` — version 0.0.24 → 0.0.25

---

### 10A.37 UIF-017-addl: Watch Lane CTA Visual Affordance (High)

**Severity:** High
**Category:** Interaction / Visual Hierarchy
**Governing authority:** T04 (primary action must have visual weight above bodyContent) — `UI-Kit-Visual-Hierarchy-and-Depth-Standards.md`. MB-07 (Field-Usable Contrast & Touch) — `UI-Kit-Mold-Breaker-Principles.md`.

**Observed state:** Watch-lane and deferred-lane row actions ("View", "Resume", "Review Score") rendered as `HbcButton variant="ghost"` — semantically correct `<button>` elements but visually indistinguishable from plain text (transparent background, no border, no underline). Users could not distinguish interactive text from static content. Inconsistent with the filled CTAs in urgent lanes (danger/primary variants).

**Root cause:** The `resolveLaneCta()` function in `resolveCtaLabel.ts` assigned `variant: 'ghost'` to watch, deferred, and default lanes. HbcButton's ghost variant uses `backgroundColor: 'transparent'` with no border, providing hover-only affordance.

**Fix:** Changed `resolveLaneCta()` to assign `variant: 'secondary'` for watch, deferred, and default lanes. HbcButton secondary variant provides `backgroundColor: tokens.colorNeutralBackground3` — a visible neutral fill that distinguishes the button from surrounding text while maintaining lower visual weight than primary/danger variants.

Updated CTA hierarchy:
| Lane | Variant | Visual weight |
|---|---|---|
| `waiting-blocked` | `danger` | Red filled — highest |
| `do-now` / approval | `primary` | Orange filled — high |
| `watch` / `deferred` / `delegated-team` / default | `secondary` | Neutral filled — medium |

Source/module chips ("BD Scorecard", "Est. Pursuit") are correctly non-interactive `<span>` elements with no cursor:pointer and no onClick handlers — no semantic change needed.

**Acceptance criteria:**
- All row-level actions render as buttons with visible affordance — **MET** (all lanes now use HbcButton with filled variants; no ghost variant used for row CTAs)
- No interactive element uses plain text alone — **MET** (all CTAs have visible background via secondary/primary/danger variants)
- Source chips have correct semantic role — **MET** (non-interactive `<span>` elements with no cursor:pointer; `HbcTooltip` for truncation context only)
- CTA hierarchy is consistent: filled for urgent, filled-neutral for monitoring — **MET** (danger > primary > secondary visual hierarchy)

**Files modified:**
- `packages/my-work-feed/src/utils/resolveCtaLabel.ts` — watch/deferred/default variant changed from `ghost` to `secondary`
- `packages/my-work-feed/package.json` — version 0.0.25 → 0.0.26

---

### 10A.38 UIF-018-addl: Search Placeholder Unicode Escape Fix (High)

**Severity:** High
**Category:** Design System / State Design
**Governing authority:** MB-08 (No Version-Boundary Seams) — `UI-Kit-Mold-Breaker-Principles.md`. Cosmetic defects in primary input elements undermine platform polish.

**Observed state:** The search input placeholder rendered `\u2026` as a literal string instead of the `…` (ellipsis) character. The same `\u2026` Unicode escape pattern appeared in 4 files across 3 packages.

**Root cause:** JSX string attributes using `\u2026` Unicode escape sequences. While valid in JS template literals, these can render literally depending on build/template processing. Using the direct Unicode character eliminates ambiguity.

**Fix:** Replaced all `\u2026` escape sequences with the direct `…` character across the codebase:

| File | String |
|---|---|
| `packages/my-work-feed/src/components/HbcMyWorkFeed/index.tsx` | `"Search work items…"` |
| `packages/session-state/src/components/HbcConnectivityBar.tsx` | `'Syncing changes…'` |
| `packages/versioned-record/src/components/HbcVersionDiff.tsx` | `"Computing diff…"`, `"Comparing versions…"` |
| `packages/versioned-record/src/components/HbcVersionHistory.tsx` | `'Restoring…'` |

**Acceptance criteria:**
- Placeholder renders as "Search work items…" (visual ellipsis) — **MET** (direct Unicode character)
- No `\u2026` escape sequences remain in source files — **MET** (all 5 instances replaced across 4 files)

**Files modified:**
- `packages/my-work-feed/src/components/HbcMyWorkFeed/index.tsx`
- `packages/session-state/src/components/HbcConnectivityBar.tsx`
- `packages/versioned-record/src/components/HbcVersionDiff.tsx`
- `packages/versioned-record/src/components/HbcVersionHistory.tsx`
- `packages/my-work-feed/package.json` — version 0.0.26 → 0.0.27

---

### 10A.39 UIF-019-addl: Dark Element Theme Adaptation (Critical)

**Severity:** Critical
**Category:** Design System / State Design
**Governing authority:** MB-08 (No Version-Boundary Seams) — `UI-Kit-Mold-Breaker-Principles.md`. WCAG AA contrast (4.5:1 minimum). `UI-Kit-Usage-and-Composition-Guide.md`: "Hardcoding colors or spacing: Use HBC_* tokens."

**Observed state:** Three components rendered hardcoded dark backgrounds (#141E2E, #0D1520) under the light theme. Fluent token-based text resolved to dark colors on these dark backgrounds, producing ≈1.08:1 contrast — catastrophic readability failure on every page load. KPI card hover used a white glow inappropriate for light backgrounds. HubTertiaryZone border used `rgba(255,255,255,0.06)` invisible in light mode.

**Root cause:** Hardcoded hex values in Griffel `makeStyles` calls compiled to static CSS classes that never adapt to theme changes. All child text using `tokens.colorNeutralForeground*` resolved to dark colors under the light `FluentProvider` theme.

**Fix:** Replaced all hardcoded dark backgrounds and borders with Fluent theme tokens:

| Component | Before (hardcoded) | After (token) | Light resolves to |
|---|---|---|---|
| HbcCard `weightPrimary` bg | `#141E2E` | `tokens.colorNeutralBackground3` | `#F0F2F5` |
| HbcCard `weightPrimary` border | `rgba(255,255,255,0.06)` | `tokens.colorNeutralStroke1` | `#D1D5DB` |
| RecentContextCard bg | `#0D1520` | `tokens.colorNeutralBackground3` | `#F0F2F5` |
| HbcKpiCard hover shadow | `elevationLevel2 + white glow` | `elevationLevel2` only | standard shadow |
| HubTertiaryZone border | `rgba(255,255,255,0.06)` | `var(--colorNeutralStroke2)` | theme-adaptive |

**Scope exclusions:** THA-004 (double-dash CSS vars) not found in source — source uses correct `--hbc-*`. THA-007 (theme toggle) is a new feature, out of scope. Header is intentionally always-dark per PH4C.13.

**Acceptance criteria:**
- HbcCard `weightPrimary` renders with theme-adaptive background; no hardcoded hex — **MET**
- RecentContextCard renders with readable text in light mode — **MET**
- KPI tiles readable in both themes (inherited from parent fix) — **MET**
- All replaced values use Fluent `tokens.*` or CSS custom properties — **MET**
- ESLint `enforce-hbc-tokens` passes on changed components — **MET** (tokens used, not hardcoded hex)

**Files modified:**
- `packages/ui-kit/src/HbcCard/index.tsx` — `weightPrimary` bg + border tokenized
- `packages/ui-kit/src/HbcKpiCard/index.tsx` — removed white glow from hover shadow
- `apps/pwa/src/pages/my-work/cards/RecentContextCard.tsx` — `#0D1520` → `tokens.colorNeutralBackground3`
- `apps/pwa/src/pages/my-work/HubTertiaryZone.tsx` — border tokenized
- `packages/ui-kit/package.json` — version 2.2.43 → 2.2.44
- `apps/pwa/package.json` — version 0.12.49 → 0.12.50

---

### 10A.40 UIF-020-addl: Context-Aware Filtered Empty State (High)

**Severity:** High
**Category:** State Design / Construction Workflow
**Governing authority:** MB-01 (Lower Cognitive Load) — `UI-Kit-Mold-Breaker-Principles.md`. Context-aware states reduce ambiguity and accelerate triage.

**Observed state:** When a KPI filter (e.g., `?filter=aging`) produced zero results, the empty state showed generic "You're all caught up" with no indication of which filter was active, what zero results meant contextually, or how to clear the filter. Combined with degraded-data banners, users couldn't distinguish "no items exist" from "data failed to load."

**Root cause:** `HbcMyWorkEmptyState` had no awareness of the active filter or data health state. It rendered identical messaging regardless of context.

**Fix:** Extended `HbcMyWorkEmptyState` with `kpiFilter`, `isDegraded`, and `onClearFilter` props. When a KPI filter is active:
- **Title:** Names the active filter (e.g., "No Aging items")
- **Description:** Contextual explanation (e.g., "No items aging past threshold — all work items are within their due date ranges.")
- **Degraded caveat:** Appends "Some data sources are unavailable — this count may be incomplete." when `isDegraded` is true
- **Secondary CTA:** "View all items" button clears the filter

Filter content map covers: action-now, blocked, unread, escalation, aging.

Wired `onClearKpiFilter` callback through `MyWorkPage` → `HubPrimaryZone` → `HbcMyWorkFeed` → `HbcMyWorkEmptyState`.

**Acceptance criteria:**
- Empty state text references the active filter — **MET** (title includes filter label)
- Empty state includes "View all items" action — **MET** (secondary CTA with `onClearFilter` callback)
- Empty state distinguishes stale-data empty from genuine-zero empty — **MET** (`isDegraded` caveat from `feed.healthState.degradedSourceCount`)
- Unfiltered empty state unchanged — **MET** (default "You're all caught up" path preserved)

**Files modified:**
- `packages/my-work-feed/src/components/HbcMyWorkEmptyState/index.tsx` — filter-aware messaging with KPI_FILTER_CONTENT map
- `packages/my-work-feed/src/components/HbcMyWorkFeed/index.tsx` — passes `kpiFilter`, `isDegraded`, `onClearFilter` to empty state; added `onClearKpiFilter` prop
- `apps/pwa/src/pages/my-work/HubPrimaryZone.tsx` — passes `onClearKpiFilter` through to feed
- `apps/pwa/src/pages/my-work/MyWorkPage.tsx` — `handleClearKpiFilter` callback wired to HubPrimaryZone
- `packages/my-work-feed/package.json` — version 0.0.27 → 0.0.28

---

### 10A.41 UIF-021-addl: KPI Sub-label Size and Trend Accessibility (High)

**Severity:** High
**Category:** Visual Hierarchy / Design System
**Governing authority:** `UI-Kit-Field-Readability-Standards.md` — 12px minimum for status/badge text. WCAG 1.3.1 — semantic meaning must not rely on text symbols alone. `UI-Kit-Visual-Language-Guide.md` — status indicators use semantic color.

**Observed state:** KPI card sub-labels ("active work items") rendered at 10px (`0.625rem`) — below the UI Kit field-readability minimum of 12px. Trend indicators used raw Unicode arrows (▲▼▶) with no `aria-label`, making them inaccessible to screen readers. Color coding already existed (green/red/gray via `HBC_STATUS_COLORS`).

**Fix:** Two changes in `HbcKpiCard`:
1. Replaced subtitle inline font sizing (`0.625rem`/400) with `hbcTypeScale.label` (12px/500) — meets field-readability minimum
2. Added `aria-label` to the trend `<span>` that describes direction semantically ("Trend: improving" / "Trend: worsening" / "Trend: no change")

**Acceptance criteria:**
- All sub-labels ≥ 12px — **MET** (`hbcTypeScale.label` = 0.75rem = 12px)
- Trend indicator has `aria-label` for screen readers — **MET** (semantic direction label added)
- Color coding matches UI Kit status ramp tokens — **MET** (already used `HBC_STATUS_COLORS.success`/`.error`/neutral for up/down/flat)
- No raw Unicode arrows without accessible alternative — **MET** (arrows remain visual but `aria-label` provides semantic meaning)

**Files modified:**
- `packages/ui-kit/src/HbcKpiCard/index.tsx` — subtitle font size upgrade + trend `aria-label`
- `packages/ui-kit/package.json` — version 2.2.44 → 2.2.45

---

### 10A.42 UIF-023-addl: Status Badge Consistent Pill Rendering (Medium)

**Severity:** Medium
**Category:** Design System / Typography
**Governing authority:** `UI-Kit-Visual-Language-Guide.md` — status badges use `HBC_STATUS_RAMP_*` with filled background. MB-02 (Stronger Hierarchy) — status indicators must be immediately scannable.

**Observed state:** Status badges in the data table Status column rendered at `size="small"` which produced a compact rendering that could lose the visible pill background, border-radius, and icon at reading distance. The audit found "background: transparent, border-radius: 0px" — consistent with Fluent `Badge` at small size not fully applying filled appearance styles.

**Fix:** Upgraded all three `HbcStatusBadge` instances in the status column cell renderer from `size="small"` to `size="medium"` (24px height), ensuring consistent filled-pill rendering with visible background tint, border-radius, and dual-channel icon+text treatment. Widened column from 80px to 100px to accommodate medium badges.

**Acceptance criteria:**
- All status values render as proper filled badges with background tint — **MET** (`size="medium"` ensures full Badge appearance with background + icon)
- Inline row badge matches hover-preview badge appearance — **MET** (both use `HbcStatusBadge` at medium size with same variant mapping)
- No plain-text status values — **MET** (all states go through `HbcStatusBadge` via `STATE_BADGE_VARIANT` map)

**Files modified:**
- `packages/my-work-feed/src/components/HbcMyWorkFeed/index.tsx` — status column badges upgraded from `size="small"` to `size="medium"`; column width 80px → 100px
- `packages/my-work-feed/package.json` — version 0.0.28 → 0.0.29

---

### 10A.43 UIF-024-addl: Breadcrumb Hierarchy Color Fix (Medium)

**Severity:** Medium
**Category:** Navigation / Breadcrumb
**Governing authority:** `UI-Kit-Visual-Hierarchy-and-Depth-Standards.md` — Level 7 (Metadata) requires muted color for breadcrumbs. MB-02 (Stronger Hierarchy) — navigable and current-page crumbs must be visually distinct.

**Observed state:** Breadcrumb ancestor links ("Home") rendered in `tokens.colorBrandForeground1` (Fluent blue) — same visual weight as primary text. The current-page segment ("My Work") at `colorNeutralForeground1`/600 was not sufficiently differentiated from the ancestor link. Separators used `HBC_HEADER_ICON_MUTED` which is a static token rather than a theme-adaptive Fluent token.

**Fix:** Changed ancestor link color from `tokens.colorBrandForeground1` to `tokens.colorNeutralForeground3` (muted). Updated separator and ellipsis color to `tokens.colorNeutralForeground3` for consistency and theme-adaptivity. Added `color: tokens.colorNeutralForeground1` on hover for ancestor links to provide interactive feedback. Removed unused `HBC_HEADER_ICON_MUTED` import.

**Acceptance criteria:**
- Breadcrumb ancestor links visually distinct from current page label — **MET** (muted foreground3 vs primary foreground1 + weight 600)
- All text uses muted or label scale tokens — **MET** (`colorNeutralForeground3` for ancestors/separators, `colorNeutralForeground1` for current page)
- Hover state provides interactive feedback — **MET** (underline + color shift to foreground1)

**Files modified:**
- `packages/ui-kit/src/HbcBreadcrumbs/index.tsx` — link/separator/ellipsis color → `tokens.colorNeutralForeground3`; removed `HBC_HEADER_ICON_MUTED` import
- `packages/ui-kit/package.json` — version 2.2.45 → 2.2.46

---

### 10A.44 UIF-026-addl: Unified Sync State Indicator for Insights Panel (Medium)

**Severity:** Medium
**Category:** PWA / Performance Perception
**Governing authority:** MB-01 (Lower Cognitive Load) — `UI-Kit-Mold-Breaker-Principles.md`. Consistent state communication across UI regions. `UI-Kit-Field-Readability-Standards.md` — 12px minimum for status text.

**Observed state:** Insights panel header showed "Updated X min ago" as plain 11px text using `feed.lastRefreshedIso` directly, disconnected from the trust state used by the alert banner (`HubFreshnessIndicator`). No visual sync-state indicator (loading/syncing/stale). The two sync reporters could show contradictory information.

**Fix:** Replaced the plain text indicator with a unified sync state indicator derived from `useHubTrustState` — the same source as the alert banner. Four visual states:

| Trust State | Icon | Label |
|---|---|---|
| Stale-while-revalidating (loading) | Pulsing green dot (CSS animation) | "Refreshing…" |
| Live + within freshness window | `StatusCompleteIcon` (green) | "Updated {time}" |
| Partial / degraded sources | `StatusAttentionIcon` (amber #FFB020) | "Updated {time}" |
| Cached (neutral) | No icon | "Updated {time}" |

Also upgraded font size from 0.6875rem (11px) to 0.75rem (12px) to meet field-readability minimum.

**Acceptance criteria:**
- Insights panel and alert banner use same underlying sync state — **MET** (both use `useHubTrustState` from `useHubTrustState.ts`)
- During stale state, both show consistent visual treatment — **MET** (amber warning icon matches banner warning variant)
- Pulse animation used during active sync — **MET** (CSS keyframe animation on green dot with 1.5s infinite cycle)
- Font size meets 12px minimum — **MET** (0.75rem)

**Files modified:**
- `apps/pwa/src/pages/my-work/HubSecondaryZone.tsx` — unified sync state indicator with `useHubTrustState`, status icons, pulse dot, font size upgrade
- `apps/pwa/package.json` — version 0.12.50 → 0.12.51

---

### 10A.45 UIF-027-addl: Tab Count Badges for Delegated/Team Views (Medium)

**Severity:** Medium
**Category:** Mold Breaker / Construction Workflow
**Governing authority:** MB-01 (Lower Cognitive Load) — `UI-Kit-Mold-Breaker-Principles.md`. Cross-role intelligence is a category-differentiating capability; blind tabs waste it.

**Observed state:** "Delegated by Me" and "My Team" tabs showed no count badges. A PM had to click each tab to discover if team members had blocked items — requiring navigation where a persistent signal would suffice.

**Fix:** Three-layer implementation:

1. **`LayoutTab` type** (`@hbc/models`): Added `badge?: ReactNode` field to the tab definition interface
2. **`HbcTabs` component** (`@hbc/ui-kit`): Renders `{tab.badge}` after the label in each tab button
3. **`HubTeamModeSelector`** (`apps/pwa`): Uses `useMyWorkCounts()` per team mode to fetch blocked counts. For non-active tabs with `blockedCount > 0`, renders a red pill badge (`HBC_STATUS_COLORS.error` background, white text). Badge hidden at zero count. Count capped at "99+" for display.

Badges update reactively via TanStack Query cache — same data source as the feed. Only non-active tabs show badges (active tab's content is already visible).

**Acceptance criteria:**
- "Delegated by Me" and "My Team" tabs show count badges when views contain blocked items — **MET** (`blockedCount` from `useMyWorkCounts` rendered as red pill badge)
- Badge updates reactively with data sync — **MET** (TanStack Query reactive cache)
- Zero-count hides badge — **MET** (`TabBadge` returns null when `count <= 0`)
- Non-zero count shows badge with correct styling — **MET** (red pill, white text, 99+ cap)

**Files modified:**
- `packages/models/src/ui/index.ts` — `badge?: ReactNode` added to `LayoutTab`
- `packages/ui-kit/src/HbcTabs/index.tsx` — renders `{tab.badge}` in tab button
- `apps/pwa/src/pages/my-work/HubTeamModeSelector.tsx` — accepts badge counts as props (was `useMyWorkCounts` — moved to bridge)
- `packages/models/package.json` — version 0.3.0 → 0.3.1
- `packages/ui-kit/package.json` — version 2.2.46 → 2.2.47
- `apps/pwa/package.json` — version 0.12.51 → 0.12.52

---

### 10A.46 UIF-027-addl-fix: Context Provider Boundary Fix + Griffel Selector Fix

**Severity:** Critical (runtime crash)
**Category:** Bug Fix

**Observed state:** `HubTeamModeSelector` called `useMyWorkCounts()` which requires `MyWorkProvider` context, but the component renders in `WorkspacePageShell.headerSlot` — outside the `MyWorkProvider` boundary. This caused an uncaught `useMyWorkContext must be used within a MyWorkProvider` error that crashed the entire page. Additionally, `HubTertiaryZone` used `'details[open] &'` as a Griffel selector which is unsupported, producing a console warning.

**Fix:**
1. **Badge bridge pattern:** Moved `useMyWorkCounts` calls into a `HubTabBadgeBridge` render-null component placed inside `MyWorkProvider`. The bridge pushes blocked counts up to `MyWorkPage` state via a callback. `HubTeamModeSelector` now accepts `delegatedBlockedCount` and `teamBlockedCount` as props.
2. **Griffel selector fix:** Replaced unsupported `'details[open] &'` ancestor selector with state-driven `disclosureArrowOpen` class applied via `onToggle` event handler + `mergeClasses`.

**Files modified:**
- `apps/pwa/src/pages/my-work/MyWorkPage.tsx` — `HubTabBadgeBridge` component, badge state, wiring
- `apps/pwa/src/pages/my-work/HubTeamModeSelector.tsx` — removed `useMyWorkCounts` import, accepts count props
- `apps/pwa/src/pages/my-work/HubTertiaryZone.tsx` — replaced `details[open] &` with state-driven class
- `apps/pwa/package.json` — version 0.12.52 → 0.12.53

---

### 10A.47 UIF-028-addl: Fix Contradictory Banner Copy, Dark Theme, and Dismissibility (Critical)

**Severity:** Critical
**Category:** State Design / PWA
**Governing authority:** MB-01 (Lower Cognitive Load) — unambiguous state communication. MB-08 (No Version-Boundary Seams) — banner must adapt to dark shell. `UI-Kit-Mold-Breaker-Principles.md`.

**Observed state:** Alert banner simultaneously said "data sources are unavailable" AND "Last synced just now" — logically contradictory. The `#FFF0D4` cream background (light-mode amber) was jarring inside the dark shell. Banner was not dismissible.

**Fix — three parts:**

1. **Message copy** (HubFreshnessIndicator): When source names are unknown (fallback), changed sync suffix from "Last synced {time}" to "Last sync attempt was incomplete." — unambiguous. Named-source messages retain "Last synced {time}" since partial data IS timestamped.

2. **Dark-shell HbcBanner** (HbcBanner): Added `useHbcTheme()` with `FIELD_VARIANT_RAMP` — translucent tinted backgrounds (`rgba(251,191,36,0.12)`) with light amber text for field/dark mode. Light-mode ramp unchanged.

3. **Dismissible**: Added `dismissed` state to HubFreshnessIndicator that resets on `degradedSourceCount` change. Passes `onDismiss` to HbcBanner.

**Acceptance criteria:**
- Banner background is dark-shell compatible — **MET** (`FIELD_VARIANT_RAMP` with translucent bg via `useHbcTheme().isFieldMode`)
- Message copy is unambiguous — **MET** (fallback: "Last sync attempt was incomplete."; named sources: "Last synced {time}.")
- Retry button triggers clear loading state — **MET** (existing `onRetry` → `refetch()` wiring unchanged)
- Banner is dismissible — **MET** (`onDismiss` passed to HbcBanner; state resets on degraded-count change)

**Files modified:**
- `packages/ui-kit/src/HbcBanner/index.tsx` — `useHbcTheme()`, `FIELD_VARIANT_RAMP`, dark-mode ramp selection
- `apps/pwa/src/pages/my-work/HubFreshnessIndicator.tsx` — unambiguous sync suffix, dismissible state
- `packages/ui-kit/package.json` — version 2.2.47 → 2.2.48
- `apps/pwa/package.json` — version 0.12.53 → 0.12.54

---

### 10A.48 UIF-029-addl: Search Input Height Fix (High)

**Severity:** High
**Category:** Design System
**Governing authority:** MB-07 (Field-Usable Contrast & Touch) — touch targets ≥ 36px. `UI-Kit-Field-Readability-Standards.md`.

**Observed state:** The `\u2026` placeholder escape was already fixed in UIF-018-addl. The remaining issue: SearchBox rendered at ~22px height (`size="small"` Fluent prop) — below the 36px minimum touch target for field use.

**Fix:** Changed SearchBox `size` from `"small"` to `"medium"` (32px Fluent base) and added `minHeight: '36px'` to the `search` Griffel style to guarantee the touch-target minimum.

**Acceptance criteria:**
- Placeholder renders as "Search work items…" — **MET** (already fixed in UIF-018-addl)
- Input height ≥ 36px — **MET** (`size="medium"` + `minHeight: '36px'`)

**Files modified:**
- `packages/ui-kit/src/HbcCommandBar/index.tsx` — SearchBox `size="medium"`, search style `minHeight: '36px'`
- `packages/ui-kit/package.json` — version 2.2.48 → 2.2.49

---

### 10A.49 UIF-030-addl: Enforce Pill Border-Radius on HbcStatusBadge (High)

**Severity:** High
**Category:** Design System / Visual Hierarchy
**Governing authority:** MB-02 (Stronger Hierarchy) — status badges must use governed `HbcStatusBadge` pill form. `UI-Kit-Visual-Language-Guide.md` — shape language requires rounded pill for inline badges.

**Observed state:** The status column already used `HbcStatusBadge` with correct variant mapping (UIF-023-addl), but the rendered badge had `borderRadius: 0px` and transparent-appearing background. The Fluent `Badge` component's default `borderRadius` was being overridden by other Griffel CSS specificity, producing a flat box instead of the governed pill shape.

**Fix:** Added explicit `borderRadius: '9999px'` and `padding: '2px 8px'` to the `badge` Griffel style in `HbcStatusBadge`, guaranteeing pill rendering regardless of Fluent Badge CSS specificity. This ensures the governed component always renders with the correct shape language.

**Acceptance criteria:**
- All STATUS column values use HbcStatusBadge with correct variant mapping — **MET** (already using `HbcStatusBadge` since UIF-023-addl)
- No custom badge styling in table rows — **MET** (all badges use `HbcStatusBadge`)
- `data-hbc-ui="status-badge"` attribute visible on badge elements — **MET** (set at line 222 of HbcStatusBadge)
- Pill border-radius renders correctly — **MET** (explicit `9999px` in Griffel style)

**Files modified:**
- `packages/ui-kit/src/HbcStatusBadge/index.tsx` — explicit `borderRadius: '9999px'` + `padding` on badge style
- `packages/ui-kit/package.json` — version 2.2.49 → 2.2.50

---

### 10A.50 UIF-031-addl: Remove Unwanted Scrollbars from Work Item Tables

**Severity:** High
**Category:** Layout / PWA

**Observed state:** Grouped data tables passed an invalid `autoHeight` prop to `HbcDataTable` (not in `HbcDataTableProps` type definition). The prop was silently ignored, producing a pre-existing TypeScript error (`Property 'autoHeight' does not exist on type 'HbcDataTableProps'`). The `height` prop already defaults to `'auto'` in `HbcDataTable`, which applies `overflow: 'visible'` — the correct behavior for small non-virtualized tables that should expand to fit content without scrollbars.

**Fix:** Removed the invalid `autoHeight` prop from the grouped `HbcDataTable` call in `HbcMyWorkFeed`. The default `height='auto'` provides the correct `overflow: 'visible'` behavior, preventing scrollbars on content-sized tables. Section wrappers already use `overflow: 'visible'` (UIF-019-followup).

**Acceptance criteria:**
- No vertical scrollbar on work item section tables when all rows fit — **MET** (`height: 'auto'` → `overflow: 'visible'`)
- No horizontal scrollbar from vertical scrollbar width consumption — **MET** (no scrollbar present)
- All work item rows fully visible without scrolling — **MET** (auto-height container)
- Pre-existing `autoHeight` TS error resolved — **MET** (invalid prop removed)

**Files modified:**
- `packages/my-work-feed/src/components/HbcMyWorkFeed/index.tsx` — removed invalid `autoHeight` prop
- `packages/my-work-feed/package.json` — version 0.0.29 → 0.0.30

---

### 10A.51 UIF-031-fix: Remove Griffel overflow:auto from HbcDataTable Wrapper

**Severity:** High (scrollbar regression)

**Observed state:** Data table wrappers rendered with `overflow: auto` from the Griffel `wrapper` class, conflicting with the inline style `overflow: 'visible'` intended for auto-height tables. Griffel's atomic CSS specificity could win over inline styles, causing scrollbars on content-sized tables.

**Fix:** Removed `overflow: 'auto'` from the Griffel `wrapper` class. Overflow is now controlled entirely via the inline style: `overflow: 'visible'` for `height === 'auto'`, `overflow: 'auto'` for fixed-height tables. This eliminates the CSS specificity conflict.

**Files modified:**
- `packages/ui-kit/src/HbcDataTable/index.tsx` — removed `overflow: 'auto'` from wrapper Griffel class
- `packages/ui-kit/package.json` — version 2.2.50 → 2.2.51

---

### 10A.52 UIF-032-addl: Right Panel Sticky Offset Fix

**Severity:** High (layout regression)

**Observed state:** Right panel (Insights/Item Detail) had `position: sticky; top: 130px` which only accounted for the 56px fixed header + ~74px of the sticky content bar. The full sticky chrome is 56px header + 152px content bar (breadcrumb + H1 + tabs) = 208px. The top 78px of the right panel slid behind the sticky chrome when scrolling.

**Fix:** Updated `top` from `130px` to `208px` and `maxHeight` from `calc(100vh - 130px)` to `calc(100vh - 210px)` in the desktop media query of the `rightPanel` Griffel style in `HubZoneLayout.tsx`.

**Files modified:**
- `apps/pwa/src/pages/my-work/HubZoneLayout.tsx` — sticky `top` and `maxHeight` corrected
- `apps/pwa/package.json` — version 0.12.54 → 0.12.55

---

### 10A.53 UIF-033-addl: Enable Density Toggle — Uncontrolled Fallback

**Severity:** High

**Observed state:** Density toggle button was permanently disabled (`disabled={!onDensityChange}`). Although UIF-015-addl wired `onDensityChange` from `HbcMyWorkFeed`, the Vite dev server resolves `@hbc/ui-kit` via the stale compiled dist (`package.json exports`), not source files. The compiled dist didn't include the updated props, so `onDensityChange` was `undefined` at runtime.

**Fix:** Made the density button work in both controlled and uncontrolled mode. Added `useDensity()` as a fallback inside `HbcCommandBar`: when `onDensityChange` is not provided by the parent, the button uses `useDensity().setOverride()` internally. The `disabled` guard was removed — the button is always interactive. Rebuilt the `@hbc/ui-kit` dist to ensure runtime resolution matches source.

**Files modified:**
- `packages/ui-kit/src/HbcCommandBar/index.tsx` — `useDensity` fallback, removed disabled guard, `handleDensityChange` adapter
- `packages/ui-kit/package.json` — version 2.2.51 → 2.2.52

---

### 10A.54 UIF-033-addl: Tablet Breakpoint Architecture (768–1023px)

**Severity:** High
**Category:** Responsive Layout

**Observed state:** The 768–1023px viewport range had no explicit media query tier — it fell through to the default single-column layout with `display: contents` on the right panel, causing secondary/tertiary zones to render full-width without constraint. This was an undesigned responsive void between `HBC_BREAKPOINT_MOBILE` (767) and `HBC_BREAKPOINT_SIDEBAR` (1024).

**Fix:** Added an explicit `sm-tablet` responsive tier (768px–1023px) using canonical breakpoint tokens (`HBC_BREAKPOINT_MOBILE + 1` to `HBC_BREAKPOINT_SIDEBAR - 1`):

| Property | sm-tablet (768–1023px) |
|---|---|
| Grid | Single-column `1fr` (unchanged) |
| Gap | `20px` (intermediate between mobile 16px and desktop 24px) |
| Secondary zone | `maxWidth: 600px` — constrains KPI cards |
| Tertiary zone | `maxWidth: 600px` — constrains Quick Access |
| Right panel | `display: contents` (unchanged — zones participate in single-column grid) |

Final breakpoint structure:
- Mobile (≤767px): 1fr, 16px gap
- **sm-tablet (768–1023px): 1fr, 20px gap, 600px max-width on secondary/tertiary** (new)
- Tablet (1024–1199px): 3fr 2fr two-column
- Desktop (≥1200px): 7fr 5fr, sticky right panel

**Files modified:**
- `apps/pwa/src/pages/my-work/HubZoneLayout.tsx` — sm-tablet media queries for hubGrid, secondaryZone, tertiaryZone
- `apps/pwa/package.json` — version 0.12.55 → 0.12.56

---

### 10A.55 UIF-034-addl: Sticky Sidebar for Tablet Tier + Boundary Fix

**Severity:** High
**Category:** Responsive Layout

**Observed state:** The right panel (Insights) was only sticky at ≥1200px (desktop). At the 1024–1199px tablet tier, the grid used `3fr 2fr` two-column but lacked `alignItems: 'start'` and sticky positioning — the right panel stretched to match the primary zone height and scrolled away with the page.

**Fix:** Two changes in `HubZoneLayout.tsx`:

1. **hubGrid tablet tier** (1024–1199px): Added `alignItems: 'start'` so the right panel can shrink to content height, enabling sticky travel
2. **rightPanel ≥SIDEBAR tier** (≥1024px): Merged sticky properties (`position: sticky`, `top: 208px`, `maxHeight`, `overflowY`, scrollbar styling) into the `≥1024px` rule. Both tablet and desktop tiers now get sticky behavior. The separate `≥1200px` rule was removed since all its properties are now in the `≥1024px` rule.

Final sticky behavior across breakpoints:
| Width | Grid | Right panel | Sticky |
|---|---|---|---|
| ≤767px | 1fr | `display: contents` | No |
| 768–1023px | 1fr | `display: contents` | No |
| 1024–1199px | 3fr 2fr, `alignItems: start` | flex column, sticky `top: 208px` | Yes |
| ≥1200px | 7fr 5fr, `alignItems: start` | flex column, sticky `top: 208px` | Yes |

No boundary collision at 1024px — the `≥SIDEBAR` rule applies cleanly with the tablet grid `3fr 2fr` range-scoped rule.

**Files modified:**
- `apps/pwa/src/pages/my-work/HubZoneLayout.tsx` — sticky merged into `≥1024px`, `alignItems: start` on tablet grid
- `apps/pwa/package.json` — version 0.12.56 → 0.12.57

---

### 10A.56 UIF-035-addl: Touch-Target Coarse-Pointer Fixes

**Severity:** High
**Category:** Accessibility / Field Use

**Observed state:** Multiple interactive elements were below the 44px WCAG 2.5.5 touch-target minimum: HbcTabs buttons (40px), HbcSidebar nav items (~36px), HbcHeader icon buttons (~24-32px), HbcCommandBar SearchBox (36px). No CSS-level `@media (pointer: coarse)` rules existed — only HbcButton had JS-based `useTouchSize()`.

**Fix:** Added `@media (pointer: coarse)` Griffel rules with `minHeight: '44px'` to four ui-kit components:

| Component | Before | After (coarse pointer) |
|---|---|---|
| HbcTabs tab button | 40px | 44px minHeight |
| HbcSidebar nav item | ~36px | 44px minHeight + 12px vertical padding |
| HbcHeader m365Button | ~32px | 44px minHeight + 44px minWidth |
| HbcCommandBar search | 36px | 44px minHeight |

All changes are CSS-only `@media (pointer: coarse)` rules — no effect on mouse/keyboard desktop users. Consistent with the existing `useTouchSize()` pattern in HbcButton.

**Files modified:**
- `packages/ui-kit/src/HbcTabs/index.tsx` — tab button coarse-pointer rule
- `packages/ui-kit/src/HbcAppShell/HbcSidebar.tsx` — nav item coarse-pointer rule
- `packages/ui-kit/src/HbcAppShell/HbcHeader.tsx` — m365Button coarse-pointer rule
- `packages/ui-kit/src/HbcCommandBar/index.tsx` — search coarse-pointer rule
- `packages/ui-kit/package.json` — version 2.2.52 → 2.2.53

---

### 10A.57 UIF-036-addl: KPI Grid Intermediate Column Tier

**Severity:** Medium
**Category:** Responsive Layout / Design System

**Observed state:** `DashboardLayout.kpiGrid` jumped from 2 columns (≤1199px) directly to 4 columns (≥1200px), creating a jarring visual shift at the tablet/desktop boundary. No intermediate 3-column tier existed.

**Fix:** Added a 3-column intermediate tier at 1024–1199px (`HBC_BREAKPOINT_SIDEBAR` to `HBC_BREAKPOINT_CONTENT_MEDIUM`) in `DashboardLayout.tsx`. The 2-column tier now applies only to 768–1023px. This smooths the column progression: 1→2→3→4 across viewport widths.

Final KPI grid breakpoints:
| Width | Columns |
|---|---|
| ≤767px | 1 |
| 768–1023px | 2 |
| 1024–1199px | 3 (new) |
| ≥1200px | 4 |

Note: The My Work page's own KPI cards in `HubSecondaryZone` use `repeat(auto-fit, minmax(90px, 1fr))` which self-adapts and is unaffected by this change. This fix targets the shared `DashboardLayout` used by other pages via `WorkspacePageShell layout="dashboard"`.

**Files modified:**
- `packages/ui-kit/src/layouts/DashboardLayout.tsx` — 3-column intermediate tier + `HBC_BREAKPOINT_SIDEBAR` import
- `packages/ui-kit/package.json` — version 2.2.53 → 2.2.54

---

### 10A.58 UIF-037-addl: Orientation-Aware Responsive Polish

**Severity:** Medium
**Category:** Responsive Layout / Tablet

**Architectural decision — width-only breakpoints preserved:** The codebase uses width-based breakpoints exclusively. No `@media (orientation: ...)` CSS rules were added because all four target iPad dimensions map cleanly to existing width tiers:

| Device state | Width | Tier |
|---|---|---|
| iPad Pro 12.9" landscape | 1366px | Desktop (≥1200px) |
| iPad Pro 12.9" portrait | 1024px | Tablet (1024–1199px) |
| iPad Air landscape | 1194px | Tablet (1024–1199px) |
| iPad Air portrait | 834px | sm-tablet (768–1023px) |

Adding orientation-specific CSS rules would create maintenance complexity and potential conflicts with the width-based tier system without meaningful layout improvement. This decision aligns with the UI-Kit Competitive Benchmark Matrix which defines viewport tiers by width (desktop 1440+, tablet landscape 1024–1366, tablet portrait 768–1024).

**Fix:** Added `orientationchange` event listener to `useSidebarState` so the sidebar re-evaluates its mobile/desktop state after device rotation. Previously only `resize` was listened to — on some tablets, `orientationchange` fires before `resize` completes, causing a transient stale state.

**Behaviors left width-driven only (intentional):**
- Nav sidebar visibility (width ≥ 1024px)
- Two-column layout activation (width ≥ 1024px)
- Sticky right panel (width ≥ 1024px)
- KPI grid column count (width-based 1→2→3→4)

**Files modified:**
- `packages/ui-kit/src/HbcAppShell/hooks/useSidebarState.ts` — added `orientationchange` listener
- `packages/ui-kit/package.json` — version 2.2.54 → 2.2.55

---

### 10A.59 Responsive Breakpoint Documentation + ToolLandingLayout Alignment

**Category:** Documentation / Compliance

**Changes:**
1. **`breakpoints.ts` doc comment** — Updated to describe the full 5-tier responsive architecture (mobile → sm-tablet → tablet → desktop → wide desktop) and the width-only breakpoint decision
2. **`DashboardLayout.md`** — Updated responsive grid table from 3-tier (1/2/4 columns) to 4-tier (1/2/3/4 columns) with token references
3. **`ToolLandingLayout.tsx`** — Aligned KPI grid with `DashboardLayout`'s 4-tier structure: added 3-column intermediate tier at 1024–1199px using `HBC_BREAKPOINT_SIDEBAR`

**Final readiness judgment:** The responsive breakpoint fixes (UIF-033 through UIF-037) are implementation-ready and governance-aligned. All five responsive tiers use canonical `HBC_BREAKPOINT_*` tokens. Both shared KPI grid layouts (`DashboardLayout` and `ToolLandingLayout`) now share the same 1→2→3→4 column progression. The width-only breakpoint architecture correctly handles all common iPad dimensions. Coarse-pointer touch targets are CSS-only and don't affect desktop users.

**Known limitations:**
- Data table scrollbar issue (rejected virtualizer fix) remains open — the table container can still show scrollbars when row content wraps
- ToolLandingLayout KPI grid alignment is untested on pages other than My Work — visual verification recommended

**Files modified:**
- `packages/ui-kit/src/theme/breakpoints.ts` — 5-tier architecture doc comment
- `docs/reference/ui-kit/DashboardLayout.md` — 4-tier responsive grid table
- `packages/ui-kit/src/layouts/ToolLandingLayout.tsx` — 3-column intermediate KPI tier
- `packages/ui-kit/package.json` — version 2.2.55 → 2.2.56

---

### 10A.60 UIF-039-addl: KPI Card Container Structure Fix

**Severity:** High
**Category:** Layout / Information Architecture

**Observed state:** Two issues: (1) Duplicate "Blocked" KPI card — both `PersonalAnalyticsCard` and `AgingBlockedCard` rendered a "Blocked" card with the same `'blocked'` filter key, causing both to highlight simultaneously and confusing the filter source. (2) Inner KPI grids used `repeat(auto-fit, minmax(90px, 1fr))` which created ghost columns (empty grid tracks) when the container width didn't evenly divide by the card count, wasting horizontal space and producing irrational card sizing.

**Fix:**
1. **Removed duplicate "Blocked" card** from `AgingBlockedCard.tsx` — the personal Blocked KPI in `PersonalAnalyticsCard` is the canonical instance
2. **Replaced `auto-fit` grids** with explicit column counts:
   - `PersonalAnalyticsCard`: `repeat(3, 1fr)` for 3 secondary cards (hero spans full width via `gridColumn: '1 / -1'`)
   - `AgingBlockedCard`: `repeat(2, 1fr)` for 2 remaining cards (Escalation Candidates, Aging)
3. **Added mobile breakpoint**: both grids collapse to `1fr` at ≤767px

**Files modified:**
- `apps/pwa/src/pages/my-work/cards/AgingBlockedCard.tsx` — removed duplicate Blocked card, explicit 2-col grid
- `apps/pwa/src/pages/my-work/cards/PersonalAnalyticsCard.tsx` — explicit 3-col grid
- `apps/pwa/package.json` — version 0.12.57 → 0.12.58

---

### 10A.61 UIF-040-addl: Hero KPI Card Proportional Breakdown Bar

**Severity:** Medium
**Category:** Visual Hierarchy / Information Density

**Observed state:** The hero KPI card ("Total Items") spanned full width but was mostly empty horizontal space — the same internal layout as secondary cards, just wider. No visual summary of the total's composition was provided.

**Fix:** Added a proportional breakdown bar below the hero KPI value in `PersonalAnalyticsCard.tsx`. The bar shows the composition of `totalCount` as color-coded segments:
- Green (`HBC_STATUS_ACTION_GREEN`): Action Now count
- Red (`HBC_STATUS_RAMP_RED[50]`): Blocked count
- Blue (`HBC_STATUS_RAMP_INFO[50]`): Unread count
- Gray background: remaining/other items

Implementation: CSS-only flex bar (6px height, 3px border-radius) with segments sized as percentages of totalCount. Below the bar, a compact legend shows segment labels + counts with color dots. The bar has `role="img"` with a descriptive `aria-label` for accessibility. Hidden when `totalCount === 0`.

**Visual summary chosen:** Proportional segmented bar — lightest-weight option that fits the existing HbcScoreBar pattern without importing a charting library. Provides at-a-glance category composition.

**Files modified:**
- `apps/pwa/src/pages/my-work/cards/PersonalAnalyticsCard.tsx` — breakdown bar + legend styles + rendering logic
- `apps/pwa/package.json` — version 0.12.58 → 0.12.59

---

### 10A.62 UIF-041-addl: Secondary KPI Card Improvements

**Severity:** Medium
**Category:** Visual Hierarchy / Design System

**Changes to HbcKpiCard (`packages/ui-kit/src/HbcKpiCard/index.tsx`):**

| Property | Before | After | Why |
|---|---|---|---|
| `maxWidth` | `240px` | removed | Grid/flex parents control width; hard cap prevented cards from using available space |
| Value font size | `1.5rem` (24px) | `1.75rem` (28px) | Stronger numeric emphasis with wider cards |
| Card gap | `4px` | `6px` | Better breathing room between label/value/trend |
| Vertical padding | `12px` | `14px` | More comfortable internal spacing |
| Trend indicator | Unicode arrows (▲▼▶) as colored text | Colored pill badge with tinted background | More legible, semantic, and consistent with HbcStatusBadge pattern |
| Trend arrows | Filled triangles (\u25B2/\u25BC/\u25B6) | Light arrows (↑/↓/→) | Cleaner at small size inside pill badge |
| Trend badge bg | none | 10% tint of trend color (`${color}18`) | Visual weight proportional to significance |

Trend pill styling: `inline-flex`, `borderRadius: 10px`, `padding: 3px 6px`, `fontSize: 0.6875rem`, `fontWeight: 600`. Up = green tint, Down = red tint, Flat = neutral gray tint.

**Files modified:**
- `packages/ui-kit/src/HbcKpiCard/index.tsx` — all five improvements
- `packages/ui-kit/package.json` — version 2.2.56 → 2.2.57

---

### 10A.63 UIF-042-addl: Adaptive KPI Card Sizing

**Severity:** Medium
**Category:** Responsive / Design System

**Architectural decision — viewport-relative `clamp()` over container queries:** Griffel ^1.5.0 does not support `@container` queries. True container queries would require inline styles or a separate CSS mechanism outside Griffel's atomic system. Viewport-relative `clamp()` provides sufficient width-adaptive behavior for KPI cards because the cards are always rendered inside a proportional grid cell whose width tracks the viewport.

**Changes:**
1. **Value font:** `1.75rem` → `clamp(1.25rem, 3vw, 1.75rem)` — scales from 20px (narrow, e.g., 400px viewport) to 28px (wide, ≥600px viewport)
2. **Label:** Added `overflow: hidden`, `text-overflow: ellipsis`, `white-space: nowrap` for graceful truncation at narrow widths
3. **Subtitle:** Same truncation treatment added

**Tradeoff:** `vw`-based scaling responds to viewport width, not card width directly. In a two-column layout where cards occupy ~50% of the viewport, the scaling midpoint shifts — but the `clamp()` bounds ensure the value is always between 20px and 28px, both of which are legible. Full container-query support can be adopted when Griffel upgrades to support `@container`.

**Files modified:**
- `packages/ui-kit/src/HbcKpiCard/index.tsx` — `clamp()` value font + truncation on label/subtitle
- `packages/ui-kit/package.json` — version 2.2.57 → 2.2.58

---

### 10A.64 UIF-043-addl: Container-Aware KPI Layout Foundation

**Severity:** High
**Category:** Layout / Information Density

**Prior defect:** Three fixed-column grids forced KPI cards into unreadable arrangements:
- `tileGrid` (`HubSecondaryZone`): `repeat(2, 1fr)` put both card groups side-by-side in the narrow right panel, each getting ~50% of ~400px = ~200px, making secondary cards ~60-90px wide
- `PersonalAnalyticsCard kpiGrid`: `repeat(3, 1fr)` forced 3 cards into ~60px columns
- `AgingBlockedCard kpiGrid`: `repeat(2, 1fr)` forced 2 cards into ~90px columns

**Fix — three layers:**

1. **`HubSecondaryZone tileGrid`**: Changed from `repeat(2, 1fr)` to `1fr` — card groups now stack vertically, each getting full panel width. Removed unused `HBC_BREAKPOINT_MOBILE` mobile override (now single-column at all widths).

2. **`PersonalAnalyticsCard kpiGrid`**: Changed from `repeat(3, 1fr)` to `repeat(auto-fill, minmax(120px, 1fr))` — adapts to container width. At ~360px panel: 2 columns. At ~500px+: 3 columns. Hero card still spans full width via `gridColumn: '1 / -1'`.

3. **`AgingBlockedCard kpiGrid`**: Same `repeat(auto-fill, minmax(120px, 1fr))` — 2 cards adapt to available space.

**Container queries not used** — Griffel ^1.5.0 doesn't support `@container`. The `auto-fill + minmax()` pattern provides container-responsive behavior at the CSS Grid level without requiring container queries or JS measurement. When Griffel supports `@container`, this can be upgraded.

**Files modified:**
- `apps/pwa/src/pages/my-work/HubSecondaryZone.tsx` — tileGrid to single-column stack
- `apps/pwa/src/pages/my-work/cards/PersonalAnalyticsCard.tsx` — auto-fill grid
- `apps/pwa/src/pages/my-work/cards/AgingBlockedCard.tsx` — auto-fill grid
- `apps/pwa/package.json` — version 0.12.59 → 0.12.60

---

### 10A.65 UIF-044-addl: KPI Card Readable Minimum Width Refinement

**Severity:** Medium
**Category:** Layout / Readability

**Fix:** Increased KPI card grid `minmax()` from `120px` to `130px` for better readability. 130px gives each card room for the label (12px), adaptive value (20–28px via clamp), and trend pill badge without compression.

Reflow thresholds now:
| Panel width | Columns | Card width |
|---|---|---|
| ≥414px | 3 | ~130px each |
| 272–413px | 2 | ~130–200px each |
| <272px | 1 | full width |

Added `minHeight: 0` to prevent grid blowout from `minmax()` in nested flex/grid contexts.

**Files modified:**
- `apps/pwa/src/pages/my-work/cards/PersonalAnalyticsCard.tsx` — minmax 120→130, minHeight: 0
- `apps/pwa/src/pages/my-work/cards/AgingBlockedCard.tsx` — minmax 120→130, minHeight: 0
- `apps/pwa/package.json` — version 0.12.60 → 0.12.61

---

### 10A.66 UIF-045-addl: Adaptive KPI Card Density Modes

**Severity:** Medium
**Category:** Responsive / Readability

**Fix:** Made KPI card internals adapt to narrow/wide states via `clamp()`:

| Property | Narrow (≤400px vp) | Wide (≥600px vp) |
|---|---|---|
| Horizontal padding | 10px | 20px |
| Vertical padding | 10px | 14px |
| Gap | 3px | 6px |
| Min-height | 80px | 100px |
| Value font | 20px | 28px (existing) |
| Trend max-width | 40px (arrow only) | 120px (full label) |

Content priority at narrow widths: value → label → trend arrow → subtitle (truncated) → trend label (hidden). All achieved via CSS `clamp()` + `text-overflow: ellipsis` — no JS measurement or container queries needed.

**Files modified:**
- `packages/ui-kit/src/HbcKpiCard/index.tsx` — adaptive padding, gap, min-height, trend max-width
- `packages/ui-kit/package.json` — version 2.2.58 → 2.2.59

---

### 10A.67 UIF-046-addl: Constrained-Height KPI Overflow

**Severity:** Medium
**Category:** Layout / Prioritization

**Fix:** On short viewports (< 700px height), the AgingBlockedCard group collapses into a `<details>` disclosure element with summary "More insights (2)", keeping the hero card + primary 3 KPIs always visible. On normal-height viewports, the cards render normally. This prioritizes the most critical KPIs (Total Items, Action Now, Blocked, Unread) and lets executives expand the aging group when needed.

Priority order under height constraint:
1. Hero KPI (Total Items) — always visible
2. Primary secondary cards (Action Now, Blocked, Unread) — always visible
3. Executive aging cards (Escalation Candidates, Aging) — collapsed behind "More insights" on short viewports

Pattern consistent with `HubTertiaryZone`'s `<details>` disclosure widget. Semantic HTML, keyboard-accessible, no JS measurement beyond `window.innerHeight` check.

**Files modified:**
- `apps/pwa/src/pages/my-work/cards/AgingBlockedCard.tsx` — short-viewport disclosure collapse
- `apps/pwa/package.json` — version 0.12.61 → 0.12.62

---

### 10A.68 KPI Layout Documentation Hardening + Final Readiness

**Category:** Documentation / Compliance

**Docs updated:**
- `docs/reference/ui-kit/HbcKpiCard.md` — Complete rewrite reflecting current implementation: added `subtitle`, `icon`, `ariaLabel` props; updated trend description from plain text arrows to colored pill badges; added Adaptive Sizing section with `clamp()` table; added Gradient Wash section; added Grid Integration section; removed outdated "max-width 240px" and "min-width 160px"; updated accessibility section with `aria-label` on trend.

**Final readiness judgment — Insights KPI Layout (UIF-039 through UIF-046):**

The Insights panel KPI layout is implementation-ready and governance-aligned:

1. **Duplicate Blocked card removed** (UIF-039) — single canonical Blocked KPI in PersonalAnalyticsCard
2. **Hero card** enhanced with proportional breakdown bar (UIF-040) — no longer empty horizontal space
3. **Secondary cards** improved with larger value font, pill badge trends, adaptive padding (UIF-041)
4. **Typography scales** via `clamp()` (UIF-042) — value 20–28px, labels truncate
5. **Container-aware grids** (UIF-043) — `auto-fill` with `minmax(130px, 1fr)` replaces fixed columns
6. **Readable minimum** 130px per card (UIF-044) — 3-up at 414px+, 2-up at 272px+, 1-up below
7. **Adaptive density** (UIF-045) — padding, gap, min-height, trend truncation all scale with viewport
8. **Constrained-height overflow** (UIF-046) — aging cards collapse behind disclosure on short viewports

**Known limitations:**
- `clamp()` uses `vw` units (viewport width), not container width — sufficient but not pixel-perfect to card width
- Full container query support deferred until Griffel upgrades to support `@container`
- Data table scrollbar issue (separate from KPI layout) remains an open item

**Files modified:**
- `docs/reference/ui-kit/HbcKpiCard.md` — complete rewrite

---

### 10A.69 UIF-047-addl: Quick Access Component Extraction

**Severity:** Medium
**Category:** Refactor / Component Architecture

**What changed:** Decomposed the Quick Access zone into two standalone components:

1. **`QuickActionsMenu`** (new) — extracted from `QuickActionsCard`. Adds `data-hbc-ui="quick-actions-menu"` wrapper. Same action buttons and navigation logic.
2. **`RecentActivityCard`** (new) — extracted from `RecentContextCard`. Heading renamed from "Recent Context" to "Recent Activity". Same empty state + Browse Projects CTA.
3. **Old files deleted:** `QuickActionsCard.tsx`, `RecentContextCard.tsx`
4. **Tile adapters updated:** `QuickActionsTile.tsx` and `RecentContextTile.tsx` now import from the new components

**Follow-on items deferred:**
- Desktop tab-row action strip pattern (future UIF)
- Mobile bottom-sheet pattern (future UIF)
- Final right-panel layout optimization (future UIF)

**Files changed:**
- `apps/pwa/src/pages/my-work/cards/QuickActionsMenu.tsx` — new file
- `apps/pwa/src/pages/my-work/cards/RecentActivityCard.tsx` — new file
- `apps/pwa/src/pages/my-work/cards/QuickActionsCard.tsx` — deleted
- `apps/pwa/src/pages/my-work/cards/RecentContextCard.tsx` — deleted
- `apps/pwa/src/pages/my-work/tiles/QuickActionsTile.tsx` — updated import
- `apps/pwa/src/pages/my-work/tiles/RecentContextTile.tsx` — updated import
- `apps/pwa/package.json` — version 0.12.62 → 0.12.63

---

### 10A.70 UIF-048-addl: Desktop Quick Actions Strip in Tabs Row

**Severity:** Medium
**Category:** Layout / Quick Actions

**Fix:** Added a `rightSlot` prop to `HubTeamModeSelector` and a new `QuickActionsStrip` component for desktop-only compact action buttons in the tab row.

- **`HubTeamModeSelector`** — `rightSlot?: ReactNode` renders on the right side of the tab bar via flexbox `space-between`. The `rightSlotWrap` div is hidden below `HBC_BREAKPOINT_SIDEBAR` (1024px) with `display: none`.
- **`QuickActionsStrip`** — compact inline strip with 3 ghost buttons (New, Requests, Hub) using the same TanStack Router navigation as `QuickActionsMenu`. No HbcCard wrapper. `data-hbc-ui="quick-actions-strip"`.
- **`MyWorkPage`** passes `<QuickActionsStrip />` as `rightSlot` to `HubTeamModeSelector`.
- **Tab row is already sticky** via `WorkspacePageShell.stickyHeaderBand` at `top: 56px; z-index: 2` — no additional sticky changes needed.

Desktop-only visibility enforced at the CSS level in `HubTeamModeSelector.rightSlotWrap`. Pages that don't pass `rightSlot` render identically to before.

**Files changed:**
- `apps/pwa/src/pages/my-work/cards/QuickActionsStrip.tsx` — new compact strip component
- `apps/pwa/src/pages/my-work/HubTeamModeSelector.tsx` — `rightSlot` prop + flex layout + responsive hide
- `apps/pwa/src/pages/my-work/MyWorkPage.tsx` — passes QuickActionsStrip as rightSlot
- `apps/pwa/package.json` — version 0.12.63 → 0.12.64

---

### 10A.71 UIF-049-addl: Mobile Quick Actions Sheet + FAB Trigger

**Severity:** Medium
**Category:** Mobile / Quick Actions

**Implementation:**

1. **`QuickActionsSheet`** — new bottom-sheet overlay component with:
   - Scrim backdrop (dismiss on tap)
   - Bottom-anchored panel with drag handle, heading, full-width action buttons
   - Swipe-to-dismiss via touch event tracking (80px threshold)
   - `role="dialog"`, `aria-modal="true"`, focus trap (auto-focus on open)
   - Escape key dismiss
   - z-index 1200 (above bottomNav 300, below modal 1300)
   - iOS safe-area-inset-bottom support
   - Reduced-motion respect (`prefers-reduced-motion`)

2. **Mobile FAB trigger** — 48px floating action button (orange `#F37021`) positioned above the bottom nav, visible only below 1024px via `@media (max-width: 1023px)`. Hidden on desktop where the tab-row `QuickActionsStrip` is active.

3. **MyWorkPage wiring** — `isActionsSheetOpen` state, FAB opens sheet, sheet dismiss closes it. Sheet rendered at page root level (outside `WorkspacePageShell`) to avoid overflow clipping.

**Follow-on:** The FAB uses an inline `<style>` tag for responsive visibility — this should be migrated to a Griffel class in a future cleanup. The bottom-nav Actions slot integration (modifying the shared `HbcBottomNav`) was deferred to avoid changing the shared component in this pass.

**Files changed:**
- `apps/pwa/src/pages/my-work/cards/QuickActionsSheet.tsx` — new sheet component
- `apps/pwa/src/pages/my-work/MyWorkPage.tsx` — sheet state + FAB trigger + sheet render
- `apps/pwa/package.json` — version 0.12.64 → 0.12.65

---

### 10A.72 UIF-050-addl: Right Panel Redesign — RecentActivityCard + Gap

**Severity:** Medium
**Category:** Layout / Right Panel

**Changes:**

1. **HubTertiaryZone** simplified from canvas tile rendering (MyWorkCanvas + asymmetric 2-column grid + narrow disclosure) to a direct `<RecentActivityCard />` render. The old canvas indirection is no longer needed because QuickActionsMenu moved to the tab row strip (desktop) and FAB/sheet (mobile).

2. **Right panel gap** changed from `0px` to `16px` in `HubZoneLayout.tsx` rightPanel `≥SIDEBAR` media query — proper spacing between Insights and Recent Activity cards.

3. **RecentActivityCard** already uses full panel width (single-column layout, no fixed-width constraints).

Final right panel composition (≥1024px):
```
┌─────────────────────────┐
│ Insights (HbcCard primary)│
│ [hero + secondary KPIs]  │
├─── 16px gap ─────────────┤
│ Recent Activity (supporting)│
│ [empty state / items]    │
└─────────────────────────┘
```

Sticky overflow: `maxHeight: calc(100vh - 210px)` with `overflowY: auto` on the right panel — both cards scroll together when panel height is constrained.

**Files changed:**
- `apps/pwa/src/pages/my-work/HubTertiaryZone.tsx` — simplified to direct RecentActivityCard render
- `apps/pwa/src/pages/my-work/HubZoneLayout.tsx` — right panel gap 0→16px
- `apps/pwa/package.json` — version 0.12.65 → 0.12.66

---

### 10A.73 UIF-050-fix: Insights flex-shrink protection
See §10A.72 follow-up. `flexShrink: 0` on secondaryZone at ≥SIDEBAR.

---

### 10A.74 UIF-051-addl: Quick Access Cleanup — A11y, Dead Code

**Category:** Accessibility / Cleanup

**Accessibility fixes to `QuickActionsSheet`:**
- Added `aria-labelledby="qa-sheet-heading"` referencing the `<h3 id="qa-sheet-heading">` (replaces plain `aria-label`)
- Added focus-return: captures `document.activeElement` on open, restores focus to trigger on dismiss
- Added `role="presentation"` on drag handle for screen readers
- Deferred focus via `requestAnimationFrame` to avoid fighting the entry animation

**Dead code removed:**
- Deleted `QuickActionsTile.tsx` — no longer consumed (HubTertiaryZone uses direct render)
- Deleted `RecentContextTile.tsx` — same
- Removed `my-work.utility.quick-access` and `my-work.utility.recent-context` tile definitions from `myWorkTileDefinitions.ts`
- Updated MyWorkPage doc comment from "utility/quick-access" to "Recent Activity card"

**Final Quick Access redesign readiness:**
The Quick Access zone is now fully decomposed into three platform-adaptive surfaces:
1. Desktop tab-row strip (UIF-048) — `QuickActionsStrip` in `rightSlot`
2. Mobile bottom sheet (UIF-049) — `QuickActionsSheet` with FAB trigger
3. Right panel (UIF-050) — `RecentActivityCard` direct render in HubTertiaryZone

No Storybook stories existed for the old `QuickAccessCard` — none to remove. New component stories are a follow-on item when the Storybook story infrastructure is extended to cover page-local components.

**Files changed:**
- `apps/pwa/src/pages/my-work/cards/QuickActionsSheet.tsx` — a11y: aria-labelledby, focus-return, drag handle role
- `apps/pwa/src/pages/my-work/tiles/myWorkTileDefinitions.ts` — removed utility tile definitions
- `apps/pwa/src/pages/my-work/tiles/QuickActionsTile.tsx` — deleted
- `apps/pwa/src/pages/my-work/tiles/RecentContextTile.tsx` — deleted
- `apps/pwa/src/pages/my-work/MyWorkPage.tsx` — updated doc comment
- `apps/pwa/package.json` — version 0.12.67 → 0.12.68

---

## 11. Acceptance Gate Contribution

| Gate | Contributing Items | Pass Condition |
|---|---|---|
| **Mold-Breaker Readiness** | All 18 UIFs + G0 | UI quality assessment re-evaluation ≥ 7/10; all MB-01 through MB-08 principles demonstrably addressed |
| **@hbc/project-canvas Adoption** | G0 | Secondary and tertiary zones rendered via `HbcProjectCanvas`; tile registry populated; `@hbc/project-canvas` in `apps/pwa` dependencies |
| **Design System Conformance** | UIF-001, 003, 004, 007, 011 | Zero hardcoded hex/rgb/px values in component CSS; all colors from `HBC_*` tokens; `useHbcTheme()` drives theme |
| **Field Usability** | UIF-009, 013, 017 | Touch targets meet `HBC_DENSITY_TOKENS[tier].touchTargetMin`; keyboard focus visible; sidebar nav ≥4 destinations |
| **Information Architecture** | UIF-002, 006, 008, 012, 014 | Two-column `ListLayout`+`DashboardLayout` split view; `HbcCommandBar`; `HbcKpiCard` click-to-filter; context-aware CTAs |
| **Accessibility** | UIF-005, 009, 017, 018 | `aria-expanded`, `aria-pressed`, `aria-live` correct per T09; touch targets WCAG 2.5.5; focus rings WCAG 2.4.7 |
| **Build Quality** | UIF-010, 015 | No dev overlays in non-dev builds; breakpoints use `BREAKPOINT_*` tokens; no horizontal scroll at supported viewports |

---

## 12. Locked Decisions

| Decision | Resolution | Authority |
|---|---|---|
| UI-Kit documents as governing authority | All design decisions in this plan are governed by `docs/reference/ui-kit/UI-Kit-*`. A design choice not traceable to a governing source requires Experience lead approval and a plan amendment. No exceptions. | MB-08 — "single design token set consumed by all surfaces — zero per-surface visual overrides" |
| No hardcoded values in component CSS | Component CSS must use `HBC_*` tokens or CSS custom properties derived from them. Hardcoded hex, rgb, or pixel values are prohibited per the ESLint `enforce-hbc-tokens` rule. Illustrative values in this plan document are references, not specifications. | `UI-Kit-Usage-and-Composition-Guide.md` — "Hardcoding colors or spacing: Use HBC_* tokens" |
| Fluent UI import path | All Fluent UI primitives must be imported through `@hbc/ui-kit`, never directly from `@fluentui/react-components`. Violation of D-10. | `UI-Kit-Usage-and-Composition-Guide.md` — "Correct: import from @hbc/ui-kit. Incorrect — violates D-10." |
| `useDensity()` for all density-aware sizing | All row heights, touch targets, font sizes, and tap spacing must resolve through `useDensity()` and `HBC_DENSITY_TOKENS[tier]`. No per-component hardcoded size values. | `UI-Kit-Field-Readability-Standards.md` — density application model |
| `useHbcTheme()` for theme | Dark canvas background is driven by `useHbcTheme()` and the field/dark theme token system. Ad-hoc `background-color` declarations on page-level elements are prohibited. | `UI-Kit-Usage-and-Composition-Guide.md` — `useHbcTheme()`, `useFieldMode()` |
| project-canvas for secondary/tertiary zones | `HubSecondaryZone` and `HubTertiaryZone` must use `HbcProjectCanvas`. Custom manual grid in these zones is not acceptable. | MB-01 — role-based project canvas is a Wave 0 mold-breaker deliverable |
| project-canvas exclusion for primary zone | `HubPrimaryZone` must NOT be wrapped in `HbcProjectCanvas`. The feed's own state machine governs lane display and empty states. | Documented in `HubPrimaryZone.tsx` source; architectural intent |
| Card/list view surface type for work feed | Personal Work Hub tasks use the **Card/list view** surface type per `UI-Kit-Adaptive-Data-Surface-Patterns.md` T06 Wave 1 Surface Assignments. | T06 — "Personal Work Hub tasks: Card/list view — Work queue; priority + status per item" |
| `DashboardLayout` + `HbcKpiCard` for analytics | KPI tiles use the **Summary Strip / KPI Surface** pattern with `DashboardLayout` + `HbcKpiCard`. Custom card implementations are not acceptable. | T06 — "Project dashboard header: Summary strip / KPI — Status communication; 3-second read" |
| `HbcCommandBar` for the command surface | The command/filter toolbar uses `HbcCommandBar` from `@hbc/ui-kit`. Custom toolbar grid is not acceptable. | T06 — "Component mapping: HbcCommandBar" |
| Module slug exposure | Raw database slugs must never appear in rendered UI. `resolveModuleDisplayName()` is the single source of truth. | MB-01 — reduce cognitive load; no developer-internal labels |
| `resolveCtaLabel` single source of truth | CTA label derivation must go through a single `resolveCtaLabel(item: WorkItem): string` utility in `@hbc/my-work`, covered by unit tests. | MB-01 — reach first actionable item in <30 seconds |
| Touch target minimum | 44×44px minimum in all modes, 48×48px aim in touch density. Non-negotiable — WCAG 2.5.5 and MB-07. | `UI-Kit-Field-Readability-Standards.md`; MB-07 |
| Dev tools gating | Dev overlays are unconditionally prohibited in production and PWA standalone mode. Z-index ≤ governed `toast` layer (1300) even in dev. | MB-08; `UI-Kit-Visual-Language-Guide.md` z-index layers |
| Responsive breakpoints | Breakpoints use `BREAKPOINT_*` tokens from `UI-Kit-Visual-Language-Guide.md`. No horizontal scroll at ≥1024px. | MB-04; `BREAKPOINT_TABLET: 1024px` |

---

**Last Updated:** 2026-03-21 — UIF-013-addl: Interactive insight tiles. UIF-012-addl: Nav dedup. UIF-010-addl: Source tooltips. UIF-018/020/019-addl: Sticky header, priority groups, single scroll. UIF-001–009-addl: Various. All grounded in `docs/reference/ui-kit/UI-Kit-*`.
**Governing Authority:** [Phase 2 Plan §8, §10, §14](../03_Phase-2_Personal-Work-Hub-and-PWA-Shell-Plan.md); [UI-Kit Reference Documents](../../../reference/ui-kit/)
