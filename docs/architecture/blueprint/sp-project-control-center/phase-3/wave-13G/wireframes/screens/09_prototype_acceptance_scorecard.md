# 09 — Prototype Acceptance Scorecard and Review Plan

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

Define how the first fixture-driven prototype should be reviewed before moving to SharePoint-backed persistence or implementation wave expansion.

## Prototype Scope

The prototype must include fixture-backed versions of:

1. Estimate Home.
2. Template Selector.
3. Estimate Builder.
4. Cost Summary.
5. Bid Leveling Workbench.
6. Handoff Preview.
7. Template Admin summary.
8. Validation Issue Drawer.

## Prototype Non-Scope

- No live SharePoint list writes.
- No Sage writeback.
- No Procore writeback.
- No active project workbook import.
- No HBI pricing or award recommendation authority.
- No full Excel formula parity.

## Review Participants

- Estimating Coordinator.
- Estimator.
- Lead Estimator.
- Project Executive.
- Project Manager.
- Project Accountant.
- PCC Admin / IT representative.

## Review Scenarios

### Scenario 1 — Commercial Estimate Setup

- Open Project Readiness.
- Launch Estimating Workbench Home.
- Select Commercial template.
- Create draft estimate.
- Review seeded sections.
- Add/edit line items.
- Resolve a cost-code warning.

### Scenario 2 — Multifamily Estimate Setup

- Select Multifamily template.
- Confirm unit/area metrics.
- Review cost summary.
- Add allowance and alternate.
- Confirm scratchpad behavior.

### Scenario 3 — Bid Leveling and Handoff

- Open Bid Leveling.
- Compare three bidders.
- Apply adjustment rationale.
- Export comparison.
- Open Handoff Preview.
- Resolve blocking issues.
- Send to review.

## Acceptance Scorecard

| Category | Weight | Passing Criteria |
|---|---:|---|
| Estimator workflow familiarity | 20 | Estimators agree the flow resembles current work enough for pilot. |
| Canonical data quality | 20 | Required HB cost-code and downstream mappings are visible and enforceable. |
| Bid leveling usefulness | 15 | Vendor comparison and adjustment rationale are clear. |
| Handoff readiness | 15 | PM/PX/operations can understand downstream package before freeze. |
| Performance posture | 10 | Prototype demonstrates virtualization/large-row plan or credible equivalent. |
| Accessibility / keyboard usability | 10 | Primary grid operations are keyboard-planned and testable. |
| PCC lifecycle integration | 10 | Feature clearly lives inside unified PCC Project Readiness context. |

Minimum acceptance: 80/100 with no hard-stop failures.

## Hard-Stop Failures

- Feature feels like raw SharePoint list editing.
- Estimators cannot understand where to start or continue an estimate.
- Scratchpad items silently flow downstream.
- Handoff can freeze with unresolved blocking errors.
- Bid leveling appears to execute award authority.
- Unsupported active workbook import is introduced.
- Sage/Procore writeback is implied or wired.
- The grid cannot be operated with keyboard for core tasks.
- UI creates browser-level horizontal overflow in the SharePoint host.

## Review Output

After review, produce:

- approved wireframe decisions;
- requested UX changes;
- implementation blockers;
- pilot scope confirmation;
- updated prompt package for fixture-driven prototype implementation.
