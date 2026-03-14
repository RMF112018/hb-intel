# W0-G3-T03 — Clarification Loop and Return-to-Flow Behavior

> **Doc Classification:** Canonical Normative Plan — Wave 0 Group 3 task plan defining how the clarification loop integrates with the guided step-wizard flow, how the requester returns to the form, how previously-entered data is preserved, and how resubmission completes the clarification cycle.

**Phase Reference:** Wave 0 Group 3 — Shared-Platform Wiring and Workflow Experience Plan
**Depends On:** T01 (step-wizard config), T02 (BIC config — ownership during clarification), MVP Project Setup T03 (controller gate — clarification request model), MVP Project Setup T04 (estimating requester surfaces)
**Unlocks:** T04 (clarification notification spec), T07 (clarification failure modes), G4/G5 entry condition T03
**Repo Paths Governed:** `apps/estimating/src/`, `packages/step-wizard/src/`, `packages/session-state/src/`, `packages/notification-intelligence/src/`, `packages/provisioning/src/` (state machine)

---

## Objective

This task defines the complete behavioral contract for the clarification loop — the cycle that begins when a controller flags items needing revision and ends when the controller resumes review after the requester has responded.

The locked G3-D2 decision requires a hybrid model: visible work item in clarification state plus guided return into the setup flow for fixes. This task specifies what that means precisely in terms of lifecycle state, data preservation, step-wizard re-entry, resubmission, and controller visibility.

---

## Why This Task Exists

Without this specification, the clarification loop would be implemented as one of two inadequate patterns:

**Pattern A (too loose):** A comment thread is added to the request. The controller writes a comment. The requester reads the comment and submits a new version. No guidance. No field-level specificity. No wizard involvement. The requester may or may not address the right things. The controller has no visibility into what changed.

**Pattern B (too disruptive):** The request is returned to `Draft` state and the requester must re-enter all data from scratch. All previously-entered values are lost. Trust in the platform is damaged.

G3-D2 requires neither. The correct behavior is: the requester sees a clearly marked work item in `NeedsClarification` state (Phase 2 representation from T02), receives an action-required notification (T04), and when they choose to act, they are guided back into the same step-wizard flow with the exact fields flagged, their data preserved, and a clear resubmission path.

---

## Scope

T03 specifies:
- How `NeedsClarification` is represented as a lifecycle state in the BIC and summary view
- How the controller raises clarification requests (the `IRequestClarification` model)
- How the requester is notified (T04 governs the event; T03 specifies the trigger condition)
- How the requester returns to the guided flow (step-wizard re-entry rules from T01 extended here)
- How previously-entered data is preserved (session-state contract from T05 extended here)
- How flagged steps and fields are identified and displayed
- How resubmission works and what the controller sees after resubmission
- How resubmission clears the clarification state

T03 does not specify:
- The visual design of the clarification annotation display (G4/G5 scope)
- The full controller review surface (MVP Project Setup T03 scope)
- Notification event registration details (T04 scope)
- Auto-save implementation (T05 scope)

---

## Governing Constraints

- The clarification loop must not force a full restart. Previously-entered data must be preserved unless the requester explicitly clears it.
- Clarification must not be implemented as a loose comment-only process if guided return is intended (G3-D2).
- The same `@hbc/session-state` draft mechanism that saves the initial form submission also governs clarification-return context (G3-D4). T05 defines the draft key strategy for both cases.
- The `NeedsClarification` state is a confirmed real lifecycle state in `packages/provisioning/src/state-machine.ts` with an existing `STATE_NOTIFICATION_TARGETS` entry. G3 must not introduce an alternate clarification state outside the provisioning state machine.

---

## The Clarification Lifecycle in Full

```
Controller reviews request
         │
         ▼
Controller flags one or more fields with clarification annotations
[IRequestClarification[] stored on request]
         │
         ▼
Request transitions to NeedsClarification state
[IProvisioningStatus.workflowStage = 'NeedsClarification']
         │
         ▼
BIC transfers to Requester (T02)
Notification fired: provisioning.clarification-requested → Requester (T04)
         │
         ▼
Requester receives notification (action-required, immediate tier)
Requester sees work item in NeedsClarification state
         │
         ▼
Requester clicks "Respond to Clarification" CTA
Step-wizard reopens with flagged steps marked (clarification-return mode)
Context loaded from clarification-specific draft key (T05)
         │
         ▼
Requester updates flagged fields
Requester may optionally update any other non-flagged step
         │
         ▼
Requester reaches Step 5 (Review) — review includes clarification responses summary
Requester clicks "Submit Clarification Response"
         │
         ▼
Request transitions to Submitted state (or UnderReview per configuration)
IRequestClarification items marked as responded
BIC transfers back to Controller
Notification fired: provisioning.clarification-responded → Controller (T04)
         │
         ▼
Controller resumes review with diff view of changes
```

---

## Clarification Request Model

The `IRequestClarification` model is defined in `@hbc/models` (or `@hbc/provisioning`). Each clarification item represents a single annotated field:

