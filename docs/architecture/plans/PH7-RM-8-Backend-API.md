# PH7-RM-8 — Backend API and SharePoint List Schema for Action Items

**Version:** 1.0
**Governed by:** CLAUDE.md v1.2 · HB-Intel-Blueprint-V4.md
**Date:** 2026-03-08
**Depends on:** PH7-RM-1 (Package Foundation & IActionItem types), SharePoint Online, ASP.NET Core backend, PnP Provisioning Engine
**Blocks:** PH7-RM-5 (Action Items UI Components), PH7-RM-6 (Session Summary), PH7-RM-7 (Estimating Integration)

---

## Summary

Phase 8 defines the complete backend contract for Review Mode action items. This includes:

1. **SharePoint List Schema** (`HBIntelActionItems`) — the persistent store for action items with columns for title, description, status, priority, assignee, due date, source attribution (module, record ID, label), and audit timestamps.
2. **`lastReviewedAt` Column Additions** — exact steps to add a timestamp field to three existing Estimating lists (`HBIntelActivePursuits`, `HBIntelActivePreconstruction`, `HBIntelEstimateLog`) to track when each record was last reviewed.
3. **RESTful API Endpoints** — five action item endpoints (list by record, list by module, create, update, delete) following HTTP conventions with comprehensive error handling, auth/permission checks, and transaction safety.
4. **PATCH Extensions** — how to extend three existing Estimating endpoints to accept an optional `lastReviewedAt` field without breaking existing clients.
5. **Payload & Response Types** — complete TypeScript interfaces for all request/response bodies with strict null safety and proper generics.
6. **Data Access Layer** — production-ready `actionItemsQueries.ts` implementation using the `getHttpAdapter()` pattern for context-aware HTTP calls (PWA vs SPFx).
7. **Provisioning Checklist** — step-by-step guide for a SharePoint admin or developer to provision lists and columns before first deployment.

## Why It Matters

- **Source Attribution**: Every action item tracks its origin (module, record, label) so reviews are auditable and traceable.
- **Workflow Completeness**: The `lastReviewedAt` field on source records enables reporting on review velocity and audit compliance.
- **Write Permission Isolation**: PATCH/POST/DELETE operations enforce module-specific write permissions (e.g., only `estimating:write` can create action items with `sourceModule='estimating'`) to prevent cross-team data mutation.
- **Non-Destructive Updates**: Action item PATCH accepts partial payloads; only provided fields are updated. No field is cleared by omitting it.
- **Backwards Compatibility**: Existing Estimating endpoints remain unchanged; `lastReviewedAt` is purely additive (optional in request body).
- **Scale & Performance**: SharePoint indexes on `SourceRecordId` and `SourceModule` enable fast lookups for a record's action items.

---

## Files to Create / Modify

### New Files (API Implementation)
1. `packages/review-mode/src/data/actionItemsQueries.ts` (complete data layer with all 5 CRUD functions)
2. `packages/review-mode/src/types/actionItems.ts` (payload interfaces: create, update)

### SP Provisioning Assets (reference)
3. `docs/architecture/plans/RM-8-SP-Provisioning-Template.json` (PnP template for HBIntelActionItems list)
4. `docs/how-to/administrator/Review-Mode-SharePoint-Setup.md` (step-by-step admin guide)

### Backend Documentation (reference)
5. `docs/reference/api/review-mode-endpoints.md` (OpenAPI-style endpoint specs)

### Modification (if needed for existing feature)
6. Any existing Estimating endpoint stubs that accept PATCH (ensure they forward `lastReviewedAt` to SharePoint).

---

## SharePoint List Schema: `HBIntelActionItems`

This list stores all action items created during review sessions. It is the single source of truth for action item data.

### Column Definitions

| Column Name | Type | Required | Searchable | Indexed | Notes |
|---|---|---|---|---|---|
| **Title** | Single Line Text | Yes | Yes | Yes | Action item summary (max 255 chars). Appears in all UI lists. |
| **Description** | Multi-line Text | No | Yes | No | Additional context or instructions (supports rich text). |
| **AssignedToUpn** | Single Line Text | No | Yes | No | Azure AD UPN (e.g., `jane.smith@company.com`). Leave blank if unassigned. |
| **AssignedToName** | Single Line Text | No | Yes | No | Display name of assignee (auto-populated from AD on creation; not used for auth). |
| **DueDate** | Date | No | Yes | No | Target completion date. If in past, item is "overdue"; if within 7 days, highlighted in UI. |
| **Status** | Choice | Yes | Yes | Yes | Enum: `Open`, `InProgress`, `Done`. Default: `Open`. Searchable for workflow reporting. |
| **Priority** | Choice | Yes | Yes | No | Enum: `High`, `Medium`, `Low`. Default: `Medium`. Used for sorting and escalation workflows. |
| **SourceModule** | Single Line Text | Yes | Yes | Yes | Enum-like string: `estimating`, `business-development`, `project-hub`, `leadership`, etc. Used for access control and filtering. Must match a known module in the system. |
| **SourceRecordId** | Single Line Text | Yes | Yes | Yes | UUID of the source record (e.g., a pursuit ID, project ID). Combined with `SourceModule`, uniquely identifies the record being reviewed. |
| **SourceRecordLabel** | Single Line Text | Yes | Yes | Yes | Human-readable label of the source record (e.g., `"Ocean Towers — 2026-OCEAN-001"`). Displayed in UI for context. Must not be a computed field; must be explicitly set by the API. |
| **CreatedAt** | DateTime | Yes | Yes | No | Auto-set by API on POST. ISO 8601 format in GMT. User-creation timestamps are NOT editable. |
| **CreatedByUpn** | Single Line Text | Yes | Yes | No | Auto-set by API from Bearer token identity. Read-only; controls delete authorization. |

### Indexes

Create the following indexes on the SharePoint list for optimal query performance:

1. **Primary Compound Index**: `(SourceRecordId, Status)` — fast lookup of all action items for a record, optionally filtered by status.
2. **Secondary Compound Index**: `(SourceModule, Status, DueDate)` — enable module-level reporting (e.g., all "overdue" items for a module).
3. **Single Index on CreatedAt** — enable time-series queries (e.g., "items created this week").

### List Settings

- **Versioning**: Enable version history (default: keep 100 versions). Allows audit trail of status/assignment changes.
- **Recycle Bin**: Enable (default: 93 days retention). Hard deletes should be rare; soft delete via versioning is preferred.
- **Item-level Permissions**: Not recommended for this list. Use list-level RBAC and API-level permission checks.

---

## `lastReviewedAt` Column Additions

Each source list participating in Review Mode requires one additional Date/Time column to track when it was last reviewed.

### Lists Affected (Initial Rollout)

1. `HBIntelActivePursuits` — Estimating feature
2. `HBIntelActivePreconstruction` — Estimating feature
3. `HBIntelEstimateLog` — Estimating feature

Future rollout phases (Business Development, Project Hub, Leadership) will add the same column to their respective lists.

### Column Definition for All Three Lists

| Column Name | Type | Required | Notes |
|---|---|---|---|
| **LastReviewedAt** | DateTime | No | Set by the Review Mode API when the user clicks "Mark as Reviewed" on the session exit summary. Read-only in SharePoint UI (set only via API). |

### Implementation Pattern (for each list)

