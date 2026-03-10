# SF08-T07 — Reference Implementations and Platform Wiring

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-08-Shared-Feature-Workflow-Handoff.md`
**Decisions Applied:** D-04 (snapshot semantics), D-05 (BIC transfer), D-06 (document URL migration), D-07 (rejection semantics)
**Estimated Effort:** 0.75 sprint-weeks
**Depends On:** T01–T06

> **Doc Classification:** Canonical Normative Plan — SF08-T07 reference implementations and platform wiring task; sub-plan of `SF08-Workflow-Handoff.md`.

---

## Objective

Implement the BD-to-Estimating and Estimating-to-Project Hub `IHandoffConfig` instances as the two canonical Phase 7 consumers. Document and validate all platform integration patterns (BIC, versioned-record, notifications, field-annotations, acknowledgment) in the dev-harness.

---

## 3-Line Plan

1. Implement `bdToEstimatingHandoffConfig` (P0 reference implementation) in `packages/business-development/`.
2. Implement `estimatingToProjectHubHandoffConfig` (P1 implementation) in `packages/estimating/`.
3. Validate all integration patterns end-to-end in the dev-harness with the BD→Estimating route.

---

## Reference Implementation 1: BD → Estimating (P0)

### File Location

`packages/business-development/src/handoff/bdToEstimatingHandoffConfig.ts`

```typescript
import type { IHandoffConfig, IHandoffDocument } from '@hbc/workflow-handoff';
import type { IGoNoGoScorecard } from '../types/IGoNoGoScorecard';
import type { IEstimatingPursuit } from '../../estimating/src/types/IEstimatingPursuit';
import { DocumentApi } from '@hbc/sharepoint-docs';
import { EstimatingApi } from '../../estimating/src/api/EstimatingApi';
import { VersionApi } from '@hbc/versioned-record';
import { ScorecardApi } from '../api/ScorecardApi';

/**
 * BD → Estimating Handoff Configuration.
 *
 * Route: BD Go/No-Go Scorecard (Won) → Estimating Active Pursuit
 * Trigger: Director approval of Go decision
 * Pre-flight: workflowStage must be 'director-approved';
 *             all departmental sections complete;
 *             no open clarification-request or flag-for-revision annotations
 *
 * @see SF08-Field-Annotations.md D-03 for BIC blocking from open annotations
 * @see SF07-Workflow-Handoff.md D-05 for BIC transfer on send
 */
