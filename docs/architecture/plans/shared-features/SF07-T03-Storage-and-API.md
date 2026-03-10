# SF07-T03 — Storage and API Layer: `@hbc/field-annotations`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-07-Shared-Feature-Field-Annotations.md`
**Decisions Applied:** D-01 (SharePoint list + Azure Functions), D-02 (scope model), D-07 (reply cap), D-08 (assignment model)
**Estimated Effort:** 0.75 sprint-weeks
**Depends On:** T01 (scaffold), T02 (TypeScript contracts)

> **Doc Classification:** Canonical Normative Plan — SF07-T03 storage and API layer task; sub-plan of `SF07-Field-Annotations.md`.

---

## Objective

Implement the SharePoint list schema (provisioned via the existing provisioning saga), define the Azure Functions API contract, and implement `AnnotationApi.ts` — the single abstraction layer that all hooks use for annotation CRUD operations.

---

## 3-Line Plan

1. Define the SharePoint list schema for `HBC_FieldAnnotations` and its provisioning extension.
2. Define the Azure Functions API contract (routes, request/response shapes).
3. Implement `src/api/AnnotationApi.ts` with all CRUD methods and the list item mapper.

---

## SharePoint List Schema: `HBC_FieldAnnotations`

This list is provisioned per HB Intel SharePoint site by the existing admin provisioning saga. The provisioning saga must be extended (separate task) to create this list during site setup.

### List Settings

| Setting | Value |
|---|---|
| List title | `HBC_FieldAnnotations` |
| List URL | `Lists/HBC_FieldAnnotations` |
| Versioning | Disabled (annotation history is self-contained in the list item) |
| Allow attachments | No |
| Audience | Site members only (no anonymous access) |
| Item-level permissions | Standard (all members can read; only author or site owner can update status) |

### Columns

| Internal Name | Type | Required | Notes |
|---|---|---|---|
| `AnnotationId` | Single line of text | Yes | UUID; set by Azure Function at creation |
| `RecordType` | Single line of text | Yes | e.g., `bd-scorecard` |
| `RecordId` | Single line of text | Yes | Parent record UUID |
| `FieldKey` | Single line of text | Yes | Stable field key constant |
| `FieldLabel` | Single line of text | Yes | Display label captured at creation |
| `Intent` | Choice | Yes | Options: `comment`, `clarification-request`, `flag-for-revision` |
| `Status` | Choice | Yes | Options: `open`, `resolved`, `withdrawn`; default `open` |
| `AuthorId` | Single line of text | Yes | Azure AD Object ID |
| `AuthorName` | Single line of text | Yes | Display name |
| `AuthorRole` | Single line of text | Yes | Role title |
| `AssignedToId` | Single line of text | No | Azure AD Object ID of assignee |
| `AssignedToName` | Single line of text | No | Display name |
| `AssignedToRole` | Single line of text | No | Role title |
| `Body` | Multiple lines of text | Yes | Annotation text; plain text only |
| `CreatedAt` | Single line of text | Yes | ISO 8601; set by Azure Function |
| `CreatedAtVersion` | Number | No | Parent record version at creation (D-04) |
| `ResolvedAt` | Single line of text | No | ISO 8601 |
| `ResolvedById` | Single line of text | No | Azure AD Object ID |
| `ResolvedByName` | Single line of text | No | Display name |
| `ResolvedByRole` | Single line of text | No | Role title |
| `ResolutionNote` | Multiple lines of text | No | Required by config for certain intents |
| `ResolvedAtVersion` | Number | No | Parent record version at resolution (D-04) |
| `RepliesJson` | Multiple lines of text | No | JSON-serialized `IAnnotationReply[]`; max 50 entries enforced by Function |

### Indexes

Create the following indexed columns for OData query performance:

- `RecordType` + `RecordId` (compound — most common query pattern)
- `Status` (filtered reads for open-only queries)
- `AssignedToId` (My Work Feed query)

---

## Azure Functions API Contract

All annotation operations route through Azure Functions. Client components never call SharePoint REST directly.

### Base URL

```
/api/field-annotations
```

### Routes

| Method | Route | Purpose |
|---|---|---|
| `GET` | `/api/field-annotations` | List annotations for a record (filtered by recordType + recordId) |
| `GET` | `/api/field-annotations/:annotationId` | Get single annotation |
| `POST` | `/api/field-annotations` | Create new annotation |
| `POST` | `/api/field-annotations/:annotationId/replies` | Add reply to existing annotation (D-07) |
| `PATCH` | `/api/field-annotations/:annotationId/resolve` | Resolve annotation |
| `PATCH` | `/api/field-annotations/:annotationId/withdraw` | Withdraw annotation |

### Query Parameters (GET /api/field-annotations)

