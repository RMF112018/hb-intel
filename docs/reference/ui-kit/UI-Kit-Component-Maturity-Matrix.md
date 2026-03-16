# UI Kit Component Maturity Matrix

> **Doc Classification:** Living Reference (Diátaxis) — Component maturity baseline for `@hbc/ui-kit` v2.2.0 and all platform/shared-feature UI packages. Updated post-WS1 completion (T01–T13) to reflect T03 tokenization, T04 hierarchy additions, T07 component polish, T09 accessibility remediation, and T11 test infrastructure.

**Produced by:** WS1-T01 (initial baseline), updated post-WS1 completion
**Date:** 2026-03-16 (updated)
**Governing plan:** `docs/architecture/plans/UI-Kit/WS1-T01-Inventory-Maturity-Scoring-Consumer-Map.md`

---

## How to Read This Matrix

### Maturity Tiers

| Tier | Label | Meaning |
|------|-------|---------|
| **A** | Production-ready | Visually polished, accessible, tested, documented, field-capable, and proven in real compositions. No known quality gaps. |
| **B** | Strong but needs polish | Functionally solid and visually close, but has identified gaps in polish, spacing rhythm, hierarchy expression, field readiness, or documentation. Addressable in T07. |
| **C** | Functional but incomplete | Works correctly but visually immature, underdocumented, undertested, or missing key states. Requires significant work in T07. |
| **D** | Placeholder / minimal | Minimal implementation that does not meet production quality. Must be upgraded or removed from the critical path. |

### Column Key

| Column | Values | What It Captures |
|--------|--------|------------------|
| **Tier** | A / B / C / D | Overall maturity classification |
| **Consumers** | App and package names | Which packages import this component |
| **W1 Crit** | Critical / High / Medium / Low | Wave 1 surface dependency (PWA, Project Hub, other Wave 1 apps) |
| **Visual** | Premium / Acceptable / Weak / Placeholder | Visual polish level |
| **Hierarchy** | Strong / Adequate / Weak | Contribution to visual hierarchy in compositions |
| **Field** | Ready / Partial / Not ready | Usability in bright-light, imprecise-touch, gloved conditions |
| **A11y** | Pass / Partial / Unknown / Fail | Keyboard, ARIA, contrast compliance |
| **Theme** | Yes / Partial / No | Correct behavior across all active themes |
| **Tests** | Yes / Partial / None | Unit, interaction, or visual regression tests |
| **Docs** | Yes / Partial / None | Reference doc and/or Storybook stories |
| **Comp** | Elevates / Neutral / Weakens | Contribution to overall composition quality |

### Honesty Standard

Tier A is reserved for components that genuinely meet the full production standard. An over-optimistic matrix wastes T07 effort and produces a false T13 baseline.

---

## Components — Main Entry Point (`@hbc/ui-kit`)

### Core Components

| Component | Tier | Consumers | W1 Crit | Visual | Hierarchy | Field | A11y | Theme | Tests | Docs | Comp |
|-----------|------|-----------|---------|--------|-----------|-------|------|-------|-------|------|------|
| HbcStatusBadge | A | pwa, estimating, accounting, admin, project-hub, business-development, hb-site-control | High | Premium | Strong | Ready | Pass | Yes | Yes | Yes | Elevates |
| HbcPeoplePicker | D | estimating, pwa | Medium | Placeholder | Weak | Not ready | Partial | Partial | None | None | Weakens |
| ProvisioningNotificationBanner | D | admin, pwa | Medium | Placeholder | Weak | Not ready | Partial | No | None | None | Weakens |
| HbcEmptyState | A | pwa, estimating, accounting, admin, project-hub, business-development | High | Acceptable | Strong | Ready | Pass | Yes | Yes | Yes | Elevates |
| HbcErrorBoundary | A | pwa, estimating, accounting, admin, project-hub, human-resources, safety, risk-management, operational-excellence, quality-control-warranty, leadership | Critical | Acceptable | Adequate | Ready | Pass | Yes | Yes | Yes | Elevates |
| HbcButton | A | pwa, estimating, accounting, admin, project-hub | Critical | Acceptable | Adequate | Ready | Pass | Yes | Yes | Yes | Elevates |
| HbcTypography | A | pwa, estimating, accounting, admin, project-hub, business-development | High | Premium | Strong | Ready | Pass | Yes | None | Yes | Elevates |
| HbcSpinner | A | pwa, estimating, accounting, admin, project-hub | Critical | Acceptable | Adequate | Ready | Pass | Yes | Yes | Yes | Elevates |

**Assessment notes:**
- **HbcStatusBadge (A, upgraded from B):** Dual-channel icons, forced-colors support, animation, full token coverage. 18 tests covering all 12 variants, aria-label, icon injection, size, className.
- **HbcPeoplePicker (D):** Raw textarea with UPN string parsing. No chip display, no Microsoft Graph search, no validation. `tenantId` and `accessToken` props are silently discarded.
- **ProvisioningNotificationBanner (D):** Uses Tailwind utility classes (`bg-blue-50`, etc.) — completely outside the HBC token and Griffel system. Emoji icons. No stories, no docs, no tests.
- **HbcEmptyState (A, upgraded from B):** Backward-compatible dual CTA pattern (icon/illustration, primaryAction/action). Reduced-motion compliant. 10 tests covering title, description, icon/illustration compat, primaryAction/action compat, dual actions, data attributes.
- **HbcErrorBoundary (A, upgraded from B):** Default fallback migrated to Griffel (WS1-T07). Semantic typography tokens, status color tokens, radii tokens. 7 tests covering error catching, default fallback, retry, custom fallback render prop, onError callback.
- **HbcButton (A, upgraded from B):** Hover states use semantic tokens per WS1-T03. Touch auto-scale well done. 10 tests covering variants, sizes, loading/disabled states, onClick, type forwarding.
- **HbcTypography (A):** Fully tokenized via `hbcTypeScale`, correct semantic element mapping, polymorphic `as` prop, truncation utility. The closest thing to production-ready in the kit.
- **HbcSpinner (A, upgraded from B):** `prefers-reduced-motion` support (WS1-T07). 9 tests covering role="status", all 3 sizes with dimension/borderWidth, labels, custom color, data attributes.

### Form Components

