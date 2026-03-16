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
| HbcTextField | A | pwa, estimating, accounting, admin | Critical | Acceptable | Adequate | Ready | Pass | Yes | Yes | Yes | Elevates |
| HbcSelect | A | pwa, estimating, accounting, admin | Critical | Acceptable | Adequate | Ready | Pass | Yes | Yes | Yes | Elevates |
| HbcCheckbox | A | pwa, estimating, accounting, admin | High | Acceptable | Adequate | Ready | Pass | Yes | Yes | Yes | Elevates |
| HbcFormLayout | A | pwa, estimating, accounting, admin | High | Acceptable | Adequate | Ready | Pass | Yes | Yes | Yes | Elevates |
| HbcForm | A | pwa, estimating, accounting, admin | Critical | Acceptable | Adequate | Ready | Pass | Yes | Yes | Yes | Elevates |
| HbcFormSection | A | pwa, estimating | High | Acceptable | Adequate | Ready | Pass | Yes | Yes | Yes | Elevates |
| HbcFormRow | A | pwa, estimating, accounting, admin | High | Acceptable | Adequate | Ready | Pass | Yes | Yes | Yes | Elevates |
| HbcStickyFormFooter | A | pwa, estimating, accounting, admin | High | Acceptable | Adequate | Ready | Pass | Yes | Yes | Yes | Elevates |
| HbcFormGuard | A | pwa, estimating | High | Acceptable | Adequate | Ready | Pass | Yes | Yes | Yes | Elevates |

**Assessment notes:**
- **All Form Components (A, upgraded from B/C):** Comprehensive test suites added (52 tests across 9 files). HbcFormLayout upgraded from C with responsive column collapse: mobile (<768px) → 1 column, tablet (768-1023px) → 2 columns max, desktop → requested columns. All components use Griffel makeStyles, semantic tokens, and Fluent UI primitives.
- **HbcRichTextEditor** is assessed under Input Components below.

### Surface & Overlay Components

| Component | Tier | Consumers | W1 Crit | Visual | Hierarchy | Field | A11y | Theme | Tests | Docs | Comp |
|-----------|------|-----------|---------|--------|-----------|-------|------|-------|-------|------|------|
| HbcCard | A | estimating, accounting, admin, project-hub | High | Acceptable | Strong | Ready | Pass | Yes | Yes | Yes | Elevates |
| HbcPanel | A | admin, accounting, project-hub | High | Acceptable | Strong | Ready | Pass | Yes | Yes | Yes | Elevates |
| HbcModal | A | admin, accounting | High | Acceptable | Strong | Ready | Pass | Yes | Yes | Yes | Elevates |
| HbcTearsheet | A | pwa, estimating, accounting | High | Acceptable | Adequate | Ready | Pass | Yes | Yes | Yes | Elevates |
| HbcPopover | A | admin | Low | Acceptable | Adequate | Ready | Pass | Yes | Yes | Yes | Elevates |
| HbcAnchoredPopover | B | ai-assist, app-shell internal | Low | N/A (container) | N/A | Ready | Pass | N/A | None | Partial | Neutral |

**Assessment notes:**
- **All Surface & Overlay Components (A, upgraded from B/C):** Comprehensive test suites added (46 tests across 5 files). HbcCard: 9 tests (weight variants, data attrs, header/footer). HbcPanel: 7 tests (open/close, ARIA, close button). HbcModal: 11 tests (role prop, aria-modal, backdrop, Escape). HbcTearsheet (upgraded from C): 12 tests; fixed `aria-labelledby` referencing title ID, added `aria-live="polite"` on step indicator. HbcPopover (upgraded from C): 7 tests; added `role="tooltip"`, `role="button"` + `tabIndex` + `aria-expanded` + keyboard handlers on trigger wrapper.
- **HbcAnchoredPopover (B):** Lightweight SPFx-safe positioning primitive. No unit tests for edge-clamping logic.

### Input Components

| Component | Tier | Consumers | W1 Crit | Visual | Hierarchy | Field | A11y | Theme | Tests | Docs | Comp |
|-----------|------|-----------|---------|--------|-----------|-------|------|-------|-------|------|------|
| HbcTextArea | A | accounting, estimating | Medium | Acceptable | Adequate | Ready | Pass | Yes | Yes | Yes | Elevates |
| HbcRichTextEditor | B | accounting | Low | Acceptable | Adequate | Partial | Partial | Partial | Yes | Yes | Neutral |

**Assessment notes:**
- **HbcTextArea (A, upgraded from B):** 9 tests covering data attr, label, value, onChange, required, disabled, validation, maxLength character count, rows. Voice dictation integration via `useVoiceDictation`.
- **HbcRichTextEditor (B, upgraded from C):** 6 tests covering data attr, label, toolbar buttons, disabled, validation, custom toolbar. Remaining B-tier gaps: uses deprecated `document.execCommand`, `prompt()` for link URL, 28px toolbar buttons below 44px touch target. Migration to TipTap/ProseMirror tracked as residual debt.