```typescript
export interface IRequestClarification {
  clarificationId: string;       // unique ID for this annotation
  fieldId: string;               // identifies the form field (e.g., 'projectName', 'department')
  stepId: string;                // identifies the step (from T01 step definitions)
  message: string;               // controller's note explaining what needs to change
  raisedBy: string;              // userId of the controller who raised it
  raisedAt: string;              // ISO timestamp
  status: 'open' | 'responded'; // open = pending; responded = requester has addressed it
  responseNote?: string;         // optional requester response note
  respondedAt?: string;          // ISO timestamp when requester marked it responded
}
```

**Field ID to Step ID mapping (for T01 step structure):**

| fieldId | stepId |
|---------|--------|
| `projectName`, `location`, `estimatedValue`, `clientName`, `startDate` | `project-info` |
| `department`, `projectType`, `projectStage`, `contractType` | `department` |
| `projectLeadId`, `groupMembers`, `viewerUPNs` | `project-team` |
| `addOns` | `template-addons` |

The `stepId` field on `IRequestClarification` enables the step-wizard re-entry logic to identify which steps to flag. If the controller annotates `department`, the `department` step is flagged. If the controller annotates both `projectName` and `projectLeadId`, both `project-info` and `project-team` are flagged.

---

## How the Controller Raises a Clarification Request

The controller review surface (MVP Project Setup T03) displays the submitted request. For each displayed field, the controller may add an annotation via `@hbc/field-annotations`. When the controller submits a clarification:

1. The controller writes an annotation message for each field requiring clarification
2. `IRequestClarification` items are created for each annotated field (with `status: 'open'`)
3. The request transitions to `NeedsClarification` via `ProjectSetupApi.requestClarification(requestId, clarifications[])`
4. The backend fires the `provisioning.clarification-requested` notification (T04)
5. The BIC transfer executes (T02) — controller → requester

**What the controller must NOT do:**
- Transition the request to any other state while raising clarifications
- Mark clarifications as responded on behalf of the requester
- Submit a new version of the request

---

## Step-Wizard Re-Entry: Detailed Rules

When the requester clicks "Respond to Clarification," the surface must open the step wizard in clarification-return mode following these exact rules:

### Step 1 — Load Existing Request Data

Load the `IProjectSetupRequest` from the API (the submitted/current version, not a cached local version). This is the authoritative source — the values the controller reviewed and annotated.

```typescript
const request = await ProjectSetupApi.get(requestId);
const clarifications = request.clarificationItems; // IRequestClarification[]
```

### Step 2 — Identify Flagged Steps

Extract all unique `stepId` values from open clarifications:

```typescript
const flaggedStepIds = new Set(
  clarifications.filter(c => c.status === 'open').map(c => c.stepId)
);
// e.g., Set { 'project-info', 'project-team' }
```

### Step 3 — Initialize Wizard with Flagged State

Initialize the `useStepWizard` hook with the following overrides:
- All steps that do NOT appear in `flaggedStepIds`: status = `complete`
- All steps that appear in `flaggedStepIds`: status = `in-progress`
- `activeStepId`: the first step in the wizard's sequential order that appears in `flaggedStepIds`

```typescript
const wizardInitialState = STEPS_IN_ORDER.map(step => ({
  ...step,
  status: flaggedStepIds.has(step.stepId) ? 'in-progress' : 'complete',
}));
const activeStepId = STEPS_IN_ORDER.find(s => flaggedStepIds.has(s.stepId))?.stepId;
```

### Step 4 — Display Clarification Annotations Within the Flagged Step

For each flagged step, the step's rendered content must visibly mark the fields that have open clarification annotations. The recommended integration is `@hbc/field-annotations` for the annotation display. At minimum, the field must display the `clarification.message` prominently adjacent to the field input.

The clarification annotation display is the surface's responsibility (G4/G5 scope). T03 specifies that the display must be clearly visible and must not require the user to search for what they need to fix.

### Step 5 — Draft Key for Clarification-Return Mode

The clarification-return mode uses a distinct draft key from the initial submission (T05 governs the full key strategy):

- Initial submission draft key: `'project-setup-form-draft'`
- Clarification-return draft key: `'project-setup-clarification-{requestId}'`

This prevents the initial submission draft from being overwritten during the clarification response. T05 specifies the TTL and cleanup rules for this key.

### Step 6 — Requester Updates Flagged Fields

The requester may update any field in the flagged steps. They may also voluntarily update non-flagged steps if they choose. No step is locked against editing in clarification-return mode — the requester has full editing capability.

As the requester updates fields, changes are auto-saved to the clarification-return draft key (T05 governs auto-save).

### Step 7 — Requester Marks Clarifications as Responded

When the requester has addressed a clarification item (updated the relevant field), they should be able to mark it as responded with an optional note. This can be done inline in the step content or via a clarification summary panel in Step 5 (Review).

Marking a clarification as responded does NOT submit the response — it is a preparatory step before final resubmission.

### Step 8 — Resubmission

When all flagged steps are complete and the requester clicks "Submit Clarification Response" in Step 5:

