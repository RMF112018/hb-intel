# Prompt 04 — State/Error Truthfulness and Support Details

## Objective

Replace generic Safety upload/read errors with classified, supportable, user-safe error states.

## Governing authorities

- backend failure envelopes;
- `SafetyBackendCommandError`;
- `SafetyConfigurationError`;
- `SafetyAdapterFetchError`;
- WCAG status message guidance;
- supportability requirement for request IDs and failure classes.

## Files / seams to inspect

- `apps/safety/src/pages/UploadPage.tsx`
- `apps/safety/src/pages/ReportingPeriodDashboardPage.tsx`
- `apps/safety/src/pages/ReviewQueuePage.tsx`
- `apps/safety/src/components/SafetyStatusPanel.tsx`
- error classes in shared package

## Current gap

Public-main UploadPage surfaces generic upload failure and generic period-list failures. Backend diagnostics are not preserved in UI.

## Required implementation outcome

Implement an error mapper that distinguishes config, auth, CORS/network, route not found, validation contract, template incompatibility, parser authority violation, reporting-period mismatch, project unresolved, duplicate/supersession risk, commit failed, and replay failed.

Display user-safe headline, action guidance, and expandable support details with frontend request ID, backend request ID, failure class, preview failure class, route, status, and attempts.

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
