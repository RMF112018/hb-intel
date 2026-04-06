# Prompt 04 — Clean Rebuild, SPPKG Proof, and Deployment Readiness

## Objective

Perform a clean rebuild of `hb-webparts` and produce artifact-level proof that the new package is correct before SharePoint upload.

This is the closure prompt for the remediation package.

## Required Build Posture

You must use a clean rebuild posture.
Do not trust prior generated assets.

That means:
- remove stale build output
- remove stale packaging output
- rebuild from clean state
- regenerate the `.sppkg`
- re-audit the emitted package before marking ready

Do not re-read files that are still within your current context window or memory. Re-open files only when necessary to verify changed or unresolved details.

## Required Proof

### A. Packaged manifest proof
Show that:
- Signature Hero packaged manifest is current
- non-hero hidden-from-toolbox state is present where intended

### B. Registry proof
Show that:
- Signature Hero ID is present in the emitted app bundle
- Signature Hero routes to the rebuilt component
- stale flagship fallback routing is gone or isolated appropriately

### C. Deployment-readiness proof
Show that the package is ready for upload by summarizing:
- what changed
- what was regenerated
- what stale outputs were removed
- what artifact checks passed

## Required Deliverables

Produce:
- the rebuilt `.sppkg`
- a concise proof report
- specific grep/search evidence or equivalent for:
  - Signature Hero ID presence in emitted bundle
  - expected hidden toolbox state in packaged non-hero manifests
  - absence of stale flagship manifest defaults
- recommended post-upload verification steps for SharePoint

## Hard Gates

- Do not stop at “build succeeded.”
- Do not stop at source diff review.
- Do not mark ready until the emitted package proves correctness.
- Do not upload until artifact truth is verified.

## Completion Standard

You are done only when the rebuilt `.sppkg` proves:
- correct hero manifest
- correct toolbox hiding
- correct Signature Hero routing
- no stale flagship package truth
