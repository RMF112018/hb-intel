# @hbc/acknowledgment

**Version:** 0.1.0
**Status:** Tier-1 Platform Primitive
**Phase:** Foundation Plan Phase 2 (Shared Packages) — SF04

---

## Purpose

`@hbc/acknowledgment` makes structured sign-off a platform primitive applicable to any HB Intel record type. It provides a generic `IAcknowledgmentConfig<T>` contract, three acknowledgment modes (single / parallel / sequential), three UI components, an Azure Function backend, SharePoint list persistence, offline resilience via `@hbc/session-state`, and testing utilities — eliminating per-module sign-off implementations and creating a cross-module audit trail stored in `HbcAcknowledgmentEvents`.

---

## Installation

```bash
pnpm add @hbc/acknowledgment
```

### Peer Dependencies

- `react` ^18.3.0
- `react-dom` ^18.3.0

### Internal Dependencies

- `@hbc/complexity` — complexity tier gating for panel and badge
- `@hbc/ui-kit` — design system components
- `@tanstack/react-query` — data fetching, caching, and optimistic updates

---

## Quick Start

### 1. Define your config

```typescript
import { IAcknowledgmentConfig, ACK_CONTEXT_TYPES } from '@hbc/acknowledgment';

export const myAckConfig: IAcknowledgmentConfig<MyRecord> = {
  label: 'My Sign-Off',
  mode: 'single',
  contextType: ACK_CONTEXT_TYPES.MY_MODULE_THING,
  resolveParties: (record) => [{ userId: record.assigneeId, displayName: record.assigneeName, role: 'Assignee', required: true }],
  resolvePromptMessage: (record, party) => `Confirm receipt of ${record.title}.`,
};
```

### 2. Render the panel in a detail view

```tsx
import { HbcAcknowledgmentPanel } from '@hbc/acknowledgment';

<HbcAcknowledgmentPanel item={record} config={myAckConfig} contextId={record.id} currentUserId={user.id} />
```

### 3. Render the badge in list rows

```tsx
import { HbcAcknowledgmentBadge } from '@hbc/acknowledgment';

<HbcAcknowledgmentBadge item={record} config={myAckConfig} contextId={record.id} />
```

---

## Public API

### Types

| Export | Kind | Description |
|--------|------|-------------|
| `IAcknowledgmentConfig<T>` | Interface | Generic config contract for module-specific acknowledgment setup |
| `IAcknowledgmentState` | Interface | Derived state: events, isComplete, overallStatus, currentSequentialParty |
| `IAcknowledgmentEvent` | Interface | Single sign-off event record (party, status, timestamps, bypass info) |
| `IAcknowledgmentParty` | Interface | Party identity: userId, displayName, role, order, required |
| `AcknowledgmentMode` | Type | `'single' \| 'parallel' \| 'sequential'` |
| `AcknowledgmentStatus` | Type | `'pending' \| 'acknowledged' \| 'declined' \| 'bypassed'` |
| `IUseAcknowledgmentReturn` | Interface | Return type of `useAcknowledgment` hook |
| `ISubmitAcknowledgmentParams` | Interface | Parameters for the `submit` function |
| `IUseAcknowledgmentGateReturn` | Interface | Return type of `useAcknowledgmentGate` hook |
| `ISubmitAcknowledgmentRequest` | Interface | API request payload for POST /api/acknowledgments |
| `ISubmitAcknowledgmentResponse` | Interface | API response payload |
| `IAcknowledgmentQueueEntry` | Interface | Offline queue entry shape (D-02) |
| `AckContextType` | Type | Union of all registered context type values |

### Config

| Export | Description |
|--------|-------------|
| `ACK_CONTEXT_TYPES` | Typed const registry of 7 context identifiers (D-08) |

### Utils

| Export | Description |
|--------|-------------|
| `computeIsComplete` | Determines if all required parties have acknowledged |
| `computeOverallStatus` | Computes aggregate status (pending/partial/acknowledged/declined) |
| `resolveCurrentSequentialParty` | Finds the next party in sequential mode |
| `deriveAcknowledgmentState` | Derives full `IAcknowledgmentState` from raw data |
| `isNetworkFailure` | Detects network vs. logical failure for offline queue routing (D-02) |
| `DEFAULT_CONFIRMATION_PHRASE` | `'I CONFIRM'` (D-03) |
| `DECLINE_REASON_MIN_LENGTH` | `10` (D-04) |

### Hooks

| Export | Description |
|--------|-------------|
| `useAcknowledgment` | Fetches state, submits acknowledgments, handles optimistic updates and offline queue |
| `ackKeys` | TanStack Query key factory for acknowledgment queries |
| `useAcknowledgmentGate` | Returns current user eligibility (`canAcknowledge`, `isCurrentTurn`, `party`) |
| `useAcknowledgmentQueueReplay` | Replays offline-queued acknowledgments on reconnect |

### Components

| Export | Description |
|--------|-------------|
| `HbcAcknowledgmentPanel` | Full sign-off panel — complexity-gated (Essential: CTA, Standard: party list, Expert: audit trail) |
| `HbcAcknowledgmentBadge` | Compact badge for list rows — floor = Standard; Expert adds tooltip (D-07) |
| `HbcAcknowledgmentModal` | Confirmation/decline modal — phrase validation (D-03), decline reasons (D-04) |

---

## Testing Sub-Path: `@hbc/acknowledgment/testing`

```typescript
import {
  createMockAckConfig,
  createMockAckState,
  mockAckStates,
  mockUseAcknowledgment,
  createAckWrapper,
} from '@hbc/acknowledgment/testing';
```

| Export | Description |
|--------|-------------|
| `createMockAckConfig<T>` | Factory for test `IAcknowledgmentConfig` instances |
| `createMockAckState` | Factory for test `IAcknowledgmentState` instances |
| `mockAckStates` | 6 canonical states: `pending`, `partialParallel`, `complete`, `declined`, `bypassed`, `offlinePending` |
| `mockUseAcknowledgment` | Pre-configured mock for the `useAcknowledgment` hook |
| `createAckWrapper` | Returns `{ wrapper, queryClient }` for `renderHook` tests |

Testing utilities have zero production bundle impact.

---

## Server Sub-Path: `@hbc/acknowledgment/server`

Server-side exports for the Azure Function implementation:

- `IAcknowledgmentService` — port interface for acknowledgment persistence
- `MockAcknowledgmentService` — in-memory implementation for local development
- Azure Function handler for `POST /api/acknowledgments` and `GET /api/acknowledgments`

---

## Complexity Integration (D-07)

### `HbcAcknowledgmentPanel`

| Tier | Rendered Content |
|------|------------------|
| Essential | Action CTA only: "Your acknowledgment is required." + Acknowledge / Decline buttons |
| Standard | Full party list: avatar, name, role, status badge, timestamp per party |
| Expert | Full party list + complete audit trail: prompt message, IP address, all timestamps |

### `HbcAcknowledgmentBadge`

| Tier | Rendered Content |
|------|------------------|
| Essential | Same as Standard (floor = Standard per D-07) |
| Standard | Status icon + "N of M acknowledged" count |
| Expert | Standard content + hover tooltip listing pending party names |

---

## Cross-References

- [ADR-0092 — Acknowledgment as a Platform Primitive](../../docs/architecture/adr/ADR-0092-acknowledgment-platform-primitive.md)
- [Adoption Guide](../../docs/how-to/developer/acknowledgment-adoption-guide.md)
- [SF04 Master Plan](../../docs/architecture/plans/shared-features/SF04-Acknowledgment.md)
- [Complexity Dial](../complexity/README.md)
