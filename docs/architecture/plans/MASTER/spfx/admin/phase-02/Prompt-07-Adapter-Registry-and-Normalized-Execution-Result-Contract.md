# Prompt 07 — Adapter Registry and Normalized Execution Result Contract

## Objective

Define the contract model for adapter registration, invocation context, and normalized adapter results so later backend phases can route work through platform-specific executors without each adapter inventing its own shape.

## Context efficiency rule

Do **not** re-read files still in active context unless there is a concrete compatibility question to resolve.

## Required repo-truth context

Use:
- the target-architecture doc
- the run model
- the API contract catalog
- the audit/evidence/config contracts
- backend adapter/service patterns only as needed for naming and boundary sanity

## Scope of work

Define contract models for:
- adapter categories
- adapter descriptor / metadata
- invocation context
- input normalization expectations
- dry-run / preview capability flags
- result normalization
- warning/error output
- remediation hints
- artifact/evidence linkage
- capability discovery metadata

Cover at minimum the adapter families implied by the end-state plan:
- Azure deployment
- Entra / Graph
- SharePoint ALM / package
- SharePoint API access / approval posture
- validation / environment probes

## Required outputs

Create:

- `docs/architecture/plans/MASTER/spfx/admin/phase-2/admin-control-plane-adapter-registry-contract.md`

Create or update shared types in:

- `packages/models/src/admin-control-plane/`

At minimum define:
- adapter key / category types
- adapter descriptor interface
- adapter invocation context interface
- normalized adapter result interface
- warning / issue / remediation DTOs
- preview capability metadata

Export them through `@hbc/models`.

## Implementation requirements

- Keep these contracts execution-agnostic and type-only.
- Design the result envelope so later phases can attach evidence references without overloading every adapter result with storage logic.
- Make dry-run support first-class where applicable.
- Preserve room for adapter-specific metadata while keeping the top-level result normalized.

## Documentation requirements

The contract doc must include:
- adapter family matrix,
- descriptor fields,
- invocation contract,
- normalized result contract,
- preview/dry-run expectations,
- and guidance for future registry implementation.

## Validation requirements

- Verify exports compile.
- Confirm the adapter model lines up with the run/action/audit contract set.
- Confirm no platform-specific runtime details leaked into shared contracts beyond metadata fields.

## Acceptance / completion conditions

This prompt is complete when:
- the repo has one authoritative adapter contract document,
- one coherent normalized result type surface,
- and the model is ready for Phase 3 backend routing work.

## No-go boundaries

- Do not build the adapter registry runtime.
- Do not implement concrete adapter classes.
