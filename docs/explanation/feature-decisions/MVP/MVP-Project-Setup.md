
# MVP Project Setup — Controlled New Project Request, Controller Gate & SharePoint Site Provisioning Workflow

**Priority Tier:** 1 — MVP Platform Proof (cross-app workflow; shared provisioning engine; leadership proof point)  
**Module:** Estimating / Accounting / Admin / Platform Provisioning  
**Interview Decision:** Interview-Locked + Repo Review + MVP Blueprint/Roadmap Synthesis  
**Mold Breaker Source:** Provisioning-Centered Platform Proof; Controlled Business Gate; App-Owned Access Governance; Standardized SharePoint Project Setup

---

## Problem Solved

HB Intel already contains meaningful pieces of the project-setup workflow:

- a requester-side intake and request-detail experience in Estimating
- a headless provisioning package
- a backend request lifecycle and provisioning saga
- per-project SignalR progress updates
- an Admin failed-runs surface
- governance decisions for provisioning boundaries, access control, and UI ownership

Those are the right building blocks, but today they still exist more as **capabilities** than as one finished, trustworthy operating flow.

The actual business problem is larger than “submit a form” or “create a SharePoint site.” The company needs a workflow that answers all of the following in a controlled, understandable way:

- How does a business user request a new project site?
- Who owns the next move at each stage?
- What happens when the Controller needs clarification?
- What is the decisive company gate before site creation?
- How are retries, failures, and admin recovery handled?
- What access is granted automatically, and what stays governed?
- What does the user see when the site is finished?

Without a dedicated MVP project-setup feature model, the workflow fragments in predictable ways:

- intake happens in one surface
- lifecycle meaning lives partly in code and partly in assumptions
- Controller review is under-defined or missing
- progress exists technically but not always as a business-readable experience
- access bootstrap remains too narrow
- retry and escalation behavior feel technical instead of operational
- the finished result can feel like a backend success event instead of a usable project launch

That creates the exact trust problem the MVP is supposed to solve:

- business users do not know what the workflow is doing
- leadership cannot tell whether the process is truly standardized
- support teams inherit avoidable ambiguity around ownership and recovery
- SharePoint remains “something IT set up” instead of a controlled operating model inside HB Intel

The MVP Project Setup feature is therefore not just a request form and not just a provisioning engine. It is the platform’s first proof that HB Intel can own a **business-friendly, controlled, auditable request-to-site workflow** that is better than the current setup process and credible enough to support broader lifecycle expansion.

To fully solve that problem, the feature must include:

- **clear intake** so requesters can start the process without misuse
- **explicit ownership** so the next responsible user is always visible
- **a decisive Controller gate** so provisioning starts only from the approved business path
- **an understandable progress experience** so site creation feels controlled
- **governed failure handling** so retry and takeover behavior build trust instead of confusion
- **a governed access model** so SharePoint permissions do not become the source of truth
- **a completion handoff** so the created site feels real, usable, and standardized immediately

It is not a narrow utility. It is the MVP’s canonical project-initiation workflow.

---

## Mold Breaker Rationale

The repo’s current direction, the uploaded MVP Blueprint, and the uploaded MVP Roadmap all point to the same conclusion:

> **The first release does not need to prove the whole HB Intel lifecycle vision. It needs to prove that a controlled, business-friendly SharePoint-centered project setup workflow can work better than the current process.**

That is why this feature matters disproportionately.

The mold-breaker opportunity is not to copy a generic enterprise request form. It is to replace an informal, fragmented setup process with a **single operating flow** that is:

- **business-gated** rather than system-triggered
- **role-clear** rather than dependent on tribal knowledge
- **recoverable** rather than brittle
- **auditable** rather than opaque
- **SharePoint-standardized** rather than one-off
- **platform-owned** rather than scattered across email, manual steps, and hidden admin actions

Repo review and benchmark research reinforce that direction:

1. Microsoft-native workspace provisioning patterns usually separate **request intake** from **final governed creation**.
2. Service catalog platforms such as ServiceNow and Jira Service Management treat the intake workflow and the fulfillment engine as related but distinct concerns.
3. Construction platforms such as Procore and Autodesk Construction Cloud emphasize controlled project creation and standardized template-based setup.
4. Durable workflow patterns favor explicit ownership, retry, escalation, and status visibility over “fire-and-forget” automation.
5. Enterprise trust is built as much by understandable failure and recovery behavior as by nominal success-path automation.

HB Intel already has the right architecture shape for this:

- `@hbc/provisioning` can remain the headless engine
- app surfaces can remain role-specific
- `@hbc/bic-next-move` can make ownership visible
- `@hbc/field-annotations` can support controlled clarification
- `@hbc/notification-intelligence` can route lifecycle notifications
- `@hbc/step-wizard` can make progress understandable
- app-owned access governance can remain consistent with ADR-0063

