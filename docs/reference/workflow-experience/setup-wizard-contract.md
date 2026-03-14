# Project Setup Step-Wizard Contract

> **Doc Classification:** Canonical Normative Plan — defines the integration contract between `@hbc/step-wizard` and the project setup intake form.

**Source Task:** W0-G3-T01 — Guided Flow and Step-Wizard Integration
**Package:** `@hbc/features-estimating` → `src/project-setup/`
**Consumers:** G4 Estimating requester surface, PWA setup page

---

## Step Definition Table

| Step | stepId | Label | Required | Order | Fields Collected | Validation Rule |
|------|--------|-------|----------|-------|-----------------|-----------------|
| 1 | `project-info` | Project Information | Yes | 1 | `projectName` (req), `projectLocation` (req), `estimatedValue`, `clientName`, `startDate` | Name and location must be non-empty; estimatedValue ≥ 0 if provided |
| 2 | `department` | Department & Type | Yes | 2 | `department` (req), `projectType` (req), `projectStage`, `contractType` | Department must be `commercial` or `luxury-residential`; projectType non-empty |
| 3 | `project-team` | Project Team | Yes | 3 | `projectLeadId` (req), `groupMembers`, `viewerUPNs` | projectLeadId must be set |
| 4 | `template-addons` | Template & Add-Ons | No | 4 | `addOns` | No blocking validation — defaults acceptable |
| 5 | `review-submit` | Review & Submit | Yes | 5 | (read-only summary) | Cross-step gate: re-validates projectName, projectLocation, department, projectType, projectLeadId |

---

## Wizard Configuration

| Property | Value | Rationale |
|----------|-------|-----------|
| `title` | `'New Project Setup'` | — |
| `orderMode` | `'sequential'` | Steps depend on prior data (department → add-ons) |
| `allowForceComplete` | `false` | Required fields must be validated |
| `allowReopen` | `true` | Department change in Step 2 must reset Step 4 (R1) |
| `draftKey` | `'project-setup-form-draft'` | Static key; T05 governs full strategy |
| `onAllComplete` | Not set in static config | Consuming surface provides at runtime |

---

## Field-to-Step Mapping

Used by T03 clarification-return flow to identify which steps contain annotated fields.

| Field | Step |
|-------|------|
| `projectName` | `project-info` |
| `projectLocation` | `project-info` |
| `estimatedValue` | `project-info` |
| `clientName` | `project-info` |
| `startDate` | `project-info` |
| `department` | `department` |
| `projectType` | `department` |
| `projectStage` | `department` |
| `contractType` | `department` |
| `projectLeadId` | `project-team` |
| `groupMembers` | `project-team` |
| `viewerUPNs` | `project-team` |
| `addOns` | `template-addons` |

`resolveStepsForClarification(fieldIds)` returns the unique set of owning steps in wizard sequential order.

---

## Draft Key Strategy

| Mode | Draft Key | Source |
|------|-----------|--------|
| New request | `'project-setup-form-draft'` | Static constant |
| Clarification return | `'project-setup-clarification-{requestId}'` | Built via `buildClarificationDraftKey(requestId)` |

T05 governs the full draft persistence strategy. These constants define the key shapes consumed by the wizard.

---

## Clarification-Return Behavior

When a request is in `NeedsClarification` state:

1. Load the submitted `IProjectSetupRequest` (not the original draft)
2. Load clarification annotations (`IRequestClarification[]`)
3. Map annotated `fieldId` values to steps via `resolveStepsForClarification()`
4. Initialize wizard with previously-completed steps as `complete`, flagged steps as `in-progress`
5. Set `activeStepId` to the first flagged step
6. Use clarification-specific draft key to avoid overwriting original submission
7. Submit CTA reads "Submit Clarification Response" (not "Submit Request")

---

## Wizard Ownership Boundary

### The wizard owns

- Step order and sequential progression
- Step-level completion state (`IStepRuntimeEntry.status`)
- Step-level validation (calling `validate()` and surfacing errors)
- Step-level progress display (percent complete, completed count)
- Draft persistence via `@hbc/session-state` (when `draftKey` is provided)
- The `onAllComplete` notification (fired once when all required steps complete)

### The wizard does NOT own

- Provisioning lifecycle state (`IProjectSetupRequest.state`) — `@hbc/provisioning` owns this
- API submission — consuming surface orchestrates after `onAllComplete`
- Notification events at step transitions — T04 scope
- Step content rendering — consuming surface provides `renderStep` for each `stepId`
- Draft key strategy details — T05 scope
- Clarification annotation display — `@hbc/field-annotations` scope

---

## Add-On Definitions (Wave 0)

| Slug | Label | Departments |
|------|-------|-------------|
| `safety-pack` | Safety Pack | `commercial` only |
| `closeout-pack` | Closeout Pack | `commercial`, `luxury-residential` |

`getAddOnsForDepartment(department)` filters the registry by the selected department. If department is undefined, all add-ons are returned.

---

## Deviation Notes

- **`location` vs. `projectLocation`:** The G3-T01 spec references `location` in Step 1 validation. The `IProjectSetupRequest` model uses `projectLocation`. Validation uses the model field name.
- **`onAllComplete` not in static config:** The spec shows `onAllComplete` as a comment in the config. The implementation leaves it `undefined` in the static config — the consuming surface sets it at runtime to avoid coupling the config to API submission logic.

---

## Known Risks

| Risk | Description | Mitigation |
|------|-------------|------------|
| R1 | Department change after Step 4 completion invalidates add-on selections | `allowReopen: true`; surface must call `reopenStep('template-addons')` on department change |
| R2 | `onAllComplete` confused with submission | Wizard reports completion; surface calls submit API separately |
| R3 | Stale draft vs. clarification return collision | Separate draft keys for new-request and clarification-return modes |
| R4 | `@hbc/step-wizard` not in P1 test package list | G4 must confirm coverage before pilot release (T08 governs) |

---

*End of setup-wizard-contract.md — W0-G3-T01*
