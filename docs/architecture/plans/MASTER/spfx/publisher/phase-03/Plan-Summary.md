# Plan Summary — Publisher Remediation Sequence

## Objective
Resolve each issue from the publisher backend audit with tightly bounded, test-backed code changes that move the implementation toward a tenant-aligned, operationally trustworthy article publishing workflow.

## Recommended execution order
1. Close the direct `published` state bypass.
2. Close publish / republish lifecycle state and history gaps.
3. Realign the team-member seam to the real tenant schema.
4. Realign the media seam to the real tenant schema.
5. Harden archive / withdraw destination-page lifecycle behavior.
6. Realign descriptor `mvpFields` metadata to tenant truth.
7. Reconcile drift policy, preview behavior, and UI messaging.
8. Replace destructive child-list rewrite behavior with safer semantics.
9. Refine lifecycle error classification and logging precision.

## Why this order
The highest-risk failures are lifecycle-trust failures:
- a row can say `published` when no reliable page/binding lifecycle occurred
- a live page can exist without trustworthy workflow closure
- archive / withdraw can leave stale live visibility

The child-list schema seams are next because they threaten authoring correctness and preview/publish consistency.
Descriptor cleanup and error-classification refinement come later because they improve correctness and maintainability but are not the primary operational blockers.

## Common rules for every prompt
- Work in the live local `hb-intel` repo.
- Do not re-read files that are already in your active context or memory unless needed to confirm drift, dependencies, or uncertainty after changes.
- Treat the tenant schema report as binding authority for list names, internal names, field types, and required fields.
- Treat the phase-02 audit package as the defect baseline to close.
- Make the smallest complete change set that closes the prompt fully.
- Add or update targeted tests for every behavior you change.
- Produce a closure report with:
  - objective
  - files changed
  - exact defects closed
  - tests added/updated
  - remaining risks or follow-ups
  - hosted verification notes if applicable

## Shared closure directory
- `docs/architecture/plans/MASTER/spfx/publisher/phase-03-closure/`

## Success standard
The package is only successful if each prompt can be executed independently and results in a provable closure of the specific audit issue it targets, without creating new tenant-schema drift or new workflow inconsistencies.
