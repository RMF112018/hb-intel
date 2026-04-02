# Phase 6 — Repo-Truth Data Contract and SharePoint Schema Audit

**Phase**: 6 — Data Contract and SharePoint Schema Hardening  
**Prompt**: 01 — Repo-Truth Audit  
**Date**: 2026-04-02  
**Status**: Complete

---

## Executive summary

The Project Setup request-record contract is implemented across a backend persistence layer backed by the SharePoint `Projects` list. The live repo defines 40 persisted fields using a deliberately mixed schema strategy: 20 legacy CSV-import `field_N` columns, 4 post-import named columns, 13 Phase 2 gap (P2-07) named columns, and 2 stable-identity (P9-G5-05) OID columns.

The most significant architectural finding is that `requestId` and `projectId` are **aliased in practice** — both are derived from the same persisted value in `field_1`. The repo does not implement a separated dual-key persistence model. The provisioning saga relies on this aliasing assumption when calling `getRequest(projectId)`.

Two domain fields — `approvedBy` and `approvedByOid` — are populated in the domain model on the `ReadyToProvision` state transition but are **not mapped to any SharePoint column**, meaning approval identity is not durably persisted.

Legacy columns `field_18` and `field_19` are orphaned — replaced by named columns `viewerUPNs` and `addOns` — but may still contain stale data in production rows.

---

## Confirmed repo implementation facts

### Persistence architecture

| Concern | Implementation |
|---------|---------------|
| Request record store | SharePoint `Projects` list |
| Contract definition | `projects-list-contract.ts` — `IProjectsListItem` DTO + `PROJECTS_LIST_FIELD_MAP` |
| Domain ↔ SP mapping | `projects-list-mapper.ts` — `toDomain()` / `toListItem()` |
| CRUD operations | `project-requests-repository.ts` — `upsertRequest`, `getRequest`, `listRequests`, `findByProjectNumber` |
| HTTP handlers | `projectRequests/index.ts` — submit, list, get, advanceState |
| Domain types | `packages/models/src/provisioning/IProvisioning.ts` — `IProjectSetupRequest` |
| Provisioning orchestration | `saga-orchestrator.ts` — references `projectId` throughout |
| API client | `packages/provisioning/src/api-client.ts` — frontend HTTP client |
| Accounting consumers | `ProjectReviewQueuePage.tsx`, `ProjectReviewDetailPage.tsx` |

### Request submission flow

1. `submitProjectSetupRequest` generates `projectId = body.projectId ?? randomUUID()`.
2. `requestId` is set to `projectId` (same value, always).
3. `submittedBy` and `submittedByOid` are captured from auth claims.
4. `state` is set to `'Submitted'`.
5. `year` is derived from `projectNumber` prefix or provided explicitly.
6. The request is persisted via `upsertRequest()`, which filters by `field_1` (requestId) to determine insert vs update.

### State advancement flow

- URL path parameter is `requestId` — used for lookup via `getRequest(requestId)`.
- `ReadyToProvision` transition captures `approvedBy`, `approvedByOid`, validates `projectNumber` format and uniqueness, derives `year`.
- `NeedsClarification` stores `clarificationNote`, `clarificationRequestedAt`, and structured `clarificationItems`.
- `Completed` stores `completedBy`, `completedByOid`, `completedAt`.
- Auto-trigger launches provisioning saga on `ReadyToProvision` if no active saga exists.

### Provisioning saga identifier usage

- Saga receives `projectId` from the auto-trigger (not `requestId`).
- All saga status entities are keyed by `projectId` (partition key) + `correlationId` (row key).
- `reconcileRequestState(projectId, ...)` calls `getRequest(projectId)` — **relies on `projectId === requestId`**.

---

## Confirmed field inventory

### Legend

| Column | Meaning |
|--------|---------|
| **Origin** | `CSV` = legacy CSV-import; `Named` = post-import named column; `P2-07` = Phase 2 gap; `P9-G5` = stable identity |
| **Serialization** | `direct` = string pass-through; `json-array` = JSON-serialized array; `number` = numeric cast; `computed` = derived on write |

