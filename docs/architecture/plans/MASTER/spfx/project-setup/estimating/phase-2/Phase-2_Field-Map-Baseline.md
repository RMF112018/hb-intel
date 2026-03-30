# Phase 2 — Field-Map Baseline: Projects List Data Contract

> Baseline created: 2026-03-30
> Source of truth: `backend/functions/src/services/project-requests-repository.ts`
> Schema confirmed by: `backend/functions/src/services/__tests__/sp-field-mapping.test.ts`
> Domain model: `packages/models/src/provisioning/IProvisioning.ts`

## 1. Production Projects List Schema

**Target:** `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`
**List title:** `Projects`
**Origin:** CSV import (custom columns have generic `field_N` internal names)

### 1.1 Mapped Fields (26 total — persisted to SharePoint)

| # | Domain Property | SP Display Name | SP Internal Name | SP Type | Required? | Read | Create | Update | Notes |
|---|----------------|-----------------|------------------|---------|-----------|------|--------|--------|-------|
| 1 | _(computed)_ | Title | `Title` | Text | Yes (SP default) | No | Yes | Yes | `"{projectNumber} — {projectName}"` |
| 2 | `requestId` / `projectId` | Project ID | `field_1` | Text | Yes | Yes | Yes | No | Used as primary key for filter/lookup |
| 3 | `projectNumber` | Project Number | `field_2` | Text | No | Yes | Yes | Yes | Format: `##-###-##` |
| 4 | `projectName` | Project Name | `field_3` | Text | Yes | Yes | Yes | Yes | |
| 5 | `projectLocation` | Project Location | `field_4` | Text | Yes | Yes | Yes | Yes | Legacy derived summary |
| 6 | `projectType` | Project Type | `field_5` | Choice | Yes | Yes | Yes | Yes | |
| 7 | `projectStage` | Project Stage | `field_6` | Choice | Yes | Yes | Yes | Yes | Default: `'Pursuit'` on read |
| 8 | `submittedBy` | Submitted By | `field_7` | Text | Yes | Yes | Yes | No | UPN |
| 9 | `submittedAt` | Submitted At | `field_8` | Number | Yes | Yes | Yes | No | ISO 8601 string stored as SP Number |
| 10 | `state` | Request State | `field_9` | Choice | Yes | Yes | Yes | Yes | Default: `'Submitted'` on read |
| 11 | `groupMembers` | Group Members Json | `field_10` | MultiLineText | Yes | Yes | Yes | Yes | JSON-serialized `string[]` |
| 12 | `groupLeaders` | Group Leaders Json | `field_11` | MultiLineText | No | Yes | Yes | Yes | JSON-serialized `string[]` |
| 13 | `department` | Department | `field_12` | Choice | No | Yes | Yes | Yes | `'commercial'` \| `'luxury-residential'` |
| 14 | `estimatedValue` | Estimated Value | `field_13` | Number | No | Yes | Yes | Yes | |
| 15 | `clientName` | Client Name | `field_14` | Text | No | Yes | Yes | Yes | |
| 16 | `startDate` | Start Date | `field_15` | Number | No | Yes | Yes | Yes | ISO 8601 string stored as SP Number |
| 17 | `contractType` | Contract Type | `field_16` | Choice | No | Yes | Yes | Yes | |
| 18 | `projectLeadId` | Project Lead Id | `field_17` | Text | No | Yes | Yes | Yes | UPN |
| 19 | `viewerUPNs` | Viewer UPNs Json | `field_18` | MultiLineText | No | Yes | Yes | Yes | JSON-serialized `string[]` |
| 20 | `addOns` | Add Ons Json | `field_19` | MultiLineText | No | Yes | Yes | Yes | JSON-serialized `string[]` |
| 21 | `clarificationNote` | Clarification Note | `field_20` | Number | No | Yes | Yes | Yes | String stored as SP Number |
| 22 | `completedBy` | Completed By | `field_21` | Number | No | Yes | Yes | Yes | String stored as SP Number |
| 23 | `completedAt` | Completed At | `field_22` | Number | No | Yes | Yes | Yes | String stored as SP Number |
| 24 | `siteUrl` | Site Url | `field_23` | URL | No | Yes | Yes | Yes | SharePoint site URL post-provisioning |
| 25 | `retryCount` | Retry Count | `field_24` | Number | Yes | Yes | Yes | Yes | Default: `0` on read |
| 26 | `year` | Year | `Year` | Number | No | Yes | Yes | Yes | Post-import column; uses display name as internal name |

### 1.2 Unmapped Domain Properties (16 — NOT persisted to SharePoint)

These properties exist in `IProjectSetupRequest` but have **no corresponding SharePoint column**. They are preserved by the mock repository (UI Review mode) but **silently dropped** by the real SP adapter.

