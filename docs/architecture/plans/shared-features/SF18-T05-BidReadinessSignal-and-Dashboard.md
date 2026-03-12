# SF18-T05 - BidReadinessSignal and BidReadinessDashboard

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-18-Module-Feature-Estimating-Bid-Readiness.md`
**Decisions Applied:** L-01 through L-06
**Estimated Effort:** 0.7 sprint-weeks
**Depends On:** T04 + SF18 coordinated-signal contract realignment (pre-T05)

> **Doc Classification:** Canonical Normative Plan - SF18-T05 signal/dashboard UI task; sub-plan of `SF18-Estimating-Bid-Readiness.md`.

---

## Objective

Define signal and dashboard behavior as a pure UI projection over coordinated readiness state (`Submission Eligibility`, `Bid Readiness Score`, `Estimate Confidence`) with strict complexity-mode behavior and ownership visibility.

---

## Blocking Classification

- This task is `required before T05` for:
  - coordinated-signal display model
  - pre-T05 contract expansion and compatibility envelope
  - non-stub Signal/Dashboard implementation

---

## Transitional Compatibility Rules (T05)

- Keep `useBidReadiness` as the canonical hook entrypoint.
- Preserve existing readiness fields while adding coordinated signal payloads.
- Wrap existing readiness summary in a parent aggregate output rather than hard-breaking existing consumers.
- Do not introduce additional scoring engines; reuse current deterministic model until primitive extraction checkpoint.

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

- render coordinated headline states:
  - submission eligibility state
  - bid readiness score/state
  - estimate confidence state
- blockers-first summary driven by primitive criteria ordering
- `Standard`/`Expert` show owning avatar from `@hbc/bic-next-move`
- tooltip shows top incomplete criteria, explainability entry point (`Why this score?`), and deep-link entry points

Complexity rules:

- Essential: top-line coordinated signal badges only
- Standard: Essential + owner avatar + concise criterion summary
- Expert: Standard + diagnostics metadata and explainability quick actions

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

- coordinated signal panel with eligibility/readiness/confidence split
- score ring and status headline sourced from readiness state
- due-date countdown and overdue signaling
- blocker summary strip with deep-links (`@hbc/related-items`)
- My Work visibility cues for assigned blockers (`@hbc/project-canvas`)
- explainability panel entry (`Why this score?`) with criterion-weight and source provenance summary

Complexity rules:

- Essential: compact coordinated summary with checklist entry
- Standard: expanded criterion health context and explainability preview
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

---

## Primitive Gate Note

T05 may use transitional coordinated-signal contracts within the estimating feature package.  
T05 does **not** waive the SF18 master requirement: primitive extraction to `@hbc/health-indicator` must complete before T06 can be closed.
