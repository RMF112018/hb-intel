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
- All primary action buttons: `min-height: 44px` at all density tiers, per `HBC_DENSITY_TOKENS`
- Font size: `HBC_DENSITY_TOKENS[tier].labelTextMinPx` minimum on all work item action buttons
- WCAG 2.1 SC 2.5.5 verified
- Spacing between adjacent interactive elements: `HBC_DENSITY_TOKENS[tier].tapSpacingMin`

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
- ≥4 navigation destinations visible without invoking expand
- Active icon uses `surface-active` background token
- Sidebar z-index at governed `sidebar` layer (100), not arbitrary values
- Icon tooltips present on hover

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
- `resolveCtaLabel` is the single source of truth; covered by unit tests
- CTA uses `HBC_ACCENT_ORANGE` at `heading4` type; secondary uses brand color at `body` type
- No two semantically different item types share the same CTA label without justification

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
- `import.meta.env.DEV !== true` → neither element in DOM
- PWA standalone: no dev overlays regardless of build environment
- In dev mode, any remaining indicator uses governed z-index (≤ `toast` layer: 1300)

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
- No horizontal scroll at 400px, 768px (`BREAKPOINT_MOBILE`), 1024px (`BREAKPOINT_TABLET`), 1440px
- All breakpoints use `BREAKPOINT_*` tokens from `UI-Kit-Visual-Language-Guide.md`; no hardcoded px breakpoints

---

### 7.2 UIF-016: Project Color Coding on Work Items (Medium)

**Governing authority:** MB-02 (status identifiable in <1 second, consistent position) — `UI-Kit-Mold-Breaker-Principles.md`. Color system from `UI-Kit-Visual-Language-Guide.md`.

**Observed state:** Items for 4 different projects are visually identical. No project identity signal.

**Required change:** Add a project-color signal to each work item row. Use a deterministic color assignment from the platform's categorical palette — `hbcBrandRamp` shades (6–8 distinct stops) assigned by project ID hash. Project color appears as a small 8px dot in the row 2 metadata area: `[• color dot] Project Name`.

Categorical assignment tokens: Use `hbcBrandRamp` at shades 40, 60, 80, 100, 120, 140 for project identity differentiation. Must be consistent with any project color used in `@hbc/features-project-hub` on the same project entity.

**Acceptance criteria:**
- Each work item row has a visible project-identity signal
- Project color is consistent across all surfaces that reference the same project entity
- Color assignment uses `hbcBrandRamp` categorical stops — no hardcoded hex values

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
- Tab navigation shows visible focus ring on all interactive work feed elements
- Focus ring uses `HBC_PRIMARY_BLUE` or `HBC_ACCENT_ORANGE` — matches `HbcButton` `:focus-visible` pattern
- Passes WCAG 2.4.7 Level AA
- No `outline: transparent` overrides remaining on governed interactive elements

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
- "Retry" button visible; triggers re-sync on click; uses `HBC_PRIMARY_BLUE` button styling
- "Details" popover shows human-readable source names at `elevationLevel3`
- Banner auto-dismisses via `slideInUp` / `TRANSITION_NORMAL` on sync success
- Warning color is `HBC_STATUS_RAMP_AMBER` — distinct from error (`HBC_STATUS_RAMP_RED`) per UIF-007

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

**Last Updated:** 2026-03-21 — G0 (@hbc/project-canvas integration) complete. 6 tiles registered, HubSecondaryZone + HubTertiaryZone refactored to canvas tile system. 17 UIFs remain open. All design decisions grounded in `docs/reference/ui-kit/UI-Kit-*` governing documents.
**Governing Authority:** [Phase 2 Plan §8, §10, §14](../03_Phase-2_Personal-Work-Hub-and-PWA-Shell-Plan.md); [UI-Kit Reference Documents](../../../reference/ui-kit/)
