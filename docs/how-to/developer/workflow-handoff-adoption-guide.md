# How to Wire a New Handoff Route with `@hbc/workflow-handoff`

**Audience:** Module developers implementing a new cross-module handoff route
**Prerequisites:** Familiarity with `IHandoffConfig`, `IHandoffPackage`, and `HandoffStatus`
**Related:** `SF08-Workflow-Handoff.md` (master plan), ADR-0097

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