This feature does **not** replace provisioning, access control, comments, or workflow primitives. It is the **cross-app orchestration and user-facing operating model** that turns them into one coherent MVP proof.

The differentiator is not merely “we can create a site.” It is:

- **we can request it cleanly**
- **we can review it safely**
- **we can trigger it intentionally**
- **we can recover when it fails**
- **we can launch it in a way that feels operationally real**

That is what makes MVP Project Setup a platform-defining feature rather than a narrow implementation detail.

---

## MVP Project Setup Model

The feature should unify intake, review, provisioning, access bootstrap, recovery, and completion around one canonical workflow while keeping business state and technical run state distinct.

### Core Actor Roles

- **Requester** — starts a new project setup request
- **Estimating Coordinator** — primary business-side request owner and provisioning watcher
- **Controller** — primary business gate owner and final trigger authority
- **Admin / Platform Group** — escalation and technical recovery owner after second failure
- **OpEx Manager** — structural standards owner with governed background authority
- **Project Team Member** — post-creation site user with non-structural usage rights

### Workflow Modes

- **New Request** — initial business-user intake
- **Review / Clarification** — request validation and send-back loop
- **External Setup** — Controller’s manual business preparation stage
- **Provisioning Run** — automated site creation and configuration
- **Failure Recovery** — retry, escalation, takeover, and correction
- **Completion / Launch** — site link, getting-started handoff, and first-use orientation

### Canonical Request States

1. **Draft** — local or saved draft before submission
2. **Submitted** — request formally entered into workflow
3. **UnderReview** — Controller actively reviewing
4. **NeedsClarification** — requester must resolve returned items
5. **AwaitingExternalSetup** — Controller is performing required external setup work
6. **ReadyToProvision** — request has passed business checks and can be triggered
7. **Provisioning** — provisioning run has started
8. **Completed** — site created successfully and ready for launch
9. **Failed** — provisioning failed and needs retry or admin recovery
10. **Canceled** — request intentionally stopped before provisioning, with history intact

### Provisioning Run States

The technical run model should remain distinct from the business request state.

- **not-started**
- **queued**
- **in-progress**
- **step-deferred**
- **retry-available**
- **escalated-to-admin**
- **succeeded**
- **failed**

### Ownership Rules

The feature must make ownership explicit instead of implied.

- **Submitted** → Controller owns next move
- **UnderReview** → Controller owns next move
- **NeedsClarification** → requester / Estimating Coordinator owns next move
- **AwaitingExternalSetup** → Controller owns next move
- **ReadyToProvision** → Controller owns final trigger
- **Provisioning** → Estimating Coordinator owns business-side watch / retry
- **Failed after first run** → Estimating Coordinator owns one retry opportunity
- **Failed after second run** → Admin / Platform group owns takeover and recovery
- **Reopened request** → requester temporarily owns review/resubmit until workflow resumes normal ownership

### Trigger Model

Provisioning must begin only when the Controller:

1. enters the official project number
2. passes validation
3. clicks **Finish Setup**

There should be no separate confirmation step. The trigger should be decisive, low-friction, and still governed.

### Request Data Model Principles

The request should stay lean but complete enough to support the locked MVP workflow.

Required business inputs:

- project name
- project location
- department
- project type
- project stage
- group members

Required lifecycle/control metadata:

- requester identity
- current request state
- current owner / next owner
- project number
- clarification threads
- cancellation metadata
- reopen metadata
- retry entitlement
- admin takeover metadata
- completion/site-launch metadata
- audit/event history

### Department and Project Type Meaning

**Department** is a real provisioning driver in MVP. It determines:

- which default document library remains in the site
- which default background shared-services / leadership access rules apply

**Project Type** is recorded for information, reporting, and future expansion, but it should **not** create major branching in site structure during MVP.

### Template Strategy

The feature should provision from **one maintained internal template project site** that contains:

- Commercial document library
- Luxury Residential document library

During provisioning, the engine determines the selected Department and removes the library that does not apply. All other structural branching should remain intentionally low.

### Completion Promise

If the workflow succeeds, the business user should receive:

- a direct link to the completed site
- a clear created-site summary
- a useful getting-started landing page inside the new site

### Core Questions the Feature Must Answer

- Who owns the request right now?
- What state is it in?
- What exactly is blocking it?
- Is clarification required, and on which fields?
- Has the Controller validated and entered the project number?
- Has provisioning started, and what step is it on?
- Has the user used their one retry?
- Has admin taken over?
- What changed during recovery?
- Who canceled or reopened the request, and why?
- What site was created, and how does the user launch into it?

---

## MVP Project Setup Surface Structure

The feature should use one canonical workflow model projected through several role-specific surfaces.

### Canonical Surfaces

