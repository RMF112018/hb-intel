# SF08-T09 — Deployment: `@hbc/workflow-handoff`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-08-Shared-Feature-Workflow-Handoff.md`
**Decisions Applied:** All D-01 through D-10
**Estimated Effort:** 0.25 sprint-weeks
**Depends On:** T01–T08

> **Doc Classification:** Canonical Normative Plan — SF08-T09 deployment task; sub-plan of `SF08-Workflow-Handoff.md`.

---

## Objective

Gate the `@hbc/workflow-handoff` package against all mechanical enforcement gates, produce the ADR-0092 locked decision record, write the developer adoption guide, and publish the API reference. This task is the formal Definition of Done for the SF-08 implementation.

---

## 3-Line Plan

1. Run all four mechanical enforcement gates; zero errors required before proceeding.
2. Create `docs/architecture/adr/0092-workflow-handoff-platform-primitive.md` with all ten locked decisions.
3. Create `docs/how-to/developer/workflow-handoff-adoption-guide.md` and `docs/reference/workflow-handoff/api.md` as required Diátaxis deliverables.

---

## Pre-Deployment Checklist

Work through every item below. No deployment proceeds until all 30 items are checked.

### Architecture & Boundary Verification

- [ ] `@hbc/workflow-handoff` has zero imports of `@hbc/bic-next-move` except `IBicOwner` type
- [ ] `@hbc/workflow-handoff` has zero imports of `@hbc/versioned-record`
- [ ] `@hbc/workflow-handoff` has zero imports of `@hbc/notification-intelligence`
- [ ] `@hbc/workflow-handoff` has zero imports of `@hbc/field-annotations` at the module level (only types consumed via consuming-module props)
- [ ] Architecture boundary grep commands (from T07) all return zero matches
- [ ] ESLint boundary rules pass: `pnpm turbo run lint --filter @hbc/workflow-handoff`

### Type Safety

- [ ] Zero TypeScript errors: `pnpm --filter @hbc/workflow-handoff check-types`
- [ ] `IHandoffPackage<TSource, TDest>` and `IHandoffConfig<TSource, TDest>` generics propagate correctly through `usePrepareHandoff`, `HandoffApi.mapListItem`, and `HbcHandoffComposer`
- [ ] `onAcknowledged` return type `Promise<{destinationRecordId: string}>` enforced by generic constraint
- [ ] `mapListItem<TSource, TDest>` uses JSON.parse with try/catch for `sourceSnapshot` (inline vs. file-reference routing)

### Build & Package

- [ ] Build succeeds with zero errors: `pnpm --filter @hbc/workflow-handoff build`
- [ ] Both entry points resolve correctly: `@hbc/workflow-handoff` and `@hbc/workflow-handoff/testing`
- [ ] `testing/` sub-path is NOT included in the production bundle (`sideEffects: false` in `package.json`)
- [ ] `dist/` tree contains `index.js`, `index.d.ts`, `testing/index.js`, `testing/index.d.ts`
- [ ] Turbo build with consuming modules: `pnpm turbo run build --filter packages/business-development...` succeeds

### Tests

- [ ] All unit tests pass: `pnpm --filter @hbc/workflow-handoff test`
- [ ] Coverage thresholds met: `lines: 95, branches: 95, functions: 95, statements: 95`
- [ ] All five canonical `mockHandoffStates` states are covered by at least one test scenario each
- [ ] Rejection path covered: `onRejected` called, `rejectionReason` populated, terminal state displayed
- [ ] Acknowledge path covered: `onAcknowledged` called, `createdDestinationRecordId` propagated

### Storage & API

- [ ] `HBC_HandoffPackages` SharePoint list provisioned in dev environment with all 24 columns
- [ ] Three compound indexes created: `(SourceRecordType, SourceRecordId)`, `(Status, RecipientUserId)`, `(Status, SenderUserId)`
- [ ] All 9 Azure Functions deployed to dev: `handoffCreate`, `handoffGet`, `handoffInbox`, `handoffOutbox`, `handoffSend`, `handoffReceive`, `handoffAcknowledge`, `handoffReject`, `handoffNotes`
- [ ] Inline/overflow snapshot routing tested: snapshot >260KB correctly writes to Azure Blob and stores `SourceSnapshotFileUrl`
- [ ] File snapshot fetch on `handoffGet` correctly downloads Blob and hydrates `sourceSnapshot`

