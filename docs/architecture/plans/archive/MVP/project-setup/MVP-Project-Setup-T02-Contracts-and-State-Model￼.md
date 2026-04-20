# MVP-Project-Setup-T02 — Contracts and State Model

**Phase Reference:** MVP Project Setup Master Plan
**Spec Source:** `MVP-Project-Setup.md` + MVP Blueprint + MVP Roadmap
**Decisions Applied:** D-03 through D-10, D-12, D-14, D-15 + R-02, R-03, R-05, R-08
**Estimated Effort:** 0.9 sprint-weeks
**Depends On:** T01
> **Doc Classification:** Canonical Normative Plan — contracts/state-model task; sub-plan of `MVP-Project-Setup-Plan.md`.

---

## Objective

Lock the canonical TypeScript contracts for request intake, business lifecycle state, technical provisioning run state, retry and takeover behavior, event history, and completion metadata. Update both state machine files to remain in sync.

---

## Dual State Machine Update Requirement

`packages/provisioning/src/state-machine.ts` and `backend/functions/src/state-machine.ts` are near-identical duplicate implementations. **T02 must update both files** to add the new states and transitions. After T02, both files must have identical `STATE_TRANSITIONS` entries. Failure to update both will cause the backend and the headless package to diverge, breaking the server-side transition guard.

Files to update in this task:

```text
packages/models/src/provisioning/IProvisioning.ts       ← add new interfaces and extend existing
packages/provisioning/src/state-machine.ts              ← add Draft, Canceled, new transitions
backend/functions/src/state-machine.ts                  ← mirror the same additions
packages/provisioning/src/                              ← add deriveCurrentOwner.ts
```

---

## Types to Define or Extend

```ts
// New enum: department (lean for MVP; expand in future phases)
export type ProjectDepartment =
  | 'commercial'
  | 'luxury-residential';

// Extended state union — add 'Draft' and 'Canceled'
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

// New type: provisioning run state (separate from request state)
export type ProvisioningRunState =
  | 'not-started'
  | 'queued'
  | 'in-progress'
  | 'step-deferred'
  | 'retry-available'
  | 'escalated-to-admin'
  | 'succeeded'
  | 'failed';

// New interface: field-level clarification thread item
export interface IRequestClarification {
  clarificationId: string;
  fieldKey?: string | null;    // null = general review comment
  note: string;
  raisedBy: string;
  raisedAtIso: string;
  resolvedAtIso?: string | null;
  resolvedBy?: string | null;
}

// New interface: cancellation record
export interface IRequestCancellation {
  canceledBy: string;
  canceledAtIso: string;
  reason: string;
  previousState: Exclude<ProjectSetupRequestState, 'Canceled'>;
}

// New interface: reopen metadata
export interface IRequestReopenMetadata {
  reopenedBy: string;
  reopenedAtIso: string;
  restoredState: Exclude<ProjectSetupRequestState, 'Canceled'>;
  resumeRequiredByRequester: boolean;
}

// New interface: retry policy — enforced server-side
export interface IRequestRetryPolicy {
  requesterRetryUsed: boolean;
  requesterRetryUsedAtIso?: string | null;
  maxRequesterRetries: 1;           // literal; never configurable in MVP
  secondFailureEscalated: boolean;
  escalatedAtIso?: string | null;
}

// New interface: admin takeover metadata
export interface IRequestTakeoverMetadata {
  takenOverBy?: string | null;
  takenOverAtIso?: string | null;
  takeoverReason?: string | null;
  recoverySummary?: string | null;  // plain-English summary written by Admin post-resolution
}

// New interface: append-only event record (stored in Azure Table Storage)
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
  summary: string;              // business-readable; never a raw step ID or enum value
  details?: Record<string, unknown>;
}
```

---

## Required Contract Changes

### `IProjectSetupRequest` — fields to add

```ts
department: ProjectDepartment;
currentOwner: 'Requester' | 'Controller' | 'Admin' | 'System' | 'None';
projectNumberValidationState?: 'pending' | 'valid' | 'duplicate' | 'format-invalid' | null;
clarifications: IRequestClarification[];
cancellation?: IRequestCancellation | null;
reopen?: IRequestReopenMetadata | null;
retryPolicy: IRequestRetryPolicy;
takeover?: IRequestTakeoverMetadata | null;
siteLaunch?: {
  siteUrl: string;
  launchReadyAtIso: string;
  gettingStartedPageUrl?: string | null;   // format: {siteUrl}/SitePages/Getting-Started.aspx
} | null;
```

### `IProvisioningStatus` — fields to add or formalize

```ts
runState: ProvisioningRunState;
lastSuccessfulStep: number;           // 0 if no step completed
retryEligible: boolean;               // explicit; never inferred from retryCount alone
isPollingFallbackRequired: boolean;   // true when SignalR is unavailable or client not subscribed
throttleBackoffUntilIso?: string | null;   // set when Retry-After header received
statusResourceVersion: number;        // incremented on every upsert
statusUpdatedAtIso: string;           // ISO timestamp of last upsert
```