- **`HbcProjectSetupLauncher`** — route entry from Estimating and other approved entry points
- **`HbcProjectSetupIntake`** — requester-facing new request form
- **`HbcProjectSetupDetail`** — requester-facing lifecycle, comments, history, and progress surface
- **`HbcProjectSetupClarificationView`** — returned-field review, edit, and resubmit surface
- **`HbcControllerSetupWorkspace`** — Controller review, send-back, external setup, project-number entry, and finish-setup trigger surface
- **`HbcProvisioningProgressView`** — step-by-step progress display with plain-English labels
- **`HbcProvisioningFailureView`** — requester failure summary, failure report, and one-retry action
- **`HbcProvisioningAdminRecovery`** — admin failed-run review, corrective actions, retry, and visible change summary
- **`HbcProjectSetupCompletionLaunch`** — completed state, site link, launch summary, and getting-started handoff
- **`HbcProjectSetupHistoryDrawer`** — structured workflow history, including clarification, cancellation, reopen, retry, and admin actions

### Surface Responsibilities

- **Intake** favors speed, clarity, and correct input
- **Detail** favors status understanding, next-move clarity, and lifecycle trust
- **Clarification view** favors field-specific corrections and resubmission
- **Controller workspace** favors decisive review, controlled correction, and low-friction trigger action
- **Progress view** favors plain-English transparency during provisioning
- **Failure view** favors controlled retry and escalation visibility
- **Admin recovery** favors diagnosis, correction, and recoverable trust
- **Completion launch** favors immediate usability and confidence that the process produced a real project site

### Complexity-Aware Disclosure Rules

This feature should follow the repo’s complexity/disclosure discipline.

- **Essential** shows state, owner, primary next action, and top-level progress
- **Standard** adds comments, clarification notes, change summaries, project number validation status, and completion details
- **Expert** adds technical failure detail, admin recovery notes, audit traces, and source/run diagnostics

The data contract should remain consistent across surfaces. Only disclosure depth changes.

---

## Interface Contract

