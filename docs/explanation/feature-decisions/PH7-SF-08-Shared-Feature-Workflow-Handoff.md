# PH7-SF-08: `@hbc/workflow-handoff` — Structured Cross-Module Workflow Handoff

**Priority Tier:** 1 — Foundation (must exist before any cross-module transition is implemented)
**Package:** `packages/workflow-handoff/`
**Interview Decision:** Q8 — Option B confirmed
**Mold Breaker Source:** UX-MB §10 (Workflow Composer); ux-mold-breaker.md Signature Solution #10; con-tech-ux-study §8 (BIC — ownership transfer gaps between modules)

---

## Problem Solved

The most critical transitions in construction project delivery cross module boundaries: a BD lead converts to an Estimating pursuit; an Estimating pursuit converts to a provisioned project; a project's Turnover Meeting handoff creates the operational record in Project Hub. These transitions require more than a status change — they require a structured transfer of context, documents, decisions, and responsibility.

Without a shared handoff infrastructure:
- Each module implements its own "convert to X" button with no consistent data transfer protocol
- The receiving module may receive incomplete or incorrectly formatted context
- There is no acknowledgment mechanism — the handoff may go unnoticed
- Documents from the source record may not be associated with the destination record
- The transition is a black box with no audit trail

**Confirmed Phase 7 cross-module handoffs:**

| Source | Destination | Trigger |
|---|---|---|
| BD Go/No-Go Scorecard (Won) | Estimating Active Pursuit | Director approval of Go decision |
| Estimating Active Pursuit | Project Hub Project record | Estimating project setup workflow completion |
| Project Hub Turnover Meeting | Project Hub operational record | All turnover sign-offs complete |
| Admin Provisioning | All modules | Provisioning completion unlocks module records |

---

## Mold Breaker Rationale

The ux-mold-breaker.md Signature Solution #10 (Workflow Composer) specifies: "Cross-module handoffs are structured events — not status changes." Operating Principle §7.2 (Responsibility-first) requires that the moment of handoff be a visible, acknowledged transfer of BIC ownership with a complete context package.

The con-tech UX study §8 documents that BIC ownership gaps are most severe at module boundaries — Procore's BIC exists within submittals and RFIs but does not bridge the transition from lead generation to project creation. HB Intel's `@hbc/workflow-handoff` is the industry's first attempt to make cross-module ownership transfer a first-class UX primitive.

---

## Interface Contract

```typescript
// packages/workflow-handoff/src/types/IWorkflowHandoff.ts

export type HandoffStatus = 'draft' | 'sent' | 'received' | 'acknowledged' | 'rejected';

export interface IHandoffPackage<TSource, TDest> {
  handoffId: string;
  /** Source module identifier */
  sourceModule: string;
  /** Source record ID */
  sourceRecordId: string;
  /** Source record type */
  sourceRecordType: string;
  /** Destination module identifier */
  destinationModule: string;
  /** Snapshot of source record at handoff moment (via @hbc/versioned-record) */
  sourceSnapshot: TSource;
  /** Mapped fields for destination record pre-population */
  destinationSeedData: Partial<TDest>;
  /** Documents transferred (resolved URLs from @hbc/sharepoint-docs) */
  documents: IHandoffDocument[];
  /** Structured context notes (key decisions, open items) */
  contextNotes: IHandoffContextNote[];
  /** Who is sending */
  sender: IBicOwner;
  /** Who must receive and acknowledge */
  recipient: IBicOwner;
  status: HandoffStatus;
  sentAt: string | null;
  acknowledgedAt: string | null;
  rejectedAt: string | null;
  rejectionReason: string | null;
}

export interface IHandoffDocument {
  documentId: string;
  fileName: string;
  sharepointUrl: string;
  category: string; // e.g., 'RFP', 'Bid Documents', 'Scope'
}

export interface IHandoffContextNote {
  noteId: string;
  category: string; // e.g., 'Key Decision', 'Open Item', 'Risk'
  body: string;
  author: IBicOwner;
}

export interface IHandoffConfig<TSource, TDest> {
  /** Source module identifier */
  sourceModule: string;
  /** Destination module identifier */
  destinationModule: string;
  /** Maps source record fields to destination seed data */
  mapSourceToDestination: (source: TSource) => Partial<TDest>;
  /** Resolves which documents to include */
  resolveDocuments: (source: TSource) => Promise<IHandoffDocument[]>;
  /** Resolves the recipient */
  resolveRecipient: (source: TSource) => IBicOwner;
  /** Pre-flight validation: returns null if ready, error message if not */
  validateReadiness: (source: TSource) => string | null;
  /** Called when recipient acknowledges; creates destination record */
  onAcknowledged: (pkg: IHandoffPackage<TSource, TDest>) => Promise<void>;
  /** Called when recipient rejects; returns BIC to sender */
  onRejected: (pkg: IHandoffPackage<TSource, TDest>) => Promise<void>;
}
```