### Data Components

| Component | Tier | Consumers | W1 Crit | Visual | Hierarchy | Field | A11y | Theme | Tests | Docs | Comp |
|-----------|------|-----------|---------|--------|-----------|-------|------|-------|-------|------|------|
| HbcCommandBar | A | pwa, project-hub, accounting, admin, estimating, business-development | High | Acceptable | Strong | Partial | Pass | Yes | Yes | Yes | Elevates |
| HbcDataTable | A | pwa, project-hub, accounting, admin, estimating, business-development, dev-harness | High | Acceptable | Strong | Ready | Pass | Yes | Yes | Yes | Elevates |
| HbcChart (+ Bar, Donut, Line) | A | pwa, leadership, admin, hb-site-control, dev-harness | High | Acceptable | Adequate | Partial | Pass | Yes | Yes | Yes | Elevates |
| HbcKpiCard | A | pwa, project-hub, leadership, hb-site-control | High | Acceptable | Adequate | Ready | Pass | Yes | Yes | Yes | Elevates |

**Assessment notes:**
- **All Data Components (A, upgraded from B):** Comprehensive test suites added (24 tests across 4 files). HbcCommandBar: 5 tests (data attr, search, actions, filters, className). HbcDataTable: 4 tests (render, empty state, loading shimmer, column headers). HbcChart: 5 tests (data attr, height, loading fallback, className). HbcKpiCard: 10 tests (data attr, label, value, trend arrows, click, active state, className).

### Page Shell & Layouts

| Component | Tier | Consumers | W1 Crit | Visual | Hierarchy | Field | A11y | Theme | Tests | Docs | Comp |
|-----------|------|-----------|---------|--------|-----------|-------|------|-------|-------|------|------|
| WorkspacePageShell | A | pwa (all pages), project-hub, accounting, admin, estimating, 10+ apps | Critical | Acceptable | Strong | Partial | Pass | Yes | Yes | Yes | Elevates |
| ToolLandingLayout | B | dev-harness, estimating (indirect) | Medium | Acceptable | Adequate | Not ready | Partial | Partial | Yes | Yes | Neutral |
| DetailLayout | A | pwa, accounting, estimating | High | Acceptable | Strong | Ready | Pass | Yes | Yes | Yes | Elevates |
| CreateUpdateLayout | A | pwa, accounting, estimating | High | Acceptable | Strong | Ready | Pass | Yes | Yes | Yes | Elevates |
| DashboardLayout | A | pwa, project-hub, leadership | High | Acceptable | Strong | Ready | Pass | Yes | Yes | Yes | Elevates |
| ListLayout | A | pwa, project-hub, accounting, estimating | High | Acceptable | Strong | Ready | Pass | Yes | Yes | Yes | Elevates |

**Assessment notes:**
- **Page Shell & Layouts (A/B, upgraded from B/C):** 30 tests across 6 files. WorkspacePageShell (5: render, title, children, data-hbc-ui, data-layout). ToolLandingLayout (5: render, data-hbc-layout, title, children, actions — upgraded C→B, inline KPI duplication remains as residual debt). DetailLayout (5: render, data-hbc-layout, title, content, sidebar). CreateUpdateLayout (5: render, data-hbc-layout, create/edit titles, Save/Cancel). DashboardLayout (5: render, data-hbc-layout, KPI cards, chart, data zone). ListLayout (5: render, data-hbc-layout, search, children, filter pills).

### App Shell Components

