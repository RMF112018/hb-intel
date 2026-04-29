# SPFx Surface Quality Standard

> **Governance Status:** Supporting standard
> **Inherits from:**
>
> - `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
> - `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Full-Page-App-Widget-Overlay.md`
> - `docs/reference/ui-kit/doctrine/UI-Doctrine-Acceptance-and-Scoring-Model.md`
>   **Doctrine Precedence:** This document does not override Layer 1 runtime doctrine.

## Purpose

Define minimum quality expectations for non-homepage SPFx full-page, widget, PCC-style, and domain-app surfaces so outcomes remain productized, host-safe, and decision-credible.

## Surface quality posture

### Required

- Use a purpose-fit composition model, not a generic enterprise-card-grid default.
- Use bento/cockpit layout posture for overview and command-center summaries where it improves operational scan and decision flow.
- Use structured workbench posture for workflows, forms, logs, approvals, and detail review.
- Preserve visible product identity and hierarchy appropriate to serious SPFx surface acceptance.
- Maintain device-depth parity across desktop, tablet, and mobile instead of a degraded mobile afterthought.

### Prohibited

- Generic enterprise-card-grid as the dominant PCC or command-center outcome.
- Fixed equal-height row defaults when they create whitespace traps, compressed content, or hierarchy collapse.
- Unscored closure based on visual opinion only.

## Widget quality contract baseline

All widgets used in these surfaces must satisfy a documented contract:

- purpose
- minimum width
- preferred span
- height behavior
- compact behavior
- state obligations
- data seam and freshness obligations
- accessibility obligations

## Composition quality checks

- Layout strategy must be container-aware.
- Hierarchy must privilege command and decision context over decorative symmetry.
- Compact states must simplify intentionally, not just shrink everything.
- Workbench states must remain readable at constrained width/height.

## Acceptance linkage

All closures must map to the acceptance/scoring model and hard-stop enforcement:

- use doctrine-aligned scoring categories;
- meet threshold expectations for the surface tier;
- no hard-stop failures can be overridden by numeric score.