### Complete field table (40 persisted fields + 1 computed)

| # | Domain Property | SP Internal Name | SP Type | Origin | Serialization | Required | Notes |
|---|----------------|-----------------|---------|--------|---------------|----------|-------|
| 1 | `requestId` | `field_1` | Text | CSV | direct | Yes | Primary lookup key; aliased with `projectId` |
| 2 | `projectNumber` | `field_2` | Text | CSV | direct | No | Format `##-###-##`; required before `ReadyToProvision` |
| 3 | `projectName` | `field_3` | Text | CSV | direct | Yes | Used in Title computation |
| 4 | `projectLocation` | `field_4` | Text | CSV | direct | No | Legacy derived location summary |
| 5 | `projectType` | `field_5` | Choice | CSV | direct | Yes | Classification |
| 6 | `projectStage` | `field_6` | Choice | CSV | direct | Yes | Default: `'Pursuit'` on read if falsy |
| 7 | `submittedBy` | `field_7` | Text | CSV | direct | Yes | UPN; captured at submission |
| 8 | `submittedAt` | `field_8` | Number | CSV | direct | Yes | ISO 8601 string in SP Number column; default `now()` if falsy |
| 9 | `state` | `field_9` | Choice | CSV | direct | Yes | `ProjectSetupRequestState` enum; default `'Submitted'` |
| 10 | `groupMembers` | `field_10` | MultiLineText | CSV | json-array | Yes | UPN array; non-empty |
| 11 | `groupLeaders` | `field_11` | MultiLineText | CSV | json-array | No | UPN array |
| 12 | `department` | `field_12` | Choice | CSV | direct | No | `'commercial'` or `'luxury-residential'` |
| 13 | `estimatedValue` | `field_13` | Number | CSV | number | No | `null` if undefined on write |
| 14 | `clientName` | `field_14` | Text | CSV | direct | No | |
| 15 | `startDate` | `field_15` | Number | CSV | direct | No | ISO 8601 string in SP Number column |
| 16 | `contractType` | `field_16` | Choice | CSV | direct | No | |
| 17 | `clarificationNote` | `field_20` | Number | CSV | direct | No | ISO 8601 / text in SP Number column; `0` → `undefined` |
| 18 | `completedBy` | `field_21` | Number | CSV | direct | No | UPN in SP Number column; `0` → `undefined` |
| 19 | `completedAt` | `field_22` | Number | CSV | direct | No | ISO 8601 in SP Number column; `0` → `undefined` |
| 20 | `siteUrl` | `field_23` | URL | CSV | direct | No | Set by provisioning saga on completion |
| 21 | `retryCount` | `field_24` | Number | CSV | number | No | Default `0`; provisioning retry count |
| 22 | `_title` | `Title` | Text | Named | computed | — | `"{projectNumber} — {projectName}"`; never directly written |
| 23 | `year` | `Year` | Number | Named | number | No | Derived from `projectNumber` prefix or submission year |
| 24 | `viewerUPNs` | `viewerUPNs` | MultiLineText | Named | json-array | No | Replaces legacy `field_18` |
| 25 | `addOns` | `addOns` | MultiLineText | Named | json-array | No | Replaces legacy `field_19` |
| 26 | `projectStreetAddress` | `projectStreetAddress` | Text | P2-07 | direct | No | Structured location |
| 27 | `projectCity` | `projectCity` | Text | P2-07 | direct | No | Structured location |
| 28 | `projectCounty` | `projectCounty` | Text | P2-07 | direct | No | Structured location |
| 29 | `projectState` | `projectState` | Text | P2-07 | direct | No | Structured location |
| 30 | `projectZip` | `projectZip` | Number | P2-07 | number | No | SP Number → domain string |
| 31 | `officeDivision` | `officeDivision` | Text | P2-07 | direct | No | Classification |
| 32 | `procoreProject` | `procoreProject` | Text | P2-07 | direct | No | `'Yes'` / `'No'` / `''` |
| 33 | `projectExecutiveUpn` | `projectExecutiveUpn` | Text | P2-07 | direct | No | Required for submission |
| 34 | `projectManagerUpn` | `projectManagerUpn` | Text | P2-07 | direct | No | |
| 35 | `leadEstimatorUpn` | `leadEstimatorUpn` | Text | P2-07 | direct | No | Required for submission |
| 36 | `supportingEstimatorUpns` | `supportingEstimatorUpns` | MultiLineText | P2-07 | json-array | No | |
| 37 | `timberscanApproverUpn` | `timberscanApproverUpn` | Text | P2-07 | direct | No | Required for submission |
| 38 | `sageAccessUpns` | `sageAccessUpns` | MultiLineText | P2-07 | json-array | No | |
| 39 | `clarificationRequestedAt` | `clarificationRequestedAt` | DateTime | P2-07 | direct | No | ISO 8601; set on `NeedsClarification` |
| 40 | `requesterRetryUsed` | `requesterRetryUsed` | Text | P2-07 | direct | No | `'true'` / `'false'` |
| 41 | `clarificationItems` | `clarificationItems` | MultiLineText | P2-07 | json-array | No | Serialized `IRequestClarification[]` |
| 42 | `submittedByOid` | `submittedByOid` | Text | P9-G5 | direct | No | Entra Object ID |
| 43 | `completedByOid` | `completedByOid` | Text | P9-G5 | direct | No | Entra Object ID |

