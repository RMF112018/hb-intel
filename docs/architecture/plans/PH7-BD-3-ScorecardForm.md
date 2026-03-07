# PH7-BD-3 — Business Development: Scorecard Form (BD Manager Entry)

**Version:** 1.0
**Governed by:** CLAUDE.md v1.2 · HB-Intel-Blueprint-V4.md · `hb-intel-foundation-plan.md`
**Date:** 2026-03-07
**Prerequisite:** PH7-BD-2 (Routes & Shell) complete and passing build.
**Purpose:** Implement the full Go/No-Go Scorecard entry form for BD Managers. This is the primary data-entry surface. Covers all header fields, BD Manager scoring columns (Originator scores), departmental sections, narrative fields, and the 5-step guided submission flow (Q55 = Option B).

---

## Prerequisite Checks

Before starting this task:

- [ ] `/bd/new` route exists and renders a placeholder page.
- [ ] `/bd/$scorecardId/edit` route exists and renders a placeholder page.
- [ ] All `IGoNoGoScorecard` interfaces are available from `@hbc/models`.
- [ ] `CRITERION_DEFINITIONS` array and `getCriterionValue()` utility are exported from `@hbc/models`.
- [ ] `HbcTextField`, `HbcSelect`, `HbcFormSection`, `HbcButton`, `HbcCard`, `HbcPeoplePicker` components are importable.

---

## Task 1 — Scorecard Form Architecture

The BD Manager scorecard form is a **multi-step wizard** with 5 steps (Q55 = guided 5-step form). Each step maps to a logical section of the Go/No-Go template:

| Step | Name | Template Section |
|---|---|---|
| 1 | Project Information | Header fields (rows 1–16) |
| 2 | Scoring — Part A | Criteria 1–10 (Originator column) |
| 3 | Scoring — Part B | Criteria 11–20 (Originator column) |
| 4 | Departmental Sections | Pre-submission dept. reviews (Q56 = A) |
| 5 | Review & Submit | Final narrative, strategic question, submit |

**Component tree:**

```
ScorecardFormWizard
├── WizardProgressBar          # Step indicators 1–5
├── Step1_ProjectInfo          # Header fields
├── Step2_ScoringPartA         # Criteria 1–10
├── Step3_ScoringPartB         # Criteria 11–20
├── Step4_DepartmentalSections # Dept sign-off before submission
└── Step5_ReviewAndSubmit      # Summary + strategic question + submit
```

**State management:** React Hook Form (`useForm`) with Zod validation schema. Form state is persisted to `sessionStorage` between steps (not yet saved to SharePoint until Step 5 final submit). Auto-save as Draft calls `POST /api/bd/scorecards` with `stage: 'Draft'` every 60 seconds if user has not submitted.

---

## Task 2 — Step 1: Project Information Fields

**Component:** `apps/pwa/src/components/bd/scorecard/Step1_ProjectInfo.tsx`

All fields map directly to `IGoNoGoScorecard` header section:

| Field Label | Interface Field | Input Type | Required |
|---|---|---|---|
| Lead Name / Project Name | `leadName` | Text | Yes |
| Client Name | `clientName` | Text | Yes |
| Project Address | `projectAddress` | Text | No |
| HBC Region | `hbcRegion` | Select (`HbcRegion` enum) | Yes |
| Project Sector | `projectSector` | Select (`ProjectSector` enum) | Yes |
| Delivery Method | `deliveryMethod` | Select (`DeliveryMethod` enum) | Yes |
| Estimated Construction Value | `estimatedConstructionValue` | Currency number | No |
| Estimated GC Fee | `estimatedGcFee` | Currency number | No |
| Bid Date | `bidDate` | Date picker | No |
| Lead Origin Department | `leadOriginDept` | Select (`LeadOriginDept` enum) | Yes |
| Lead Origin Contact | `leadOriginContact` | Text | No |
| BD Manager | `bdManagerId` | `HbcPeoplePicker` (single, BD Manager role) | Yes — auto-filled with current user |
| Director of Preconstruction | `directorOfPreconId` | `HbcPeoplePicker` (single) | Yes |
| Project Executive (if known) | `projectExecutiveId` | `HbcPeoplePicker` (single, optional) | No |
| Project Manager (if known) | `projectManagerId` | `HbcPeoplePicker` (single, optional) | No |
| Is this project in HBC's target markets? | `isTargetMarket` | Toggle (Yes/No) | No |

