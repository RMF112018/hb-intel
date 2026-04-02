# Project Setup Request-Record Contract

> **Frozen:** Phase 6 Prompt 02 (2026-04-02)  
> **Authority:** Canonical reference — defines the authoritative Project Setup request-record persistence model.  
> **Source of truth:** Live repo implementation in `backend/functions/src/services/projects-list-contract.ts`, `projects-list-mapper.ts`, and `packages/models/src/provisioning/IProvisioning.ts`.

## Purpose

This document defines the canonical Project Setup request-record contract: what fields exist, how identifiers work, what is persisted to SharePoint, and what is transient. Downstream phases and consumers should rely on this contract without schema guesswork.

## Identifier semantics

### Aliased single-key model (current canonical contract)

The repo uses a **single persisted durable identifier** stored in SharePoint column `field_1`. This value is exposed through two domain property names:

| Property | Role | Persisted Column | Assignment |
|----------|------|-----------------|------------|
| `requestId` | API routing identifier — used in HTTP paths (`/project-setup-requests/{requestId}`) and Accounting app route parameters | `field_1` | Set to `projectId` on submission |
| `projectId` | Provisioning identifier — used as Table Storage partition key, saga orchestration key, and admin app query parameter | (reconstructed from `field_1`) | Generated as `randomUUID()` on submission (or caller-provided) |

**Invariant:** `requestId === projectId` at all times in the current contract. The submit handler sets `requestId = projectId`. The mapper reconstructs both from the same `field_1` value.

**Breaking this invariant** would require coordinated changes to:
- Submit handler (`projectRequests/index.ts`)
- Mapper read/write paths (`projects-list-mapper.ts`)
- Repository lookup logic (`project-requests-repository.ts`)
- Saga reconciliation (`saga-orchestrator.ts` — calls `getRequest(projectId)`)
- Admin app cross-linking (uses `projectId` query parameter)
- Accounting app routing (uses `requestId` path parameter)

### Business identifier

| Property | Role | Persisted Column | Assignment |
|----------|------|-----------------|------------|
| `projectNumber` | Human-facing business identifier displayed in titles, URLs, and reports | `field_2` | Assigned by controller on `ReadyToProvision` transition; format `##-###-##` |

`projectNumber` is **not** a system key. It must not be used for entity lookup except for uniqueness validation.

---

## Canonical field inventory

### System keys

| Field | Type | Required | Source | SP Column | SP Type | Persisted | Notes |
|-------|------|----------|--------|-----------|---------|-----------|-------|
| `requestId` | `string` | Yes | System-assigned | `field_1` | Text | Yes | UUID v4; aliased with `projectId` |
| `projectId` | `string` | Yes | System-assigned | (via `field_1`) | — | Yes (as `requestId`) | UUID v4; reconstructed from `field_1` on read |
| `projectNumber` | `string` | Conditional | User-entered | `field_2` | Text | Yes | Required before `ReadyToProvision`; format `##-###-##` |

### Workflow state

| Field | Type | Required | Source | SP Column | SP Type | Persisted | Notes |
|-------|------|----------|--------|-----------|---------|-----------|-------|
| `state` | `ProjectSetupRequestState` | Yes | System-assigned | `field_9` | Choice | Yes | 8-state enum; default `'Submitted'` |

**Valid states:** `Submitted` → `UnderReview` → (`NeedsClarification` / `AwaitingExternalSetup` / `ReadyToProvision`) → `Provisioning` → (`Completed` / `Failed`)

### Submission fields

| Field | Type | Required | Source | SP Column | SP Type | Persisted | Notes |
|-------|------|----------|--------|-----------|---------|-----------|-------|
| `submittedBy` | `string` | Yes | System-assigned | `field_7` | Text | Yes | UPN from auth claims |
| `submittedByOid` | `string` | No | System-assigned | `submittedByOid` | Text | Yes | Entra OID (P9-G5-05) |
| `submittedAt` | `string` | Yes | System-assigned | `field_8` | Number | Yes | ISO 8601; SP Number column stores string |
| `year` | `number` | No | Derived | `Year` | Number | Yes | From `projectNumber` prefix or submission year |

### Project details

