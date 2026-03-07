# Provisioning Saga Steps Reference

**Traceability:** D-PH6-16

| Step | Name | Description | Compensation |
|---|---|---|---|
| 1 | Create Site | Creates SharePoint site from projectNumber + projectName | Delete site |
| 2 | Create Document Library | Creates "Project Documents" library | None (site deletion handles it) |
| 3 | Upload Template Files | Copies template documents from template library | None |
| 4 | Create Data Lists | Creates all HB Intel data lists per list definitions | None |
| 5 | Install Web Parts | Installs SPFx web parts; may defer to 1AM timer | None (deferred, not compensated) |
| 6 | Set Permissions | Breaks inheritance, sets role-based access | Restore inheritance |
| 7 | Associate Hub | Associates the new site with the HB Intel hub site | Disassociate |

## Idempotency Guarantee
Every step checks whether it has already been completed in Azure Table Storage before executing. If the step is found with status `Completed`, it is skipped with `idempotentSkip: true`. This makes the entire saga safe to retry.

## Step 5 Special Behavior
Step 5 uses a 90-second timeout (`PROVISIONING_STEP5_TIMEOUT_MS`). If the timeout is exceeded after 2 attempts, the step is recorded as `DeferredToTimer` and the overall saga status becomes `WebPartsPending`. The 1:00 AM EST timer trigger (`timerInstallWebParts`) will retry step 5 for all deferred jobs.

## Retry Policy
Each step uses `withRetry` with up to 3 attempts and exponential backoff (2s, 4s, 8s). Transient errors (HTTP 429, throttle, network reset) are retried. Non-transient errors (400, 403, 404) fail immediately.
