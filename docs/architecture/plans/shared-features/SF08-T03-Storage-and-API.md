# SF08-T03 — Storage and API Layer: `@hbc/workflow-handoff`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-08-Shared-Feature-Workflow-Handoff.md`
**Decisions Applied:** D-01 (SharePoint list + Azure Functions), D-02 (state machine), D-05 (BIC transfer), D-06 (document URL migration), D-07 (rejection terminal state)
**Estimated Effort:** 0.75 sprint-weeks
**Depends On:** T01 (scaffold), T02 (contracts)

> **Doc Classification:** Canonical Normative Plan — SF08-T03 storage and API layer task; sub-plan of `SF08-Workflow-Handoff.md`.

---

## Objective

Define the SharePoint list schema for `HBC_HandoffPackages`, specify the Azure Functions API contract covering the full handoff lifecycle, and implement `HandoffApi.ts` — the single abstraction layer that all hooks and components use.

---

## 3-Line Plan

1. Define `HBC_HandoffPackages` SharePoint list schema with all required columns and provisioning notes.
2. Define the Azure Functions route contract (6 routes covering the full lifecycle).
3. Implement `src/api/HandoffApi.ts` with full CRUD and the list item mapper.

---

## SharePoint List Schema: `HBC_HandoffPackages`

Provisioned per HB Intel SharePoint site by the admin provisioning saga (existing saga must be extended).

### List Settings

| Setting | Value |
|---|---|
| List title | `HBC_HandoffPackages` |
| Versioning | Disabled (lifecycle managed by status column transitions) |
| Allow attachments | No |
| Item-level permissions | Standard — site members read; only sender or site owner can update status |

### Columns

| Internal Name | Type | Required | Notes |
|---|---|---|---|
| `HandoffId` | Single line of text | Yes | UUID; set by Azure Function at creation |
| `SourceModule` | Single line of text | Yes | e.g., `business-development` |
| `SourceRecordType` | Single line of text | Yes | e.g., `bd-scorecard` |
| `SourceRecordId` | Single line of text | Yes | Source record UUID |
| `DestinationModule` | Single line of text | Yes | e.g., `estimating` |
| `DestinationRecordType` | Single line of text | Yes | e.g., `estimating-pursuit` |
| `SourceSnapshotJson` | Multiple lines of text | Yes | JSON snapshot; empty string when overflow to file (D-01) |
| `SourceSnapshotFileUrl` | Single line of text | No | Azure Blob URL when snapshot >255KB (D-01) |
| `DestinationSeedDataJson` | Multiple lines of text | Yes | JSON-serialized `Partial<TDest>` |
| `DocumentsJson` | Multiple lines of text | Yes | JSON-serialized `IHandoffDocument[]` |
| `ContextNotesJson` | Multiple lines of text | Yes | JSON-serialized `IHandoffContextNote[]`; editable by sender before send |
| `SenderUserId` | Single line of text | Yes | Azure AD Object ID |
| `SenderDisplayName` | Single line of text | Yes | |
| `SenderRole` | Single line of text | Yes | |
| `RecipientUserId` | Single line of text | Yes | Set at assembly; may be overridden in Composer Step 3 |
| `RecipientDisplayName` | Single line of text | Yes | |
| `RecipientRole` | Single line of text | Yes | |
| `Status` | Choice | Yes | Options: `draft`, `sent`, `received`, `acknowledged`, `rejected`; default `draft` |
| `SentAt` | Single line of text | No | ISO 8601 |
| `AcknowledgedAt` | Single line of text | No | ISO 8601 |
| `RejectedAt` | Single line of text | No | ISO 8601 |
| `RejectionReason` | Multiple lines of text | No | Required on rejection (D-07) |
| `CreatedDestinationRecordId` | Single line of text | No | Set by `onAcknowledged` callback result |
| `CreatedAt` | Single line of text | Yes | ISO 8601; set by Function at creation |
| `RouteLabel` | Single line of text | Yes | Human-readable route name (e.g., `BD Win → Estimating Pursuit`) |

### Indexes

