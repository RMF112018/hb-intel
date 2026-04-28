# Procore API Surface Inventory for HB Intel Modeling

## Surface map summary
Official Procore developer materials organize the API surface into:
- General resources
- Company-level resources
- Project-level resources

Project-level resources are further described across the primary Procore product lines:
- Core
- Project Management
- Quality and Safety
- Construction Financials

In addition, the current developer navigation and reference inventory show broad coverage across:
- Platform / company administration
- Construction Financials
- Core / project administration
- Project Management
- Quality and Safety
- Documents & Files
- Field / Labor / Equipment / Productivity
- Portfolio / Resource Management / Tasks / Telematics / Workflows

## Company and portfolio / cross-project domains
### Core administration and hierarchy
- Companies
- Projects
- Company Settings
- Company Configurations
- Project Tools
- Project Filters
- Project Templates
- Project Dates
- Open Items
- Project Roles / User Project Roles / Vendor Project Roles

### Directory / organizations / permissions
- Company Users
- Project Users
- Project People
- Project Inactive Users
- Company Vendors
- Project Vendors
- Departments
- Trades
- Distribution Groups
- Company and Project Permission Templates
- Permission Template Assignments
- Project Assignments
- Assignable Users
- Directory filter options

### Configurable schema / extensibility
- Custom Fields
- Custom Field LOV Entries
- Generic Tools
- Generic Tool Items
- Configurable Fieldsets

### WBS and reference data
- Cost Codes
- WBS Attributes
- WBS Attribute Items
- WBS Codes
- Segment Item Lists
- Segment Items
- Patterns
- Sub Jobs

## Financial domains
### Budget and cost structure
- Budget
- Budget Line Items
- Budget Details
- Budget Detail Filters
- Budget Views
- Budget View Detail Rows
- Budget View Summary Rows
- Budget View Snapshots
- Budget Change Summaries
- Budget Change Adjustment Line Items
- Budget Modifications (legacy / migration context)

### Commitments / direct costs / payments
- Commitment Contracts
- Commitment Contract Line Items
- Commitment Contract Summary
- Commitment Change Orders
- Commitment Change Order Line Items
- Commitment Compliance Documents
- Requisitions (Subcontractor Invoices)
- Requisition Contract Detail Items
- Direct Costs
- Contract Payments

### Prime / owner-side financials
- Prime Contracts
- Prime Contract Line Items
- Prime Contract Summary
- Prime Change Orders
- Prime Change Order Batches
- Prime Change Order Line Items
- Payment Applications (Owner Invoices)
- Owner Invoice Line Items
- Owner Invoice Markup Line Items

### Change management
- Change Events
- Budget Changes / Budget Change Summaries
- Commitment Change Orders
- Prime Change Orders

## Project-management and workflow domains
- RFIs
- RFI Replies / Responses / Default Distribution / Filter Options
- Submittals
- Distributed Submittals
- Submittal Approvers
- Submittal Responses
- Submittal Packages
- Meetings
- Meeting Categories
- Meeting Topics
- Correspondence
- Forms
- Workflows (newer company/project workflow surfaces)
- Workflows (legacy instances / activity histories)
- Project links
- Project locations
- Tasks
- Schedule (legacy and schedule metadata / lookahead style surfaces)

## Documents, design, and file domains
- Company Folders and Files
- Project Folders and Files
- Documents (beta v2 project folder/file index)
- Project Documents
- Local Files
- PDF Template Configs
- Direct file uploads
- Secure file access
- Drawings
- Drawing Areas
- Drawing Disciplines
- Document Markup
- Specifications
- Specification Sets
- Specification Sections
- Specification Section Divisions
- Specification Section Revisions
- Specification Uploads
- Email Communications

## Quality, safety, and compliance domains
- Observations
- Observation Types / Templates / Assignees
- Inspections / Checklists
- Checklist Items / Comments / Attachments / Templates / Schedules / References
- Incidents
- Incident configuration and attachments
- Action Plans
- Action Plan Items / Receivers / Verification Methods / Change History
- Punch Items
- Punch Item Assignments / Types / Managers / Templates
- Coordination Issues
- Coordination Issue Statuses / Activity Feed / Change History / Sync / Recycle Bin
- Property Damages
- Environmentals
- Alerts

## Field execution, workforce, and equipment domains
- Daily Log Headers
- Daily Log Counts
- Daily Construction Report Logs
- Weather Logs / Weather Conditions
- Manpower Logs
- Productivity Logs
- Delivery Logs
- Notes Logs
- Accident Logs
- Admin Equipment Logs
- Timesheets
- Timecards
- Timecard Entries
- Actual Production Quantities
- Task Codes (field productivity)
- Timesheet to Budget Configuration
- Equipment
- Equipment Type / Status / Category / Make / Model / Maintenance
- Equipment Timecard Entries
- Project Association (equipment-project association)
- GPS Positions
- Telematics

## Platform and lifecycle considerations that affect modeling
- OAuth 2.0 Authorization Code and Client Credentials support
- DMSA-based client credentials for data connection patterns
- production vs sandbox separation
- REST API lifecycle phases (active / deprecated / sunset)
- pagination headers
- rate limiting
- built-in changelog
- webhooks resources

## High-value domains for first-wave GC analytics
1. Company / Project / User / Vendor / WBS master data
2. Budget / Budget Views / Budget Snapshots / Change Events
3. Commitments / Requisitions / Direct Costs / Prime-side financials
4. RFIs / Submittals / Correspondence / Meetings / Forms
5. Drawings / Specifications / Documents metadata
6. Observations / Inspections / Incidents / Punch / Coordination Issues / Action Plans
7. Daily Logs / Timecard Entries / Actual Production Quantities / Equipment utilization
8. Workflow instances and approval-step lag where workflow use is meaningful

## Domains that are useful but usually secondary in a first wave
- PDF export/status helper resources
- upload orchestration helpers
- UI-only helper/filter resources
- project templates and demos
- some niche environmental or alert resources
- some legacy-only workflow or schedule resources unless the company uses them materially