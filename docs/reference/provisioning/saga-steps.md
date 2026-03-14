# Provisioning Saga Steps Reference

**Traceability:** D-PH6-16, W0-G1-T01

| Step | Name | Description | Compensation |
|---|---|---|---|
| 1 | Create Site | Creates SharePoint site from projectNumber + projectName | Delete site |
| 2 | Create Document Libraries | Creates core document libraries (Project Documents, Drawings, Specifications) with versioning enabled | None (site deletion handles it) |
| 3 | Upload Template Files | Uploads template files from manifest to Project Documents; scaffolded for department library pruning and add-on template files | None |
| 4 | Create Data Lists | Creates all HB Intel data lists per list definitions | None |
| 5 | Install Web Parts | Installs SPFx web parts; may defer to 1AM timer | None (deferred, not compensated) |
| 6 | Set Permissions | Breaks inheritance, sets role-based access | Restore inheritance |
| 7 | Associate Hub | Associates the new site with the HB Intel hub site | Disassociate |

## Idempotency Guarantee
Every step checks whether it has already been completed in Azure Table Storage before executing. If the step is found with status `Completed`, it is skipped with `idempotentSkip: true`. This makes the entire saga safe to retry.

## Step 2 — Core Libraries (W0-G1-T01)
Step 2 iterates the `CORE_LIBRARIES` array from `backend/functions/src/config/core-libraries.ts`. Each library is created with an idempotency check (`documentLibraryExists`). If all libraries already exist, the step completes with `idempotentSkip: true`.

## Step 3 — Template Files (W0-G1-T01)
Step 3 reads the `TEMPLATE_FILE_MANIFEST` from `backend/functions/src/config/template-file-manifest.ts` and uploads files to the target library. Add-on template files are driven by `ADD_ON_DEFINITIONS` from `backend/functions/src/config/add-on-definitions.ts` when `status.addOns` is present (scaffolded — model changes are G2/T02 scope). Department library pruning is also scaffolded for G2/T02.

## Step 5 Special Behavior
Step 5 uses a 90-second timeout (`PROVISIONING_STEP5_TIMEOUT_MS`). If the timeout is exceeded after 2 attempts, the step is recorded as `DeferredToTimer` and the overall saga status becomes `WebPartsPending`. The 1:00 AM EST timer trigger (`timerInstallWebParts`) will retry step 5 for all deferred jobs.

## Retry Policy
Each step uses `withRetry` with up to 3 attempts and exponential backoff (2s, 4s, 8s). Transient errors (HTTP 429, throttle, network reset) are retried. Non-transient errors (400, 403, 404) fail immediately.