| Component | Tier | Consumers | W1 Crit | Visual | Hierarchy | Field | A11y | Theme | Tests | Docs | Comp |
|-----------|------|-----------|---------|--------|-----------|-------|------|-------|-------|------|------|
| HbcTextField | B | pwa, estimating, accounting, admin | Critical | Acceptable | Adequate | Ready | Pass | Yes | None | Yes | Elevates |
| HbcSelect | B | pwa, estimating, accounting, admin | Critical | Acceptable | Adequate | Ready | Pass | Yes | None | Yes | Elevates |
| HbcCheckbox | B | pwa, estimating, accounting, admin | High | Acceptable | Adequate | Ready | Pass | Yes | None | Yes | Neutral |
| HbcFormLayout | C | pwa, estimating, accounting, admin | High | Acceptable | Weak | Not ready | Unknown | Partial | None | Yes | Neutral |
| HbcForm | B | pwa, estimating, accounting, admin | Critical | Acceptable | Adequate | Ready | Partial | Partial | None | Yes | Elevates |
| HbcFormSection | B | pwa, estimating | High | Acceptable | Adequate | Ready | Pass | Partial | None | Yes | Neutral |
| HbcFormRow | B | pwa, estimating, accounting, admin | High | Acceptable | Adequate | Ready | Unknown | Partial | None | Yes | Neutral |
| HbcStickyFormFooter | B | pwa, estimating, accounting, admin | High | Acceptable | Adequate | Ready | Unknown | Partial | None | Yes | Neutral |
| HbcFormGuard | B | pwa, estimating | High | Acceptable | Adequate | Ready | Partial | Partial | None | Yes | Elevates |

**Assessment notes:**
- **HbcFormLayout (C):** No responsive column collapse — a 4-column grid on 320px mobile. No breakpoint-aware column reduction.
- **HbcRichTextEditor** is assessed under Input Components below.

### Surface & Overlay Components

| Component | Tier | Consumers | W1 Crit | Visual | Hierarchy | Field | A11y | Theme | Tests | Docs | Comp |
|-----------|------|-----------|---------|--------|-----------|-------|------|-------|-------|------|------|
| HbcCard | B | estimating, accounting, admin, project-hub | High | Acceptable | Strong | Ready | Pass | Yes | None | Yes | Elevates |
| HbcPanel | B | admin, accounting, project-hub | High | Acceptable | Strong | Ready | Pass | Partial | None | Yes | Elevates |
| HbcModal | B | admin, accounting | High | Acceptable | Strong | Partial | Pass | Yes | None | Yes | Elevates |
| HbcTearsheet | C | pwa, estimating, accounting | High | Acceptable | Adequate | Partial | Partial | Partial | None | Yes | Neutral |
| HbcPopover | C | admin | Low | Acceptable | Adequate | Not ready | Partial | Partial | None | Yes | Neutral |
| HbcAnchoredPopover | B | ai-assist, app-shell internal | Low | N/A (container) | N/A | Ready | Pass | N/A | None | Partial | Neutral |

**Assessment notes:**
- **HbcCard (B, improved in WS1-T04):** Added `weight` prop with 3 visual weight classes (primary/standard/supporting) for anti-flatness. Fully tokenized via `HBC_SURFACE_LIGHT`, `HBC_RADIUS_XL`, and elevation tokens. `data-hbc-card-weight` attribute for testing. No test file prevents A.
- **HbcModal (B, improved in WS1-T09):** Added `role` prop (default `'dialog'`, supports `'alertdialog'`). Added `prefers-reduced-motion` to both desktop (scaleIn) and mobile (slideInFromBottom) animations. Close button is 32px on desktop (below 44px WCAG touch target); mobile gets 44px.
- **HbcTearsheet (C):** Navigation buttons are raw `<button>` elements rather than `HbcButton`. Close button 32px. No `aria-labelledby`.
- **HbcPopover (C):** No `role` attribute on popover (`role="dialog"` or `role="tooltip"` missing). Trigger is a plain `div` with no `role="button"` or `tabIndex`. Keyboard users cannot trigger it.
- **HbcAnchoredPopover (B):** Lightweight SPFx-safe positioning primitive exported from `@hbc/ui-kit/app-shell`. Ref-based anchor targeting with viewport edge clamping. No inherent styling — consumer responsibility. Supports ARIA pass-through. No focus trap or auto-focus (consumer responsibility). No unit tests for edge-clamping logic.

### Input Components

| Component | Tier | Consumers | W1 Crit | Visual | Hierarchy | Field | A11y | Theme | Tests | Docs | Comp |
|-----------|------|-----------|---------|--------|-----------|-------|------|-------|-------|------|------|
| HbcTextArea | B | accounting, estimating | Medium | Acceptable | Adequate | Partial | Partial | Partial | None | Yes | Neutral |
| HbcRichTextEditor | C | accounting | Low | Weak | Weak | Partial | Partial | Partial | None | Yes | Weakens |

**Assessment notes:**
- **HbcRichTextEditor (C):** Uses deprecated `document.execCommand` (removed from HTML spec). Uses `prompt()` for link URL input — synchronous modal dialog violating WCAG 3.2.1. Toolbar buttons are 28px (below 44px touch minimum).

### Data Components

| Component | Tier | Consumers | W1 Crit | Visual | Hierarchy | Field | A11y | Theme | Tests | Docs | Comp |
|-----------|------|-----------|---------|--------|-----------|-------|------|-------|-------|------|------|
| HbcCommandBar | B | pwa, project-hub, accounting, admin, estimating, business-development | High | Acceptable | Strong | Partial | Partial | Partial | None | Yes | Elevates |
| HbcDataTable | B | pwa, project-hub, accounting, admin, estimating, business-development, dev-harness | High | Acceptable | Strong | Ready | Partial | Yes | None | Yes | Elevates |
| HbcChart (+ Bar, Donut, Line) | B | pwa, leadership, admin, hb-site-control, dev-harness | High | Acceptable | Adequate | Not ready | Unknown | Yes | None | Yes | Elevates |
| HbcKpiCard | B | pwa, project-hub, leadership, hb-site-control | High | Acceptable | Adequate | Partial | Partial | Partial | None | Yes | Elevates |

**Assessment notes:**
- **HbcCommandBar (B):** Solid Fluent v9 toolbar with density auto-detection and saved views. Theme partial: uses `HBC_SURFACE_LIGHT` static tokens for view selector, which won't adapt in dark/field contexts.
- **HbcDataTable (B):** Most feature-complete data component — TanStack Table + virtualizer, 3-density system, card-stack mobile view, frozen columns. Inline editing lacks focus-trap; card-stack checkbox uses raw `<input>`.
- **HbcChart (B):** Correct lazy-load pattern. Custom ECharts theme uses hardcoded hex colors (not CSS variables) — won't adapt to dark themes. Canvas rendering has no `aria-label` or `role="img"`.
- **HbcKpiCard (B, improved in WS1-T03):** Clean and well-typed. `cardActive` background now uses `HBC_SURFACE_LIGHT['surface-active']` token (was hardcoded `#E8F1F8`). Trend arrows lack screen reader alternative text for direction.

