# 07 — Validation Review and Issue Drawer Wireframes

## Locked Decisions Applied

| Decision | Locked Direction |
|---|---|
| MVP posture | Estimating Workbench is included in MVP scope. |
| First implementation | SharePoint/SPFx inside PCC. |
| PCC placement | Mount under `Project Readiness > Estimating Workbench`; no new top-level PCC navigation surface in MVP. |
| Cost-code hierarchy | MVP uses internal HB Cost Codes first; Sage mapping follows in a future phase. |
| Day-one templates | Commercial and Multifamily. |
| Workbook import | Template migration only; no active project workbook import in MVP. |
| Data posture | Workbook-like UX over canonical PCC estimating data records. |
| HBI posture | Grounded review/summarization only; no pricing authority, no award authority. |

## Objective

Define shared validation review patterns used across Estimate Home, Estimate Builder, Bid Leveling, Template Admin, and Handoff Preview.

## Screens / Components in This Group

1. Validation Issue Drawer.
2. Cost Code Mapping Drawer.
3. Scratchpad Promotion Drawer.
4. Formula Review Drawer.
5. Override / Return for Correction Modal.
6. Validation Report Summary.

## Validation Issue Drawer

### Purpose

Give users a single issue-management pattern that opens from any readiness/validation signal.

### Layout

```text
Validation Issue Drawer
├── Issue Summary Header
├── Severity Filters
├── Issue List
├── Issue Detail
├── Recommended Action
├── Source Location Link
├── Assignment / Owner
└── Resolve / Defer / Return Actions
```

## Required Issue Fields

| Field | Required | Notes |
|---|---:|---|
| Issue ID | Yes | Stable ID. |
| Severity | Yes | Error, Warning, Info. |
| Blocking | Yes | Blocks handoff yes/no. |
| Source Entity | Yes | Estimate, Section, Line Item, Bid Package, Template. |
| Source Location | Yes | Direct deep link to screen/row/panel. |
| Message | Yes | User-readable issue text. |
| Technical Code | Yes | Validation rule ID. |
| Owner | Yes | Assigned role/user. |
| Created At | Yes | Timestamp. |
| Last Checked At | Yes | Timestamp. |
| Resolution Status | Yes | Open, In Progress, Resolved, Deferred, Waived. |
| Override Reason | Conditional | Required for waivers. |

## Severity Rules

| Severity | Behavior |
|---|---|
| Error | Blocks handoff/freeze if issue is handoff-applicable. |
| Warning | Allows handoff only if reviewed or accepted by authorized role. |
| Info | Does not block. |

## Cost Code Mapping Drawer

Purpose: resolve unmapped HB internal cost-code rows.

Fields/actions:

- source row preview;
- current CSI/reference code;
- recommended HB cost-code candidates;
- manual search/select HB cost code;
- apply to one row;
- apply to matching rows;
- require review if confidence below threshold.

## Scratchpad Promotion Drawer

Purpose: prevent scratchpad content from being lost or silently promoted.

Actions:

- promote to canonical line item;
- mark as reference-only;
- exclude from estimate;
- keep as draft scratchpad;
- assign owner for review.

## Formula Review Drawer

Purpose: classify unsupported or migrated workbook formula logic.

Actions:

- accept resolved static value;
- convert to governed calculation rule;
- keep as template note/reference;
- flag for admin review;
- reject / retire.

## Override / Waiver Modal

Required fields:

- issue ID;
- severity;
- override reason;
- approver role;
- expiration/review date where applicable;
- downstream visibility flag;
- audit event creation.

Waivers cannot be used for hard-blocker errors unless specifically permitted by a documented rule.

## Validation Report Summary

Report sections:

- Total issues by severity.
- Blocking errors.
- Mapping coverage.
- Required section completeness.
- Scratchpad promotion status.
- Bid leveling review status.
- Template migration issues.
- Formula review status.

## Acceptance Criteria

- Every validation signal opens to actionable issue detail.
- User can navigate from issue to source row/section.
- Handoff Preview receives accurate blocking status.
- Waivers are role-gated and audited.
- No issue is only visible in a hidden SharePoint list.
