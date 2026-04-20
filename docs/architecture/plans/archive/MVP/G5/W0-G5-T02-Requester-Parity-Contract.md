# W0-G5-T02 — Requester Parity Contract

> **Doc Classification:** Canonical Contract Artifact — Wave 0 Group 5
> **Task plan:** `docs/architecture/plans/MVP/G5/W0-G5-T02-Requester-Parity-Contract-and-Lighter-Presentation-Rules.md`
> **Governing plan:** `docs/architecture/plans/MVP/G5/W0-G5-Hosted-PWA-Requester-Surfaces-Plan.md`
> **Locked decisions served:** LD-01, LD-02, LD-06

**Version:** 1.0
**Date:** 2026-03-15
**Status:** Locked
**Derivation source:** Live G4 code inspection — `packages/features/estimating/src/project-setup/`, `packages/provisioning/src/`, `packages/models/src/provisioning/`, `apps/estimating/src/`

---

## Purpose

This document defines the locked parity contract between the SPFx requester experience (Group 4) and the hosted PWA requester experience (Group 5). It specifies:

1. Which workflow elements must be semantically identical across surfaces
2. Which presentation details may differ in the PWA
3. Which requester actions must produce identical outcomes
4. The step structure and validation rules the PWA must honor
5. The draft payload type shape both surfaces share

This contract governs implementation in T01, T03, T04, T05, and T06. It does not implement UI.

---

## 1. Workflow Lifecycle States — Identical Across Surfaces

The hosted PWA must represent all of the following states with the same lifecycle meaning as the SPFx surface. Visual treatment may differ; the meaning may not.

| State | Display Label | Badge Variant | Meaning | PWA Required? |
|-------|---------------|---------------|---------|---------------|
| (local draft) | — | — | Request initiated but not yet submitted; persisted locally via `@hbc/session-state` | Yes — save/resume context |
| `Submitted` | Submitted | `pending` | Requester has completed required inputs and submitted | Yes — terminal requester action |
| `UnderReview` | Under Review | `inProgress` | Controller is reviewing the request | Yes — status visibility |
| `NeedsClarification` | Clarification Needed | `warning` | Controller raised questions; requester action required | Yes — clarification-return context |
| `AwaitingExternalSetup` | Awaiting External Setup | `pending` | External IT/security prerequisites are in progress | Yes — status visibility |
| `ReadyToProvision` | Queued for Provisioning | `pending` | Request approved; queued for provisioning saga | Yes — status visibility |
| `Provisioning` | Provisioning | `inProgress` | Backend provisioning saga is in progress | Yes — status + live updates |
| `Completed` | Completed | `completed` | Site provisioned and accessible | Yes — completion summary + handoff |
| `Failed` | Failed | `error` | Provisioning failed after retries; admin notified | Yes — failure state display |

**Source:** `packages/provisioning/src/summary-field-registry.ts` — `PROJECT_SETUP_STATUS_LABELS`, `STATE_BADGE_VARIANTS`

**State transitions (reference):** `packages/provisioning/src/state-machine.ts` — `STATE_TRANSITIONS`, `isValidTransition()`

---

## 2. Required Requester Actions — Identical Outcomes Across Surfaces

These actions must produce identical backend outcomes regardless of whether the requester takes them in SPFx or the hosted PWA.