export const bdToEstimatingHandoffConfig: IHandoffConfig<IGoNoGoScorecard, IEstimatingPursuit> = {
  sourceModule: 'business-development',
  sourceRecordType: 'bd-scorecard',
  destinationModule: 'estimating',
  destinationRecordType: 'estimating-pursuit',
  routeLabel: 'BD Win → Estimating Pursuit',
  acknowledgeDescription:
    'An Estimating Pursuit will be created and pre-populated with the project data below. ' +
    'The Estimating Coordinator will become the new BIC owner.',

  // ── Field mapping (D-04: frozen at assembly time) ────────────────────────
  mapSourceToDestination: (scorecard) => ({
    projectName: scorecard.projectName,
    clientName: scorecard.ownerName,
    location: scorecard.projectLocation,
    estimatedGMP: scorecard.estimatedProjectValue,
    bidDueDate: scorecard.bidDueDate,
    projectType: scorecard.projectType,
    // Cross-reference to source record for audit trail
    bdScorecardId: scorecard.id,
    // BD strategic intelligence surfaces in Estimating as heritage notes
    bdHeritageNotes: scorecard.strategicIntelligenceSummary,
    // Owner relationships transferred for Estimating relationship context
    keyOwnerContactName: scorecard.keyOwnerContactName,
    keyOwnerContactEmail: scorecard.keyOwnerContactEmail,
  }),

  // ── Document resolution (D-06: async; links only) ───────────────────────
  resolveDocuments: async (scorecard) => {
    const docs = await DocumentApi.list({
      contextId: scorecard.id,
      contextType: 'bd-scorecard',
    });
    return docs.map(
      (d): IHandoffDocument => ({
        documentId: d.id,
        fileName: d.fileName,
        sharepointUrl: d.sharepointUrl,
        category: d.category ?? 'General',
        fileSizeBytes: d.fileSizeBytes,
      })
    );
  },

  // ── Recipient resolution ─────────────────────────────────────────────────
  resolveRecipient: (scorecard) => {
    if (!scorecard.estimatingCoordinatorId || !scorecard.estimatingCoordinatorName) {
      // Return null → Composer Step 3 surfaces manual picker
      return null;
    }
    return {
      userId: scorecard.estimatingCoordinatorId,
      displayName: scorecard.estimatingCoordinatorName,
      role: 'Estimating Coordinator',
    };
  },

  // ── Pre-flight validation (D-03: synchronous) ────────────────────────────
  validateReadiness: (scorecard) => {
    if (scorecard.workflowStage !== 'director-approved') {
      return 'Scorecard must be approved by the Director of Preconstruction before handoff.';
    }
    if ((scorecard.incompleteDepartmentalSections?.length ?? 0) > 0) {
      return `All departmental sections must be complete. ` +
             `Incomplete: ${scorecard.incompleteDepartmentalSections.join(', ')}.`;
    }
    // Note: open annotation check is also recommended — consuming module wires this
    // via the BIC blocking pattern (see SF07-T07 D-03 integration pattern)
    return null;
  },

  // ── Acknowledgment handler (D-05: creates destination record) ────────────
  onAcknowledged: async (pkg) => {
    // 1. Create the Estimating pursuit from the mapped seed data
    const pursuit = await EstimatingApi.createPursuit(
      pkg.destinationSeedData,
      pkg.handoffId
    );

    // 2. Create a versioned-record snapshot of the source scorecard tagged 'handoff'
    //    This preserves the exact state at the moment of handoff for audit trail
    await VersionApi.createSnapshot({
      recordType: 'bd-scorecard',
      recordId: pkg.sourceRecordId,
      snapshot: pkg.sourceSnapshot,
      tag: 'handoff',
      contextPayload: {
        handoffId: pkg.handoffId,
        destinationModule: pkg.destinationModule,
        destinationRecordId: pursuit.id,
      },
    });

    return { destinationRecordId: pursuit.id };
  },

  // ── Rejection handler (D-07: BIC return to sender) ────────────────────────
  onRejected: async (pkg) => {
    // Return the scorecard to its pre-handoff revision state
    await ScorecardApi.returnToRevision(
      pkg.sourceRecordId,
      `Handoff rejected: ${pkg.rejectionReason}`
    );
    // BIC return is handled by the consuming module's BIC config reading handoff status (D-05)
  },
};
```

---

## Reference Implementation 2: Estimating → Project Hub (P1)

### File Location

`packages/estimating/src/handoff/estimatingToProjectHubConfig.ts`

```typescript
import type { IHandoffConfig, IHandoffDocument } from '@hbc/workflow-handoff';
import type { IEstimatingPursuit } from '../types/IEstimatingPursuit';
import type { IProjectRecord } from '../../project-hub/src/types/IProjectRecord';
import { DocumentApi } from '@hbc/sharepoint-docs';
import { ProjectHubApi } from '../../project-hub/src/api/ProjectHubApi';
import { VersionApi } from '@hbc/versioned-record';
import { EstimatingApi } from '../api/EstimatingApi';

