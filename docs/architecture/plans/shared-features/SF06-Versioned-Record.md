# SF06 — `@hbc/versioned-record` Implementation Plan

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Package:** `packages/versioned-record/`
**Blueprint Reference:** HB-Intel-Blueprint-V4 §Shared Packages
**Priority:** P0 — Blocks BD scorecard director approval workflow, Project Hub PMP monthly update cycle, and any record type requiring legally defensible audit trail
**Estimated Effort:** 3–4 sprint-weeks
**ADR to Create:** `docs/architecture/adr/0015-versioned-record-platform-primitive.md`

---

## Purpose

`@hbc/versioned-record` makes deep, comparable version history a platform-wide primitive at zero incremental cost per adopting module. It provides a generic `IVersionedRecordConfig<T>` contract, full JSON snapshot storage with transparent large-payload overflow, a client-side diff engine, three UI components, metadata-first version list loading, append-only rollback semantics, and a complete testing sub-path — eliminating per-module version tracking and creating a consistent, legally defensible audit trail across all HB Intel record types.

The construction industry's competitive context (contract disputes, change order documentation, bid protest risk) makes immutable version history not just a UX feature but a legal and business necessity.

---

## Locked Decisions (All 10)

| ID | Topic | Decision |
|---|---|---|
| D-01 | Snapshot storage granularity | Full JSON snapshot per version; every version is self-contained and independently restorable without reconstruction chains |
| D-02 | Large snapshot handling | `VersionApi` manages the 255KB inline/file branch transparently; all callers interact with a uniform API surface regardless of storage path |
| D-03 | Rollback semantics | Append-only; rollback creates a new snapshot at restore time; superseded versions tagged `'superseded'` and soft-hidden behind "Show archived versions" toggle |
| D-04 | Access control granularity | Prop-delegated; consuming modules own all role logic and pass boolean gates into components; package is identity-free |
| D-05 | Diff computation location | Client-side pure function in `src/engine/diffEngine.ts`; both snapshots fetched via `VersionApi`, diff computed in-browser with deferred `useEffect` |
| D-06 | Version list pagination | Metadata-first loading; `useVersionHistory` fetches all version metadata in one lightweight query; full snapshot payloads load on demand when a version is selected |
| D-07 | Acknowledgment pinning | Consuming module passes `contextPayload: { version: number, snapshotId: string }` into `@hbc/acknowledgment` at acknowledgment creation time; both packages remain fully decoupled |
| D-08 | Step-wizard / draft relationship | Stage-gate transitions only; `VersionApi.createSnapshot()` called at business events (`submitted`, `approved`, `rejected`, `handoff`); wizard step completions are ephemeral |
| D-09 | Notification-intelligence integration | `VersionApi` owns `version.created` event type registration and `NotificationApi.send()` call; `IVersionedRecordConfig<T>` gains required `getStakeholders` function |
| D-10 | Testing sub-path | Standard platform pattern: `@hbc/versioned-record/testing`; typed config factory, 6 canonical named states, hook stub with vi.fn() mutations, wrapper factory — no harness component |

---

## Directory Structure

```
packages/versioned-record/
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── src/
│   ├── index.ts
│   ├── types/
│   │   ├── IVersionedRecord.ts
│   │   └── index.ts
│   ├── engine/
│   │   └── diffEngine.ts               # Pure client-side diff computation (D-05)
│   ├── api/
│   │   └── VersionApi.ts               # createSnapshot, getMetadataList, getSnapshot,
│   │                                   # getSnapshotById, restoreSnapshot — transparent
│   │                                   # inline/file routing (D-02); NotificationApi.send (D-09)
│   ├── hooks/
│   │   ├── useVersionHistory.ts        # Metadata-first version list (D-06)
│   │   ├── useVersionSnapshot.ts       # On-demand full snapshot loader
│   │   ├── useVersionDiff.ts           # Deferred diffEngine invocation (D-05)
│   │   └── index.ts
│   └── components/
│       ├── HbcVersionHistory.tsx       # Collapsible version list panel (D-04)
│       ├── HbcVersionDiff.tsx          # Side-by-side / unified diff viewer (PWA-only)
│       ├── HbcVersionBadge.tsx         # Compact version chip for record headers
│       └── index.ts
└── testing/
    ├── index.ts
    ├── createMockVersionedRecordConfig.ts
    ├── mockVersionedRecordStates.ts    # 6 canonical named states (D-10)
    ├── mockUseVersionHistory.ts
    └── createVersionedRecordWrapper.tsx
```

---

## Key Data Structures

### `IVersionSnapshot<T>` — Core storage unit (D-01)

```typescript
interface IVersionSnapshot<T> {
  snapshotId: string;           // GUID — primary key for stable cross-package references (D-07)
  version: number;              // Auto-incremented per recordId (1, 2, 3...)
  createdAt: string;            // ISO 8601 UTC
  createdBy: IBicOwner;         // Author identity
  changeSummary: string;        // Human or auto-generated summary
  tag: VersionTag;              // Workflow state at snapshot time
  snapshot: T;                  // Full serialized record payload (D-01)
}
```

