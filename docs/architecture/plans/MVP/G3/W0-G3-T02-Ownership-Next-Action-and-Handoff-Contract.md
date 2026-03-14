# W0-G3-T02 — Ownership, Next Action, and Handoff Contract

> **Doc Classification:** Canonical Normative Plan — Wave 0 Group 3 task plan defining how `@hbc/bic-next-move` and `@hbc/workflow-handoff` jointly govern ownership, expected action, and lifecycle handoffs for the project setup work item. This plan specifies the canonical action contract that must be reused identically across the workflow screen, notifications, and future My Work feed.

**Phase Reference:** Wave 0 Group 3 — Shared-Platform Wiring and Workflow Experience Plan
**Depends On:** G1 (T02 Entra ID group model — defines the parties), MVP Project Setup T02 (IProjectSetupRequest lifecycle states), MVP Project Setup T03 (controller gate — deriveCurrentOwner)
**Unlocks:** T03 (clarification ownership transition), T04 (action string for notification bodies), T06 (ownership fields in summary view), G4/G5 entry condition T02
**Repo Paths Governed:** `packages/bic-next-move/src/`, `packages/workflow-handoff/src/`, `apps/estimating/src/`, `apps/accounting/src/`, `apps/admin/src/`

---

## Objective

This task defines two interrelated contracts:

1. The **BIC ownership contract** — how `@hbc/bic-next-move` is configured to answer "who has the ball on this project setup request right now?" for every lifecycle state, and how the `IBicNextMoveState` is constructed as the canonical source of truth for ownership across all three surfaces (workflow screen, notification payload, My Work feed item).

2. The **handoff contract** — how `@hbc/workflow-handoff` is configured to govern the Estimating → Project Hub handoff that occurs after provisioning completes, and what the pre-flight, snapshot, and acknowledgment requirements are.

The two packages operate in sequence: BIC handles in-lifecycle ownership through all project setup states; workflow-handoff governs the cross-module transition at lifecycle end.

---

## Why This Task Exists

The MVP Project Setup T03 plan specifies a `deriveCurrentOwner()` function that determines who currently owns a request. That function drives BIC ownership. However, without a governing G3 contract:

- Each surface (estimating, accounting, admin) would implement its own ownership display independently
- The `expectedAction` string — the most important piece of information BIC shows — would be invented independently on each surface (different wording, different semantics)
- Notification bodies would be written independently of the BIC action string, producing inconsistent messaging
- The future My Work feed would aggregate items with no common action contract, requiring rework at My Work implementation time

G3-D3 (locked decision) requires one consistent action model across all three surfaces. This task produces that model.

Similarly, without a governing handoff contract, the G4 team implementing the "project setup complete → Project Hub" transition would need to invent the pre-flight rules, snapshot fields, and acknowledgment behavior from scratch — with no guarantee of consistency with the `@hbc/workflow-handoff` protocol.

---

## Scope

T02 specifies:
- The complete `IBicNextMoveConfig<IProjectSetupRequest>` with all 8 resolver functions
- The canonical action string table (one `expectedAction` per lifecycle state)
- The BIC module registration spec for the provisioning module
- The `IHandoffConfig<IProjectSetupRequest, IProjectRecord>` for the Estimating → Project Hub handoff
- How `@hbc/bic-next-move` and `@hbc/workflow-handoff` divide responsibility without overlap

T02 does not specify:
- The visual design of BIC badges or handoff UI (G4/G5 scope)
- Notification event registration (T04 scope)
- The Project Hub `IProjectRecord` schema (Wave 1 / G4 scope — T02 specifies only the seed data that the handoff plants)
- Admin recovery actions or escalation flows (MVP Project Setup T07 scope)

---

## Governing Constraints

- Duplicate ownership semantics in multiple packages are explicitly prohibited (G3-D3). The canonical `IBicNextMoveState` is the single source of truth for "who owns this and what must they do."
- Role-specific ad hoc interpretations of "next action" are prohibited. The `expectedAction` string is defined in the BIC config, not in the rendering surface. Surfaces display whatever `resolveExpectedAction()` returns — they do not override it.
- `@hbc/workflow-handoff` governs the cross-module transition. Surfaces must not implement their own "convert to Project Hub record" button outside the handoff protocol.
- The BIC config must be defined once and imported by all consuming surfaces — not duplicated or overridden per-surface.