### `IProvisioningAuditRecord` — backward-compatibility note

The existing `IProvisioningAuditRecord` (3-event thin model: `Started | Completed | Failed`) **must be retained**. It is used by the existing SharePoint audit list write path in `saga-orchestrator.ts` and must not be removed or replaced. It coexists with `IProvisioningEventRecord`.

`IProvisioningEventRecord` is the new rich event model for the MVP lifecycle event log, stored separately in Azure Table Storage (see T07 for storage specification). Do not merge or replace `IProvisioningAuditRecord` in T02.

---

## State Transition Rules

Both state machine files (`packages/provisioning/src/state-machine.ts` and `backend/functions/src/state-machine.ts`) must implement these transitions identically:

```ts
export const STATE_TRANSITIONS: Record<ProjectSetupRequestState, ProjectSetupRequestState[]> = {
  Draft: ['Submitted'],
  Submitted: ['UnderReview'],
  UnderReview: ['NeedsClarification', 'AwaitingExternalSetup', 'ReadyToProvision', 'Canceled'],
  NeedsClarification: ['UnderReview', 'Canceled'],
  AwaitingExternalSetup: ['ReadyToProvision', 'Canceled'],
  ReadyToProvision: ['Provisioning', 'Canceled'],
  Provisioning: ['Completed', 'Failed'],
  Completed: [],    // terminal; no transitions
  Failed: ['UnderReview'],  // first retry path only; see retryPolicy for escalation
  Canceled: [],     // terminal; no automatic transitions; reopen is an explicit operation
};
```

Transition notes:
- `Failed -> UnderReview` is permitted only when `retryPolicy.requesterRetryUsed === false`
- When `retryPolicy.secondFailureEscalated === true`, the state remains `Failed` but `currentOwner` shifts to `Admin` via `deriveCurrentOwner()`
- `Canceled` has no automatic outbound transitions; reopen is an explicit `reopenRequest()` API call, not a state transition guard

---

## `deriveCurrentOwner()` Function

Add as a new file `packages/provisioning/src/derive-current-owner.ts` and export from `packages/provisioning/src/index.ts`:

```ts
import type { ProjectSetupRequestState } from '@hbc/models';
import type { IRequestRetryPolicy, IRequestTakeoverMetadata } from '@hbc/models';

export type RequestOwner = 'Requester' | 'Controller' | 'Admin' | 'System' | 'None';

export function deriveCurrentOwner(
  state: ProjectSetupRequestState,
  retryPolicy?: IRequestRetryPolicy | null,
  takeover?: IRequestTakeoverMetadata | null
): RequestOwner {
  if (takeover?.takenOverBy) return 'Admin';
  if (retryPolicy?.secondFailureEscalated) return 'Admin';
  switch (state) {
    case 'Draft': return 'Requester';
    case 'Submitted':
    case 'UnderReview':
    case 'AwaitingExternalSetup':
    case 'ReadyToProvision': return 'Controller';
    case 'NeedsClarification': return 'Requester';
    case 'Provisioning': return 'System';
    case 'Failed': return retryPolicy?.requesterRetryUsed ? 'Admin' : 'Requester';
    case 'Completed':
    case 'Canceled': return 'None';
  }
}
```

`IProjectSetupRequest.currentOwner` must be populated by calling `deriveCurrentOwner()` whenever the request is read from storage — it is a derived field, not a stored source-of-truth.

---

## Model Guarantees

- request state (`ProjectSetupRequestState`) and run state (`ProvisioningRunState`) are never collapsed into a single field
- `currentOwner` is always derivable from state + takeover metadata; stored for query convenience only
- retry eligibility is explicit (`retryPolicy.requesterRetryUsed`, `secondFailureEscalated`), not inferred by UI
- event history is append-only (`IProvisioningEventRecord`); records are never modified after creation
- completion metadata (`siteLaunch`) is present only on successful launch-ready completion
- `IProvisioningAuditRecord` coexists with `IProvisioningEventRecord` for backward compatibility

---

## Verification Commands

```bash
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/provisioning check-types

# Confirm new types exist
rg -n "ProjectDepartment|ProvisioningRunState|IRequestClarification|IRequestRetryPolicy|IRequestTakeoverMetadata|IProvisioningEventRecord" packages/models/src/provisioning/

# Confirm IProjectSetupRequest has new fields
rg -n "department|currentOwner|retryPolicy|takeover|siteLaunch|clarifications" packages/models/src/provisioning/IProvisioning.ts

# Confirm BOTH state machines have Canceled and Draft
rg -n "Draft|Canceled" packages/provisioning/src/state-machine.ts
rg -n "Draft|Canceled" backend/functions/src/state-machine.ts

# Confirm deriveCurrentOwner exists and is exported
rg -n "deriveCurrentOwner" packages/provisioning/src/derive-current-owner.ts packages/provisioning/src/index.ts

# Confirm IProvisioningAuditRecord still exists (backward compat)
rg -n "IProvisioningAuditRecord" packages/models/src/provisioning/IProvisioning.ts
```