| # | Domain Property | Type | Category | Impact |
|---|----------------|------|----------|--------|
| 1 | `projectStreetAddress` | `string?` | Structured location (Step 1) | Lost on SP round-trip |
| 2 | `projectCity` | `string?` | Structured location (Step 1) | Lost on SP round-trip |
| 3 | `projectCounty` | `string?` | Structured location (Step 1) | Lost on SP round-trip |
| 4 | `projectState` | `string?` | Structured location (Step 1) | Lost on SP round-trip |
| 5 | `projectZip` | `string?` | Structured location (Step 1) | Lost on SP round-trip |
| 6 | `officeDivision` | `string?` | Classification (Step 2) | Lost on SP round-trip |
| 7 | `procoreProject` | `'Yes' \| 'No'?` | Classification (Step 1) | Lost on SP round-trip |
| 8 | `projectExecutiveUpn` | `string?` | Team assignments (Step 3) | Lost on SP round-trip |
| 9 | `projectManagerUpn` | `string?` | Team assignments (Step 3) | Lost on SP round-trip |
| 10 | `leadEstimatorUpn` | `string?` | Team assignments (Step 3) | Lost on SP round-trip |
| 11 | `supportingEstimatorUpns` | `string[]?` | Team assignments (Step 3) | Lost on SP round-trip |
| 12 | `additionalTeamMemberUpns` | `string[]?` | Team assignments (Step 3) | Lost on SP round-trip |
| 13 | `timberscanApproverUpn` | `string?` | Team assignments (Step 3) | Lost on SP round-trip |
| 14 | `clarificationRequestedAt` | `string?` | Clarification lifecycle | Lost on SP round-trip |
| 15 | `requesterRetryUsed` | `boolean?` | Retry lifecycle | Lost on SP round-trip |
| 16 | `clarificationItems` | `IRequestClarification[]?` | Clarification lifecycle | Lost on SP round-trip |

## 2. Read Paths

| Method | File | Lines | Fields Read | Filter Field |
|--------|------|-------|-------------|--------------|
| `getRequest()` | `project-requests-repository.ts` | 67–75 | All 26 via `fromListItem()` | `field_1` (ProjectId) |
| `listRequests()` | `project-requests-repository.ts` | 77–98 | All 26 via explicit `.select()` | `field_9` (RequestState, optional) |
| `siteExists()` | `sharepoint-service.ts` | 99–114 | `SiteUrl` from ProvisioningAuditLog | `ProjectId`, `Event` |

## 3. Write Paths

| Method | File | Lines | Fields Written | Operation |
|--------|------|-------|---------------|-----------|
| `upsertRequest()` | `project-requests-repository.ts` | 51–65 | All 26 via `toListItem()` | Add or update |
| `writeAuditRecord()` | `sharepoint-service.ts` | 334–350 | 11 audit fields | Add only |

## 4. Query/Filter Paths

| Context | Filter Expression | Field | File | Line |
|---------|------------------|-------|------|------|
| Get by ID | `field_1 eq '{value}'` | ProjectId | `project-requests-repository.ts` | 71 |
| Upsert existence check | `field_1 eq '{value}'` | ProjectId | `project-requests-repository.ts` | 56 |
| List by state | `field_9 eq '{value}'` | RequestState | `project-requests-repository.ts` | 93 |
| Audit log idempotency | `ProjectId eq '{value}' and Event eq 'Completed'` | ProjectId, Event | `sharepoint-service.ts` | 105 |
| Frontend year filter | `Year eq {value}` | Year | `useProjectSites.ts` | 39 |

## 5. Secondary Consumer: Project Sites Web Part

`packages/spfx/src/webparts/projectSites/types.ts` defines `SP_PROJECTS_FIELDS` — a subset of 10 fields used by the Project Sites UI for directory views. This is a read-only consumer; it does not write to the list.

## 6. Type Conversion Notes

| SP Internal Name | SP Type | Domain Type | Conversion | Risk |
|-----------------|---------|-------------|------------|------|
| `field_8` (SubmittedAt) | Number | `string` | ISO string stored as SP Number | SP may return numeric epoch |
| `field_15` (StartDate) | Number | `string?` | ISO string stored as SP Number | SP may return numeric epoch |
| `field_20` (ClarificationNote) | Number | `string?` | String stored as SP Number | SP may return `0` for empty |
| `field_21` (CompletedBy) | Number | `string?` | String stored as SP Number | SP may return `0` for empty |
| `field_22` (CompletedAt) | Number | `string?` | String stored as SP Number | SP may return `0` for empty |
| `field_10` (GroupMembersJson) | MultiLineText | `string[]` | JSON.stringify/parse | Parse failure → `[]` |
| `field_11` (GroupLeadersJson) | MultiLineText | `string[]?` | JSON.stringify/parse | Parse failure → `[]` |
| `field_18` (ViewerUPNsJson) | MultiLineText | `string[]?` | JSON.stringify/parse | Parse failure → `[]` |
| `field_19` (AddOnsJson) | MultiLineText | `string[]?` | JSON.stringify/parse | Parse failure → `[]` |