| Action | Trigger | Backend Outcome | Must Be Identical? |
|--------|---------|-----------------|---------------------|
| Start new request | Requester navigates to `/project-setup` | Creates local draft via `@hbc/session-state`; no backend call yet | Yes (semantics) |
| Resume draft | Page load detects existing draft in IndexedDB | Restores saved field values into wizard state | Yes |
| Discard draft | Requester confirms "Start New" over existing draft | Clears IndexedDB draft entry | Yes |
| Complete a step | Requester fills required fields and advances | Step status transitions to `complete`; validation runs as hard gate | Yes |
| Save draft | Auto-save on field change (800ms debounce) | Draft persisted to IndexedDB via `useDraft` / `useAutoSaveDraft` | Yes (semantics); mechanism identical |
| Submit request | Requester completes review step and clicks Submit | `POST /api/project-setup-requests`; state → `Submitted`; draft cleared on API success only (IR-01) | Yes |
| View request status | Requester navigates to `/projects` | `GET /api/project-setup-requests?submitterId=…` — RBAC-filtered by submitter identity | Yes (data); presentation may differ |
| Respond to clarification | Requester returns to wizard in clarification-return mode | Updated fields + clarification responses submitted; state → `UnderReview` | Yes |
| View completion | Requester opens completed request detail | Shows completion summary with Project Hub handoff CTA | Yes (data); presentation may differ |
| Open Project Hub | Requester clicks handoff CTA | Opens `siteUrl` (from `resolveProjectHubUrl()`) in new window | Yes |

---

## 3. Step Structure — Must Be Identical

The PWA must use the same step IDs, labels, order, required/optional designation, field assignments, and validation rules as the SPFx surface. No steps may be added, removed, or reordered.

**Source:** `packages/features/estimating/src/project-setup/config/projectSetupSteps.ts`

| Order | stepId | Label | Required | Fields | Validation Rules |
|-------|--------|-------|----------|--------|------------------|
| 1 | `project-info` | Project Information | Yes | `projectName` (required), `projectLocation` (required), `estimatedValue` (optional), `clientName` (optional), `startDate` (optional) | `projectName` and `projectLocation` must be non-empty trimmed strings. `estimatedValue` must be ≥ 0 if provided. |
| 2 | `department` | Department & Type | Yes | `department` (required), `projectType` (required), `projectStage` (optional), `contractType` (optional) | `department` must be one of `'commercial'` or `'luxury-residential'`. `projectType` must be non-empty. |
| 3 | `project-team` | Project Team | Yes | `projectLeadId` (required), `groupMembers` (optional), `viewerUPNs` (optional) | `projectLeadId` must be non-empty. |
| 4 | `template-addons` | Template & Add-Ons | No | `addOns` (optional, filtered by selected `department`) | Always passes (no required fields). |
| 5 | `review-submit` | Review & Submit | Yes | All fields (read-only summary) | Cross-step validation: `projectName`, `projectLocation`, `department`, `projectType`, and `projectLeadId` must all be present. |

### Wizard Config Constants

| Setting | Value | Source |
|---------|-------|--------|
| `orderMode` | `'sequential'` | Steps unlock linearly |
| `allowReopen` | `true` | Needed for clarification-return re-entry |
| `allowForceComplete` | `false` | Cannot skip required validation |
| `draftKey` | `'project-setup-form-draft'` | `PROJECT_SETUP_DRAFT_KEY` from `@hbc/features-estimating` |

**Canonical config:** `packages/features/estimating/src/project-setup/config/projectSetupWizardConfig.ts`
**Step type IDs:** `packages/features/estimating/src/project-setup/types/IProjectSetupWizard.ts` — `ProjectSetupStepId`

---

## 4. Presentation Elements — May Be Lighter in PWA

The following presentation choices may be different in the hosted PWA. "Lighter" means simpler, more focused, or with fewer decorative elements — it does not mean less informative.

| Element | SPFx Behavior | PWA Permissible Variation |
|---------|---------------|--------------------------|
| Navigation chrome | SharePoint ribbon and navigation | PWA app shell nav — simpler, no ribbon |
| Step progress indicator | Vertical sidebar (`WizardSidebar`) with step icons, labels, status badges | Horizontal progress dots acceptable if step count and current position are clear |
| Step transition animation | CSS fade between step bodies | Reduced or no animation acceptable |
| Secondary action affordances | Full action bar in step footer | Inline or bottom-sheet action menu acceptable on mobile |
| Help / guidance text | `HbcCoachingCallout` shown at Essential complexity tier | Same coaching callout or contextual tooltip acceptable |
| People picker | `HbcPeoplePicker` with Graph API integration (single + multi-select) | UPN text input acceptable initially; people picker upgrade in later wave |
| Branding / header | SharePoint-context header with site title | PWA-context `WorkspacePageShell` header (lighter treatment) |

