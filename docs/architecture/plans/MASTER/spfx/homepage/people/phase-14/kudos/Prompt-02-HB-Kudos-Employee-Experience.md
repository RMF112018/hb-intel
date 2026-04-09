# Prompt 02 — HB Kudos Employee Experience

Implement the employee-facing HB Kudos recognition experience as a dedicated premium homepage product surface using disciplined shared homepage primitives and shared surface extensions where required.

## Objective

Build or refactor the employee-facing HB Kudos experience so it supports:

- featured kudos spotlight
- pinned and standard feed behavior
- archive / browse experience
- typed submission flow
- celebrate interaction
- role-aware detail panel behavior
- associated-item access after public visibility changes where allowed

The result must feel like a signature recognition product, not a generic SharePoint card list.

## Governing UI Rules

1. Use `@hbc/ui-kit/homepage` as the primary UI entry point.
2. Use existing shared recognition primitives where they fit.
3. If archive cards, recipient-summary patterns, or detail-panel sections are missing from the shared homepage entry, create/extend shared homepage-safe primitives first.
4. Do not create one-off local premium shells for repeated patterns.
5. Do not keep the current `HbcKudosComposer*` recipient model unchanged if it still assumes a plain text recipient string.

## Required Employee-Facing Surface Areas

### A. Homepage recognition surface
Implement/refine the main HB Kudos homepage surface for:
- featured spotlight
- pinned items
- standard items
- summary recipient presentation
- clear prominence/state language
- strong CTA behavior

### B. Submission / edit flow
Implement/refine the submission flow so it supports:
- typed recipient buckets
- required content fields
- optional media fields as supported
- validation/error/success states
- revision resubmission flow
- dirty-state handling

If the existing shared composer shell is reusable, extend it. If it is structurally insufficient, replace it with a shared homepage-safe recognition composer family.

### C. Archive / browse experience
Implement the archive/browse experience using shared recognition card/list patterns, not ad hoc local card duplication.

Archive should support:
- browse/search/filter as appropriate
- mixed visibility handling
- prominence/history-safe presentation
- summarized cards with richer detail in the panel/page

### D. Shared detail panel / detail surface
Implement/refine the employee-facing detail experience so it supports:
- full recognition content
- recipient detail
- submitter detail where appropriate
- current high-level status
- celebrate interaction where public/live
- associated-item reduced view where no longer public
- no internal-only governance leakage to ordinary viewers

## Tasks

1. Identify the existing shared recognition primitives that can be used directly.
2. Add/extend shared homepage-safe recognition primitives where needed:
   - archive card/list patterns
   - recipient summary/bucket patterns
   - detail-section patterns
   - any submission-related shells that should be shared
3. Refactor the employee-facing webpart/page consumers to use those shared primitives.
4. Replace the plain text recipient submission path with the typed recipient model.
5. Implement the visibility/detail rules from the decision lock.
6. Keep SharePoint data access and normalization local and thin.

## Deliverables

Return:

1. changed-file summary
2. shared primitives created/extended
3. employee-facing consumer files changed
4. recipient-flow summary
5. archive/detail behavior summary
6. validation performed
7. remaining issues, if any

## Important Rules

- Do not flatten the experience into weak generic cards for the sake of convenience.
- Do not bypass the shared kit with local premium look-alikes.
- Do not leave the employee-facing surface visually interchangeable with the HR governance workspace.
- Do not re-read files that are still within your active context window or memory unless a detail is genuinely uncertain.