```typescript
export type ProjectDepartment = 'commercial' | 'luxury-residential';
export type ProjectStage = 'budget' | 'bid' | 'award-pending' | 'awarded' | 'other';

export type ProjectSetupActorRole =
  | 'requester'
  | 'estimating-coordinator'
  | 'controller'
  | 'admin'
  | 'opex-manager'
  | 'project-team';

export type ProjectSetupRequestState =
  | 'draft'
  | 'submitted'
  | 'under-review'
  | 'needs-clarification'
  | 'awaiting-external-setup'
  | 'ready-to-provision'
  | 'provisioning'
  | 'completed'
  | 'failed'
  | 'canceled';

export type ProjectSetupRunState =
  | 'not-started'
  | 'queued'
  | 'in-progress'
  | 'step-deferred'
  | 'retry-available'
  | 'escalated-to-admin'
  | 'succeeded'
  | 'failed';

export type ProjectSetupEventType =
  | 'request-created'
  | 'request-submitted'
  | 'review-started'
  | 'clarification-requested'
  | 'clarification-resubmitted'
  | 'controller-saved'
  | 'project-number-entered'
  | 'project-number-validated'
  | 'project-number-duplicate'
  | 'finish-setup-triggered'
  | 'provisioning-started'
  | 'provisioning-step-updated'
  | 'failure-reported'
  | 'retry-requested'
  | 'retry-started'
  | 'escalated-to-admin'
  | 'admin-takeover-started'
  | 'admin-correction-saved'
  | 'request-canceled'
  | 'request-reopened'
  | 'reopen-resubmitted'
  | 'provisioning-completed'
  | 'site-launched';

export interface IProjectSetupActor {
  role: ProjectSetupActorRole;
  id: string;
  label: string;
  email?: string;
}

export interface IProjectSetupPermissionState {
  canView: boolean;
  canEdit: boolean;
  canComment: boolean;
  canCancel: boolean;
  canReopen: boolean;
  canRetry: boolean;
  canTriggerProvisioning: boolean;
  canGrantAccess: boolean;
  cannotActReason?: string | null;
}

export interface IProjectSetupClarificationField {
  fieldKey: string;
  fieldLabel: string;
  originalValue?: string | null;
  returnedValue?: string | null;
  note: string;
  isResolved: boolean;
}

export interface IProjectSetupComment {
  commentId: string;
  author: IProjectSetupActor;
  body: string;
  createdAtIso: string;
  visibleToRoles?: ProjectSetupActorRole[];
}

export interface IProjectSetupHistoryEvent {
  eventId: string;
  type: ProjectSetupEventType;
  actor: IProjectSetupActor;
  requestStateAtTime: ProjectSetupRequestState;
  runStateAtTime?: ProjectSetupRunState | null;
  summary: string;
  detail?: string | null;
  changedFields?: string[];
  createdAtIso: string;
}

export interface IProjectSetupProvisioningStep {
  key: string;
  label: string;
  order: number;
  status: 'pending' | 'current' | 'completed' | 'failed' | 'deferred';
  startedAtIso?: string | null;
  completedAtIso?: string | null;
  message?: string | null;
}

export interface IProjectSetupAccessBootstrap {
  requestGroupMemberIds: string[];
  backgroundRoleKeys: string[];
  structuralOwnerIds: string[];
  externalUsersAllowed: false;
  notes?: string | null;
}

export interface IProjectSetupRetryState {
  retryCount: number;
  selfServiceRetryRemaining: number;
  escalatedToAdmin: boolean;
  takeoverOwner?: IProjectSetupActor | null;
}

export interface IProjectSetupCancelState {
  isCanceled: boolean;
  canceledBy?: IProjectSetupActor | null;
  canceledReason?: string | null;
  canceledAtIso?: string | null;
  priorState?: ProjectSetupRequestState | null;
}

export interface IProjectSetupReopenState {
  reopenCount: number;
  reopenedBy?: IProjectSetupActor | null;
  reopenedAtIso?: string | null;
  requesterMustResubmit: boolean;
}

export interface IProjectSetupCompletionState {
  siteUrl?: string | null;
  siteTitle?: string | null;
  launchPageUrl?: string | null;
  launchedAtIso?: string | null;
}

export interface IProjectSetupRequest {
  requestId: string;
  projectName: string;
  projectLocation: string;
  department: ProjectDepartment;
  projectType: string;
  projectStage: ProjectStage;
  groupMemberIds: string[];
  requester: IProjectSetupActor;
  currentOwner: IProjectSetupActor;
  requestState: ProjectSetupRequestState;
  runState: ProjectSetupRunState;
  projectNumber?: string | null;
  projectNumberIsValid?: boolean | null;
  duplicateProjectNumber?: boolean | null;
  clarificationFields?: IProjectSetupClarificationField[];
  comments?: IProjectSetupComment[];
  provisioningSteps?: IProjectSetupProvisioningStep[];
  permissionState: IProjectSetupPermissionState;
  accessBootstrap?: IProjectSetupAccessBootstrap;
  retryState: IProjectSetupRetryState;
  cancelState?: IProjectSetupCancelState;
  reopenState?: IProjectSetupReopenState;
  completionState?: IProjectSetupCompletionState;
  history: IProjectSetupHistoryEvent[];
  createdAtIso: string;
  updatedAtIso: string;
}

export interface IProjectSetupQuery {
  requestId?: string;
  state?: ProjectSetupRequestState;
  ownerRole?: ProjectSetupActorRole;
  includeCanceled?: boolean;
  includeCompleted?: boolean;
  includeFailed?: boolean;
  projectNumber?: string;
  limit?: number;
}

export interface IProjectSetupSummaryResult {
  requests: IProjectSetupRequest[];
  totalCount: number;
  awaitingControllerCount: number;
  clarificationCount: number;
  provisioningCount: number;
  failedCount: number;
  completedCount: number;
  lastRefreshedIso: string;
}

export interface IProjectSetupCommandResult {
  success: boolean;
  message?: string;
  requestId?: string;
}
```

---

## Feature Architecture

```text
apps/
├── estimating/
│   └── src/pages/
│       ├── NewRequestPage.tsx                  # existing intake foundation
│       ├── ProjectSetupPage.tsx                # existing workflow entry / list surface
│       ├── RequestDetailPage.tsx               # existing requester detail/progress foundation
│       ├── RequestClarificationPage.tsx        # add
│       └── RequestCompletionPage.tsx           # add or fold into detail
├── accounting/
│   └── src/pages/
│       ├── ProjectSetupInboxPage.tsx           # add
│       ├── ControllerSetupPage.tsx             # add
│       └── ControllerReviewPanels.tsx          # add
├── admin/
│   └── src/pages/
│       ├── ProvisioningFailuresPage.tsx        # existing recovery foundation
│       ├── ProvisioningRecoveryDetailPage.tsx  # add
│       └── ProvisioningAuditPage.tsx           # optional add
packages/
├── models/
│   └── src/provisioning/
│       └── IProvisioning.ts                    # extend request/run/history contracts
├── provisioning/
│   └── src/
│       ├── api-client.ts                       # existing client contract
│       ├── state-machine.ts                    # extend lifecycle semantics
│       ├── notification-templates.ts          # existing lifecycle notifications
│       ├── visibility-rules.ts                 # requester/controller/admin visibility
│       ├── hooks/
│       │   └── useProvisioningSignalR.ts       # existing live progress hook
│       └── store/
│           └── provisioning-store.ts           # status/progress client state
├── step-wizard/                                # progress projection
├── bic-next-move/                              # ownership / ball-in-court mapping
├── field-annotations/                          # clarification field-note support
├── notification-intelligence/                  # user-facing lifecycle notifications
└── ui-kit/                                     # all reusable visual components
backend/
└── functions/src/functions/
    ├── projectRequests/
    │   └── index.ts                            # existing request lifecycle routes
    ├── provisioningSaga/
    │   ├── index.ts                            # start / status entrypoints
    │   ├── saga-orchestrator.ts                # existing multi-step orchestrator
    │   └── steps/
    │       ├── step1-create-site.ts
    │       ├── step2-document-library.ts
    │       ├── step3-template-files.ts
    │       ├── step4-data-lists.ts
    │       ├── step5-web-parts.ts
    │       ├── step6-permissions.ts
    │       └── step7-hub-association.ts
    ├── signalr/
    │   └── index.ts                            # existing per-project SignalR groups
    └── timerFullSpec/
        └── index.ts                            # existing deferred completion path
```