**Step 1: Add the Column**
```powershell
# PowerShell / PnP script to add LastReviewedAt to each list
Add-PnPField -List "HBIntelActivePursuits" -DisplayName "LastReviewedAt" -InternalName "LastReviewedAt" -Type DateTime -Required $false
```

**Step 2: Update Existing PATCH Endpoints**

For each list, the existing PATCH endpoint (e.g., `/api/estimating/pursuits/:id`) must accept an optional `lastReviewedAt` field in the request body:

```typescript
// Example: PATCH /api/estimating/pursuits/:id
// Existing request body:
interface IPursuitUpdatePayload {
  projectName?: string;
  status?: PursuitStatus;
  leadEstimatorUpn?: string;
  // ... other fields ...
}

// Updated request body (backwards compatible):
interface IPursuitUpdatePayload {
  projectName?: string;
  status?: PursuitStatus;
  leadEstimatorUpn?: string;
  lastReviewedAt?: string; // NEW: ISO 8601 datetime or null to clear
  // ... other fields ...
}
```

The backend should:
- Accept `lastReviewedAt` in the PATCH body.
- If provided, update the corresponding SharePoint column.
- If omitted, leave the SharePoint column unchanged (no effect on other field updates).
- If null, set the SharePoint column to null/empty.

**Step 3: No UI Changes in Source Feature**

The source features (Estimating, Business Development, etc.) do not need UI changes. The Review Mode feature is responsible for setting `lastReviewedAt`; source features remain unaware of it.

---

## Action Items API Endpoints

All endpoints are exposed under the `/api/review/action-items` path. The backend is ASP.NET Core; SharePoint lists are accessed via the SP REST API or PnP JS.

### Common Requirements for All Endpoints

- **Authentication**: Every request must include a valid Bearer token (MSAL-issued JWT for PWA, SPFx context token for webparts).
- **Authorization**: Write operations require `{sourceModule}:write` permission. For example, if `sourceModule="estimating"`, the user must have `estimating:write`.
- **Error Response Format**:
  ```json
  {
    "error": {
      "code": "ERROR_CODE",
      "message": "Human-readable message",
      "details": { "...": "additional context if applicable" }
    }
  }
  ```
- **Success Response Format**: For list endpoints, responses follow `{ data: T[], meta?: { total: number } }`. For single-item endpoints, `{ data: T }`.
- **Rate Limiting**: None specified at this phase; add in Phase 9 if needed.

---

### Endpoint 1: GET — List Action Items for a Record

```http
GET /api/review/action-items?sourceRecordId={id}
```

**Purpose**: Fetch all action items for a specific source record (e.g., a pursuit, project, etc.).

**Query Parameters**

| Name | Type | Required | Example | Notes |
|---|---|---|---|---|
| `sourceRecordId` | string (UUID) | Yes | `"pursuit-2026-ocean-001"` | The record ID from the source module. Determines which items are returned. |
| `status` | string | No | `"Open"` | If provided, filter to items with matching status (Open, InProgress, Done). If omitted, return all. |
| `limit` | integer | No | `50` | Max items to return (default: 100, max: 1000). For pagination. |
| `offset` | integer | No | `0` | Skip first N items (default: 0). For pagination. |

**Request Body**: None.

**Response (Success 200)**

```json
{
  "data": [
    {
      "id": "action-item-abc123",
      "title": "Follow up with owner on bid bond",
      "description": "Confirm that the bid bond amount matches the GC's estimate.",
      "assignedToUpn": "jane.smith@company.com",
      "assignedToName": "Jane Smith",
      "dueDate": "2026-03-15",
      "status": "Open",
      "priority": "High",
      "sourceModule": "estimating",
      "sourceRecordId": "pursuit-2026-ocean-001",
      "sourceRecordLabel": "Ocean Towers — 2026-OCEAN-001",
      "createdAt": "2026-03-08T14:22:33Z",
      "createdByUpn": "john.doe@company.com"
    },
    {
      "id": "action-item-def456",
      "title": "Update preconstruction schedule",
      "description": null,
      "assignedToUpn": null,
      "assignedToName": null,
      "dueDate": null,
      "status": "InProgress",
      "priority": "Medium",
      "sourceModule": "estimating",
      "sourceRecordId": "pursuit-2026-ocean-001",
      "sourceRecordLabel": "Ocean Towers — 2026-OCEAN-001",
      "createdAt": "2026-03-07T10:15:00Z",
      "createdByUpn": "john.doe@company.com"
    }
  ],
  "meta": {
    "total": 2
  }
}
```

**Auth Requirements**
- Bearer token required.
- No specific permission needed to *read* action items (any authenticated user can view items for any record).
  - *Optional future restriction*: Could require `{sourceModule}:read` to view items for that module.

**Error Cases**

| Status | Code | Message | Cause |
|---|---|---|---|
| 400 | MISSING_QUERY_PARAM | `sourceRecordId` query parameter is required. | Query string missing or empty. |
| 401 | UNAUTHORIZED | Bearer token missing or invalid. | No auth header or expired token. |
| 404 | RECORD_NOT_FOUND | Source record not found in {sourceModule} list. | Record ID does not exist (optional validation). |

---

### Endpoint 2: GET — List Action Items for a Module

```http
GET /api/review/action-items?sourceModule={module}
```

**Purpose**: Fetch all action items for a module (used for module-level reporting and dashboards).

**Query Parameters**

| Name | Type | Required | Example | Notes |
|---|---|---|---|---|
| `sourceModule` | string | Yes | `"estimating"` | Module identifier (e.g., 'estimating', 'business-development'). |
| `status` | string | No | `"Open"` | Filter to items with matching status. |
| `limit` | integer | No | `100` | Max items to return (default: 100, max: 1000). |
| `offset` | integer | No | `0` | Skip first N items (default: 0). |

**Request Body**: None.

**Response (Success 200)**

```json
{
  "data": [
    {
      "id": "action-item-abc123",
      "title": "Follow up with owner on bid bond",
      "description": "Confirm that the bid bond amount matches the GC's estimate.",
      "assignedToUpn": "jane.smith@company.com",
      "assignedToName": "Jane Smith",
      "dueDate": "2026-03-15",
      "status": "Open",
      "priority": "High",
      "sourceModule": "estimating",
      "sourceRecordId": "pursuit-2026-ocean-001",
      "sourceRecordLabel": "Ocean Towers — 2026-OCEAN-001",
      "createdAt": "2026-03-08T14:22:33Z",
      "createdByUpn": "john.doe@company.com"
    }
  ],
  "meta": {
    "total": 47
  }
}
```

**Auth Requirements**
- Bearer token required.
- No specific permission needed to read.

**Error Cases**

| Status | Code | Message | Cause |
|---|---|---|---|
| 400 | MISSING_QUERY_PARAM | `sourceModule` query parameter is required. | Query string missing or invalid. |
| 400 | INVALID_MODULE | Unknown sourceModule: {module}. Allowed: [estimating, business-development, ...] | Module not registered in the system. |
| 401 | UNAUTHORIZED | Bearer token missing or invalid. | Missing auth or expired token. |

---

### Endpoint 3: POST — Create Action Item