### `IVersionMetadata` — Lightweight list row (D-06)

```typescript
interface IVersionMetadata {
  snapshotId: string;
  version: number;
  createdAt: string;
  createdBy: IBicOwner;
  changeSummary: string;
  tag: VersionTag;
  // snapshot: T is intentionally absent — loaded on demand
  storageRef?: string;          // Set only when payload is in file library (D-02)
}
```

### `VersionTag` enum — Extended for rollback (D-03)

```typescript
type VersionTag =
  | 'draft'
  | 'submitted'
  | 'approved'
  | 'rejected'
  | 'archived'
  | 'handoff'
  | 'superseded';  // Added: marks versions rolled past (D-03)
```

### `IVersionedRecordConfig<T>` — Consumer contract

```typescript
interface IVersionedRecordConfig<T> {
  recordType: string;
  triggers: VersionTrigger[];
  generateChangeSummary?: (previous: T | null, current: T) => string;
  excludeFields?: Array<keyof T>;
  maxVersions?: number;                               // 0 = unlimited
  getStakeholders: (snapshot: IVersionSnapshot<T>) => string[];  // D-09: recipient userIds
  onVersionCreated?: (snapshot: IVersionSnapshot<T>) => void;    // Optional post-create hook
}
```

### State Shape Diagram

```
IVersionedRecordConfig<T>
        │
        ▼
VersionApi.createSnapshot()
        │
        ├── serialize(item, excludeFields) → snapshotPayload
        ├── measure(snapshotPayload)
        │       ├── ≤255KB → write to HbcVersionSnapshots list (SnapshotJson column)
        │       └── >255KB → write to SP file library → store fileUrl in SnapshotJson (D-02)
        ├── NotificationRegistry.register (once at package init) (D-09)
        └── NotificationApi.send() × getStakeholders().length (D-09)

useVersionHistory(recordType, recordId, config)
        │
        ├── fetch HbcVersionSnapshots WHERE RecordType=x AND RecordId=y (metadata only, D-06)
        ├── returns IVersionMetadata[] (newest first)
        └── showSuperseded: boolean controls filtering (D-03)

useVersionSnapshot(snapshotId)
        │
        ├── fetch full row by SnapshotId
        └── if storageRef present → fetch file from SP library (D-02)

useVersionDiff(recordType, recordId, versionA, versionB, config)
        │
        ├── useVersionSnapshot(snapshotIdA) + useVersionSnapshot(snapshotIdB)
        └── useEffect → diffEngine.computeDiff(snapshotA, snapshotB) → IVersionDiff[] (D-05)
```

---

## Integration Points

| Package | Integration | Decision |
|---|---|---|
| `@hbc/notification-intelligence` | `NotificationRegistry.register(['version.created'])` at package init; `NotificationApi.send()` per stakeholder after snapshot write | D-09 |
| `@hbc/acknowledgment` (SF04) | Consuming module passes `contextPayload: { version, snapshotId }` when opening acknowledgment; no direct package coupling | D-07 |
| `@hbc/complexity` (SF03) | Essential: badge only; Standard: history panel; Expert: full diff viewer + rollback | Spec |
| `@hbc/step-wizard` (SF05) | `VersionApi.createSnapshot()` called in wizard `onAllComplete` or stage-gate callbacks — not on per-step completion | D-08 |
| `@hbc/session-state` | Draft state is ephemeral and not versioned; versioning begins at first business-event trigger | D-08 |
| `@hbc/workflow-handoff` | Handoff events call `VersionApi.createSnapshot()` with `tag: 'handoff'`; handoff record stores `snapshotId` for deep link | Spec |
| `@hbc/search` | Version metadata (tag, author, date range) indexed for search | Spec |

### Cross-Package Amendment Requirements

**`@hbc/acknowledgment` (SF04) — No code amendment required.** The `contextPayload` field already exists in SF04's `IAcknowledgmentConfig`. Consuming modules must populate `contextPayload: { version: number, snapshotId: string }` when opening an acknowledgment on a versioned record. This is a documentation-only requirement; T07 and T09 provide the canonical wiring example.

**`@hbc/notification-intelligence` (SF10) — Registry entry required at `@hbc/versioned-record` package init.** The `version.created` event type must be registered before any `NotificationApi.send()` call. This is handled inside `VersionApi`'s module-level initialization block. No amendment to the SF10 package itself is required.

**`@hbc/complexity` (SF03) — No code amendment required.** `HbcVersionHistory` and `HbcVersionDiff` call `useComplexity()` internally. The SF03 package requires no changes.

---

## Effort Estimate

| Wave | Scope | Sprint-weeks |
|---|---|---|
| 1 | Package scaffold, TypeScript contracts, `VersionApi` (create + metadata list + getSnapshot), SP list schema, `NotificationRegistry` registration | 1.0 |
| 2 | `diffEngine.ts`, all three hooks, `HbcVersionBadge` | 0.75 |
| 3 | `HbcVersionHistory` (with superseded toggle), `HbcVersionDiff` (side-by-side + unified), rollback flow + confirmation modal | 1.0 |
| 4 | Testing sub-path, Storybook stories, Playwright E2E, T09 deployment + ADR | 0.75 |
| **Total** | | **3.5 sprint-weeks** |

