# ADR-0100 — Smart Empty State Platform Primitive

**Status:** Accepted
**Date:** 2026-03-10
**Deciders:** HB Intel Architecture Team
**Supersedes:** None
**Note:** Source specification PH7-SF-11 referenced ADR-0020. Per current ADR allocation policy, the canonical ADR for SF11 is ADR-0100.

## Context

Empty states across HB Intel modules are currently inconsistent and often non-actionable, harming first-use learnability and onboarding quality.

## Decisions

### D-01 — Classification Precedence
`loading-failed > permission-empty > filter-empty > first-use > truly-empty`.

### D-02 — Resolver Contract
Modules define content through `ISmartEmptyStateConfig.resolve(context)`.

### D-03 — CTA Model
At most two CTAs plus optional filter-clear action.

### D-04 — First-Visit Persistence
Adapter interface with browser fallback; no hard dependency on `@hbc/session-state`.

### D-05 — Complexity Behavior
Essential shows tip, Standard collapses tip, Expert hides tip.

### D-06 — Variant Model
`full-page` and `inline` variants share classification semantics.

### D-07 — SPFx Compatibility
App-shell-safe components only; no external asset dependency.

### D-08 — Notification Boundary
No package-level dependency on notification-intelligence.

### D-09 — Adoption Baseline
BD/Estimating/Project Hub/Admin provide reference configs.

### D-10 — Testing Sub-Path
`@hbc/smart-empty-state/testing` exposes canonical fixtures and classification states.

## Compliance

This ADR is locked and may be superseded only by a new ADR with explicit rationale.