### Page Shell & Layouts

| Component | Tier | Consumers | W1 Crit | Visual | Hierarchy | Field | A11y | Theme | Tests | Docs | Comp |
|-----------|------|-----------|---------|--------|-----------|-------|------|-------|-------|------|------|
| WorkspacePageShell | B | pwa (all pages), project-hub, accounting, admin, estimating, 10+ apps | Critical | Acceptable | Strong | Partial | Partial | Yes | None | Yes | Elevates |
| ToolLandingLayout | C | dev-harness, estimating (indirect) | Medium | Acceptable | Adequate | Not ready | Partial | Partial | None | None | Neutral |
| DetailLayout | B | pwa, accounting, estimating | High | Acceptable | Strong | Not ready | Partial | Partial | None | None | Elevates |
| CreateUpdateLayout | B | pwa, accounting, estimating | High | Acceptable | Strong | Not ready | Partial | Yes | None | None | Elevates |
| DashboardLayout | B | pwa, project-hub, leadership | High | Acceptable | Strong | Not ready | Partial | Partial | None | Yes | Elevates |
| ListLayout | B | pwa, project-hub, accounting, estimating | High | Acceptable | Strong | Not ready | Partial | Partial | None | Yes | Elevates |

**Assessment notes:**
- **WorkspacePageShell (B):** Platform's mandatory page container. Integrates breadcrumbs, banner, command bar, field-mode FAB. Still uses `HbcEmptyState` internally (not `HbcSmartEmptyState`) — known drift.
- **ToolLandingLayout (C):** Implements its own inline KPI card rendering, duplicating what `HbcKpiCard` provides. Action buttons are raw `<button>` with inline styles.
- **Layouts generally:** None have field mode adaptation. DetailLayout, CreateUpdateLayout, DashboardLayout, and ListLayout lack dedicated reference docs.

### App Shell Components

| Component | Tier | Consumers | W1 Crit | Visual | Hierarchy | Field | A11y | Theme | Tests | Docs | Comp |
|-----------|------|-----------|---------|--------|-----------|-------|------|-------|-------|------|------|
| HbcAppShell | B | pwa, admin, accounting, estimating, project-hub, 10+ app roots | Critical | Acceptable | Strong | Partial | Partial | Yes | None | Yes | Elevates |
| HbcThemeProvider | A | pwa, admin, accounting, estimating, project-hub, 10+ app roots | Critical | N/A | Strong | Ready | Pass | Yes | Yes | Partial | Elevates |
| HbcConnectivityBar | B | HbcAppShell (all app roots) | Critical | Acceptable | Strong | Partial | Pass | Yes | None | Yes | Elevates |
| HbcHeader | B | HbcAppShell (all app roots) | Critical | Acceptable | Strong | Partial | Partial | Yes | None | Yes | Elevates |
| HbcSidebar | B | HbcAppShell (all app roots, office mode) | Critical | Acceptable | Strong | Partial | Partial | Yes | None | Partial | Elevates |
| HbcProjectSelector | B | HbcHeader (all app roots) | Critical | Acceptable | Strong | Partial | Partial | Yes | None | Partial | Elevates |
| HbcToolboxFlyout | C | HbcHeader (all app roots) | High | Weak | Weak | Not ready | Partial | Yes | None | Partial | Weakens |
| HbcFavoriteTools | C | HbcHeader (all app roots) | High | Weak | Weak | Not ready | Partial | Partial | None | Partial | Weakens |
| HbcGlobalSearch | C | HbcHeader (all app roots) | Critical | Acceptable | Adequate | Not ready | Pass | Partial | None | Partial | Neutral |
| HbcCreateButton | B | HbcHeader (all app roots) | Critical | Acceptable | Adequate | Ready | Pass | Partial | None | Partial | Elevates |
| HbcNotificationBell | B | HbcHeader (all app roots) | Critical | Acceptable | Adequate | Not ready | Pass | Partial | None | Partial | Neutral |
| HbcUserMenu | B | HbcHeader (all app roots) | Critical | Acceptable | Strong | Partial | Partial | Yes | None | Partial | Elevates |

**Assessment notes:**
- **HbcThemeProvider (A):** Clean single-responsibility provider. Two relevant unit tests exist (`HbcThemeContext.test.tsx`, `ThemeResponsiveness.test.tsx`). No visual rendering concerns.
- **HbcToolboxFlyout (C):** Flyout body renders a placeholder string ("Tool grid — filtered by role (Phase 5)"). Has `role="dialog"` and escape dismissal, but core content is a stub.
- **HbcFavoriteTools (C):** Renders correctly when favorites exist but buttons have no `onClick` handler wired.
- **HbcGlobalSearch (C):** Trigger button is well-formed with Cmd+K shortcut. But no search panel is rendered — delegates to an external handler. `HbcCommandPalette` exists but is not wired in.
- **HbcProjectSelector (B):** `<button role="option">` inside `role="listbox"` is semantically incorrect (options should not be buttons).

### Messaging & Feedback

| Component | Tier | Consumers | W1 Crit | Visual | Hierarchy | Field | A11y | Theme | Tests | Docs | Comp |
|-----------|------|-----------|---------|--------|-----------|-------|------|-------|-------|------|------|
| HbcBanner | B | pwa, estimating | High | Acceptable | Strong | Ready | Pass | Yes | None | Yes | Elevates |
| HbcToastProvider + useToast | B | pwa, admin, accounting, estimating | High | Acceptable | Strong | Ready | Pass | Yes | None | Yes | Elevates |
| HbcTooltip | B | ui-kit internal | Low | Acceptable | Strong | Partial | Partial | Partial | None | Yes | Neutral |

**Assessment notes:**
- **HbcBanner (B, improved in WS1-T09):** Correct role assignment (`alert` vs `status`), `aria-live` added (assertive for error/warning, polite for info/success), token-based theming, entry animation with `prefers-reduced-motion` support. Missing dark-mode office variant.
- **HbcToastProvider (B):** Dual-context architecture is clean. Auto-dismiss timers properly cleared on unmount. Error category correctly requires manual dismiss.
- **HbcTooltip (B, improved in WS1-T09):** Position flip with viewport clamping is solid. Added `prefers-reduced-motion` support for fadeIn animation. Field mode tooltip bg uses hardcoded dark token.

### Navigation Components

