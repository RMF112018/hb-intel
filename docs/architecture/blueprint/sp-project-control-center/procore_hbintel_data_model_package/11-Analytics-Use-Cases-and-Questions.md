# Analytics Use Cases and Questions

## Executive / company leadership
- Which projects have the largest combined pending change exposure?
- Where are approval bottlenecks occurring across RFIs, submittals, workflows, or owner-side change approvals?
- Which PM/PX portfolios show the highest operational burden relative to project size?
- Which vendors or trades correlate with high observation, punch, or submittal volume?
- Which projects are generating abnormal document revision churn?

## Finance / operations leadership
- Budget vs commitments vs direct costs vs subcontractor billed vs owner billed by project and WBS
- Pending budget changes by status and ERP status
- Change event to budget change to commitment/prime change order conversion lag
- Owner-side change approval lag vs subcontract-side change approval lag
- Cash flow timing: billed vs paid vs committed exposure
- Subcontractor invoice aging by vendor and project

## PX / PM / project controls
- RFI aging by discipline, location, and responsible party
- Submittal turnaround by vendor, spec section, and approver
- Meeting topics unresolved beyond SLA
- Correspondence volume by type and response burden
- Workflow instances stalled by current step or approver

## Quality / safety
- Observation closure performance by project, location, trade, and vendor
- Inspection failure density by template, item category, and vendor
- Incident rate and severity trend by project
- Punch item backlog by area/floor/building and trade
- Action plan completion lag by responsible party

## Field / self-perform / operations
- Labor hours by WBS vs budget impact
- Production quantities vs labor hours for earned-rate style measures
- Daily manpower and productivity signals vs issue generation
- Equipment utilization by project and asset
- Weather/manpower/productivity correlation to schedule or issue spikes

## Design / VDC / document control
- Drawing revision intensity by project phase
- Specification issuance/revision churn by package
- RFIs and submittals linked to drawing/spec sections
- Coordination issue density by location/model/package
- Document metadata growth and stale-folder detection

## Portfolio benchmarking examples
- Compare observation rates per $1M of contract value by sector
- Compare pending submittal count per active project team member
- Compare change-event burden per 100 budget lines
- Compare vendor punch recurrence rates across projects
- Compare timecard-driven labor burn against budget views over time

## Derived metrics recommended
- days_open
- days_to_first_response
- days_to_close
- overdue_flag
- pending_approval_amount
- pending_approval_count
- vendor_issue_rate
- inspection_fail_rate
- observation_reopen_rate
- punch_close_cycle_time
- budget_change_conversion_rate
- change_event_realization_rate
- labor_hours_per_unit
- equipment_utilization_rate
- document_revision_velocity