---

## 4-Wave Implementation Plan

**Wave 1 — Storage Foundation**
Deliver `package.json`, `tsconfig.json`, `vitest.config.ts`, all TypeScript contracts (`IVersionedRecord.ts`), `VersionApi.createSnapshot()`, `VersionApi.getMetadataList()`, `VersionApi.getSnapshot()` / `getSnapshotById()`, `HbcVersionSnapshots` SharePoint list provisioning script, `NotificationRegistry.register()` at package init, and barrel stubs.

**Wave 2 — Computation & Hooks**
Deliver `diffEngine.ts` (field-level comparison, numeric delta, character-level text diff), `useVersionHistory` (metadata-first, superseded filter), `useVersionSnapshot` (on-demand full payload), `useVersionDiff` (deferred `useEffect` computation), and `HbcVersionBadge`.

**Wave 3 — UI Components**
Deliver `HbcVersionHistory` (collapsible panel, tag badges, author avatar, relative timestamps, rollback CTA, superseded toggle, complexity integration), `HbcVersionDiff` (side-by-side + unified modes, field highlights, numeric delta display), and the rollback confirmation modal (append-only restore via `VersionApi.restoreSnapshot()`).

**Wave 4 — Testing, Stories & Deployment**
Deliver the full `testing/` sub-path, 10+ Storybook stories, 8–10 Playwright E2E scenarios, ADR-0015, adoption guide, Blueprint/Foundation Plan progress comments, and all verification commands.

---

## 20-Item Definition of Done

- [ ] `IVersionedRecordConfig<T>` contract defined and exported with `getStakeholders` function
- [ ] `VersionApi.createSnapshot()` stores immutable full JSON snapshot with correct tag (D-01)
- [ ] `VersionApi` transparently routes inline vs. file-library storage at 255KB threshold (D-02)
- [ ] Partial-failure compensation: list row deleted if file write fails (D-02)
- [ ] `VersionApi.getMetadataList()` returns `IVersionMetadata[]` without `snapshot` payload (D-06)
- [ ] `VersionApi.getSnapshot()` / `getSnapshotById()` resolves file-library reference transparently (D-02)
- [ ] `VersionApi.restoreSnapshot()` creates new `'superseded'`-tagged versions for rolled-past entries (D-03)
- [ ] `diffEngine.computeDiff()` produces correct `IVersionDiff[]` for added / removed / modified fields (D-05)
- [ ] Numeric fields show delta string: `"42 → 67 (+25)"` (D-05)
- [ ] `useVersionHistory` loads metadata-only list; superseded versions filtered by default (D-03, D-06)
- [ ] `useVersionSnapshot` loads full payload on demand; resolves file-library ref transparently (D-02, D-06)
- [ ] `useVersionDiff` defers computation to `useEffect`; exposes `isComputing` loading state (D-05)
- [ ] `HbcVersionHistory` renders chronological list with tag badges, author, timestamps, change summary
- [ ] `HbcVersionHistory` rollback CTA gated by `allowRollback` prop; opens confirmation modal (D-04)
- [ ] `HbcVersionDiff` renders side-by-side and unified modes; field highlights correct (D-05)
- [ ] `HbcVersionBadge` renders compact chip with version number and tag
- [ ] `@hbc/complexity` integration: Essential = badge only; Standard = history panel; Expert = diff + rollback
- [ ] `NotificationRegistry.register(['version.created'])` executed at package init (D-09)
- [ ] `NotificationApi.send()` called per stakeholder from `getStakeholders()` after successful snapshot write (D-09)
- [ ] Testing sub-path `@hbc/versioned-record/testing` exports all D-10 artifacts; unit test coverage ≥95% on `diffEngine`

---

## Task File Index

| File | Scope |
|---|---|
| `SF06-T01-Package-Scaffold.md` | Directory tree, `package.json`, `tsconfig.json`, `vitest.config.ts`, barrel stubs |
| `SF06-T02-TypeScript-Contracts.md` | All interfaces, types, enums, pure utility functions, exported constants |
| `SF06-T03-Diff-Engine.md` | `diffEngine.ts` pure functions, state/transition table, unit tests |
| `SF06-T04-Hooks.md` | `useVersionHistory`, `useVersionSnapshot`, `useVersionDiff` full implementations |
| `SF06-T05-HbcVersionHistory.md` | Primary panel component with rollback flow, complexity integration |
| `SF06-T06-HbcVersionDiff-and-Badge.md` | `HbcVersionDiff` side-by-side/unified viewer, `HbcVersionBadge` chip |
| `SF06-T07-Storage-and-Integration.md` | `VersionApi.ts`, SP list schema, notification registration, adoption wiring examples |
| `SF06-T08-Testing-Strategy.md` | Testing sub-path, 6 canonical states, hook stubs, Storybook stories, Playwright E2E |
| `SF06-T09-Deployment.md` | Pre-deployment checklist, ADR-0015, adoption guide, verification commands |