| Component | Tier | Consumers | W1 Crit | Visual | Hierarchy | Field | A11y | Theme | Tests | Docs | Comp |
|-----------|------|-----------|---------|--------|-----------|-------|------|-------|-------|------|------|
| HbcBreadcrumbs | B | pwa | Medium | Acceptable | Strong | Ready | Pass | Yes | None | Yes | Elevates |
| HbcTabs | B | pwa, admin, estimating | High | Acceptable | Strong | Ready | Pass | Yes | None | Yes | Elevates |
| HbcPagination | B | pwa, admin | High | Acceptable | Strong | Ready | Pass | Yes | None | Yes | Neutral |
| HbcSearch | B | pwa, estimating | High | Acceptable | Strong | Ready | Pass | Yes | None | Yes | Neutral |
| HbcTree | B | ui-kit internal, feature packages | Medium | Acceptable | Strong | Ready | Pass | Yes | None | Yes | Elevates |

**Assessment notes:**
- **HbcTabs (B):** Roving tabIndex correctly implemented, skips disabled tabs. Orange 3px underline matches ADR-0023. Lazy panel rendering via optional panels prop.
- **HbcPagination (B):** Ellipsis truncation edge case when `maxPageButtons` ≤ 5. Page size selector uses native `<select>` (non-themeable).
- **HbcTree (B):** Full ARIA tree pattern with roving tabIndex, Home/End navigation, flat list for O(1) keyboard nav — one of the stronger nav implementations. Missing multi-select and type-ahead.

### Interaction Patterns

| Component | Tier | Consumers | W1 Crit | Visual | Hierarchy | Field | A11y | Theme | Tests | Docs | Comp |
|-----------|------|-----------|---------|--------|-----------|-------|------|-------|-------|------|------|
| HbcConfirmDialog | B | pwa, admin, accounting, estimating | High | Acceptable | Strong | Ready | Pass | Yes | None | Yes | Elevates |
| HbcCommandPalette | B | pwa, admin | High | Acceptable | Strong | Ready | Pass | Yes | None | Yes | Elevates |
| HbcBottomNav | B | pwa (mobile shell) | High | Acceptable | Adequate | Ready | Partial | Yes | None | Yes | Elevates |

**Assessment notes:**
- **HbcConfirmDialog (B, improved in WS1-T09):** Clean thin wrapper over `HbcModal`. Uses `role="alertdialog"` per WCAG alertdialog pattern (upgraded from `role="dialog"`). Loading state propagated to both buttons. Danger/warning variant branching correct.
- **HbcCommandPalette (B):** Most complex interaction component. Focus trap, keyboard nav, offline awareness, mobile full-screen, field mode actions, AI query integration, confirmation for destructive actions. Recent items cannot re-execute after session end.
- **HbcBottomNav (B):** iOS safe-area inset handled. Focus Mode integration via custom event. Missing `useFocusTrap` on More sheet; `aria-label` missing from individual nav items.

### Module-Specific Patterns

| Component | Tier | Consumers | W1 Crit | Visual | Hierarchy | Field | A11y | Theme | Tests | Docs | Comp |
|-----------|------|-----------|---------|--------|-----------|-------|------|-------|-------|------|------|
| HbcScoreBar | B | pwa (ScorecardPage) | High | Premium | Strong | Partial | Pass | Partial | None | Yes | Elevates |
| HbcApprovalStepper | B | accounting, admin | Medium | Premium | Strong | Partial | Partial | Partial | None | Yes | Elevates |
| HbcPhotoGrid | B | pwa, project-hub | High | Premium | Strong | Partial | Partial | Partial | None | Yes | Elevates |
| HbcCalendarGrid | B | pwa (Daily Log) | High | Premium | Strong | Partial | Partial | Partial | None | Yes | Elevates |
| HbcDrawingViewer | C | pwa (Drawings) | High | Acceptable | Adequate | Partial | Partial | Partial | None | Yes | Neutral |

**Assessment notes:**
- **HbcScoreBar (B):** `role="meter"` with `aria-valuenow/min/max` correct. Label text color hardcoded to `#1A1D23` (no field mode dark adaptation). No `aria-label` override prop.
- **HbcApprovalStepper (B):** Avatar deterministic hash color is solid. Connector line positioning is fixed pixel. `role="list"` with no `role="listitem"` on children. All colors reference `HBC_SURFACE_LIGHT`.
- **HbcPhotoGrid (B):** CSS Grid with lazy images, hover overlay, "+N more" truncation. Keyboard focus ring missing on tiles. Field mode not handled.
- **HbcCalendarGrid (B):** Full calendar math, today highlight, status dots. Arrow key navigation between day cells absent. Field mode not handled.
- **HbcDrawingViewer (C):** 3-layer architecture (canvas PDF + SVG markup + gesture capture) is sound. `pdfjs-dist` lazy-loaded. Cloud shape is simplified rounded-rect. No keyboard accessibility for markup tools. `_onMarkupDelete` prop unused.
- **Module-specific components generally:** All hard-reference `HBC_SURFACE_LIGHT` tokens and do not adapt to field mode.

### Complexity-Aware Stubs (SF03-T07 D-08)

| Component | Tier | Consumers | W1 Crit | Visual | Hierarchy | Field | A11y | Theme | Tests | Docs | Comp |
|-----------|------|-----------|---------|--------|-----------|-------|------|-------|-------|------|------|
| HbcAuditTrailPanel | D | admin, accounting | Medium | Placeholder | Weak | Not ready | Unknown | No | None | None | Weakens |
| HbcFormField | D | (no app consumers) | Low | Placeholder | Weak | Not ready | Unknown | No | None | None | Weakens |
| HbcStatusTimeline | D | accounting | Medium | Placeholder | Weak | Not ready | Unknown | No | None | None | Weakens |
| HbcPermissionMatrix | D | admin | Low | Placeholder | Weak | Not ready | Unknown | No | None | None | Weakens |
| HbcCoachingCallout | D | (no app consumers) | Low | Placeholder | Weak | Not ready | Unknown | No | None | None | Weakens |

**Assessment notes:**
These are intentional complexity-gated stubs per SF03-T07 / D-08 doctrine. Each renders only a bare `<div data-hbc-ui="...">` with minimal or empty content. They correctly wire to `useComplexityGate` and `useComplexity` from `@hbc/complexity`. `HbcStatusTimeline` renders actual data rows in text form (structurally the most complete). `HbcPermissionMatrix` renders a functional but unstyled checkbox table. None have reference docs, stories, or tests.

### Shared Hooks

