# 00 — Safety App Audit Summary

## Phase 1 — Framing

### Objective

Determine exactly what the Safety frontend, shared safety feature package, runtime wiring, auth flow, request/response contracts, environment/bootstrap model, UX failure handling, and deploy/package seams require to become a production-ready frontend over the current Azure Functions Safety backend.

### Repo source of truth

The target repo is `RMF112018/hb-intel` on `main`.

The audit found a significant source-of-truth problem:
- public raw GitHub `main` shows an older direct-submit Safety frontend;
- the connected GitHub tool surfaced later-phase or more advanced frontend/backend files in some locations.

This must be treated as a release integrity finding, not ignored. A local code agent must verify the checkout, branch, package output, and deployed artifact before implementation proceeds.

### Exact Safety surface under evaluation

Primary frontend:
- `apps/safety/`
- `apps/safety/src/App.tsx`
- `apps/safety/src/webparts/safety/SafetyWebPart.tsx`
- `apps/safety/src/pages/UploadPage.tsx`
- `apps/safety/src/router/routes.ts`

Shared package:
- `packages/features/safety/`
- parser/domain/list adapter hooks and repository seams

Backend route authority:
- `/api/safety-records/provision-sharepoint`
- `/api/safety-records/ingest`
- `/api/safety-records/ingest/preview`
- `/api/safety-records/replay`

Workbook/parser authority:
- governed template contract, `ParserMeta`, named ranges, parser contract version, parse-first workflow, preview diagnostics, metadata authority, reporting period checks, project resolution, duplicate/supersession checks.

## Executive conclusion

The frontend is directionally valuable but not production-ready.

### Most important failures

1. **No truthful backend command binding in public main**
   - Public frontend creates a SharePoint repository from `spHttpClient`; it does not configure a backend base URL or API audience.
   - The SPFx webpart exposes only `description`.
   - The app cannot truthfully call the current Azure Functions command routes from the public-main implementation.

2. **No preview-before-commit workflow in public main**
   - Upload is direct-submit.
   - No preview route, no preview confirmation, no preview signature, no duplicate/supersession decision state.

3. **Auth propagation is missing at the backend seam**
   - SPFx auth bootstrap exists, but the direct frontend does not acquire an Entra token for the backend and does not attach `Authorization: Bearer ...`.

4. **Operator intake does not match backend contract**
   - No project picker.
   - No inspection number/date intake.
   - No context-aware conflict handling between parser-derived workbook values and operator context.

5. **Failure states are too collapsed**
   - Reporting-period load failure and upload failure are generic.
   - Backend request IDs, failure classes, graph context, and support metadata are absent from public-main UI.

6. **Deploy/package truth is unproven**
   - The repo access paths disagree.
   - There is no adequate release-proof that the SPFx artifact points at the correct backend, uses the correct API audience, contains the right CSS/runtime entry, and executes the expected preview/commit path.

## Strengths worth preserving

- Shared Safety domain and parser package exists.
- Governed workbook parser contract exists.
- Reporting-period, inspection, project-week, findings, ingestion-run concepts are already modeled.
- SPFx app surface and router structure exist.
- Backend route design is strong: preview, ingest, replay, provisioning, delegated-scope checks, and diagnostic envelopes.
- React Query is already present and should remain the data orchestration layer.

## Production-readiness verdict

The problems are **tractable but structural**.

They are not cosmetic. The remediation must cut the upload path over to the backend command contract, enforce delegated token propagation, redesign the upload UX around preview-before-commit, and add release-proof gates. This is a focused Safety app integration program, not a broad HB Intel rewrite.
