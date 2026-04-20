# Phase 4 Development Plan — UI Foundation & HB Intel Design System - Task 8
**Version:** 2.1
**Supersedes:** PH4-UI-Design-Plan.md V2.0
**Governed by:** HB-Intel-Blueprint-V4.md · CLAUDE.md v1.2
**Date:** March 2026

## 8. Overlay & Surface System **[V2.1 — Precision Elevation]**

### Elevation System **[V2.1]**

The elevation system uses dual-shadow (ambient + key) layering to create a legible spatial hierarchy. This replaces V2.0's generic single-shadow scale.

| Level | Usage | CSS `box-shadow` |
|---|---|---|
| **Level 0 — Rest** | In-flow content, table rows, body text | `none` |
| **Level 1 — Card** | Cards, toolbar containers, filter bars | `0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)` |
| **Level 2 — Raised** | Dropdowns, popovers, side panels | `0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.06)` |
| **Level 3 — Modal** | Modals, command palette, tearsheets | `0 10px 20px rgba(0,0,0,0.10), 0 6px 6px rgba(0,0,0,0.08)` |

In Field Mode, shadow opacity increases by 50% (`0.08` → `0.12`) to maintain visibility against dark surfaces.

**File:** `packages/ui-kit/src/theme/elevation.ts`
```ts
export const hbcElevation = {
  rest: 'none',
  card: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)',
  raised: '0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.06)',
  modal: '0 10px 20px rgba(0,0,0,0.10), 0 6px 6px rgba(0,0,0,0.08)',
} as const;
```

### Surface Usage Rules

| Surface | Width | When to Use | When NOT to Use |
|---|---|---|---|
| `HbcModal` | 480 / 600 / 720px | Confirmations. Simple single-section forms. Alerts | Complex multi-section workflows. Detail views |
| `HbcPanel` | 360 / 480 / 640px | Detail views keeping list context. Filter panels | Primary creation workflows. Confirmations |
| `HbcTearsheet` | Full-width overlay | Multi-step workflows (Turnover, Go/No-Go submission) | Simple confirmations. Detail views |
| `HbcPopover` | 240 / 320px | Contextual info on hover/click: user cards, field help | Forms. Confirmations |
| `HbcCard` | Fluid (grid-based) | Grouping related content: dashboards, KPI metrics | Navigation. Data tables |
| `HbcCommandPalette` | 640px centered | `Cmd+K` AI command layer | — Never render in any other context |

### Z-Index Scale

| Layer | Z-Index |
|---|---|
| Page content | 0–99 |
| Sidebar / Sticky elements | 100–199 |
| Dark header | 200 |
| `HbcPopover` | 1000–1099 |
| `HbcPanel` | 1100–1199 |
| `HbcModal` / `HbcTearsheet` | 1200–1299 |
| `HbcCommandPalette` | 1250 |
| Toast notifications | 1300 |
| SPFx Application Customizer | 10000 |
| `HbcConnectivityBar` | 10001 |

### Modal Anatomy Standard

- Header: Title (`heading-3`) + X close button. Always present.
- Body: Scrollable if > 60vh. Padding: `var(--hbc-space-lg)`.
- Footer: Right-aligned buttons. Primary action rightmost. Max 3 buttons.
- Backdrop: `rgba(0,0,0,0.5)`. Click outside closes unless destructive confirmation in progress.
- Focus trap while open. `Escape` closes and returns focus to triggering element.

<!-- IMPLEMENTATION PROGRESS & NOTES
Phase 4.8 completed: 2026-03-04

Step 1: Z-Index Constants + V2.1 Elevation Rewrite — DONE
  - Created src/theme/z-index.ts with centralized Z_INDEX constants
  - Rewrote src/theme/elevation.ts with V2.1 dual-shadow 4-level system
  - Added Field Mode elevation variants (+50% opacity)
  - Backward-compatible deprecated aliases: elevationRest→Level1, elevationDialog→Level3

Step 2: Shared Hooks — DONE
  - Extracted useFocusTrap and useIsMobile from HbcPanel into src/hooks/

Step 3: HbcCard — DONE
  - src/HbcCard/index.tsx — Level 1 shadow, optional header/footer sections

Step 4: HbcModal — DONE
  - src/HbcModal/index.tsx — 3 sizes, focus trap, Escape close, portal, scaleIn animation

Step 5: HbcTearsheet — DONE
  - src/HbcTearsheet/index.tsx — Multi-step, step indicator, onValidate, slideInUp

Step 6: HbcPopover — DONE
  - src/HbcPopover/index.tsx — hover/click trigger, auto-position, arrow, viewport flip

Step 7: Z-Index Migration — DONE
  - Migrated 9 files from magic numbers to Z_INDEX constants
  - Updated elevation imports from deprecated to V2.1 names

Step 8: Barrel Exports + Elevation Stories — DONE
  - Updated src/index.ts and src/theme/index.ts with all new exports
  - Created Elevation.stories.tsx visual showcase

Step 9: Documentation — DONE
  - docs/how-to/developer/phase-4.8-overlay-surface-system.md
  - docs/architecture/adr/ADR-0021-ui-overlay-surface-system.md

Next: Phase 4.9 (if applicable) or Phase 5 (SPFx webparts)
-->
