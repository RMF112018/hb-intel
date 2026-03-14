> **Doc Classification:** Canonical Normative Plan — Reference quadrant (Diátaxis); defines the clarification re-entry contract for the project setup guided wizard flow.

# Clarification Re-Entry Specification

**Produced by:** W0-G3-T03 — Clarification Loop and Return-to-Flow Behavior
**Depends on:** T01 (step-wizard config, field-to-step mapping), T02 (BIC ownership during clarification)
**Governs:** Step-wizard re-entry in `clarification-return` mode, data preservation, resubmission flow

---

## Field-to-Step Mapping

All `IProjectSetupRequest` fields collected by the wizard are mapped to their owning step via `PROJECT_SETUP_FIELD_MAP` (defined in T01).

| fieldId | stepId | Step Name |
|---------|--------|-----------|
| `projectName` | `project-info` | Project Information |
| `projectLocation` | `project-info` | Project Information |
| `estimatedValue` | `project-info` | Project Information |
| `clientName` | `project-info` | Project Information |
| `startDate` | `project-info` | Project Information |
| `department` | `department` | Department & Type |
| `projectType` | `department` | Department & Type |
| `projectStage` | `department` | Department & Type |
| `contractType` | `department` | Department & Type |
| `projectLeadId` | `project-team` | Project Team |
| `groupMembers` | `project-team` | Project Team |
| `viewerUPNs` | `project-team` | Project Team |
| `addOns` | `template-addons` | Template & Add-Ons |

---

## Wizard Initialization Rules for Clarification-Return Mode

When a requester clicks "Respond to Clarification," the step wizard opens following these rules:

### Step 1 — Load Existing Request Data

Load the `IProjectSetupRequest` from the API (the submitted/current version). This is the authoritative source — the values the controller reviewed and annotated. Extract `clarificationItems` from the request.

### Step 2 — Identify Flagged Steps

Extract all unique `stepId` values from open clarifications (status === 'open'). Use `buildClarificationReturnState()` which returns:
- `flaggedStepIds` — steps with open clarifications
- `completedStepIds` — steps without open clarifications
- `activeStepId` — first flagged step in wizard order
- `openClarifications` — filtered open items

### Step 3 — Initialize Wizard with Flagged State

- Steps NOT in `flaggedStepIds`: status = `complete`
- Steps IN `flaggedStepIds`: status = `in-progress`
- `activeStepId`: first step in wizard sequential order that appears in `flaggedStepIds`
- If no open clarifications exist, all steps are complete, `activeStepId` is null

### Step 4 — Display Clarification Annotations

For each flagged step, visibly mark the fields with open clarification annotations. Display the controller's `message` prominently adjacent to the field input. Integration with `@hbc/field-annotations` is recommended (G4/G5 scope).

### Step 5 — Draft Key for Clarification-Return

- Initial submission: `'project-setup-form-draft'`
- Clarification-return: `'project-setup-clarification-{requestId}'` (built via `buildClarificationDraftKey()`)
- TTL: 168 hours (7 days) per `CLARIFICATION_DRAFT_TTL_HOURS`
- Distinct key prevents initial draft from being overwritten during clarification response

### Step 6 — Requester Updates Fields

The requester may update any field — flagged or unflagged. No step is locked. Changes auto-save to the clarification-return draft key (T05 governs auto-save).

### Step 7 — Mark Clarifications as Responded

Requester marks individual clarifications as responded (with optional note) either inline or via summary panel in Step 5. Marking does NOT submit — it is preparatory.

### Step 8 — Resubmission

On "Submit Clarification Response" in Step 5:
1. Validate all flagged steps (same rules as initial submission)
2. Call API with payload from `buildClarificationResponsePayload()`
3. Backend merges updated fields, marks items responded, transitions state, fires notification, transfers BIC
4. Surface navigates to request status view

---

## Data Preservation Contract

### Preserved

All previously-entered values on the `IProjectSetupRequest`. The requester must not be asked to re-enter any field. Preserved values come from the server-stored request, not from draft.

### Cleared on Successful Submission

- Clarification-return draft key (`project-setup-clarification-{requestId}`)
- Initial submission draft key (`project-setup-form-draft`) if still present

### Retained (Never Cleared)

`IRequestClarification[]` history — retained as part of audit trail for history panel (T06).

---

## Draft Key Strategy

| Context | Key | TTL | Purpose |
|---------|-----|-----|---------|
| Initial submission | `project-setup-form-draft` | 24h (T05) | New request form auto-save |
| Clarification return | `project-setup-clarification-{requestId}` | 168h (7 days) | Clarification response in-progress auto-save |

The clarification draft key uses `{requestId}` as discriminator. If a second clarification round begins after the first is cleared, a fresh draft is created.

---

## Resubmission Flow

```
Requester clicks "Submit Clarification Response"
         │
         ▼
Validate flagged steps (same validation as initial)
         │
         ▼
API: submitClarificationResponse(requestId, updatedFields, responses[])
         │
         ▼
Backend: merge fields → mark items responded → transition state → fire notification → BIC transfer
         │
         ▼
Surface: navigate to request status view
```

---

## Controller Visibility After Resubmission

The controller resume view must show:
1. Request back in `Submitted` (or `UnderReview`) state with BIC transferred
2. Diff of changed fields since previous review
3. Clarification annotations shown as `responded` with requester notes
4. Actions: approve → `ReadyToProvision`, flag more → `NeedsClarification`, or escalate

---

## Edge Cases

**Partial response + abandon:** Draft persisted with 7-day TTL. If requester returns before expiry, draft restores. If TTL expires, surface reloads from server values.

**Second clarification round:** Each round independently tracked in `IRequestClarification[]` history. New draft created for new round.

**Controller retracts annotation:** Surface must reload latest annotations on open. Must not display stale annotations from prior load.

---

*End of Clarification Re-Entry Specification — W0-G3-T03*