| Hook | Tier | Consumers | W1 Crit | Tests | Docs |
|------|------|-----------|---------|-------|------|
| useFocusTrap | B | HbcPanel, HbcModal, HbcTearsheet, HbcCommandPalette | High | None | None |
| useIsMobile | A | HbcCommandPalette, HbcBottomNav, useFieldMode, many | High | None | None |
| useIsTablet | A | HbcAppShell (bottom nav visibility) | Medium | None | None |
| useMinDisplayTime | B | HbcSpinner, feature packages | Medium | None | None |
| usePrefersReducedMotion | B | ui-kit internal (underused) | Low | None | None |
| useOptimisticMutation | B | query-hooks (12+ hooks) | High | None | None |
| useUnsavedChangesBlocker | C | pwa (ReviewSubmitStep) | Medium | None | None |
| useOnlineStatus | A | HbcCommandPalette, HbcConnectivityBar, useConnectivity | High | Yes | None |
| useFieldMode | A | HbcAppShell, HbcThemeContext, shell layout | High | None | None |
| useSidebarState | B | HbcSidebar, HbcAppShell | Medium | None | None |
| useFocusMode | B | CreateUpdateLayout, layouts/hooks | Medium | None | None |
| useVoiceDictation | C | HbcInput (voice button) | Low | None | None |
| useAdaptiveDensity | B | HbcDataTable | High | None | None |
| useSavedViews | B | HbcDataTable | High | None | None |
| useHbcTheme | A | HbcCommandPalette, HbcCommandBar, theme consumers | High | Yes | None |
| useConnectivity | A | session-state, feature hooks | High | None | None |
| useDensity | B | (via @hbc/ui-kit/theme; limited direct consumers) | Low | None | None |
| useCommandPalette | B | HbcCommandPalette, HbcGlobalSearch, HbcHeader | High | None | None |

**Assessment notes:**
- **useFocusTrap (B):** Focusable element snapshot is taken once at activation. No `MutationObserver` — async content won't be trapped.
- **useIsMobile / useIsTablet (A):** SSR-safe, pinned to canonical breakpoint constants. Does exactly what it needs to do.
- **useOptimisticMutation (B):** `options` object in `useCallback` dep array causes callback recreation on every render when consumers pass inline objects.
- **useUnsavedChangesBlocker (C):** `confirmNavigation` and `cancelNavigation` are functionally identical (both just clear the prompt). Router integration is left to consumers — incomplete abstraction.
- **useFieldMode (A):** Auto-detects mobile, HbSiteControl context, OS dark preference, localStorage override. D-13 OS theme-color sync via `<meta name="theme-color">`.
- **useOnlineStatus (A):** Covers browser events AND ServiceWorker postMessage sync status.
- **useVoiceDictation (C):** No error recovery for `not-allowed` permission state. Only `en-US` hardcoded (no locale prop).
- **useAdaptiveDensity (B):** `DensityTier` type uses `compact | standard | touch` — diverges from `density.ts` which uses `compact | comfortable | touch`. Two competing type systems.
- **useSavedViews (B):** `remove()` scan-all-keys pattern is O(n) and fragile. `projectId` parameter inconsistency between interface and call site.

---

## Theme Token Groups (`@hbc/ui-kit/theme`)

| Group | Tier | W1 Crit | Tests | Docs | Notes |
|-------|------|---------|-------|------|-------|
| Color tokens (tokens.ts) | B | Critical | Yes | Partial | Well-structured brand ramp, semantic status colors, sunlight-optimized ramps, deprecated token tracking. Some components reference raw `HBC_SURFACE_LIGHT` values instead of Fluent theme tokens. |
| Animation/transitions (animations.ts) | B | High | None | Yes | 8 named keyframes, 3 duration tiers, `useReducedMotionStyles` hook. WS1-T09 added `@media (prefers-reduced-motion: reduce)` to 12 animated components — all major animations now comply. |
| Typography (typography.ts) | A | Critical | None | Partial | Intent-based V2.1 scale, deprecated size-based aliases retained. Clean, consistent, forward-compatible. |
| Elevation (elevation.ts) | A | High | None | Yes | 5-level dual-shadow scale (V2.1.2 — WS1-T04) with field mode variants. Level 4 (`elevationBlocking`) added for modal/blocking surfaces. `elevationRest` maps to `elevationLevel1` for backward compatibility. |
| Z-index (z-index.ts) | A | High | None | Partial | Single source of truth — 16 named layers. Correct ordering from content (0) to connectivityBar (10001). |
| Spacing & Grid (grid.ts) | B | Medium | Yes | None | 4px base, 6-step scale, 12-column grid. Breakpoint constants duplicated between `grid.ts` and `breakpoints.ts` with some divergence. |
| Breakpoints (breakpoints.ts) | A | High | None | Partial | Clean canonical file per PH4C.12. 5 named breakpoints used consistently by all responsive hooks. |
| Density system (density.ts) | B | Medium | None | Yes | WS1-T05 added comprehensive density tokens (`HBC_DENSITY_TOKENS`), field-readability constraints (`HBC_FIELD_READABILITY`), field interaction assumptions, and density application model. Type fragmentation (`comfortable` vs `standard`) between `useDensity` and `useAdaptiveDensity` remains as documented residual debt (RD-009). |

---

## Icon Library (`@hbc/ui-kit/icons`)

| Surface | Tier | Count | W1 Crit | Visual | A11y | Theme | Tests | Docs | Notes |
|---------|------|-------|---------|--------|------|-------|-------|------|-------|
| Icon library (createIcon factory) | B | 60+ icons in 7 categories | High | Acceptable | Pass | Yes | None | Partial | Factory-based stroke icons with size/weight presets. `role="img"/"presentation"`, `aria-label`/`aria-hidden` correct. Categories: Construction (14), Navigation (13), Action (15), Status (5), Connectivity (3), Layout (9), AI (1). No tests but uniform quality via shared factory. |

---

## Passthrough & Re-exports

### Fluent UI Passthrough (D-10)

| Surface | Tier | Count | Notes |
|---------|------|-------|-------|
| Fluent re-exports | N/A | 11 components + `tokens` + `SelectTabData` type | FluentProvider, Text, Badge, Switch, Spinner, TabList, Tab, Card, CardHeader, Button, tokens. Not owned by ui-kit — passthrough per PH4B.11 §4b.11.4. Apps must import from `@hbc/ui-kit`, not `@fluentui/*`. Maturity is governed by Fluent UI, not this matrix. |

### Module Config Re-exports

| Surface | Tier | Count | Notes |
|---------|------|-------|-------|
| Module configs from @hbc/shell | N/A | 15 configs + 3 types | Backward-compatibility re-exports (scorecardsLanding, rfisLanding, punchListLanding, drawingsLanding, budgetLanding, dailyLogSections, turnoverLanding, documentsLanding, etc.). Maturity tracked in `@hbc/shell`, not here. |

