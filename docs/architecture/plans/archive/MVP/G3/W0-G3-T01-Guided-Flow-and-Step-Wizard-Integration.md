# W0-G3-T01 — Guided Flow and Step-Wizard Integration

> **Doc Classification:** Canonical Normative Plan — Wave 0 Group 3 task plan defining how `@hbc/step-wizard` governs the requester-facing guided project setup flow. This plan specifies the step structure, validation model, save/resume integration points, clarification re-entry behavior, and the boundary between wizard behavior and lifecycle state.

**Phase Reference:** Wave 0 Group 3 — Shared-Platform Wiring and Workflow Experience Plan
**Depends On:** G1 (T01 site template, T02 group model), G2 (provisioning saga steps), MVP Project Setup T02 (contracts), MVP Project Setup T04 (estimating requester surfaces)
**Unlocks:** T03 (clarification re-entry rules), T05 (draft key for setup form), G4/G5 entry condition T01
**Repo Paths Governed:** `packages/step-wizard/src/`, `apps/estimating/src/` (setup form), `apps/pwa/src/` (PWA setup page)

---

## Objective

This task defines the exact integration contract between `@hbc/step-wizard` and the project setup intake form. The existing estimating setup form (`apps/estimating/`) exists as a flat form that must be migrated to a step-wizard-governed multi-step flow. This task specifies what that migration produces — the step structure, the config object, the validation requirements per step, the BIC assignee resolution per step, the draft persistence integration, and the clarification re-entry behavior.

This task does not implement the migration. It produces the governing specification that the G4 implementation task follows.

---

## Why This Task Exists

The validation report confirmed that the existing estimating setup form:
- Is not wired to `@hbc/step-wizard`
- Lacks the required `department` field
- Has no step-level progress tracking
- Has no step-level validation (only full-form submit validation)
- Has no auto-save or resume capability

The MVP Project Setup T04 plan specifies that `@hbc/step-wizard` is a **Tier-1 Platform Primitive** for the requester UX and that no app-local step checklist duplication is permitted. T01 (G3) provides the specific integration contract that T04 (project-setup) must implement.

Without this contract, the G4 estimating surface team would need to invent the step structure, validation rules, and draft key strategy independently. The result would be inconsistent with the `@hbc/step-wizard` contract and incompatible with the clarification re-entry behavior T03 requires.

---

## Scope

T01 specifies:
- The complete `IStepWizardConfig<IProjectSetupRequest>` for the project setup intake flow
- Step-level validation requirements and implementation notes
- BIC assignee resolution per step (where applicable)
- Draft key and session-state integration point
- How the wizard `orderMode` maps to the business intent of the setup flow
- How the wizard opens for a first-time submission vs. a clarification return
- The explicit boundary between what the wizard owns and what the provisioning lifecycle state machine owns

T01 does not specify:
- The visual design of the form steps (G4/G5 scope)
- The specific SharePoint field schema (G2 scope)
- The provisioning saga execution (backend scope)
- Notification events fired at step transitions (T04 scope)
- Auto-save implementation details (T05 scope)

---

## Governing Constraints

- `@hbc/step-wizard` is a Tier-1 Platform Primitive for multi-step workflow UX. App-local step checklist duplication is explicitly prohibited (MVP Project Setup T04 §5.1).
- The step wizard must use `@hbc/session-state` `useDraft` for persistence when `draftKey` is provided. The G4 implementation must not introduce a parallel form persistence mechanism.
- The step wizard does not own `IProjectSetupRequest.workflowStage` — that is `@hbc/provisioning`'s state machine. The wizard's `IStepRuntimeEntry.status` is presentation state, not lifecycle state. A completed wizard does not automatically advance the provisioning state — the surface must explicitly call the lifecycle transition after wizard completion.
- The `department` field is required on the `IProjectSetupRequest` (per G1-T01 §3; implemented in MVP Project Setup T02). G4 must not allow form submission without a valid department value.

---

## Step Structure Specification

The project setup guided flow has **five steps** in `sequential` order mode. Sequential mode means steps are unlocked in order — the user may not jump to step 3 without completing steps 1 and 2. This is appropriate for an intake form where later steps depend on data from earlier steps (e.g., step 2 `department` governs what add-on options appear in step 4).

### Step Definitions