```http
POST /api/review/action-items
Content-Type: application/json

{
  "title": "Follow up with owner",
  "description": "Confirm bid bond timeline",
  "assignedToUpn": "jane.smith@company.com",
  "assignedToName": "Jane Smith",
  "dueDate": "2026-03-15",
  "status": "Open",
  "priority": "High",
  "sourceModule": "estimating",
  "sourceRecordId": "pursuit-2026-ocean-001",
  "sourceRecordLabel": "Ocean Towers — 2026-OCEAN-001"
}
```

**Purpose**: Create a new action item and return the created item with its auto-generated ID.

**Request Body Schema** (`ICreateActionItemPayload`)

```typescript
export interface ICreateActionItemPayload {
  title: string; // Required. Non-empty, max 255 chars.
  description?: string; // Optional. Max 4000 chars.
  assignedToUpn?: string; // Optional. Must be valid Azure AD UPN if provided.
  assignedToName?: string; // Optional. Display name of assignee; for reference only.
  dueDate?: string; // Optional. ISO 8601 date (YYYY-MM-DD) or datetime.
  status: ActionItemStatus; // Required. One of: 'Open', 'InProgress', 'Done'.
  priority: ActionItemPriority; // Required. One of: 'High', 'Medium', 'Low'.
  sourceModule: string; // Required. Enum-like string (e.g., 'estimating').
  sourceRecordId: string; // Required. UUID of source record.
  sourceRecordLabel: string; // Required. Human-readable label (max 255 chars).
}

export type ActionItemStatus = 'Open' | 'InProgress' | 'Done';
export type ActionItemPriority = 'High' | 'Medium' | 'Low';
```

**Response (Success 201)**

```json
{
  "data": {
    "id": "action-item-abc123",
    "title": "Follow up with owner",
    "description": "Confirm bid bond timeline",
    "assignedToUpn": "jane.smith@company.com",
    "assignedToName": "Jane Smith",
    "dueDate": "2026-03-15",
    "status": "Open",
    "priority": "High",
    "sourceModule": "estimating",
    "sourceRecordId": "pursuit-2026-ocean-001",
    "sourceRecordLabel": "Ocean Towers — 2026-OCEAN-001",
    "createdAt": "2026-03-08T14:22:33Z",
    "createdByUpn": "john.doe@company.com"
  }
}
```

**Auth Requirements**
- Bearer token required; identity extracted for `createdByUpn`.
- **Permission Check**: User must have `{sourceModule}:write` (e.g., `estimating:write` if creating an item with `sourceModule="estimating"`).

**Validation**

1. **title**: Must be non-empty and max 255 chars. Return 400 if missing or blank.
2. **status** & **priority**: Must be one of the defined enums. Return 400 if invalid.
3. **sourceModule**: Must be a registered module. Return 400 if unknown.
4. **sourceRecordId**: Must be non-empty UUID. Return 404 if the record does not exist in the source module (optional validation).
5. **assignedToUpn**: If provided, must be a valid Azure AD UPN. Return 400 if invalid.
6. **dueDate**: If provided, must be valid ISO 8601 date/datetime. Return 400 if malformed.

**Error Cases**

| Status | Code | Message | Cause |
|---|---|---|---|
| 400 | VALIDATION_ERROR | Field {fieldName} is required or invalid: {reason}. | Missing required field or invalid format. |
| 400 | INVALID_ENUM | status must be one of: Open, InProgress, Done. | Enum validation failed. |
| 401 | UNAUTHORIZED | Bearer token missing or invalid. | No auth or expired token. |
| 403 | PERMISSION_DENIED | You do not have {sourceModule}:write permission. | User lacks required permission. |
| 404 | RECORD_NOT_FOUND | Source record not found in {sourceModule}. | Record ID does not exist. |
| 409 | DUPLICATE_ITEM | An action item with the same title already exists for this record. | Optional: prevent duplicate titles per record. |

---

### Endpoint 4: PATCH — Update Action Item

```http
PATCH /api/review/action-items/:id
Content-Type: application/json

{
  "status": "InProgress",
  "assignedToUpn": "jane.smith@company.com"
}
```

**Purpose**: Update one or more fields of an existing action item. Supports partial payloads (only supplied fields are updated).

**URL Parameters**

| Name | Type | Notes |
|---|---|---|
| `id` | string (UUID) | The action item ID. |

**Request Body Schema** (`IUpdateActionItemPayload`)

```typescript
export interface IUpdateActionItemPayload {
  title?: string; // Optional. If provided, update to this value.
  description?: string; // Optional. Update or clear.
  assignedToUpn?: string; // Optional. Update or clear (null clears assignment).
  assignedToName?: string; // Optional. Display name; for reference.
  dueDate?: string; // Optional. ISO 8601 date or null to clear.
  status?: ActionItemStatus; // Optional. One of: 'Open', 'InProgress', 'Done'.
  priority?: ActionItemPriority; // Optional. One of: 'High', 'Medium', 'Low'.
  // Note: sourceModule, sourceRecordId, sourceRecordLabel, createdAt, createdByUpn are immutable.
}
```

**Response (Success 200)**

```json
{
  "data": {
    "id": "action-item-abc123",
    "title": "Follow up with owner",
    "description": "Confirm bid bond timeline",
    "assignedToUpn": "jane.smith@company.com",
    "assignedToName": "Jane Smith",
    "dueDate": "2026-03-15",
    "status": "InProgress",
    "priority": "High",
    "sourceModule": "estimating",
    "sourceRecordId": "pursuit-2026-ocean-001",
    "sourceRecordLabel": "Ocean Towers — 2026-OCEAN-001",
    "createdAt": "2026-03-08T14:22:33Z",
    "createdByUpn": "john.doe@company.com"
  }
}
```

**Auth Requirements**
- Bearer token required.
- **Permission Check**: User must have `{sourceModule}:write` (where `sourceModule` is the *source* module of the action item being updated, fetched from the item).

**Validation**

1. **Immutable Fields**: Do not allow changes to `sourceModule`, `sourceRecordId`, `sourceRecordLabel`, `createdAt`, `createdByUpn`. Return 400 if attempted.
2. **Enum Fields**: If `status` or `priority` are provided, validate against allowed enums. Return 400 if invalid.
3. **dueDate**: If provided, must be valid ISO 8601. Return 400 if malformed.
4. **assignedToUpn**: If provided (non-null), must be a valid Azure AD UPN. Return 400 if invalid.

**Error Cases**

| Status | Code | Message | Cause |
|---|---|---|---|
| 400 | VALIDATION_ERROR | Field {fieldName} is invalid: {reason}. | Validation failed. |
| 400 | IMMUTABLE_FIELD | Field {fieldName} cannot be changed. | Attempt to update immutable field. |
| 401 | UNAUTHORIZED | Bearer token missing or invalid. | No auth or expired token. |
| 403 | PERMISSION_DENIED | You do not have {sourceModule}:write permission. | User lacks required permission. |
| 404 | NOT_FOUND | Action item {id} not found. | Item ID does not exist. |

---

### Endpoint 5: DELETE — Delete Action Item

```http
DELETE /api/review/action-items/:id
```

**Purpose**: Delete an action item (hard delete from SharePoint).

**URL Parameters**

| Name | Type | Notes |
|---|---|---|
| `id` | string (UUID) | The action item ID. |

**Request Body**: None.

**Response (Success 204)**

No content. HTTP 204 No Content.

