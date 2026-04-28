# Canonical Entity Inventory

## Entity role legend
- **Dimension**: conformed descriptive entity reused across multiple facts
- **Fact / Transaction**: row-grain operational or financial measure-bearing entity
- **Bridge**: associative entity for many-to-many relationships
- **Snapshot / History**: point-in-time extract or slowly changing history
- **Document / Binary Metadata**: file/folder/revision metadata, not binary content
- **Extension**: optional or lower-priority canonical entity

## Core canonical entities

### Hierarchy and master dimensions
| Canonical entity | Role | Grain | Primary source families |
|---|---|---|---|
| company | Dimension | one row per Procore company | companies, company settings |
| project | Dimension | one row per Procore project | projects, project dates, project tools |
| project_classification | Dimension | one row per classification member/value | project metadata, filters, custom fields |
| user | Dimension | one row per distinct person/user | company users, project users, project people |
| vendor_organization | Dimension | one row per vendor org | company vendors, project vendors |
| department | Dimension | one row per department | departments |
| trade | Dimension | one row per trade | trades, project directory filter options |
| permission_template | Dimension | one row per permission template | company/project permission templates |
| location | Dimension | one row per location | project locations |
| distribution_group | Dimension | one row per group | distribution groups |
| custom_field_definition | Dimension | one row per custom field definition | custom fields |
| custom_field_option | Dimension | one row per LOV option | custom field LOV entries |
| wbs_attribute | Dimension | one row per WBS attribute/segment definition | WBS attributes |
| wbs_attribute_item | Dimension | one row per WBS attribute item | WBS attribute items |
| wbs_code | Dimension | one row per project/company WBS code | WBS codes, cost codes |
| sub_job | Dimension | one row per sub job | sub jobs |
| generic_tool_type | Dimension | one row per generic/correspondence type | generic tools |

### Core bridges
| Canonical entity | Role | Grain | Primary source families |
|---|---|---|---|
| bridge_company_project | Bridge | one row per company-project relation | projects |
| bridge_project_user | Bridge | one row per user-project membership | project users / people |
| bridge_project_user_role | Bridge | one row per user-project-role assignment | user project roles, project assignments |
| bridge_project_vendor | Bridge | one row per vendor-project membership | project vendors |
| bridge_project_vendor_role | Bridge | one row per vendor-project-role assignment | vendor project roles |
| bridge_project_tool_enablement | Bridge | one row per project-tool enablement | project tools |
| bridge_entity_attachment | Bridge | one row per attached file to source object | attachments, file upload associations |
| bridge_inspection_item_observation | Bridge | one row per inspection-item-observation relation | checklist item observations |
| bridge_submittal_approver | Bridge | one row per submittal-approver assignment | submittal approvers |

### Financial facts and snapshots
| Canonical entity | Role | Grain | Primary source families |
|---|---|---|---|
| budget_line_item_current | Fact | one row per project-WBS-line-item current row | budget line items |
| budget_detail_row | Fact | one row per budget detail row | budget details |
| budget_view_row_current | Fact | one row per budget view row in current view | budget view detail rows / summary rows |
| budget_view_row_snapshot | Snapshot | one row per budget view row per snapshot timestamp | budget view snapshots |
| budget_change | Fact | one row per budget change header | budget change summaries |
| budget_change_adjustment | Fact | one row per budget change adjustment line item | budget change adjustment line items |
| change_event | Fact | one row per change event | change events |
| commitment_contract | Fact | one row per commitment contract | commitment contracts |
| commitment_contract_line_item | Fact | one row per commitment line item | commitment contract line items |
| commitment_change_order | Fact | one row per commitment change order | commitment change orders |
| commitment_change_order_line_item | Fact | one row per CCO line item | commitment change order line items |
| subcontractor_invoice | Fact | one row per requisition / subcontractor invoice | requisitions |
| subcontractor_invoice_detail | Fact | one row per invoice contract detail item | requisition detail items |
| direct_cost | Fact | one row per direct cost item | direct costs |
| prime_contract | Fact | one row per prime contract | prime contracts |
| prime_contract_line_item | Fact | one row per prime line item | prime contract line items |
| prime_change_order | Fact | one row per prime change order | prime change orders |
| prime_change_order_line_item | Fact | one row per prime change order line item | prime change order line items |
| owner_invoice | Fact | one row per owner invoice / payment application | payment applications (owner invoices) |
| owner_invoice_line_item | Fact | one row per owner invoice line item | owner invoice line items |
| contract_payment | Fact | one row per payment event | contract payments |
| project_cost_position_snapshot | Snapshot | one row per project-date cost KPI set | derived from budget/commitments/direct costs/invoices |

