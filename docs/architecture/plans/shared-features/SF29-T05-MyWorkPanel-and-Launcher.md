# SF29-T05 - MyWork Panel and Launcher

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-29-Shared-Feature-My-Work-Feed.md`
**Decisions Applied:** L-01, L-02, L-06, L-07, L-08, L-09
**Estimated Effort:** 0.9 sprint-weeks
**Depends On:** T04

> **Doc Classification:** Canonical Normative Plan - SF29-T05 surface task; sub-plan of `SF29-My-Work-Feed.md`.

---

## Objective

Define shell-entry and quick-triage surfaces for My Work using package-owned composite components built from existing `@hbc/ui-kit` primitives.

---

## Surface Contracts

- `HbcMyWorkLauncher`
  - shell-level entry point with urgent count, unread count, and quick open behavior
- `HbcMyWorkBadge`
  - compact count indicator using canonical count semantics only
- `HbcMyWorkPanel`
  - vertical quick-triage panel with grouped compact queue and primary micro-actions
- `HbcMyWorkPlanningBar`
  - Today / This Week / Waiting On / Defer controls
- `HbcMyWorkOfflineBanner`
  - cached/degraded/offline state and queued-replay visibility

---

## UI Composition Rule

These surfaces must reuse `@hbc/ui-kit` primitives first:

- `HbcPanel`
- `HbcCard`
- `HbcBanner`
- `HbcEmptyState`
- `HbcStatusBadge`
- `HbcButton`
- `HbcPopover`
- `HbcTypography`

Only genuinely reusable missing primitives should be added to `@hbc/ui-kit`. My Work-specific orchestration, list composition, and count semantics remain package-owned in SF29.

---

## Behavior Requirements

- launcher opens panel by default and exposes route/open callback for full feed
- badge count must match panel and feed now-count semantics exactly
- panel supports inline `mark-read`, `defer`, `undefer`, and `open item` actions
- panel remains list-oriented; no full data-table behavior
- offline banner must show last successful sync time and queued local action count
- panel must expose concise why-here summaries without requiring full reason drawer by default

---

## Complexity Rules

- Essential: show counts, item title, due state, one primary action
- Standard: add source/module badge, why-here summary, and micro-actions
- Expert: add richer reasoning affordances, permission clarity, and queue-health diagnostic hints

---

## Integration Requirements

- `@hbc/shell` mounts launcher, badge, and panel through public component exports only
- panel disclosure state remains local UI state, not feed truth
- field/mobile variants may compress layout but must not change count rules or source truth

---

## Verification Commands

```bash
pnpm --filter @hbc/my-work-feed test -- panel
pnpm --filter @hbc/my-work-feed test -- launcher
pnpm --filter @hbc/my-work-feed test -- offline-banner
pnpm --filter @hbc/my-work-feed check-types
```
