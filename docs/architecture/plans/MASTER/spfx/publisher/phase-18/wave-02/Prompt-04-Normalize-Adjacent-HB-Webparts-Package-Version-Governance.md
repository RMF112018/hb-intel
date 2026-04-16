# Prompt-04 — Normalize Adjacent `hb-webparts` Package Version Governance

## Objective
Close the remaining adjacent package-governance drift in `hb-webparts` so the extracted Publisher boundary sits beside a cleaner companion package.

## Governing authority / required reference docs
- live repo truth in `main`
- `apps/hb-webparts/config/package-solution.json`
- Microsoft Learn documentation on SPFx solution and feature versioning / upgrade behavior

## Exact repo files and code paths to inspect
- `apps/hb-webparts/config/package-solution.json`
- any upgrade-action or feature-provisioning files that justify distinct feature-version behavior
- packaging notes that explain the current versioning model

## Exact issue to close
`hb-webparts` currently carries solution version `1.0.0.303` while the packaged feature version remains `1.0.0.277`. This is not a Publisher extraction blocker, but it is adjacent package-governance drift.

## Required implementation outcome
- determine whether the version split is intentional and required
- if not required, normalize it
- if required, document the governing rationale and prove it matches the upgrade model

## Validation / proof-of-closure requirements
- prove the chosen solution/feature version strategy is reflected in the emitted package
- document the rationale in a concise closure note
- confirm the change does not reintroduce Publisher ownership into `hb-webparts`

## Deliverables or closure docs to create
- config update if needed
- short closure note

## Explicit guardrails
- conduct an exhaustive scrub of the adjacent versioning path before editing
- do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes
- do not make unrelated `hb-webparts` functional changes
