# UI Kit Accessibility Findings

> **Doc Classification:** Living Reference — WS1-T09 accessibility audit findings for T11 automated coverage and T13 production-readiness scorecard.

**Audit Scope:** All `@hbc/ui-kit` components and Wave 1-critical application-layer components
**Standard:** WCAG 2.1 AA (WCAG AAA for field density mode per T05)

---

## Resolved in WS1-T09

### ARIA Fixes

| Component | Issue | Resolution |
|-----------|-------|------------|
| HbcBanner | Missing `aria-live` attribute — dynamic banners not announced | Added `aria-live="assertive"` for error/warning, `aria-live="polite"` for info/success |
| HbcConfirmDialog | Used `role="dialog"` instead of `role="alertdialog"` | Changed to `role="alertdialog"` via new `role` prop on HbcModal |
| HbcModal | No `role` prop — couldn't be overridden for alertdialog use | Added optional `role` prop (default `'dialog'`) |

### Reduced-Motion Fixes

| Component | Animation | Resolution |
|-----------|-----------|------------|
| HbcSpinner | Continuous rotation | Replaced with opacity pulse (T07) |
| HbcBanner | slideInUp (250ms) | Added `@media (prefers-reduced-motion: reduce)` → `0ms` |
| HbcToast | slideInUp | Added reduced-motion override |
| HbcModal | scaleIn + slideInFromBottom (mobile) | Added reduced-motion override to both variants |
| HbcTearsheet | slideInUp | Added reduced-motion override |
| HbcBottomNav | slideInFromBottom | Added reduced-motion override |
| HbcCommandPalette | scaleIn + slideInFromBottom (mobile) | Added reduced-motion override to both variants |
| HbcConnectivityBar | pulse (syncing + offline states) | Added reduced-motion override |
| HbcEmptyState | fadeIn (root + illustration) | Added reduced-motion override |
| HbcTooltip | fadeIn | Added reduced-motion override |

---

## Pre-Existing Compliant Patterns

### ARIA Implementation (Passing)

| Pattern | Components | Status |
|---------|-----------|--------|
| Dialog semantics | HbcModal, HbcPanel, HbcTearsheet | `role="dialog"`, `aria-modal="true"`, `aria-label` |
| Tab semantics | HbcTabs | `role="tablist"`, `role="tab"`, `role="tabpanel"`, `aria-selected` |
| Table semantics | HbcDataTable | `role="table"`, `scope="col"`, `headers` attribute |
| Listbox semantics | HbcCommandPalette, HbcProjectSelector | `role="listbox"`, `role="option"`, `aria-selected` |
| Menu semantics | HbcUserMenu | `role="menu"`, `role="menuitem"` |
| Live regions | HbcToast, HbcConnectivityBar | `aria-live` with correct politeness levels |
| Status indicators | HbcSpinner | `role="status"` with accessible label |
| Loading states | HbcDataTable shimmer | `aria-busy="true"`, `aria-live="polite"` |

### Focus Management (Passing)

| Pattern | Components | Status |
|---------|-----------|--------|
| Focus trapping | HbcModal, HbcPanel, HbcTearsheet, HbcCommandPalette | `useFocusTrap` hook |
| Focus return | HbcModal, HbcPanel, HbcTearsheet, HbcToolboxFlyout, HbcUserMenu | Trigger ref restore on close |
| Escape handling | All overlay components | `keydown` listener for Escape |
| Focus-visible styling | HbcButton | `:focus-visible` with 2px solid outline |

### Keyboard Navigation (Passing)

| Pattern | Components | Status |
|---------|-----------|--------|
| Button activation | HbcButton, all buttons | Enter/Space via native `<button>` |
| Tab navigation | All interactive components | Standard tab order |
| Arrow key navigation | HbcCommandPalette | Up/Down through results |

---

## T11 Automation Requirements

The following items require automated test coverage in T11:

### High Priority

1. **Focus trap activation** — Verify `useFocusTrap` engages on open for HbcModal, HbcPanel, HbcTearsheet, HbcCommandPalette
2. **Focus return on close** — Verify focus returns to trigger element after overlay close
3. **Escape key dismissal** — Verify Escape closes all overlay components
4. **ARIA role correctness** — Verify `role="dialog"` on modals, `role="alertdialog"` on HbcConfirmDialog, `role="tablist"` on HbcTabs
5. **Live region announcement** — Verify `aria-live` on HbcBanner, HbcToast, HbcConnectivityBar
6. **Reduced-motion compliance** — Verify `animationDuration: '0ms'` applied under `prefers-reduced-motion: reduce` for all 12 animated components

### Medium Priority

7. **Table header association** — Verify `scope="col"` and `headers` attribute in HbcDataTable
8. **Tab panel association** — Verify `aria-controls` and `aria-labelledby` in HbcTabs
9. **Status badge accessible names** — Verify `aria-label` includes variant and label text
10. **Loading state announcement** — Verify `aria-busy="true"` during data loading

### Known Gaps for Future Work

11. **Menu arrow-key navigation** — HbcUserMenu and HbcBottomNav support Tab but not Up/Down/Home/End between menu items
12. **Combobox pattern** — HbcSearch local variant lacks `role="combobox"` for autocomplete behavior
13. **Tooltip ARIA** — HbcTooltip lacks `role="tooltip"` and `aria-describedby` association
14. **Focus ring consistency** — Focus ring styling verified on HbcButton but not systematically validated across all interactive components
15. **Contrast validation in field mode** — Token contrast ratios documented in T05 but not programmatically validated per-component

---

## Implementation Trust Audit

| Question | Status | Evidence |
|----------|--------|---------|
| What is the primary action? | **Pass** | Single primary CTA per page via T04 content levels; accent color distinguishes primary from secondary |
| What requires attention? | **Pass** | Urgency indicators (heading4/700/critical color) + status badges with semantic colors |
| What is loading/unavailable? | **Pass** | HbcSpinner with `role="status"`; shimmer with `aria-busy`; disabled states visually distinct |
| What just changed? | **Pass** | HbcToast `aria-live` announces changes; HbcConnectivityBar announces connectivity state |
| What went wrong? | **Pass** | HbcErrorBoundary shows error message + retry; HbcBanner `role="alert"` for error/warning |

---

*Accessibility Findings v1.0 — WS1-T09 (2026-03-16)*
