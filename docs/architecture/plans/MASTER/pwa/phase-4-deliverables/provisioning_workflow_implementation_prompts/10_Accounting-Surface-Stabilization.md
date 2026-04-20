# Prompt 10 — Accounting Surface Stabilization

## Objective

Stabilize the Accounting controller review workflow against the corrected backend/runtime seams so the review surface is genuinely actionable and not merely display-first.

## Required repo-truth reading

- `apps/accounting/src/pages/ProjectReviewQueuePage.tsx`
- `apps/accounting/src/pages/ProjectReviewDetailPage.tsx`
- `packages/provisioning/src/api-client.ts`
- `backend/functions/src/functions/projectRequests/index.ts`
- `backend/functions/src/functions/provisioningSaga/index.ts`

## Execution instructions

You are acting as a senior implementation agent working directly in the live HB Intel repo.

Perform the work directly in code.

Before changing code:
1. inspect the required repo-truth files,
2. inspect the current implementation files named below,
3. identify the exact contract or wiring mismatch,
4. implement the smallest correct set of changes,
5. validate against the affected surfaces and runtime seams.

Do not re-read files that are already in your active context or current memory unless needed to verify a contradiction or retrieve exact evidence.

## Implementation scope

- Update the queue page to consume normalized list responses.
- Ensure the detail page actions align exactly to the corrected backend behavior.
- Preserve the review lifecycle states already defined in repo truth.
- Improve post-action refresh/navigation behavior so reviewers land in a coherent next state after approve, hold, or clarification.

## Required deliverables

- Updated Accounting review queue/detail pages
- Evidence that controller actions now work against the live backend flow

## Acceptance criteria

- Queue page loads correctly from normalized list responses.
- Clarification and hold actions continue to work.
- Approval with valid project number launches the now-wired provisioning path.

## Required response format

Return your result using exactly these headings:

### Summary
### Repo-truth findings
### Files changed
### Implementation details
### Validation performed
### Remaining risks / follow-ups
