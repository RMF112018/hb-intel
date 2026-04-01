# Gap 6 Residual Environment Actions

## Purpose

This document inventories environment actions that remain after the repo-owned Gap 6 closure work (Prompts 1-4). These are actions that require SharePoint Admin or IT intervention and cannot be closed by repo changes alone.

## Active Residuals

### 1. `projectViewerGroups` list data not populated

**Owner:** SharePoint Admin / Business stakeholders

**Current state:** The `projectViewerGroups` list exists on HBCentral with the correct schema (Title, DefaultViewerGroupIdsJson, DefaultViewerGroupNames, IsActive, LastReviewedAt, Notes). Two department rows are seeded ("Commercial", "Luxury Residential") but all data columns are empty — no viewer group IDs, no group names, no active flags.

**Impact:** The hybrid viewer model cannot function via the list-based path until this data is populated. The env-var fallback (`DEPT_BACKGROUND_ACCESS_{DEPT}`) remains the active runtime path for department background viewers.

**Required action:**
1. Create the Entra ID security groups that should serve as default viewer groups for each department
2. Populate `DefaultViewerGroupIdsJson` with the group IDs
3. Populate `DefaultViewerGroupNames` with human-readable labels
4. Set `IsActive` to `Yes` for each department that should have default viewers
5. Set `LastReviewedAt` to the current date

**Repo readiness:** The contract, mapper, repository, and resolver are ready (`viewer-groups-list-contract.ts`, `viewer-groups-list-mapper.ts`, `viewer-groups-repository.ts`, `resolveDepartmentViewerGroupIds()` in `entra-group-definitions.ts`). Once data is populated, the remaining step is wiring the repository into the provisioning saga service container and updating `step6-permissions.ts`.

### 2. `submittedByOid` and `completedByOid` environment provisioning

**Owner:** P9-G5 track (not a Gap 6 concern)

**Current state:** These fields are in the repo contract (`IProjectsListItem`, `IProjectSetupRequest`) but may not yet exist as columns in the live SharePoint schema. The schema CSV used for Gap 6 re-baseline does not include them.

**Impact:** Writes to these fields may be silently ignored by PnPjs if the columns don't exist. No data loss for existing fields — these are new write-only additions.

**Note:** This is tracked under P9-G5, not Gap 6. Included here for completeness only.

### 3. Choice columns remain Text in live schema

**Owner:** SharePoint Admin (cosmetic, non-blocking)

**Current state:** `field_5` (ProjectType), `field_6` (ProjectStage), `field_9` (RequestState), `field_12` (Department), `field_16` (ContractType) are `Text` in the live schema but typed as `Choice` in the repo contract. `field_23` (SiteUrl) is `Text` instead of `URL`.

**Impact:** None at runtime. PnPjs reads/writes string values identically for Text and Choice columns. This is a cosmetic mismatch only.

**Required action:** None required. If SharePoint Admin wants to add dropdown validation in the SharePoint UI, these could be converted to Choice columns, but this is optional and has no functional impact.