```typescript
import { IStepWizardConfig, IStep } from '@hbc/step-wizard';
import { IProjectSetupRequest } from '@hbc/models';

export const PROJECT_SETUP_WIZARD_CONFIG: IStepWizardConfig<IProjectSetupRequest> = {
  title: 'New Project Setup',
  draftKey: 'project-setup-form-draft', // T05 governs the full draft key strategy
  orderMode: 'sequential',
  allowForceComplete: false,
  onAllComplete: async (request) => {
    // Surface calls IProjectSetupApi.submit(request) after wizard reports complete
    // Wizard does NOT call this directly — the consuming surface orchestrates submission
  },
  steps: [
    STEP_PROJECT_INFO,       // Step 1 — Project identification
    STEP_DEPARTMENT,         // Step 2 — Department and type
    STEP_TEAM,               // Step 3 — Project team
    STEP_TEMPLATE,           // Step 4 — Template and add-ons
    STEP_REVIEW,             // Step 5 — Review and submit
  ],
};
```

### Step 1 — Project Information

```typescript
const STEP_PROJECT_INFO: IStep<IProjectSetupRequest> = {
  stepId: 'project-info',
  label: 'Project Information',
  required: true,
  order: 1,
  validate: (request) => {
    if (!request.projectName?.trim()) return 'Project name is required.';
    if (!request.location?.trim()) return 'Project location is required.';
    if (request.estimatedValue !== undefined && request.estimatedValue < 0)
      return 'Estimated value must be a positive number.';
    return null; // valid
  },
};
```

**Fields collected:** `projectName` (required), `location` (required), `estimatedValue` (optional), `clientName` (optional), `startDate` (optional).

**Validation timing:** Passive (on-blur field feedback) + hard gate (on Next, blocks advance if `validate()` returns non-null).

**Business note:** Project number is NOT entered by the requester. It is assigned by the controller in the controller gate (T03 project-setup plan). The requester form must not show a project number field.

---

### Step 2 — Department and Project Type

```typescript
const STEP_DEPARTMENT: IStep<IProjectSetupRequest> = {
  stepId: 'department',
  label: 'Department & Type',
  required: true,
  order: 2,
  validate: (request) => {
    if (!request.department) return 'Department is required.';
    if (!(['commercial', 'luxury-residential'] as const).includes(request.department))
      return 'Select a valid department.';
    if (!request.projectType) return 'Project type is required.';
    return null;
  },
};
```

**Fields collected:** `department` (required — `'commercial' | 'luxury-residential'`), `projectType` (required — choice field), `projectStage` (optional — choice field), `contractType` (optional).

**Downstream dependency:** `department` governs what is shown in Step 4 (template add-on options visible for the selected department). The consuming surface must re-evaluate step 4 options when `department` changes. If the user returns to step 2 and changes department after completing step 4, step 4 must be reset to `not-started` and the user must re-complete it.

**Validation note:** The `department` field addition to `IProjectSetupRequest` is specified in G1-T01 and implemented in MVP Project Setup T02. G4 must confirm this field is present before implementing this step.

---

### Step 3 — Project Team

```typescript
const STEP_TEAM: IStep<IProjectSetupRequest> = {
  stepId: 'project-team',
  label: 'Project Team',
  required: true,
  order: 3,
  validate: (request) => {
    if (!request.projectLeadId) return 'A project lead (PM or Superintendent) is required.';
    return null;
  },
};
```

**Fields collected:** `projectLeadId` (required — people-picker for PM/Superintendent), `groupMembers` (optional — additional team member UPNs), `viewerUPNs` (optional — additional read-only users).

**BIC integration note:** The project lead selected in this step becomes the initial BIC owner for the `Submitted` state (when the request moves from Draft to Submitted, the system needs a PM-type owner to record). This field value feeds the BIC config (T02) at the provisioning module level.

**Validation note:** The three Entra ID groups (Leaders, Team, Viewers) are created by the provisioning saga (step 6), not during intake. The names collected here are the initial members that will be added during provisioning. The form must make this timing clear to the requester.

---

### Step 4 — Template and Add-Ons

```typescript
const STEP_TEMPLATE: IStep<IProjectSetupRequest> = {
  stepId: 'template-addons',
  label: 'Template & Add-Ons',
  required: false, // required: false because defaults are acceptable without add-ons
  order: 4,
  validate: (request) => {
    // No blocking validation — user may proceed with no add-ons selected
    // Core template is always applied; add-ons are optional
    return null;
  },
};
```

**Fields collected:** `addOns` (optional — `string[]` from the `ADD_ON_DEFINITIONS` registry; `'safety-pack'` and `'closeout-pack'` are the Wave 0 add-ons).

