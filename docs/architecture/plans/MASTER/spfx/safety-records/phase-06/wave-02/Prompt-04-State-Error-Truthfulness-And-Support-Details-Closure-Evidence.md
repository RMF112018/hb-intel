# Wave-02 Prompt-04 Closure Evidence — State/Error Truthfulness and Support Details

Prompt spec: `./Prompt-04-State-Error-Truthfulness-And-Support-Details.md`.

## Objective recap

Replace generic Safety upload/preview/ingest/replay errors with classified, supportable, user-safe states. Preserve backend diagnostic truth (requestIds, failure classes, route, status, attempts) in a Safety-local support-details surface with a copy-safe payload. Do not fake success, do not offer blind retry on non-retryable failure classes, do not leak `message` free-text or `graphContext` through the copy path.

## Files changed

**Added**

- `apps/safety/src/components/SupportDetailsPanel.tsx`
- `apps/safety/src/test/supportDetailsPanel.test.tsx`
- `apps/safety/src/test/supportTruth.extended.test.ts`
- `apps/safety/src/test/reviewQueueRetryTruth.test.tsx`
- `apps/safety/src/test/ingestionOutcomeFalseSuccess.test.tsx`

**Modified**

- `apps/safety/src/pages/supportTruth.ts` — added `timestamp` to `SupportDetails`; added `failureClass` and `suggestedAction` to `TruthfulMessage`; added `suggestedActionForClass(cls)` and `composeSupportPayload(details, { suggestedAction })`; optional `at?: Date` parameter on `uploadFailureMessage`, `replayFailureMessage`, and `readFailureMessage` so callers stamp a stable observed-at timestamp.
- `apps/safety/src/components/index.ts` — export `SupportDetailsPanel` + type.
- `apps/safety/src/pages/UploadPage.tsx` — track `previewErrorObservedAt` and `ingestErrorObservedAt` via `useEffect` on error transitions; swap inline `SupportDetailsDisclosure` for `SupportDetailsPanel` at the preview-error and commit-error mount points; removed the inline helper.
- `apps/safety/src/pages/ReportingPeriodDashboardPage.tsx` — swap inline `DashboardSupportDetails` for `SupportDetailsPanel` with the classifier's `suggestedAction`; removed the inline helper.
- `apps/safety/src/pages/ReviewQueuePage.tsx` — track `replayErrorObservedAt`; swap inline `ReplaySupportDetails` for `SupportDetailsPanel`; removed the inline helper; thread `entryErrorClass` to `SafetyReviewActions`.
- `apps/safety/src/components/SafetyReviewActions.tsx` — added optional `entryErrorClass` prop; non-retryable domain classes (`template-invalid`, `template-unsupported-version`, `parse-error`, `reporting-period-mismatch`, `project-unresolved`, `replay-source-missing`) now render advisory next-step guidance instead of a naive Retry button. Duplicate suspects continue to flow through the governed supersede dialog. `network-cors`, `commit-error`, and other recoverable classes keep plain Retry.
- `apps/safety/src/components/SafetyReviewEntryCard.tsx` — pass `entryErrorClass={run.errorClass}` through to the actions cluster.
- `apps/safety/src/components/SafetyIngestionOutcome.tsx` — false-success guard on the committed branch: if `result.state === 'committed'` but `result.committed` is missing, render an ambiguous-terminal fallback and route to the Review queue rather than fake "Inspection committed"; primary committed CTA is now guarded on both the state discriminator and the paired committed payload; inline support disclosure replaced with `SupportDetailsPanel` populated via a local `supportDetailsForRun` helper, with a `suggestedActionForClass` mapping keyed off the terminal state.
- `apps/safety/src/test/uploadPreviewFlow.test.tsx` — mock now exports `SupportDetailsPanel` so the real page wiring is still exercised (shape preserved against the existing data-driven assertions).
- `apps/safety/src/test/reviewQueueAsyncA11y.test.tsx` — same mock update for the review-queue surface.

## Backend response → frontend surface mapping

Source seams (read-only, unchanged):