| Parameter | Type | Required | Notes |
|---|---|---|---|
| `recordType` | string | Yes | Filter by record type namespace |
| `recordId` | string | Yes | Filter by parent record ID |
| `fieldKey` | string | No | Filter to single field (useFieldAnnotation hook) |
| `status` | `'open'` \| `'resolved'` \| `'all'` | No | Default `'all'` |

### Request/Response Shapes

```typescript
// POST /api/field-annotations — Create annotation
interface CreateAnnotationRequest {
  recordType: string;
  recordId: string;
  fieldKey: string;
  fieldLabel: string;
  intent: AnnotationIntent;
  body: string;
  assignedTo?: { userId: string; displayName: string; role: string } | null;
  createdAtVersion?: number | null;
}
// Response: IFieldAnnotation (201 Created)

// POST /api/field-annotations/:annotationId/replies — Add reply
interface AddReplyRequest {
  body: string;
}
// Response: IAnnotationReply (201 Created)
// Azure Function enforces ANNOTATION_MAX_REPLIES (50); returns 422 if exceeded

// PATCH /api/field-annotations/:annotationId/resolve — Resolve
interface ResolveAnnotationRequest {
  resolutionNote?: string | null;
  resolvedAtVersion?: number | null;
}
// Response: IFieldAnnotation (200 OK)

// PATCH /api/field-annotations/:annotationId/withdraw — Withdraw
// No request body required
// Response: IFieldAnnotation (200 OK)
```

---

## `src/api/AnnotationApi.ts`

```typescript
import type {
  IFieldAnnotation,
  IAnnotationReply,
  IRawAnnotationListItem,
  ICreateAnnotationInput,
  IAddReplyInput,
  IResolveAnnotationInput,
  IWithdrawAnnotationInput,
} from '../types/IFieldAnnotation';
import { ANNOTATION_API_BASE } from '../constants/annotationDefaults';

// ─────────────────────────────────────────────────────────────────────────────
// Internal fetch helper
// ─────────────────────────────────────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${ANNOTATION_API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`AnnotationApi error ${response.status}: ${text}`);
  }

  return response.json() as Promise<T>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Mapper: raw SharePoint list item → IFieldAnnotation (D-01)
// ─────────────────────────────────────────────────────────────────────────────

function mapListItemToAnnotation(raw: IRawAnnotationListItem): IFieldAnnotation {
  let replies: IAnnotationReply[] = [];
  try {
    replies = raw.RepliesJson ? (JSON.parse(raw.RepliesJson) as IAnnotationReply[]) : [];
  } catch {
    replies = [];
  }

  return {
    annotationId: raw.AnnotationId,
    recordType: raw.RecordType,
    recordId: raw.RecordId,
    fieldKey: raw.FieldKey,
    fieldLabel: raw.FieldLabel,
    intent: raw.Intent,
    status: raw.Status,
    author: {
      userId: raw.AuthorId,
      displayName: raw.AuthorName,
      role: raw.AuthorRole,
    },
    assignedTo:
      raw.AssignedToId && raw.AssignedToName && raw.AssignedToRole
        ? {
            userId: raw.AssignedToId,
            displayName: raw.AssignedToName,
            role: raw.AssignedToRole,
          }
        : null,
    body: raw.Body,
    createdAt: raw.CreatedAt,
    createdAtVersion: raw.CreatedAtVersion ?? null,
    resolvedAt: raw.ResolvedAt ?? null,
    resolvedBy:
      raw.ResolvedById && raw.ResolvedByName && raw.ResolvedByRole
        ? {
            userId: raw.ResolvedById,
            displayName: raw.ResolvedByName,
            role: raw.ResolvedByRole,
          }
        : null,
    resolutionNote: raw.ResolutionNote ?? null,
    resolvedAtVersion: raw.ResolvedAtVersion ?? null,
    replies,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// AnnotationApi — public surface consumed by hooks
// ─────────────────────────────────────────────────────────────────────────────

export const AnnotationApi = {
  /**
   * List all annotations for a record, optionally filtered by fieldKey and status.
   *
   * @param recordType - Record type namespace (e.g., 'bd-scorecard')
   * @param recordId   - Parent record UUID
   * @param options    - Optional filters: fieldKey, status
   */
  async list(
    recordType: string,
    recordId: string,
    options?: { fieldKey?: string; status?: 'open' | 'resolved' | 'all' }
  ): Promise<IFieldAnnotation[]> {
    const params = new URLSearchParams({ recordType, recordId });
    if (options?.fieldKey) params.set('fieldKey', options.fieldKey);
    if (options?.status) params.set('status', options.status);

    const raw = await apiFetch<IRawAnnotationListItem[]>(`?${params.toString()}`);
    return raw.map(mapListItemToAnnotation);
  },

  /**
   * Fetch a single annotation by ID.
   */
  async get(annotationId: string): Promise<IFieldAnnotation> {
    const raw = await apiFetch<IRawAnnotationListItem>(`/${annotationId}`);
    return mapListItemToAnnotation(raw);
  },

  /**
   * Create a new annotation on a specific field (D-02, D-08).
   */
  async create(input: ICreateAnnotationInput): Promise<IFieldAnnotation> {
    const raw = await apiFetch<IRawAnnotationListItem>('', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return mapListItemToAnnotation(raw);
  },

  /**
   * Add a flat reply to an existing annotation thread (D-07).
   * Throws if the reply cap (50) has been reached on the server.
   */
  async addReply(input: IAddReplyInput): Promise<IAnnotationReply> {
    const reply = await apiFetch<IAnnotationReply>(
      `/${input.annotationId}/replies`,
      {
        method: 'POST',
        body: JSON.stringify({ body: input.body }),
      }
    );
    return reply;
  },

  /**
   * Resolve an annotation, optionally with a resolution note (D-08).
   */
  async resolve(input: IResolveAnnotationInput): Promise<IFieldAnnotation> {
    const raw = await apiFetch<IRawAnnotationListItem>(
      `/${input.annotationId}/resolve`,
      {
        method: 'PATCH',
        body: JSON.stringify({
          resolutionNote: input.resolutionNote ?? null,
          resolvedAtVersion: input.resolvedAtVersion ?? null,
        }),
      }
    );
    return mapListItemToAnnotation(raw);
  },

  /**
   * Withdraw an annotation (retract by original author before resolution).
   * Triggers Watch-tier notification to previous assignee if one exists (D-08).
   */
  async withdraw(input: IWithdrawAnnotationInput): Promise<IFieldAnnotation> {
    const raw = await apiFetch<IRawAnnotationListItem>(
      `/${input.annotationId}/withdraw`,
      { method: 'PATCH' }
    );
    return mapListItemToAnnotation(raw);
  },
} as const;

export type IAnnotationApi = typeof AnnotationApi;
```