---

## Platform & Shared Feature Components (Outside `@hbc/ui-kit`)

The following components live in dedicated packages outside `@hbc/ui-kit` but are consumed across Wave 1 apps and must be tracked for production-readiness.

### `@hbc/smart-empty-state` — Context-Aware Empty States

| Component | Tier | Consumers | W1 Crit | Visual | Hierarchy | Field | A11y | Theme | Tests | Docs | Comp |
|-----------|------|-----------|---------|--------|-----------|-------|------|-------|-------|------|------|
| HbcSmartEmptyState | B | pwa, admin, estimating, project-hub, business-development, human-resources, leadership, operational-excellence, quality-control-warranty, risk-management, safety | Critical | Acceptable | Strong | Ready | Pass | Partial | Yes | Yes | Elevates |
| HbcEmptyStateIllustration | B | (via HbcSmartEmptyState) | High | Acceptable | Adequate | Ready | Pass | Partial | Partial | Partial | Neutral |

**Assessment notes:**
- **HbcSmartEmptyState (B not A):** D-01 classification precedence, contextual illustrations from `@hbc/ui-kit/icons`, complexity-aware coaching tips (Essential: visible, Standard: collapsed, Expert: hidden). Pure CSS class-based styling (no Griffel). `@storybook/addon-a11y` present. 8+ test files covering classification, visit tracking, complexity behavior, and hooks. ADR-0100 governs. **Gap preventing A:** No Griffel/theme-token integration; uses external stylesheet rather than design-system tokens.
- **HbcEmptyStateIllustration (B):** Classification-mapped SVG illustration component. Clean semantic output. Supporting primitive for HbcSmartEmptyState.

### `@hbc/complexity` — Complexity Dial & Gating

| Component | Tier | Consumers | W1 Crit | Visual | Hierarchy | Field | A11y | Theme | Tests | Docs | Comp |
|-----------|------|-----------|---------|--------|-----------|-------|------|-------|-------|------|------|
| HbcComplexityDial | B | pwa, admin, estimating, accounting, all 12 apps (via ComplexityProvider) | Critical | Acceptable | Strong | Ready | Pass | Partial | Yes | Yes | Elevates |
| HbcComplexityGate | B | all apps via @hbc/complexity | Critical | N/A (logic) | N/A | Ready | N/A | N/A | Yes | Yes | Elevates |

**Assessment notes:**
- **HbcComplexityDial (B not A):** Two variants: header compact pill + settings card grid. `aria-pressed` on tier buttons, `role="radio"` in settings variant. Admin lock metadata (lockedBy, lockedUntil). Cross-tab sync via `StorageEvent`. 9+ test files. ADR-0081 governs. **Gap preventing A:** Uses pure CSS (`complexity.css`) rather than Griffel/theme tokens. No `@storybook/addon-a11y`.
- **HbcComplexityGate (B):** Declarative content gating by complexity tier. Clean single-responsibility. Tested.

### `@hbc/acknowledgment` — Sign-Off & Attestation

| Component | Tier | Consumers | W1 Crit | Visual | Hierarchy | Field | A11y | Theme | Tests | Docs | Comp |
|-----------|------|-----------|---------|--------|-----------|-------|------|-------|-------|------|------|
| HbcAcknowledgmentPanel | B | (no app consumers yet — scaffold ready) | Medium | Acceptable | Strong | Ready | Pass | Partial | Yes | Yes | Elevates |
| HbcAcknowledgmentBadge | B | (no app consumers yet) | Medium | Acceptable | Adequate | Ready | Pass | Partial | Yes | Yes | Neutral |
| HbcAcknowledgmentModal | B | (no app consumers yet) | Medium | Acceptable | Strong | Ready | Pass | Partial | Yes | Yes | Elevates |

**Assessment notes:**
- **HbcAcknowledgmentPanel (B):** Three complexity tiers: Essential = CTA only, Standard = party list, Expert = full audit trail. `role="alert"` on decline banner, `role="status"` on completion. Phrase validation (D-03) and decline reasoning (D-04). Generic config contract `IAcknowledgmentConfig<T>`. 9+ test files. ADR-0092 governs. **Gap preventing A:** No production consumers yet; not proven in real compositions. No Griffel/theme tokens.
- **HbcAcknowledgmentBadge (B):** Compact list-row badge. `aria-label` on icon. Tooltip integration.
- **HbcAcknowledgmentModal (B):** Confirmation/decline modal. `aria-modal`, `aria-labelledby`. Inline styles for simplicity.

### `@hbc/step-wizard` — Multi-Step Workflows

| Component | Tier | Consumers | W1 Crit | Visual | Hierarchy | Field | A11y | Theme | Tests | Docs | Comp |
|-----------|------|-----------|---------|--------|-----------|-------|------|-------|-------|------|------|
| HbcStepWizard | B | pwa, estimating | High | Acceptable | Strong | Ready | Pass | Partial | Yes | Yes | Elevates |
| HbcStepSidebar | B | (via HbcStepWizard) | High | Acceptable | Strong | Ready | Pass | Partial | Yes | Yes | Elevates |
| HbcStepProgress | B | (via HbcStepWizard) | High | Acceptable | Adequate | Ready | Pass | Partial | Partial | Yes | Neutral |

**Assessment notes:**
- **HbcStepWizard (B):** Monotonic state machine (D-06). Vertical sidebar nav + horizontal progress variants. Per-step validation, assignee resolution, due-date polling. Complexity-gated: Essential = adjacent steps only, Standard = all steps, Expert = timestamps + validation dots. 10+ test files. ADR-0093 governs. **Gap preventing A:** No Griffel/theme tokens. Connector line positioning uses fixed pixels.
- **HbcStepSidebar (B):** `role="navigation"`, `aria-current="step"` on active. Assignee avatars shown at Standard+. Disabled buttons for locked steps.
- **HbcStepProgress (B):** Bar/ring/fraction variants. `aria-label` with step number and status.

### `@hbc/versioned-record` — Version History & Audit

| Component | Tier | Consumers | W1 Crit | Visual | Hierarchy | Field | A11y | Theme | Tests | Docs | Comp |
|-----------|------|-----------|---------|--------|-----------|-------|------|-------|-------|------|------|
| HbcVersionHistory | B | (no app consumers yet — scaffold ready) | Medium | Acceptable | Strong | Ready | Pass | Partial | Partial | Yes | Elevates |
| HbcVersionDiff | B | (no app consumers yet — PWA-only per D-08) | Medium | Acceptable | Strong | Not ready | Pass | Partial | None | Yes | Neutral |
| HbcVersionBadge | B | (no app consumers yet) | Medium | Acceptable | Adequate | Ready | Pass | Partial | None | Yes | Neutral |

