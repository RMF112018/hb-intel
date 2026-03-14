# Provisioning Saga Steps Reference

**Traceability:** D-PH6-16, W0-G1-T01

| Step | Name | Description | Compensation |
|---|---|---|---|
| 1 | Create Site | Creates SharePoint site from projectNumber + projectName | Delete site |
| 2 | Create Document Libraries | Creates core document libraries (Project Documents, Drawings, Specifications) with versioning enabled | None (site deletion handles it) |
| 3 | Upload Template Files | Uploads template files from manifest to Project Documents; scaffolded for department library pruning and add-on template files | None |
| 4 | Create Data Lists | Creates all HB Intel data lists per list definitions | None |
| 5 | Install Web Parts | Installs SPFx web parts; may defer to 1AM timer | None (deferred, not compensated) |
| 6 | Set Permissions | Creates three Entra ID security groups (Leaders/Team/Viewers), populates initial membership, assigns groups to SharePoint permission levels | None (group deletion not yet implemented — documented gap) |
| 7 | Associate Hub | Associates the new site with the HB Intel hub site | Disassociate |

## Idempotency Guarantee
Every step checks whether it has already been completed in Azure Table Storage before executing. If the step is found with status `Completed`, it is skipped with `idempotentSkip: true`. This makes the entire saga safe to retry.

## Step 2 — Core Libraries (W0-G1-T01)
Step 2 iterates the `CORE_LIBRARIES` array from `backend/functions/src/config/core-libraries.ts`. Each library is created with an idempotency check (`documentLibraryExists`). If all libraries already exist, the step completes with `idempotentSkip: true`.

## Step 3 — Template Files (W0-G1-T01)
Step 3 reads the `TEMPLATE_FILE_MANIFEST` from `backend/functions/src/config/template-file-manifest.ts` and uploads files to the target library. Add-on template files are driven by `ADD_ON_DEFINITIONS` from `backend/functions/src/config/add-on-definitions.ts` when `status.addOns` is present (scaffolded — model changes are G2/T02 scope). Department library pruning is also scaffolded for G2/T02.

## Step 6 — Entra ID Group Permissions (W0-G1-T02)

Step 6 implements the three-group Entra ID security model for project site permissions:

1. **Phase 1 — Group Creation (idempotent):** For each group definition (Leaders, Team, Viewers), checks `getGroupByDisplayName` before creating via `createSecurityGroup`. Groups follow the naming convention `HB-{projectNumber}-{roleSuffix}`.

2. **Phase 2 — Initial Membership:**
   - **Leaders:** `groupLeaders` + OpEx manager UPN (fallback: `triggeredBy` if no leaders specified)
   - **Team:** `groupMembers` + `submittedBy`
   - **Viewers:** Department background access UPNs from `DEPT_BACKGROUND_ACCESS_{DEPARTMENT}` env var

3. **Phase 3 — SharePoint Assignment:** Each group is assigned to its corresponding SharePoint permission level (Full Control / Contribute / Read) via `assignGroupToPermissionLevel`.

Group IDs are stored in `status.entraGroups` for post-provisioning membership management.

**Compensation gap:** Entra ID group deletion is not yet implemented. Site deletion removes SharePoint assignments but does not clean up the Entra ID groups.

See: [Entra ID Group Model](./entra-id-group-model.md) for full reference.

## Step 5 Special Behavior
Step 5 uses a 90-second timeout (`PROVISIONING_STEP5_TIMEOUT_MS`). If the timeout is exceeded after 2 attempts, the step is recorded as `DeferredToTimer` and the overall saga status becomes `WebPartsPending`. The 1:00 AM EST timer trigger (`timerInstallWebParts`) will retry step 5 for all deferred jobs.

## Retry Policy
Each step uses `withRetry` with up to 3 attempts and exponential backoff (2s, 4s, 8s). Transient errors (HTTP 429, throttle, network reset) are retried. Non-transient errors (400, 403, 404) fail immediately.
