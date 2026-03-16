> **Doc Classification:** Living Reference (Diataxis) - package-level implementation detail for the score benchmark primitive.

# @hbc/score-benchmark

> **Phase 1 Scope:** `@hbc/score-benchmark` is deferred from Phase 1 scope per P0-A2 D-010 resolution (2026-03-16). Core dependency `@hbc/strategic-intelligence` is scaffold-only. Phase N assignment TBD via OD-013 in P0-E2 Open Decisions Register.

`@hbc/score-benchmark` is the Tier-1 benchmark primitive that provides reusable decision-support contracts and runtime scaffolding for confidence, similarity, recommendation, governance, recalibration, and explainability.

## Primitive Overview and Cross-Module Usage

This package owns reusable benchmark contracts for adapter modules. Feature adapters (such as Business Development) supply profile defaults and composition copy while consuming primitive runtime contracts via public exports.

## Ownership Model

- Confidence ownership: primitive confidence tiering and reason contracts are owned in `model/confidence`.
- Similarity ownership: primitive similarity scoring and strength-band contracts are owned in `model/similarity`.
- Recommendation ownership: primitive recommendation-state derivation contracts are owned in `model/recommendation`.

## Governance Guardrails

Filter governance and anti-benchmark-shopping controls are primitive-owned via `model/governance`, including:

- default cohort lock checks
- approved cohort policy checks
- filter-change audit flags
- warning-threshold triggers

## Offline and Provenance Model

The primitive contract is aligned for offline-first consumption:

- cache-first read paths for benchmark snapshots
- IndexedDB persistence through `@hbc/versioned-record`
- sync replay through background synchronization flows
- immutable provenance and snapshot continuity via versioned records

## Decision-Quality Telemetry Contract Summary

`model/recalibration` defines primitive-owned recalibration and predictive-value payload shape so adapters can project decision-quality telemetry without owning the underlying contract semantics.

## Exports

| Export Path | Purpose |
|---|---|
| `@hbc/score-benchmark` | Runtime types, model entrypoints, API snapshot assembler, hooks, component model helpers |
| `@hbc/score-benchmark/testing` | Testing-only mock profile and mock snapshot factory |

## Architecture Boundary Rules

- Primitive owns confidence/similarity/recommendation/governance/recalibration/explainability contracts.
- Adapters must consume primitive public exports only (`.` and `./testing`).
- Adapter UI composition must not re-implement primitive governance or recalibration logic.

## Testing Entrypoint

Import testing helpers from:

```ts
import {
  createMockScoreGhostOverlayState,
  createMockScorecardBenchmark,
  mockScoreBenchmarkStates,
} from '@hbc/score-benchmark/testing';
```

## Linked Plans and ADRs

- [SF19 master plan](../../docs/architecture/plans/shared-features/SF19-BD-Score-Benchmark.md)
- [SF19-T09 testing and deployment](../../docs/architecture/plans/shared-features/SF19-T09-Testing-and-Deployment.md)
- [ADR-0108 BD score benchmark ghost overlay](../../docs/architecture/adr/ADR-0108-bd-score-benchmark-ghost-overlay.md)
- [Companion primitive ADR (ADR-0112)](../../docs/architecture/adr/ADR-0112-score-benchmark-primitive-runtime.md)