**Validation rules:**
- `leadName`: required, max 200 characters.
- `clientName`: required, max 200 characters.
- `hbcRegion`, `projectSector`, `deliveryMethod`, `leadOriginDept`: required selects.
- `bdManagerId`: auto-populated with current user's AAD object ID; read-only in form.
- `directorOfPreconId`: required — BD Manager must designate Director before proceeding.
- `estimatedConstructionValue` and `estimatedGcFee`: optional; if provided, must be positive numbers.

---

## Task 3 — Step 2 & 3: BD Manager Scoring (Originator Column)

**Components:**
- `apps/pwa/src/components/bd/scorecard/Step2_ScoringPartA.tsx` (criteria 1–10)
- `apps/pwa/src/components/bd/scorecard/Step3_ScoringPartB.tsx` (criteria 11–20)

### Scoring Input Design

Each criterion row renders as a `HbcFormSection` card containing:

```
┌─────────────────────────────────────────────────────────────┐
│ [#] Criterion Name                          Max: {highValue} │
│                                                              │
│ Score:  [High ({hv})] [Average ({av})] [Low ({lv})]          │
│         ○               ○               ○                    │
│                                                              │
│ Comment (optional): [___________________________________]    │
└─────────────────────────────────────────────────────────────┘
```

- Score choices are radio buttons showing the label AND point value: e.g., "High (6)", "Average (3)", "Low (0)".
- The selected score value is stored as `originatorScore` on `IGoNoGoScorecardCriterion`.
- `getCriterionValue(criterion, tier)` from `@hbc/models` is used to resolve the numeric value from the selected tier.
- Comment field maps to `originatorComment` on the criterion. Optional at entry time.
- Running subtotal displayed at bottom of each step: "Part A Score: {sum} / {maxPartA}" in real time.

### Criteria 1–10 (Step 2 — Part A):

```
1.  Relationship with Client
2.  Relationship with Design Team
3.  Project Type Experience
4.  Geographic Experience
5.  Project Size Experience
6.  Competition (Bidding Environment)
7.  Probability of Award
8.  HBC's Resource Capacity
9.  Owner's Financial Strength
10. Contract Type
```

### Criteria 11–20 (Step 3 — Part B):

```
11. Schedule Feasibility
12. Subcontractor Availability
13. Safety Risk
14. Design Completeness
15. Permitting Risk
16. Profitability Potential
17. Strategic Value
18. Client's Decision-Making Process
19. Project Complexity
20. HBC's Interest Level
```

**Running total display** at top of Steps 2 and 3 (sticky): "Total Score: {currentTotal} / 106"

---

## Task 4 — Step 4: Departmental Sections (Pre-Submission, Q56 = A)

**Component:** `apps/pwa/src/components/bd/scorecard/Step4_DepartmentalSections.tsx`

Per Q56 (Option A), departmental sections are completed **before** the scorecard is submitted to the Director. The BD Manager fills these out as part of the form prior to submission.

**Departments and their fields** (map to `IDepartmentalSectionEntry` in `IGoNoGoScorecard`):

| Department | Fields |
|---|---|
| Preconstruction | Notes, Concerns, Sign-off toggle |
| Operations | Notes, Concerns, Sign-off toggle |
| Safety | Notes, Concerns, Sign-off toggle |
| Finance | Notes, Concerns, Sign-off toggle |
| HR / Workforce | Notes, Concerns, Sign-off toggle |

Each department section is a collapsible `HbcFormSection` with:
- `departmentName`: read-only label
- `notes`: multi-line textarea
- `concerns`: multi-line textarea
- `completedByUserId`: auto-filled with current user; read-only
- `completedAt`: auto-filled on toggle; read-only
- `isComplete`: toggle — marks the section as reviewed

**Validation:** All 5 department sections must have `isComplete = true` before the form can be submitted in Step 5. A banner shows: "Complete all 5 departmental sections to proceed to submission."

---

## Task 5 — Step 5: Review & Submit

**Component:** `apps/pwa/src/components/bd/scorecard/Step5_ReviewAndSubmit.tsx`

### Summary Panel

Read-only summary of all entered data:
- Project info table (key fields from Step 1)
- Criteria score table: criterion name, selected tier, points, comment
- Subtotal Part A, Subtotal Part B, Total Score, Score Guide category (Focus / Pursue / Drop)
- Departmental section completion status

### Strategic Question (Q59 — Part C)