| Component | Tier | Consumers | W1 Crit | Visual | Hierarchy | Field | A11y | Theme | Tests | Docs | Comp |
|-----------|------|-----------|---------|--------|-----------|-------|------|-------|-------|------|------|
| HbcAppShell | A | pwa, admin, accounting, estimating, project-hub, 10+ app roots | Critical | Acceptable | Strong | Partial | Pass | Yes | Yes | Yes | Elevates |
| HbcThemeProvider | A | pwa, admin, accounting, estimating, project-hub, 10+ app roots | Critical | N/A | Strong | Ready | Pass | Yes | Yes | Partial | Elevates |
| HbcConnectivityBar | A | HbcAppShell (all app roots) | Critical | Acceptable | Strong | Partial | Pass | Yes | Yes | Yes | Elevates |
| HbcHeader | A | HbcAppShell (all app roots) | Critical | Acceptable | Strong | Partial | Pass | Yes | Yes | Yes | Elevates |
| HbcSidebar | A | HbcAppShell (all app roots, office mode) | Critical | Acceptable | Strong | Partial | Pass | Yes | Yes | Yes | Elevates |
| HbcProjectSelector | A | HbcHeader (all app roots) | Critical | Acceptable | Strong | Partial | Pass | Yes | Yes | Yes | Elevates |
| HbcToolboxFlyout | B | HbcHeader (all app roots) | High | Weak | Weak | Not ready | Partial | Yes | Yes | Partial | Neutral |
| HbcFavoriteTools | B | HbcHeader (all app roots) | High | Weak | Weak | Not ready | Partial | Partial | Yes | Partial | Neutral |
| HbcGlobalSearch | B | HbcHeader (all app roots) | Critical | Acceptable | Adequate | Not ready | Pass | Partial | Yes | Partial | Neutral |
| HbcCreateButton | A | HbcHeader (all app roots) | Critical | Acceptable | Adequate | Ready | Pass | Yes | Yes | Yes | Elevates |
| HbcNotificationBell | A | HbcHeader (all app roots) | Critical | Acceptable | Adequate | Ready | Pass | Yes | Yes | Yes | Elevates |
| HbcUserMenu | A | HbcHeader (all app roots) | Critical | Acceptable | Strong | Partial | Pass | Yes | Yes | Yes | Elevates |

**Assessment notes:**
- **App Shell family (A/B, upgraded from B/C):** 49 tests across 10 files + 2 existing theme tests. HbcAppShell (4 tests: render, children, data-hbc-shell, mode). HbcHeader (5: role=banner, data attr, logo, link). HbcSidebar (5: role=navigation, items, toggle, aria-current). HbcProjectSelector (5: trigger, project name, listbox, options, onSelect). HbcCreateButton (4: text, type, onClick, label). HbcNotificationBell (6: label, badge at 0/5/99+, aria-label, onClick). HbcUserMenu (5: name, initials, menu, items, onSignOut). HbcToolboxFlyout (5: trigger, dialog, escape, callback, aria-expanded — upgraded C→B, stub content remains as residual debt). HbcFavoriteTools (5: null states, toolbar, favorites, labels — upgraded C→B, no onClick remains as residual debt). HbcGlobalSearch (5: trigger, aria-label, shortcut, placeholder, type — upgraded C→B, no panel remains as residual debt).

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
| **A** | 40 (Core: 7 + Form: 9 + Surface/Overlay: 5 + Input: 1 + Data: 4 + Shell: 9 + Layout: 5) | 0 | 40 | 43% |
| **B** | 16 (+1 HbcAnchoredPopover, +1 HbcRichTextEditor↑, +3 Shell↑, +1 ToolLandingLayout↑) | 17 | 33 | 36% |
| **C** | 4 | 7 (ai-assist ×6, density system) | 11 | 12% |
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
| ~~HbcFormLayout~~ | ui-kit | ~~C~~ → **A** | High | *Resolved: responsive column collapse added + 5 tests* |

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

**`@hbc/ui-kit` testing:** 44 test files with 279 tests covering core, form, surface/overlay, input, data, app shell, page shell/layouts, and theme:
- Core: HbcStatusBadge (18), HbcButton (10), HbcEmptyState (10), HbcErrorBoundary (7), HbcSpinner (9)
- Form: HbcTextField (6), HbcSelect (5), HbcCheckbox (4), HbcFormLayout (5), HbcForm (5), HbcFormSection (8), HbcFormRow (5), HbcStickyFormFooter (10), HbcFormGuard (4)
- Surface/Overlay: HbcCard (9), HbcPanel (7), HbcModal (11), HbcTearsheet (12), HbcPopover (7)
- Input: HbcTextArea (9), HbcRichTextEditor (6)
- Data: HbcCommandBar (5), HbcDataTable (4), HbcChart (5), HbcKpiCard (10)
- App Shell: HbcAppShell (4), HbcHeader (5), HbcSidebar (5), HbcProjectSelector (5), HbcCreateButton (4), HbcNotificationBell (6), HbcUserMenu (5), HbcToolboxFlyout (5), HbcFavoriteTools (5), HbcGlobalSearch (5)
- Page Shell/Layouts: WorkspacePageShell (5), ToolLandingLayout (5), DetailLayout (5), CreateUpdateLayout (5), DashboardLayout (5), ListLayout (5)
- Theme: HbcThemeContext (3), ThemeResponsiveness (4), HbcConnectivityBar (2)

**24 of 68 assessed `@hbc/ui-kit` components still lack test coverage.** Core, Form, Surface/Overlay, Input, Data, App Shell, and Page Shell/Layout families are now fully tested; remaining families: Messaging & Feedback, Navigation, Interaction Patterns, Module-Specific, Complexity-Aware Stubs.

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
