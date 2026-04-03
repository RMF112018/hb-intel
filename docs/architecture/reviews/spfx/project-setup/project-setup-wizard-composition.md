# Project Setup Wizard — Composition Polish

> **Date**: 2026-03-30
> **Scope**: Recompose all 5 wizard step bodies for stronger hierarchy, grouping, and maturity
> **Surface**: `apps/estimating/src/components/project-setup/` step bodies

---

## 1. What Changed

### Step 1 — ProjectInfoStepBody

**Before**: Single flat `HbcFormSection` with all 10 fields in a vertical list. "Project Location" as a heading3 label inside a bare `<div>`.

**After**: Three logical `HbcFormSection` groups with description props:
- **Project Identity** — name and client (2 fields)
- **Project Location** — address fields with responsive 2-column grid for city/state and county/zip pairs (Griffel `@media (min-width: 480px)` breakpoint)
- **Project Details** — estimated value and start date in 2-column grid, Procore flag

Renamed "Zip" → "Zip Code", "Expected Project Start Date" → "Expected Start Date" for brevity.

### Step 2 — DepartmentStepBody

**Before**: Single flat `HbcFormSection` with 5 selects in a list.

**After**: Two logical `HbcFormSection` groups:
- **Project Stage & Division** — organizational routing context (stage, office division)
- **Department & Project Classification** — the core cascading classification (department → project type → contract type)

Each section has a `description` prop explaining its purpose. Improved the disabled projectType placeholder from "Select a department first" to "Choose a department above to see project types" for clearer guidance.

### Step 3 — TeamStepBody

**Before**: Single flat `HbcFormSection` with 5 people pickers + 1 select.

**After**: Three role-grouped `HbcFormSection` groups:
- **Project Leadership** ("Key decision-makers responsible for the project") — executive, PM
- **Estimating Team** ("Estimators assigned to produce the project estimate") — lead, supporting
- **Additional Members & Approvals** — additional team, Timberscan approver

Changed the disabled-approver guidance from "Timberscan Approver options appear after at least one upstream team member is added" to "Eligible approvers are drawn from the team members assigned above" — more concise, describes the mechanism rather than the gate.

### Step 4 — TemplateAddOnsStepBody

**Before**: Single `HbcFormSection` with a plain `<p>` tag for missing-department state and em-dash-concatenated checkbox labels.

**After**: Three distinct states with intentional presentation:
- **No department**: `HbcEmptyState` with "Department Required" title and actionable guidance
- **Department selected, no add-ons**: `HbcEmptyState` with "No Add-Ons Available" and department-specific messaging
- **Add-ons available**: Department context in section description, checkbox labels with description as secondary muted text below (instead of concatenated with em-dash)

### Step 5 — ReviewStepBody

**Before**: 4 `HbcCard` sections using ad-hoc `<p><strong>Label:</strong> value</p>` markup for every field.

**After**: Same 4 card structure but using `HbcDescriptionList` (dense mode) inside each card. This replaces ~30 lines of manual `<p>` markup with governed `<dl>`/`<dt>`/`<dd>` semantics and consistent label/value layout.

## 2. Shared-Kit Enhancements

None required. `HbcFormSection` (with `description` prop), `HbcDescriptionList`, `HbcEmptyState`, and the responsive Griffel grid pattern were all sufficient. The improvements are purely composition-level.

## 3. Files Changed

| File | Change |
|------|--------|
| `apps/estimating/src/components/project-setup/ProjectInfoStepBody.tsx` | Three grouped sections, responsive 2-col grid |
| `apps/estimating/src/components/project-setup/DepartmentStepBody.tsx` | Two grouped sections with descriptions |
| `apps/estimating/src/components/project-setup/TeamStepBody.tsx` | Three role-grouped sections with descriptions |
| `apps/estimating/src/components/project-setup/TemplateAddOnsStepBody.tsx` | Three-state presentation with HbcEmptyState |
| `apps/estimating/src/components/project-setup/ReviewStepBody.tsx` | HbcDescriptionList inside cards |
| `apps/estimating/src/test/ProjectInfoStepBody.test.tsx` | Updated for section headings and field name changes |
| `apps/estimating/src/test/ReviewStepBody.test.tsx` | Updated for HbcDescriptionList DOM structure |
| `apps/estimating/src/test/TeamStepBody.test.tsx` | Updated guidance text assertion |
| `apps/estimating/package.json` | Version bump 0.2.2 → 0.2.3 |

## 4. Verification

| Check | Result |
|-------|--------|
| Build | Pass (1,184.99 KB, gzip 338.00 KB) |
| Lint | 0 errors (61 pre-existing warnings) |
| Tests | 107/107 pass + 2 todo (16 files) |

## 5. Risks / Follow-Ups

- **RequestDetailPage**: Not yet recomposed — should match the wizard's quality bar
- **Draft resume behavior**: Unchanged — verified by existing tests
- **Validation logic**: Unchanged — step-wizard validation fires on blur/Next as before
- **Responsive grid**: The 2-column layout in ProjectInfo breaks to 1-column below 480px — verify on narrow Teams Personal App viewport