---

## Azure Function Implementation Notes

The Azure Functions themselves are implemented in `apps/azure-functions/src/functions/`. The following scaffolding notes guide the Function author:

### `fieldAnnotationsList.ts` (GET /api/field-annotations)

- Use SharePoint REST `_api/web/lists/getByTitle('HBC_FieldAnnotations')/items` with OData `$filter` on `RecordType eq '...' and RecordId eq '...'`
- Add `$filter=Status eq 'open'` when `status=open` is requested
- Add `and FieldKey eq '...'` when `fieldKey` parameter is provided
- Return array of raw items; client maps via `mapListItemToAnnotation`

### `fieldAnnotationsCreate.ts` (POST /api/field-annotations)

- Generate `AnnotationId` as UUID (crypto.randomUUID())
- Set `CreatedAt` as ISO 8601 now
- Set `Status` to `'open'`
- After creating the list item: register notification event (D-08):
  - If `assignedTo` is set: Immediate-tier event to `assignedTo.userId`
  - If not assigned: Immediate-tier event to record owner (looked up via provisioning context)

### `fieldAnnotationsAddReply.ts` (POST /api/field-annotations/:id/replies)

- Fetch existing annotation, parse `RepliesJson`
- Enforce `ANNOTATION_MAX_REPLIES` (50) — return 422 if exceeded
- Append new reply with generated `replyId`, `createdAt`, and caller's identity
- Re-serialize `RepliesJson` and update the list item
- Return the new `IAnnotationReply` only (not the full annotation)

### `fieldAnnotationsResolve.ts` (PATCH /api/field-annotations/:id/resolve)

- Set `Status` to `'resolved'`, `ResolvedAt` to ISO 8601 now, `ResolvedById/Name/Role` from caller identity
- Store `ResolutionNote` and `ResolvedAtVersion` from request body
- After update: register Watch-tier notification event to original `AuthorId` (D-08)
- Return updated annotation mapped to `IFieldAnnotation`

### `fieldAnnotationsWithdraw.ts` (PATCH /api/field-annotations/:id/withdraw)

- Set `Status` to `'withdrawn'`, `ResolvedAt` to ISO 8601 now, `ResolvedById/Name/Role` from caller identity
- If annotation had `AssignedToId`: register Watch-tier notification to `AssignedToId` (D-08)
- Return updated annotation mapped to `IFieldAnnotation`

---

## Verification Commands

```bash
# Type-check AnnotationApi
pnpm --filter @hbc/field-annotations check-types

# Build and confirm exports
pnpm --filter @hbc/field-annotations build

# Run AnnotationApi unit tests (written in T08)
pnpm --filter @hbc/field-annotations test -- --grep "AnnotationApi"

# Smoke test against local dev environment (requires Azure Functions running locally)
curl -s "http://localhost:7071/api/field-annotations?recordType=bd-scorecard&recordId=test-001" | jq length
```

<!-- IMPLEMENTATION PROGRESS & NOTES
SF07-T03 not yet started.
Next: SF07-T04 (Hooks)
-->
