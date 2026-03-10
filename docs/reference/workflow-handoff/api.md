# `@hbc/workflow-handoff` — API Reference

**Package:** `@hbc/workflow-handoff`
**Locked ADR:** ADR-0097
**Source:** `packages/workflow-handoff/src/index.ts`

---

## Public API Surface

The detailed JSDoc on each export in the source files is the authoritative specification; this table serves as the navigation index.

| Export | Type | Description |
|--------|------|-------------|
| `IHandoffPackage<TSource, TDest>` | Interface | Core generic type for a handoff package |
| `IHandoffConfig<TSource, TDest>` | Interface | Config object supplied by consuming module |
| `IHandoffDocument` | Interface | Document link metadata |
| `IHandoffContextNote` | Interface | Context note added by sender in Composer |
| `HandoffStatus` | Union type | `'draft' \| 'sent' \| 'received' \| 'acknowledged' \| 'rejected'` |
| `HandoffNoteCategory` | Union type | `'context' \| 'key-decision' \| 'risk' \| 'action-item'` |
| `IBicOwner` | Type (re-export) | Re-exported from `@hbc/bic-next-move` for convenience |
| `usePrepareHandoff<S, D>` | Hook | Assembles package from config; manages pre-flight, documents, seed data |
| `useHandoffInbox<S, D>` | Hook | Loads received handoffs for the current user |
| `useHandoffStatus<S, D>` | Hook | Polls for current handoff status; stops polling at terminal state |
| `HandoffApi` | Object | REST client: `create`, `get`, `inbox`, `outbox`, `send`, `receive`, `acknowledge`, `reject`, `addNote` |
| `HbcHandoffComposer` | Component | 4-step sender-side composition and send flow |
| `HbcHandoffReceiver` | Component | Recipient-side review, acknowledge, and reject flow |
| `HbcHandoffStatusBadge` | Component | Complexity-gated inline status badge |
| `HANDOFF_LIST_TITLE` | Constant | `'HBC_HandoffPackages'` |
| `HANDOFF_API_BASE` | Constant | `'/api/workflow-handoff'` |
| `HANDOFF_SNAPSHOT_INLINE_MAX_BYTES` | Constant | `260_000` |
| `handoffStatusLabel` | Constant | Display label map per `HandoffStatus` |
| `handoffStatusColorClass` | Constant | CSS color class map per `HandoffStatus` |
| `noteCategoryColorClass` | Constant | CSS color class map per `HandoffNoteCategory` |

---

## Testing Sub-Path (`@hbc/workflow-handoff/testing`)

| Export | Type | Description |
|--------|------|-------------|
| `createMockHandoffPackage<S,D>` | Testing factory | Creates fixture package in any status |
| `createMockHandoffConfig<S,D>` | Testing factory | Creates minimal mock config |
| `createMockHandoffDocument` | Testing factory | Creates a document link fixture |
| `createMockContextNote` | Testing factory | Creates a context note fixture |
| `mockHandoffStates` | Testing constant | 5-state fixture map keyed by `HandoffStatus` |

> **Note:** The `testing/` sub-path is excluded from the production bundle (`sideEffects: false`). Import only in test files.