---

## Component Specifications

### `HbcProjectSetupIntake` — Requester Intake Surface

```typescript
interface HbcProjectSetupIntakeProps {
  mode?: 'new' | 'edit-draft';
  initialValue?: Partial<IProjectSetupRequest>;
  onSubmit: (draft: Partial<IProjectSetupRequest>) => Promise<IProjectSetupCommandResult>;
  onSaveDraft?: (draft: Partial<IProjectSetupRequest>) => Promise<IProjectSetupCommandResult>;
}
```

**Visual behavior:**

- short, guided, hard to misuse
- business-friendly labels
- required fields limited to MVP inputs
- supports draft save where practical
- makes Department meaning clear without exposing template complexity
- should never feel like a heavy enterprise intake form

### `HbcProjectSetupDetail` — Requester Lifecycle Surface

```typescript
interface HbcProjectSetupDetailProps {
  requestId: string;
  showHistory?: boolean;
  showComments?: boolean;
  showProgress?: boolean;
}
```

**Visual behavior:**

- shows current state, current owner, and next expected action
- shows clarification, cancellation, reopen, retry, and admin-takeover history
- shows provisioning progress when applicable
- surfaces one primary CTA based on current permission state
- keeps business language ahead of technical detail by default

### `HbcProjectSetupClarificationView` — Returned-Field Review Surface

```typescript
interface HbcProjectSetupClarificationViewProps {
  requestId: string;
  highlightedFieldKeys?: string[];
  onResubmit: (requestId: string) => Promise<IProjectSetupCommandResult>;
}
```

**Visual behavior:**

- highlights exact fields returned by Controller
- preserves notes until explicitly resolved
- supports “save draft” while in clarification
- shows original vs updated values
- requires explicit resubmit / continue action

### `HbcControllerSetupWorkspace` — Controller Gate Surface

```typescript
interface HbcControllerSetupWorkspaceProps {
  requestId: string;
  onSendBack: (requestId: string, fields: IProjectSetupClarificationField[]) => Promise<IProjectSetupCommandResult>;
  onSaveSetup: (requestId: string, projectNumber: string) => Promise<IProjectSetupCommandResult>;
  onFinishSetup: (requestId: string, projectNumber: string) => Promise<IProjectSetupCommandResult>;
}
```

**Visual behavior:**

- treats `AwaitingExternalSetup` as the Controller’s manual business-setup phase
- allows small cleanup corrections only
- does not allow silent major business corrections
- validates project number format and uniqueness
- allows duplicate save but blocks progression
- starts provisioning only from **Finish Setup**
- should feel fast, decisive, and low-friction

### `HbcProvisioningProgressView` — Plain-English Progress Surface

```typescript
interface HbcProvisioningProgressViewProps {
  requestId: string;
  steps: IProjectSetupProvisioningStep[];
  estimatedTimeRemainingLabel?: string;
}
```

**Visual behavior:**

- uses a step-based presentation
- shows completed/current/upcoming states
- uses plain-English step labels
- shows one simple whole-process time estimate
- avoids forcing business users to interpret technical logs

### `HbcProvisioningFailureView` — Requester Recovery Surface

```typescript
interface HbcProvisioningFailureViewProps {
  requestId: string;
  canRetry: boolean;
  onRetry: (requestId: string) => Promise<IProjectSetupCommandResult>;
  onReportFailure: (requestId: string, summary: string) => Promise<IProjectSetupCommandResult>;
}
```

**Visual behavior:**

- shows clear business-language failure summary
- allows one self-service retry
- allows business-user failure report submission
- explains when admin takeover occurs
- shows whether this is the first or second failure path

### `HbcProvisioningAdminRecovery` — Admin Takeover Surface

```typescript
interface HbcProvisioningAdminRecoveryProps {
  requestId: string;
  onTakeOver: (requestId: string) => Promise<IProjectSetupCommandResult>;
  onSaveCorrection: (requestId: string, patch: Partial<IProjectSetupRequest>) => Promise<IProjectSetupCommandResult>;
  onRetryFromAdmin: (requestId: string) => Promise<IProjectSetupCommandResult>;
}
```

