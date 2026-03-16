> **Doc Classification:** Living Reference (Diataxis) - package-level implementation detail for the strategic intelligence primitive.

# @hbc/strategic-intelligence

> **Phase 1 Scope:** `@hbc/strategic-intelligence` is scaffold-only in Phase 1 per P0-A2 D-010 resolution (2026-03-16). This package has no runtime adapters and no tests. Do not build production adapters or surfaces that depend on this package until Phase N (TBD via OD-013 in P0-E2) scope is confirmed and the package reaches `usable-but-incomplete` maturity.

`@hbc/strategic-intelligence` is the Tier-1 primitive for heritage snapshot context and additive living strategic intelligence across modules.

## Primitive Overview

This package provides reusable, primitive-owned contracts for strategic intelligence runtime surfaces. Adapters consume public exports and compose domain-specific UI behavior.

## Heritage Snapshot vs Living Intelligence Model

- Heritage Snapshot is immutable decision context captured at handoff boundaries.
- Living Strategic Intelligence is additive, versioned, and never mutates historical snapshot context.

## Trust, Provenance, Recency, and Sensitivity

Primitive contracts own reliability tiering, provenance source classification, recency/stale indicators, sensitivity labels, and redaction policy seams.

## Handoff Acknowledgment and Commitments Lifecycle

Primitive contracts define acknowledgment participants, commitment register entry shape, and lifecycle state transitions for downstream workflow implementations.

## Suggestions and Explainability Contract Summary

Suggestion and explainability contracts are primitive-owned to support reusable recommendation surfaces while adapters control presentation.

## Offline and Provenance/Snapshot Model

The primitive is structured for offline-safe snapshot + additive entry handling and provenance continuity over immutable snapshot records.

## Telemetry and Operational Indicators

Telemetry state contracts include handoff quality, commitment fulfillment, stale-entry backlog, conflict-resolution latency, and suggestion explainability engagement indicators.

## Exports and Boundaries

| Export Path | Purpose |
|---|---|
| `@hbc/strategic-intelligence` | Runtime contracts, model modules, API scaffold, hooks scaffold, component model scaffold |
| `@hbc/strategic-intelligence/testing` | Test-only factory helpers and mock profile creators |

Boundary rules:
- Primitive owns trust/workflow/governance contract seams.
- Adapters consume primitive public exports only.
- Adapter view composition must not re-implement primitive trust/workflow governance semantics.

## Testing Guidance

Import testing helpers from `@hbc/strategic-intelligence/testing`.

## Linked Plans and ADRs

- [SF20 master plan](../../docs/architecture/plans/shared-features/SF20-BD-Heritage-Panel.md)
- [SF20-T09 testing and deployment](../../docs/architecture/plans/shared-features/SF20-T09-Testing-and-Deployment.md)
- [ADR-0109 BD heritage living strategic intelligence](../../docs/architecture/adr/ADR-0109-bd-heritage-living-strategic-intelligence.md)
- [ADR-0113 strategic intelligence primitive runtime](../../docs/architecture/adr/ADR-0113-strategic-intelligence-primitive-runtime.md)
