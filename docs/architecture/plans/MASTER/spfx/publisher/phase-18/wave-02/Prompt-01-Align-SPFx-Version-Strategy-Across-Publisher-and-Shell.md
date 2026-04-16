# Prompt-01 — Align SPFx Version Strategy Across Publisher and Shell

## Objective
Remove or explicitly govern the current SPFx version split between the source Publisher app and the isolated shell compiler.

## Governing authority / required reference docs
- live repo truth in `main`
- `apps/hb-publisher/package.json`
- `tools/spfx-shell/package.json`
- packaged Publisher manifest/scriptResource version output
- current Microsoft Learn SPFx release and environment guidance

## Exact repo files and code paths to inspect
- `apps/hb-publisher/package.json`
- `tools/spfx-shell/package.json`
- `tools/build-spfx-package.ts`
- any repo docs that define the intended packaging baseline
- lockfiles and dependency resolution outputs if relevant

## Exact issue to close
The app layer references SPFx `1.20.0` dev packages while the shell compiler and packaged scriptResources are `1.18.0`. The audit did not prove this is broken, but it is semantically weak and should not remain accidental.

## Required implementation outcome
- determine the correct supported SPFx baseline for this packaging system
- either align the versions or explicitly document and enforce the intentional split
- ensure the chosen strategy is compatible with the actual hosted SharePoint target

## Validation / proof-of-closure requirements
- prove the chosen version strategy builds and packages successfully
- prove the packaged manifest output matches the intended strategy
- document the rationale in a concise closure note

## Deliverables or closure docs to create
- dependency/config updates as required
- closure note describing the chosen version strategy

## Explicit guardrails
- conduct an exhaustive scrub of the dependency and packaging baseline before editing
- do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes
- do not make unrelated dependency upgrades
