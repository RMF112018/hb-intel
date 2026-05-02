# Constraints Log Target Architecture

## Module

**Constraints Log — Make-Ready Constraint & Risk Exposure Center**

## Objective

The Wave 12 Constraints Log is a governed Project Readiness module that identifies, assesses, prioritizes, assigns, escalates, and resolves project constraints and execution risks before they disrupt planned work.

The module must answer:

- What is preventing upcoming work from being executable?
- What risk exposure exists before a constraint becomes active?
- Who owns the response or removal?
- When must the item be resolved to avoid schedule, cost, quality, safety, client, or contractual exposure?
- What planned work, location, trade, company, or external party is affected?
- Which risks have become constraints?
- Which constraints have converted into issues, delays, changes, or lessons learned?

## Operating Model

The module follows the Lean/Last Planner System operating rhythm:

| LPS conversation | PCC module behavior |
|---|---|
| Should | Link planned activities, work packages, lookahead weeks, and phase commitments. |
| Can | Identify constraints and assess whether planned work is constraint-free. |
| Will | Capture owners, promises, need-by dates, and resolution commitments. |
| Did | Validate resolution, actual dates, and on-time removal. |
| Learn | Capture variance reasons, root causes, repeat constraints, and lessons learned. |

## Product Pillars

1. **Make-Ready Constraint Management** — tracks known blockers.
2. **Risk Assessment Matrix** — assesses uncertain future threats.
3. **Constraint Exposure Matrix** — assesses known blockers using urgency × impact.
4. **Risk-to-Constraint Lifecycle** — converts triggered risks into constraints.
5. **Priority Actions and Escalation** — routes urgent exposure to the rail.
6. **Root Cause / Lessons Learned** — captures patterns and prevention learning.
7. **Executive Exposure Dashboard** — summarizes risk, constraint, schedule, and ownership exposure.

## Core Definitions

| Term | Definition |
|---|---|
| Constraint | Known item, requirement, condition, or dependency that must be resolved before planned work can start, continue, or complete as intended. |
| Risk | Uncertain future event or condition that may affect project objectives if it occurs. |
| Issue | Current problem requiring active resolution that is no longer only a future uncertainty. |
| Delay exposure | Potential or actual schedule-impact condition requiring review and documentation. |
| Change exposure | Potential or actual scope, cost, or contract-impact condition requiring linkage to change management. |
| Need-by date | Latest date the item must be resolved to avoid impacting linked work. |
| Promised resolution date | Date the responsible party has committed to resolve the item. |
| Actual resolution date | Date the item was validated as resolved. |
| Ball-in-court | Current person, role, or company responsible for the next action. |

## User Personas

| Persona | Primary jobs |
|---|---|
| Project Manager | Own operating rhythm, assign owners, validate resolution, escalate exposure. |
| Project Executive | Review high/critical exposure and resolve cross-company blockers. |
| Superintendent | Identify field constraints, validate readiness, support huddle review. |
| Project Accountant | View cost/change exposure; no legal/delay determinations. |
| Project Team Member | Update assigned actions and comments. |
| Executive Read-Only | Review exposure summaries and governed drill-in. |
| PCC Admin / IT | Configure system metadata/fixtures; no business override unless assigned business role. |
| External Contributor | View/update assigned items only where project policy allows. |

## Primary UX Surfaces

1. **Command Center**
2. **Make-Ready Board**
3. **Risk Matrix**
4. **Constraint Exposure Matrix**
5. **Log Table**
6. **Weekly Huddle**
7. **Root Cause & Lessons Learned**

## Command Center

Required cards:

- Make-Ready Health Score.
- Constraint-Free Work Percentage.
- Open Constraints.
- Overdue Constraints.
- Constraints Due in 7 Days.
- Critical Path Exposure.
- High / Critical Risks.
- Residual High / Critical Risks.
- Ball-in-Court by Company.
- Top Root Causes.
- Converted to Issue / Delay / Change.
- Aging Constraints.
- Stale Risks Needing Review.

Cards must click through to filtered record sets.

## Make-Ready Board

Columns:

- Proposed.
- Accepted.
- Action Planned.
- In Progress.
- Awaiting External Party.
- At Risk / Overdue.
- Resolved Pending Validation.
- Resolved.

