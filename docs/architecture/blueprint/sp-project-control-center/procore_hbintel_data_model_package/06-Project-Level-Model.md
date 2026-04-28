# Project-Level Operational Model

## Objective
Support PM, superintendent, PX, VDC, quality, safety, and accounting drilldown from a single project control center.

## Recommended project-level subject areas

### Project master and context
- project
- project_dates
- project_tools
- locations
- project users and roles
- project vendors and roles
- project custom field values
- enabled generic/correspondence types

### Cost and change
- budget view current rows
- budget details
- budget changes and adjustment lines
- change events
- commitments and line items
- commitment change orders
- requisitions
- direct costs
- prime contracts
- prime change orders
- owner invoices
- contract payments

### Project management
- RFIs and replies
- submittals and approvers/responses
- meetings and topics
- correspondences
- forms
- workflow instances and activity

### Documents and design
- folder/file metadata
- drawings, revisions, sets, uploads, areas
- specification sets/sections/revisions
- document markup metadata
- email communications

### Quality / safety / closeout
- observations
- inspections/checklists and items
- incidents
- action plans and items
- punch items
- coordination issues

### Field execution
- daily log header and segmented records
- manpower, productivity, weather, delivery, DCR, notes
- timecard entries / timesheets / timecards
- actual production quantities
- equipment, maintenance, project assignment, equipment time entries

## Project control-center materializations
The project-level operational model should publish curated views:
- Project Summary
- Cost Position
- Change Management
- Commitments & Billing
- Design & Coordination
- Daily Field Activity
- Quality & Safety
- Workforce & Production
- Documents & Drawings
- Workflow & Approvals

## Recommended project joins
- project -> users/vendors/roles via bridges
- project -> WBS via budget/commitment/timecard/production facts
- project -> location via observations/punch/inspections/daily logs
- project -> drawings/specs/documents via document metadata
- project -> change_event -> budget_change / commitment_change_order / prime_change_order
- project -> submittal / rfi / correspondence -> responsible users and vendors
- project -> timecard_entry / production -> WBS and labor owner
- project -> daily logs -> weather/manpower/productivity/equipment segments

## Practical filtering keys
Every project-level fact should expose:
- procore_company_id
- procore_project_id
- canonical_project_key
- created_at
- updated_at
- current_status
- responsible_user_key when applicable
- vendor_key when applicable
- location_key when applicable
- wbs_code_key when applicable
- source_system_id