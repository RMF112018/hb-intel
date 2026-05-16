# 06 — Exact File-Level Targets

## Purpose

This map identifies the repo files most likely to be touched by the implementation prompts and the reason each matters.

---

# Frontend Files

## `apps/my-dashboard/src/surfaces/home/MyWorkHomeSurface.tsx`
### Why
Controls card composition in `loading`, `error`, and resolved readiness variants.

### Expected change
Render both:
- `MyProjectsHomeCard`
- `AdobeSignActionQueueCard`

in loading and error states.

---

## `apps/my-dashboard/src/surfaces/home/MyWorkHomeSurface.test.tsx`
### Why
Currently asserts Adobe-only composition during loading/error.

### Expected change
Update the tests to lock the improved two-card composition.

---

## `apps/my-dashboard/src/shell/MyWorkSurfaceRouter.tsx`
### Why
Passes surface readiness and currently passes `getApiToken` downstream for My Projects.

### Expected change
Remove obsolete `getApiToken` threading if Prompt 02 refactor proceeds.

---

## `apps/my-dashboard/src/shell/MyWorkSurfaceRouter.test.tsx`
### Why
Current unresolved-home test does not prove My Projects mounts and starts its fetch.

### Expected change
Add/update tests to validate:
- unresolved home,
- My Projects mounted,
- project-links fetch invoked,
- no false ready flash.

---

## `apps/my-dashboard/src/modules/myProjects/MyProjectsHomeCard.tsx`
### Why
Owns the My Projects request and currently constructs a local client factory instance.

### Expected change
Use:
```ts
useMyWorkReadModelClient()
```

Remove local factory import and `getApiToken` prop.

---

## `apps/my-dashboard/src/modules/myProjects/MyProjectsHomeCard.test.tsx`
### Why
Mocks local factory construction.

### Expected change
Use provider-wrapped stub client renders.

---

## `apps/my-dashboard/src/shell/MyWorkShell.tsx`
### Why
Passes `getApiToken` into router.

### Expected change
Stop passing it into `MyWorkSurfaceRouter` after client-seam cleanup.

---

## `apps/my-dashboard/src/MyDashboardApp.tsx`
### Why
Owns the provider composition and still legitimately passes `getApiToken` into the provider and shell.

### Expected change
Likely no behavior change; confirm no unnecessary edits.

---

## `apps/my-dashboard/src/api/myWorkBackendReadModelClient.ts`
### Why
Central request seam.

### Expected change
Add frontend route timing marks around `callBackend(...)` requests.

---

## `apps/my-dashboard/src/runtime/myWorkPerformanceMarks.ts`
### Why
New safe utility for mark/measure wrappers.

### Expected change
Create.

---

## `apps/my-dashboard/src/runtime/useMyWorkReadModelEnvelope.ts`
### Why
Provides home-envelope loading lifecycle.

### Expected change
May remain unchanged; inspect whether marks belong here or in backend client seam. Package preference is backend-client route timing plus card useful-state marks.

---

## `apps/my-dashboard/src/modules/adobeSign/AdobeSignActionQueueCard.tsx`
### Why
Owns Adobe action-queue presentation state and can emit useful-state mark.

### Expected change
Add a safe effect to emit the Adobe useful-state mark once pure loading exits.

---

## `apps/my-dashboard/src/modules/adobeSign/useAdobeSignRecentCompletionsReadModel.ts`
### Why
Deferred view fetch path.

### Expected change
Add route request timing only if the centralized backend client instrumentation already covers it; do not alter deferred-fetch semantics.

---

# Backend Files

## `backend/functions/src/hosts/my-work-read-model/my-work-read-model-routes.ts`
### Why
Route handlers and diagnostics context.

### Expected change
Likely no major behavior change; may need small wiring change if diagnostics types expand.

---

## `backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-principal-resolver.ts`
### Why
Principal resolution result telemetry exists here.

### Expected change
Add `durationMs`.

---

## `backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-token-service.ts`
### Why
Token and refresh result telemetry exists here.

### Expected change
Add `durationMs`.

---

## `backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-action-queue-adapter.ts`
### Why
Action-queue stage coordination and search result telemetry.

### Expected change
Add duration measurements and propagate into safe existing events.

---

## `backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-live-search-client.ts`
### Why
Adobe HTTP search occurs here.

### Expected change
Timing can be measured either here or one layer above. Package preference: include the actual network search duration in telemetry emitted by the adapter/search result path.

---

## `backend/functions/src/hosts/my-work-read-model/read-models/project-links/my-project-links-read-model-provider.ts`
### Why
Project Links loader concurrency, reconciliation, and diagnostics.

### Expected change
Add:
- source loader duration result event,
- reconciliation duration result event.

---

## `backend/functions/src/hosts/my-work-read-model/read-models/project-links/my-project-links-runtime-diagnostics.ts`
### Why
Reporter types may require extension.

### Expected change
Add event shape support if needed.

---

## `backend/functions/src/services/legacy-fallback/graph-list-client.ts`
### Why
Potential follow-on hotspot if source loaders prove expensive.

### Expected change in this package
None required unless Prompt 04 agent determines a small type-safe timing seam is necessary. Defer Graph optimization itself.

---

# Reference Files to Inspect but Not Necessarily Edit

- `apps/my-dashboard/src/runtime/MyWorkReadModelClientProvider.tsx`
- `apps/my-dashboard/src/api/myWorkReadModelClientFactory.ts`
- `packages/models/src/myWork/MyWorkReadModels.ts`
- `backend/functions/src/utils/withTelemetry.ts`
- `backend/functions/src/middleware/auth.ts`
- `backend/functions/host.json`
- `apps/my-dashboard/package.json`
- `backend/functions/package.json`

These establish runtime composition, route IDs, existing telemetry posture, and validation commands.