**Auth Requirements**
- Bearer token required.
- **Authorization Check**: User must either:
  - Be the original creator (match `createdByUpn` from the item), OR
  - Have `admin:write` permission (global admin override).
- **Module Permission Check**: User must also have `{sourceModule}:write` (where `sourceModule` is the source module of the item).

**Validation**

1. Fetch the action item by ID. Return 404 if not found.
2. Check if the user is the creator or has admin rights. Return 403 if not.
3. Check if the user has module-level write permission. Return 403 if not.
4. Delete the item from SharePoint.

**Error Cases**

| Status | Code | Message | Cause |
|---|---|---|---|
| 401 | UNAUTHORIZED | Bearer token missing or invalid. | No auth or expired token. |
| 403 | PERMISSION_DENIED | Only the original creator or admins can delete this item. | User is not the creator and lacks admin rights. |
| 403 | PERMISSION_DENIED | You do not have {sourceModule}:write permission. | User lacks required module permission. |
| 404 | NOT_FOUND | Action item {id} not found. | Item ID does not exist. |

---

## PATCH Extensions for Existing Estimating Endpoints

Three existing Estimating endpoints are extended to accept an optional `lastReviewedAt` field. These extensions are *backwards compatible*—existing clients do not need to change.

### Pattern for All Three Endpoints

**Existing Endpoint** (example: `PATCH /api/estimating/pursuits/:id`)

Existing behavior:
- Accept `IPursuitUpdatePayload` with fields like `projectName`, `status`, `leadEstimatorUpn`, etc.
- Update SharePoint columns corresponding to those fields.
- Return the updated pursuit.

**New Behavior** (with RM-8 extension)

- Accept the *same* `IPursuitUpdatePayload`, plus an optional `lastReviewedAt: string | null` field.
- If `lastReviewedAt` is provided in the request body:
  - Update the `LastReviewedAt` column in SharePoint to that value (or null).
  - No change to other fields if they are not in the payload.
- If `lastReviewedAt` is omitted from the request body:
  - Do not touch the `LastReviewedAt` column (leave it as-is).
- Return the updated item including `lastReviewedAt`.

### Endpoint 3.1: PATCH /api/estimating/pursuits/:id

```http
PATCH /api/estimating/pursuits/:id
Content-Type: application/json

{
  "status": "Awarded",
  "lastReviewedAt": "2026-03-08T14:22:33Z"
}
```

**Updated Request Body**

```typescript
export interface IPursuitUpdatePayload {
  projectName?: string;
  projectNumber?: string;
  status?: PursuitStatus;
  leadEstimatorUpn?: string;
  leadEstimatorName?: string;
  // ... other existing fields ...
  lastReviewedAt?: string; // NEW: ISO 8601 datetime or null to clear.
}
```

**Response (Success 200)**

```json
{
  "data": {
    "id": "pursuit-2026-ocean-001",
    "projectName": "Ocean Towers",
    "projectNumber": "2026-OCEAN",
    "status": "Awarded",
    "leadEstimatorUpn": "john.smith@company.com",
    "leadEstimatorName": "John Smith",
    "lastReviewedAt": "2026-03-08T14:22:33Z",
    "createdAt": "2026-01-15T08:00:00Z"
  }
}
```

**Auth Requirements**
- Bearer token required.
- User must have `estimating:write` permission.

**Error Cases**
- Same as existing endpoint, plus: 400 if `lastReviewedAt` format is invalid ISO 8601.

---

### Endpoint 3.2: PATCH /api/estimating/preconstruction/:id

```http
PATCH /api/estimating/preconstruction/:id
Content-Type: application/json

{
  "stage": "Drawings",
  "lastReviewedAt": "2026-03-08T14:22:33Z"
}
```

**Updated Request Body**

```typescript
export interface IPreconstructionUpdatePayload {
  projectName?: string;
  projectNumber?: string;
  stage?: PreconStage;
  preconManagerUpn?: string;
  preconManagerName?: string;
  // ... other existing fields ...
  lastReviewedAt?: string; // NEW: ISO 8601 datetime or null to clear.
}
```

**Response (Success 200)**

Same pattern as Pursuits. Include `lastReviewedAt` in the response.

---

### Endpoint 3.3: PATCH /api/estimating/log/:id

```http
PATCH /api/estimating/log/:id
Content-Type: application/json

{
  "outcome": "Won",
  "lastReviewedAt": "2026-03-08T14:22:33Z"
}
```

**Updated Request Body**

```typescript
export interface IEstimateLogUpdatePayload {
  estimateNumber?: string;
  estimatedAmount?: number;
  outcome?: EstimateOutcome;
  // ... other existing fields ...
  lastReviewedAt?: string; // NEW: ISO 8601 datetime or null to clear.
}
```

**Response (Success 200)**

Same pattern. Include `lastReviewedAt` in the response.

---

## Payload & Response Type Definitions

Complete TypeScript interfaces for the action items API.

### IActionItem — Persisted Representation

```typescript
/**
 * IActionItem
 *
 * The complete, immutable representation of an action item as stored in SharePoint.
 * Returned by all action item endpoints.
 */
export interface IActionItem {
  /**
   * Unique identifier (SharePoint GUID or auto-generated UUID).
   * Auto-set by the backend on creation.
   */
  id: string;

  /**
   * Summary of the action item (max 255 chars).
   * Required at creation; cannot be changed to empty.
   */
  title: string;

  /**
   * Additional context (max 4000 chars).
   * Optional; can be null or empty string.
   */
  description?: string;

  /**
   * Azure AD UPN of the person assigned to this item.
   * Optional; null means unassigned.
   * If provided, must be a valid UPN (e.g., jane.smith@company.com).
   */
  assignedToUpn?: string;

  /**
   * Display name of the assigned person (for UI display only).
   * Auto-populated from Azure AD on creation.
   * Not used for authorization; for reference only.
   */
  assignedToName?: string;

  /**
   * Target completion date (ISO 8601 format: YYYY-MM-DD or full datetime).
   * Optional; null means no due date.
   * UI may highlight items due within 7 days or overdue.
   */
  dueDate?: string;

  /**
   * Current status of the action item.
   * One of: 'Open', 'InProgress', 'Done'.
   * Searchable; used for filtering and reporting.
   */
  status: ActionItemStatus;

  /**
   * Priority level (used for sorting and escalation).
   * One of: 'High', 'Medium', 'Low'.
   * Affects UI display order and visual cues.
   */
  priority: ActionItemPriority;

  /**
   * The module/feature this action item originates from (e.g., 'estimating', 'business-development').
   * Used for access control, filtering, and reporting.
   * Must be a registered module in the system.
   */
  sourceModule: string;

  /**
   * Unique identifier of the source record within the module (e.g., pursuit ID, project ID).
   * Used to link the action item back to the record being reviewed.
   * Combined with sourceModule, forms a compound identifier.
   */
  sourceRecordId: string;

  /**
   * Human-readable label of the source record (e.g., "Ocean Towers — 2026-OCEAN-001").
   * Displayed in UI for context and traceability.
   * Must be explicitly set at creation; not auto-derived.
   */
  sourceRecordLabel: string;

  /**
   * Timestamp when this action item was created (ISO 8601, GMT).
   * Auto-set by the backend; not editable.
   * Used for audit trail and time-series reporting.
   */
  createdAt: string;

  /**
   * Azure AD UPN of the person who created this action item.
   * Auto-set by the backend from the Bearer token identity.
   * Used to control deletion (only creator or admin can delete).
   * Not editable after creation.
   */
  createdByUpn: string;
}

export type ActionItemStatus = 'Open' | 'InProgress' | 'Done';
export type ActionItemPriority = 'High' | 'Medium' | 'Low';
```