**Note**: `field_17`, `field_18`, and `field_19` are not referenced in the current field map. `field_18` and `field_19` were replaced by `viewerUPNs` and `addOns`. `field_17` has no known mapping.

---

## Confirmed identifier usage model

### Current state: aliased single-key model

| Property | Persisted Column | Source | Semantics |
|----------|-----------------|--------|-----------|
| `requestId` | `field_1` | Set to `projectId` on submit | API-facing identifier; used in URL routes |
| `projectId` | (not separately persisted) | Generated on submit; equals `requestId` | Domain/provisioning identifier; reconstructed from `field_1` |
| `projectNumber` | `field_2` | Assigned by controller on approval | Human-facing business identifier; format `##-###-##` |

### Evidence of aliasing

1. **Submit handler** (`projectRequests/index.ts`):
   ```typescript
   const projectId = body.projectId ?? randomUUID();
   const requestId = projectId; // line 119
   ```

2. **Mapper read path** (`projects-list-mapper.ts`):
   ```typescript
   const projectId = readString(item, 'field_1');
   return { requestId: projectId, projectId, ... };
   ```

3. **Saga cross-reference** (`saga-orchestrator.ts`):
   ```typescript
   await this.reconcileRequestState(projectId, 'Provisioning');
   // reconcileRequestState calls getRequest(projectId)
   // which filters by field_1 — works because projectId === requestId
   ```

### Consequence

The repo currently operates with a **single persisted durable identifier** (`field_1`) that is represented through two semantic names (`requestId` for API routing, `projectId` for provisioning). Any future key separation must account for:
- Repository lookup logic (filters by `field_1`)
- Saga reconciliation (passes `projectId` to `getRequest()`)
- Admin app cross-linking (uses `projectId` query parameter)
- Accounting app routing (uses `requestId` path parameter)

---

## Confirmed SharePoint internal-name / display-name mapping behavior

### Mapping categories

The `PROJECTS_LIST_FIELD_MAP` defines mappings using three attributes per field:
- `spInternalName` — the SharePoint internal column name used in OData queries
- `spType` — the expected SharePoint column type
- `serialization` — how values are converted between domain and storage

### Display-name vs internal-name observations

| Category | Internal Name Pattern | Example | Count |
|----------|----------------------|---------|-------|
| CSV-import legacy | `field_N` (auto-generated by SP) | `field_1`, `field_9` | 20 |
| Post-import named | Domain property name | `viewerUPNs`, `addOns` | 2 |
| SP standard | `Title`, `Year` | `Title` | 2 |
| P2-07 named | Domain property name | `projectStreetAddress`, `clarificationItems` | 13 |
| P9-G5-05 named | Domain property name | `submittedByOid`, `completedByOid` | 2 |

