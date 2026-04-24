# Prompt-03-Accessibility-And-Async-Interaction-Hardening.md

## Objective

Harden the Safety async workflow for accessibility and production interaction integrity.

## Governing authorities

- `apps/safety/src/pages/UploadPage.tsx`
- `apps/safety/src/pages/ReviewQueuePage.tsx`
- relevant Safety status/step/outcome components
- MDN guidance on `role="status"`, `role="alert"`, and live regions

## Current gap to close

The Safety surface has some status/error affordances, but live-region and async interaction semantics are not yet strong enough for a production upload/replay workflow.

## Required implementation outcome

1. Add a dedicated polite live region for non-urgent progress/advisory updates.
2. Add an assertive alert path only for urgent blocking failures.
3. Ensure live-region containers exist before content changes.
4. Verify button disabling / loading / retry semantics for:
   - preview
   - commit
   - replay
5. Preserve keyboard usability across project picker, preview diagnostics, and action controls.

## Proof of closure required

- accessibility-oriented test coverage where practical
- explicit explanation of which messages use `status` vs `alert` and why
- manual verification notes for keyboard and screen-reader critical paths

## Prohibitions

- do not overuse `role="alert"`
- do not move focus arbitrarily just because a status changed
- do not paper over missing semantics with visual styling only

Do not re-read files that are already in your active context unless you need to confirm drift, a dependency, or uncertainty after making changes.

Stay strictly inside the Safety frontend / shared Safety package / directly related packaging-runtime seams. Do not wander into unrelated homepage, admin, accounting, or non-Safety work.
