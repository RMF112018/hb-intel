# SF12 — `@hbc/session-state`: Offline-Safe Session Persistence & Sync

**Plan Version:** 1.0
**Date:** 2026-03-10
**Source Spec:** `docs/explanation/feature-decisions/PH7-SF-12-Shared-Feature-Session-State.md`
**Priority Tier:** 2 — Application Layer (required before offline-capable workflows)
**Estimated Effort:** 4–5 sprint-weeks
**ADR Required:** `docs/architecture/adr/ADR-0101-session-state-offline-persistence.md`

> **Doc Classification:** Canonical Normative Plan — SF12 implementation master plan for `@hbc/session-state`; governs SF12-T01 through SF12-T09.

---

## Purpose

`@hbc/session-state` provides a shared persistence and synchronization primitive for unreliable connectivity environments. It preserves drafts, queues pending operations, surfaces connectivity state, and syncs queued work after reconnect.

Without this package, modules implement inconsistent offline behavior, causing user-visible data loss and trust erosion.

---

## Locked Interview Decisions

| # | Decision | Locked Choice |
|---|---|---|
| D-01 | Storage backend | IndexedDB with two stores: `drafts` and `queue` |
| D-02 | Queue retry model | `retryCount`/`maxRetries` per operation; max-retry failure is explicit and user-visible |
| D-03 | Connectivity states | `online`, `offline`, `degraded` are the only exposed status values |
| D-04 | Sync strategy | PWA: Background Sync API when available; SPFx: polling fallback on reconnect |
| D-05 | Draft lifecycle | Draft TTL is required; expired drafts auto-purged on startup and periodic sweep |
| D-06 | Provider contract | `SessionStateProvider` owns connectivity detection, queue sync trigger, draft/queue adapters |
| D-07 | Hook contract | `useSessionState`, `useDraft<T>`, `useConnectivity` are canonical and stable |
| D-08 | UI constraints | `HbcConnectivityBar` and `HbcSyncStatusBadge` must be app-shell-safe |
| D-09 | Integration baseline | SharePoint docs, acknowledgment, workflow-handoff, PH9b form draft must have reference integrations |
| D-10 | Testing sub-path | `@hbc/session-state/testing` exports `createMockQueuedOperation`, `createMockDraftEntry`, `createMockSessionContext`, `mockConnectivityStates` |

---

## Package Directory Structure

```text
packages/session-state/
├── package.json
├── README.md
├── tsconfig.json
├── vitest.config.ts
├── src/
│   ├── index.ts
│   ├── types/
│   │   ├── ISessionState.ts
│   │   └── index.ts
│   ├── constants/
│   │   ├── sessionStateDefaults.ts
│   │   └── index.ts
│   ├── db/
│   │   ├── SessionDb.ts
│   │   ├── DraftStore.ts
│   │   ├── QueueStore.ts
│   │   └── index.ts
│   ├── sync/
│   │   ├── SyncEngine.ts
│   │   └── index.ts
│   ├── context/
│   │   ├── SessionStateContext.ts
│   │   ├── SessionStateProvider.tsx
│   │   └── index.ts
│   ├── hooks/
│   │   ├── useSessionState.ts
│   │   ├── useDraft.ts
│   │   ├── useConnectivity.ts
│   │   └── index.ts
│   └── components/
│       ├── HbcConnectivityBar.tsx
│       ├── HbcSyncStatusBadge.tsx
│       └── index.ts
├── testing/
│   ├── index.ts
│   ├── createMockQueuedOperation.ts
│   ├── createMockDraftEntry.ts
│   ├── createMockSessionContext.ts
│   └── mockConnectivityStates.ts
└── src/__tests__/
    ├── setup.ts
    ├── SessionDb.test.ts
    ├── DraftStore.test.ts
    ├── QueueStore.test.ts
    ├── SyncEngine.test.ts
    ├── useDraft.test.ts
    ├── useConnectivity.test.ts
    ├── SessionStateProvider.test.tsx
    ├── HbcConnectivityBar.test.tsx
    └── HbcSyncStatusBadge.test.tsx
```

