> **Doc Classification:** Living Reference (Diataxis) - package-level implementation detail for the post-bid autopsy primitive.

# @hbc/post-bid-autopsy

`@hbc/post-bid-autopsy` is the Tier-1 primitive boundary for SF22 post-bid intelligence. It owns the reusable evidence, confidence, taxonomy, governance, publication, telemetry, and published-signal seams that BD and Estimating adapters build on.

## 1. Post-Bid Intelligence Flywheel Overview

The primitive establishes the model surface for the post-bid learning loop:

- collect structured evidence from pursuit outcomes
- score confidence and corroboration consistently
- classify findings through shared taxonomy and governance controls
- gate publication before downstream benchmark or intelligence reuse
- emit reusable published learning signals for other primitives and adapters

The primitive now provides the package boundary, public contracts, lifecycle/storage runtime, hook-state orchestration, and adapter-facing component contracts that BD and Estimating compose into their SF22 UI surfaces. Adapter UI remains outside the primitive boundary; current adapter consumers include wizard, summary-card, and list/dashboard surfaces layered over primitive-owned semantics.

## 2. Adapter-over-Primitive Boundary Rules

- Primitive ownership: evidence, confidence, taxonomy, governance, publication, telemetry, and published learning-signal contracts.
- Adapter ownership: BD and Estimating profiles, domain projections, composition hooks, and presentation scaffolds.
- Adapters must consume primitive public exports only.
- Adapters must not re-implement lifecycle, governance, evidence validation, confidence tiering, or publication gating logic.
- App routes and app-only imports are prohibited from the runtime package surface.

## 3. Evidence, Confidence, Taxonomy, and Governance Model Summary

- `model/evidence`: evidence record contract and primitive-owned evidence boundary descriptor
- `model/confidence`: aggregate confidence assessment contract and primitive-owned confidence boundary descriptor
- `model/taxonomy`: canonical taxonomy tag contract and primitive-owned taxonomy boundary descriptor
- `model/governance`: sensitivity, visibility, disagreement-capture, and override policy contract
- `model/publication`: primitive-owned publication gate contract

These modules are scaffolded with deterministic factory helpers and runtime descriptors so T02-T09 can build on explicit ownership seams without feature-package duplication.

## 4. Lifecycle and Publication Gating Summary

The primitive owns lifecycle transitions for `draft`, `review`, `approved`, `published`, `superseded`, `archived`, and `overdue`, plus append-only storage, replay metadata, publication gate evaluation, and downstream publish projections. Publication remains primitive-governed through explicit gate descriptors and blocker summaries, while BD and Estimating consume those outputs through adapter hooks and UI composition only.

## 5. Exports

| Export Path | Purpose |
|---|---|
| `@hbc/post-bid-autopsy` | Runtime contracts and primitive runtime surfaces for types, model boundaries, API, lifecycle/storage orchestration, hooks, component contracts, telemetry descriptors, and published learning signals |
| `@hbc/post-bid-autopsy/testing` | Public test fixtures and mock factory helpers for scaffold-safe consumption |

Compatibility note:

- The existing `PostBidLearningSignal` union remains a public root export for downstream consumers such as SF19 and SF20 integrations.

## 6. Testing Entrypoint Guidance

Use `@hbc/post-bid-autopsy/testing` for stable fixture creation in unit tests, Storybook scaffolds, and harnesses. Do not deep-import internal files from `src/`.

## 7. Linked Plans and ADRs

- [SF22 master plan](../../docs/architecture/plans/shared-features/SF22-Post-Bid-Learning-Loop.md)
- [SF22-T09 testing and deployment](../../docs/architecture/plans/shared-features/SF22-T09-Testing-and-Deployment.md)
- [SF22 adapter ADR target](../../docs/architecture/adr/ADR-0114-post-bid-learning-loop.md)
- [SF22 companion primitive ADR target](../../docs/architecture/adr/ADR-0115-post-bid-autopsy-primitive-runtime.md)