**Visual behavior:**

- shows full recovery detail
- shows prior failure history and retry usage
- allows limited corrective actions such as access-list cleanup and department/library correction
- records visible admin change summaries
- preserves business-user trust by making takeover and correction visible

### `HbcProjectSetupCompletionLaunch` — Completion Handoff Surface

```typescript
interface HbcProjectSetupCompletionLaunchProps {
  requestId: string;
  siteUrl: string;
  launchPageUrl?: string;
  onOpenSite: () => void;
}
```

**Visual behavior:**

- shows success clearly
- gives direct site link
- gives created-site summary
- links into the getting-started page
- makes the finished result feel real and usable, not merely “completed in backend”

---

## Workflow Transition & Governance Discipline

A controlled MVP requires deterministic workflow rules.

### Governing Rules

1. **Provisioning starts only from the Controller path.**
2. **The project number is the decisive business gate.**
3. **Duplicate project numbers may be saved but may not advance the request.**
4. **Controllers may fix only small cleanup items directly.**
5. **Major business corrections must go back through clarification.**
6. **Cancellation is allowed only in pre-provisioning states.**
7. **Reopen returns the request to its prior state and requires requester review/resubmit.**
8. **One self-service retry is allowed.**
9. **Second failure escalates ownership to Admin.**
10. **Every major transition must create visible history.**

### Clarification Rules

The clarification model should support:

- field-specific return notes
- note persistence until resolved
- original vs updated values
- explicit resubmit
- change summary on resubmission

General comments may exist, but should not replace structured clarification.

### Cancellation Rules

- allowed in any pre-provisioning state
- requester, Controller, and Admin may cancel
- cancellation reason is required
- request remains in system
- history remains intact
- Controller and Admin are notified

### Reopen Rules

- Controller or Admin may reopen
- request returns to exact prior state
- requester temporarily owns first action after reopen
- requester must click **Resubmit / Continue**
- older history remains visible, but collapses after first view for readability

### Failure / Retry / Escalation Rules

- first failure → business-readable failure summary + one self-service retry
- second failure → automatic admin takeover path
- business user must be able to see that admin took over
- admin changes must be visible in recovery history
- retry and takeover must feel governed, not ad hoc

### Progress Rules

The progress experience must:

- show step list
- show current step and status
- use plain-English labels
- show estimated remaining time
- preserve trust if a step is deferred or retried

---

## Provisioning, Template, and Access Bootstrap Model

The MVP should intentionally keep branching low and governance high.

### Provisioning Boundary

Provisioning logic remains centralized under `@hbc/provisioning` and backend saga functions. Visual surfaces belong in apps and reusable UI belongs in `@hbc/ui-kit`.

### Step Sequence

Expected step sequence remains aligned to the current step-based model:

1. Create Site
2. Document Library
3. Template Files
4. Data Lists
5. Web Parts
6. Permissions
7. Hub Association

If some steps are deferred, the business-user experience must still stay understandable.

### Template Strategy

- one maintained internal template site
- template contains both department libraries
- provisioning keeps the library that matches Department
- provisioning removes the library that does not apply
- project type is recorded, not used for heavy branching in MVP

### Access Bootstrap Model

Initial provisioning access should include:

- request-listed users added automatically
- same basic access level for request-listed users in MVP
- default shared-services / leadership access applied quietly in background
- structural ownership reserved for Admin and OpEx manager

Post-creation rules should allow:

- project team to perform non-structural work
- Admin / OpEx to perform structural and broadly applied changes
- approved business roles to grant additional access
- anyone to request access
- no external users in MVP

### Governance Principle

HB Intel remains the system of record for workflow and governance. SharePoint permissions are an execution target, not the authoritative operating model.

---

## PWA / Session Resilience Model

This feature is not primarily an offline workflow, but it still benefits from resumable behavior.

### Required Resilience Behaviors

- request drafts should survive refresh/navigation where practical
- request detail and progress should tolerate reconnect/resubscribe behavior
- provisioning progress should remain understandable if live updates are interrupted
- cached status may be shown briefly with explicit freshness messaging
- failure, retry, and completion actions must remain idempotent and guarded

### Context-Specific Rules

- **Standalone PWA:** supports draft continuity, reconnect-safe detail view, and status refresh
- **SPFx host context:** supports refresh-safe reads and guarded actions
- **Mobile / narrow-width usage:** emphasizes top-level state, owner, primary action, and progress clarity rather than dense admin detail

---

## Multi-Surface Rendering Consistency

This feature should deliberately separate:

- workflow truth
- presentation projection
- role-specific action disclosure

### Non-Negotiable Rules