---

## Part 1 — BIC Ownership Contract

### Lifecycle State to Owner Mapping

The project setup lifecycle has nine states. Each state maps to exactly one ownership party and one `expectedAction`. The table below is the canonical mapping and must be implemented exactly as specified.

| Lifecycle State | Current Owner | expectedAction | urgency mapping |
|-----------------|---------------|----------------|-----------------|
| `Draft` | Requester | "Complete and submit your project setup request" | `upcoming` (no due date pressure) |
| `Submitted` | Controller | "Review the new project setup request" | `watch` (standard review timeline) |
| `UnderReview` | Controller | "Complete your review and approve or request clarification" | `watch` |
| `NeedsClarification` | Requester | "Respond to clarification requests to continue setup" | `immediate` (BIC transfer to requester; action required) |
| `AwaitingExternalSetup` | Controller | "Complete external IT setup prerequisites" | `watch` |
| `ReadyToProvision` | System (auto) | "Site provisioning is queued" | N/A (system-owned state; no BIC display needed) |
| `Provisioning` | System (auto) | "Site provisioning is in progress" | N/A (system-owned state) |
| `Completed` | Requester | "Review your provisioned project site and complete the getting-started steps" | `upcoming` |
| `Failed` | Admin | "Investigate and recover the failed provisioning request" | `immediate` (escalation) |
| `Failed` (second failure, escalated) | Admin | "Investigate the escalated provisioning failure — requester retry exhausted" | `immediate` |

**Notes on system-owned states:** `ReadyToProvision` and `Provisioning` are system states where no human owns the next action. The BIC badge in these states should display "In Progress" or a system indicator, not a named human owner. The `resolveCurrentOwner()` resolver must return `null` for these states, and the consuming surface must handle the null case gracefully (T06 governs what is displayed when owner is null).

**Notes on `Failed` state:** The first failure is owned by the Admin if the requester retry has been used, or by the Requester if they have a retry available. The BIC config must check `retryPolicy.requesterRetryUsed` to distinguish these.

---

### `IBicNextMoveConfig<IProjectSetupRequest>` Specification