Swimlanes:

- Lookahead week.
- Location.
- Trade / workstream.
- Responsible company.

Decision: no drag/drop status changes in initial implementation. All state changes must use explicit audited actions.

## Risk Matrix

5×5 likelihood-impact matrix.

Required behavior:

- Cell counts by initial score.
- Toggle initial vs residual score.
- Click cell to filter Risk Register.
- Highlight High/Critical cells.
- Flag stale and unowned risks.
- Show residual High/Critical as uncontrolled exposure.

## Constraint Exposure Matrix

5×5 urgency-impact matrix.

Required behavior:

- Rows = impact.
- Columns = urgency.
- Cell counts by active constraints.
- Toggle all/my items/critical path/overdue/external party.
- Click cell to filter Constraint Log.
- Prioritize overdue/current-week items.

## Log Table

Default columns:

- ID.
- Type.
- Title.
- Category.
- Status.
- Band.
- Owner.
- Ball-in-court.
- Company.
- Location.
- Trade.
- Need-by / review date.
- Promised date.
- Days aging.
- Linked activity.
- Critical path exposure.
- Root cause.
- Last updated.

Saved views:

1. All active items.
2. My items.
3. My company.
4. Ball-in-court.
5. Due in 7 days.
6. Overdue.
7. Critical path exposure.
8. High / Critical risks.
9. Residual High / Critical risks.
10. Awaiting external party.
11. No owner assigned.
12. Stale risk review.
13. By location.
14. By trade.
15. By root cause.
16. Converted to issue / delay / change.
17. Resolved / closed archive.

## Weekly Huddle Mode

Review sequence:

1. Current-week unresolved constraints.
2. Constraints due in seven days.
3. Three-week and six-week lookahead constraints.
4. Ball-in-court confirmation.
5. Promise capture.
6. External-party blockers.
7. Triggered risks converting to constraints.
8. Variance reasons.
9. Priority Action candidates.
10. Huddle summary.

## Root Cause & Lessons Learned

Required outputs:

- Root cause by category.
- Root cause by company.
- Root cause by trade.
- Root cause by phase.
- Repeat constraint count.
- Risk-to-constraint conversion rate.
- Constraints converted to issue/delay/change.
- Average days to remove by category.
- On-time removal by company.

## Metrics

- Make-Ready Health Score.
- Constraint-Free Work Percentage.
- On-Time Constraint Removal Rate.
- Promise Reliability.
- Risk Conversion Rate.
- Average Constraint Age.

## Integration Boundaries

| Related area | Wave 12 may do | Wave 12 may not do |
|---|---|---|
| Scheduler / Look Ahead | Link activity IDs, lookahead weeks, float/critical-path exposure where available | Modify schedules or recalculate CPM |
| Priority Actions | Emit candidates | Own global rail routing |
| Document Control | Reference evidence links | Store/sync/upload files |
| Permit & Inspection | Link permit/AHJ/inspection blockers | Own permit/inspection lifecycle |
| Responsibility Matrix | Reference owners/roles/BIC | Own RACI/contract responsibility source truth |
| Approvals / Checkpoints | Request review/escalation | Execute approval authority |
| External Systems | Show launcher/reference links | Write/sync/scrape/poll/mirror |

## Data Model

See `Wave_12_Risk_And_Constraint_Exposure_Model.md`, `reference/risk_matrix_config_reference.json`, and `reference/constraint_exposure_scoring_reference.json`.

## Definition of Done

Wave 12 is build-complete only when:

- Module renders from deterministic fixtures.
- Constraint and risk records have complete typed models.
- Risk matrix calculates initial and residual risk.
- Constraint exposure matrix calculates urgency × impact.
- Severity overrides work.
- Status transitions are enforced.
- Saved views work.
- Priority-action candidates are generated.
- Evidence references are link-only.
- Role-based permissions suppress unauthorized controls.
- Empty/loading/degraded/access-denied states exist.
- Root cause and lessons learned views exist.
- Weekly Huddle mode exists.
- Risk-to-constraint conversion is represented.
- Constraint-to-issue/delay/change linkage is represented.
- No external writeback exists.
- No tenant mutation exists.
- No legal/claim/delay determination behavior exists.
- Documentation matches runtime behavior.
