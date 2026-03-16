# UI Kit Wave 1 Consumer Map

> **Doc Classification:** Living Reference (Diátaxis) — WS1-T01 consumer-to-component mapping for Wave 1 apps; governs T08 composition risk assessment, T12 consumer cleanup audit scope, and T13 production-readiness scorecard baseline.

**Produced by:** WS1-T01 (UI Kit Inventory, Maturity Scoring, and Consumer Map)
**Date:** 2026-03-16
**Governing plan:** `docs/architecture/plans/UI-Kit/WS1-T01-Inventory-Maturity-Scoring-Consumer-Map.md`
**Companion doc:** `docs/reference/ui-kit/UI-Kit-Component-Maturity-Matrix.md`

---

## How to Read This Map

This document maps each Wave 1-relevant app to the UI components it currently consumes from `@hbc/ui-kit` and other HBC platform packages. For each app:

- **Tier C/D flag** indicates whether the app depends on any component rated Tier C or D in the maturity matrix
- **Local duplicates** notes surface-level visual patterns that may duplicate kit functionality (deep audit is T12's scope)
- Components are grouped by source package
- Only UI components and hooks are listed; pure type imports and model imports are excluded

### Wave 1 Classification

| Priority | Apps |
|----------|------|
| **Primary** | PWA, Project Hub, Admin, Estimating |
| **Secondary** | Business Development, Human Resources, Leadership, Operational Excellence, Quality Control & Warranty, Risk Management, Safety |
| **Non-Wave 1** | Accounting, Dev-Harness, HB-Site-Control |

---

## Primary Wave 1 Apps

### PWA

**Tier C/D exposure:** Yes — HbcErrorBoundary (C), HbcFormLayout (C), HbcSpinner (C)
**Local visual duplicates:** None detected

| Source Package | Components & Hooks Consumed |
|---------------|----------------------------|
| **@hbc/ui-kit** | HbcAppShell, HbcThemeProvider, HbcErrorBoundary **(C)**, HbcConnectivityBar, HbcBanner, HbcButton, HbcConfirmDialog, HbcChart, HbcDataTable, HbcStatusBadge, HbcTextField, HbcSelect, HbcCheckbox, HbcFormLayout **(C)**, HbcFormSection, HbcSpinner **(C)**, HbcTypography, HbcEmptyState, HbcScoreBar, HbcPhotoGrid, HbcCalendarGrid, HbcDrawingViewer **(C)**, HbcCommandBar, HbcKpiCard, HbcTabs, HbcPagination, HbcSearch, HbcBottomNav, HbcCommandPalette, WorkspacePageShell, DetailLayout, CreateUpdateLayout, DashboardLayout, ListLayout, useIsMobile, useCommandPalette, useFocusMode |
| **@hbc/smart-empty-state** | HbcSmartEmptyState |
| **@hbc/complexity** | ComplexityProvider |
| **@hbc/step-wizard** | HbcStepWizard |
| **@hbc/shell** | ShellLayout, useNavStore, useProjectStore |
| **@hbc/session-state** | SessionStateProvider, HbcSyncStatusBadge, useSessionState, useConnectivity, clearDraft |

**Risk summary:** PWA has the broadest component surface area and the most Tier C/D exposure. HbcFormLayout (C) affects mobile form usability. HbcDrawingViewer (C) affects the Drawings module. HbcErrorBoundary (C) affects all error fallback states.

---

### Project Hub

**Tier C/D exposure:** Yes — HbcErrorBoundary (C)
**Local visual duplicates:** None detected

| Source Package | Components & Hooks Consumed |
|---------------|----------------------------|
| **@hbc/ui-kit** | HbcThemeProvider, HbcErrorBoundary **(C)**, HbcDataTable, HbcStatusBadge, WorkspacePageShell, Text, Card, CardHeader |
| **@hbc/smart-empty-state** | HbcSmartEmptyState |
| **@hbc/complexity** | ComplexityProvider |
| **@hbc/shell** | ShellLayout, useNavStore, useProjectStore |

**Risk summary:** Minimal Tier C/D exposure — only HbcErrorBoundary. Lean component footprint.

---

### Admin

**Tier C/D exposure:** Yes — HbcErrorBoundary (C)
**Local visual duplicates:** None detected

| Source Package | Components & Hooks Consumed |
|---------------|----------------------------|
| **@hbc/ui-kit** | HbcThemeProvider, HbcErrorBoundary **(C)**, HbcToastProvider, WorkspacePageShell, HbcDataTable, HbcStatusBadge, HbcPanel, HbcModal, HbcPopover **(C)**, HbcConfirmDialog, HbcButton, HbcTextField, HbcSelect, HbcCheckbox, HbcTabs, HbcPagination, HbcCommandBar |
| **@hbc/smart-empty-state** | HbcSmartEmptyState |
| **@hbc/complexity** | ComplexityProvider, HbcComplexityDial, HbcComplexityGate |
| **@hbc/shell** | ShellLayout, useNavStore, useProjectStore |

**Risk summary:** HbcPopover (C) used in admin features — keyboard users cannot trigger it. HbcErrorBoundary (C) affects error states.

---

### Estimating

**Tier C/D exposure:** Yes — HbcErrorBoundary (C), HbcPeoplePicker (D), HbcTearsheet (C)
**Local visual duplicates:** None detected

| Source Package | Components & Hooks Consumed |
|---------------|----------------------------|
| **@hbc/ui-kit** | HbcThemeProvider, HbcErrorBoundary **(C)**, HbcBanner, HbcButton, HbcCard, HbcConfirmDialog, HbcDataTable, HbcStatusBadge, HbcTextField, HbcSelect, HbcCheckbox, HbcFormSection, HbcPeoplePicker **(D)**, HbcTearsheet **(C)**, HbcTypography, WorkspacePageShell, DetailLayout, CreateUpdateLayout, ListLayout, Text, Card, CardHeader, tokens |
| **@hbc/smart-empty-state** | HbcSmartEmptyState |
| **@hbc/complexity** | ComplexityProvider, HbcComplexityDial, HbcComplexityGate |
| **@hbc/step-wizard** | HbcStepWizard |
| **@hbc/shell** | ShellLayout, useNavStore, useProjectStore, resolveProjectHubUrl |
| **@hbc/session-state** | HbcConnectivityBar, HbcSyncStatusBadge |

**Risk summary:** Highest Tier C/D exposure among primary apps. HbcPeoplePicker (D) is a blocking gap — raw textarea with no search or validation. HbcTearsheet (C) has raw buttons and missing ARIA. HbcErrorBoundary (C) universal.

---

## Secondary Wave 1 Apps

### Business Development

**Tier C/D exposure:** Yes — HbcErrorBoundary (C)
**Local visual duplicates:** None detected

| Source Package | Components & Hooks Consumed |
|---------------|----------------------------|
| **@hbc/ui-kit** | HbcThemeProvider, HbcErrorBoundary **(C)**, HbcDataTable, HbcStatusBadge, WorkspacePageShell, Text, Card, CardHeader |
| **@hbc/smart-empty-state** | HbcSmartEmptyState |
| **@hbc/complexity** | ComplexityProvider |
| **@hbc/shell** | ShellLayout, useNavStore, useProjectStore |

---

### Human Resources, Leadership, Operational Excellence, Quality Control & Warranty, Risk Management, Safety

All six secondary apps follow an identical minimal pattern:

**Tier C/D exposure:** Yes — HbcErrorBoundary (C)
**Local visual duplicates:** None detected

| Source Package | Components & Hooks Consumed |
|---------------|----------------------------|
| **@hbc/ui-kit** | HbcThemeProvider, HbcErrorBoundary **(C)**, WorkspacePageShell |
| **@hbc/smart-empty-state** | HbcSmartEmptyState |
| **@hbc/complexity** | ComplexityProvider |
| **@hbc/shell** | ShellLayout, resolveProjectHubUrl, useNavStore, useProjectStore |

**Risk summary:** Minimal component surface. Only HbcErrorBoundary (C) represents a quality gap. These apps are early-stage with mostly empty-state pages powered by HbcSmartEmptyState.

---

## Non-Wave 1 Apps (Included for Completeness)

### Accounting

**Tier C/D exposure:** Yes — HbcErrorBoundary (C), HbcTearsheet (C), HbcRichTextEditor (C)

| Source Package | Components & Hooks Consumed |
|---------------|----------------------------|
| **@hbc/ui-kit** | HbcThemeProvider, HbcErrorBoundary **(C)**, HbcToastProvider, HbcDataTable, HbcStatusBadge, HbcTearsheet **(C)**, HbcRichTextEditor **(C)**, HbcTextArea, HbcCard, HbcPanel, HbcModal, HbcConfirmDialog, HbcButton, HbcTextField, HbcSelect, HbcCheckbox, HbcApprovalStepper, WorkspacePageShell, DetailLayout, CreateUpdateLayout, ListLayout, Text, Card, CardHeader |
| **@hbc/smart-empty-state** | HbcSmartEmptyState |
| **@hbc/complexity** | ComplexityProvider, HbcComplexityDial, HbcComplexityGate |
| **@hbc/shell** | ShellLayout, useNavStore, useProjectStore, resolveProjectHubUrl |

---

### HB-Site-Control

**Tier C/D exposure:** Yes — HbcErrorBoundary (C)

| Source Package | Components & Hooks Consumed |
|---------------|----------------------------|
| **@hbc/ui-kit** | HbcAppShell, HbcThemeProvider, HbcErrorBoundary **(C)**, HbcDataTable, HbcStatusBadge, HbcCommandBar, HbcChart, WorkspacePageShell, Text, Card, CardHeader, Badge, Button, tokens |
| **@hbc/shell** | useNavStore, useProjectStore |

---

### Dev-Harness

**Tier C/D exposure:** Yes — HbcErrorBoundary (C), HbcFormLayout (C)

| Source Package | Components & Hooks Consumed |
|---------------|----------------------------|
| **@hbc/ui-kit** | HbcThemeProvider, HbcErrorBoundary **(C)**, HbcFormLayout **(C)**, HbcDataTable, HbcCommandBar, HbcStatusBadge, HbcTextField, HbcSelect, HbcCheckbox, HbcChart, WorkspacePageShell, useHbcTheme, Button, Switch, TabList, Tab, tokens |
| **@hbc/complexity** | ComplexityProvider |
| **@hbc/shell** | ShellLayout, useNavStore, useProjectStore |

---

## Tier C/D Exposure Summary

### Universal Blockers

| Component | Tier | Consuming Apps | Impact |
|-----------|------|---------------|--------|
| **HbcErrorBoundary** | C | **All 14 apps** | Error fallback UI uses inline styles and hardcoded colors outside the design system. Every app's error state is affected. |

### Wave 1-Critical Blockers

| Component | Tier | Consuming Apps | Impact |
|-----------|------|---------------|--------|
| **HbcPeoplePicker** | D | Estimating, PWA | Raw textarea — users must type exact UPN strings. No search, no chips, no validation. |
| **HbcFormLayout** | C | PWA, Dev-Harness | No responsive column collapse — 4-column grid renders at 320px mobile. |
| **HbcSpinner** | C | PWA, Estimating, Admin, Project Hub, Accounting | No reduced-motion handling. Inline style bypass. |
| **HbcDrawingViewer** | C | PWA | No keyboard accessibility for markup tools. |

### Non-Critical Tier C/D (Lower Priority)

| Component | Tier | Consuming Apps | Impact |
|-----------|------|---------------|--------|
| HbcTearsheet | C | PWA, Estimating, Accounting | Raw buttons, no aria-labelledby, 32px close |
| HbcPopover | C | Admin | Not keyboard-accessible |
| HbcRichTextEditor | C | Accounting | Deprecated `document.execCommand`, sync `prompt()` |
| HbcToolboxFlyout | C | All apps (via HbcHeader) | Placeholder content string |
| HbcFavoriteTools | C | All apps (via HbcHeader) | onClick not wired |
| HbcGlobalSearch | C | All apps (via HbcHeader) | No search panel rendered |
| All Tier D stubs | D | Limited or none | Complexity-gated stubs — intentional per SF03-T07 D-08 |

---

*End of UI Kit Wave 1 Consumer Map — WS1-T01 v1.0 (2026-03-16)*