- `backend/functions/src/functions/adminApi/safety-record-keeping-routes.ts` — preview/ingest/replay routes + `buildIngestFailureEnvelope`, `buildPreviewFailureEnvelope`, `deriveRouteFailureClass`.
- `packages/features/safety/src/adapters/sharepoint/backendContracts.ts:7-75` — `SafetyBackendIngestionRequest`, `SafetyBackendOperationResult`, `SafetyBackendFailureEnvelope`.
- `packages/features/safety/src/adapters/sharepoint/errors.ts:69-121` — `SafetyBackendCommandError`.

Mapping (verbatim preservation; additive `timestamp` stamped on client render):

| Backend field             | Frontend field on `SafetyBackendCommandError`   | UI surface                                                              |
| ------------------------- | ------------------------------------------------ | ----------------------------------------------------------------------- |
| `message`                 | `.message`                                       | only as headline fallback on unknown seam; never primary on classified failures; never copyable |
| `code`                    | `.code`                                          | classifier input                                                        |
| `requestId`               | `.requestId` / `.backendRequestId`               | support details bullet (copyable)                                       |
| (client-generated)        | `.frontendRequestId`                             | support details bullet (copyable)                                       |
| `failureClass`            | `.failureClass`                                  | support details bullet + classifier input                               |
| `previewFailureClass`     | `.previewFailureClass`                           | support details bullet + classifier input                               |
| `graphContext`            | `.graphContext`                                  | **not rendered**; never in copy payload                                 |
| `data.diagnostics[]`      | `SafetyBackendDiagnostic[]`                      | preview blockers + warnings (pre-existing rendering)                    |
| `data.preview`            | `SafetyIngestionPreviewResult`                   | `PreviewSummary` block on `UploadPage`                                  |
| `data.result`             | `IngestionRunResult`                             | `SafetyIngestionOutcome`                                                |
| HTTP status               | `.httpStatus`                                    | support details bullet                                                  |
| transport retry count     | `.attempts`                                      | support details bullet                                                  |
| `errorKind`               | `.errorKind`                                     | classifier input                                                        |
| (client-computed)         | `timestamp` (ISO, via `errorObservedAt` state)   | support details bullet + copy payload                                   |

## Canonical state vocabulary (no new enums; existing discriminated unions reused)

| User state                         | Where it lives                                                     | Shape                                                                                                                   |
| ---------------------------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| idle                               | `UploadPage` local state                                           | `!file && !preview.data && !preview.error && !ingestion.data && !ingestion.error`                                       |
| file selected                      | `UploadPage` local state                                           | `file !== null && !hasPreviewRun`                                                                                       |
| project/context incomplete         | `UploadPage` readiness rows                                        | `intakeReady === false`                                                                                                 |
| ready to preview                   | `UploadPage` readiness rows                                        | `intakeReady && !preview.isPending && !preview.data`                                                                    |
| preview pending                    | `UploadPage`                                                       | `preview.isPending`                                                                                                     |
| preview blocked                    | `UploadPage` + `preview.diagnosticSummary`                         | `preview.data && !preview.data.commitReadiness`                                                                         |
| preview passed with warnings       | `UploadPage` + `preview.diagnosticSummary`                         | `preview.data.commitReadiness && preview.data.warnings.length > 0`                                                      |
| ingest pending                     | `UploadPage`                                                       | `ingestion.isPending`                                                                                                   |
| ingest committed                   | `IngestionTerminalStatus = 'committed'` + `result.committed`       | `result.state === 'committed' && !!result.committed`                                                                    |
| ingest failed before commit        | `IngestionTerminalStatus = 'commit-failed'`                        | `result.state === 'commit-failed'`                                                                                      |
| ingest accepted but review required| `IngestionTerminalStatus = 'review-required'`                      | `result.state === 'review-required'`                                                                                    |
| duplicate / supersession blocked   | `review-required` + `run.errorClass === 'duplicate-suspected'`     | same                                                                                                                    |
| replay pending                     | `ReviewQueuePage` replay mutation                                  | `replay.isPending`                                                                                                      |
| replay committed                   | Replay reuses `IngestionRunResult`                                 | `replay.data?.state === 'committed'`                                                                                    |
| replay failed                      | `replay.error` via `SafetyBackendCommandError`                     | `replay.error && classifyReplayFailure(...) !== 'unknown'`                                                              |
| network / auth failure             | `SafetyFailureClass = 'network-cors' \| 'auth'`                    | via classifier                                                                                                          |
| backend contract failure           | `SafetyFailureClass = 'validation-contract'`                       | via classifier                                                                                                          |
| permission failure                 | `SafetyFailureClass = 'auth'` (403)                                | via classifier                                                                                                          |
| unsupported workbook / template    | `SafetyFailureClass = 'template-incompatibility'` + `IngestionTerminalStatus = 'invalid-template'` | via classifier + terminal status                                                                |