export const estimatingToProjectHubConfig: IHandoffConfig<IEstimatingPursuit, IProjectRecord> = {
  sourceModule: 'estimating',
  sourceRecordType: 'estimating-pursuit',
  destinationModule: 'project-hub',
  destinationRecordType: 'project-record',
  routeLabel: 'Estimating Win → Project Hub Project',
  acknowledgeDescription:
    'A Project Hub project record will be created with all estimating data pre-loaded. ' +
    'The Project Manager will become the new BIC owner.',

  mapSourceToDestination: (pursuit) => ({
    projectName: pursuit.projectName,
    clientName: pursuit.clientName,
    location: pursuit.location,
    awardedGMP: pursuit.finalBidAmount,
    projectType: pursuit.projectType,
    estimatingPursuitId: pursuit.id,
    bdScorecardId: pursuit.bdScorecardId,
    estimatingLeadId: pursuit.leadEstimatorId,
    // Bid documents are directly useful for project setup
    keyContractTerms: pursuit.contractTermsSummary,
  }),

  resolveDocuments: async (pursuit) => {
    const docs = await DocumentApi.list({ contextId: pursuit.id, contextType: 'estimating-pursuit' });
    return docs.map(
      (d): IHandoffDocument => ({
        documentId: d.id,
        fileName: d.fileName,
        sharepointUrl: d.sharepointUrl,
        category: d.category ?? 'Estimating Documents',
        fileSizeBytes: d.fileSizeBytes,
      })
    );
  },

  resolveRecipient: (pursuit) => {
    if (!pursuit.assignedProjectManagerId) return null;
    return {
      userId: pursuit.assignedProjectManagerId,
      displayName: pursuit.assignedProjectManagerName ?? 'Project Manager',
      role: 'Project Manager',
    };
  },

  validateReadiness: (pursuit) => {
    if (pursuit.workflowStage !== 'award-confirmed') {
      return 'Award must be confirmed before handoff to Project Hub.';
    }
    if (!pursuit.finalBidAmount || pursuit.finalBidAmount <= 0) {
      return 'Final bid amount must be entered before handoff.';
    }
    return null;
  },

  onAcknowledged: async (pkg) => {
    const project = await ProjectHubApi.createProject(
      pkg.destinationSeedData,
      pkg.handoffId
    );

    await VersionApi.createSnapshot({
      recordType: 'estimating-pursuit',
      recordId: pkg.sourceRecordId,
      snapshot: pkg.sourceSnapshot,
      tag: 'handoff',
      contextPayload: {
        handoffId: pkg.handoffId,
        destinationModule: 'project-hub',
        destinationRecordId: project.id,
      },
    });

    return { destinationRecordId: project.id };
  },

  onRejected: async (pkg) => {
    await EstimatingApi.returnToRevision(
      pkg.sourceRecordId,
      `Handoff to Project Hub rejected: ${pkg.rejectionReason}`
    );
  },
};
```

---

## Platform Wiring Validation

### BIC Integration (D-05)

The consuming module's BIC config reads `useHandoffStatus` to derive BIC state during the handoff period:

```typescript
// In the BD Scorecard module's BIC config — handoff period ownership
import { useHandoffStatus } from '@hbc/workflow-handoff';

// In the record detail component:
const { status: handoffStatus, package: handoffPkg } = useHandoffStatus(scorecard.activeHandoffId);

// Derive BIC state from handoff status
const bicConfig: IBicNextMoveConfig<IBdScorecard & { handoffStatus: HandoffStatus | null }> = {
  // ...
  resolveCurrentOwner: (item) => {
    if (item.handoffStatus === 'sent' || item.handoffStatus === 'received') {
      // BIC owner is the handoff recipient during the pending period (D-05)
      return handoffPkg?.recipient ?? null;
    }
    return item.currentWorkflowOwner;
  },
  resolveExpectedAction: (item) => {
    if (item.handoffStatus === 'sent') return 'Review and acknowledge handoff package';
    if (item.handoffStatus === 'received') return 'Acknowledge or reject handoff package';
    return item.currentExpectedAction;
  },
  resolveIsBlocked: (item) => {
    if (item.handoffStatus === 'rejected') return true;
    return item.hasOtherBlockingCondition;
  },
  resolveBlockedReason: (item) => {
    if (item.handoffStatus === 'rejected') {
      return `Handoff rejected: ${handoffPkg?.rejectionReason ?? 'see details'}`;
    }
    return null;
  },
};
```

### Versioned Record Integration (D-04 + onAcknowledged)

The snapshot is created inside `onAcknowledged` (shown in reference implementations above). Key points:
- Tag: `'handoff'` — this pinned version is always findable in the version history with this tag
- `contextPayload` includes `handoffId` for cross-reference in the audit trail
- The snapshot type matches `TSource` — fully typed through the generic chain

### Notification Intelligence Integration

Notifications are registered by the Azure Functions layer (T03). The client-side package does not import `@hbc/notification-intelligence`. The three notification events:

| Trigger | Azure Function | Tier | Recipient |
|---|---|---|---|
| `HandoffApi.send()` succeeds | `handoffSend.ts` | Immediate | `RecipientUserId` |
| `HandoffApi.acknowledge()` succeeds | `handoffAcknowledge.ts` | Watch | `SenderUserId` |
| `HandoffApi.reject()` succeeds | `handoffReject.ts` | Watch | `SenderUserId` (with rejection reason in body) |

### Field Annotations Integration

`HbcHandoffReceiver` renders `HbcAnnotationMarker` components adjacent to each `destinationSeedData` field. The consuming module wires this by passing `annotationConfig` to the Receiver:

```tsx
<HbcHandoffReceiver
  handoffId={handoff.handoffId}
  config={bdToEstimatingHandoffConfig}
  annotationConfig={{
    recordType: 'workflow-handoff',
    blocksBicOnOpenAnnotations: false,  // Annotations on handoff are informational
    allowAssignment: true,
    requireResolutionNote: false,
  }}
  onAcknowledged={handleAcknowledged}
  onRejected={handleRejected}
