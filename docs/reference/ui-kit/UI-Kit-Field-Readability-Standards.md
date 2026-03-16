# UI Kit Field-Readability Standards

> **Doc Classification:** Living Reference — WS1-T05 density mode definitions, field-readability minimums, field interaction assumptions, and density application model.

**Source of Truth:** `@hbc/ui-kit/theme` density constants (`density.ts`)
**Governing Principles:** MB-05 (More Adaptive Density), MB-07 (Field-Usable Contrast & Touch)
**Hard Requirement:** The UI kit must be field-capable by design, not field-tolerable by accident.

---

## Density Mode Definitions

Three density modes scale the interface for different input conditions. Tier names in code map to operational mode labels.

| Code Tier | Mode Label | Row Height | Use Context | Governing Rules |
|-----------|-----------|------------|-------------|-----------------|
| `compact` | Desktop | 32px | Keyboard + pointer, desktop screens, good lighting | Information-rich; pointer-sized targets; full density |
| `comfortable` | Tablet | 40px | Hybrid touch/keyboard, tablets, larger mobile | Modest touch target increase; spacing prevents accidental taps |
| `touch` | Field-first | 56px (default) / 48px (min) | Job site, outdoor, bright light, gloved hands | Maximum readability; generous targets; elevated contrast |

**Token reference:** `DENSITY_MODE_LABELS`, `DENSITY_BREAKPOINTS` from `@hbc/ui-kit/theme`.

---

## Per-Density Token Table

Every density-aware component must respect these minimums per tier.

| Dimension | compact (desktop) | comfortable (tablet) | touch (field) |
|-----------|-------------------|---------------------|---------------|
| Row height minimum | 32px | 40px | 48px |
| Touch target minimum | 24×24px | 36×36px | 44×44px (aim 48) |
| Body text minimum | 13px | 14px | 15px |
| Label text minimum | 11px | 12px | 13px |
| Status/badge text minimum | 11px | 12px | 12px |
| Tap spacing (adjacent targets) | 8px | 12px | 16px |
| Text contrast ratio | 4.5:1 (AA) | 4.5:1 (AA) | 7:1 (AAA) |
| Interactive element contrast | 3:1 | 3:1 | 4.5:1 |

**Token reference:** `HBC_DENSITY_TOKENS` from `@hbc/ui-kit/theme`.

---

## Field-Readability Minimums

These are hard requirements for field-first touch density mode, not guidelines.

| Constraint | Standard Density | Field Density Minimum | WCAG Ref |
|-----------|-----------------|----------------------|----------|
| Touch target size | ≥24×24px (pointer-optimized) | ≥44×44px (AAA), aim 48×48px | 2.5.5, 2.5.8 |
| Body text minimum | 13px | 15px | — |
| Label text minimum | 11px | 13px | — |
| Status/badge text minimum | 11px | 12px | — |
| Text contrast ratio | 4.5:1 (AA) | 7:1 (AAA) for outdoor | 1.4.3, 1.4.6 |
| Interactive element contrast | 3:1 against background | 4.5:1 for outdoor legibility | 1.4.11 |
| Tap spacing between targets | 8px | 16px minimum | — |
| Row height in tables/lists | 32px (compact) | 48px minimum | — |

**Token reference:** `HBC_FIELD_READABILITY` from `@hbc/ui-kit/theme`.

---

## Field Interaction Assumptions

Components must be designed and tested against these field use conditions.

### Gloved touch
Assume imprecise tap radius of ≥10px. Targets must tolerate touches that miss center by 10px without triggering adjacent actions.

**Design implication:** Touch targets ≥44px with ≥16px tap spacing. No precision gestures required for primary flows.

### Bright sunlight
Assume ambient light washes out contrast by 30–40%. Field contrast minimums account for this degradation.

**Design implication:** Text contrast ≥7:1, interactive element contrast ≥4.5:1. Status colors must remain distinguishable at reduced contrast.

### One-handed use
Common flows must be completable one-handed. Primary actions must be reachable without two-hand grip.

**Design implication:** Primary actions positioned in bottom-half reachable zone. No mandatory two-finger gestures.

### Motion and vibration
Assume user is in a moving vehicle or on unstable footing. Micro-interactions must not require precision gestures.

**Design implication:** No drag-to-reorder as sole interaction. Swipe thresholds generous. Scroll targets large.

### Intermittent focus
Field workers are interrupted frequently. State must be preserved clearly — the interface must communicate "where am I" unambiguously after a context switch.

**Design implication:** Persistent visual state indicators. No auto-dismiss that loses user context. Clear breadcrumbs and page titles.

**Token reference:** `HBC_FIELD_INTERACTION_ASSUMPTIONS` from `@hbc/ui-kit/theme`.

---

## Density Mode Application Model

### System-level detection
`detectDensityTier()` uses `pointer:coarse/fine` media queries. `useDensity()` auto-detects and reacts to pointer changes. Field mode auto-defaults to `comfortable` tier.

### User-controlled toggle
Density preference settable via `useDensity().setOverride(tier)`. App shell should expose a one-tap toggle accessible from any page.

### Component API
Components inherit density via `useDensity()` hook or accept an explicit density prop. DensityProvider context planned for T07 to enable subtree-level density overrides without per-instance props.

### Persistence
`persistDensityOverride()` saves to localStorage under key `hbc-density-override`. Persists across sessions per browser. Per-tool overrides use `hbc-density-{toolId}` key pattern (see `useAdaptiveDensity`).

**Token reference:** `HBC_DENSITY_APPLICATION_MODEL` from `@hbc/ui-kit/theme`.

---

## T07 Component Compliance Checklist

For each density-aware component during T07 polish:

- [ ] Touch targets meet `HBC_DENSITY_TOKENS[tier].touchTargetMin` for all three tiers
- [ ] Body text meets `bodyTextMinPx` floor for the active tier
- [ ] Label text meets `labelTextMinPx` floor for the active tier
- [ ] Tap spacing between adjacent interactive elements meets `tapSpacingMin`
- [ ] Row height in lists/tables meets `rowHeightMin` for the active tier
- [ ] Text contrast meets `textContrastMin` in both light and field themes
- [ ] Interactive element contrast meets `interactiveContrastMin`
- [ ] No precision gestures required for primary flows in touch tier
- [ ] Field theme colors remain distinguishable under 30–40% contrast washout
- [ ] Component inherits density via `useDensity()` or accepts `density` prop

---

## Follow-On Consumers

- **T07:** Implements density token usage and field minimums per component during polish sweep
- **T08:** Evaluates composition readiness in field density mode during composition audit
- **T09:** Cross-references field minimums against accessibility contrast and target size requirements
- **T10:** Documents field-readability standards in the complete visual language guide
- **T13:** Evaluates "field readability" and "adaptive density" dimensions of the production-readiness scorecard

---

*Field-Readability Standards v1.0 — WS1-T05 (2026-03-16)*
