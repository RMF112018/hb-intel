# UI Kit Visual Hierarchy and Depth Standards

> **Doc Classification:** Living Reference — foundational content produced by WS1-T04, extended by T08 (composition audit) and T10 (complete documentation).

**Source of Truth:** `@hbc/ui-kit/theme` hierarchy constants (`hierarchy.ts`, `elevation.ts`)
**Governing Principles:** MB-02 (Stronger First-Glance Hierarchy), MB-06 (More Deliberate Depth)

---

## Elevation System (5-Level Depth Stack)

Every surface in HB Intel occupies a defined elevation level with semantic meaning.

| Level | Name | Shadow | Semantic Meaning | Usage |
|-------|------|--------|-----------------|-------|
| 0 | Base | none | Page background | Base canvas, flat content areas |
| 1 | Card | Subtle dual-shadow | Separated content surface | Cards, list items, data rows |
| 2 | Floating | Medium dual-shadow | Content above the page surface | Primary cards, sticky headers, toolbars, filter bars |
| 3 | Overlay | Strong dual-shadow | Temporary surface above content | Side panels, drawers, dropdowns |
| 4 | Blocking | Deepest dual-shadow | Blocking surface demanding attention | Modal dialogs, confirmation overlays, tearsheets |

Field mode variants increase shadow opacity by ~50% for dark-environment visibility.

**Token reference:** `elevationLevel0` through `elevationLevel4`, `elevationCard`, `elevationModal`, `elevationBlocking` — all exported from `@hbc/ui-kit/theme`.

---

## Content Level Hierarchy (12 Levels)

Every piece of content has a defined visual weight expressed through typography, color, and spacing.

| Priority | Content Level | Typography | Weight | Color | Spacing Above |
|----------|--------------|-----------|--------|-------|--------------|
| 1 | Page title | `display` (2rem) | 700 | textPrimary | 0 |
| 2 | Section title | `heading1` (1.5rem) | 700 | textPrimary | 48px |
| 3 | Summary metric | `heading1` (1.5rem) | 700 | textPrimary | 24px |
| 3 | Urgency indicator | `heading4` (0.875rem) | 700 | critical color | 8px |
| 4 | Status indicator | `label` (0.75rem) | 600 | semantic color | 8px |
| 4 | Primary action | `heading4` (0.875rem) | 600 | accent color | 16px |
| 5 | Body content | `body` (0.875rem) | 400 | textPrimary | 16px |
| 6 | Secondary action | `body` (0.875rem) | 500 | brand color | 8px |
| 6 | Destructive action | `body` (0.875rem) | 500 | error color | 8px |
| 7 | Metadata | `bodySmall` (0.75rem) | 400 | textMuted | 8px |
| 8 | Secondary annotation | `label` (0.75rem) | 500 | textMuted | 4px |
| 9 | Helper text | `label` (0.75rem) | 500 | textMuted | 4px |

**Token reference:** `HBC_CONTENT_LEVELS` from `@hbc/ui-kit/theme`.

---

## Zone Distinction System (7 Zones)

Every major page area has a defined visual treatment with clear relative weight.

| Zone | Surface Role | Elevation | Visual Weight | Treatment |
|------|-------------|-----------|---------------|-----------|
| Page header | Base canvas | Level 0 | Heavy | Highest-weight zone; uses pageTitle content level |
| Command area | Secondary canvas | Level 0 | Standard | Clear separation from header and content |
| Filter area | Inset panels | Level 0 | Light | Visually contained; recessed surface |
| Summary area | Cards | Level 1 | Heavy | Elevated above content; scannable first |
| Primary content | Base canvas | Level 0 | Standard | Maximum reading clarity |
| Secondary detail | Secondary canvas | Level 0 | Light | Lower weight than primary content |
| Activity history | Secondary canvas | Level 0 | Light | Least weight; temporal stream |

**Token reference:** `HBC_ZONE_DISTINCTIONS` from `@hbc/ui-kit/theme`.

---

## Card Weight Differentiation (3 Classes)

Cards and panels use weight classes to prevent visual flatness.

| Weight | Elevation | Border | Background | Padding | Use For |
|--------|-----------|--------|------------|---------|---------|
| Primary | Level 2 | 2px brand-focus | surface-0 | Generous | Most important current-context information |
| Standard | Level 1 | 1px default | surface-0 | Standard | Default containers; must not compete with primary |
| Supporting | Level 0 | 1px default | surface-1 | Compact | Metadata, history, secondary context |

**Token reference:** `HBC_CARD_WEIGHTS` from `@hbc/ui-kit/theme`. Component: `<HbcCard weight="primary|standard|supporting">`.

---

## Three-Second Read Standard

All Wave 1-critical compositions must communicate hierarchy within 3 seconds:

1. **1 second:** Page title is identifiable — must use pageTitle content level; must be the largest text on the page.
2. **2 seconds:** Primary content zone is distinguishable from metadata — must use distinct surface role, spacing, and typography weight from supporting zones.
3. **3 seconds:** Primary call to action is obvious — must use primaryAction content level; must have visual weight above bodyContent.
4. **Always:** No critical information may share identical visual treatment with metadata or secondary annotations.

### Evaluation Criteria (for T08 Composition Audit)

- Page title uses `display` or `heading1` typography — no smaller.
- Summary metrics use `heading1` or larger with fontWeight 700.
- Primary content area has ≥24px spacing from adjacent zones.
- Supporting zones use lighter visual weight than primary content.
- Status indicators use semantic color — not text color alone.
- Primary CTA uses accent color and `heading4`+ weight.
- No more than two content levels may share the same typography token.

**Token reference:** `HBC_THREE_SECOND_STANDARD` from `@hbc/ui-kit/theme`.

---

## Mold-Breaker Compliance

### MB-02: Stronger First-Glance Hierarchy

- Type scale uses ≥1.25× ratio between adjacent content levels (display→heading1: 1.33×, heading1→heading2: 1.2×).
- Status and owner identifiable in <1 second via semantic color + bold weight.
- ≥7:1 contrast for status indicators in field mode.

### MB-06: More Deliberate Depth

- 5 visually distinct elevation levels (0–4).
- Focus indicators (border-focus) visible at arm's length.
- Interactive states visually distinct via elevation shift and border treatment.

---

## Follow-On Tasks

- **T07:** Implements hierarchy expression per component using these rules.
- **T08:** Validates compositions against the 3-second read standard and evaluation criteria. Extends this document with composition-specific findings.
- **T10:** Completes this document as part of `UI-Kit-Visual-Language-Guide.md`.
- **T13:** Evaluates "visual hierarchy," "anti-flatness/depth," and "scanability" scorecard dimensions against these outputs.

---

*Visual Hierarchy and Depth Standards v1.0 — WS1-T04 (2026-03-16)*