/>
```

### Acknowledgment Package Integration

`HbcHandoffReceiver` composing `@hbc/acknowledgment` for the sign-off CTA is the intended pattern. The Receiver's "Acknowledge & Create" button is the acknowledgment event. The consuming module may extend this by wiring an `@hbc/acknowledgment` `IHandoffAcknowledgmentRecord` for legally defensible sign-off tracking.

---

## Dev-Harness Validation Sequence

Execute this full lifecycle in the dev-harness to confirm all integrations are working:

```
1. Open BD Scorecard in 'director-approved' state
2. Click "Initiate Handoff" → HbcHandoffComposer opens
3. Step 1: Confirm preflight passes (workflowStage = director-approved)
4. Step 2: Review mapped fields, documents, add a "Key Decision" context note
5. Step 3: Confirm recipient (Estimating Coordinator)
6. Step 4: Send → confirm Immediate notification fired, BIC transfers to recipient
7. Confirm HbcHandoffStatusBadge shows "Awaiting Acknowledgment" (blue) on scorecard
8. Switch to recipient user → confirm handoff in My Work Feed with high-priority badge
9. Open HbcHandoffReceiver → confirm source summary, documents, context notes
10. Add a field annotation ("clarification-request" on estimatedGMP field)
11. Click "Acknowledge" → confirm Estimating Pursuit created, Watch notification to sender
12. Confirm HbcHandoffStatusBadge shows "Handoff Acknowledged" (green)
13. Confirm versioned-record snapshot with tag='handoff' exists on the scorecard
```

Also run the rejection path:
```
14. Reset to step 7 (handoff sent state)
15. Switch to recipient → click "Reject with Reason"
16. Enter rejection reason → confirm Watch notification to sender
17. Confirm HbcHandoffStatusBadge shows "Handoff Rejected" (red)
18. Confirm BIC returns to sender with blocked state and rejection reason
```

---

## Verification Commands

```bash
# Architecture check — workflow-handoff does not import bic-next-move (except IBicOwner) or versioned-record
grep -r "from '@hbc/bic-next-move'" packages/workflow-handoff/src/ | grep -v "IBicOwner"
grep -r "from '@hbc/versioned-record'" packages/workflow-handoff/src/
grep -r "from '@hbc/notification-intelligence'" packages/workflow-handoff/src/
# Expected: zero matches for all three

# Build reference implementations (requires consuming modules to be built first)
pnpm turbo run build --filter @hbc/workflow-handoff...
pnpm turbo run build --filter packages/business-development...

# Type-check
pnpm --filter @hbc/workflow-handoff check-types
```

<!-- IMPLEMENTATION PROGRESS & NOTES
SF08-T07 not yet started.
Next: SF08-T08 (Testing Strategy)
-->
