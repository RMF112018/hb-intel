# Checklist & Review — UI Specification

## 1. Screen Identity

- **Screen name:** Checklist & Review
- **Module:** Project Hub / Financial
- **Primary route:** `/project-hub/$projectId/financial/forecast/review`
- **Screen type:** Workflow gate and approval surface
- **Primary intent:** Convert a working forecast into a governed review and approval experience with explicit readiness, reviewer custody, return-for-revision, and confirmation behavior.

## 2. Why This Page Exists

This page replaces the informal “check the workbook, email the packet, discuss comments, and approve outside the system” process.

It must:
- enforce readiness,
- present checklist completion clearly,
- show the approval chain and custody,
- support formal return-for-revision,
- and preserve the audit trail.

This page is a **gate**, not a to-do list.

## 3. Primary Users

- Project Manager
- Project Executive
- MOE / governance roles
- Leadership where designated as reviewer / approver

## 4. Recommended Layout Model

- **`WorkspacePageShell` layout:** `detail`
- **Primary wireframe influence:** Concept 2 for command + review posture
- **Secondary influence:** Concept 4 for intervention logic

## 5. Region Map

1. `R1` — Review Header / Custody Header
2. `R2` — Gate Status Banner Zone
3. `R3` — Checklist Groups
4. `R4` — Approval / Review Stepper
5. `R5` — Reviewer Notes / Decision Rail

## 6. Text Wireframe

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ R1: Review Header                                                           │
│ Period | Version | Custody | State | Commands                               │
├──────────────────────────────────────────────────────────────────────────────┤
│ R2: Gate Status Banners                                                     │
│ Ready / blocked / returned / stale / override notices                        │
├──────────────────────────────────────┬───────────────────────────────────────┤
│ R3: Checklist Groups                 │ R4: Approval / Review Stepper        │
│ completion status                    │ PM -> PE -> publication / archive    │
│ unresolved items                     │ decision state                        │
│ grouped requirements                 │ timestamps / comments                 │
├──────────────────────────────────────┴───────────────────────────────────────┤
│ R5: Reviewer Notes / Decision Rail                                         │
└──────────────────────────────────────────────────────────────────────────────┘
```

## 7. Major Regions

### R1 — Review Header / Custody Header
Must show:
- period,
- version,
- workflow state,
- current custodian,
- review participants,
- and currently allowed commands.

Typical actions:
- Submit for Review
- Pull Back (only when still untouched)
- Return for Revision
- Approve
- Reopen
- Open History

### R2 — Gate Status Banner Zone
Must show:
- whether the forecast is ready,
- which gates are failing,
- whether stale-state applies,
- whether review has already begun,
- and whether override or governance intervention exists.

### R3 — Checklist Groups
Checklist should be:
- grouped by logical area,
- visibly complete / incomplete,
- easy to scan,
- and directly linked to the underlying page or issue causing failure.

Examples:
- Summary complete
- Budget snapshot current
- GC/GR updated
- Cash Flow updated
- Buyout interpretation current
- Commentary complete
- Material exceptions explained

### R4 — Approval / Review Stepper
Use `HbcApprovalStepper` or a governed extension.

Must show:
- ordered roles,
- current decision state,
- timestamps,
- comments,
- and whether the item has been returned or approved.

### R5 — Reviewer Notes / Decision Rail
Should hold:
- reviewer comments,
- unresolved discussion points,
- linked annotations,
- decision rationale,
- and history of prior return-for-revision events.

## 8. Component Inventory

### Governed `@hbc/ui-kit` primitives
- `WorkspacePageShell`
- banners / callouts
- grouped list / task panels
- `HbcApprovalStepper`
- notes / comments panel

### Financial-specific composites
- `ForecastReviewHeader`
- `ForecastGateBannerStack`
- `ForecastChecklistGroupPanel`
- `ForecastDecisionRail`

## 9. Data Dependencies

- checklist item records,
- confirmation gate results,
- forecast version workflow state,
- custody / reviewer state,
- approval step data,
- review notes,
- stale markers,
- override / reopen records.

## 10. Interaction Model

### PM flow
- complete unresolved items,
- see exactly what is still blocking submission,
- submit when gates pass,
- respond to return-for-revision.

### Reviewer flow
- inspect readiness,
- compare summary if needed,
- add notes,
- return or approve with explicit rationale.

## 11. State Model Behavior

### Working
- checklist is active and actionable,
- submit action available only when valid.

### Ready for Review
- PM has limited pull-back rights until reviewer engages.

### In Review
- reviewer custody emphasized,
- PM cannot silently continue editing.

### Returned for Revision
- return reason prominent,
- revised work path clear.

### Approved
- final decision preserved,
- mutation blocked.

## 12. Responsive Behavior

### Desktop
- grouped checklist + stepper + notes visible together.

### Tablet
- stepper and notes become segmented panes.

### Mobile
- checklist first,
- approval history and notes behind tabs.

## 13. Complexity / Progressive Disclosure

### Essential
- show unresolved groups and next step only.

### Standard
- full grouped checklist and review state.

### Expert
- full rationale, override nuance, and audit context.

## 14. Accessibility Requirements

- checklist groups semantically structured,
- stepper accessible as ordered list with state text,
- blocked reasons linked to actionable destinations,
- decision buttons clearly labeled and keyboard reachable.

## 15. Key Acceptance Criteria

- A user can tell instantly whether the forecast is submittable and why.
- The review state is explicit; custody ambiguity is eliminated.
- Return-for-revision is formal and traceable.
- Approval behaves like a governed financial event, not a casual button click.
