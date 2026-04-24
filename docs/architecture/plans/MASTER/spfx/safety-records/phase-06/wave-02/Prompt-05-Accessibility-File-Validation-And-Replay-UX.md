# Prompt 05 — Accessibility, File Validation, and Replay UX

## Objective

Harden upload/replay UX so async states, file validation, and review/replay actions are production-grade and accessible.

## Governing authorities

- WCAG 4.1.3 status messages.
- MDN AbortController/fetch cancellation guidance.
- TanStack Query cancellation guidance.
- Safety backend replay route.

## Files / seams to inspect

- `apps/safety/src/pages/UploadPage.tsx`
- `apps/safety/src/pages/ReviewQueuePage.tsx`
- `apps/safety/src/components/SafetyFileInput.tsx` or equivalent
- `packages/features/safety/src/hooks/queries.ts`

## Current gap

Public-main upload uses a hidden input and direct submit. Review/replay flow is not proven to use current backend replay semantics. Async updates are not announced with enough precision.

## Required implementation outcome

Implement:
- governed accessible file input;
- extension + size validation;
- clear/replace behavior;
- polite live region for running/completed states;
- assertive live region for failures;
- keyboard-accessible controls;
- cancel buttons;
- replay action with explicit `supersedePrior` confirmation where applicable;
- tests for keyboard and screen-reader-critical labels/roles.

## Proof required

The closure report must include:
- exact files changed;
- route/auth/contract behavior proven;
- before/after screenshots or test output where UI is changed;
- unit/integration tests added or updated;
- build/package commands run and results;
- explicit statement of any remaining risk.

## Change control

Do not make unrelated homepage, shell, publisher, Kudos, or non-Safety changes.

Do not confuse "the UI renders" with "the app is production ready."

Do not re-read files already in active context unless needed to confirm drift, changed dependencies, or uncertainty after changes.
