# SF07-T07 — Platform Wiring: BIC, Versioned Record, Notifications & Complexity

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-07-Shared-Feature-Field-Annotations.md`
**Decisions Applied:** D-03 (BIC blocking), D-04 (versioned-record), D-05 (complexity modes), D-08 (notification registration)
**Estimated Effort:** 0.5 sprint-weeks
**Depends On:** T01–T06

> **Doc Classification:** Canonical Normative Plan — SF07-T07 platform wiring task; sub-plan of `SF07-Field-Annotations.md`.

---

## Objective

Validate and document all integration points between `@hbc/field-annotations` and the four platform packages it integrates with: `@hbc/bic-next-move`, `@hbc/versioned-record`, `@hbc/notification-intelligence`, and `@hbc/complexity`. This task produces no new component code — it produces verified integration patterns, the consuming module adoption guide, and confirmation that all wiring works end-to-end in the dev-harness.

---

## 3-Line Plan

1. Validate the BIC blocking integration pattern using a dev-harness test page with a sample BD scorecard annotation flow.
2. Validate versioned-record integration by confirming `versionNumber` is stored on annotation creation and retrieved on resolution.
3. Confirm notification registration, complexity gating, and My Work Feed appearance by exercising the full annotation lifecycle in the dev-harness.

---

## Integration 1: BIC Blocking (`@hbc/bic-next-move`) (D-03)

### Architecture Boundary

`@hbc/field-annotations` does **NOT** import `@hbc/bic-next-move`. The boundary is maintained via an inversion-of-control pattern where the consuming module's BIC config resolver reads annotation state directly.

### How It Works

```
@hbc/field-annotations    ←── consuming module ──→   @hbc/bic-next-move
       ↓ provides                                          ↑ consumed by
useFieldAnnotations()                             IBicNextMoveConfig.resolveIsBlocked
       ↓ counts                                           resolveBlockedReason
IAnnotationCounts                                           ↑
       ↓ passes to                                          |
BdScorecardBicConfig ──────────────────────────────────────┘
```

### Consuming Module Pattern

The consuming module stores open annotation counts in a lightweight module-level store or uses a prop from the parent component:

```typescript
// packages/bd-scorecard/src/bic/bdScorecardBicConfig.ts
import type { IBicNextMoveConfig } from '@hbc/bic-next-move';
import type { IBdScorecard } from '../types';

/**
 * BIC config for BD Scorecard.
 * resolveIsBlocked reads annotation counts passed from the component layer
 * via the item shape — the scorecard item must carry openAnnotationCounts
 * as a computed field populated by the parent component.
 *
 * This keeps @hbc/field-annotations and @hbc/bic-next-move fully decoupled
 * while enabling BIC blocking from annotations.
 */
export const bdScorecardBicConfig: IBicNextMoveConfig<IBdScorecard & { openAnnotationCounts?: IAnnotationCounts }> = {
  ownershipModel: 'workflow-state-derived',
  // ... other resolvers ...

  resolveIsBlocked: (item) => {
    // Annotation blocking (D-03)
    const annotationBlocked =
      (item.openAnnotationCounts?.openClarificationRequests ?? 0) > 0 ||
      (item.openAnnotationCounts?.openRevisionFlags ?? 0) > 0;
    // Other blocking conditions (existing workflow constraints) ...
    return annotationBlocked || item.hasOtherBlockingCondition;
  },

  resolveBlockedReason: (item) => {
    const clarifications = item.openAnnotationCounts?.openClarificationRequests ?? 0;
    const flags = item.openAnnotationCounts?.openRevisionFlags ?? 0;
    const total = clarifications + flags;
    if (total > 0) {
      return `${total} open annotation${total > 1 ? 's' : ''} require resolution before advancing`;
    }
    return item.otherBlockedReason ?? null;
  },
};
```

### Dev-Harness Validation

Validate this end-to-end in the dev-harness:

1. Open BD Scorecard detail page with annotation support enabled
2. Add a `clarification-request` annotation to the "Total Buildable Area" field
3. Confirm `HbcBicBlockedBanner` appears on the scorecard with the correct blocked reason
4. Resolve the annotation
5. Confirm `HbcBicBlockedBanner` disappears and BIC advances

---

## Integration 2: Versioned Record (`@hbc/versioned-record`) (D-04)

### Architecture Boundary

`@hbc/field-annotations` does NOT import `@hbc/versioned-record`. Integration is via a lightweight convention: the consuming module passes the current version number when creating or resolving annotations.

### Fields on `IFieldAnnotation`

| Field | Set By | Purpose |
|---|---|---|
| `createdAtVersion` | Consuming module at annotation creation | Records the record version when the annotation was added |
| `resolvedAtVersion` | Consuming module at annotation resolution | Records the record version when the annotation was resolved |

### Consuming Module Pattern

```typescript
// In the consuming module's annotation handler (e.g., BD Scorecard review form)
import { useAnnotationActions } from '@hbc/field-annotations';
import { useVersionHistory } from '@hbc/versioned-record';