```typescript
import { IBicNextMoveConfig, IBicOwner } from '@hbc/bic-next-move';
import { IProjectSetupRequest } from '@hbc/models';
import { deriveCurrentOwner } from '@hbc/provisioning'; // existing function from MVP T03

export const PROJECT_SETUP_BIC_CONFIG: IBicNextMoveConfig<IProjectSetupRequest> = {
  ownershipModel: 'workflow-state-derived',

  resolveCurrentOwner: (request): IBicOwner | null => {
    // Delegates to the provisioning package's deriveCurrentOwner function
    // This function already exists (MVP Project Setup T03) and routes by workflowStage
    const derived = deriveCurrentOwner(request);
    if (!derived) return null;
    return {
      userId: derived.userId,
      displayName: derived.displayName,
      role: derived.role,
    };
  },

  resolveExpectedAction: (request): string => {
    // Canonical action strings — see table above
    // Surfaces must display this string without modification
    const actionMap: Record<string, string> = {
      Draft: 'Complete and submit your project setup request',
      Submitted: 'Review the new project setup request',
      UnderReview: 'Complete your review and approve or request clarification',
      NeedsClarification: 'Respond to clarification requests to continue setup',
      AwaitingExternalSetup: 'Complete external IT setup prerequisites',
      ReadyToProvision: 'Site provisioning is queued',
      Provisioning: 'Site provisioning is in progress',
      Completed: 'Review your provisioned project site and complete the getting-started steps',
      Failed: request.retryPolicy?.requesterRetryUsed
        ? 'Investigate the escalated provisioning failure — requester retry exhausted'
        : 'Investigate and recover the failed provisioning request',
    };
    return actionMap[request.workflowStage] ?? 'Review this request';
  },

  resolveDueDate: (request): string | null => {
    // No hard SLA dates in Wave 0; due dates are advisory only
    // NeedsClarification: 3-business-day advisory
    // Failed: immediate (no numeric due date; urgency tier handles this)
    if (request.workflowStage === 'NeedsClarification' && request.clarificationRequestedAt) {
      const due = new Date(request.clarificationRequestedAt);
      due.setDate(due.getDate() + 3); // 3-business-day advisory
      return due.toISOString();
    }
    return null;
  },

  resolveIsBlocked: (request): boolean => {
    // A request is blocked when it cannot advance due to an external dependency
    return (
      request.workflowStage === 'AwaitingExternalSetup' ||
      (request.workflowStage === 'Failed' && !!request.retryPolicy?.requesterRetryUsed)
    );
  },

  resolveBlockedReason: (request): string | null => {
    if (request.workflowStage === 'AwaitingExternalSetup') {
      return 'Waiting for external IT/security setup to complete before provisioning can proceed.';
    }
    if (request.workflowStage === 'Failed' && request.retryPolicy?.requesterRetryUsed) {
      return 'Requester retry has been used. An administrator must investigate and resume.';
    }
    return null;
  },

  resolvePreviousOwner: (request): IBicOwner | null => {
    // Previous owner is derivable from the state transition history
    // If no history is stored on the request, return null
    return request.ownershipHistory?.at(-1) ?? null;
  },

  resolveNextOwner: (request): IBicOwner | null => {
    // Next owner is the party who will take ownership after the current action
    const nextOwnerMap: Record<string, string> = {
      Draft: 'controller', // after requester submits → controller reviews
      Submitted: 'controller', // controller remains owner during review
      UnderReview: 'requester-or-controller', // depends on outcome
      NeedsClarification: 'controller', // after requester responds → back to controller
      AwaitingExternalSetup: 'controller', // after external completes → controller resumes
      ReadyToProvision: 'system',
      Provisioning: 'requester', // after provisioning → requester gets completed site
      Completed: null, // terminal
      Failed: 'admin',
    };
    // Return a role-based owner stub; full user resolution requires API lookup at render time
    const role = nextOwnerMap[request.workflowStage];
    if (!role) return null;
    return { userId: null, displayName: null, role }; // surfaces resolve userId on render
  },

  resolveEscalationOwner: (request): IBicOwner | null => {
    // Escalation owner is the Admin group for all project setup requests
    return {
      userId: null, // resolved at render time from Entra ID group
      displayName: 'Admin',
      role: 'admin',
    };
  },
};
```

**Implementation note for G4/G5:** The `PROJECT_SETUP_BIC_CONFIG` object must be defined once in a shared location (e.g., `packages/provisioning/src/bic-config.ts` or a G3-specific config module) and imported by all surfaces. Surfaces must not redefine or override individual resolvers.

---

### BIC Module Registration Spec

The provisioning module must register with `@hbc/bic-next-move`'s module registry at app initialization. This registration is the minimum interim hook point for My Work (G3-D7).

```typescript
import { registerBicModule } from '@hbc/bic-next-move';

// Called once at app/webpart initialization
registerBicModule({
  key: 'provisioning',
  label: 'Project Setup',
  queryFn: async (userId: string) => {
    // Returns all IProjectSetupRequest items where user is the current BIC owner
    const items = await ProjectSetupApi.getItemsWhereOwner(userId);
    return items.map(item => ({
      itemKey: `provisioning:${item.id}`,
      moduleKey: 'provisioning',
      moduleLabel: 'Project Setup',
      state: resolveBicState(item, PROJECT_SETUP_BIC_CONFIG),
      href: `/project-setup/${item.id}`,
      title: item.projectName,
    }));
  },
});
```

**What this registration does:** When My Work ships, it will call each registered module's `queryFn` to aggregate all items where the user is the current BIC owner. The provisioning module registration ensures that in-progress setup requests appear in My Work automatically — without the provisioning module needing to be updated at that time.

---

