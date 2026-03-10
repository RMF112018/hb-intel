# @hbc/workflow-handoff

Structured, auditable cross-module handoff primitive for the HB Intel platform.

## Overview

`@hbc/workflow-handoff` implements the 5-state handoff machine (`draft → sent → received → acknowledged | rejected`) and all associated UI components, hooks, and API client. It is the single platform primitive for any cross-module transfer of record custody — BD → Estimating, Estimating → Project Hub, and future routes.

**Locked ADR:** ADR-0097 — `docs/architecture/adr/ADR-0097-workflow-handoff-platform-primitive.md`

---

## Installation

This package is internal to the HB Intel monorepo. Add it as a workspace dependency:

```json
{
  "dependencies": {
    "@hbc/workflow-handoff": "workspace:*"
  }
}
```

---

## Quick Start

```typescript
import type { IHandoffConfig } from '@hbc/workflow-handoff';
import { HbcHandoffComposer, HbcHandoffReceiver, HbcHandoffStatusBadge } from '@hbc/workflow-handoff';

// 1. Implement IHandoffConfig<TSource, TDest> for your route
const myHandoffConfig: IHandoffConfig<ISourceRecord, IDestRecord> = {
  sourceModule: 'source-module',
  sourceRecordType: 'source-record',
  destinationModule: 'dest-module',
  destinationRecordType: 'dest-record',
  routeLabel: 'Source Win → Dest Record',
  acknowledgeDescription: 'A Dest Record will be created from this data.',
  mapSourceToDestination: (src) => ({ /* ... */ }),
  resolveDocuments: async (src) => [],
  resolveRecipient: (src) => ({ userId: src.recipientId, displayName: src.recipientName, role: 'PM' }),
  validateReadiness: (src) => src.isReady ? null : 'Record not ready for handoff.',
  onAcknowledged: async (pkg) => { /* create dest record */ return { destinationRecordId: 'new-id' }; },
  onRejected: async (pkg) => { /* return to sender */ },
};

// 2. Mount composer (sender side)
<HbcHandoffComposer config={myHandoffConfig} sourceRecord={record} onClose={() => {}} />

// 3. Mount receiver (recipient side)
<HbcHandoffReceiver handoffId={handoffId} config={myHandoffConfig} onClose={() => {}} />

// 4. Mount status badge (sender record detail)
<HbcHandoffStatusBadge handoffId={record.activeHandoffId} />
```

---

## Exports

| Export | Kind | Description |
|--------|------|-------------|
| `IHandoffPackage<S,D>` | Interface | Core generic handoff package type |
| `IHandoffConfig<S,D>` | Interface | Per-route configuration supplied by consuming module |
| `IHandoffDocument` | Interface | Document link metadata |
| `IHandoffContextNote` | Interface | Context note attached to a package |
| `HandoffStatus` | Union type | `'draft' \| 'sent' \| 'received' \| 'acknowledged' \| 'rejected'` |
| `HandoffNoteCategory` | Union type | `'context' \| 'key-decision' \| 'risk' \| 'action-item'` |
| `usePrepareHandoff<S,D>` | Hook | Assembles package from config; manages pre-flight, documents, seed data |
| `useHandoffInbox<S,D>` | Hook | Loads received handoffs for current user |
| `useHandoffStatus<S,D>` | Hook | Polls for status; stops at terminal state |
| `HandoffApi` | Object | REST client (`create`, `get`, `inbox`, `outbox`, `send`, `receive`, `acknowledge`, `reject`, `addNote`) |
| `HbcHandoffComposer` | Component | 4-step sender-side composition and send flow |
| `HbcHandoffReceiver` | Component | Recipient-side review, acknowledge, and reject flow |
| `HbcHandoffStatusBadge` | Component | Complexity-gated inline status badge |
| `HANDOFF_LIST_TITLE` | Constant | `'HBC_HandoffPackages'` |
| `HANDOFF_API_BASE` | Constant | `'/api/workflow-handoff'` |
| `HANDOFF_SNAPSHOT_INLINE_MAX_BYTES` | Constant | `260_000` |

### Testing Sub-Path

```typescript
import { createMockHandoffPackage, mockHandoffStates } from '@hbc/workflow-handoff/testing';
```

> **Note:** The `testing/` sub-path is excluded from the production bundle (`sideEffects: false`). Import only in test files.

---

## Architecture Boundaries

This package **must not** import from:

- `@hbc/bic-next-move` — except the `IBicOwner` type
- `@hbc/versioned-record` — consuming module handles snapshot creation in `onAcknowledged`
- `@hbc/notification-intelligence` — Azure Function triggers notifications server-side
- `@hbc/field-annotations` — at module level; types only via consuming-module props

Verify with:

```bash
grep -r "from '@hbc/versioned-record'" packages/workflow-handoff/src/    # expect 0 matches
grep -r "from '@hbc/notification-intelligence'" packages/workflow-handoff/src/  # expect 0 matches
```

---

## Related Plans & References

- `docs/architecture/plans/shared-features/SF08-Workflow-Handoff.md` — Master plan
- `docs/architecture/plans/shared-features/SF08-T02-TypeScript-Contracts.md` — Full type definitions
- `docs/architecture/plans/shared-features/SF08-T03-Storage-and-API.md` — SharePoint schema & Azure Functions
- `docs/architecture/plans/shared-features/SF08-T07-Reference-Implementations.md` — `bdToEstimatingHandoffConfig`
- `docs/how-to/developer/workflow-handoff-adoption-guide.md` — Step-by-step wiring guide
- `docs/reference/workflow-handoff/api.md` — Full API reference
- `docs/architecture/adr/ADR-0097-workflow-handoff-platform-primitive.md` — Locked ADR
