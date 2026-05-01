# 08 — Prompt 05: Add Role, Evidence, Scoring, and UX Details

## Role

You are a local code agent in `/Users/bobbyfetting/hb-intel`. You have the current Wave 9 documentation changes in context.

## Objective

Refine the Wave 9 documentation so it is implementation-ready for a later code wave by adding detailed role/action, evidence, scoring, exception, source-of-record, and flagship UX guidance where missing.

## Required Enhancements

Ensure Wave 9 documentation defines or references:

### 1. Role / Action Matrix

Actions:

```text
view
complete
fail
mark-na
defer
assign-owner
change-due-date
attach-evidence
remove-evidence
request-review
approve
return
waive
override-status
reopen
configure-template
export
view-audit
```

Roles:

```text
PCC Admin
IT / Tenant Admin
Executive Oversight
Project Executive
Project Manager
Superintendent
Project Accounting
Safety / QAQC
Manager of Operational Excellence
Estimating Coordinator
Lead Estimator
Project Coordinator
Project Team Member
Project Viewer
External Contributor
```

If current shared models do not include some roles, document the gap and defer model changes.

### 2. Evidence Contract

Define:

- evidence policy values;
- evidence link fields;
- evidence source of record;
- required-before-complete vs required-before-approval distinction;
- Document Control relationship;
- SharePoint evidence relationship;
- Procore/external reference posture.

### 3. Readiness Scoring

Define:

- completion percent;
- required readiness percent;
- evidence readiness percent;
- approval readiness percent;
- risk-weighted readiness score;
- blocked count;
- overdue count;
- failed safety count;
- gate-blocking count.

### 4. Lifecycle Gates

Define gates:

```text
contract-review-ready
startup-ready
mobilization-ready
safety-ready
permit-ahj-ready
pre-co-ready
turnover-ready
financial-closeout-ready
project-closeout-complete
```

### 5. UX Model

Define flagship UX:

- readiness hero;
- lifecycle map;
- my readiness actions;
- readiness domains;
- blockers and exceptions;
- evidence readiness;
- future closeout exposure;
- item detail drawer;
- source/template view;
- audit/history view.

Explicitly prohibit giant static checklist, simple three-tab interface, PDF viewer primary UX, and form dump.

### 6. Source-of-Record Posture

State:

- PCC owns lifecycle readiness workflow state.
- HB Document Control Center / SharePoint owns evidence documents.
- Procore is an external reference only unless later approved.
- Sage/accounting and AHJ references are external/manual references unless later integrated.

## Files to Update

Prefer the dedicated Wave 9 target architecture and item-library/crosswalk docs. Only update broader roadmap/blueprint files if they still lack the required posture.

## Validation

Run:

```bash
git diff --check
pnpm exec prettier --check docs/architecture/blueprint/sp-project-control-center/**/*.md
```

Do not commit yet unless the user/local workflow explicitly says to commit after each prompt.