### ICreateActionItemPayload — Request Body for POST

```typescript
/**
 * ICreateActionItemPayload
 *
 * Request body schema for POST /api/review/action-items.
 * Excludes auto-set fields: id, createdAt, createdByUpn.
 */
export interface ICreateActionItemPayload {
  /**
   * Action item summary (required).
   * Max 255 chars. Must be non-empty.
   */
  title: string;

  /**
   * Additional details (optional).
   * Max 4000 chars. Can be null or omitted.
   */
  description?: string;

  /**
   * Assign to a person (optional).
   * Must be a valid Azure AD UPN if provided (e.g., jane.smith@company.com).
   * Null or omitted means unassigned.
   */
  assignedToUpn?: string;

  /**
   * Display name of assignee (optional, for reference).
   * Not used for auth; will be auto-resolved from Azure AD if assignedToUpn is provided.
   */
  assignedToName?: string;

  /**
   * Target completion date (optional).
   * ISO 8601 format: YYYY-MM-DD or full datetime.
   * Null or omitted means no due date.
   */
  dueDate?: string;

  /**
   * Initial status (required).
   * Must be one of: 'Open', 'InProgress', 'Done'.
   * Typically 'Open' at creation.
   */
  status: ActionItemStatus;

  /**
   * Priority level (required).
   * Must be one of: 'High', 'Medium', 'Low'.
   */
  priority: ActionItemPriority;

  /**
   * Source module identifier (required).
   * Enum-like string (e.g., 'estimating', 'business-development').
   * Used for access control and filtering.
   * Must be a registered module.
   */
  sourceModule: string;

  /**
   * ID of the source record (required).
   * UUID or unique key from the source module.
   * Combined with sourceModule to form a compound identifier.
   */
  sourceRecordId: string;

  /**
   * Human-readable label of the source record (required).
   * Example: "Ocean Towers — 2026-OCEAN-001".
   * Max 255 chars. Displayed in UI for context.
   * Must be explicitly provided; not auto-derived.
   */
  sourceRecordLabel: string;
}
```

### IUpdateActionItemPayload — Request Body for PATCH

```typescript
/**
 * IUpdateActionItemPayload
 *
 * Request body schema for PATCH /api/review/action-items/:id.
 * All fields are optional; only supplied fields are updated.
 * Immutable fields (id, sourceModule, sourceRecordId, sourceRecordLabel, createdAt, createdByUpn) cannot be changed.
 */
export interface IUpdateActionItemPayload {
  /**
   * Update the summary (optional).
   * If provided, must be non-empty and max 255 chars.
   * If omitted, title is unchanged.
   */
  title?: string;

  /**
   * Update additional details (optional).
   * If provided, replaces existing description.
   * If omitted, description is unchanged.
   * To clear: pass empty string or null (backend must handle both).
   */
  description?: string;

  /**
   * Update assignee (optional).
   * If provided, must be a valid Azure AD UPN.
   * If omitted, assignedToUpn is unchanged.
   * To unassign: pass null (backend must handle null as "clear assignment").
   */
  assignedToUpn?: string;

  /**
   * Update assignee display name (optional).
   * For reference; will be auto-resolved from Azure AD if assignedToUpn changes.
   * If omitted, assignedToName is unchanged.
   */
  assignedToName?: string;

  /**
   * Update due date (optional).
   * If provided, must be valid ISO 8601.
   * If omitted, dueDate is unchanged.
   * To clear: pass null.
   */
  dueDate?: string;

  /**
   * Update status (optional).
   * If provided, must be one of: 'Open', 'InProgress', 'Done'.
   * If omitted, status is unchanged.
   */
  status?: ActionItemStatus;

  /**
   * Update priority (optional).
   * If provided, must be one of: 'High', 'Medium', 'Low'.
   * If omitted, priority is unchanged.
   */
  priority?: ActionItemPriority;

  // Note: sourceModule, sourceRecordId, sourceRecordLabel, createdAt, createdByUpn are NOT included.
  // These are immutable and cannot be changed via PATCH.
}
```

---

## Data Access Layer: `actionItemsQueries.ts`

Complete, production-ready implementation of all CRUD operations using the `getHttpAdapter()` pattern.

### File: `packages/review-mode/src/data/actionItemsQueries.ts`

```typescript
import { getHttpAdapter } from '@hbc/data-access';
import type {
  IActionItem,
  ICreateActionItemPayload,
  IUpdateActionItemPayload,
} from '../types/index.js';

/**
 * actionItemsQueries.ts
 *
 * Complete CRUD operations for action items via the Review Mode API.
 *
 * Endpoints:
 *   GET  /api/review/action-items?sourceRecordId={id}
 *   GET  /api/review/action-items?sourceModule={module}
 *   POST /api/review/action-items
 *   PATCH /api/review/action-items/:id
 *   DELETE /api/review/action-items/:id
 *
 * All functions use getHttpAdapter() for context-aware HTTP calls (PWA vs SPFx).
 * Errors are normalized by the adapter; callers receive standard error shapes.
 */

/**
 * Fetch all action items for a given source record.
 *
 * Uses the query parameter sourceRecordId to filter the result.
 * Useful for displaying action items on a record's review card.
 *
 * @param sourceRecordId - The ID of the record being reviewed (required).
 * @param options - Optional filters and pagination.
 *   - status?: string – Filter by status (e.g., "Open").
 *   - limit?: number – Max items to return (default: 100).
 *   - offset?: number – Skip first N items (default: 0).
 * @returns Promise<IActionItem[]> – Array of action items (may be empty).
 * @throws Error if sourceRecordId is missing, token is invalid, or network fails.
 *
 * @example
 * const items = await fetchActionItemsForRecord('pursuit-2026-ocean-001');
 * // Returns all action items for that pursuit.
 *
 * @example
 * const openItems = await fetchActionItemsForRecord('pursuit-2026-ocean-001', {
 *   status: 'Open',
 *   limit: 50,
 * });
 */
export async function fetchActionItemsForRecord(
  sourceRecordId: string,
  options?: {
    status?: string;
    limit?: number;
    offset?: number;
  }
): Promise<IActionItem[]> {
  if (!sourceRecordId || sourceRecordId.trim() === '') {
    throw new Error('sourceRecordId is required and cannot be empty.');
  }

  const http = getHttpAdapter();

  // Build query string.
  const params = new URLSearchParams();
  params.append('sourceRecordId', sourceRecordId);
  if (options?.status) {
    params.append('status', options.status);
  }
  if (options?.limit !== undefined) {
    params.append('limit', String(options.limit));
  }
  if (options?.offset !== undefined) {
    params.append('offset', String(options.offset));
  }

  const url = `/api/review/action-items?${params.toString()}`;

  try {
    const response = await http.get<{ data: IActionItem[]; meta?: { total: number } }>(url);
    return response.data ?? [];
  } catch (error) {
    // Re-throw with context for debugging.
    throw new Error(`Failed to fetch action items for record ${sourceRecordId}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Fetch all action items for a given module.
 *
 * Useful for module-level dashboards or reporting.
 *
 * @param sourceModule - The module identifier (e.g., 'estimating', 'business-development').
 * @param options - Optional filters and pagination.
 *   - status?: string – Filter by status.
 *   - limit?: number – Max items to return.
 *   - offset?: number – Skip first N items.
 * @returns Promise<IActionItem[]> – Array of action items.
 * @throws Error if sourceModule is invalid, token is missing, or network fails.
 *
 * @example
 * const estimatingItems = await fetchActionItemsForModule('estimating');
 * // Returns all action items created for Estimating records.
 *
 * @example
 * const openEstimatingItems = await fetchActionItemsForModule('estimating', {
 *   status: 'Open',
 * });
 */
