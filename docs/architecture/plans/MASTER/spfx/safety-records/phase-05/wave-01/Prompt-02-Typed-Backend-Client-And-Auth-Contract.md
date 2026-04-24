# Prompt-02-Typed-Backend-Client-And-Auth-Contract.md

## Objective

Replace the current thin backend command calls with a typed Safety backend client seam that preserves backend request/response truth and matches the live route contract.

## Governing authorities

- `packages/features/safety/src/ports/ISafetyInspectionRepository.ts`
- `packages/features/safety/src/hooks/queries.ts`
- `packages/features/safety/src/adapters/sharepoint/SharePointSafetyInspectionRepository.ts`
- `packages/features/safety/src/domain/types.ts`
- `backend/functions/src/functions/adminApi/safety-record-keeping-routes.ts`
- `backend/functions/src/utils/response-helpers.ts`
- `backend/functions/src/middleware/authorization.ts`
- Microsoft Learn: SPFx Entra-secured API guidance, `AadHttpClient`, `AADTokenProvider`

## Current gap to close

The current adapter:
- calls ingest + replay only,
- uses bare `fetch`,
- throws generic `SafetyAdapterFetchError` on failed backend responses,
- discards `requestId`, `failureClass`, `previewFailureClass`, `graphContext`, and route diagnostics,
- has no explicit preview method in the repository interface.

## Required implementation outcome

1. Introduce a distinct typed backend command client for:
   - preview
   - ingest
   - replay
2. Preserve backend response semantics rather than flattening them.
3. Preserve request IDs and classified backend failure details in typed frontend errors/results.
4. Make the auth propagation contract explicit and testable.
5. Decide deliberately whether Safety stays on direct token acquisition or moves to `AadHttpClient`; whichever path is chosen, it must be explicit, justified, and production-testable.

## Exact seams / files / symbols to inspect

- repository interface
- query hooks
- backend command invocation code
- any DTO/result/error types needed for preview/ingest/replay
- auth token acquisition in `App`
- backend route response envelopes

## Proof of closure required

- repository/client diff showing preview/ingest/replay coverage
- tests proving backend request IDs survive to the frontend state layer
- tests proving 422 failure envelopes preserve classified failure data
- explicit note describing the chosen SPFx API auth path and why

## Prohibitions

- do not remove the read-side SharePoint REST behavior unless strictly necessary
- do not silently map all backend failures back into one generic fetch error
- do not broaden scope into unrelated telemetry systems

Do not re-read files that are already in your active context unless you need to confirm drift, a dependency, or uncertainty after making changes.

Stay strictly inside the Safety frontend / shared Safety package / directly related packaging-runtime seams. Do not wander into unrelated homepage, admin, accounting, or non-Safety work.