- Estimating, Accounting, and Admin surfaces all consume the same core request/run/history truth
- request state and run state are not redefined per app
- owner/next-move semantics are consistent across surfaces
- progress count/status logic is not duplicated differently per page
- history semantics are shared even when each surface defaults to different disclosure depth
- mobile and desktop differ in density, not in truth

### Recommended Projection Strategy

- **Estimating list/detail** → requester-oriented state, owner, progress, retry, history
- **Controller workspace** → review correctness, project number, trigger eligibility, send-back controls
- **Admin recovery** → failure detail, corrective authority, takeover history, retry-from-admin
- **Completion launch** → launch confidence and first-use orientation

---

## Package Setup, State Management & Testing Expectations

This feature spans apps, shared packages, and backend functions. It should still be implemented with clear ownership boundaries.

### Dependency Rules

The feature should primarily rely on:

- `@hbc/ui-kit`
- `@hbc/provisioning`
- `@hbc/models`
- `@hbc/bic-next-move`
- `@hbc/field-annotations`
- `@hbc/notification-intelligence`
- `@hbc/step-wizard`

It should avoid hiding business rules inside app-local code when the rule belongs to the shared lifecycle or provisioning engine.

### State Management Rules

- shared contracts and state transitions live in `@hbc/models` and `@hbc/provisioning`
- backend transition guards remain authoritative for allowed state advancement
- app-local state should remain presentation-only
- progress subscriptions should use the existing SignalR pattern
- history and lifecycle truth should not depend on shell-only stores

### Testing Strategy

The feature should follow a four-layer test model.

1. **Unit tests**
   - request transition guards
   - cancel / reopen semantics
   - project-number validation rules
   - retry and escalation rules
   - permission bootstrap rules
   - notification template selection

2. **Hook / integration tests**
   - requester detail state consistency
   - controller finish-setup trigger flow
   - progress subscription updates
   - failure-to-retry transition
   - second-failure takeover transition

3. **Component tests in browser mode**
   - intake form
   - clarification view
   - controller setup workspace
   - progress stepper
   - failure view
   - admin recovery view
   - completion launch view

4. **E2E tests**
   - submit request from Estimating
   - Controller send-back and requester resubmit
   - Controller finish setup with valid project number
   - duplicate project number blocks trigger
   - provisioning updates are visible
   - one retry works correctly
   - second failure escalates to Admin
   - admin correction and recovery are visible
   - completed site opens successfully
   - getting-started page is reachable

### Testing Export / Fixtures

The feature test harness should include fixtures for:

- standard commercial request
- standard luxury residential request
- clarification return / resubmit
- canceled request / reopen
- duplicate project number
- first-failure retry success
- second-failure admin takeover
- completion with getting-started launch

---

## Governance, Auditability & Operational Readiness

This feature succeeds only if users trust it.

### Audit Expectations

The workflow should emit auditable events for:

- request created
- request submitted
- clarification sent
- clarification resubmitted
- project number entered
- finish setup triggered
- provisioning started
- step updated
- failure reported
- retry requested
- escalation triggered
- admin takeover started
- admin correction saved
- request canceled
- request reopened
- provisioning completed
- site launched

### Audit-Friendly Data Requirements

Each request should preserve:

- actor identity
- state at time of event
- project number state
- changed fields where relevant
- clarification notes
- cancellation / reopen reason
- retry count and entitlement
- takeover ownership
- completion / launch data
- timestamps for all major events

### Operational Trust Requirements

The feature should expose enough information to answer:

- is the request waiting on a person or the system?
- is provisioning still running?
- is a retry still available?
- did admin take over?
- what changed since the last failure?
- why is the user unable to act?
- what site was created?

### Pilot Readiness Rules

The first controlled pilot should validate:

- correct site creation
- clear lifecycle understanding
- correct Controller gate behavior
- understandable progress
- trustworthy retry/escalation behavior
- governed access bootstrap
- usable getting-started launch
- leadership confidence that the workflow is more standardized and manageable than current methods

---

## Integration Points

| Package / Surface | Integration |
|---|---|
| `@hbc/provisioning` | headless workflow logic, client contract, progress store, visibility rules |
| `@hbc/models` | request/run/history contract and provisioning step model |
| `backend/functions/src/functions/projectRequests` | authoritative request lifecycle routes and transition validation |
| `backend/functions/src/functions/provisioningSaga` | provisioning orchestration and step execution |
| `backend/functions/src/functions/signalr` | per-project live progress updates |
| `backend/functions/src/functions/timerFullSpec` | deferred completion path for long-running work |
| `@hbc/bic-next-move` | explicit ownership / next-move semantics by state |
| `@hbc/field-annotations` | field-specific clarification and return-to-requester behavior |
| `@hbc/notification-intelligence` | lifecycle notifications, escalation, completion messaging |
| `@hbc/step-wizard` | business-readable step-by-step progress surface |
| `@hbc/ui-kit` | all reusable workflow visuals, lists, buttons, banners, and detail components |
| `apps/estimating` | requester intake, detail, clarification, retry, completion launch |
| `apps/accounting` | Controller review, external setup, project number gate, trigger |
| `apps/admin` | failure review, takeover, recovery, audit visibility |

