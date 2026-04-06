# Prompt 04 — Clean Rebuild and Deployment Proof

## Objective

Perform a clean rebuild of `hb-webparts` and produce final artifact + runtime proof that the Signature Hero styles now load correctly in SharePoint.

## Required Build Posture

Use a clean rebuild posture.
Do not trust prior generated assets.

That means:
- remove stale build output
- remove stale packaging output
- rebuild from clean state
- regenerate the `.sppkg`
- deploy and verify runtime behavior again

Do not re-read files that are still within your current context window or memory. Re-open files only when necessary to verify changed or unresolved details.

## Required Proof

### A. Emitted asset proof
Show:
- CSS asset generated
- JS bundle generated
- runtime load path aligned

### B. Deployment proof
Show:
- SharePoint requests the correct CSS
- CSS returns successfully
- Signature Hero renders with intended styling

### C. Closure proof
Summarize:
- what changed in the CSS/runtime seam
- what stale outputs were removed
- what checks passed
- whether package is now ready for normal hero iteration again

## Hard Gates

- Do not stop at “build succeeded.”
- Do not stop at “package uploaded.”
- Do not stop at “new markup visible.”
- Do not mark complete until the hero styles are visibly active in SharePoint runtime.

## Deliverables

Produce:
- rebuilt `.sppkg`
- concise closure report
- evidence that CSS asset loads successfully in runtime
- recommended post-upload verification steps

## Completion Standard

You are done only when:
- the package is rebuilt cleanly
- the CSS asset is requested and loaded
- the hero is visibly styled as intended in SharePoint