**Assessment notes:**
- **HbcVersionHistory (B):** Chronological list with author avatars, timestamps, change summary. Immutable snapshots with rollback (Expert tier only). Tag system (draft, submitted, approved, rejected, handoff, imported, superseded). `aria-label` on entries, `role="dialog"` on rollback modal. 9+ test files. ADR-0094 governs. **Gap preventing A:** No production consumers. Diff engine untested directly. Inline storage threshold (255KB) may need profiling for large payloads.
- **HbcVersionDiff (B):** Side-by-side and unified diff modes with character-level `<mark>` highlighting. **PWA-only** per D-08 — not available in SPFx context. Table with `aria-label`. No direct tests.
- **HbcVersionBadge (B):** Inline tag badge. `aria-label` on button. SPFx-compatible.

### `@hbc/related-items` — Cross-Module Record Relationships

| Component | Tier | Consumers | W1 Crit | Visual | Hierarchy | Field | A11y | Theme | Tests | Docs | Comp |
|-----------|------|-----------|---------|--------|-----------|-------|------|-------|-------|------|------|
| HbcRelatedItemsPanel | B | (no app consumers yet — scaffold ready) | Medium | Acceptable | Adequate | Ready | Partial | Partial | Partial | Yes | Neutral |
| HbcRelatedItemsTile | B | (no app consumers yet) | Low | Acceptable | Adequate | Ready | Partial | Partial | Partial | Partial | Neutral |

**Assessment notes:**
- **HbcRelatedItemsPanel (B):** Declarative registry pattern with role-aware filtering and priority sorting. Uses `<details>` for relationship groups (functional, not design-polished). `role="status"` on banners. Complexity-gated: Essential = hidden, Standard = basic groups, Expert = AI suggestions. Integrates `@hbc/smart-empty-state`. ADR-0103 governs. **Gaps:** Component-level tests are sparse. Visual design uses inline styles rather than design-system integration. Missing `aria-live` for dynamic group loading.
- **HbcRelatedItemsTile (B):** Compact canvas integration showing top 3 items. Minimal inline styling with hardcoded colors. `role="status"` on degraded banner.

### `@hbc/ai-assist` — Contextual AI Actions

| Component | Tier | Consumers | W1 Crit | Visual | Hierarchy | Field | A11y | Theme | Tests | Docs | Comp |
|-----------|------|-----------|---------|--------|-----------|-------|------|-------|-------|------|------|
| HbcAiActionMenu | C | (no app consumers yet — scaffold ready) | Low | Weak | Weak | Ready | Partial | Partial | None | Partial | Weakens |
| HbcAiSmartInsertOverlay | C | (no app consumers yet) | Low | Weak | Weak | Ready | Partial | Partial | None | Partial | Weakens |
| HbcAiTrustMeter | C | (no app consumers yet) | Low | Weak | Weak | Ready | Partial | Partial | None | Partial | Weakens |
| HbcAiGovernancePortal | C | (no app consumers yet) | Low | Weak | Weak | Ready | Partial | Partial | None | Partial | Weakens |
| HbcAiLoadingState | C | (no app consumers yet) | Low | Weak | Adequate | Ready | Partial | Partial | None | Partial | Neutral |
| HbcAiResultPanel | C | (no app consumers yet) | Low | Weak | Weak | Ready | Partial | Partial | None | Partial | Weakens |

**Assessment notes:**
- **HbcAiActionMenu (C):** Button + popover with flat text. `aria-expanded`, `aria-haspopup`, `role="menu"` present. Trust-level classification and relevance scoring engine. ADR-0104 governs. **Significant gaps:** Visual design is rough — no design-system polish, no Griffel. Inline styles with hardcoded color tokens throughout. No component-level tests. Focus trap and keyboard navigation untested.
- **HbcAiSmartInsertOverlay (C):** Table layout with inline buttons for schema-driven field mapping. Drag handle (⠿) is decorative only — no semantic meaning. Field remap UX needs significant work. No tests.
- **HbcAiTrustMeter (C):** Progressive confidence disclosure: Essential = badge + disclaimer, Standard = badge + rationale, Expert = full details + tokens. Currently basic text — needs visual design.
- **HbcAiGovernancePortal (C):** Admin governance portal stub. Functional contracts present but no production consumers.
- **HbcAiLoadingState (C):** Streaming-aware loading indicator. Minimal but functional.
- **HbcAiResultPanel (C):** Compatibility wrapper for AI results. Minimal.

### `@hbc/shell` — Shell Infrastructure

| Component | Tier | Consumers | W1 Crit | Visual | Hierarchy | Field | A11y | Theme | Tests | Docs | Comp |
|-----------|------|-----------|---------|--------|-----------|-------|------|-------|-------|------|------|
| ShellCore | B | all app roots (infrastructure) | Critical | N/A (orchestration) | N/A | Ready | Pass | N/A | Yes | Yes | Elevates |

**Assessment notes:**
- **ShellCore (B — infrastructure, not visual UI):** Orchestration coordinator for all Phase 5.5 layouts. Composes auth, routing, degraded-mode recovery, status rail, and layout slots. Does not render visual UI directly — delegates to composed children. `data-*` attributes for testing/debugging. Well-documented JSDoc. 18+ test files. ADR-0054–0071 governs (PH5 phase chain). **Note:** Shell's internal visual components (HeaderBar, AppLauncher, ProjectPicker, ContextualSidebar, ShellLayout) are not individually exported to apps; they are internal composition primitives. Visual quality of these internals is tracked via the app-shell components in the main matrix (HbcHeader, HbcSidebar, HbcProjectSelector, etc.).

---

## Summary

### Tier Distribution

| Tier | `@hbc/ui-kit` | Platform & Shared Packages | Combined Total | Percentage |
|------|---------------|---------------------------|----------------|------------|
| **A** | 7 (HbcTypography, HbcThemeProvider, HbcStatusBadge, HbcButton, HbcEmptyState, HbcErrorBoundary, HbcSpinner) | 0 | 7 | 8% |
| **B** | 42 (+1 HbcAnchoredPopover) | 17 | 59 | 64% |
| **C** | 12 | 7 (ai-assist ×6, density system) | 19 | 21% |
| **D** | 7 | 0 | 7 | 8% |
| **Total assessed** | **68** | **24** | **92** | |