---

## Integration Points

| Package | Integration Detail |
|---|---|
| `@hbc/sharepoint-docs` | queue upload operations for reconnect sync |
| `@hbc/acknowledgment` | queue acknowledgment actions offline |
| `@hbc/workflow-handoff` | persist handoff composer drafts |
| PH9b `useFormDraft` | use `useDraft<T>` as canonical storage backend |
| `@hbc/notification-intelligence` | queue read/dismiss actions while offline |

---

## SPFx Constraints

- IndexedDB is supported in modern SPFx host browsers.
- Background Sync API may be unavailable in SPFx; polling fallback is mandatory.
- Provider must avoid service-worker hard dependency in SPFx runtime paths.

---

## Effort Estimates

| Task File | Scope | Estimate |
|---|---|---|
| T01 Package Scaffold | Base package, exports, README scaffold | 0.35 sw |
| T02 TypeScript Contracts | All public contracts and constants | 0.4 sw |
| T03 IndexedDB & Stores | DB schema, draft/queue stores | 0.8 sw |
| T04 Sync Engine & Connectivity | Sync orchestration + connectivity transitions | 0.8 sw |
| T05 Provider & Hooks | Provider and 3 hooks | 0.75 sw |
| T06 UI Components | Connectivity bar + sync badge | 0.45 sw |
| T07 Reference Integrations | 4 canonical integrations | 0.5 sw |
| T08 Testing Strategy | fixtures, unit/component/story/e2e coverage | 0.45 sw |
| T09 Testing & Deployment | gates + ADR/docs/state-map updates | 0.4 sw |
| **Total** | | **4.9 sprint-weeks** |

---

## Definition of Done

- [ ] `drafts` and `queue` IndexedDB stores defined and tested
- [ ] TTL draft expiry and purge behavior implemented
- [ ] queue retry behavior enforces `maxRetries`
- [ ] Sync engine supports PWA background sync and SPFx polling fallback
- [ ] Provider + hooks contracts implemented and type-safe
- [ ] Connectivity bar and sync badge implement all state variants
- [ ] `@hbc/session-state/testing` sub-path exports all D-10 fixtures
- [ ] T07 integration patterns documented for required packages
- [ ] T09 includes SF11-grade documentation/deployment requirements
- [ ] `current-state-map.md` updated with SF12 + ADR-0101 linkage

---

## Task File Index

| File | Contents |
|---|---|
| `SF12-T01-Package-Scaffold.md` | package scaffold + README template requirement |
| `SF12-T02-TypeScript-Contracts.md` | full contracts and constants |
| `SF12-T03-IndexedDB-and-Stores.md` | DB schema, DraftStore, QueueStore |
| `SF12-T04-Sync-Engine-and-Connectivity.md` | SyncEngine behavior and connectivity strategy |
| `SF12-T05-SessionStateProvider-and-Hooks.md` | Provider and hook contracts |
| `SF12-T06-HbcConnectivityBar-and-SyncStatusBadge.md` | UI components and behavior matrix |
| `SF12-T07-Reference-Integrations.md` | sharepoint-docs, acknowledgment, PH9b, handoff integrations |
| `SF12-T08-Testing-Strategy.md` | testing sub-path and test matrix |
| `SF12-T09-Testing-and-Deployment.md` | checklist, ADR-0101 template, docs and state-map updates |

<!-- IMPLEMENTATION PROGRESS & NOTES
SF12 master plan authored: 2026-03-10
Status: Canonical Normative Plan (implementation in progress)
ADR required: ADR-0101

SF12-T01 completed: 2026-03-11
- Package scaffold created with dual exports, 95% coverage thresholds, README
- All verification gates passed (check-types, build, test, README)
- tsconfig.base.json updated with @hbc/session-state path aliases
Next: SF12-T02 (TypeScript Contracts)

