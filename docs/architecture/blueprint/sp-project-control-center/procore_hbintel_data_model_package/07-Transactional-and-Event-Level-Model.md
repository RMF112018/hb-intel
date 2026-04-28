# Transactional and Event-Level Model

## Objective
Capture the row-level events required for auditability, trend analysis, bottleneck analysis, and drill-through.

## Event-family recommendations

### Financial transaction/event tables
- budget_change_adjustment
- commitment_contract_line_item
- commitment_change_order_line_item
- subcontractor_invoice_detail
- direct_cost
- prime_contract_line_item
- prime_change_order_line_item
- owner_invoice_line_item
- contract_payment

### Workflow / process event tables
- rfi_reply
- submittal_response
- workflow_activity
- coordination_issue_activity
- inspection_item_comment
- observation_status_history (derived if the API does not expose a full history entity)
- punch_item_activity (if extracted)

### Document / revision event tables
- drawing_revision
- drawing_upload
- specification_revision
- document_upload
- document_file version/change event (derived if only current metadata is exposed)

### Field event tables
- daily_log_segment_event
- timecard_entry
- actual_production_quantity
- equipment_time_entry
- equipment_maintenance_event

## Grain standards
### One row per event
Use this shape when the source naturally represents a discrete action:
- workflow activity
- RFI reply
- submittal response
- contract payment
- equipment maintenance event

### One row per current-state line item
Use this shape when the source exposes a line item but not an immutable event stream:
- budget detail row
- commitment line item
- prime contract line item
- invoice detail item

### One row per snapshot row
Use this shape when period-over-period movement matters more than source immutability:
- budget view snapshot row
- project cost position snapshot
- project quality/safety snapshot
- project open item snapshot

## History strategy
### Native history available
Capture as-is:
- workflow activity histories
- coordination issue activity/change history
- drawing revisions
- checklist schedule change history
- explicit snapshot endpoints

### Native history not fully available
Create periodic snapshots:
- RFI status aging
- submittal pending/closed aging
- observation/punch backlog
- vendor compliance state
- current project health KPIs

## Recommended incremental strategy
- dimensions: nightly plus on-change refresh
- high-volume facts: hourly or near real-time where justified
- snapshots: daily for project KPIs, weekly or nightly for portfolio trends, event-driven where an official snapshot endpoint already exists