function useScorecardAnnotations(scorecard: IBdScorecard) {
  const { currentVersion } = useVersionHistory('bd-scorecard', scorecard.id);
  const actions = useAnnotationActions('bd-scorecard', scorecard.id);

  const createAnnotation = useCallback(
    (input: Omit<ICreateAnnotationInput, 'createdAtVersion'>) =>
      actions.createAnnotation({
        ...input,
        createdAtVersion: currentVersion?.versionNumber ?? null, // D-04
      }),
    [actions, currentVersion]
  );

  const resolveAnnotation = useCallback(
    (input: Omit<IResolveAnnotationInput, 'resolvedAtVersion'>) =>
      actions.resolveAnnotation({
        ...input,
        resolvedAtVersion: currentVersion?.versionNumber ?? null, // D-04
      }),
    [actions, currentVersion]
  );

  return { createAnnotation, resolveAnnotation };
}
```

### Snapshot Payload Convention

When `@hbc/versioned-record` creates a snapshot for a record that uses annotations, the consuming module may include open annotation counts as a `contextPayload` field in the snapshot. This preserves the annotation state at the moment of each version for audit trail purposes:

```typescript
// In the consuming module's version snapshot creation
VersionApi.createSnapshot({
  recordType: 'bd-scorecard',
  recordId: scorecard.id,
  snapshot: scorecardData,
  contextPayload: {
    openAnnotations: annotationCounts.totalOpen,
    openClarificationRequests: annotationCounts.openClarificationRequests,
    openRevisionFlags: annotationCounts.openRevisionFlags,
  },
});
```

---

## Integration 3: Notification Intelligence (`@hbc/notification-intelligence`) (D-08)

### Notification Registration

Notification events are registered by the Azure Functions layer (T03) during annotation mutations. The client-side package (`@hbc/field-annotations`) does NOT directly import `@hbc/notification-intelligence`.

### Event Table

| Trigger | Tier | Recipient | Registered By |
|---|---|---|---|
| New annotation created (with `assignedTo`) | Immediate | `assignedTo.userId` | `fieldAnnotationsCreate` Azure Function |
| New annotation created (no `assignedTo`) | Immediate | Record owner (looked up via provisioning context) | `fieldAnnotationsCreate` Azure Function |
| Annotation resolved | Watch | Original `author.userId` | `fieldAnnotationsResolve` Azure Function |
| Annotation withdrawn | Watch | Previous `assignedTo.userId` (if existed) | `fieldAnnotationsWithdraw` Azure Function |

### My Work Feed Integration

Unresolved annotations where `assignedTo.userId === currentUser.id` appear in the My Work Feed (PH9b §A). The My Work Feed queries open annotations via:

```typescript
// In the My Work Feed module bootstrap
import { AnnotationApi } from '@hbc/field-annotations';