---

## Package Architecture

```
packages/workflow-handoff/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts
│   ├── types/
│   │   ├── IWorkflowHandoff.ts
│   │   └── index.ts
│   ├── api/
│   │   └── HandoffApi.ts                 # send, acknowledge, reject, get package
│   ├── hooks/
│   │   ├── usePrepareHandoff.ts          # builds package from source record
│   │   ├── useHandoffInbox.ts            # lists pending handoff packages for current user
│   │   └── useHandoffStatus.ts           # tracks status of an outbound handoff
│   └── components/
│       ├── HbcHandoffComposer.tsx        # sender: builds and sends handoff package
│       ├── HbcHandoffReceiver.tsx        # recipient: reviews and acknowledges package
│       ├── HbcHandoffStatusBadge.tsx     # status indicator on source record
│       └── index.ts
```

---

## Component Specifications

### `HbcHandoffComposer` — Sender UI

A multi-step panel where the sender prepares and transmits the handoff package.

```typescript
interface HbcHandoffComposerProps<TSource, TDest> {
  sourceRecord: TSource;
  config: IHandoffConfig<TSource, TDest>;
  onHandoffSent?: (pkg: IHandoffPackage<TSource, TDest>) => void;
}
```

**Visual behavior (step flow):**
1. **Pre-flight check**: Runs `validateReadiness`. Shows list of readiness items (✓ complete / ✗ blocking). Cannot proceed if any blocking item is unresolved.
2. **Review package**: Shows auto-assembled destination seed data, document list, and context notes. Sender can edit context notes and add/remove documents.
3. **Confirm recipient**: Shows recipient name + role. Sender can override if `config.resolveRecipient` returns null.
4. **Send**: CTA "Send Handoff Package" → confirms action → `HandoffApi.send()` → status → `sent`.

### `HbcHandoffReceiver` — Recipient UI

Rendered in the recipient's My Work Feed action item and accessible from the destination module.

```typescript
interface HbcHandoffReceiverProps<TSource, TDest> {
  handoffId: string;
  config: IHandoffConfig<TSource, TDest>;
  onAcknowledged?: () => void;
  onRejected?: () => void;
}
```

**Visual behavior:**
- Header: "Handoff from [Sender Name] · [Source Module] → [Destination Module]"
- Section: **Source Record Summary** — key fields from the source snapshot
- Section: **Documents** — list of attached documents with download links
- Section: **Context Notes** — structured key decisions, open items, risks
- Section: **What happens next** — describes what `onAcknowledged` will create
- CTA: "Acknowledge & Create [Destination Record]" → runs `onAcknowledged` → destination record created
- CTA: "Reject with Reason" → requires rejection reason text → runs `onRejected` → BIC returns to sender

### `HbcHandoffStatusBadge` — Source Record Status

```typescript
interface HbcHandoffStatusBadgeProps {
  handoffId: string | null;
  status: HandoffStatus | null;
}
```

**Visual behavior:**
- `null`: no badge
- `draft`: grey "Handoff Draft"
- `sent`: blue "Awaiting Acknowledgment"
- `acknowledged`: green "Handoff Acknowledged"
- `rejected`: red "Handoff Rejected — Revision Required"

---

## Handoff Lifecycle: BD → Estimating Example

