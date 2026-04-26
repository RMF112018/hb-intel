# Prompt 02 — Resolve Manager Load Error and Config Readiness

You are working in the `RMF112018/hb-intel` repo on the live `main` branch unless instructed otherwise.

Do not re-read files that are still within your current context or memory unless you need to verify a contradiction, line number, or current repo truth.

## Objective

Resolve the current Foleon Manager load/write-readiness error using the registry-backed runtime configuration bridge created in Wave 01.

Current error:

```text
The connector needs a backend API URL or SPFx token provider configuration before writes are enabled.
```

This pass must not solve the issue by simply adding another isolated page-local configuration dependency. Registry-backed config is the target path; property-pane config is only override/bootstrap compatibility.

## Required Preconditions

Confirm before coding:

```text
HB Platform Configuration Registry provisioned or exact blocker documented
Registry validation script exists
Registry reader/runtime bridge exists
Foleon registry records exist for required config values or placeholders are marked missing/blocked
```

If registry prerequisites are absent, return a blocker report instead of patching Foleon blindly.

## Files to Inspect

```text
apps/hb-intel-foleon/src/pages/manage/ManageOrchestrator.tsx
apps/hb-intel-foleon/src/services/FoleonManagementApi.ts
apps/hb-intel-foleon/src/runtime/**
apps/hb-intel-foleon/src/types/foleon-runtime.types.ts
apps/hb-intel-foleon/src/mount.tsx
apps/hb-intel-foleon/src/FoleonApp.tsx
apps/hb-intel-foleon/src/pages/__tests__/ManagePage.test.tsx
tools/spfx-shell/src/webparts/shell/foleonRuntimeConfigBridge.ts
tools/spfx-shell/src/webparts/shell/ShellWebPart.ts
backend/functions/src/functions/adminApi/foleon-routes.ts
backend/functions/src/services/foleon-service.ts
backend/functions/src/config/foleon-list-definitions.ts
```

## Required Remediation

1. Ensure Manager readiness checks account for registry-resolved values.
2. Make the blocked state specific and actionable:
   - missing API base URL;
   - missing API resource;
   - token provider acquisition failed;
   - backend safe-config unavailable;
   - list GUID missing;
   - registry duplicate active key;
   - secret reference missing or unresolved by backend.
3. Keep safe blocked behavior when config is truly incomplete.
4. Ensure `FoleonManagementApi.buildApiUrl` behavior is documented and tested, including whether `foleonApiBaseUrl` should include `/api` or not.
5. Add Config-tab-ready data structures, even if full Config tab UI comes later.
6. Preserve existing read/list functionality and telemetry behavior.

## API Base URL Normalization Rule

Verify current behavior before changing it.

If `buildApiUrl(apiBaseUrl, path)` appends `/api`, then `foleonApiBaseUrl` should be stored as the Function App base origin, for example:

```text
https://hb-intel-function-app.azurewebsites.net
```

not:

```text
https://hb-intel-function-app.azurewebsites.net/api
```

If repo truth requires a different convention, document and test it explicitly.

## Required Tests

Add or update tests for:

```text
Manager remains blocked when registry and override lack API config
Manager is not blocked when registry supplies apiBaseUrl
Manager is not blocked when registry supplies apiResource and token provider succeeds
Manager shows token acquisition failure distinctly
buildApiUrl normalizes base URL correctly
backend safe config failure is shown as readiness warning/blocker
```

## Validation Commands

Candidate commands:

```bash
pnpm --filter @hbc/spfx-hb-intel-foleon check-types
pnpm --filter @hbc/spfx-hb-intel-foleon test
pnpm --filter @hbc/spfx-hb-intel-foleon build
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
```

Also run the registry validation script.

## Final Response Required From Agent

Return:

```text
Summary:
Changed Files:
Root Cause Confirmed:
Registry Values Used:
Readiness States Added:
Commands Run:
Validation Results:
Hosted Validation Needed:
Commit Message:
```
