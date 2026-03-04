# Phase 4 Development Plan — UI Foundation & HB Intel Design System - Task 9
**Version:** 2.1
**Supersedes:** PH4-UI-Design-Plan.md V2.0
**Governed by:** HB-Intel-Blueprint-V4.md · CLAUDE.md v1.2
**Date:** March 2026

## 9. Messaging & Feedback System

| Component | Specification |
|---|---|
| **`HbcBanner`** | Full-width bar below dark header. Variants: `info` / `success` / `warning` / `error`. Use for persistent page-level messages. Always include X dismiss unless critical |
| **`HbcToast`** | **[V2.1]** Three categories only: success (green, auto-dismiss 3s), error (red, requires dismissal), sync-status (blue, auto-dismiss on sync completion). Informational toasts eliminated — direct manipulation feedback replaces them. Bottom-right. Max 3 visible |
| **`HbcEmptyState`** | Centered in content area. Required: `icon`, `title` (heading-2), `description` (body). Optional: `primaryAction`, `secondaryAction` |
| **`HbcTooltip`** | Max-width 280px. Show delay: 300ms. Never place interactive elements inside — use `HbcPopover` |
| **`HbcSpinner`** | Sizes: `sm` (20px) / `md` (40px) / `lg` (64px). Always with visually hidden `aria-label`. Min display time: 300ms |

<!-- IMPLEMENTATION PROGRESS & NOTES
Phase 4.9 completed: 2026-03-04
Components implemented:
  - HbcBanner (4 variants, dismiss logic, role="alert"/"status")
  - HbcToast (V2.1 three-category: success/error/sync-status, provider + useToast hook, portal container)
  - HbcTooltip (string content, 4 positions, auto-flip, 300ms delay, aria-describedby)
  - HbcSpinner (sm/md/lg, CSS border spinner, sr-only label)
  - HbcEmptyState enhanced (icon alias, h2 heading, dual actions, backward compat)
  - useMinDisplayTime hook (debounced spinner visibility)
Documentation added:
  - docs/how-to/developer/phase-4.9-messaging-feedback.md
  - docs/architecture/adr/ADR-0022-ui-messaging-feedback-system.md
All exports added to src/index.ts and src/hooks/index.ts
-->