export async function fetchActionItemsForModule(
  sourceModule: string,
  options?: {
    status?: string;
    limit?: number;
    offset?: number;
  }
): Promise<IActionItem[]> {
  if (!sourceModule || sourceModule.trim() === '') {
    throw new Error('sourceModule is required and cannot be empty.');
  }

  const http = getHttpAdapter();

  const params = new URLSearchParams();
  params.append('sourceModule', sourceModule);
  if (options?.status) {
    params.append('status', options.status);
  }
  if (options?.limit !== undefined) {
    params.append('limit', String(options.limit));
  }
  if (options?.offset !== undefined) {
    params.append('offset', String(options.offset));
  }

  const url = `/api/review/action-items?${params.toString()}`;

  try {
    const response = await http.get<{ data: IActionItem[]; meta?: { total: number } }>(url);
    return response.data ?? [];
  } catch (error) {
    throw new Error(`Failed to fetch action items for module ${sourceModule}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Create a new action item.
 *
 * The backend auto-sets:
 *   - id (generated UUID or SharePoint GUID).
 *   - createdAt (current server timestamp).
 *   - createdByUpn (extracted from Bearer token).
 *
 * @param payload - The action item data (excludes id, createdAt, createdByUpn).
 * @returns Promise<IActionItem> – The created item with all fields populated.
 * @throws Error if validation fails, permission is denied, or network fails.
 *
 * @example
 * const newItem = await createActionItem({
 *   title: 'Follow up with owner',
 *   description: 'Confirm bid bond timeline',
 *   assignedToUpn: 'jane.smith@company.com',
 *   assignedToName: 'Jane Smith',
 *   dueDate: '2026-03-15',
 *   status: 'Open',
 *   priority: 'High',
 *   sourceModule: 'estimating',
 *   sourceRecordId: 'pursuit-2026-ocean-001',
 *   sourceRecordLabel: 'Ocean Towers — 2026-OCEAN-001',
 * });
 *
 * console.log(newItem.id); // e.g., 'action-item-abc123'
 * console.log(newItem.createdAt); // e.g., '2026-03-08T14:22:33Z'
 */
export async function createActionItem(payload: ICreateActionItemPayload): Promise<IActionItem> {
  // Validate required fields client-side for early feedback.
  if (!payload.title || payload.title.trim() === '') {
    throw new Error('Action item title is required and cannot be empty.');
  }
  if (!payload.sourceModule || payload.sourceModule.trim() === '') {
    throw new Error('sourceModule is required.');
  }
  if (!payload.sourceRecordId || payload.sourceRecordId.trim() === '') {
    throw new Error('sourceRecordId is required.');
  }
  if (!payload.sourceRecordLabel || payload.sourceRecordLabel.trim() === '') {
    throw new Error('sourceRecordLabel is required.');
  }
  if (!payload.status || !['Open', 'InProgress', 'Done'].includes(payload.status)) {
    throw new Error('status must be one of: Open, InProgress, Done.');
  }
  if (!payload.priority || !['High', 'Medium', 'Low'].includes(payload.priority)) {
    throw new Error('priority must be one of: High, Medium, Low.');
  }

  const http = getHttpAdapter();

  try {
    const response = await http.post<{ data: IActionItem }>('/api/review/action-items', payload);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to create action item: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Update an existing action item.
 *
 * Supports partial updates: only supplied fields are changed.
 * Immutable fields (sourceModule, sourceRecordId, sourceRecordLabel, createdAt, createdByUpn) cannot be changed.
 *
 * @param id - The action item ID.
 * @param payload - Partial update data. Only supplied fields are modified.
 * @returns Promise<IActionItem> – The updated item.
 * @throws Error if the item is not found, permission is denied, or validation fails.
 *
 * @example
 * const updated = await updateActionItem('action-item-abc123', {
 *   status: 'InProgress',
 * });
 *
 * @example
 * // Change assignee and priority:
 * const updated = await updateActionItem('action-item-abc123', {
 *   assignedToUpn: 'bob.jones@company.com',
 *   assignedToName: 'Bob Jones',
 *   priority: 'High',
 * });
 *
 * @example
 * // Unassign (clear assignee):
 * const updated = await updateActionItem('action-item-abc123', {
 *   assignedToUpn: null as any,
 *   assignedToName: null as any,
 * });
 */
export async function updateActionItem(
  id: string,
  payload: IUpdateActionItemPayload
): Promise<IActionItem> {
  if (!id || id.trim() === '') {
    throw new Error('Action item ID is required.');
  }

  const http = getHttpAdapter();

  try {
    const response = await http.patch<{ data: IActionItem }>(
      `/api/review/action-items/${encodeURIComponent(id)}`,
      payload
    );
    return response.data;
  } catch (error) {
    throw new Error(`Failed to update action item ${id}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Delete an action item.
 *
 * Authorization: Only the original creator (createdByUpn match) or admins (admin:write permission) can delete.
 * Also requires {sourceModule}:write permission for the source module.
 *
 * @param id - The action item ID.
 * @returns Promise<void>
 * @throws Error if the item is not found, permission is denied, or network fails.
 *
 * @example
 * await deleteActionItem('action-item-abc123');
 * // Item is hard-deleted from SharePoint.
 */
export async function deleteActionItem(id: string): Promise<void> {
  if (!id || id.trim() === '') {
    throw new Error('Action item ID is required.');
  }

  const http = getHttpAdapter();

  try {
    await http.delete(`/api/review/action-items/${encodeURIComponent(id)}`);
  } catch (error) {
    throw new Error(`Failed to delete action item ${id}: ${error instanceof Error ? error.message : String(error)}`);
  }
}
```

---

## SharePoint List Provisioning Checklist

This checklist guides a SharePoint administrator or developer through the steps needed to provision all required lists and column additions before the first Review Mode deployment.

### Pre-Requisites

- Access to the HB Intel SharePoint site as a **Site Owner**.
- PnP PowerShell module installed (`Install-Module PnP.PowerShell`), or equivalent PnP JS setup.
- ASP.NET Core backend connection string configured for SharePoint REST API access.
- List of all registered modules in the system (e.g., 'estimating', 'business-development', 'project-hub', 'leadership').

### Step 1: Create the `HBIntelActionItems` SharePoint List

**1.1** Navigate to the HB Intel SharePoint site.

**1.2** Click **+ New** → **List** → **Blank list**.

**1.3** Name: `HBIntelActionItems`
  - Description: "Stores all action items created during review sessions across all modules."
  - Keep default columns (Title, Modified, Created, Modified By, Created By).

**1.4** Click **Create**.

### Step 2: Add Custom Columns to `HBIntelActionItems`

Add the following columns in order. Use the column names and types exactly as specified.

**Via PnP PowerShell** (recommended for repeatability):

```powershell
# Connect to the site
$siteUrl = "https://company.sharepoint.com/sites/hb-intel"
Connect-PnPOnline -Url $siteUrl -Interactive

# Add columns to HBIntelActionItems
$list = Get-PnPList -Identity "HBIntelActionItems"

# 1. Description (Multi-line Text)
Add-PnPField -List $list -DisplayName "Description" -InternalName "Description" -Type Note -Rich $true -Notes "Multi-line text field for additional context. Max 4000 chars."

# 2. AssignedToUpn (Single Line Text)
Add-PnPField -List $list -DisplayName "AssignedToUpn" -InternalName "AssignedToUpn" -Type Text -Notes "Azure AD UPN of assignee (e.g., jane.smith@company.com). Leave blank if unassigned."

# 3. AssignedToName (Single Line Text)
Add-PnPField -List $list -DisplayName "AssignedToName" -InternalName "AssignedToName" -Type Text -Notes "Display name of assignee. Auto-populated from Azure AD."

# 4. DueDate (Date)
Add-PnPField -List $list -DisplayName "DueDate" -InternalName "DueDate" -Type DateTime -Notes "Target completion date."

# 5. Status (Choice - Required)
$statusChoices = @("Open", "InProgress", "Done")
Add-PnPField -List $list -DisplayName "Status" -InternalName "Status" -Type Choice -Choices $statusChoices -Default "Open" -Notes "Current status of the action item."

# 6. Priority (Choice - Required)
$priorityChoices = @("High", "Medium", "Low")
Add-PnPField -List $list -DisplayName "Priority" -InternalName "Priority" -Type Choice -Choices $priorityChoices -Default "Medium" -Notes "Priority level for sorting and escalation."

# 7. SourceModule (Single Line Text - Required)
Add-PnPField -List $list -DisplayName "SourceModule" -InternalName "SourceModule" -Type Text -Required $true -Notes "Module identifier (e.g., 'estimating', 'business-development')."

# 8. SourceRecordId (Single Line Text - Required)
Add-PnPField -List $list -DisplayName "SourceRecordId" -InternalName "SourceRecordId" -Type Text -Required $true -Notes "UUID of the source record. Combined with SourceModule, uniquely identifies the record."

# 9. SourceRecordLabel (Single Line Text - Required)
Add-PnPField -List $list -DisplayName "SourceRecordLabel" -InternalName "SourceRecordLabel" -Type Text -Required $true -Notes "Human-readable label of the source record (e.g., 'Ocean Towers — 2026-OCEAN-001')."

# 10. CreatedAt (DateTime - Required, set by API)
Add-PnPField -List $list -DisplayName "CreatedAt" -InternalName "CreatedAt" -Type DateTime -Required $true -Notes "Auto-set by API on creation. ISO 8601 format."

# 11. CreatedByUpn (Single Line Text - Required, set by API)
Add-PnPField -List $list -DisplayName "CreatedByUpn" -InternalName "CreatedByUpn" -Type Text -Required $true -Notes "Auto-set by API from Bearer token identity."
```

**Via SharePoint UI** (if PnP is unavailable):

1. Click **+ Add column** for each column in the table.
2. Fill in Display Name, Internal Name, Type, and any settings.
3. Click **Save**.

### Step 3: Create Indexes on `HBIntelActionItems`

Indexes improve query performance for large lists.

**Via PnP PowerShell**:

```powershell
# Connect to the site
$siteUrl = "https://company.sharepoint.com/sites/hb-intel"
Connect-PnPOnline -Url $siteUrl -Interactive

$list = Get-PnPList -Identity "HBIntelActionItems"

# 1. Primary Index: (SourceRecordId, Status)
Add-PnPListIndexedColumn -List $list -Field "SourceRecordId"
Add-PnPListIndexedColumn -List $list -Field "SourceRecordId" -Second "Status"

# 2. Secondary Index: (SourceModule, Status, DueDate)
Add-PnPListIndexedColumn -List $list -Field "SourceModule"
# Note: PnP may not support 3-column indexes; apply second and tertiary in UI.

# 3. Single Index on CreatedAt
Add-PnPListIndexedColumn -List $list -Field "CreatedAt"
```

**Via SharePoint UI**:

1. Go to **List Settings** → **Indexed columns**.
2. Click **Create a new index**.
3. Select primary column and optional secondary. Click **OK**.

Recommended indexes:
- Primary: `SourceRecordId`
- Secondary: `SourceModule`
- Single: `CreatedAt`

### Step 4: Add `LastReviewedAt` Column to Three Estimating Lists

Add `LastReviewedAt` (DateTime, not required) to each of the three lists:
- `HBIntelActivePursuits`
- `HBIntelActivePreconstruction`
- `HBIntelEstimateLog`

**Via PnP PowerShell**:

```powershell
# Connect
$siteUrl = "https://company.sharepoint.com/sites/hb-intel"
Connect-PnPOnline -Url $siteUrl -Interactive

# List of lists to update
$listNames = @("HBIntelActivePursuits", "HBIntelActivePreconstruction", "HBIntelEstimateLog")

foreach ($listName in $listNames) {
  $list = Get-PnPList -Identity $listName

  # Add LastReviewedAt column
  Add-PnPField -List $list `
    -DisplayName "LastReviewedAt" `
    -InternalName "LastReviewedAt" `
    -Type DateTime `
    -Required $false `
    -Notes "Set by Review Mode API when the user marks this record as reviewed."

  Write-Host "Added LastReviewedAt to $listName"
}
```

**Via SharePoint UI**:

Repeat for each list:
1. Navigate to the list.
2. Click **+ Add column** → **Date** → **DateTime**.
3. Display Name: `LastReviewedAt`.
4. Mark as **Not Required**.
5. Save.

### Step 5: Verify Column Creation and Indexes

**Check columns**:

```powershell
$list = Get-PnPList -Identity "HBIntelActionItems"
Get-PnPField -List $list | Select-Object Title, InternalName, TypeAsString | Format-Table
```

Expected output: All 11 columns (including Title, Modified, Created, Modified By, Created By, plus the 11 custom columns).

**Check indexes**:

```powershell
$list = Get-PnPList -Identity "HBIntelActionItems"
Get-PnPIndexedField -List $list | Format-Table
```

### Step 6: Configure SharePoint REST API Permissions

Ensure the backend service principal or app registration has:
- **Site Collection Admin** role on the HB Intel site, OR
- **Edit** permission on the `HBIntelActionItems` list.

**Via SharePoint Admin Center**:

1. Go to **Active Sites** → select **HB Intel site**.
2. Click **Members**.
3. Add the service principal (e.g., `hb-intel-backend`) with **Site Owner** or **Site Member** role.

### Step 7: Configure List Retention and Audit Settings

**Item-level Permissions**: Disable (not recommended for this list; use API-level permission checks).

**Recycle Bin**: Enable (default, keeps deleted items for 93 days).

**Versioning**: Enable and keep 100 versions (allows audit trail).

**Regional Settings**: Set to **UTC** for all timestamp fields to ensure consistency.

### Step 8: Smoke Test

Run a simple API call to verify the setup:

```bash
# Create a test action item
curl -X POST https://api.hb-intel.company.com/api/review/action-items \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Action Item",
    "status": "Open",
    "priority": "Medium",
    "sourceModule": "estimating",
    "sourceRecordId": "test-123",
    "sourceRecordLabel": "Test Record"
  }'

# Expected response: 201 Created with full action item object.
```

Check SharePoint to confirm the item appears in the list.

---

## Verification Commands

Run these commands after completing the implementation to ensure correctness.

### Build and Type Check

```bash
# Ensure the package builds without errors.
cd packages/review-mode
pnpm build

# Type checking (strict mode).
pnpm typecheck

# Linting.
pnpm lint --fix
```

### Unit Tests (Example)

```bash
# Create unit tests for all data layer functions in:
# packages/review-mode/src/data/__tests__/actionItemsQueries.test.ts

# Run tests:
pnpm test actionItemsQueries
```

Example test structure (pseudocode):

```typescript
describe('actionItemsQueries', () => {
  describe('fetchActionItemsForRecord', () => {
    it('should fetch action items for a record', async () => {
      const items = await fetchActionItemsForRecord('test-record-123');
      expect(items).toBeInstanceOf(Array);
    });

    it('should throw if sourceRecordId is empty', async () => {
      await expect(fetchActionItemsForRecord('')).rejects.toThrow();
    });
  });

  describe('createActionItem', () => {
    it('should create an action item and return the created item with id', async () => {
      const payload: ICreateActionItemPayload = {
        title: 'Test Action',
        status: 'Open',
        priority: 'High',
        sourceModule: 'estimating',
        sourceRecordId: 'test-123',
        sourceRecordLabel: 'Test Record',
      };
      const created = await createActionItem(payload);
      expect(created.id).toBeDefined();
      expect(created.createdAt).toBeDefined();
      expect(created.createdByUpn).toBeDefined();
    });

    it('should throw on missing required fields', async () => {
      const invalid = { title: '' } as ICreateActionItemPayload;
      await expect(createActionItem(invalid)).rejects.toThrow();
    });
  });

  describe('updateActionItem', () => {
    it('should update an action item with partial payload', async () => {
      const updated = await updateActionItem('action-item-123', {
        status: 'InProgress',
      });
      expect(updated.status).toBe('InProgress');
    });

    it('should not allow changes to immutable fields', async () => {
      // Test that sourceModule cannot be changed.
      await expect(
        updateActionItem('action-item-123', { sourceModule: 'other' } as any)
      ).rejects.toThrow();
    });
  });

  describe('deleteActionItem', () => {
    it('should delete an action item', async () => {
      await deleteActionItem('action-item-123');
      // Verify item is deleted (404 on next fetch).
    });

    it('should throw if not authorized', async () => {
      // Test permission denial.
    });
  });
});
```

### Integration Test (end-to-end)

Test the full flow in a controlled environment:

```bash
# 1. Run dev server with mock SharePoint backend.
pnpm dev

# 2. Open dev-harness with Review Mode feature.

# 3. Manually verify:
#    - Create an action item via the UI.
#    - Verify it appears in the list.
#    - Update the status.
#    - Delete the item.
#    - Check SharePoint list for the item.
```

### API Contract Validation

Use tools like **Postman** or **curl** to validate endpoints:

```bash
# 1. GET action items for a record
curl -H "Authorization: Bearer <token>" \
  "https://api.hb-intel.company.com/api/review/action-items?sourceRecordId=test-123"

# Expected: 200 OK with array of action items.

# 2. POST create action item
curl -X POST "https://api.hb-intel.company.com/api/review/action-items" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test",
    "status": "Open",
    "priority": "Medium",
    "sourceModule": "estimating",
    "sourceRecordId": "test-123",
    "sourceRecordLabel": "Test"
  }'

# Expected: 201 Created with full item object (including id, createdAt, createdByUpn).

# 3. PATCH update action item
curl -X PATCH "https://api.hb-intel.company.com/api/review/action-items/{id}" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"status": "InProgress"}'

# Expected: 200 OK with updated item.

# 4. DELETE action item
curl -X DELETE "https://api.hb-intel.company.com/api/review/action-items/{id}" \
  -H "Authorization: Bearer <token>"

# Expected: 204 No Content.
```

### SharePoint List Verification

```powershell
# Connect to site
$siteUrl = "https://company.sharepoint.com/sites/hb-intel"
Connect-PnPOnline -Url $siteUrl -Interactive

# Verify HBIntelActionItems list exists and has correct columns
$list = Get-PnPList -Identity "HBIntelActionItems"
$fields = Get-PnPField -List $list
Write-Host "Columns in HBIntelActionItems:"
$fields | Select-Object Title, InternalName, TypeAsString | Format-Table

# Verify LastReviewedAt column exists in Estimating lists
$estimatingLists = @("HBIntelActivePursuits", "HBIntelActivePreconstruction", "HBIntelEstimateLog")
foreach ($listName in $estimatingLists) {
  $list = Get-PnPList -Identity $listName
  $lastReviewedField = Get-PnPField -List $list -Identity "LastReviewedAt"
  if ($lastReviewedField) {
    Write-Host "$listName: LastReviewedAt column exists ✓"
  } else {
    Write-Host "$listName: LastReviewedAt column MISSING ✗"
  }
}
```

---

## Definition of Done

- [ ] `HBIntelActionItems` SharePoint list provisioned with all 11 columns.
- [ ] Primary and secondary indexes created on `HBIntelActionItems`.
- [ ] `LastReviewedAt` column added to all three Estimating lists.
- [ ] All 5 API endpoints implemented and tested (GET by record, GET by module, POST, PATCH, DELETE).
- [ ] Permission checks enforced: `{sourceModule}:write` for write operations, `admin:write` for cross-module deletes.
- [ ] PATCH extensions added to three existing Estimating endpoints to accept `lastReviewedAt`.
- [ ] `actionItemsQueries.ts` data layer complete with error handling and type safety.
- [ ] All TypeScript payload interfaces (ICreateActionItemPayload, IUpdateActionItemPayload) defined and exported.
- [ ] Unit tests written and passing for all data layer functions.
- [ ] Integration tests verified in dev-harness (create, update, delete, read flows).
- [ ] API responses match specified schema: `{ data: T, meta?: { total: number } }`.
- [ ] Error responses follow format: `{ error: { code: string; message: string; details?: unknown } }`.
- [ ] SharePoint list provisioning checklist executed by admin; all lists and columns confirmed.
- [ ] Smoke test passed: action items can be created, read, updated, deleted via API.
- [ ] Code follows HB Intel style: strict null safety, no `any` types, `@hbc/*` imports.
- [ ] Build succeeds: `pnpm turbo run build`.
- [ ] No linting or type errors: `pnpm lint` and `pnpm typecheck` pass.
- [ ] Documentation complete: this file, API specs, provisioning guide.

<!-- IMPLEMENTATION PROGRESS & NOTES
Task file created: 2026-03-08
Status: pending
Authored by: Claude Code
Dependencies: RM-1 (types), Estimating feature (existing endpoints)
Blocks: RM-5 (UI components), RM-6 (Session summary), RM-7 (Estimating integration)
Next: Implementation of data layer (actionItemsQueries.ts) in RM-5
-->