---

## Expected Consumers

- **Estimating Coordinator / requester** — starts requests, handles clarification, watches progress, retries once, launches site
- **Controller** — reviews, requests clarification, performs external setup, validates project number, triggers provisioning
- **Admin / Platform group** — handles escalated failures, limited corrective edits, retry from admin path
- **OpEx Manager** — structural standards owner and background governance role
- **Project team members** — receive post-creation access and use the created site
- **Leadership / product owner** — evaluates the pilot as proof that HB Intel can standardize project setup

---

## Priority & ROI

**Priority:** P1 — this is the MVP proof point and should be delivered before broader lifecycle expansion

**Estimated build effort:** 5–7 sprint-weeks, depending on how much of the Controller flow and history model must still be built

### Primary effort areas

- request contract and lifecycle hardening
- Controller workflow surfaces
- backend/API parity and transition guards
- permission bootstrap expansion
- retry/escalation and admin recovery hardening
- completion / getting-started launch experience
- test harness and pilot readiness validation

### ROI

- proves the platform can own a real business workflow end to end
- standardizes project setup around one governed path
- reduces ambiguity in request ownership and provisioning behavior
- makes SharePoint site creation feel controlled and understandable
- creates leadership confidence in the broader HB Intel operating model
- establishes a reusable pattern for future lifecycle workflows

---

## Definition of Done

- [ ] request intake includes department and other MVP-required fields
- [ ] request contract supports request state, run state, and visible history
- [ ] clarification workflow supports field-level notes and explicit resubmission
- [ ] cancellation is supported in pre-provisioning states with required reason
- [ ] reopen returns to prior state and requires requester resubmit/continue
- [ ] Controller workflow exists in Accounting surfaces
- [ ] project-number validation enforces format and uniqueness rules
- [ ] duplicate project number blocks progression but allows save
- [ ] provisioning begins only from **Finish Setup**
- [ ] progress surface shows step-by-step plain-English state
- [ ] one self-service retry is supported
- [ ] second failure escalates to Admin
- [ ] admin takeover and corrections are visible in history
- [ ] permission bootstrap matches the hybrid MVP access model
- [ ] external users are excluded from MVP
- [ ] completion state includes site link and getting-started launch
- [ ] requester, Controller, and Admin surfaces all use consistent lifecycle truth
- [ ] unit tests cover transitions, validation, retry, escalation, and permissions
- [ ] component tests cover intake, controller workspace, progress, failure, recovery, and completion
- [ ] E2E tests cover submit → review → finish setup → provision → retry/escalate → completion
- [ ] README / feature documentation explains state semantics, role ownership, trigger rules, and pilot success criteria
- [ ] pilot validation checklist exists for the first 4–10 real sites

---

## ADR / Decision Record Reference

Use the existing governing ADRs as the baseline:

- `ADR-0077` — provisioning package boundary
- `ADR-0063` — access control backend and data model
- `ADR-0090` — SignalR per-project groups

Create a new feature-decision record or ADR addendum documenting:

- the decision to treat MVP Project Setup as a **Provisioning-Centered Platform Proof**
- the separation of request state from provisioning run state
- Controller ownership of the final project-number gate and trigger
- the one-retry / second-failure-admin-takeover recovery model
- the one-template / department-pruning provisioning strategy
- the governed post-creation access model
- the completion and getting-started launch expectation

---

## Source Basis

This feature summary is grounded in:

- `HBI_MVP_SharePoint_Provisioning_Blueprint.md`
- `HBI_MVP_SharePoint_Provisioning_Roadmap.md`
- `CLAUDE.md`
- `docs/architecture/blueprint/current-state-map.md`
- `docs/architecture/blueprint/HB-Intel-Blueprint-V4.md`
- `docs/architecture/adr/ADR-0077-provisioning-package-boundary.md`
- `docs/architecture/adr/ADR-0063-access-control-backend-and-data-model.md`
- `docs/architecture/adr/ADR-0090-signalr-per-project-groups.md`
- `packages/models/src/provisioning/IProvisioning.ts`
- `packages/provisioning/src/state-machine.ts`
- `packages/provisioning/src/api-client.ts`
- `backend/functions/src/functions/projectRequests/index.ts`
- `backend/functions/src/functions/provisioningSaga/saga-orchestrator.ts`
- `backend/functions/src/functions/provisioningSaga/steps/step6-permissions.ts`
- `apps/estimating/src/pages/NewRequestPage.tsx`
- `apps/estimating/src/pages/RequestDetailPage.tsx`
- `apps/admin/src/pages/ProvisioningFailuresPage.tsx`