Display names are not explicitly tracked in the contract file. The `PROJECTS_LIST_FIELD_MAP` works exclusively with internal names. Display-name assumptions exist only in code comments (e.g., `field_1` is commented as "ProjectId — primary key for request lookup").

### Column resolution helper

`resolveSpField(domainProp)` returns the SP internal name for a domain property, used in OData filter and select clauses to avoid hardcoding `field_N` names in business logic.

---

## Mixed-schema posture inventory

### Category 1: CSV-import legacy columns (`field_1` through `field_24`)

**20 columns in active use.** These retain auto-generated internal names from the original CSV import. The repo maps them explicitly through `PROJECTS_LIST_FIELD_MAP`.

**Anomalies:**
- `field_8`, `field_15`, `field_20`, `field_21`, `field_22` are declared as SP `Number` type but store ISO 8601 date strings or text. The read path uses specialized helpers (`readStringFromNumber`, `readOptionalStringFromNumber`) that coerce numeric `0` to `undefined`.
- `field_17`, `field_18`, `field_19` are **not in the field map**. `field_18` and `field_19` were replaced by named columns. `field_17` has no known successor.

### Category 2: Post-import named columns

**4 columns.** Created after the CSV import to replace legacy columns or add new capabilities:
- `viewerUPNs` — replaces `field_18`
- `addOns` — replaces `field_19`
- `Title` — computed SP standard column
- `Year` — derived from `projectNumber` or submission year

### Category 3: P2-07 named columns

**13 columns** added 2026-03-31. All use domain property names as SP internal names. These extend the contract for structured location, team roles, clarification lifecycle, and classification.

### Category 4: P9-G5-05 stable identity columns

**2 columns** (`submittedByOid`, `completedByOid`) for Entra Object ID-based ownership and audit.

---

## Schema ambiguity and drift risks

### Risk 1: Identifier comment/code mismatch

**Severity: Medium**

The contract file comments describe `field_1` as "ProjectId — primary key for request lookup" but the field map entry binds `requestId -> field_1`. The mapper reads `field_1` into a local variable named `projectId` and assigns it to both `requestId` and `projectId`. This creates confusion about whether the persisted semantic is "request identity" or "project identity" when in practice it is both.

### Risk 2: Approval identity not persisted

**Severity: High**

`approvedBy` and `approvedByOid` are set on the domain model during `ReadyToProvision` state transition but do not appear in `PROJECTS_LIST_FIELD_MAP`. These values are persisted through the generic `upsertRequest()` call only if the mapper's `toListItem()` maps them — which it does not. **Approval identity is likely lost on persistence.**

### Risk 3: Saga cross-reference fragility

**Severity: Medium**

`saga-orchestrator.ts` calls `getRequest(projectId)` which expects a `requestId` parameter. This works only because `projectId === requestId`. If the aliasing is ever broken without updating the saga, request state reconciliation will silently fail (the error is caught and logged as non-critical).

### Risk 4: Number column type mismatch

**Severity: Low**

Five SP Number columns store ISO 8601 strings. SharePoint tolerates this but it creates an impedance mismatch: SP arithmetic operations, filtering, and sorting will not work correctly on these columns. The read helpers handle the coercion, but any future OData query that treats these as true numbers will produce wrong results.

### Risk 5: Orphaned legacy columns

**Severity: Low**

`field_18` and `field_19` may still contain data in production rows from the original CSV import. The current mapper does not read these columns. If any external process or report queries them, it will get stale data.

### Risk 6: Mapper critical-field validation is advisory only

**Severity: Low**

The mapper's `CRITICAL_FIELDS` list (`field_1`, `field_3`, `field_9`) triggers warning logs when these fields are falsy, but does not throw or reject the record. A row missing `field_1` would produce a request with empty `requestId` and `projectId`.

### Risk 7: JSON-array truncation ceiling

**Severity: Low**

The mapper warns if JSON-array fields exceed 50,000 characters (SP MultiLineText ceiling) but does not block the write. Oversized payloads could be silently truncated by SharePoint, corrupting serialized arrays.

---

## Missing or under-documented contract areas

### 1. Approval identity persistence gap