## Classifier decision order (unchanged) + suggested-action map (new)

Order (see `supportTruth.ts` / `classifyBackendCommandFailure`):
`auth → network-cors → route-not-found → contract(template/parser/period/project/duplicate/validation) → non-contract(template/parser/period/project/duplicate) → commit-failed | replay-failed`.

| SafetyFailureClass           | Suggested next step                                                                                                    |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `config`                     | Ask an administrator to complete Safety hosted-runtime bindings before retrying.                                       |
| `auth`                       | Sign in again with a Safety-authorized account; if access should already be granted, contact an administrator.        |
| `network-cors`               | Check your connection and retry; contact IT if the failure persists.                                                   |
| `route-not-found`            | Wait for the current deploy to finish, then retry. If routes are missing after deploy, contact operations.            |
| `validation-contract`        | Correct the highlighted intake fields and re-run preview before retrying commit.                                       |
| `template-incompatibility`   | Re-issue the checklist against the current v1 Safety Checklist template.                                               |
| `parser-authority-violation` | Fix the workbook authority fields (parser-meta / named ranges) so the parser can read them authoritatively.            |
| `reporting-period-mismatch`  | Select a reporting period that includes the inspection date, or correct the workbook period.                           |
| `project-unresolved`         | Pick a resolvable project or correct the workbook project cell so it matches an active or legacy project.              |
| `duplicate-supersession-risk`| Use the Review queue supersede flow to make an intentional governed replacement.                                       |
| `commit-failed`              | Retry commit; if the failure repeats, send the copied support payload to operations.                                   |
| `replay-failed`              | Retry replay; if the failure repeats, send the copied support payload to operations.                                   |
| `read-side-list`             | Retry; if the failure repeats, confirm SharePoint list availability with an administrator.                             |
| `unknown`                    | Send the copied support payload to operations so they can classify the failure.                                        |

Retry-posture map (`SafetyReviewActions`, domain `errorClass`):

| Domain `errorClass`                                                       | Retry posture             |
| ------------------------------------------------------------------------- | ------------------------- |
| `template-invalid`, `template-unsupported-version`, `parse-error`         | `needs-workbook-fix`      |
| `reporting-period-mismatch`                                               | `needs-period-fix`        |
| `project-unresolved`                                                      | `needs-project-fix`       |
| `replay-source-missing`                                                   | `replay-source-missing`   |
| `duplicate-suspected`                                                     | governed supersede dialog |
| any other (including `commit-error`)                                      | plain `Retry` button      |

## Sanitized support payloads (illustrative — all fabricated)

Preview blocked by project-unresolved (422):

```
Safety support details
suggestedAction: Pick a resolvable project or correct the workbook project cell so it matches an active or legacy project.
requestId: req-a1b2c3
frontendRequestId: front-001
backendRequestId: back-001
failureClass: project-unresolved
previewFailureClass: project-unresolved
route: /api/safety-records/ingest/preview
status: 422
attempts: 1
timestamp: 2026-04-24T14:20:03.104Z
```

Commit failed after preview-pass (500):

```
Safety support details
suggestedAction: Retry commit; if the failure repeats, send the copied support payload to operations.
requestId: req-d4e5f6
frontendRequestId: front-002
backendRequestId: back-002
failureClass: commit-failed
route: /api/safety-records/ingest
status: 500
attempts: 1
timestamp: 2026-04-24T14:22:11.002Z
```

