# Phase 4 Development Plan — UI Foundation & HB Intel Design System - Task 10
**Version:** 2.1
**Supersedes:** PH4-UI-Design-Plan.md V2.0
**Governed by:** HB-Intel-Blueprint-V4.md · CLAUDE.md v1.2
**Date:** March 2026

## 10. Navigation UI System

| Component | Specification |
|---|---|
| **`HbcBreadcrumbs`** | Below dark header in `DetailLayout` and `CreateUpdateLayout`. Format: `[Tool] / [Item]`. Max 3 levels. In Focus Mode, the header reduces to breadcrumbs only |
| **`HbcTabs`** | Horizontal tab bar. Active: 3px solid `#F37021` underline + bold label. Keyboard-navigable via arrow keys. Lazy render tab panels |
| **`HbcPagination`** | `HbcDataTable` footer. Previous / pages / Next. Page size: 25, 50, 100. Hidden when ≤ page size |
| **`HbcSearch` (Global)** | Dark header. Focus opens `HbcSearchOverlay` + `HbcCommandPalette` trigger |
| **`HbcSearch` (Local)** | `HbcCommandBar`. Debounced 200ms client-side filter |
| **`HbcTree`** | Documents tool folder structure. Keyboard-navigable |
| **`HbcCommandPalette`** | **[V2.1]** See Section 6 for full specification. The primary navigation upgrade over all current platforms |

<!-- IMPLEMENTATION PROGRESS & NOTES
Phase 4.10 completed: 2026-03-04
All components implemented as standalone in @hbc/ui-kit:
- SparkleIcon added to icons; Star→SparkleIcon in HbcCommandPalette (3 locations)
- HbcBreadcrumbs: max 3 levels, Focus Mode, Field Mode, ARIA nav
- HbcTabs: 3px #F37021 underline, roving tabIndex keyboard nav, lazy panels
- HbcPagination: page number algorithm with ellipsis, page size selector (25/50/100)
- HbcSearch: discriminated union (global wraps HbcGlobalSearch, local with 200ms debounce)
- HbcTree: ARIA tree pattern, roving tabIndex, flat visible node list for O(1) keyboard nav
- All components exported from barrel (src/index.ts)
- Storybook stories: 39 total across 5 components
- DetailLayout unchanged (non-breaking extraction)
Documentation added:
- docs/how-to/developer/phase-4.10-navigation-ui-system.md
- docs/architecture/adr/ADR-0023-ui-navigation-system.md
Next: Phase 4.11 or DetailLayout migration to standalone components
-->