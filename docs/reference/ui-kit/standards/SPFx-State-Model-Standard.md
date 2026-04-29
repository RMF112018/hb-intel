# SPFx State Model Standard

> **Governance Status:** Supporting standard
> **Inherits from:**
>
> - `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
> - `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Full-Page-App-Widget-Overlay.md`
> - `docs/reference/ui-kit/doctrine/UI-Doctrine-Acceptance-and-Scoring-Model.md`
>   **Doctrine Precedence:** This document does not override Layer 1 runtime doctrine.

## Purpose

Define required state-model coverage for SPFx command-center, widget, and workbench surfaces.

## Required state obligations

Each governed surface and each major widget must explicitly handle:

- loading
- empty
- error
- success
- partial/degraded
- permission/authorization constraints
- data freshness/staleness indication where decision context depends on recency

## State transition quality

- Transitions must be deterministic and explainable.
- State changes must preserve compositional stability and avoid hierarchy collapse.
- Compact and constrained states must preserve critical status/action readability.

## Widget-level state contract

Widget contract documentation must include:

- purpose
- minimum width
- preferred span
- height behavior
- compact behavior
- state obligations
- data seam/freshness obligations
- accessibility obligations

## Workbench and cockpit mapping

- Bento/cockpit overview areas must communicate state and freshness at a scan level.
- Structured workbench areas for workflows/forms/logs/approvals/detail review must expose actionable state details without requiring hidden hover-only paths.

## Acceptance linkage

State-model completeness is a scored category. Missing core states or misleading transitions can trigger hard-stop failures regardless of numeric total score.
