# Star Schema Recommendation

## Recommended stars for HB Intel

### 1. Project Health Star
**Fact**: `project_health_snapshot` (derived from open items, RFIs, submittals, observations, incidents, punch, workflows, and current cost exposure)

**Dimensions**
- project
- company
- calendar_date
- project_classification
- project_owner_user
- region / office / market sector
- project_status

**Measures**
- overdue_rfi_count
- overdue_submittal_count
- open_observation_count
- failed_inspection_item_count
- open_punch_count
- open_coordination_issue_count
- pending_workflow_count
- incident_count_30d
- pending_change_amount
- committed_vs_budget_variance

### 2. Cost and Change Star
**Facts**
- `project_cost_position_snapshot`
- `budget_view_row_snapshot`
- `change_event`
- `budget_change`
- `commitment_change_order`
- `prime_change_order`

**Dimensions**
- project
- calendar_date
- wbs_code
- sub_job
- vendor_organization
- trade
- contract_side
- change_status

**Measures**
- original_budget
- revised_budget
- pending_budget_change
- committed_cost
- direct_cost
- subcontractor_billed_to_date
- owner_billed_to_date
- paid_to_date
- pending_owner_change
- pending_subcontract_change

### 3. Operational Burden Star
**Facts**
- `rfi`
- `submittal`
- `correspondence_item`
- `observation`
- `inspection_item`
- `workflow_activity`

**Dimensions**
- project
- calendar_date
- responsible_user
- vendor_organization
- trade
- location
- status
- priority_or_severity
- tool_family

**Measures**
- item_count
- aging_days
- turnaround_days
- overdue_flag
- reassignment_count
- close_cycle_days

### 4. Labor and Productivity Star
**Facts**
- `timecard_entry`
- `actual_production_quantity`
- `daily_log_segment_event`
- `equipment_time_entry`
- `field_productivity_snapshot`

**Dimensions**
- project
- calendar_date
- user / labor owner
- vendor_organization
- trade
- wbs_code
- sub_job
- location
- equipment

**Measures**
- labor_hours
- production_quantity
- planned_vs_actual_rate
- equipment_hours
- manpower_count
- weather_impact_flag

## Modeling notes
- Preserve detailed normalized canonical tables first.
- Materialize star schemas second for dashboards and Power BI / HB Intel analytics.
- Use snapshots for trend reporting; use current-state fact tables for work queues and current project views.