*ui-kit hooks: A=6, B=9, C=3. Theme groups: A=4 (+elevation↑), B=4 (+density↑ from C), C=0. Icons: B (single group). Shell infrastructure: B (1 orchestrator). Passthrough/re-exports excluded from tier counts.*

### Wave 1-Critical Components by Tier

| Tier | Critical | High | Medium | Low |
|------|----------|------|--------|-----|
| **A** | 4 (HbcThemeProvider, HbcErrorBoundary↑, HbcButton↑, HbcSpinner↑) | 2 (HbcTypography, HbcStatusBadge↑) + 1 (HbcEmptyState↑) | 0 | 0 |
| **B** | 10 (+HbcSmartEmptyState, +HbcComplexityDial) | 28 (+HbcStepWizard, +HbcStepSidebar) | 12 (+acknowledgment ×3, +versioned-record ×3) | 4 (+HbcAnchoredPopover) |
| **C** | 0 | 4 (HbcFormLayout, HbcToolboxFlyout, HbcFavoriteTools, HbcDrawingViewer) | 3 | 9 (+ai-assist ×6) |
| **D** | 0 | 0 | 4 | 3 |

### Highest-Risk Components (Wave 1-Critical AND Tier C or D)

These components are on the Wave 1 critical path and do not meet production quality:

| Component | Package | Tier | W1 Crit | Primary Gap |
|-----------|---------|------|---------|-------------|
| ~~HbcErrorBoundary~~ | ui-kit | ~~C~~ → **B** | Critical | *Resolved in WS1-T07: migrated to Griffel, semantic tokens* |
| ~~HbcSpinner~~ | ui-kit | ~~C~~ → **B** | Critical | *Resolved in WS1-T07: added prefers-reduced-motion* |
| **HbcGlobalSearch** | ui-kit | C | Critical | No search panel rendered — delegates to external handler |
| **HbcToolboxFlyout** | ui-kit | C | High | Core content is a Phase 5 placeholder string |
| **HbcFavoriteTools** | ui-kit | C | High | Buttons have no onClick handler wired |
| **HbcDrawingViewer** | ui-kit | C | High | No keyboard accessibility for markup tools |
| **HbcFormLayout** | ui-kit | C | High | No responsive column collapse |

*Note: 2 of the original 7 highest-risk components (HbcErrorBoundary, HbcSpinner) were upgraded to Tier B in WS1-T07. The remaining 5 highest-risk components stay within `@hbc/ui-kit`. The platform and shared-feature packages have no Tier C/D components on the Wave 1 critical path — their C-tier items (ai-assist) are all Low criticality.*

### Accessibility Concerns

Components with failing or unknown accessibility status:

| Component | Package | A11y Status | Issue |
|-----------|---------|-------------|-------|
| HbcPopover | ui-kit | Partial | No role attribute, trigger not keyboard-accessible |
| HbcTearsheet | ui-kit | Partial | No aria-labelledby, 32px close button |
| HbcChart | ui-kit | Unknown | Canvas rendering with no aria-label or role="img" |
| HbcFormLayout | ui-kit | Unknown | Layout shell — no ARIA assessment performed |
| HbcFormRow / HbcStickyFormFooter | ui-kit | Unknown | Not independently assessed for ARIA |
| HbcCard | ui-kit | Unknown | No role or landmark attributes assessed |
| All 5 complexity-aware stubs | ui-kit | Unknown | Stub implementations — no ARIA present |
| HbcAiActionMenu | ai-assist | Partial | Focus trap and keyboard navigation untested |
| HbcAiSmartInsertOverlay | ai-assist | Partial | Drag handle (⠿) lacks semantic meaning |
| HbcRelatedItemsPanel | related-items | Partial | Missing aria-live for dynamic group loading |

### Testing Coverage Gaps

**`@hbc/ui-kit` testing:** 8 test files with 63 tests covering core components and theme:
- `HbcStatusBadge.test.tsx` (18 tests) — variants, aria-label, icon injection, sizes
- `HbcButton.test.tsx` (10 tests) — variants, loading/disabled, onClick, type
- `HbcEmptyState.test.tsx` (10 tests) — title, description, backward compat, actions
- `HbcErrorBoundary.test.tsx` (7 tests) — error catching, fallback, retry, onError
- `HbcSpinner.test.tsx` (9 tests) — role, sizes, labels, color
- `HbcConnectivityBar.test.ts` (2 tests) — status rendering
- `HbcThemeContext.test.tsx` (3 tests) — theme switching, SSR
- `ThemeResponsiveness.test.tsx` (4 tests) — token validation

**60 of 68 assessed `@hbc/ui-kit` components still lack test coverage.** Core components are now tested; remaining coverage is tracked in the Verification Coverage Plan.

**Platform and shared-feature packages are significantly ahead on testing:**

| Package | Test Files | Storybook Stories | A11y Addon |
|---------|-----------|-------------------|------------|
| @hbc/smart-empty-state | 8+ | 1 | Yes |
| @hbc/complexity | 9+ | 2 | No |
| @hbc/acknowledgment | 9+ | 3 | No |
| @hbc/step-wizard | 10+ | 2 | No |
| @hbc/versioned-record | 9+ | 3 | No |
| @hbc/related-items | sparse | 2 | Yes |
| @hbc/ai-assist | 14+ | 0 | No |
| @hbc/shell | 18+ | 0 | No |

### Cross-Cutting Risks

1. **Density type split:** `density.ts` (`comfortable`) vs `HbcCommandBar/types.ts` (`standard`) create incompatible `DensityTier` types used by `useDensity` and `useAdaptiveDensity`.
2. **Field mode gaps in module-specific components:** HbcScoreBar, HbcApprovalStepper, HbcPhotoGrid, HbcCalendarGrid, HbcDrawingViewer all hard-reference `HBC_SURFACE_LIGHT` and do not adapt.
3. **`usePrefersReducedMotion` underuse:** Defined and exported but most animated components do not consult it.
4. **Breakpoint constant duplication:** `grid.ts` and `breakpoints.ts` both define breakpoint values with some divergence.
5. **Theme-token gap across platform packages:** All 8 non-ui-kit packages use pure CSS or inline styles rather than Griffel/theme tokens. This is the primary gap preventing any from reaching Tier A.
6. **Scaffold-only adoption risk:** 4 packages (acknowledgment, versioned-record, related-items, ai-assist) have zero production consumers. Tier assignments are based on code quality and architecture; real-world composition quality is unvalidated.

---

*End of UI Kit Component Maturity Matrix — WS1-T01 v2.0 (2026-03-16)*
