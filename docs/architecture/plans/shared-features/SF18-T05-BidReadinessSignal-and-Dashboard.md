# SF18-T05 - BidReadinessSignal and BidReadinessDashboard

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-18-Module-Feature-Estimating-Bid-Readiness.md`
**Decisions Applied:** L-01 through L-06
**Estimated Effort:** 0.7 sprint-weeks
**Depends On:** T04

> **Doc Classification:** Canonical Normative Plan - SF18-T05 signal/dashboard UI task; sub-plan of `SF18-Estimating-Bid-Readiness.md`.

---

## Objective

Define signal and dashboard behavior as a pure UI projection over `@hbc/health-indicator` state, with strict complexity-mode behavior and ownership visibility.

---

## `BidReadinessSignal`

Props:

```ts
interface BidReadinessSignalProps {
  state: IBidReadinessViewState;
  complexity: 'Essential' | 'Standard' | 'Expert';
  onOpenDashboard?: () => void;
}
```

Behavior:

- render status dot + label + score + blocker badge from adapter state
- blockers-first summary driven by primitive criteria ordering
- `Standard`/`Expert` show owning avatar from `@hbc/bic-next-move`
- tooltip shows top incomplete criteria and deep-link entry points

Complexity rules:

- Essential: status dot + label + score + blocker badge only
- Standard: Essential + owner avatar + concise criterion summary
- Expert: Standard + extended diagnostics metadata

---

## `BidReadinessDashboard`

Props:

```ts
interface BidReadinessDashboardProps {
  state: IBidReadinessViewState;
  complexity: 'Essential' | 'Standard' | 'Expert';
  onOpenChecklist?: () => void;
}
```

Behavior:

- score ring and status headline sourced from primitive state
- due-date countdown and overdue signaling
- blocker summary strip with deep-links (`@hbc/related-items`)
- My Work visibility cues for assigned blockers (`@hbc/project-canvas`)

Complexity rules:

- Essential: compact summary with checklist entry
- Standard: expanded criterion health context
- Expert: Standard + weighted diagnostics and version provenance badge

---

## Accessibility

- keyboard focusable action links and checklist entry points
- aria labels for status, blockers, and sync indicators
- semantic headings for score, due-date, and blocker regions

---

## Verification Commands

```bash
pnpm --filter @hbc/features-estimating test -- BidReadinessSignal
pnpm --filter @hbc/features-estimating test -- BidReadinessDashboard
```