---

## 5. Presentation Elements — Must Remain Identical

| Element | Rule |
|---------|------|
| Step sequence, IDs, and labels | Same 5 steps, same `stepId` values, same labels, same order — no steps added, removed, or reordered in the PWA |
| Required vs. optional field designation | A field that is required in SPFx is required in PWA. Marking a required field optional in the PWA would break the workflow contract. |
| Validation rules | Step validation logic must be identical — the same inputs that pass in SPFx must pass in PWA; the same inputs that fail must fail |
| Error and validation message meaning | The semantic meaning of validation errors must be the same; the exact wording may differ for the PWA context |
| Clarification-state display | When the workflow is in `NeedsClarification`, the requester must be shown the clarification request prominently with clarification items visible in both surfaces |
| Blocked step behavior | A blocked step in the SPFx Step Wizard must also be presented as blocked in the PWA Step Wizard |
| Badge variants per state | Same `STATE_BADGE_VARIANTS` mapping from `@hbc/provisioning` |
| Status labels | Same `PROJECT_SETUP_STATUS_LABELS` from `@hbc/provisioning` |

---

## 6. Draft Payload Type

The draft payload persisted by `@hbc/session-state` for new-request wizard sessions uses the `ISetupFormDraft` shape defined in `@hbc/features-estimating`:

```typescript
/** Draft shape for new-request wizard sessions. */
interface ISetupFormDraft {
  /** Request field values at time of draft save. */
  fields: Partial<IProjectSetupRequest>;
  /** Step progression state: stepId → StepStatus. */
  stepStatuses: Record<string, StepStatus>;
  /** ISO 8601 timestamp of last draft save. */
  lastSavedAt: string;
}
```

**Source:** `packages/features/estimating/src/project-setup/types/IProjectSetupWizard.ts`

### Draft Key Strategy

| Mode | Draft Key | TTL |
|------|-----------|-----|
| New request | `'project-setup-form-draft'` (`PROJECT_SETUP_DRAFT_KEY`) | 48 hours |
| Clarification-return | `'project-setup-clarification-{requestId}'` (`buildClarificationDraftKey()`) | 168 hours (7 days) |

### Clarification-Return Draft Shape

```typescript
/** Draft shape for clarification-return wizard sessions. */
interface IClarificationDraft {
  requestId: string;
  fieldChanges: Partial<IProjectSetupRequest>;
  stepStatuses: Record<string, StepStatus>;
  clarificationResponses: Record<string, string>;
  lastSavedAt: string;
}
```

### Compatibility

- Both draft shapes are compatible with `IDraftEntry` from `@hbc/session-state` (stored as `value: unknown` in IndexedDB)
- Step-wizard's internal `IStepWizardDraft` tracks step progression separately via `useDraftStore(draftKey)` — the feature-layer draft composes on top
- Draft is cleared only on API submission success (IR-01), never in `onAllComplete`

---

## 7. Clarification-Return Parity

When a requester returns from a `NeedsClarification` state, the PWA must replicate the SPFx clarification-return behavior:

1. **Restore all previously entered data** — no fields cleared on re-entry
2. **Open wizard at the first flagged step** — the step containing the first open clarification item
3. **Mark each flagged step visually** — warning badge in step progress indicator
4. **Show clarification context** — banner or callout at the top of each flagged step body explaining what was flagged
5. **Non-flagged steps retain saved state** — requester does not re-enter non-flagged steps
6. **Review step shows resubmission context** — "Resubmitting with corrections from reviewer feedback"
7. **On successful resubmission** — clear clarification draft key; state → `UnderReview`