```typescript
// BD module defines the BD-to-Estimating handoff config
export const bdToEstimatingHandoffConfig: IHandoffConfig<IGoNoGoScorecard, IEstimatingPursuit> = {
  sourceModule: 'business-development',
  destinationModule: 'estimating',
  mapSourceToDestination: (scorecard) => ({
    projectName: scorecard.projectName,
    clientName: scorecard.ownerName,
    location: scorecard.projectLocation,
    estimatedValue: scorecard.estimatedProjectValue,
    bidDueDate: scorecard.bidDueDate,
    projectType: scorecard.projectType,
    bdLeadId: scorecard.id,
    bdHeritageNotes: scorecard.strategicIntelligenceSummary,
  }),
  resolveDocuments: async (scorecard) => {
    const docs = await DocumentApi.list({ contextId: scorecard.id, contextType: 'bd-lead' });
    return docs.map(d => ({ documentId: d.id, fileName: d.fileName, sharepointUrl: d.sharepointUrl, category: d.category }));
  },
  resolveRecipient: (scorecard) => ({
    userId: scorecard.estimatingCoordinatorId,
    displayName: scorecard.estimatingCoordinatorName,
    role: 'Estimating Coordinator',
  }),
  validateReadiness: (scorecard) => {
    if (scorecard.workflowStage !== 'director-approved') return 'Scorecard must be approved before handoff.';
    if (scorecard.incompleteDepartmentalSections.length > 0) return 'All departmental sections must be complete.';
    return null;
  },
  onAcknowledged: async (pkg) => {
    await EstimatingApi.createPursuit(pkg.destinationSeedData, pkg.handoffId);
    await VersionApi.createSnapshot({ recordType: 'bd-scorecard', recordId: pkg.sourceRecordId, tag: 'handoff', snapshot: pkg.sourceSnapshot });
  },
  onRejected: async (pkg) => {
    await ScorecardApi.returnToRevision(pkg.sourceRecordId, pkg.rejectionReason);
  },
};
```

---

## Integration Points

| Package | Integration |
|---|---|
| `@hbc/bic-next-move` | Handoff sent → BIC transfers to recipient; rejection → BIC returns to sender; acknowledgment → new BIC in destination module |
| `@hbc/sharepoint-docs` | Document URLs in handoff package are resolved and updated if migration has occurred |
| `@hbc/versioned-record` | Source record snapshot captured at handoff moment; pinned to `tag: 'handoff'` |
| `@hbc/acknowledgment` | Handoff receipt acknowledgment uses `@hbc/acknowledgment` pattern (single-party, required) |
| `@hbc/field-annotations` | Recipient can flag specific fields in the handoff package before acknowledging |
| `@hbc/notification-intelligence` | Handoff sent → Immediate notification to recipient; acknowledgment → Watch notification to sender |
| PH9b My Work Feed (§A) | Pending handoffs appear in recipient's My Work Feed as high-priority action items |

---

## SPFx Constraints

- `HbcHandoffComposer` and `HbcHandoffReceiver` are PWA-primary; in SPFx contexts, a simplified inline version is used
- `HbcHandoffStatusBadge` is SPFx-compatible via `@hbc/ui-kit/app-shell`
- `HandoffApi` routes through Azure Functions backend

---

## Priority & ROI

**Priority:** P0 — The BD-to-Estimating and Estimating-to-Project transitions are the most critical business workflows in HB Intel; without structured handoff, these transitions are email-based and untracked
**Estimated build effort:** 5–6 sprint-weeks (complex multi-step composer, receiver, API, BIC integration, document resolution)
**ROI:** Eliminates the "transition black hole" between BD and Estimating; creates complete chain-of-custody from lead origination through project delivery; makes the first truly cross-module ownership transfer visible in BIC

---

## Definition of Done

- [ ] `IHandoffConfig<TSource, TDest>` contract defined and exported
- [ ] `HandoffApi.send()`, `acknowledge()`, `reject()`, `get()` implemented via Azure Functions
- [ ] `usePrepareHandoff` assembles handoff package from source record + config
- [ ] `useHandoffInbox` returns pending handoff packages for current user
- [ ] `useHandoffStatus` tracks outbound handoff status changes
- [ ] `HbcHandoffComposer` 4-step flow: pre-flight → review → recipient → send
- [ ] `HbcHandoffReceiver` renders summary, documents, context notes, acknowledge/reject CTAs
- [ ] `HbcHandoffStatusBadge` renders all 5 status states
- [ ] BD-to-Estimating handoff config implemented as reference implementation
- [ ] BIC integration: send → transfer to recipient; rejection → return to sender
- [ ] `@hbc/versioned-record` integration: snapshot at handoff moment
- [ ] `@hbc/sharepoint-docs` integration: document URL resolution + migration-awareness
- [ ] Notification registration: sent → Immediate; acknowledged → Watch
- [ ] Unit tests ≥95% on handoff state machine and field mapping logic
- [ ] E2E test: BD scorecard → handoff sent → received → acknowledged → Estimating pursuit created

---

## ADR Reference

Create `docs/architecture/adr/0017-workflow-handoff-platform-primitive.md` documenting the decision to implement cross-module handoffs as structured packages rather than status-change events, the BIC transfer protocol, the document URL resolution strategy, and the pre-flight validation requirement.
