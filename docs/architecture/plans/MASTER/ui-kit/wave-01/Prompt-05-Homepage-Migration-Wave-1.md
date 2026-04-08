# Prompt 05 — Homepage Migration Wave 1

You are working in the live HB Intel repository.

## Objective

Migrate the highest-value homepage and SPFx presentation surfaces onto the new shared presentation lane with controlled use of adapters and minimal regressions.

This prompt is governed by the accepted Prompt 00 reconciliation note and its corrective addendum. Treat that accepted Prompt 00 output as the active baseline.

## Mandatory reference files

Read and follow:

- `Prompt-00-Acceptance-and-Corrective-Addendum.md`
- `UI-System-Reconciliation-Execution-Note.md`
- `docs/reference/ui-kit/UI-System-Layer-Model.md`
- `docs/reference/ui-kit/Presentation-Lane-Standard.md`
- `docs/architecture/blueprint/ui-system-target-architecture.md`
- `docs/how-to/developer/Building-New-Homepage-Surfaces.md`
- `docs/how-to/developer/Migrating-Legacy-UI-to-the-Two-Lane-System.md`

Inspect the live homepage and SPFx webpart consumers targeted for first-wave migration.

Do not reread files that are already in your active context unless needed.

## First-wave targets

Prioritize the most visible presentation surfaces, such as:

- hero banner,
- project spotlight,
- leadership message,
- company pulse,
- and other homepage/editorial modules that currently read as weak local-card compositions.

## Required outcomes

- migrate these consumers to the shared presentation lane where appropriate,
- retain consumer-specific assembly only where it truly belongs locally,
- reduce scattered local CSS that is standing in for shared surface families,
- preserve compatibility and packaging safety where needed,
- explicitly name the target consumers that were migrated, partially migrated, or deferred.

## Consumer naming requirement

You must name the exact homepage/SPFx consumer surfaces addressed in this wave.

At minimum, identify:

- each targeted webpart or homepage module,
- what moved into shared UI vs stayed local for that named consumer,
- which named consumers were deferred and why,
- which named consumers now have visual proof.

Do not report this wave as a generic homepage migration.

## Validation

Provide:

- migrated target list with named consumers,
- summary of which concerns moved into shared UI vs stayed local for each named consumer,
- visual proof notes tied to each named consumer,
- verification actually run,
- any packaging/build proof required for affected SPFx consumers.

## Required completion report structure

Use this exact structure in your completion note:

### Structural / architectural progress
### Visual / presentation-quality progress
### Verification performed
### Remaining risks or regressions

The visual section must state whether each named consumer materially advanced beyond the prior weak local-card composition.

## Guardrails

- Do not force every local composition into the UI kit if it is truly consumer-specific.
- Do not leave obviously reusable presentation treatment trapped in local webpart code.
- Do not report success without naming the exact consumers changed.
