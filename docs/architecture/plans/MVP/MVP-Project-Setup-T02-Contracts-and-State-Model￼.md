# MVP-Project-Setup-T02 — Contracts and State Model

**Phase Reference:** MVP Project Setup Master Plan  
**Spec Source:** `MVP-Project-Setup.md` + MVP Blueprint + MVP Roadmap  
**Decisions Applied:** D-03 through D-10, D-12, D-14, D-15 + R-02, R-03, R-05, R-08  
**Estimated Effort:** 0.9 sprint-weeks  
**Depends On:** T01  
> **Doc Classification:** Canonical Normative Plan — contracts/state-model task; sub-plan of `MVP-Project-Setup-Plan.md`.

---

## Objective

Lock the canonical TypeScript contracts for request intake, business lifecycle state, technical provisioning run state, retry and takeover behavior, event history, and completion metadata.

---

## Types to Define or Extend

```ts
export type ProjectDepartment =
  | 'commercial'
  | 'luxury-residential';

export type ProjectSetupRequestState =
  | 'Draft'
  | 'Submitted'
  | 'UnderReview'
  | 'NeedsClarification'
  | 'AwaitingExternalSetup'
  | 'ReadyToProvision'
  | 'Provisioning'
  | 'Completed'
  | 'Failed'
  | 'Canceled';

export type ProvisioningRunState =
  | 'not-started'
  | 'queued'
  | 'in-progress'
  | 'step-deferred'
  | 'retry-available'
  | 'escalated-to-admin'
  | 'succeeded'
  | 'failed';

export interface IRequestClarification {
  clarificationId: string;
  fieldKey?: string | null;
  note: string;
  raisedBy: string;
  raisedAtIso: string;
  resolvedAtIso?: string | null;
  resolvedBy?: string | null;
}

export interface IRequestCancellation {
  canceledBy: string;
  canceledAtIso: string;
  reason: string;
  previousState: Exclude<ProjectSetupRequestState, 'Canceled'>;
}

export interface IRequestReopenMetadata {
  reopenedBy: string;
  reopenedAtIso: string;
  restoredState: Exclude<ProjectSetupRequestState, 'Canceled'>;
  resumeRequiredByRequester: boolean;
}

export interface IRequestRetryPolicy {
  requesterRetryUsed: boolean;
  requesterRetryUsedAtIso?: string | null;
  maxRequesterRetries: 1;
  secondFailureEscalated: boolean;
  escalatedAtIso?: string | null;
}

export interface IRequestTakeoverMetadata {
  takenOverBy?: string | null;
  takenOverAtIso?: string | null;
  takeoverReason?: string | null;
  recoverySummary?: string | null;
}

export interface IProvisioningEventRecord {
  eventId: string;
  projectId: string;
  requestId: string;
  category:
    | 'request-submitted'
    | 'state-transition'
    | 'clarification-raised'
    | 'clarification-resolved'
    | 'request-canceled'
    | 'request-reopened'
    | 'provisioning-started'
    | 'saga-step-status'
    | 'retry-invoked'
    | 'escalated-to-admin'
    | 'admin-takeover'
    | 'completed';
  actor: string;
  occurredAtIso: string;
  correlationId?: string | null;
  summary: string;
  details?: Record<string, unknown>;
}
```

---

## Required Contract Changes

### `IProjectSetupRequest`

Must add:

- `department`
- `currentOwner`
- `projectNumberValidationState`
- `clarifications: IRequestClarification[]`
- `cancellation?: IRequestCancellation`
- `reopen?: IRequestReopenMetadata`
- `retryPolicy: IRequestRetryPolicy`
- `takeover?: IRequestTakeoverMetadata`
- `siteLaunch?: { siteUrl: string; launchReadyAtIso: string; gettingStartedPageUrl?: string | null }`
- `historyCursor?` or explicit event linkage

### `IProvisioningStatus`

Must add or formalize:

- `runState: ProvisioningRunState`
- `lastSuccessfulStep`
- `retryEligible`
- `isPollingFallbackRequired`
- `throttleBackoffUntilIso?: string | null`
- `statusResourceVersion`
- `statusUpdatedAtIso`

### `IProvisioningAuditRecord`

Must be expanded beyond `Started|Completed|Failed` to carry typed event categories or be replaced by the event model above.

---

## State Transition Rules

1. `Draft -> Submitted`
2. `Submitted -> UnderReview`
3. `UnderReview -> NeedsClarification | AwaitingExternalSetup | ReadyToProvision | Canceled`
4. `NeedsClarification -> UnderReview | Canceled`
5. `AwaitingExternalSetup -> ReadyToProvision | Canceled`
6. `ReadyToProvision -> Provisioning | Canceled`
7. `Provisioning -> Completed | Failed`
8. `Failed -> UnderReview` only for the first business retry path
9. `Failed -> Failed` with `secondFailureEscalated=true` is allowed as a technical state while ownership moves to Admin
10. `Canceled ->` no automatic transitions; explicit reopen only

---

## Model Guarantees

- request state and run state are never collapsed into a single field
- current owner is always derivable from state + takeover metadata
- retry eligibility is explicit, not inferred by UI
- event history is append-only
- completion metadata is present only on successful launch-ready completion

---

## Verification Commands

```bash
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test -- provisioning
pnpm --filter @hbc/provisioning check-types
rg -n "department|retryPolicy|takeover|Canceled|ProvisioningRunState|IProvisioningEventRecord" packages/models packages/provisioning
```
