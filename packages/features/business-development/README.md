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

## SF22 Post-Bid Learning Adapter Usage

The `post-bid-learning` surface is a Business Development adapter over `@hbc/post-bid-autopsy`. It owns BD profile defaults, deterministic projections, hook composition, the `PostBidAutopsyWizard`, `AutopsySummaryCard`, `AutopsyListView`, and `LearningInsightsDashboard` UI surfaces, plus route/label/context integration wrappers over primitive reference integrations. Evidence, confidence, taxonomy, governance, publication, lifecycle, stale/supersession handling, downstream publish gating, and testing contracts remain primitive-owned.

## Linkbacks

- Primitive package docs: [`@hbc/strategic-intelligence`](../../strategic-intelligence/README.md)
- SF20 plan family: [SF20 master](../../../docs/architecture/plans/shared-features/SF20-BD-Heritage-Panel.md)
- SF20 package scaffold task: [SF20-T01](../../../docs/architecture/plans/shared-features/SF20-T01-Package-Scaffold.md)
- SF20 API reference: [BD Heritage Strategic Intelligence API](../../../docs/reference/bd-heritage-strategic-intelligence/api.md)
- SF20 adoption guide: [BD Heritage Strategic Intelligence Adoption Guide](../../../docs/how-to/developer/bd-heritage-strategic-intelligence-adoption-guide.md)
- SF20 decisions reference: [PH7-SF-20 feature decisions](../../../docs/explanation/feature-decisions/PH7-SF-20-Module-Feature-BD-Heritage-Panel.md)
- Existing SF19 primitive docs: [`@hbc/score-benchmark`](../../score-benchmark/README.md)
