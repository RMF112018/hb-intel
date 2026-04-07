# Prompt 05 — SharePoint Runtime Proof and Closeout

## Objective

Validate the corrected Spotlight image behavior in SharePoint-hosted runtime and close out the remediation with concrete proof.

## Why This Prompt Exists

The failure occurs in deployed SharePoint runtime. Final success must be proven there.

## Required Runtime Proof

Using the rebuilt package and the live list-backed Spotlight:

1. Confirm a valid list-backed featured image renders successfully.
2. Confirm supporting rail thumbnails render successfully.
3. Confirm no unresolved reserved token string is being emitted as the final browser image request.
4. Confirm placeholder behavior still works when an item has no valid resolvable image.
5. Confirm there is no regression to manifest-seeded fallback behavior where applicable.

## Evidence to Capture

Collect concise proof in the completion note:

- the resolved final image URL shape now reaching the browser
- confirmation that bad reserved token values no longer become network requests
- whether any console or network errors remain
- whether the issue is fully resolved for both featured and rail surfaces

## Hard Constraints

- Do **not** widen into general QA of unrelated webparts.
- Do **not** treat visual polish work as part of this closeout.
- Do **not** re-read files that are already in your active context window; use current context first and only open additional files when needed to complete the task safely and correctly.

## Deliverable

Produce a final remediation closeout note with these sections:

- `Runtime Result`
- `Final Image URL Behavior`
- `Featured Surface Proof`
- `Rail Surface Proof`
- `Fallback Proof`
- `Remaining Risks`
- `Recommended Next Step`

## Closeout Standard

Only declare success if all of the following are true:

- the root cause is corrected, not just masked
- both featured and rail surfaces are validated
- the deployed package reflects the fix
- the browser is no longer asked to load unresolved `PrimaryImage` token values