SF12-T02 completed: 2026-03-11
- Full contract surface implemented in ISessionState.ts (6 types/interfaces)
- 7 constants defined in sessionStateDefaults.ts
- Barrel exports wired through types/index.ts, constants/index.ts, src/index.ts
- All 4 testing factories tightened from Record<string, unknown> to proper typed signatures
- Verification: check-types zero errors, build compiles to dist/

SF12-T03 completed: 2026-03-11
- idb-based IndexedDB layer: SessionDb (connection manager), DraftStore (TTL CRUD), QueueStore (retry queue)
- IDraftEntryRecord, SessionDbSchema, EnqueueInput types exported
- 39 tests, 100% coverage; all 3 verification gates pass
Next: SF12-T04 (Sync Engine & Connectivity)

SF12-T04 completed: 2026-03-11
- connectivity.ts: createConnectivityMonitor (probe, subscribe, dispose, safe SSR defaults)
- SyncEngine.ts: class with processQueue, triggerSync, registerBackgroundSync, startPolling/stopPolling, dispose
- Exponential bounded backoff: min(base * 2^retryCount, max)
- Background Sync API guarded (no-op when unavailable — SPFx safe)
- 4 new constants, 3 new type exports, sync barrel + root barrel updated
- vitest.config.ts: sync/ removed from coverage exclusions
- 24 new tests (10 connectivity + 14 SyncEngine); 63 total pass
- All 3 gates pass: check-types ✓ | test ✓ | build ✓
Next: SF12-T05 (Provider & Hooks)

SF12-T05 completed: 2026-03-11
- SessionStateContext: createContext<ISessionStateContext | null>(null)
- SessionStateProvider: mounts SyncEngine + ConnectivityMonitor, purges expired drafts, exposes memoized context value
- useSessionState: context consumer with throw-if-outside-provider guard
- useDraft<T>: async load on mount/key change, save/clear with local state + store persistence
- useConnectivity: thin selector returning ConnectivityStatus
- context/ and hooks/ barrels, root barrel updated with 3 hooks + provider + context exports
- vitest.config.ts: context/ and hooks/ removed from coverage exclusions
- 14 new tests (provider lifecycle, hooks, cleanup, queue integration); 77 total pass
- Coverage: 98.5% stmts, 97.35% branches, 95.34% functions — all above 95%
- All 3 gates pass: check-types ✓ | test ✓ | build ✓
Next: SF12-T06 (UI Components)

SF12-T06 completed: 2026-03-11
- HbcConnectivityBar: online/degraded/offline/syncing states, showWhenOnline prop, role="status" + aria-live="polite"
- HbcSyncStatusBadge: pending count badge, green synced state, native <details>/<summary> popover, keyboard-focusable <button> trigger
- Inline CSS-in-JS styles only (app-shell-safe, SPFx-compatible, no ui-kit dependency)
- Reconnect "syncing" transient state: useRef + useEffect tracking offline->online transition, 3s timeout
- components/ barrel exports both components + prop types; root barrel updated
- vitest.config.ts: removed src/components/** from coverage exclusions
- 14 new tests (7 per component); 91 total pass
- Coverage: 98.83% stmts, 97.77% branches, 95.55% functions — all above 95%
- All 3 gates pass: check-types ✓ | test ✓ | build ✓
Next: SF12-T07 (useDraft Integration Recipes)

SF12-T07 completed: 2026-03-11
- 5 hooks across 4 consuming packages: useSessionUploadQueue, useOfflineQueue (rewrite), useAcknowledgmentQueueReplay (rewrite), useFormDraftPersisted, useComposerDraft
- 18 new tests across 4 packages; all pass
- @hbc/session-state workspace dep added to sharepoint-docs, acknowledgment, workflow-handoff, query-hooks
- Barrel exports updated in all consuming packages
- query-hooks: added vitest.config.ts + testing devDependencies
- acknowledgment: removed stub coverage exclusions (hooks are now real implementations)
- All 4 packages pass check-types ✓ and test ✓
Next: SF12-T08 (Testing Strategy)
-->