**Department-conditional rendering:** Add-on options visible in this step depend on `department` from step 2. The consuming surface must filter `ADD_ON_DEFINITIONS` by the selected department. If department is not yet set (which should not be possible in sequential mode, but must be handled defensively), show all add-ons with a department disclaimer.

**Core template note:** The core template (8 core lists, 3 core libraries, core template files) is always applied and must not be presented as a "selected" or "optional" item. This step is for add-ons only.

---

### Step 5 — Review and Submit

```typescript
const STEP_REVIEW: IStep<IProjectSetupRequest> = {
  stepId: 'review-submit',
  label: 'Review & Submit',
  required: true,
  order: 5,
  validate: (request) => {
    // Re-validate all required fields as a final pre-submit gate
    if (!request.projectName?.trim()) return 'Project name is required (return to Step 1).';
    if (!request.department) return 'Department is required (return to Step 2).';
    if (!request.projectLeadId) return 'Project lead is required (return to Step 3).';
    return null;
  },
  onComplete: async (request) => {
    // The consuming surface (not this callback) calls IProjectSetupApi.submit()
    // This callback is reserved for any pre-submit cleanup needed
    // Do not call lifecycle transition from within this step callback
  },
};
```

**Content:** Read-only summary of all entered values. Edit links that send the user back to the relevant step (step wizard `goTo()` for sequential-with-jumps, or restart for strict sequential). Final submit CTA.

**Submission behavior:** The consuming surface calls `IProjectSetupApi.submit(request)` on wizard completion, then handles the API response (navigate to status tracker on success; show error on failure). The wizard's `onAllComplete` is a notification point — the actual submission is the surface's responsibility.

---

## Validation Between Steps

### Passive Validation (On Blur)

Each required field in a step fires `validate()` against the current step when the user leaves the field. The error message from `validate()` populates `IStepRuntimeEntry.validationError` and is displayed inline below the field.

The wizard does **not** prevent the user from continuing to fill out the current step after a validation error. The error is advisory until the user clicks Next.

### Hard Gate Validation (On Next)

When the user clicks Next (or Complete on the final step), the step's `validate()` function is called. If it returns a non-null error:
- The step does not advance
- The error is displayed prominently (inline + toast if the field is not visible)
- The active step ID remains the current step

### Cross-Step Consistency

Step 5 (Review) re-validates all required fields from all prior steps. This catches the edge case where session-state restoration produces a partially valid state that passed individual step validation at the time but has become inconsistent (e.g., `department` changed since step 4 was completed).

---

## First-Time vs. Clarification-Return Opening Behavior

### First-Time Opening

When the user opens the setup form for the first time (new request):
1. Check `useDraft<IProjectSetupRequest>('project-setup-form-draft')` — if a draft exists, offer to restore it (see T05)
2. If no draft: initialize wizard with all steps `not-started`, `activeStepId = 'project-info'`
3. If draft restored: `useStepWizard()` restores step statuses from the draft's persisted step state array; `activeStepId` set to the last in-progress or first not-started step

### Clarification-Return Opening

When the controller flags items needing clarification and the requester returns to the form:
1. The request is in `NeedsClarification` state in `@hbc/provisioning`
2. The surface loads the existing `IProjectSetupRequest` values (from the submitted request, not the draft)
3. The surface loads the clarification annotations (from `IRequestClarification[]` on the request)
4. The wizard is initialized with:
   - All previously-completed steps restored as `complete`
   - Flagged steps (those containing clarification-annotated fields) opened to `in-progress`
   - `activeStepId` set to the first flagged step
   - Step `validationError` pre-populated with the clarification annotation text for the affected step
5. The draft key used is a clarification-specific key (`'project-setup-clarification-{requestId}'`) to avoid overwriting the original submission draft (T05 governs this key strategy)

**What "flagged" means for step identification:** The clarification annotations carry field-level identifiers (`fieldId`). The surface must map each annotated `fieldId` to its owning step using the step definition metadata (e.g., `projectName` → step `project-info`). A step is flagged if it contains one or more annotated fields.

**Critical rule:** The wizard must not present clarification return as a full restart. The UI should clearly indicate this is a revision of an existing submission, not a new request. The submit CTA on step 5 must read "Submit Clarification Response" (not "Submit Request") when in clarification-return mode.

---

## Boundaries: What the Wizard Owns and What It Does Not Own

### The Wizard Owns

