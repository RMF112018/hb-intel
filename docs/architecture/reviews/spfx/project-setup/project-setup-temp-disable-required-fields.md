# Project Setup — Temporary Required-Fields Deactivation

> **Date**: 2026-03-30
> **Scope**: Temporarily disable all required-field enforcement in the Project Setup wizard
> **Reversibility**: Set `PROJECT_SETUP_REQUIRED_FIELDS_ENABLED = true` in `projectSetupSteps.ts`

---

## 1. Purpose

Temporarily deactivate all required-field behavior for the current Project Setup Requests flow. No validation code, schema definitions, or business rules were deleted. The deactivation is controlled by a single boolean constant that can be flipped back to `true` to restore full enforcement.

## 2. Control Point

```typescript
// packages/features/estimating/src/project-setup/config/projectSetupSteps.ts
export const PROJECT_SETUP_REQUIRED_FIELDS_ENABLED = false;
```

## 3. What Was Deactivated

### Layer 1: Step validation functions

Each step's `validate()` function wraps required-field checks in `if (PROJECT_SETUP_REQUIRED_FIELDS_ENABLED)`. Format validation (positive numbers, valid department-type combos, eligible approvers) remains active even when the flag is `false`.

| Step | Required checks guarded | Format checks preserved |
|------|------------------------|------------------------|
| Step 1 (Project Info) | 6 fields: name, street, city, county, state, zip | Estimated value ≥ 0 |
| Step 2 (Department) | 2 fields: department, projectType | Valid department enum, valid type-for-department |
| Step 3 (Team) | 3 fields: executive, lead estimator, approver | Approver must be from team (when present) |
| Step 5 (Review) | 11 cross-step checks (all of above) | Same format checks |

### Layer 2: Step `required` flags — NOT changed

Step `required: true` flags are **preserved** because they control wizard navigation flow (whether the user must visit the step), not field-level validation. Setting steps to `required: false` causes the wizard to treat them as skippable and auto-complete, bypassing the user entirely. The validation functions (Layer 1) are the correct control point for empty-field enforcement.

### Layer 3: Field-level `required` props

All `required` props in step body components are now `required={PROJECT_SETUP_REQUIRED_FIELDS_ENABLED}`. This hides the asterisk visual indicator and prevents Fluent Field-level required validation.

| Component | Fields affected |
|-----------|----------------|
| ProjectInfoStepBody | 6 fields (name, street, city, state, county, zip) |
| DepartmentStepBody | 2 fields (department, projectType) |
| TeamStepBody | 3 fields (executive, lead estimator, approver) |

### Layer 4: Submit button gating

`ReviewStepBody` submit button changed from `disabled={submitting \|\| !request.projectName}` to `disabled={submitting}`. The `projectName` gate was the only submit-blocking field check.

## 4. What Was NOT Changed

- Step definitions, field names, types, and comments preserved
- Validation function code preserved (guarded, not deleted)
- Format validation still runs when values are present
- Draft save/resume behavior unchanged
- Step navigation and wizard flow unchanged
- All existing tests continue to pass

## 5. How to Reactivate

Change one line in `packages/features/estimating/src/project-setup/config/projectSetupSteps.ts`:

```diff
- export const PROJECT_SETUP_REQUIRED_FIELDS_ENABLED = false;
+ export const PROJECT_SETUP_REQUIRED_FIELDS_ENABLED = true;
```

All three layers (step validation, step required flags, field required props) will automatically re-enable because they all reference this single constant.

Optionally, also re-add the submit button gate in `ReviewStepBody.tsx`:
```diff
- <HbcButton variant="primary" onClick={onSubmit} disabled={submitting}>
+ <HbcButton variant="primary" onClick={onSubmit} disabled={submitting || !request.projectName}>
```

## 6. Files Changed

| File | Change |
|------|--------|
| `packages/features/estimating/src/project-setup/config/projectSetupSteps.ts` | Added `PROJECT_SETUP_REQUIRED_FIELDS_ENABLED = false`, guarded all required checks |
| `packages/features/estimating/src/project-setup/config/index.ts` | Export the flag |
| `packages/features/estimating/src/project-setup/index.ts` | Re-export the flag |
| `packages/features/estimating/src/index.ts` | Re-export the flag |
| `apps/estimating/src/components/project-setup/ProjectInfoStepBody.tsx` | `required={PROJECT_SETUP_REQUIRED_FIELDS_ENABLED}` on 6 fields |
| `apps/estimating/src/components/project-setup/DepartmentStepBody.tsx` | `required={PROJECT_SETUP_REQUIRED_FIELDS_ENABLED}` on 2 fields |
| `apps/estimating/src/components/project-setup/TeamStepBody.tsx` | `required={PROJECT_SETUP_REQUIRED_FIELDS_ENABLED}` on 3 fields |
| `apps/estimating/src/components/project-setup/ReviewStepBody.tsx` | Removed `!request.projectName` from submit disabled check |
| `apps/estimating/package.json` | Version bump 0.2.6 → 0.2.7 |

## 7. Verification

| Check | Result |
|-------|--------|
| Build | Pass (1,183.73 KB) |
| Lint | 0 errors (61 pre-existing warnings) |
| Tests | 112/112 pass + 2 todo (17 files) |
