# Prompt 03 — Admin Webpart Loader Contract Decision and Implementation

## Objective

Resolve the Admin SPFx runtime boundary conflict by choosing and implementing one authoritative webpart loading contract, then aligning source, emitted bundles, and package metadata to that decision.


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


## Decision Problem

The remediation baseline indicates a mismatch between:
- a shell-loader / split-bundle contract in the audited package, and
- a direct React mount path in current Admin source.

This prompt must decide which contract is authoritative for release.

## Required Tasks

1. Compare the two candidate runtime models:

### Option A — Shell-loader contract
- shell bundle as webpart entry
- shell loads app bundle dynamically
- runtime expects global/module mount/unmount contract

### Option B — Direct webpart mount contract
- SPFx webpart entry directly mounts the React app
- no obsolete shell indirection remains unless explicitly justified

2. Choose the preferred release model using:
- correctness
- maintainability
- packaging clarity
- release reproducibility
- diagnosability in SharePoint runtime
- alignment with current repo direction

3. Implement the chosen model across:
- source entry points
- emitted bundle contract
- package metadata
- any runtime module/global naming
- any loader or shell code
- any docs that define the Admin runtime boundary

4. Remove or retire obsolete code paths that would reintroduce ambiguity.

## Deliverables

Create or update:

- implementation files needed to enforce a single Admin runtime contract
- `phase-14/runtime/admin-runtime-contract-decision.md`
- `phase-14/runtime/admin-runtime-contract-diff.md`
- `phase-14/runtime/admin-runtime-contract-validation-checklist.md`

## Hard Gates

This prompt is not complete unless:
- a single authoritative runtime contract exists
- there is no remaining ambiguity about which Admin entry point is supposed to ship
- package metadata, emitted bundles, and source entry points all agree with that decision

## Required Final Report

Return:
- the chosen runtime model
- why it was chosen
- every file changed to enforce it
- any follow-on dependencies for packaging or auth validation