// Called by the My Work Feed's own data aggregation layer
async function fetchMyAnnotations(userId: string): Promise<IBicRegisteredItem[]> {
  // Query all open annotations assigned to this user
  const annotations = await AnnotationApi.list('', '', { status: 'open' });
  // Filter to current user's assigned annotations
  return annotations
    .filter((a) => a.assignedTo?.userId === userId)
    .map((a) => ({
      itemKey: `field-annotation::${a.annotationId}`,
      moduleKey: 'field-annotation',
      moduleLabel: 'Annotations',
      // BIC state derived from annotation properties
      state: {
        currentOwner: a.assignedTo,
        expectedAction: `Resolve ${intentLabel[a.intent].toLowerCase()} on "${a.fieldLabel}"`,
        dueDate: null,
        isOverdue: false,
        isBlocked: false,
        blockedReason: null,
        previousOwner: a.author,
        nextOwner: null,
        escalationOwner: null,
        transferHistory: [],
        urgencyTier: 'watch' as const,
      },
      href: `/${a.recordType}/${a.recordId}?highlightField=${a.fieldKey}`,
      title: `${a.recordType}: ${a.fieldLabel} annotation`,
    }));
}
```

---

## Integration 4: Complexity Dial (`@hbc/complexity`) (D-05)

### Verification Checklist

In the dev-harness, set complexity tier and confirm annotation UI responds correctly:

| Complexity Tier | `HbcAnnotationMarker` | `HbcAnnotationThread` | `HbcAnnotationSummary` |
|---|---|---|---|
| Essential | Hidden — no DOM node | Not rendered | Hidden — no DOM node |
| Standard | Colored dot + tooltip | Popover with thread + "Show resolved" toggle | Collapsed header (count only) |
| Expert | Colored dot + open count badge | Popover with inline reply form | Expanded with per-field breakdown |

### Dev-Harness Verification Sequence

```
1. Set complexity → Essential
   → Confirm no annotation markers visible on any form field
   → Confirm HbcAnnotationSummary not in DOM

2. Set complexity → Standard
   → Confirm markers visible on annotated fields
   → Click marker → confirm popover opens
   → Confirm resolved toggle works

3. Set complexity → Expert
   → Confirm count badge on markers
   → Confirm inline reply form in thread
   → Confirm HbcAnnotationSummary expanded with per-field breakdown
```

---

## Integration 5: `@hbc/acknowledgment` (cross-reference)

When a reviewer uses `@hbc/acknowledgment` to sign off on a record, open annotations that are `clarification-request` or `flag-for-revision` should block the acknowledgment or at minimum surface a warning.

### Pattern

The `@hbc/acknowledgment` pre-sign-off panel can include `HbcAnnotationSummary` to surface open annotations before the reviewer signs:

```tsx
// In the HbcAcknowledgmentPanel pre-sign-off review step
{openAnnotationCounts.totalOpen > 0 && (
  <HbcAnnotationSummary
    recordType={recordType}
    recordId={recordId}
    config={annotationConfig}
    onFieldFocus={handleFieldFocus}
  />
)}
```

This is a consuming-module integration, not a package dependency. The `@hbc/field-annotations` package does not import `@hbc/acknowledgment`.

---

## Integration 6: `@hbc/workflow-handoff` (cross-reference)

When a receiving party reviews a handoff package, annotation markers appear on handoff fields. The `canAnnotate` prop is set to `true` for the receiving party and `false` for the sender during handoff review. Annotations on handoff fields block acknowledgment of the handoff via the same BIC blocking pattern described above.

---

## Developer How-To: `docs/how-to/developer/field-annotations-adoption.md`

This file is created as part of T09 (Deployment). The T07 validation session produces the verified integration patterns that T09 documents.

---

## Verification Commands

```bash
# Confirm no prohibited cross-package imports
grep -r "from '@hbc/bic-next-move'" packages/field-annotations/src/
grep -r "from '@hbc/versioned-record'" packages/field-annotations/src/
grep -r "from '@hbc/notification-intelligence'" packages/field-annotations/src/
# Expected: zero matches for all three

# Confirm @hbc/complexity is the only platform package imported
grep -r "from '@hbc/" packages/field-annotations/src/ | grep -v "complexity\|bic-next-move\|ui-kit"
# Expected: zero matches (only @hbc/complexity, @hbc/ui-kit, and @hbc/bic-next-move for IBicOwner type)

# Full build of field-annotations and its downstream dependents
pnpm turbo run build --filter @hbc/field-annotations...

# Type-check
pnpm --filter @hbc/field-annotations check-types

# Dev-harness integration test
# Navigate to dev-harness annotation test page and execute the validation sequences above
```

<!-- IMPLEMENTATION PROGRESS & NOTES
SF07-T07 not yet started.
Next: SF07-T08 (Testing Strategy)
-->