`approvedBy` and `approvedByOid` exist in `IProjectSetupRequest` but have no corresponding SharePoint column mapping. These fields need either:
- New SP columns added to `PROJECTS_LIST_FIELD_MAP`, or
- Explicit documentation that approval identity is transient and not durably persisted.

### 2. Missing `approvedAt` timestamp

The domain model has no `approvedAt` field. The detail page acknowledges this in a comment (line 146-148). Approval timing can only be inferred from state transition ordering, not from a persisted timestamp.

### 3. Missing intermediate state timestamps

State transitions to `UnderReview` and `AwaitingExternalSetup` do not record timestamps or actors. The timeline on the detail page cannot show when review began or when a hold was placed.

### 4. No `clarificationRequestedBy` actor field

When a controller requests clarification, the `clarificationNote` is stored but the requesting controller's identity is not captured in a dedicated field. Individual `clarificationItems` do record `raisedBy`, but the top-level clarification request lacks an actor.

### 5. Year column backfill

Legacy rows created before the `Year` column was added return `undefined`. The mapper comment notes this and recommends a one-time backfill script, but none exists in the repo.

### 6. `field_17` purpose unknown

`field_17` is not referenced in the field map or any code. Its original purpose from the CSV import is undocumented.

---

## Recommended correction priorities

### Priority 1 — Resolve approval identity persistence gap

Determine whether `approvedBy` and `approvedByOid` should be durably persisted to SharePoint. If yes, add columns to the contract and mapper. If no, document the transient nature explicitly.

### Priority 2 — Reconcile identifier comment/code language

Align comments in `projects-list-contract.ts` and `projects-list-mapper.ts` to use consistent language acknowledging the aliased `requestId`/`projectId` model. Remove or correct references that imply a separated dual-key model.

### Priority 3 — Document saga cross-reference assumption

Add an explicit comment or invariant in `saga-orchestrator.ts` documenting that `reconcileRequestState(projectId)` relies on `projectId === requestId`. Flag this as a coupling point that must be addressed if keys are ever separated.

### Priority 4 — Document Number-column type mismatches

Add explicit comments in the contract file explaining why `field_8`, `field_15`, `field_20`, `field_21`, and `field_22` are SP Number columns storing strings, and documenting that OData numeric operations must not be used on these columns.

### Priority 5 — Decide on orphaned legacy columns

Explicitly document whether `field_17`, `field_18`, and `field_19` are intentionally orphaned or should be cleaned up. If production rows contain data in these columns, document the migration posture.

---

## Explicit unresolved questions

1. **Is the approval identity persistence gap intentional?** Do `approvedBy` and `approvedByOid` need durable SharePoint persistence, or is the current transient-only behavior acceptable?

2. **Should the repo adopt a separated `requestId`/`projectId` model in Phase 6?** The current aliased model works but creates implicit coupling. A separated model would require changes to the submit handler, mapper, repository, saga, and all consumers.

3. **What is the production state of `field_17`, `field_18`, and `field_19`?** Do production rows contain data in these columns? If so, is there an external dependency on that data?

4. **Should the Year column be backfilled for legacy rows?** The mapper handles missing values gracefully, but reporting or filtering by year will be incomplete for legacy data.

5. **Should the Number-column type mismatches be corrected?** Migrating `field_8`, `field_15`, `field_20`, `field_21`, `field_22` to Text columns would fix the impedance mismatch but requires a SharePoint schema migration.

6. **Should `approvedAt` be added to the domain model?** The detail page comment acknowledges the gap. Adding it would complete the audit timeline but requires a new SP column.

---

## Exact files inspected

