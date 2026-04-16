# Publisher Backend Enhanced Remediation Prompt Package

## Purpose

This package is a closure-grade backend remediation package for the live `apps/hb-publisher` implementation on `main`.

It is not a planning memo and it is not a light rewrite of the prior package.

It is written to help a local code agent close the real backend defects and backend-coupled SharePoint list architecture gaps that are still materially open in repo truth.

## Package posture

- execute prompts in order
- do not defer known in-scope work
- do not leave partial fixes behind hidden under “follow-up” language
- do not re-read files that are still in active context unless needed to confirm drift, dependencies, or uncertainty after changes
- treat the live repo as implementation truth
- treat the checked-in schema report as tenant evidence unless a stronger provisioning authority is found and validated

## What changed versus the prior package

This rebuilt package is materially stronger than the attached prior package in the following ways:

1. it recognizes that several partial mitigations already landed in repo truth, so prompts now target the remaining defect seam instead of pretending the area is untouched
2. it expands implementation direction, required surfaces, tests, and closure criteria for each issue
3. it pulls SharePoint list architecture hardening directly into the relevant prompts instead of leaving it as a side note
4. it adds one new required prompt for structured publishing-error operability because the current error log schema is still too coarse for durable backend support
5. it removes soft language that would let the agent stop after shallow UI copy changes or partial backend rewiring

## Execution order

1. `Prompt-01-close-dirty-draft-publish-gap.md`
2. `Prompt-02-fail-closed-template-required-field-set-governance.md`
3. `Prompt-03-surface-read-model-row-rejection-diagnostics.md`
4. `Prompt-04-harden-key-governance-duplicate-detection-and-schema-authority.md`
5. `Prompt-05-structure-binding-lineage-and-regeneration-audit.md`
6. `Prompt-06-structure-publishing-error-operability-and-failure-classification.md`

## Prerequisites

Before execution, the code agent must have active context on the current backend seams at minimum:

- `apps/hb-publisher/src/webparts/articlePublisher/ArticlePublisher.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/controllers/useReadinessController.ts`
- `apps/hb-publisher/src/webparts/articlePublisher/controllers/useDraftLifecycle.ts`
- `apps/hb-publisher/src/data/publisherAdapter/publishOrchestrator.ts`
- `apps/hb-publisher/src/data/publisherAdapter/publisherRepositories.ts`
- `apps/hb-publisher/src/data/publisherAdapter/publisherRowMappers.ts`
- `apps/hb-publisher/src/data/publisherAdapter/pageBindingWriter.ts`
- `apps/hb-publisher/src/data/publisherAdapter/validation/validationEngine.ts`
- `docs/architecture/plans/MASTER/spfx/publisher/architecture/lists/publisher-list-schema-report.md`

If a clearer repo-truth provisioning owner for the publisher lists exists, the agent must locate it during Prompt 04 and adopt it as the authoritative schema surface.

## Closure standard

This package is only successful if the local code agent leaves the backend in a state where:

- stale unsaved working copies cannot be published as if they were current
- operational template governance does not fail open on unknown required-field contracts
- malformed SharePoint rows are not silently dropped without any durable diagnostic signal
- critical list-key reads and writes do not blindly trust first-match duplicates
- binding supersession is retained in structured form rather than opaque note text
- publishing failures are captured with structured, queryable operational detail rather than primarily Title-prefix prose