### Project-management facts
| Canonical entity | Role | Grain | Primary source families |
|---|---|---|---|
| rfi | Fact | one row per RFI | RFIs |
| rfi_reply | Fact | one row per RFI reply/response | replies / responses |
| submittal | Fact | one row per submittal | submittals |
| submittal_response | Fact | one row per submittal response | submittal responses |
| meeting | Fact | one row per meeting | meetings |
| meeting_topic | Fact | one row per meeting topic | meeting topics |
| correspondence_item | Fact | one row per correspondence item | correspondences / generic tool items |
| form_instance | Fact | one row per form | forms |
| workflow_instance | Fact | one row per workflow instance | workflow instances |
| workflow_activity | Fact | one row per workflow activity step/action | workflow activity histories / workflow responses |
| task | Fact | one row per task | tasks |
| schedule_calendar_item | Fact | one row per schedule calendar/lookahead item | schedule legacy resources |
| project_open_item_snapshot | Snapshot | one row per project-date open item stats set | open items |

### Documents and design entities
| Canonical entity | Role | Grain | Primary source families |
|---|---|---|---|
| document_folder | Document metadata | one row per folder | company/project folders and files |
| document_file | Document metadata | one row per file | company/project folders and files / documents |
| document_upload | Document metadata | one row per upload job | direct uploads |
| drawing_area | Dimension | one row per drawing area | drawing areas |
| drawing_set | Dimension | one row per drawing set | drawings |
| drawing | Document metadata | one row per drawing master | drawings |
| drawing_revision | Fact / document metadata | one row per drawing revision | drawing revisions |
| drawing_upload | Document metadata | one row per drawing upload | drawing uploads |
| specification_set | Dimension | one row per spec set | specification sets |
| specification_section | Document metadata | one row per specification section | specification sections |
| specification_revision | Fact / document metadata | one row per spec section revision | specification section revisions |
| email_communication | Fact / document metadata | one row per project email | email communications |

### Quality, safety, and compliance facts
| Canonical entity | Role | Grain | Primary source families |
|---|---|---|---|
| observation | Fact | one row per observation | observations |
| inspection | Fact | one row per inspection/checklist | checklists |
| inspection_item | Fact | one row per checklist item | checklist items |
| incident | Fact | one row per incident | incidents |
| action_plan | Fact | one row per action plan | action plans |
| action_plan_item | Fact | one row per action plan item | action plan items |
| punch_item | Fact | one row per punch item | punch items |
| coordination_issue | Fact | one row per coordination issue | coordination issues |
| coordination_issue_activity | Fact | one row per issue activity event | issue activity feed / change history |
| project_quality_safety_snapshot | Snapshot | one row per project-date KPI set | derived from observations/inspections/incidents/punch/issues |

### Field execution and resource facts
| Canonical entity | Role | Grain | Primary source families |
|---|---|---|---|
| daily_log_header | Fact | one row per project-date daily log header | daily log headers |
| daily_log_segment_event | Fact | one row per segment record | manpower/productivity/weather/DCR/etc. |
| timecard_entry | Fact | one row per labor entry | timecard entries |
| timecard | Fact | one row per timecard header | timecards |
| timesheet | Fact | one row per timesheet | timesheets |
| actual_production_quantity | Fact | one row per production quantity transaction | actual production quantities |
| equipment | Dimension | one row per equipment asset | equipment |
| equipment_project_assignment | Bridge / snapshot | one row per equipment-project relation per effective period | project association |
| equipment_time_entry | Fact | one row per equipment timecard entry | equipment timecard entries |
| equipment_maintenance_event | Fact | one row per maintenance event | equipment maintenance |
| field_productivity_snapshot | Snapshot | one row per project-date-WBS KPI set | derived from timecards/production/daily logs/equipment |

## Recommended optional extensions
- project_template
- project_filter
- project_demo
- telematics_event
- gps_position_event
- document_markup_artifact
- compliance_document_status
- alert
- environmental_action
- property_damage
- admin_equipment_log
- uploaded_binary_manifest
- workflow_template and workflow_manager reference entities
- schedule_metadata helpers
- PDF export job/status entities

## Entities to avoid promoting into first-wave canonical tables
- pure PDF generation status helpers
- narrow UI helper/filter endpoints without durable business content
- transient upload instruction payloads after load completes
- deeply tool-specific configuration resources unless they directly affect analytics or ingestion resilience