**Types governing clarification-return:**
- `IClarificationReturnState` — `packages/features/estimating/src/project-setup/types/IProjectSetupWizard.ts`
- `IRequestClarification` — `packages/models/src/provisioning/IRequestClarification.ts`
- `buildClarificationReturnState()` — `packages/features/estimating/src/project-setup/config/clarificationReturn.ts`

---

## 8. Integration Rules (From `@hbc/provisioning`)

The following integration rules from `packages/provisioning/src/integration-rules.ts` apply to PWA implementation:

| Rule | Constraint |
|------|-----------|
| IR-01 | Draft cleared only on API success — wizard must NOT clear draft in `onAllComplete` |
| IR-03 | No per-step BIC transfer in setup wizard — setup form owned entirely by requester |
| IR-06 | `ComplexityProvider` mounted at app root, not per-route — gate fields individually |
| IR-07 | Offline notification actions queued via session-state; replay on reconnect |

---

## 9. T01 Alignment Corrections

The T01 implementation (`apps/pwa/src/routes/project-setup/`) was built before this parity contract was locked. The following corrections are required to bring T01 into alignment:

### 9.1 Step ID Corrections

| Current (T01) | Required (G4 canonical) |
|----------------|------------------------|
| `details` | `project-info` |
| `contract` | `department` |
| `team` | `project-team` |
| `addons` | `template-addons` |
| `review` | `review-submit` |

### 9.2 Step Label Corrections

| Current (T01) | Required (G4 canonical) |
|----------------|------------------------|
| Project Details | Project Information |
| Contract Info | Department & Type |
| Team Assignment | Project Team |
| Add-Ons | Template & Add-Ons |
| Review & Submit | Review & Submit |

### 9.3 Field-to-Step Restructuring

- **Step 1 (project-info):** Remove `projectType`, `projectStage`, `department` from step 1. Keep `projectName`, `projectLocation`, `estimatedValue`, `clientName`, `startDate`.
- **Step 2 (department):** Add `department`, `projectType`, `projectStage`. Keep `contractType` but mark it optional (not required).
- **Step 3 (project-team):** Remove `groupMembers` as required. Keep `projectLeadId` as the only required field.

### 9.4 Validation Rule Corrections

- **Step 1:** Remove projectType, projectStage, department validation. Add `estimatedValue >= 0` check.
- **Step 2:** Require department (with domain check) and projectType. Remove contractType as required.
- **Step 3:** Require only projectLeadId. Remove groupMembers length check.
- **Step 5 (review-submit):** Add cross-step validation checking name, location, department, type, and lead. Set `required: true`.

### 9.5 Config-Level Corrections

- Set `allowForceComplete: false` explicitly
- Set `draftKey: PROJECT_SETUP_DRAFT_KEY` (import from `@hbc/features-estimating`)
- Consider importing `PROJECT_SETUP_STEPS` from `@hbc/features-estimating` directly instead of maintaining inline step definitions

### 9.6 Step Component File Renames

| Current File | Should Become |
|-------------|---------------|
| `steps/ProjectDetailsStep.tsx` | `steps/ProjectInfoStep.tsx` |
| `steps/ContractInfoStep.tsx` | `steps/DepartmentStep.tsx` |
| `steps/TeamAssignmentStep.tsx` | `steps/TeamStep.tsx` |
| `steps/AddOnsStep.tsx` | `steps/TemplateAddOnsStep.tsx` |
| `steps/ReviewStep.tsx` | `steps/ReviewSubmitStep.tsx` |

---

## Governance

- This contract is a living document during Wave 0 but must be locked before T03, T04, and T05 close.
- Changes to this contract require explicit product owner or architecture owner approval.
- The contract does not govern controller, admin, or coordinator surfaces — only the requester experience.
- If any G4 implementation changes after this contract is locked, the contract must be reviewed and updated before the PWA implementation may diverge.
