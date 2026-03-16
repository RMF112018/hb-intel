# UI Kit Residual Debt Register

> **Doc Classification:** Living Reference — WS1-T13 residual debt register documenting non-blocking items requiring future attention.

**Assessment Date:** 2026-03-16
**Kit Version:** 2.2.0
**Status:** All items are non-blocking for Wave 1. No blocking debt remains.

---

## Debt Items

### RD-001: HbcGlobalSearch — search panel not rendered

**Description:** HbcGlobalSearch delegates to an external search handler instead of rendering its own search result panel. The component provides the search input and trigger but no inline results UI.
**Impact:** Low — search functionality works via external handler; no user-facing regression.
**Tier:** C (Critical path, documented exception)
**Resolution Wave:** Wave 1 (implement during Personal Work Hub sprint)
**Owner:** Feature team (shell)

---

### RD-002: HbcToolboxFlyout — placeholder content

**Description:** Core flyout content is a Phase 5 placeholder string. The flyout opens and closes correctly but does not render a real tool grid.
**Impact:** Low — flyout interaction works; content deferred to Phase 5 roadmap.
**Tier:** C (High criticality, documented exception)
**Resolution Wave:** Phase 5
**Owner:** Shell team

---

### RD-003: HbcFavoriteTools — onClick handlers not wired

**Description:** Favorite tool buttons render but onClick handlers are not connected. The component is visually correct but non-functional.
**Impact:** Low — non-blocking for Wave 1 critical path.
**Tier:** C (High criticality, documented exception)
**Resolution Wave:** Wave 1 (wire during Personal Work Hub development)
**Owner:** Shell team

---

### RD-004: HbcFormLayout — no responsive column collapse

**Description:** Form layout does not collapse from multi-column to single-column on mobile breakpoints. Forms are functional but may be horizontally constrained on narrow viewports.
**Impact:** Medium — affects form usability on mobile/field devices.
**Tier:** C (High criticality, documented exception)
**Resolution Wave:** Wave 1 (add breakpoint-driven collapse)
**Owner:** Kit team

---

### RD-005: HbcDrawingViewer — no keyboard accessibility for markup tools

**Description:** Drawing markup tools (pen, shape, text, eraser) are mouse-only. No keyboard navigation or activation for markup tool selection.
**Impact:** Low — drawing viewer is a specialized tool; keyboard users can view but not annotate.
**Tier:** C (High criticality, documented exception)
**Resolution Wave:** Post-Wave 1 (T09 follow-up)
**Owner:** Kit team

---

### RD-006: HbcPeoplePicker — raw textarea with UPN parsing

**Description:** People picker is a raw textarea accepting UPN strings. No chip display, no Microsoft Graph search, no validation of entered values.
**Impact:** Low — outside Wave 1 critical path. Used in estimating and PWA but not in Priority 1 surfaces.
**Tier:** D (Medium criticality, documented exception)
**Resolution Wave:** Phase 5 (replace with Graph-integrated people picker)
**Owner:** Platform team

---

### RD-007: Menu components — arrow-key navigation incomplete

**Description:** HbcUserMenu and HbcBottomNav have `role="menu"` but only support Tab navigation between menu items, not Up/Down/Home/End arrow keys per ARIA menu pattern.
**Impact:** Low — keyboard navigation works via Tab; ARIA purist gap.
**Resolution Wave:** Post-Wave 1
**Owner:** Kit team

---

### RD-008: HbcSearch — combobox pattern incomplete

**Description:** HbcSearch local variant lacks `role="combobox"` for autocomplete behavior. Search input works but doesn't announce result suggestions to screen readers.
**Impact:** Low — search is functional; screen reader users can still use search.
**Resolution Wave:** Post-Wave 1
**Owner:** Kit team

---

### RD-009: Density type fragmentation

**Description:** `useDensity()` exports `DensityTier = 'compact' | 'comfortable' | 'touch'` while `useAdaptiveDensity()` (HbcDataTable) uses `'compact' | 'standard' | 'touch'`. The `comfortable` vs `standard` naming is incompatible.
**Impact:** Medium — type mismatch if density is shared between systems.
**Resolution Wave:** Wave 1 (harmonize to single DensityTier type)
**Owner:** Kit team

---

### RD-010: ECharts theme hardcoded colors

**Description:** HbcChart's ECharts renderer uses hardcoded hex colors for chart theming that don't adapt to dark or field mode themes.
**Impact:** Low — charts display correctly in light mode; field/dark mode charts use static light palette.
**Resolution Wave:** Post-Wave 1
**Owner:** Kit team

---

## Summary

| Priority | Count | Description |
|----------|-------|-------------|
| Wave 1 resolution | 4 | RD-001, RD-003, RD-004, RD-009 |
| Phase 5 resolution | 2 | RD-002, RD-006 |
| Post-Wave 1 resolution | 4 | RD-005, RD-007, RD-008, RD-010 |
| **Total** | **10** | All non-blocking for Wave 1 launch |

No debt item is Wave 1 blocking. All items have named owners and resolution timelines.

---

*Residual Debt Register v1.0 — WS1-T13 (2026-03-16)*