- `RecipientUserId` + `Status` (compound — `useHandoffInbox` query)
- `SenderUserId` + `Status` (compound — `useHandoffStatus` query)
- `SourceRecordId` (single — `HbcHandoffStatusBadge` lookup)

---

## Azure Functions API Contract

### Base URL

```
/api/workflow-handoff
```

### Routes

| Method | Route | Purpose |
|---|---|---|
| `POST` | `/api/workflow-handoff` | Create a new handoff package (status: `draft`) |
| `GET` | `/api/workflow-handoff/:handoffId` | Get a single handoff package |
| `GET` | `/api/workflow-handoff/inbox` | List all pending packages for the current user (as recipient) |
| `GET` | `/api/workflow-handoff/outbox` | List all outbound packages for the current user (as sender) |
| `POST` | `/api/workflow-handoff/:handoffId/send` | Transition `draft → sent`; fire Immediate notification (D-05) |
| `POST` | `/api/workflow-handoff/:handoffId/receive` | Transition `sent → received` (first-view signal; no body required) |
| `POST` | `/api/workflow-handoff/:handoffId/acknowledge` | Transition `received → acknowledged`; calls `onAcknowledged` server-side |
| `POST` | `/api/workflow-handoff/:handoffId/reject` | Transition `received → rejected`; calls `onRejected` server-side |
| `PATCH` | `/api/workflow-handoff/:handoffId/notes` | Update context notes (sender only; draft or sent status only) |

---

## `src/api/HandoffApi.ts`