| Field | Type | Required | Source | SP Column | SP Type | Persisted | Notes |
|-------|------|----------|--------|-----------|---------|-----------|-------|
| `projectName` | `string` | Yes | User-entered | `field_3` | Text | Yes | Used in Title computation |
| `projectLocation` | `string` | No | Derived / user-entered | `field_4` | Text | Yes | Legacy location summary |
| `projectStreetAddress` | `string` | No | User-entered | `projectStreetAddress` | Text | Yes | P2-07 structured location |
| `projectCity` | `string` | No | User-entered | `projectCity` | Text | Yes | P2-07 structured location |
| `projectCounty` | `string` | No | User-entered | `projectCounty` | Text | Yes | P2-07 structured location |
| `projectState` | `string` | No | User-entered | `projectState` | Text | Yes | P2-07 structured location |
| `projectZip` | `string` | No | User-entered | `projectZip` | Number | Yes | P2-07; SP Number → domain string |
| `projectType` | `string` | Yes | User-entered | `field_5` | Choice | Yes | Classification |
| `projectStage` | `ProjectStage` | Yes | User-entered | `field_6` | Choice | Yes | Default `'Pursuit'` on read if falsy |
| `department` | `ProjectDepartment` | No | User-entered | `field_12` | Choice | Yes | `'commercial'` / `'luxury-residential'` |
| `officeDivision` | `string` | No | User-entered | `officeDivision` | Text | Yes | P2-07 classification |
| `procoreProject` | `'Yes' \| 'No'` | No | User-entered | `procoreProject` | Text | Yes | P2-07 |

### Financial and schedule

| Field | Type | Required | Source | SP Column | SP Type | Persisted | Notes |
|-------|------|----------|--------|-----------|---------|-----------|-------|
| `estimatedValue` | `number` | No | User-entered | `field_13` | Number | Yes | `null` if undefined on write |
| `clientName` | `string` | No | User-entered | `field_14` | Text | Yes | |
| `startDate` | `string` | No | User-entered | `field_15` | Number | Yes | ISO 8601; SP Number column stores string |
| `contractType` | `string` | No | User-entered | `field_16` | Choice | Yes | |

### Team assignments

| Field | Type | Required | Source | SP Column | SP Type | Persisted | Notes |
|-------|------|----------|--------|-----------|---------|-----------|-------|
| `groupMembers` | `string[]` | Yes | User-entered | `field_10` | MultiLineText | Yes | JSON-serialized UPN array |
| `groupLeaders` | `string[]` | No | User-entered | `field_11` | MultiLineText | Yes | JSON-serialized UPN array |
| `projectExecutiveUpn` | `string` | No | User-entered | `projectExecutiveUpn` | Text | Yes | P2-07; required for wizard submission |
| `projectManagerUpn` | `string` | No | User-entered | `projectManagerUpn` | Text | Yes | P2-07 |
| `leadEstimatorUpn` | `string` | No | User-entered | `leadEstimatorUpn` | Text | Yes | P2-07; required for wizard submission |
| `supportingEstimatorUpns` | `string[]` | No | User-entered | `supportingEstimatorUpns` | MultiLineText | Yes | P2-07; JSON-serialized |
| `timberscanApproverUpn` | `string` | No | User-entered | `timberscanApproverUpn` | Text | Yes | P2-07; required for wizard submission |
| `sageAccessUpns` | `string[]` | No | User-entered | `sageAccessUpns` | MultiLineText | Yes | P2-07; JSON-serialized |
| `viewerUPNs` | `string[]` | No | User-entered | `viewerUPNs` | MultiLineText | Yes | JSON-serialized; named column replaces `field_18` |

### Add-ons

| Field | Type | Required | Source | SP Column | SP Type | Persisted | Notes |
|-------|------|----------|--------|-----------|---------|-----------|-------|
| `addOns` | `string[]` | No | User-entered | `addOns` | MultiLineText | Yes | JSON-serialized; named column replaces `field_19` |

### Review and approval

| Field | Type | Required | Source | SP Column | SP Type | Persisted | Notes |
|-------|------|----------|--------|-----------|---------|-----------|-------|
| `approvedBy` | `string` | No | System-assigned | **None** | — | **No** | Set on `ReadyToProvision` but not in SP field map — transient in domain model only |
| `approvedByOid` | `string` | No | System-assigned | **None** | — | **No** | Set on `ReadyToProvision` but not in SP field map — transient in domain model only |

**Known gap:** Approval identity is populated in the domain model during the `ReadyToProvision` state transition but is not durably persisted to SharePoint. After a round-trip through the mapper, these values are lost.

### Clarification

| Field | Type | Required | Source | SP Column | SP Type | Persisted | Notes |
|-------|------|----------|--------|-----------|---------|-----------|-------|
| `clarificationNote` | `string` | No | System-assigned | `field_20` | Number | Yes | SP Number column stores text; `0` → `undefined` |
| `clarificationRequestedAt` | `string` | No | System-assigned | `clarificationRequestedAt` | DateTime | Yes | ISO 8601; set on `NeedsClarification` |
| `requesterRetryUsed` | `boolean` | No | System-assigned | `requesterRetryUsed` | Text | Yes | Stored as `'true'`/`'false'` string |
| `clarificationItems` | `IRequestClarification[]` | No | System-assigned | `clarificationItems` | MultiLineText | Yes | JSON-serialized structured array |

