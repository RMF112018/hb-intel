> **Doc Classification:** Living Reference (Diataxis) - package-level implementation detail for the Business Development feature adapter.

# @hbc/features-business-development

Business Development feature package adapters and composition surfaces.

## SF20 Strategic Intelligence Adapter Usage

The `strategic-intelligence` surface is an adapter/composition layer over `@hbc/strategic-intelligence`. It is designed for Business Development and reusable adapter patterns consumed by Estimating and Project Hub integration seams.

## Complexity Behavior Summary

Complexity-mode rendering behavior remains adapter-owned presentation:

- Essential: compact handoff summary and commitment counts
- Standard: commitment and suggestion panels
- Expert: explainability and richer projection context

Primitive trust/workflow/governance contracts remain in `@hbc/strategic-intelligence`.

## Profile and Projection Contracts

- profile defaults are defined in `src/strategic-intelligence/profiles`
- adapter projections are defined in `src/strategic-intelligence/adapters`
- composition hooks are defined in `src/strategic-intelligence/hooks`
- composition components are defined in `src/strategic-intelligence/components`

## Sensitivity and Redaction Rendering Expectations

Sensitivity and redaction policies are primitive-owned. Adapter components render redacted or non-redacted fields according to primitive-projected policy outputs and do not redefine sensitivity rules.

## Existing SF19 Adapter Surface

The package also includes the SF19 `score-benchmark` adapter surface over `@hbc/score-benchmark`.

## Linkbacks

- Primitive package docs: [`@hbc/strategic-intelligence`](../../strategic-intelligence/README.md)
- SF20 plan family: [SF20 master](../../../docs/architecture/plans/shared-features/SF20-BD-Heritage-Panel.md)
- SF20 package scaffold task: [SF20-T01](../../../docs/architecture/plans/shared-features/SF20-T01-Package-Scaffold.md)
- SF20 decisions reference: [PH7-SF-20 feature decisions](../../../docs/explanation/feature-decisions/PH7-SF-20-Module-Feature-BD-Heritage-Panel.md)
- Existing SF19 primitive docs: [`@hbc/score-benchmark`](../../score-benchmark/README.md)
