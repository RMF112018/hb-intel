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