Per Q59, the strategic question is a **specific field** on the scorecard (not a decision state):

```
Field Label: "Is this a strategic pursuit or will a No Bid be detrimental?"

Response: [Dropdown]
  - Strategic Pursuit
  - Detrimental
  - Not Detrimental
```

Field: `strategicPursuitAnswer` → `StrategicPursuitAnswer` enum.
This field is required before submission.

### Comments to Director

```
Field Label: "Comments to Director of Preconstruction (optional)"
Field: `bdManagerSubmitComment` → multi-line textarea, max 2000 chars.
```

### Version Comment (for edits only)

When editing an existing scorecard (not initial creation), an additional required field appears:

```
Field Label: "Reason for this update (required)"
Field: `versionChangeComment` → text field, required, max 500 chars.
```

This comment is stored on the new `IVersionSnapshot` record (see PH7-BD-6 for versioning logic).

### Submit Button

`HbcButton` variant "primary": "Submit for Review"

On click:
1. Validate all steps (react-hook-form trigger on all fields).
2. If valid: call `POST /api/bd/scorecards` (new) or `PUT /api/bd/scorecards/{id}` (edit).
3. On success: navigate to `/bd/$scorecardId` (read view) with toast "Scorecard submitted for Director review."
4. On error: show inline error toast.

---

## Task 6 — Read-Only Scorecard View

**File:** `apps/pwa/src/routes/bd/$scorecardId/index.tsx`

The read-only view renders the full scorecard data as a structured display (not a form). Used by:
- BD Manager viewing their own submitted scorecard.
- Estimating Coordinator viewing accepted scorecards.
- Director/VP reviewing (before they use the review panel).
- Project Hub Preconstruction tab (cross-module read-only — see PH7-ProjectHub-4).

**Layout sections:**
1. Header: Lead name, client, stage badge, current version, last updated.
2. Project Information panel.
3. Score Summary panel: 20-criterion table with Originator column. Running totals.
4. Departmental Sections panel.
5. Strategic Question answer.
6. BD Manager comments.
7. Audit / Version History (collapsible — see PH7-BD-6).
8. Action bar (role-gated buttons: Edit, Start Review, Schedule Meeting, etc.).

---

## Task 7 — Auto-Save Draft Logic

**Hook:** `apps/pwa/src/hooks/useScorecardAutosave.ts`

```typescript
// Calls PATCH /api/bd/scorecards/{id} with stage: 'Draft' every 60s
// Triggered by form value changes (debounced 60s)
// Shows "Draft saved {time}" indicator in wizard header
// Disabled when stage !== 'Draft'
```

---

## Task 8 — Verification

```bash
pnpm turbo run build
pnpm turbo run type-check

# Manual verification:
# 1. Navigate to /bd/new as BD Manager — 5-step wizard renders
# 2. Complete Step 1 — all validation rules enforced
# 3. Complete Steps 2 & 3 — score selections update running total correctly
# 4. Complete Step 4 — all 5 dept sections required before Step 5
# 5. Step 5 — strategic question required; submit sends POST to API
# 6. Navigate to /bd/$scorecardId — read-only view renders all sections
# 7. Edit existing scorecard — versionChangeComment field appears in Step 5
```

---

## Success Criteria

- [ ] BD-3.1 5-step wizard form renders for `/bd/new` and `/bd/$scorecardId/edit`.
- [ ] BD-3.2 Step 1 validates all required header fields before advancing.
- [ ] BD-3.3 Steps 2 & 3 render all 20 criteria with High/Average/Low radio buttons and correct point values from `CRITERION_DEFINITIONS`.
- [ ] BD-3.4 Running total updates in real time as scores are selected.
- [ ] BD-3.5 Step 4 requires all 5 departmental sections to be marked complete.
- [ ] BD-3.6 Step 5 requires `strategicPursuitAnswer` before submit.
- [ ] BD-3.7 Edit mode requires `versionChangeComment` before submit.
- [ ] BD-3.8 `getCriterionValue()` utility correctly resolves point values from tier selections.
- [ ] BD-3.9 Auto-save fires every 60s and shows "Draft saved" indicator.
- [ ] BD-3.10 Read-only scorecard view renders all sections correctly for each authorized role.
- [ ] BD-3.11 Build passes with zero TypeScript errors.

<!-- IMPLEMENTATION PROGRESS & NOTES
Plan created: 2026-03-07
Status: Ready for implementation
Prerequisite: PH7-BD-2 complete
-->