### Completion and provisioning linkage

| Field | Type | Required | Source | SP Column | SP Type | Persisted | Notes |
|-------|------|----------|--------|-----------|---------|-----------|-------|
| `completedBy` | `string` | No | System-assigned | `field_21` | Number | Yes | UPN; SP Number column stores string; `0` → `undefined` |
| `completedByOid` | `string` | No | System-assigned | `completedByOid` | Text | Yes | Entra OID (P9-G5-05) |
| `completedAt` | `string` | No | System-assigned | `field_22` | Number | Yes | ISO 8601; SP Number column; `0` → `undefined` |
| `siteUrl` | `string` | No | System-assigned | `field_23` | URL | Yes | Set by provisioning saga on success |
| `retryCount` | `number` | Yes | System-assigned | `field_24` | Number | Yes | Default `0`; provisioning retry count |

### Computed

| Field | Type | Required | Source | SP Column | SP Type | Persisted | Notes |
|-------|------|----------|--------|-----------|---------|-----------|-------|
| `_title` | `string` | — | Derived | `Title` | Text | Yes (computed on write) | `"{projectNumber} — {projectName}"`; `projectNumber` defaults to `'TBD'` |

---

## Known contract gaps

### 1. Approval identity not durably persisted

`approvedBy` and `approvedByOid` exist in `IProjectSetupRequest` and are populated on `ReadyToProvision` but have no `PROJECTS_LIST_FIELD_MAP` entry. These values survive only within a single request lifecycle in memory — they are lost after persistence round-trip.

**Impact:** No durable record of who approved a request in SharePoint.

### 2. No `approvedAt` timestamp

The domain model has no `approvedAt` field. Approval timing can only be inferred from state transition ordering. The Accounting detail page acknowledges this gap in a code comment.

### 3. No intermediate state timestamps

Transitions to `UnderReview` and `AwaitingExternalSetup` do not record timestamps or actors.

### 4. No top-level `clarificationRequestedBy` actor

The `clarificationNote` is stored but the requesting controller's identity is not captured at the top level. Individual `clarificationItems` record `raisedBy`, providing partial coverage.

---

## Consumer reference

| Consumer | Identifier Used | Fields Consumed |
|----------|----------------|-----------------|
| Accounting queue page | `requestId` (route param) | `projectName`, `projectNumber`, `department`, `state`, `submittedBy`, `submittedAt` |
| Accounting detail page | `requestId` (route param) | All submission, detail, clarification, completion, and provisioning fields |
| Backend HTTP handlers | `requestId` (URL path) | Full `IProjectSetupRequest` via repository |
| Provisioning saga | `projectId` (partition key) | `projectId`, `projectNumber`, `projectName`, `groupMembers`, `groupLeaders`, `department`, `submittedBy` |
| Admin app | `projectId` (query param) | Provisioning status fields; request fields via API |
| Estimating app | `requestId` / `projectId` | Submission fields, state, provisioning status |

---

## SharePoint schema posture

The `Projects` list uses a mixed schema:

| Category | Count | Internal Name Pattern | Example |
|----------|-------|-----------------------|---------|
| CSV-import legacy | 20 | `field_N` | `field_1`, `field_9` |
| Post-import named | 4 | Domain/display name | `viewerUPNs`, `Year`, `Title`, `addOns` |
| P2-07 named | 13 | Domain property name | `projectStreetAddress`, `clarificationItems` |
| P9-G5-05 named | 2 | Domain property name | `submittedByOid`, `completedByOid` |

Orphaned columns: `field_17` (unknown purpose), `field_18` (replaced by `viewerUPNs`), `field_19` (replaced by `addOns`).

Five SP Number columns store ISO 8601 strings: `field_8`, `field_15`, `field_20`, `field_21`, `field_22`. The mapper handles coercion; OData numeric operations must not target these columns.

---

## Related documents

- [Phase 6 audit report](../../architecture/reviews/project-setup-phase-6-data-contract-and-schema-audit.md)
- [Frontend API contract](project-setup-frontend-api-contract.md)
- [Provisioning models reference](../models/provisioning.md)
- [Phase 6 implementation plan](../../architecture/plans/MASTER/spfx/accounting/phase-6/Phase-6_Data-Contract-and-SharePoint-Schema-Hardening_Implementation-Plan.md)
