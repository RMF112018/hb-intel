# Gap 5 Oid Migration and Data Contract

> **Created:** 2026-04-01 (P9-G5-05)
> **Status:** Implemented
> **Scope:** Stable identity (`oid`) field additions across models, handlers, persistence, and SharePoint mapping

## Executive Summary

All authorization-critical identity fields now support dual-write of both UPN and Entra Object ID (`oid`). New records capture `oid` at creation time from validated JWT claims. Pre-migration records continue to work via UPN fallback in the shared `checkOwnership()` policy helper (implemented in P9-G5-04). UPN fields are retained for display, notification, and SharePoint group operations.

---

## 1. Fields Added

### 1.1 `IProjectSetupRequest` (`packages/models/src/provisioning/IProvisioning.ts`)

| Field | Type | Source | Purpose |
|-------|------|--------|---------|
| `submittedByOid` | `string?` | `auth.claims.oid` at submission | Ownership authorization — primary identity for `checkOwnership()` |
| `completedByOid` | `string?` | `auth.claims.oid` at completion | Actor attribution — audit trail for request completion |

### 1.2 `IProvisionSiteRequest` (`packages/models/src/provisioning/IProvisioning.ts`)

| Field | Type | Source | Purpose |
|-------|------|--------|---------|
| `triggeredByOid` | `string?` | `auth.claims.oid` at trigger | Actor attribution — audit trail for provisioning trigger |
| `submittedByOid` | `string?` | Propagated from `IProjectSetupRequest.submittedByOid` | Ownership continuity — preserved through provisioning handoff |

### 1.3 `IProvisioningStatus` (`packages/models/src/provisioning/IProvisioning.ts`)

| Field | Type | Source | Purpose |
|-------|------|--------|---------|
| `triggeredByOid` | `string?` | From `IProvisionSiteRequest.triggeredByOid` | Persisted audit identity |
| `submittedByOid` | `string?` | From `IProvisionSiteRequest.submittedByOid` | Persisted ownership identity |

---

## 2. Handler Changes

### 2.1 `submitProjectSetupRequest` (`projectRequests/index.ts`)

Dual-write at creation: `submittedBy = auth.claims.upn`, `submittedByOid = auth.claims.oid`.

### 2.2 `advanceRequestState` (`projectRequests/index.ts`)

- On `Completed` transition: `completedBy = auth.claims.upn`, `completedByOid = auth.claims.oid`
- On `ReadyToProvision` auto-trigger: propagates `submittedByOid` from existing request to `IProvisionSiteRequest`
- On `ReadyToProvision` auto-trigger: sets `triggeredByOid = auth.claims.oid`

### 2.3 `provisionProjectSite` (`provisioningSaga/index.ts`)

Trust boundary: `triggeredByOid = auth.claims.oid` (server-set alongside `triggeredBy = auth.claims.upn`).

---

## 3. Persistence Changes

### 3.1 Azure Table Storage (`table-storage-service.ts`)

| Field | Serialization | Deserialization | Empty fallback |
|-------|--------------|-----------------|----------------|
| `triggeredByOid` | `status.triggeredByOid ?? ''` | `(entity.triggeredByOid as string) \|\| undefined` | Empty string → `undefined` |
| `submittedByOid` | `status.submittedByOid ?? ''` | `(entity.submittedByOid as string) \|\| undefined` | Empty string → `undefined` |

Pre-migration rows return `undefined` for both fields (empty string in storage normalizes to `undefined`).

### 3.2 SharePoint Projects List (`projects-list-contract.ts`, `projects-list-mapper.ts`)

| SP Internal Name | SP Type | Domain Field | Read Path | Write Path |
|-----------------|---------|-------------|-----------|------------|
| `submittedByOid` | Text | `submittedByOid` | `readOptionalString(item, 'submittedByOid')` | `request.submittedByOid ?? ''` |
| `completedByOid` | Text | `completedByOid` | `readOptionalString(item, 'completedByOid')` | `request.completedByOid ?? ''` |

Pre-migration rows return `undefined` (empty/absent SP value → `readOptionalString` returns `undefined`).

**SharePoint column provisioning note:** The `submittedByOid` and `completedByOid` columns must be created on the Projects list before writes will persist. Until then, writes will silently drop the fields (SharePoint ignores unknown properties). This is safe — the fallback path uses UPN.

---

## 4. Backward Compatibility

### 4.1 Pre-Migration Records

All oid fields are optional (`?`). Records created before this change have `undefined` for all oid fields. The authorization layer (`checkOwnership()` in `authorization.ts`) handles this:

```
if resource.submittedByOid exists → compare oid (method: 'oid')
else → compare UPN case-insensitively (method: 'upn')
```

### 4.2 API Response Compatibility

New fields are optional and additive. No existing API consumer is broken by their presence or absence.

### 4.3 SharePoint Read Compatibility

`readOptionalString()` returns `undefined` for missing, empty, or `null` SP values. Pre-migration rows safely return `undefined`.

---

## 5. Fields NOT Changed (Out of Scope)

| Field | Reason |
|-------|--------|
| `escalatedBy` (UPN) | Display/notification only — not an authorization input |
| `raisedBy` in `IRequestClarification` | Display only — not used for authorization |
| `groupMembers[]`, `groupLeaders[]` | SharePoint group membership inputs — not authorization inputs |
| `projectExecutiveUpn`, `projectManagerUpn`, etc. | Person assignment fields — not used for access control |
| `IProvisioningAuditRecord.triggeredBy`, `.submittedBy` | Audit record — display only, not authorization-critical |

---

## 6. Evidence Classification

### Confirmed Repo Facts
- `auth.claims.oid` is available in every handler (required claim in `validateToken.ts`)
- `submittedBy` is set from `auth.claims.upn` at line 127 of `projectRequests/index.ts`
- `triggeredBy` is set from `auth.claims.upn` at line 31 of `provisioningSaga/index.ts`
- `completedBy` is set from `auth.claims.upn` at line 329 of `projectRequests/index.ts`
- `checkOwnership()` in `authorization.ts` already supports oid-first with UPN fallback

### Design Decisions
- All oid fields are optional to preserve backward compatibility
- Lazy backfill strategy: pre-migration records use UPN fallback indefinitely (no bulk migration)
- `IProvisioningAuditRecord` not updated — it is a write-once audit log, not an authorization input
