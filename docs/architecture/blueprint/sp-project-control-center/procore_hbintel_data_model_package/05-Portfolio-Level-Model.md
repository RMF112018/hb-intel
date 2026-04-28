# Portfolio / Cross-Project Analytical Model

## Objective
Provide a cross-project reporting model optimized for executives, PXs, operations leaders, and finance leadership.

## Portfolio fact families
### Health and KPI snapshots
- project_open_item_snapshot
- project_cost_position_snapshot
- project_quality_safety_snapshot
- field_productivity_snapshot

### Financial portfolio facts
- budget_view_row_snapshot
- budget_change
- change_event
- commitment_contract
- subcontractor_invoice
- direct_cost
- prime_contract
- owner_invoice
- contract_payment

### Workflow / operational burden facts
- rfi
- submittal
- correspondence_item
- observation
- inspection
- incident
- punch_item
- coordination_issue
- workflow_instance

## Conformed dimensions required
- company
- project
- calendar_date
- user
- vendor_organization
- trade
- department
- location
- wbs_code
- sub_job
- custom_field dimensions (selected high-value fields only)
- project_classification (region, market sector, office, PM/PX, delivery type, etc.)

## Portfolio KPI themes
### Executive / operations
- project health index
- open item burden and aging
- vendor concentration and performance
- workload by PM/PX/superintendent
- approval lag by tool family

### Finance
- budget vs commitment vs direct cost vs billed vs paid
- budget-change and change-event exposure
- owner-side vs subcontract-side change lag
- margin risk concentration by region / PM / market

### Design / coordination
- RFI and submittal turnaround
- drawing/spec revision intensity
- coordination issue backlog
- correspondence volume and closure burden

### Quality / safety
- incident rate trend
- inspection failure / deficiency pattern
- observation closure performance
- punch backlog by phase and trade

## Modeling recommendation
For the portfolio layer, favor:
- one current-state materialization for dashboards
- one historical snapshot store for trends
- one detailed transaction layer for drill-through

## Example portfolio star schemas

### Project Health Star
Fact:
- project_health_snapshot

Dimensions:
- project
- date
- PM/PX owner
- region
- sector
- project status
- customer / owner

Measures:
- open issue counts
- overdue RFIs
- overdue submittals
- punch backlog
- unresolved observations
- workflow approvals aging
- incident count
- budget change pending amount

### Cost and Change Star
Fact:
- project_cost_position_snapshot
- budget_view_row_snapshot
- change_event
- budget_change
- commitment_change_order
- prime_change_order

Dimensions:
- project
- date
- wbs_code
- sub_job
- vendor
- trade
- contract side (owner/subcontract/internal)

Measures:
- original budget
- revised budget
- committed cost
- direct cost
- subcontract billed
- owner billed
- pending changes
- approved changes
- paid to date

### Operational Burden Star
Fact:
- rfi
- submittal
- correspondence_item
- observation
- inspection_item
- coordination_issue
- workflow_activity

Dimensions:
- project
- date
- responsible user
- vendor
- trade
- location
- status
- priority/severity
- tool family

Measures:
- count
- aging days
- overdue flag
- cycle time
- reassignment count
- closure lag