### Integration & Dev-Harness

- [ ] Full 19-step dev-harness validation sequence from T07 completed and passing
- [ ] All three notification events fire correctly: Immediate on send, Watch on acknowledge, Watch on reject
- [ ] BIC integration: sender's BIC config reads `useHandoffStatus` and correctly transfers ownership on send
- [ ] BIC integration: rejection correctly returns BIC to sender with blocked state and rejection reason
- [ ] Versioned-record snapshot with `tag: 'handoff'` visible in version history after acknowledge
- [ ] Storybook stories render all five `HandoffStatus` states for `HbcHandoffStatusBadge` without errors

---

## ADR-0092: Workflow Handoff Platform Primitive

**File:** `docs/architecture/adr/0092-workflow-handoff-platform-primitive.md`

```markdown
# ADR-0092 — Workflow Handoff Platform Primitive

**Status:** Accepted
**Date:** 2026-03-10
**Deciders:** HB Intel Architecture Team
**Supersedes:** None
**Note:** The source specification (PH7-SF-08) referenced ADR-0017 as its target number.
This conflicts with CLAUDE.md §7 (all numbers below ADR-0091 are reserved). The canonical
locked ADR for this feature is ADR-0092. The source spec's ADR-0017 reference is superseded
by this document.

---

## Context

Cross-module handoffs — BD to Estimating, Estimating to Project Hub, and future routes — require
a structured, auditable transfer of custody between modules. Without a shared primitive, each
module would implement its own ad-hoc handoff pattern, leading to inconsistent state machines,
duplicated audit trails, and no standardized BIC transfer on handoff.

Phase 7 Shared Feature 08 (SF-08) defines `@hbc/workflow-handoff` as the platform primitive
that all modules use for structured cross-module handoff. Ten architectural decisions were made
during its design and are locked by this ADR.

---

## Decisions

### D-01 — Storage Backend: SharePoint List + Azure Functions

**Decision:** Use a `HBC_HandoffPackages` SharePoint list as the primary store, with all
write and state-transition operations going through Azure Functions. Direct SharePoint Graph
API calls from the client are prohibited for handoff operations.

**Rationale:** Consistent with the SF-01 (Data API) storage pattern. Azure Functions provide
server-side validation and enforce the state machine (a client cannot self-approve a transition).
SharePoint provides the audit trail and existing permission model.

**Consequences:** All nine handoff Azure Functions must be provisioned before the package can
be used in production. The client package communicates only through the REST API at
`/api/workflow-handoff/*`.

---

### D-02 — Five-State Linear State Machine

**Decision:** `HandoffStatus` is a five-state linear machine:
`draft → sent → received → acknowledged | rejected`.
`acknowledged` and `rejected` are terminal states. No transitions out of terminal states are
permitted. Server-side enforcement is required — the `handoffAcknowledge` and `handoffReject`
Azure Functions must validate the preceding state before writing.

**Rationale:** A simple, auditable state machine with no ambiguity. Terminal states ensure the
handoff record is a permanent audit artifact.

**Consequences:** Rejected handoffs require a new handoff to be initiated. The consuming module's
`onRejected` handler must return the source record to its pre-handoff state (e.g., via
`ScorecardApi.returnToRevision`).

---

### D-03 — Pre-flight Validation Synchronous

**Decision:** `IHandoffConfig.validateReadiness(source)` is a synchronous function that returns
a string (failure message) or `null` (ready). The `HbcHandoffComposer` step indicator disables
the "Proceed" CTA when any pre-flight check is failing. No asynchronous pre-flight is supported.

**Rationale:** Asynchronous pre-flight would require loading state and error handling in the
Composer before the user has taken any action. Synchronous validation keeps the Composer
snappy and predictable. Complex async checks belong in the source module's workflow stage gate,
not in the handoff pre-flight.

**Consequences:** Pre-flight can only check fields already loaded in the source record.
Network-dependent checks (e.g., "does this document still exist?") are not suitable for
pre-flight and should be surfaced via document resolution errors in Step 2 instead.

---

### D-04 — Field Mapping Frozen at Assembly Time

**Decision:** `mapSourceToDestination(source)` is called once when `usePrepareHandoff` assembles
the package. The resulting `destinationSeedData` snapshot is frozen — no live re-evaluation occurs
as the user progresses through the Composer steps. The seed data the recipient sees in
`HbcHandoffReceiver` is exactly what was assembled at send time.

**Rationale:** The handoff package is an immutable audit artifact. The recipient must be able to
trust that the data they see in the Receiver matches what the sender certified. Live re-evaluation
would create a race condition where data changes after send.

**Consequences:** If the source record changes after a handoff is sent, the handoff package still
reflects the state at send time. This is the intended behavior. Consuming modules should surface
this clearly in the UI if needed.

---

### D-05 — BIC Transfer on Send

**Decision:** On `HandoffApi.send()` success, BIC ownership transfers to the `recipient`. The
consuming module's `IBicNextMoveConfig.resolveCurrentOwner` must read `useHandoffStatus` and
return the recipient as owner when `status === 'sent' || status === 'received'`. On `acknowledged`
or `rejected`, BIC returns to the consuming module's default resolution logic (post-creation for
acknowledged; return-to-sender for rejected).

**Rationale:** BIC ownership must always reflect who has actionable responsibility. During the
handoff period, the recipient is responsible for review and action.

**Consequences:** The consuming module must wire `useHandoffStatus` into its BIC config. This is
an inversion-of-control pattern — `@hbc/workflow-handoff` does NOT implement BIC logic itself.

---

### D-06 — Document Resolution Async, Links Only

**Decision:** `resolveDocuments(source): Promise<IHandoffDocument[]>` is async and returns link
metadata only — `documentId`, `fileName`, `sharepointUrl`, `category`, `fileSizeBytes`. No file
content is copied or stored in the handoff package. If SharePoint URLs change after the handoff
is created, the `handoffGet` Azure Function is responsible for migrating stale URLs to current
ones before returning the package.

**Rationale:** Copying file content would bloat the handoff package and create duplicate storage.
Links are sufficient for the recipient to access documents. URL migration in the API layer
insulates the client from SharePoint URL changes.

**Consequences:** Document resolution may fail or return an empty array if SharePoint is
unavailable at assembly time. The Composer must handle `documentError` state gracefully.

---

### D-07 — Rejection is Terminal, Requires Reason

**Decision:** `HandoffApi.reject()` requires a non-empty `rejectionReason` string. The
`handoffReject` Azure Function validates this. Once rejected, the handoff is permanently in the
`rejected` state. The `onRejected` handler in the consuming module's config is responsible for
returning the source record to its pre-handoff revision state.

**Rationale:** Rejection without a reason is unhelpful to the sender. The consuming module must
define what "return to revision" means for its record type — this is business logic that belongs
in the consuming module, not the shared primitive.

**Consequences:** `HbcHandoffReceiver` must enforce a non-empty reason before enabling the
"Confirm Reject" CTA. The rejection reason is permanently stored in `HBC_HandoffPackages` and
surfaced in version history context payloads.

---

### D-08 — Complexity Gating: Composer/Receiver Ungated; StatusBadge Essential=hidden

**Decision:** `HbcHandoffComposer` and `HbcHandoffReceiver` are ungated by complexity — they are
always rendered when invoked. `HbcHandoffStatusBadge` is complexity-gated: Essential renders null,
Standard renders the label, Expert renders label + timestamp.

**Rationale:** The Composer and Receiver are task-completion surfaces — a user who has been
directed to perform a handoff action must be able to do so regardless of their complexity setting.
The StatusBadge is informational ambient UI and can be hidden for Essential users who prefer less
visual noise.

**Consequences:** Essential users cannot see handoff status from the badge but will still receive
notifications and see the handoff in My Work Feed. Standard and Expert users see the badge inline
on the source record detail view.

---

### D-09 — Generic Type Contract: IHandoffPackage<TSource, TDest>

**Decision:** `IHandoffPackage<TSource, TDest>` and `IHandoffConfig<TSource, TDest>` are fully
generic over source and destination record types. The consuming module supplies the concrete types.
The shared package uses `Record<string, unknown>` as the default when no concrete types are
provided (e.g., in test fixtures).

**Rationale:** The handoff primitive serves multiple routes (BD→Estimating, Estimating→Project
Hub, etc.) with different source and destination schemas. Full generics provide end-to-end type
safety from `mapSourceToDestination` through `onAcknowledged` without requiring `any` casts.

**Consequences:** The `mapListItem<TSource, TDest>` API mapper must use try/catch JSON.parse for
`sourceSnapshot` since it is stored as a string in SharePoint. Type safety ends at the API
boundary; consuming modules should validate the parsed snapshot if needed.

---

### D-10 — Testing Sub-Path: `@hbc/workflow-handoff/testing`

**Decision:** A `./testing` export entry point exposes fixture factories
(`createMockHandoffPackage<S,D>`, `createMockHandoffConfig<S,D>`, `createMockHandoffDocument`,
`createMockContextNote`) and canonical state maps (`mockHandoffStates` — 5 states).
This sub-path is excluded from the production bundle. Consuming module tests import from this
sub-path to create consistent, predictable fixtures without duplicating factory logic.

**Rationale:** Consistent with the testing sub-path pattern established in SF-02, SF-05, SF-06,
and SF-07. The five canonical states map exactly to the five `HandoffStatus` values, ensuring
every state transition is testable from a standard baseline.

**Consequences:** Any consuming module that adds tests for handoff-related behavior must import
fixtures from `@hbc/workflow-handoff/testing` rather than defining its own mock packages.

---

## Compliance

This ADR is locked by CLAUDE.md §6.3 (Phase 7 Governance Rules). It may only be reversed or
modified by a superseding ADR with explicit rationale. The ten decisions above are the binding
implementation contract for `@hbc/workflow-handoff` and all consuming modules.
```

---

## Developer Adoption Guide

**File:** `docs/how-to/developer/workflow-handoff-adoption-guide.md`

```markdown
# How to Wire a New Handoff Route with `@hbc/workflow-handoff`

**Audience:** Module developers implementing a new cross-module handoff route
**Prerequisites:** Familiarity with `IHandoffConfig`, `IHandoffPackage`, and `HandoffStatus`
**Related:** `SF08-Workflow-Handoff.md` (master plan), ADR-0092

---

## Overview

A "handoff route" is a structured, auditable transfer of a source record from one module to
another. The `@hbc/workflow-handoff` package provides the state machine, components, and API
layer. Your job as the consuming module developer is to:

1. Implement an `IHandoffConfig<TSource, TDest>` object
2. Mount `HbcHandoffComposer` in the sender's record detail view
3. Mount `HbcHandoffReceiver` in the recipient's record view or work feed
4. Wire `HbcHandoffStatusBadge` into the sender's record detail
5. Update the sender module's BIC config to read `useHandoffStatus`

---

## Step 1 — Implement `IHandoffConfig<TSource, TDest>`

Create a config file in your module's `src/handoff/` directory:

```typescript
// packages/your-module/src/handoff/yourModuleToDestHandoffConfig.ts
import type { IHandoffConfig } from '@hbc/workflow-handoff';
import type { IYourSourceRecord } from '../types/IYourSourceRecord';
import type { IDestRecord } from '../../dest-module/src/types/IDestRecord';

export const yourModuleToDestHandoffConfig: IHandoffConfig<IYourSourceRecord, IDestRecord> = {
  sourceModule: 'your-module',
  sourceRecordType: 'your-record',
  destinationModule: 'dest-module',
  destinationRecordType: 'dest-record',
  routeLabel: 'Your Module Win → Dest Module Record',
  acknowledgeDescription: 'A Dest Record will be created with the data below. ...',

  mapSourceToDestination: (source) => ({
    // Map only fields relevant to the destination
    projectName: source.projectName,
    // ... other fields
  }),

  resolveDocuments: async (source) => {
    const docs = await DocumentApi.list({ contextId: source.id, contextType: 'your-record' });
    return docs.map((d) => ({
      documentId: d.id,
      fileName: d.fileName,
      sharepointUrl: d.sharepointUrl,
      category: d.category ?? 'General',
      fileSizeBytes: d.fileSizeBytes,
    }));
  },

  resolveRecipient: (source) => {
    if (!source.assignedRecipientId) return null;
    return { userId: source.assignedRecipientId, displayName: source.assignedRecipientName, role: 'Recipient Role' };
  },

  validateReadiness: (source) => {
    if (source.workflowStage !== 'ready-for-handoff') {
      return 'Record must be in ready-for-handoff stage before handoff.';
    }
    return null;
  },

  onAcknowledged: async (pkg) => {
    const record = await DestApi.createRecord(pkg.destinationSeedData, pkg.handoffId);
    await VersionApi.createSnapshot({
      recordType: 'your-record',
      recordId: pkg.sourceRecordId,
      snapshot: pkg.sourceSnapshot,
      tag: 'handoff',
      contextPayload: { handoffId: pkg.handoffId, destinationModule: 'dest-module', destinationRecordId: record.id },
    });
    return { destinationRecordId: record.id };
  },

  onRejected: async (pkg) => {
    await YourApi.returnToRevision(pkg.sourceRecordId, `Handoff rejected: ${pkg.rejectionReason}`);
  },
};
```

## Step 2 — Mount HbcHandoffComposer

In the sender's record detail view, mount the Composer when the user triggers handoff:

```tsx
import { HbcHandoffComposer } from '@hbc/workflow-handoff';
import { yourModuleToDestHandoffConfig } from './handoff/yourModuleToDestHandoffConfig';

function YourRecordDetail({ record }) {
  const [composerOpen, setComposerOpen] = useState(false);

  return (
    <>
      <button onClick={() => setComposerOpen(true)}>Initiate Handoff</button>
      {composerOpen && (
        <HbcHandoffComposer
          config={yourModuleToDestHandoffConfig}
          sourceRecord={record}
          onHandoffSent={(handoffId) => {
            setComposerOpen(false);
            // Optionally invalidate queries to refresh the source record
          }}
          onCancel={() => setComposerOpen(false)}
        />
      )}
    </>
  );
}
```

## Step 3 — Mount HbcHandoffReceiver

In the recipient's record view (or My Work Feed detail):

```tsx
import { HbcHandoffReceiver } from '@hbc/workflow-handoff';
import { yourModuleToDestHandoffConfig } from '../your-module/src/handoff/yourModuleToDestHandoffConfig';

function DestRecordHandoffView({ handoffId }) {
  return (
    <HbcHandoffReceiver
      handoffId={handoffId}
      config={yourModuleToDestHandoffConfig}
      onAcknowledged={(destinationRecordId) => {
        // Navigate to the newly created destination record
        router.navigate({ to: '/dest-module/$recordId', params: { recordId: destinationRecordId } });
      }}
      onRejected={(reason) => {
        // Optionally show a confirmation message
      }}
    />
  );
}
```

## Step 4 — Mount HbcHandoffStatusBadge

In the sender's record detail, adjacent to the record status or BIC badge:

```tsx
import { HbcHandoffStatusBadge } from '@hbc/workflow-handoff';

function YourRecordDetail({ record }) {
  return (
    <div className="record-status-bar">
      <HbcBicBadge ... />
      {record.activeHandoffId && (
        <HbcHandoffStatusBadge
          handoffId={record.activeHandoffId}
          status={record.activeHandoffStatus}
          acknowledgedAt={record.activeHandoffAcknowledgedAt}
          rejectedAt={record.activeHandoffRejectedAt}
        />
      )}
    </div>
  );
}
```

## Step 5 — Wire BIC Config for Handoff Period Ownership (D-05)

In your module's BIC config, integrate `useHandoffStatus` to transfer BIC ownership during handoff:

```typescript
import { useHandoffStatus } from '@hbc/workflow-handoff';

// In your record detail component (where BIC config lives):
const { status: handoffStatus, package: handoffPkg } = useHandoffStatus(record.activeHandoffId);

const bicConfig: IBicNextMoveConfig<IYourRecord> = {
  resolveCurrentOwner: (item) => {
    if (handoffStatus === 'sent' || handoffStatus === 'received') {
      return handoffPkg?.recipient ?? null;
    }
    return item.currentWorkflowOwner;
  },
  resolveExpectedAction: (item) => {
    if (handoffStatus === 'sent') return 'Review and acknowledge handoff package';
    if (handoffStatus === 'received') return 'Acknowledge or reject handoff package';
    return item.currentExpectedAction;
  },
  resolveIsBlocked: (item) => {
    if (handoffStatus === 'rejected') return true;
    return item.hasOtherBlockingCondition;
  },
  resolveBlockedReason: (item) => {
    if (handoffStatus === 'rejected') {
      return `Handoff rejected: ${handoffPkg?.rejectionReason ?? 'see details'}`;
    }
    return null;
  },
};
```

## Step 6 — Add Route to the Confirmed Routes Table

Update `SF08-Workflow-Handoff.md` § Confirmed Handoff Routes to add your new route with its
priority and package location.

---

## Boundary Rules (Do Not Violate)

- `@hbc/workflow-handoff` must NOT be imported by packages it depends on
  (`@hbc/bic-next-move`, `@hbc/versioned-record`, `@hbc/notification-intelligence`)
- Consuming modules must NOT import `@hbc/workflow-handoff` into `@hbc/workflow-handoff` itself
- The `testing/` sub-path must only be imported in test files

---

## Related Reference

- `SF08-T02-TypeScript-Contracts.md` — All types, interfaces, and constants
- `SF08-T03-Storage-and-API.md` — SharePoint list schema, Azure Functions, and HandoffApi
- `SF08-T07-Reference-Implementations.md` — `bdToEstimatingHandoffConfig` as a complete example
- `docs/reference/workflow-handoff/api.md` — Full API reference
```

---

## API Reference

**File:** `docs/reference/workflow-handoff/api.md`

Publish the following cross-reference table as the canonical API surface for `@hbc/workflow-handoff`. The detailed JSDoc on each export in the source files is the authoritative specification; this table serves as the navigation index.

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
| `createMockHandoffPackage<S,D>` | Testing factory | Creates fixture package in any status |
| `createMockHandoffConfig<S,D>` | Testing factory | Creates minimal mock config |
| `createMockHandoffDocument` | Testing factory | Creates a document link fixture |
| `createMockContextNote` | Testing factory | Creates a context note fixture |
| `mockHandoffStates` | Testing constant | 5-state fixture map keyed by `HandoffStatus` |

---

## Final Verification Commands

```bash
# ── Mechanical Enforcement Gates (must all pass — CLAUDE.md §6.3.3) ─────────

# 1. Build
pnpm turbo run build --filter @hbc/workflow-handoff...

# 2. Lint (boundary rules active)
pnpm turbo run lint --filter @hbc/workflow-handoff...

# 3. Type-check
pnpm --filter @hbc/workflow-handoff check-types

# 4. Tests (coverage required)
pnpm --filter @hbc/workflow-handoff test --coverage

# ── Architecture Boundary Checks ─────────────────────────────────────────────

# Must return zero matches
grep -r "from '@hbc/bic-next-move'" packages/workflow-handoff/src/ | grep -v "IBicOwner"
grep -r "from '@hbc/versioned-record'" packages/workflow-handoff/src/
grep -r "from '@hbc/notification-intelligence'" packages/workflow-handoff/src/
grep -r "from '@hbc/field-annotations'" packages/workflow-handoff/src/

# ── Integration Build Check ──────────────────────────────────────────────────

# Confirm reference implementations compile cleanly
pnpm turbo run build --filter packages/business-development...
pnpm turbo run check-types --filter packages/business-development...
pnpm turbo run build --filter packages/estimating...
pnpm turbo run check-types --filter packages/estimating...

# ── P1 Gate (CLAUDE.md §6.3.3) ───────────────────────────────────────────────
pnpm turbo run test \
  --filter=@hbc/auth-core \
  --filter=@hbc/shell \
  --filter=@hbc/ui-kit \
  --filter=@hbc/shared-kernel \
  --filter=@hbc/app-types

# ── Full Gate ─────────────────────────────────────────────────────────────────
pnpm turbo run build && pnpm turbo run lint && pnpm turbo run check-types
```

---

## Blueprint Progress Comment

After all gates pass, add this comment block to `SF08-Workflow-Handoff.md`:

```markdown
<!-- IMPLEMENTATION PROGRESS & NOTES
SF08 completed: {DATE}
T01-T09 implemented.
All four mechanical enforcement gates passed.
ADR created: docs/architecture/adr/0092-workflow-handoff-platform-primitive.md
Documentation added:
  - docs/how-to/developer/workflow-handoff-adoption-guide.md
  - docs/reference/workflow-handoff/api.md
current-state-map.md §2 updated: SF08 classification row added.
Next: Activate consuming modules per SF08-T07 confirmed handoff routes table.
  Priority: BD → Estimating (P0), then Estimating → Project Hub (P1).
-->
```

<!-- IMPLEMENTATION PROGRESS & NOTES
SF08-T09 not yet started.
This is the final task in the SF08 plan family.
After T09 completes, update current-state-map.md §2 with the SF08 classification row.
-->