Replay 503 transient:

```
Safety support details
suggestedAction: Retry replay; if the failure repeats, send the copied support payload to operations.
requestId: req-g7h8i9
frontendRequestId: front-003
backendRequestId: back-003
failureClass: replay-failed
route: /api/safety-records/replay
status: 503
attempts: 2
timestamp: 2026-04-24T14:25:37.811Z
```

Permission (403):

```
Safety support details
suggestedAction: Sign in again with a Safety-authorized account; if access should already be granted, contact an administrator.
requestId: req-j1k2l3
frontendRequestId: front-004
backendRequestId: back-004
failureClass: auth
route: /api/safety-records/replay
status: 403
attempts: 1
timestamp: 2026-04-24T14:28:19.559Z
```

None of these payloads include backend `message` free-text or `graphContext` — enforced by `composeSupportPayload` and asserted in `supportTruth.extended.test.ts`.

## Tests run

- `pnpm --filter @hbc/spfx-safety exec tsc --noEmit` — clean.
- `pnpm --filter @hbc/spfx-safety test -- --run` — **40 files, 259 tests, all passing**.
- `pnpm --filter @hbc/features-safety test -- --run` — **25 files, 141 tests, all passing**.

New tests added (all green):

- `supportDetailsPanel.test.tsx` (4 tests) — bullets rendered in order; copy affordance invokes success callback; empty-details fallback text; polite-feedback live region fires.
- `supportTruth.extended.test.ts` (6 tests) — every `SafetyFailureClass` yields a non-empty `suggestedAction`; upload/replay/read stamp `failureClass` + `suggestedAction`; ISO timestamp appears in `SupportDetails.timestamp` when caller passes `at`; `composeSupportPayload` excludes `message` and `graphContext` even if callers leak them; payload is deterministic for the same inputs; empty-details fallback text.
- `reviewQueueRetryTruth.test.tsx` (7 tests) — plain `Retry` only when replay can actually fix the run; advisory guidance for template / parse / period / project / replay-source-missing; governed supersede dialog for duplicate suspects.
- `ingestionOutcomeFalseSuccess.test.tsx` (4 tests) — no "Inspection committed" rendered when `result.committed` is missing; review-required / duplicate-suspected / commit-failed render their own copy, never the committed copy.

## Before / after

Before this closure, UploadPage / Dashboard / ReviewQueue each carried their own inline `<details>` support-disclosure helper that:

- lacked `timestamp` and a `suggestedAction` line,
- exposed no copy-to-clipboard affordance,
- diverged in rendered-field set between surfaces (outcome panel dropped `frontendRequestId`, `backendRequestId`, `route`, `status`, `attempts`).

After:

- one shared Safety-local `SupportDetailsPanel` composes all surfaces with identical field set, timestamp stamping, `suggestedAction` line, and a keyboard-reachable copy affordance.
- outcome panel refuses to render a committed outcome without the paired committed payload.
- review-queue retry CTA is gated by domain `errorClass` so replay is offered only when replay can plausibly resolve the failure.

## Remaining risk

- Clipboard behavior in constrained SPFx host runtimes has a textarea/`execCommand` fallback, but hosts that disable both paths will surface the "Copy failed" polite message. Users can still read the bullets and the timestamp.
- `graphContext` structured expansion is deliberately deferred; if operations requests it, introduce a redaction policy first and promote it through the support panel with explicit allow-listing rather than free-text dumping.
- A future follow-up may promote the panel into a shared `@hbc/ui-kit` primitive. That decision is governed by `hb-ui-ux-conformance-reviewer` and is out of scope here.

## Explicitly NOT absorbed into this closure

Per the user's prompt-04 scope directive, the following adjacent concerns are deferred:

- Key Vault reference conventions for production secrets
- Backend Azure Functions rollback / re-run runbooks
- Environment-tier configuration matrix documentation
- Backend `validate-config` tightening for unsafe production defaults

Those belong to a separate release-readiness prompt and would have violated the Prompt-04 change-control rule if absorbed here.