## Part 2 — Handoff Contract

### Handoff Route: Estimating → Project Hub

This handoff occurs when a project setup request reaches `Completed` state and the provisioned SharePoint site is ready. The handoff package carries the setup request context into the Project Hub module, where a project workspace record is initialized.

**Trigger:** `workflowStage === 'Completed'` AND `siteLaunch.siteUrl` is set.

**Sender:** The Estimating app's requester view (or the provisioning status page) offers the "Hand off to Project Hub" action.

**Recipient:** The PM/project lead (identified by `request.projectLeadId`) who will manage the project in Project Hub.

### Pre-flight Validation Rules

The `validateReadiness` function must pass all of the following before the handoff package is assembled:

1. `workflowStage === 'Completed'` — request must be fully provisioned
2. `siteLaunch.siteUrl` is set and non-empty — the SharePoint site must exist
3. `request.department` is set — required for Project Hub record initialization
4. `request.projectLeadId` is set — required to resolve the recipient

If any condition fails, the handoff must be blocked with a specific message (not a generic "not ready" error).

### `IHandoffConfig` Specification

```typescript
import { IHandoffConfig } from '@hbc/workflow-handoff';
import { IProjectSetupRequest } from '@hbc/models';

// IProjectRecord is the Wave 1 Project Hub record type.
// For G3 planning purposes, define the seed data shape.
export interface IProjectHubSeedData {
  projectName: string;
  projectNumber: string;
  department: 'commercial' | 'luxury-residential';
  siteUrl: string;
  projectLeadId: string;
  groupMembers: string[];
  startDate?: string;
  estimatedValue?: number;
  clientName?: string;
}

export const SETUP_TO_PROJECT_HUB_HANDOFF_CONFIG: IHandoffConfig<
  IProjectSetupRequest,
  IProjectHubSeedData
> = {
  sourceModule: 'estimating',
  sourceRecordType: 'project-setup-request',
  destinationModule: 'project-hub',
  destRecordType: 'project-record',
  routeLabel: 'Project Setup → Project Hub',
  acknowledgeDescription: 'Acknowledge to create the Project Hub workspace for this project.',

  mapSourceToDestination: (request): Partial<IProjectHubSeedData> => ({
    projectName: request.projectName,
    projectNumber: request.projectNumber!, // must be set by Completed state
    department: request.department,
    siteUrl: request.siteLaunch?.siteUrl,
    projectLeadId: request.projectLeadId,
    groupMembers: request.groupMembers ?? [],
    startDate: request.startDate,
    estimatedValue: request.estimatedValue,
    clientName: request.clientName,
  }),

  resolveDocuments: async (request) => {
    // No documents to include in the initial Wave 0 handoff
    // The provisioned SharePoint site is already accessible via siteUrl
    // Wave 1 can extend this to include the getting-started page or template files
    return [];
  },

  resolveRecipient: (request) => ({
    userId: request.projectLeadId,
    displayName: request.projectLeadName ?? 'Project Lead',
    role: 'Project Lead',
  }),

  validateReadiness: (request): string | null => {
    if (request.workflowStage !== 'Completed')
      return 'Project setup must be fully completed before handing off to Project Hub.';
    if (!request.siteLaunch?.siteUrl)
      return 'Provisioned site URL is not yet available. Wait for provisioning to complete.';
    if (!request.department)
      return 'Department is not set on this request. Contact your administrator.';
    if (!request.projectLeadId)
      return 'Project lead is not assigned. Update the project team before handoff.';
    return null; // ready
  },

  onAcknowledged: async (pkg) => {
    // Creates the Project Hub project record with the seed data
    // This is a Wave 1 concern — the exact API call depends on the Project Hub module
    // G3 specifies the contract; G4/Wave 1 implements the destination-module side
    await ProjectHubApi.createProject(pkg.destinationSeedData, pkg.handoffId);
  },

  onRejected: async (pkg) => {
    // Returns the setup request to a revisable state (coordinator review)
    // The Project Hub coordinator has declined to accept the handoff
    await ProjectSetupApi.returnToCoordinatorReview(pkg.sourceRecordId, pkg.rejectionReason);
  },
};
```