```typescript
import type {
  IHandoffPackage,
  IHandoffDocument,
  IHandoffContextNote,
  IRawHandoffListItem,
  HandoffStatus,
} from '../types/IWorkflowHandoff';
import type { IBicOwner } from '@hbc/bic-next-move';
import { HANDOFF_API_BASE } from '../constants/handoffDefaults';

// ─────────────────────────────────────────────────────────────────────────────
// Internal fetch helper
// ─────────────────────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${HANDOFF_API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`HandoffApi error ${response.status}: ${text}`);
  }
  return response.json() as Promise<T>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Mapper: raw list item → IHandoffPackage (D-01)
// ─────────────────────────────────────────────────────────────────────────────

function mapListItem<TSource, TDest>(raw: IRawHandoffListItem): IHandoffPackage<TSource, TDest> {
  let sourceSnapshot: TSource;
  try {
    sourceSnapshot = JSON.parse(raw.SourceSnapshotJson) as TSource;
  } catch {
    // Snapshot stored in file — HandoffApi.get handles file fetch transparently (D-01)
    sourceSnapshot = {} as TSource;
  }

  let destinationSeedData: Partial<TDest> = {};
  try {
    destinationSeedData = JSON.parse(raw.DestinationSeedDataJson) as Partial<TDest>;
  } catch { /* empty */ }

  let documents: IHandoffDocument[] = [];
  try {
    documents = JSON.parse(raw.DocumentsJson) as IHandoffDocument[];
  } catch { /* empty */ }

  let contextNotes: IHandoffContextNote[] = [];
  try {
    contextNotes = JSON.parse(raw.ContextNotesJson) as IHandoffContextNote[];
  } catch { /* empty */ }

  return {
    handoffId: raw.HandoffId,
    sourceModule: raw.SourceModule,
    sourceRecordType: raw.SourceRecordType,
    sourceRecordId: raw.SourceRecordId,
    destinationModule: raw.DestinationModule,
    destinationRecordType: raw.DestinationRecordType,
    sourceSnapshot,
    destinationSeedData,
    documents,
    contextNotes,
    sender: {
      userId: raw.SenderUserId,
      displayName: raw.SenderDisplayName,
      role: raw.SenderRole,
    },
    recipient: {
      userId: raw.RecipientUserId,
      displayName: raw.RecipientDisplayName,
      role: raw.RecipientRole,
    },
    status: raw.Status,
    sentAt: raw.SentAt ?? null,
    acknowledgedAt: raw.AcknowledgedAt ?? null,
    rejectedAt: raw.RejectedAt ?? null,
    rejectionReason: raw.RejectionReason ?? null,
    createdDestinationRecordId: raw.CreatedDestinationRecordId ?? null,
    createdAt: raw.CreatedAt,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// HandoffApi — public surface
// ─────────────────────────────────────────────────────────────────────────────

export const HandoffApi = {
  /**
   * Create a new handoff package in `draft` status.
   * The package is assembled by `usePrepareHandoff` before calling this.
   */
  async create<TSource, TDest>(
    input: Omit<IHandoffPackage<TSource, TDest>,
      'handoffId' | 'status' | 'sentAt' | 'acknowledgedAt' | 'rejectedAt' |
      'rejectionReason' | 'createdDestinationRecordId' | 'createdAt'>
  ): Promise<IHandoffPackage<TSource, TDest>> {
    const raw = await apiFetch<IRawHandoffListItem>('', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return mapListItem<TSource, TDest>(raw);
  },

  /**
   * Get a single handoff package by ID.
   * When SourceSnapshotFileUrl is set, the Function fetches the file and inlines it (D-01).
   * When documents exist, HandoffApi checks @hbc/sharepoint-docs URL migration map (D-06).
   */
  async get<TSource, TDest>(handoffId: string): Promise<IHandoffPackage<TSource, TDest>> {
    const raw = await apiFetch<IRawHandoffListItem>(`/${handoffId}`);
    return mapListItem<TSource, TDest>(raw);
  },

  /**
   * List pending handoff packages for the current user as recipient.
   * Returns only `sent` and `received` status packages.
   */
  async inbox<TSource = unknown, TDest = unknown>(): Promise<IHandoffPackage<TSource, TDest>[]> {
    const items = await apiFetch<IRawHandoffListItem[]>('/inbox');
    return items.map((raw) => mapListItem<TSource, TDest>(raw));
  },

  /**
   * List outbound handoff packages for the current user as sender.
   * Returns all statuses for status tracking.
   */
  async outbox<TSource = unknown, TDest = unknown>(): Promise<IHandoffPackage<TSource, TDest>[]> {
    const items = await apiFetch<IRawHandoffListItem[]>('/outbox');
    return items.map((raw) => mapListItem<TSource, TDest>(raw));
  },

  /**
   * Transmit the handoff package (draft → sent) (D-02, D-05).
   * Azure Function: fires Immediate notification to recipient; BIC update signal available.
   */
  async send<TSource, TDest>(handoffId: string): Promise<IHandoffPackage<TSource, TDest>> {
    const raw = await apiFetch<IRawHandoffListItem>(`/${handoffId}/send`, { method: 'POST' });
    return mapListItem<TSource, TDest>(raw);
  },

  /**
   * Mark the package as received (sent → received) (D-02).
   * Called automatically when the recipient opens the package in HbcHandoffReceiver.
   * No notification fired — this is an implicit state transition.
   */
  async markReceived<TSource, TDest>(handoffId: string): Promise<IHandoffPackage<TSource, TDest>> {
    const raw = await apiFetch<IRawHandoffListItem>(`/${handoffId}/receive`, { method: 'POST' });
    return mapListItem<TSource, TDest>(raw);
  },

  /**
   * Acknowledge the handoff (received → acknowledged) (D-02, D-05).
   * Azure Function calls the consuming module's onAcknowledged handler server-side.
   * Returns updated package with createdDestinationRecordId set.
   */
  async acknowledge<TSource, TDest>(handoffId: string): Promise<IHandoffPackage<TSource, TDest>> {
    const raw = await apiFetch<IRawHandoffListItem>(`/${handoffId}/acknowledge`, { method: 'POST' });
    return mapListItem<TSource, TDest>(raw);
  },

  /**
   * Reject the handoff (received → rejected) (D-07).
   * rejectionReason is required. Azure Function calls onRejected handler.
   * Terminal state — rejected packages cannot transition further (D-07).
   */
  async reject<TSource, TDest>(
    handoffId: string,
    rejectionReason: string
  ): Promise<IHandoffPackage<TSource, TDest>> {
    const raw = await apiFetch<IRawHandoffListItem>(`/${handoffId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ rejectionReason }),
    });
    return mapListItem<TSource, TDest>(raw);
  },

  /**
   * Update context notes on a draft or sent package (sender only).
   * Notes can be edited after sending but before acknowledgment.
   */
  async updateContextNotes<TSource, TDest>(
    handoffId: string,
    contextNotes: IHandoffContextNote[]
  ): Promise<IHandoffPackage<TSource, TDest>> {
    const raw = await apiFetch<IRawHandoffListItem>(`/${handoffId}/notes`, {
      method: 'PATCH',
      body: JSON.stringify({ contextNotes }),
    });
    return mapListItem<TSource, TDest>(raw);
  },
} as const;