- Step order and sequential progression
- Step-level completion state (`IStepRuntimeEntry.status`)
- Step-level validation (calling `validate()` and surfacing errors)
- Step-level progress display (percent complete, completed count)
- BIC assignee resolution per step (`resolveAssignee` — used when a step has an assigned owner other than the requester, e.g., if team assignment is collaborative)
- Draft persistence via `@hbc/session-state` (when `draftKey` is provided)
- The `onAllComplete` notification (fired once when all required steps are complete)

### The Wizard Does Not Own

- The provisioning lifecycle state (`IProjectSetupRequest.workflowStage`) — `@hbc/provisioning` owns this
- The API call to submit the request — the consuming surface orchestrates this after `onAllComplete`
- The notification events fired at submission or state transitions — T04 governs this, the backend fires notifications
- The rendering of step content — the consuming surface provides `renderStep` content for each `stepId`
- The draft key strategy — T05 defines all draft keys; the wizard receives `draftKey` as a prop
- The clarification annotation display within steps — `@hbc/field-annotations` governs this (where applicable); the consuming surface embeds annotations

### The Boundary in Practice

A G4 or G5 implementation agent must follow this model:

```typescript
// Surface component (Estimating app or PWA)
function ProjectSetupWizardPage() {
  const { request, mutate: updateRequest } = useProjectSetupRequest(requestId);
  const { savedDraft, saveDraft } = useDraft<IProjectSetupRequest>(draftKey);

  return (
    <HbcStepWizard
      item={request ?? savedDraft}
      config={PROJECT_SETUP_WIZARD_CONFIG}
      renderStep={(stepId, item) => <ProjectSetupStepContent stepId={stepId} item={item} onChange={updateAndSave} />}
    />
  );
}

// Surface orchestrates submission — NOT the wizard
function handleWizardComplete(completedRequest: IProjectSetupRequest) {
  await ProjectSetupApi.submit(completedRequest); // surface responsibility
  navigate(`/project-setup/${completedRequest.id}/status`); // surface responsibility
}
```

The `onAllComplete` callback in `PROJECT_SETUP_WIZARD_CONFIG` is where the surface wires this — not inside the wizard config definition itself, which should be stable and importable.

---

## Known Risks and Pitfalls

**R1 — Department-step-4 dependency complexity:** If a user completes step 4 with safety-pack selected, then returns to step 2 and changes department, step 4 must be reset. The `@hbc/step-wizard` `orderMode: 'sequential'` does not automatically handle this dependency-invalidation. The consuming surface must detect the change and call `reopenStep('template-addons')` explicitly.

**R2 — Wizard completion ≠ request submitted:** A common mistake is treating `onAllComplete` as the submission event. The wizard reports all steps complete; the surface must still call the submit API. If the API call fails after the wizard reports complete, the surface must handle the error (do not advance to status page; keep user on review step; show error).

**R3 — Clarification return with stale draft:** If a draft exists from an earlier interrupted session AND the request has since been submitted and reached `NeedsClarification`, the surface must not restore the old draft as the source of truth. The submitted request values take precedence. The draft key strategy in T05 must use different keys for new-request vs. clarification-return to avoid this collision.

**R4 — Step-wizard package maturity:** `@hbc/step-wizard` is validated as implemented and built. However, it is not currently listed as a P1 test package in ADR-0085. G4 implementation agents must confirm test coverage is adequate before releasing to pilot (T08 governs this).

---

## Required Outputs

| Artifact | Location | Description |
|----------|----------|-------------|
| Step-wizard config contract | `docs/reference/workflow-experience/setup-wizard-contract.md` | Full `IStepWizardConfig` specification with all step definitions, validation functions, and opening behavior rules |

The reference document must include:
- Complete step definition table (stepId, label, required, fields, validation rule, BIC assignee)
- Clarification-return opening behavior decision tree
- Boundary summary (wizard owns vs. does not own)
- Draft key reference (T05 governs keys; T01 reference doc points to T05 output)

---

## Acceptance Criteria

- [ ] `IStepWizardConfig<IProjectSetupRequest>` specification is complete with all five step definitions
- [ ] Each step's `validate()` function is specified with the exact fields checked and error messages
- [ ] Department-step-4 dependency is documented with explicit `reopenStep()` instruction for G4
- [ ] Clarification-return opening behavior is specified step-by-step
- [ ] Wizard ownership boundaries are explicitly stated
- [ ] Reference document exists at `docs/reference/workflow-experience/setup-wizard-contract.md`
- [ ] Reference document is added to `current-state-map.md §2`

---

*End of W0-G3-T01 — Guided Flow and Step-Wizard Integration v1.0*
