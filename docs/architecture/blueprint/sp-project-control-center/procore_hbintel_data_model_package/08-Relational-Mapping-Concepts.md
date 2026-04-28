# Relational Mapping Concepts

## 1. Source-native to canonical mapping principles
### 1:1 mapping
Use a direct 1:1 canonical entity when the Procore object already has durable business meaning and stable grain:
- project -> project
- company user -> user (plus project bridge where needed)
- vendor -> vendor_organization
- observation -> observation
- incident -> incident
- punch item -> punch_item
- change event -> change_event
- commitment contract -> commitment_contract
- prime contract -> prime_contract

### Many source endpoints to one canonical entity
Use one canonical entity when Procore splits the same business object into helper/reference/detail endpoints:
- submittals + approvers + responses + distributed submittals -> submittal ecosystem
- RFIs + replies + default distribution + filter helpers -> rfi ecosystem
- drawings + drawing areas + drawing sets + uploads + revisions -> drawing ecosystem
- inspections/checklists + items + comments + attachments + schedules -> inspection ecosystem
- workflows v2 + legacy activity histories -> workflow_instance and workflow_activity
- company users + project users + project people -> conformed user plus project-user bridge
- budget + budget line items + budget details + budget views -> budget current-state and snapshot model

### One source endpoint to multiple canonical entities
Decompose when a single Procore response carries more than one business concept:
- commitment contract show/list -> commitment_contract + vendor link + project link + custom field values
- prime contract show/list -> prime_contract + owner/vendor link + custom field values
- budget change show -> budget_change + budget_change_adjustment + change_event bridge
- checklist/inspection -> inspection + inspection item count + linked observation bridge
- drawing response -> drawing + revision + set/area link depending on payload richness

## 2. Canonical key strategy
### Native keys
Preserve all relevant Procore identifiers:
- procore_company_id
- procore_project_id
- procore_object_id
- procore_parent_object_id where applicable

### HB Intel surrogate keys
Issue canonical surrogate keys for:
- company_key
- project_key
- user_key
- vendor_key
- wbs_code_key
- location_key
- custom_field_definition_key
- date_key

### Composite uniqueness rules
Use composite keys when Procore ids are only unique within a parent scope:
- company_id + project_id + object_id
- project_id + generic_tool_type_id + item_id
- project_id + drawing_area_id + drawing_id
- budget_view_id + snapshot_id + row_identifier
- project_id + daily_log_header_id + segment_type + segment_row_id

## 3. Many-to-many handling
### User/project/role
A user can belong to many projects and hold multiple roles or permission-template contexts.
Use:
- bridge_project_user
- bridge_project_user_role

### Vendor/project/trade/role
A vendor can participate on many projects and can have multiple roles/trade contexts.
Use:
- bridge_project_vendor
- bridge_project_vendor_role

### Submittal/approver
A submittal can have multiple approvers and each approver can be on many submittals.
Use:
- bridge_submittal_approver

### Entity/attachment
Many Procore objects can have attachments.
Use a generic:
- bridge_entity_attachment
with entity_type + entity_key + document_file_key

### Inspection item / observation
A checklist item can link to one or more observations and observations can stem from inspections.
Use:
- bridge_inspection_item_observation

## 4. Parent-child hierarchy concepts
### Company -> Project
Projects roll up to a company. This is the enterprise anchor.

### Project -> Location
Locations should be hierarchical and reusable:
- project
  - building / zone / floor / room / area

### WBS hierarchy
Preserve WBS as a conformed hierarchy:
- wbs_attribute / segment
- wbs_attribute_item
- sub_job
- cost code
- wbs_code (flattened operational join entity)

### Document hierarchy
Preserve folder/file tree separately from operational facts:
- folder
  - subfolder
    - file
      - revision/version (if represented or derived)

## 5. Source roll-up patterns
### Budget ecosystem
Source pattern:
- budget views are often the best curated current-state analytics surface
- budget view snapshots provide native historical points
- budget details/line items provide lower-level current detail
Canonical pattern:
- budget_view_row_current
- budget_view_row_snapshot
- budget_detail_row
- project_cost_position_snapshot (derived)

### Change ecosystem
Source pattern:
- change events
- budget changes
- commitment change orders
- prime change orders
Canonical pattern:
- change_event
- budget_change
- commitment_change_order
- prime_change_order
- derived bridge: change_management_lineage

### Labor and productivity ecosystem
Source pattern:
- timecard entries
- timecards/timesheets
- actual production quantities
- task codes
- daily manpower/productivity logs
Canonical pattern:
- timecard_entry
- actual_production_quantity
- daily_log_segment_event
- derived project labor/productivity snapshots

## 6. Status/date/user/vendor lineage
Every major fact should carry:
- created_at
- updated_at
- due_date / needed_by / response_due as applicable
- closed_at / completed_at / approved_at if applicable
- status / state
- responsible user
- creator/originator
- assignee / manager / approver when applicable
- vendor / subcontractor / external org when applicable
- project and location
- WBS linkage when applicable

## 7. Slowly changing dimension recommendations
### Type 1
Use for:
- permission template descriptive text
- generic tool labels
- temporary configuration values not used historically

### Type 2
Use when historical context matters:
- project manager / PX assignment on a project
- vendor classification or strategic segment
- project classification changes (region/market if changed)
- custom field definitions where semantics materially change
- workflow template version alignment when tied to approval-cycle analytics

## 8. Snapshot strategy
### Native snapshots to keep
- budget view snapshots
- any explicit project status snapshot endpoints

### Derived snapshots to create
- daily project health snapshot
- weekly vendor performance snapshot
- weekly change exposure snapshot
- daily operational backlog snapshot
- labor/productivity daily snapshot

## 9. Attachment and binary content strategy
Do not flatten binaries into fact rows.
Instead:
- keep file/document metadata in document entities
- keep attachment bridges from business facts to document_file
- store download/access URL metadata cautiously
- treat file bodies as external/binary assets, not SharePoint list columns

## 10. Recommended canonical lineage chain examples
### Cost/change
project -> wbs_code -> budget row -> change event -> budget change -> commitment change order / prime change order -> invoice/payment

### Design coordination
project -> drawing/specification -> RFI / submittal / correspondence -> workflow/approver -> close date

### Quality/safety
project -> location -> observation / inspection item / incident / punch item -> responsible user/vendor/trade -> closure date

### Field productivity
project -> date -> timecard entry / manpower log / production quantity / equipment time entry -> WBS -> budget view labor impacts