export type IHandoffApi = typeof HandoffApi;
```

---

## Azure Function Implementation Notes

### `handoffCreate.ts` (POST /api/workflow-handoff)

- Generate `HandoffId` as UUID
- Set `Status` to `'draft'`, `CreatedAt` to ISO 8601 now
- Serialize `sourceSnapshot` — if `JSON.stringify(sourceSnapshot).length > HANDOFF_SNAPSHOT_INLINE_MAX_BYTES`, upload to Azure Blob and set `SourceSnapshotFileUrl`; set `SourceSnapshotJson = ''`
- Return created list item

### `handoffSend.ts` (POST /api/workflow-handoff/:id/send)

- Validate current status is `'draft'`
- Set `Status = 'sent'`, `SentAt` = now
- Register `Immediate`-tier notification to `RecipientUserId` via notification-intelligence
- Return updated list item
- Note: BIC transfer is handled by the consuming module's BIC config reading the outbound handoff status — not triggered server-side here (architecture boundary)

### `handoffAcknowledge.ts` (POST /api/workflow-handoff/:id/acknowledge)

- Validate current status is `'received'` (or `'sent'` — recipient may not have explicitly opened it)
- Set `Status = 'acknowledged'`, `AcknowledgedAt` = now
- Call the consuming module's `onAcknowledged` callback (registered in a server-side handler registry)
- Set `CreatedDestinationRecordId` from callback result
- Register `Watch`-tier notification to `SenderUserId`
- Return updated list item

### `handoffReject.ts` (POST /api/workflow-handoff/:id/reject)

- Validate current status is `'received'` or `'sent'`
- Validate `rejectionReason` is present and non-empty (D-07)
- Set `Status = 'rejected'`, `RejectedAt` = now, `RejectionReason` = reason
- Call the consuming module's `onRejected` callback
- Register `Watch`-tier notification to `SenderUserId` with rejection reason in message body
- Return updated list item

### `handoffGetWithFileSnapshot.ts` (GET /api/workflow-handoff/:id)

- Fetch list item
- If `SourceSnapshotFileUrl` is set, fetch the Blob and set `SourceSnapshotJson` before returning
- For each document URL in `DocumentsJson`, check `@hbc/sharepoint-docs` migration map and update stale URLs before returning (D-06)
- Return hydrated list item

---

## Verification Commands

```bash
# Type-check
pnpm --filter @hbc/workflow-handoff check-types

# Build
pnpm --filter @hbc/workflow-handoff build

# Run API tests (written in T08)
pnpm --filter @hbc/workflow-handoff test -- --grep "HandoffApi"

# Smoke test against local dev environment
curl -X POST http://localhost:7071/api/workflow-handoff \
  -H "Content-Type: application/json" \
  -d '{"sourceModule":"test","sourceRecordType":"test","sourceRecordId":"001","destinationModule":"test2","destinationRecordType":"test2","sourceSnapshot":{},"destinationSeedData":{},"documents":[],"contextNotes":[],"sender":{"userId":"u1","displayName":"Test","role":"Dev"},"recipient":{"userId":"u2","displayName":"Test2","role":"Dev2"},"routeLabel":"Test Route"}' \
  | jq .status
# Expected: "draft"
```

<!-- IMPLEMENTATION PROGRESS & NOTES
SF08-T03 not yet started.
Next: SF08-T04 (Hooks)
-->
