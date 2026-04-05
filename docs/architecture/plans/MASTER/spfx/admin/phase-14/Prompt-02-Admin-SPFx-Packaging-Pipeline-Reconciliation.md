# Prompt 02 — Admin SPFx Packaging Pipeline Reconciliation

## Objective

Identify, validate, and remediate the actual Admin packaging/build pipeline so the repo can intentionally and reproducibly generate the Admin `.sppkg` that should be released.


## Non-Negotiable Working Rules

- Do not re-read files that are already in your current context or memory unless needed to verify a contradiction, confirm exact wording, inspect a newly changed file, or capture exact evidence for a report.
- Do not make assumptions about the package, build, or runtime contract. Prove every material conclusion.
- Distinguish clearly between:
  1. confirmed package fact
  2. confirmed repo fact
  3. confirmed doc intent
  4. inferred recommendation
  5. unresolved issue
- Prefer narrow, high-signal code changes over broad speculative edits.
- Do not collapse multiple unresolved root-cause areas into one mixed remediation step.
- Preserve forensic traceability from finding → code change → regenerated artifact → validation evidence.


## Required Inputs

Use the baseline outputs from Prompt 01.

Focus on:
- `apps/admin/config/package-solution.json`
- `apps/admin/config/deploy-azure-storage.json`
- `apps/admin/package.json`
- repo root `package.json`
- any shared build tooling
- any Heft, Gulp, SPFx, Vite, or custom packaging files
- any scripts that rename, move, inject, or post-process Admin assets

## Required Tasks

1. Determine the **true current packaging path** for Admin.
2. Identify whether the audited `.sppkg` came from:
   - the current visible pipeline
   - an older pipeline still partially present
   - an out-of-band/manual packaging path
   - a stale build artifact
3. Reconcile Admin packaging so that:
   - the pipeline is explicit
   - the output path is deterministic
   - emitted asset names and manifest references are intentional
   - packaging steps are scriptable and repeatable
4. Add or fix scripts required to generate the Admin `.sppkg` from repo truth.
5. Remove or document any stale packaging paths that could generate conflicting output.

## Deliverables

Create or update:

- the Admin packaging scripts needed for a release-safe build
- `phase-14/packaging/admin-packaging-pipeline-reconciliation.md`
- `phase-14/packaging/admin-packaging-command-reference.md`
- `phase-14/packaging/admin-stale-pipeline-decision-log.md`

## Hard Gates

This prompt is not complete unless:
- there is one clearly documented Admin packaging path
- the packaging path is scriptable from the repo
- stale or ambiguous packaging routes are explicitly removed, blocked, or documented as retired

## Required Final Report

Return:
- the exact packaging path now considered authoritative
- all files changed
- which stale packaging paths were retired or blocked
- what still depends on the loader/runtime contract decision in Prompt 03