1. Validate all flagged steps (same validation rules as initial submission)
2. Call `ProjectSetupApi.submitClarificationResponse(requestId, updatedFields, clarificationResponses[])`
3. The backend:
   - Merges the updated fields into the stored `IProjectSetupRequest`
   - Marks all `IRequestClarification` items as `responded`
   - Transitions the request to `Submitted` (or `UnderReview` if no additional controller action is needed per configuration)
   - Fires the `provisioning.clarification-responded` notification (T04)
   - Executes the BIC transfer: requester → controller

4. The surface navigates to the request status view (same as after initial submission)

---

## Data Preservation Contract

### What Must Be Preserved

All previously-entered values on the `IProjectSetupRequest` must be preserved and displayed to the requester when they return for clarification. The requester must not be asked to re-enter any field they already filled in.

Preserved values come from the stored `IProjectSetupRequest` on the server (not from the draft). The draft key `'project-setup-clarification-{requestId}'` stores changes-in-progress during the clarification response session, layered on top of the server values.

### What Must Be Cleared

When the requester submits their clarification response successfully, the clarification-return draft key (`'project-setup-clarification-{requestId}'`) must be cleared. The initial submission draft key (`'project-setup-form-draft'`) should also be cleared if it still exists (it is no longer relevant once submission was successful).

### What Must NOT Be Cleared

The `IRequestClarification[]` history on the request. Even after clarifications are resolved, the clarification history is retained as part of the audit trail. This history appears in the expandable history panel (T06).

---

## Controller Visibility After Resubmission

After the requester submits their clarification response, the controller resume view must show:

1. The request is back in `Submitted` (or `UnderReview`) state with BIC transferred to the controller
2. A visible diff of what changed since the previous review (the fields that were clarified and are now updated)
3. The clarification annotations are shown as `responded`, with the requester's response notes
4. The controller may now approve (advance to `ReadyToProvision`), flag additional clarifications (back to `NeedsClarification`), or escalate

**What the controller must NOT see:**
- A completely fresh request with no indication of clarification history
- An ambiguous "submitted again" notification with no diff context

The diff view and clarification history display are G4/G5 scope. T03 specifies the behavioral contract that the data model must support.

---

## Consistency Requirements Across Parties

The following behavioral expectations must be consistent for controller, requester, and admin:

| Concern | Controller sees | Requester sees | Admin sees |
|---------|-----------------|----------------|------------|
| NeedsClarification state | BIC badge showing Requester as owner; review paused | Work item requiring action; "Respond to Clarification" CTA | Request in clarification state; visible in failure monitor if overdue |
| Clarification annotations | Annotations they raised; which are open vs. responded | Annotations on their fields; guidance on what to fix | All annotations on all requests |
| After resubmission | BIC transferred back; diff of changes; "responded" annotations | Request back in Submitted state; awaiting review | Back to normal review state |

---

## Failure and Edge Case Handling

**Edge case — Controller raises clarifications; requester partially responds and abandons:**
The draft is persisted with TTL. If the requester returns before TTL expiry, the draft is restored and they continue from where they left off. If TTL expires (T05 governs TTL — recommended 7 days for clarification context), the surface offers to reload from the server values (which still have the original submitted request state).

**Edge case — Second clarification round (controller flags again after first response):**
The clarification loop may repeat. Each round must be independently tracked in the `IRequestClarification[]` history. The clarification-return draft key uses `{requestId}` as the discriminator — if a new clarification round is initiated after the previous was cleared, the surface creates a fresh draft for the new round.

**Edge case — Controller edits clarification annotations before requester responds:**
If the controller modifies or retracts a clarification annotation before the requester has responded, the surface must reload the latest clarification annotations when the requester opens the return flow. The surface must not display stale annotations from a prior load.

---

## Required Outputs

| Artifact | Location | Description |
|----------|----------|-------------|
| Clarification re-entry integration spec | `docs/reference/workflow-experience/clarification-reentry-spec.md` | Full re-entry rules, field-to-step mapping, data preservation contract, resubmission flow |

The reference document must include:
- Complete field-to-step mapping table
- Step-wizard initialization rules for clarification-return mode (step 1–8 above)
- Data preservation and clearing rules
- Controller visibility-after-resubmission requirements

---

## Acceptance Criteria

- [ ] `IRequestClarification` model is specified with all fields
- [ ] Field-to-step mapping table is complete for all T01 form fields
- [ ] Step-wizard re-entry initialization rules are specified step-by-step
- [ ] Draft key strategy for clarification-return mode is defined (distinct from initial submission)
- [ ] Data preservation and clearing rules are explicit
- [ ] Resubmission flow is specified (API call, state transition, notification trigger, BIC transfer)
- [ ] Controller visibility after resubmission is specified
- [ ] Edge cases (abandoned clarification, second round, retracted annotations) are addressed
- [ ] Reference document exists at `docs/reference/workflow-experience/clarification-reentry-spec.md`
- [ ] Reference document is added to `current-state-map.md §2`

---

*End of W0-G3-T03 — Clarification Loop and Return-to-Flow Behavior v1.0*
