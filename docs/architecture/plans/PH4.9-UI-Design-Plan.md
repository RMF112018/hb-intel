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