| File | Path |
|------|------|
| Projects list contract | `backend/functions/src/services/projects-list-contract.ts` |
| Projects list mapper | `backend/functions/src/services/projects-list-mapper.ts` |
| Project requests repository | `backend/functions/src/services/project-requests-repository.ts` |
| Project requests HTTP handlers | `backend/functions/src/functions/projectRequests/index.ts` |
| Provisioning saga orchestrator | `backend/functions/src/functions/provisioningSaga/saga-orchestrator.ts` |
| Domain model types | `packages/models/src/provisioning/IProvisioning.ts` |
| Provisioning API client | `packages/provisioning/src/api-client.ts` |
| Project review queue page | `apps/accounting/src/pages/ProjectReviewQueuePage.tsx` |
| Project review detail page | `apps/accounting/src/pages/ProjectReviewDetailPage.tsx` |
| Accounting router | `apps/accounting/src/router/routes.ts` |
| Phase 6 implementation plan | `docs/architecture/plans/MASTER/spfx/accounting/phase-6/Phase-6_Data-Contract-and-SharePoint-Schema-Hardening_Implementation-Plan.md` |
| Phase 6 README | `docs/architecture/plans/MASTER/spfx/accounting/phase-6/README_Phase-6-Data-Contract-and-SharePoint-Schema-Hardening.md` |
| Phase 6 prompt audit report | `docs/architecture/plans/MASTER/spfx/accounting/phase-6/Accounting_Phase6_Prompt_Audit_Report.md` |

---

## Prompt-02 — Contract Freeze Summary

**Date**: 2026-04-02  
**Status**: Complete

### What was frozen

The canonical Project Setup request-record contract was authored at `docs/reference/developer/project-setup-request-record-contract.md`. It covers:

- **Identifier semantics**: `requestId` and `projectId` are documented as aliased by contract — both derive from the same `field_1` value. `projectNumber` is the separate business key. No key separation was introduced.
- **Complete field inventory**: All 43 fields (40 persisted + 1 computed + 2 transient) classified by category, required/optional status, source-of-truth, and persistence status.
- **Consumer reference**: Documents which surfaces use which identifiers and fields.
- **SharePoint schema posture**: Mixed schema documented with 4 origin categories and orphaned column status.

### Code comments reconciled

- `projects-list-contract.ts`: `field_1` comment corrected from "ProjectId" to "aliased system key" language.
- `projects-list-mapper.ts`: Added P6-02 aliasing comments to both `toDomain()` and `toListItem()`.
- `IProvisioning.ts`: Added JSDoc to `requestId` and `projectId` documenting aliased relationship and persistence column.
- `saga-orchestrator.ts`: Added P6-02 invariant comment to `reconcileRequestState()` documenting `getRequest(projectId)` aliasing dependency.

### Known gaps carried forward

1. `approvedBy` / `approvedByOid` not persisted to SharePoint (documented as transient).
2. No `approvedAt` timestamp in the domain model.
3. No intermediate state timestamps for `UnderReview` and `AwaitingExternalSetup`.
4. No top-level `clarificationRequestedBy` actor field.

These gaps are documented in the contract and remain open for future phases to address.

---

## Prompt-03 — Mapper and Persistence Hardening Summary

**Date**: 2026-04-02  
**Status**: Complete

### Hardening applied

1. **Repository logger integration**: `SharePointProjectRequestsAdapter` now accepts an optional `ILogger` and passes it through to all `toDomain()` and `toListItem()` calls. Schema drift diagnostics and truncation guard warnings are no longer silently discarded.

2. **OData escaping extracted**: `escapeODataValue()` extracted as an exported utility for testability. Handles single-quote doubling required by OData filter expressions.

3. **Repository CRUD test coverage**: Added 13 tests covering `MockProjectRequestsRepository` insert, update, get, list-with-filter, list-all, find-by-project-number, defensive copy safety, and identifier aliasing round-trip.

4. **OData escaping tests**: Added 5 tests covering passthrough, single-quote doubling, multiple quotes, empty string, and UUID values.

5. **P6-03 identifier stability tests** (mapper): Added 4 tests verifying:
   - `toDomain()` always sets `requestId === projectId` from `field_1`
   - `toListItem()` writes `requestId` to `field_1`
   - `projectNumber` is independently persisted in `field_2`
   - Identifier aliasing survives `toListItem → toDomain` round-trip

### Verification results

- 900 unit tests pass (57 test files), including 47 mapper tests and 22 repository tests
- Backend `check-types` passes cleanly
- Accounting app build passes cleanly