**Wave 0 vs. Wave 1 note:** The `onAcknowledged` callback calls `ProjectHubApi.createProject()`. This is a Wave 1 concern — the Project Hub module's creation API does not exist in Wave 0. In Wave 0, the handoff package assembly and lifecycle management (draft → sent → received → acknowledged) can be stood up without the Project Hub destination record creation. The `onAcknowledged` callback should log and no-op in Wave 0, with a clear TODO noting Wave 1 implementation. The handoff structure must be correct so Wave 1 only needs to implement the callback body.

---

## How `@hbc/bic-next-move` and `@hbc/workflow-handoff` Divide Responsibility

These packages are sequential, not concurrent. Their responsibilities do not overlap:

| Concern | Owned By | Notes |
|---------|----------|-------|
| Who has the ball right now? | `@hbc/bic-next-move` | From `Draft` through `Completed` and `Failed` |
| What must the current owner do? | `@hbc/bic-next-move` (`resolveExpectedAction`) | Canonical action string |
| When is the current task due? | `@hbc/bic-next-move` (`resolveDueDate`) | Returns ISO timestamp or null |
| Is the request blocked? | `@hbc/bic-next-move` (`resolveIsBlocked`) | AwaitingExternalSetup or escalated Failed |
| Previous/next owner chain | `@hbc/bic-next-move` | Transfer history |
| Cross-module transition (post-completion) | `@hbc/workflow-handoff` | Estimating → Project Hub after Completed |
| Pre-flight validation for cross-module transition | `@hbc/workflow-handoff` (`validateReadiness`) | Runs before handoff package assembly |
| Context note structure (key decisions, open items, risks) | `@hbc/workflow-handoff` | Captured in handoff package |
| Source snapshot (frozen request state at handoff) | `@hbc/workflow-handoff` | Via `@hbc/versioned-record` at send time |
| Acknowledgment-triggered record creation | `@hbc/workflow-handoff` (`onAcknowledged`) | Wave 1 Project Hub creation |
| Rejection-triggered return to review | `@hbc/workflow-handoff` (`onRejected`) | Returns BIC to sender |

**No BIC is active during active workflow-handoff:** Once the handoff is sent (`HandoffStatus === 'sent'`), the BIC for the setup request should show the handoff recipient as the current owner and `expectedAction: 'Acknowledge the project handoff to create the Project Hub workspace'`. The BIC config's `resolveCurrentOwner` must check for an active outbound handoff and return the handoff recipient in that case.

---

## Required Outputs

| Artifact | Location | Description |
|----------|----------|-------------|
| BIC config + canonical action contract | `docs/reference/workflow-experience/bic-action-contract.md` | Full `IBicNextMoveConfig` spec, canonical action string table, module registration spec |
| Handoff route specification | `docs/reference/workflow-experience/setup-handoff-routes.md` | Full `IHandoffConfig` spec, pre-flight rules, Wave 0/Wave 1 boundary |

Both reference documents must be added to `current-state-map.md §2`.

---

## Acceptance Criteria

- [ ] `IBicNextMoveConfig<IProjectSetupRequest>` is fully specified with all 8 resolver functions
- [ ] Canonical action string table is complete for all 9 lifecycle states (including both Failed sub-cases)
- [ ] System-owned states (`ReadyToProvision`, `Provisioning`) are handled — `resolveCurrentOwner` returns null with documented surface behavior
- [ ] BIC module registration spec is defined with `queryFn` shape
- [ ] `IHandoffConfig<IProjectSetupRequest, IProjectHubSeedData>` is fully specified
- [ ] Pre-flight validation rules are enumerated with specific error messages
- [ ] Wave 0 vs. Wave 1 boundary in `onAcknowledged` is explicitly marked
- [ ] Division of responsibility table between BIC and handoff packages is included
- [ ] Reference documents exist and are added to `current-state-map.md §2`

---

*End of W0-G3-T02 — Ownership, Next Action, and Handoff Contract v1.0*
