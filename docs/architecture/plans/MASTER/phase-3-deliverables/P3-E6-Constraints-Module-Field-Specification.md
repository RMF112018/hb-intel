# P3-E6: Constraints Module — Field and Data Model Specification

| Property | Value |
|----------|-------|
| **Doc ID** | P3-E6 |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Document Type** | Module Field Specification |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-22 |
| **Related Contracts** | P3-E1 §3.3, P3-E2 §5, P3-H1 §18.5 |
| **Source Examples** | docs/reference/example/ |

---

## Purpose

This specification defines the complete data model, field definitions, status enumerations, business rules, and required workflows for the Constraints module implementation. Every field listed here **MUST** be implemented. A developer reading this specification must have no ambiguity about what to build.

This document is grounded in operational project ledger management, risk tracking, and schedule/cost impact analysis. The Constraints module is the source-of-truth for project impediments, change tracking, and delay logging. It publishes operational ledger data as immutable records while supporting executive review and team oversight through an annotation-only boundary (no mutations to ledger records).

### Source Files

- `constraints.json` — Operational constraints ledger (primary data model)
- `HB_ConstraintsLog_Template.xlsx` — Change entry tracking and checklist
- `Project Delay Log_2025.csv` — Delay tracking and impact analysis
- `docs/reference/example/` — Reference templates and sample data

---

## 1. Constraint Record Model (Primary Ledger)

The Constraint Record is the fundamental unit of the Constraints module. Each record represents a single identified constraint, impediment, or risk that affects project execution. Records are immutable at creation (id, no, category, dateIdentified); most other fields are PM-editable with provenance tracking.

### 1.1 Complete Constraint Field Table

| Field Name (camelCase) | TypeScript Type | Required | Calculated | Immutable | Source | Business Rule |
|------------------------|-----------------|----------|------------|-----------|--------|---------------|
| id | `string` | Yes | Yes | Yes | — | UUID; primary key, immutable after creation; stable identifier |
| projectId | `string` | Yes | No | Yes | constraints.json | FK to project; immutable after creation |
| no | `string` | Yes | No | Yes | constraints.json | Formatted number (e.g., "28.1"); human-readable reference; immutable; format: [categoryNumber].[sequentialIndex] |
| category | `enum` | Yes | No | Yes | constraints.json | 36 values (§1.3); immutable; cannot change after creation |
| description | `string` | Yes | No | No | constraints.json | Constraint narrative, 50-200 characters; describes the impediment clearly; may be edited for clarification |
| dateIdentified | `date` | Yes | No | Yes | constraints.json | ISO 8601 date; immutable after creation; day constraint was first identified |
| daysElapsed | `integer` | Yes | Yes | No | — | **Calculated**: `today - dateIdentified`; read-only; network/working days from identification to today |
| reference | `string` | No | No | No | constraints.json | Format [PREFIX]-### (e.g., "RISK-001", "CO-042"); optional; human-readable external reference; may be edited |
| closureDocument | `string` | No | No | No | constraints.json | URI to supporting documentation (PDF, email, memo); optional; may be empty string; updated before closure |
| assigned | `string` | Yes | No | No | constraints.json | Responsible person name (e.g., "John Smith", "Sarah Johnson"); person accountable for constraint resolution; may be reassigned |
| bic | `enum` | Yes | No | No | constraints.json | Business Integrity Champion team; 32 values (§1.4); team owning constraint area; may be reassigned |
| dueDate | `date` | Yes | No | No | constraints.json | ISO 8601 date; must be ≥ `dateIdentified`; target resolution date; PM-editable; may extend if constraint unresolved |
| completionStatus | `enum` | Yes | No | No | constraints.json | Enum: `Identified` \| `In Progress` \| `Pending` \| `Closed`; primary status field; one-directional (Identified → In Progress → Pending → Closed); no backwards transitions |
| dateClosed | `date` | No | No | No | constraints.json | ISO 8601 date; only populated when `completionStatus = "Closed"`; immutable after set; null otherwise; marks constraint resolved |
| comments | `string` | No | No | No | constraints.json | Running notes, append-only; optional; PM adds notes as constraint evolves; running narrative of actions, decisions, and learnings |

### 1.2 Constraint Import and Lifecycle

**Constraint Identification Workflow:**
1. PM identifies constraint during project kickoff, risk planning, or ongoing execution
2. PM creates constraint record via UI:
   - Selects `category` from 36-value enum
   - Enters `description` (50-200 chars)
   - Selects or accepts `assigned` person
   - Selects or defaults `bic` (Business Integrity Champion team)
   - Sets `dueDate` (≥ today)
3. System generates:
   - `id` = UUID
   - `no` = format [categoryNumber].[sequentialIndex] (e.g., category RISK_MANAGEMENT = 28 → "28.1", "28.2", etc.)
   - `dateIdentified` = today
   - `daysElapsed` = 0
4. Constraint created with `completionStatus = "Identified"`

**Status Transition Rules:**
- **Identified → In Progress**: PM marks constraint as being actively worked (e.g., "Permit application submitted")
- **In Progress → Pending**: Constraint resolution awaiting external event (e.g., "Permit approval pending; waiting for city response")
- **Pending → Closed**: External event resolved; constraint closure document attached; `dateClosed` set; immutable thereafter
- **No backwards transitions**: once state advances, cannot revert (e.g., cannot move from `In Progress` back to `Identified`)

### 1.3 Category Enumeration (36 Values)

| Category | Code | Description | Example |
|----------|------|-------------|---------|
| DESIGN | 01 | Design-related constraints | Redesign required; clashes discovered |
| PERMITS | 02 | Permit and approval constraints | Building permit pending; sign-off delayed |
| PROCUREMENT | 03 | Material sourcing and procurement | Long lead-time equipment; supply chain shortage |
| LABOR | 04 | Labor availability and staffing | Subcontractor labor shortage; crew unavailable |
| WEATHER | 05 | Weather and environmental constraints | Winter shutdown; extreme weather event |
| OTHER | 06 | Miscellaneous constraints | Unclassified impediment |
| SAFETY | 07 | Safety and health concerns | Safety incident; hazard identified |
| QUALITY | 08 | Quality and defect management | Quality issue identified; rework required |
| SCHEDULE | 09 | Schedule and sequencing constraints | Activity delay; critical path impacted |
| COST | 10 | Budget and financial constraints | Cost overrun; budget unavailable |
| ENVIRONMENTAL | 11 | Environmental compliance and remediation | Environmental remediation; contamination |
| EQUIPMENT | 12 | Equipment availability and performance | Equipment failure; crane unavailable |
| COMMUNICATION | 13 | Communication and coordination issues | Stakeholder misalignment; information gap |
| SITE_ACCESS | 14 | Site access and logistics constraints | Street closure; site access restricted |
| UTILITIES | 15 | Utility conflicts and relocations | Utility line conflict; relocation required |
| GEOTECHNICAL | 16 | Geotechnical and soil conditions | Unexpected soil conditions; boring results |
| LEGAL | 17 | Legal and contractual constraints | Contract dispute; legal review required |
| TECHNOLOGY | 18 | Technology and system constraints | Software issue; IT constraint |
| SECURITY | 19 | Security and access constraints | Security incident; access control issue |
| SUBCONTRACTOR | 20 | Subcontractor performance and issues | Subcontractor delay; performance issue |
| INSPECTIONS | 21 | Inspection and testing constraints | Inspection failed; testing required |
| LOGISTICS | 22 | Material delivery and logistics | Delivery delayed; logistics bottleneck |
| STAKEHOLDER | 23 | Stakeholder coordination and approvals | Owner approval pending; stakeholder alignment |
| TESTING | 24 | Testing and commissioning constraints | Testing failed; commissioning delay |
| COMMISSIONING | 25 | System commissioning and startup | Commissioning issue; startup delay |
| REGULATORY | 26 | Regulatory compliance and violations | Code violation; regulatory compliance |
| DOCUMENTATION | 27 | Documentation and record-keeping | Document missing; record incomplete |
| RISK_MANAGEMENT | 28 | Risk management and mitigation | Risk identified; mitigation needed |
| TRAINING | 29 | Training and qualification constraints | Training required; certification needed |
| DEMOLITION | 30 | Demolition and site clearance | Demolition constraint; asbestos found |
| SUSTAINABILITY | 31 | Sustainability and green requirements | LEED requirement; sustainability goal |
| TEMPORARY_FACILITIES | 32 | Temporary site facilities and infrastructure | Temporary power issue; facility shortage |
| CHANGE_MANAGEMENT | 33 | Change management and control | Change order needed; scope change |
| PUBLIC_WORKS | 34 | Public works and infrastructure impacts | Public coordination; infrastructure impact |
| OWNER_REQUIREMENTS | 35 | Owner-specified requirements and mandates | Owner directive; special requirement |
| VENDOR_PERFORMANCE | 36 | Vendor performance and reliability | Vendor delay; vendor performance issue |

### 1.4 Business Integrity Champion (BIC) Team Enumeration (32 Values)

| BIC Team | Description | Responsible For |
|----------|-------------|-----------------|
| Change Management | Change control and scope management | Change order workflows; scope control |
| Commissioning Team | System commissioning and startup | Commissioning plans; testing protocols |
| Demolition Team | Demolition and site clearance | Demo sequences; hazmat; waste management |
| Design Team | Design and engineering | Design changes; coordination; CAD |
| Document Control | Documentation and records | Records management; document archive |
| Environmental Team | Environmental compliance | Remediation; contamination; compliance |
| Equipment Team | Equipment management and deployment | Equipment scheduling; maintenance |
| Field Team | Field operations and execution | Daily operations; workforce management |
| Finance Team | Financial management and budgets | Budget tracking; cost control |
| Geotechnical Team | Soil and foundation engineering | Boring; soil testing; foundation design |
| HR Team | Human resources and staffing | Payroll; staffing; labor relations |
| IT Team | Information technology and systems | Systems; software; infrastructure |
| Inspection Team | Quality inspection and testing | Inspections; testing; quality control |
| Legal Team | Legal and contractual matters | Contracts; disputes; legal review |
| Logistics Team | Material delivery and logistics | Procurement; delivery; warehousing |
| Owner Relations | Owner coordination and interface | Owner meetings; approvals; interface |
| Permits Team | Permitting and regulatory approvals | Permits; approvals; regulatory submissions |
| Procurement Team | Material sourcing and purchasing | Purchasing; supplier management; buyout |
| Project Management | Project controls and oversight | Schedule; budget; integrated controls |
| Public Works Team | Public infrastructure coordination | Public coordination; utility relocation |
| QA/QC Team | Quality assurance and control | Quality standards; testing; verification |
| Regulatory Team | Regulatory compliance and enforcement | Code compliance; inspections; permits |
| Risk Team | Risk management and mitigation | Risk planning; mitigation; contingency |
| Safety Team | Safety management and compliance | Safety protocols; incident response |
| Scheduling Team | Schedule development and control | CPM schedule; critical path; sequencing |
| Security Team | Site security and access control | Access control; security protocols |
| Stakeholder Relations | Stakeholder communication and coordination | Meetings; communication; alignment |
| Subcontractor Management | Subcontractor oversight and performance | Subcontract management; performance |
| Sustainability Team | Sustainability and green initiatives | LEED; green building; sustainability goals |
| Testing Team | Testing and commissioning | Testing protocols; commissioning plans |
| Training Team | Training and qualifications | Training programs; certifications |
| Utilities Team | Utility coordination and conflicts | Utility locates; conflicts; relocations |

---

## 2. Change Tracking Sub-Ledger (Change Entry Records)

Change Tracking records parallel the Constraints module and represent change control orders (COs), change entry documentation, and management approvals. Each Change Entry is linked to zero or more Constraint records (relationship is N:M).

### 2.1 Change Entry Field Table

| Field Name (camelCase) | TypeScript Type | Required | Calculated | Source | Business Rule |
|------------------------|-----------------|----------|------------|--------|---------------|
| changeId | `string` | Yes | Yes | — | UUID; primary key; stable identifier |
| projectId | `string` | Yes | No | change log | FK to project |
| ceNumber | `string` | Yes | No | change log | Change entry number (e.g., "CE-001", "CE-042"); human-readable; format: `CE-[###]` |
| ceDescription | `string` | Yes | No | change log | Description of change (e.g., "Foundation elevation increase due to site survey"); 100-500 chars |
| dateIdentified | `date` | Yes | No | change log | ISO 8601 date; date change was first identified |
| status | `enum` | Yes | No | change log | Enum: `Identified` \| `In Progress` \| `Approved` \| `Closed`; mirrors constraint status but includes `Approved` |
| reason | `string` | No | No | change log | Reason for change (e.g., "Site condition discovered"; "Design clarification"; "Owner request"); optional |
| origin | `string` | No | No | change log | Source of change (e.g., "Site Inspection", "Design Review", "Owner Directive", "Subcontractor Request"); optional |
| coTotal | `number` | Yes | No | change log | Change order financial impact in USD; may be positive (cost increase) or negative (credit); decimal to 2 places |
| coDate | `date` | No | No | change log | ISO 8601 date; date change order was approved/issued; null if not yet approved |
| coStatus | `string` | No | No | change log | CO approval status (e.g., "Pending", "Approved", "Issued", "Invoiced"); optional narrative field |
| scheduleImpactDays | `integer` | No | No | change log | Schedule impact in days; positive = delay; negative = acceleration; null if no schedule impact |
| comments | `string` | No | No | change log | Running notes; optional; append-only narrative |
| linkedConstraintIds | `string[]` | No | No | — | Array of constraint `id` values linked to this change entry; N:M relationship; may be empty |

### 2.2 Change Entry Workflow

**Change Entry Creation:**
1. PM or team member identifies change
2. PM creates Change Entry record:
   - Enters `ceDescription` (100-500 chars)
   - Selects or enters `reason` (e.g., "Site condition")
   - Selects or enters `origin` (e.g., "Site Inspection")
   - Estimates or leaves blank `coTotal` and `scheduleImpactDays`
3. System generates:
   - `changeId` = UUID
   - `ceNumber` = format `CE-[###]` (auto-incrementing)
   - `dateIdentified` = today
   - `status` = `Identified`
4. PM may optionally link to one or more existing Constraints

**Status Progression:**
- **Identified → In Progress**: Change is being quantified and estimated
- **In Progress → Approved**: Change order approved by PM/PE; `coDate` set; `coTotal` finalized
- **Approved → Closed**: Change order issued and recorded; work executed or cost absorbed
- **No backwards transitions**: same rule as constraints

---

## 3. Delay Log Sub-Ledger (Delay Record Model)

Delay Log records track project delays, their duration, cause, critical path impact, and financial consequences. Each delay entry cross-references a schedule activity and may be linked to one or more constraints.

### 3.1 Delay Log Field Table

| Field Name (camelCase) | TypeScript Type | Required | Calculated | Source | Business Rule |
|------------------------|-----------------|----------|------------|--------|---------------|
| delayId | `string` | Yes | Yes | — | UUID; primary key; stable identifier |
| projectId | `string` | Yes | No | delay log | FK to project |
| pccoNumber | `string` | Yes | No | delay log | Project Change Control Order number; format `PCCO-###` (e.g., "PCCO-001"); links to Change Tracking if applicable; may cross-reference constraint change orders |
| affectedTask | `string` | Yes | No | delay log | Schedule activity name (e.g., "Foundation Concrete", "MEP Rough-In"); reference to Schedule module activity |
| criticalPathImpact | `enum` | Yes | No | delay log | Enum: `Yes` \| `No`; whether delay affects project completion date |
| potentialCostImpact | `number` | No | No | delay log | Estimated or actual cost impact in USD; positive = cost increase; optional; may be null |
| expectedDelayDuration | `integer` | Yes | No | delay log | Expected or actual delay duration in calendar days; positive integer; > 0 |
| originalActivityStart | `date` | Yes | No | delay log | ISO 8601 date; original baseline or planned start of affected activity |
| delayStart | `date` | Yes | No | delay log | ISO 8601 date; date delay commenced; must be ≥ `originalActivityStart`; marks when activity fell behind |
| notificationDate | `date` | Yes | No | delay log | ISO 8601 date; date delay was formally notified to owner per contract terms; must be ≥ `delayStart` |
| notes | `string` | No | No | delay log | Optional notes; root cause analysis, mitigation strategy, recovery plan; may be extensive |
| linkedConstraintIds | `string[]` | No | No | — | Array of constraint `id` values linked to delay; may be empty if delay is schedule-driven vs. constraint-driven |
| linkedChangeIds | `string[]` | No | No | — | Array of Change Entry `changeId` values linked to delay; may be empty |

### 3.2 Delay Entry Validation Rules

**Chronological Rules:**
- `originalActivityStart` ≤ `delayStart` ≤ `notificationDate`
- `expectedDelayDuration` must be > 0
- `notificationDate` must be ≤ today (delay cannot be notified before it occurred)

**Data Integrity:**
- `affectedTask` must match a valid activity code or name from Schedule module (optional strict match; PM may enter free-form name)
- `pccoNumber` may or may not exist in Change Tracking (relationship is optional; delay may not have corresponding CO)
- `criticalPathImpact` determined by Schedule module analysis (PM may override if manual milestone tracking)

---

## 4. Constraint-to-Item Relationships

The Constraints module supports linking constraints to related items in other modules (schedule activities, budget lines, permit records). These relationships are **read-only** references within Constraints module; mutations occur at the target module (e.g., Schedule, Financial).

### 4.1 Related Items Linkage

A Constraint record may have relationships to:

| Target Module | Field | Type | Relationship | Cardinality |
|---------------|-------|------|--------------|-------------|
| Schedule | `affectedActivityCodes` | string[] | Constraint affects schedule activities | 0..N |
| Financial | `affectedBudgetLines` | string[] | Constraint impacts budget lines (cost or schedule) | 0..N |
| Permits | `relatedPermitIds` | string[] | Constraint relates to permit application or approval | 0..N |
| Change Management | `linkedChangeIds` | string[] | Constraint linked to change orders | 0..N |

**Implementation Rule:** Related items are **displayed** in Constraints module UI but not **edited**. Links are established at constraint creation or via separate "Link" action. Mutations to related items happen in their native modules.

---

## 5. Data Validation Rules

### 5.1 Constraint Record Validation

**On Creation:**
- `category` must be one of 36 enum values
- `description` length: 50-200 characters (system enforces min/max)
- `assigned` person name non-empty string
- `bic` must be one of 32 enum values
- `dueDate` ≥ `dateIdentified` (today if just created)

**On Status Change:**
- Status transitions follow one-directional flow: Identified → In Progress → Pending → Closed
- `completionStatus = "Closed"` requires `dateClosed` to be set before transition
- `dateClosed` must be ≥ `dateIdentified` (constraint closed after identified)
- Backwards transitions rejected with error: "Status transitions are one-directional. Cannot move from [current] to [prior]."

**On Edit:**
- Only editable fields: `description`, `reference`, `closureDocument`, `assigned`, `bic`, `dueDate`, `comments`
- `id`, `no`, `category`, `dateIdentified` are immutable after creation
- Edit creates audit trail: `lastEditedBy`, `lastEditedAt` recorded

### 5.2 Change Entry Validation

**On Creation:**
- `ceDescription` length: 100-500 characters
- `dateIdentified` valid ISO 8601 date
- `status` one of: `Identified`, `In Progress`, `Approved`, `Closed`

**On Approval:**
- `coTotal` must be numeric (USD); may be positive or negative; to 2 decimal places
- `coDate` must be set before approval
- `scheduleImpactDays` if provided, must be integer (positive or negative)

**On Link to Constraint:**
- Constraint `id` must exist in Constraints module
- Same constraint may be linked to multiple changes (N:M allowed)

### 5.3 Delay Entry Validation

**On Creation:**
- All date fields valid ISO 8601 format
- `originalActivityStart` ≤ `delayStart` ≤ `notificationDate`
- `expectedDelayDuration` positive integer > 0
- `affectedTask` non-empty string (schedule activity name or code)
- `pccoNumber` format optional; if provided, format `PCCO-###`
- `criticalPathImpact` one of: `Yes`, `No`

**On Link to Constraint:**
- Constraint `id` must exist
- Constraint `dateIdentified` ≤ delay `delayStart` (constraint identified before delay started)

---

## 6. Calculated Fields and Metrics

### 6.1 Constraint-Level Metrics

**daysElapsed:**
- Formula: `today - dateIdentified` (working/network days)
- Updated: Daily
- Purpose: Tracks how long constraint has been open; used for escalation and SLA monitoring
- Display: Count of business days; updated automatically in UI

**Overdue Detection:**
- Rule: If `completionStatus != "Closed"` AND `dueDate < today`, constraint is overdue
- Action: Overdue constraints flagged in red on canvas and work queue
- SLA: Overdue constraints > 30 days trigger escalation notification

### 6.2 Project-Level Summary Metrics

**Open Constraint Count:**
- Calculation: Count of records where `completionStatus in ("Identified", "In Progress", "Pending")`
- Published to Health spine
- Used for dashboard summary

**Overdue Constraint Count:**
- Calculation: Count of open constraints where `dueDate < today`
- Published to Health spine and Work Queue
- Triggers escalation workflow

**Constraint by Category Distribution:**
- Calculation: Count constraints grouped by `category`
- Display: Pie chart or bar chart on canvas
- Purpose: Risk distribution visibility

**Constraint Age Distribution:**
- Calculation: Bucket constraints by `daysElapsed`: <7, 7-14, 14-30, 30-60, >60 days
- Display: Histogram or trend chart
- Purpose: Identify stale constraints needing closure

---

## 7. Business Rules

### 7.1 Constraint Lifecycle Rules

**Rule 1: Immutability of Creation Data**
- Once a constraint is created (`completionStatus = "Identified"`), these fields are immutable:
  - `id`, `no`, `category`, `dateIdentified`, `projectId`
- Reason: Audit trail; constraint identity and origin are permanent

**Rule 2: One-Directional Status Transitions**
- Status progression: Identified → In Progress → Pending → Closed
- No backwards movement (e.g., cannot return from `Closed` to `Pending`)
- System enforces via state machine; UI disables invalid transitions
- Rationale: Prevents accidental regression; maintains audit integrity

**Rule 3: Closure Documentation Requirement**
- When PM marks constraint `completionStatus = "Closed"`, system enforces:
  - `dateClosed` must be set (immutable timestamp)
  - `closureDocument` should be populated (strongly encouraged, not required)
  - `comments` should document resolution (recommended)
- Validation: System permits closure without document but logs warning if document missing

**Rule 4: Assigned Accountability**
- Every constraint must have an `assigned` person at all times
- If assignee leaves project or changes role, PM must reassign before closure
- System allows reassignment at any time; creates audit trail with `lastEditedBy`

**Rule 5: BIC Ownership**
- Constraint `bic` (Business Integrity Champion team) may be reassigned
- Reason: Team ownership changes as constraint evolves or expertise shifts
- Reassignment creates audit event logged to Activity spine

### 7.2 Change Entry Rules

**Rule 1: Change Order Workflow**
- Change entries follow approval workflow: Identified → In Progress → Approved → Closed
- `coTotal` must be finalized before `Approved` status
- `coDate` immutable once set
- No change order cost reversals; only forward progress or cancellation (soft delete via `Void` status if needed)

**Rule 2: Scheduling Impact Disclosure**
- Any change with `scheduleImpactDays != 0` must have corresponding Schedule module activity impact
- PM must create or update forecast override in Schedule module if schedule impact exists
- Constraint system links change to schedule override for traceability

**Rule 3: Linked Constraint Accounting**
- Change entry may be linked to multiple constraints
- Each link creates an audit record
- Unlinking is allowed; audit trail preserved

### 7.3 Delay Log Rules

**Rule 1: Critical Path Escalation**
- If delay `criticalPathImpact = "Yes"`, Work Queue item created immediately
- Delay with critical impact must be notified to owner within 24 hours per contract
- `notificationDate` ≤ `delayStart + 1 day` for critical path delays

**Rule 2: Cost Impact Tracking**
- Delay `potentialCostImpact` optional but encouraged
- If cost impact estimated, change order or claim record created in Financial module
- Delay and cost impact linked for traceability

**Rule 3: Activity Accountability**
- Every delay must reference an actual Schedule module activity
- `affectedTask` field cross-validated against active schedule
- System warns if activity no longer exists in schedule (activity deleted/superseded)

---

## 8. Constraint Status and Workflow States

### 8.1 Constraint Status Enumeration

| Status | Meaning | Triggers | Typical Duration |
|--------|---------|----------|------------------|
| `Identified` | Constraint detected; initial state | Issue discovered during planning or execution | Days to weeks |
| `In Progress` | Constraint being actively resolved | PM assigns resources; mitigation work begins | Weeks to months |
| `Pending` | Resolution awaiting external event | Waiting for permit approval; supplier delivery | Days to weeks |
| `Closed` | Constraint resolved; `dateClosed` set | Issue resolved; documentation attached | Terminal state |

### 8.2 Constraint Status Calculation (if calculated vs. stored)

**Implementation Note:** `completionStatus` is **stored** (not calculated). PM explicitly transitions status via UI. System enforces transition rules and requires closure documentation.

---

## 9. Module Capabilities and Workflows

### 9.1 Constraint List and Filtering

**Capability:** PM views all project constraints organized by status, category, BIC team, assignment, and age

**Specification:**
- Table view: columns include `no`, `category`, `description`, `assigned`, `bic`, `dateIdentified`, `daysElapsed`, `dueDate`, `completionStatus`
- Filter by: `category`, `completionStatus`, `assigned`, `bic`, `daysElapsed` (age buckets), `dueDate` (overdue)
- Sort by: `daysElapsed` (descending), `dueDate`, `dateIdentified`, `category`, `completionStatus`
- Search: free-text search on `no`, `description`, `assigned`, `reference`
- Color coding: Overdue = red; At Risk (due < 7 days) = yellow; On Track = green; Closed = gray
- Quick stats at top: "Total Open: 12 | Overdue: 2 | At Risk: 4 | Closed: 23"

### 9.2 Constraint Creation and Editing

**Capability:** PM creates new constraint or edits existing open constraint

**Specification:**
- Form fields (create):
  - `category` (required, enum dropdown)
  - `description` (required, 50-200 chars; real-time validation)
  - `assigned` (required, autocomplete or user select)
  - `bic` (required, enum dropdown)
  - `dueDate` (required, date picker; enforced ≥ today)
  - `reference` (optional, text)
  - `closureDocument` (optional, file upload or URL)
  - `comments` (optional, multi-line text)
- Form validation: All required fields must be non-empty before save
- On save: System generates `id`, `no`, `dateIdentified`; creates initial Activity spine event
- Edit (open constraints only):
  - Only editable fields changeable via form
  - `id`, `no`, `category`, `dateIdentified` immutable (grayed out, read-only)
  - Edit creates `lastEditedBy`, `lastEditedAt` audit trail
  - Comments appended with timestamp and author

### 9.3 Status Transition Workflow

**Capability:** PM transitions constraint through status lifecycle with validation and documentation

**Specification:**
- UI button: "Change Status" appears only if valid transitions available
- Dialog: shows current status and available next states
- Rules enforced:
  - Transition from `Identified` → `In Progress`: no special requirement; immediate
  - Transition to `Pending`: optional reason field ("Waiting for permit approval")
  - Transition to `Closed`: **required** `dateClosed` field + **strongly recommended** `closureDocument` + explanatory note
  - System displays validation errors if requirements not met (e.g., "Cannot close without closure document attached")
- Confirmation: System shows impact (e.g., "Closing will remove this from 'Overdue' alerts")
- On transition: Activity spine event logged with transition details and author

### 9.4 Change Entry Management

**Capability:** PM creates and tracks change entry records; links to constraints

**Specification:**
- Form (create):
  - `ceDescription` (required, 100-500 chars)
  - `reason` (optional, dropdown or text)
  - `origin` (optional, dropdown or text)
  - `coTotal` (optional initially; required on approval)
  - `scheduleImpactDays` (optional, integer)
  - `comments` (optional)
- Link to constraints: "Link Constraint" button → modal to select existing constraints by `no` or description
- Status workflow: same as constraints (Identified → In Progress → Approved → Closed)
- Approval action: When transitioning to `Approved`, system enforces `coTotal` and `coDate` populated
- CSV export: "Export Change Log" button exports all change entries as CSV with all fields

### 9.5 Delay Log Management

**Capability:** PM tracks project delays with critical path impact analysis and cost exposure

**Specification:**
- Form (create):
  - `affectedTask` (required, autocomplete from Schedule module activities)
  - `criticalPathImpact` (required, enum: Yes/No)
  - `originalActivityStart` (required, date)
  - `delayStart` (required, date; enforced ≥ originalActivityStart)
  - `notificationDate` (required, date)
  - `expectedDelayDuration` (required, positive integer days)
  - `potentialCostImpact` (optional, USD)
  - `notes` (optional, rich text)
- Link to constraints: "Link Constraints" button → multi-select modal for 0..N constraints
- Link to changes: "Link Changes" button → multi-select modal for 0..N change entries
- Critical path filter: "Show critical path delays only" → displays only records where `criticalPathImpact = Yes`
- Export: "Export Delay Log" button → CSV with all fields and related constraint/change IDs

### 9.6 Related Items Linkage

**Capability:** PM associates constraints with affected schedule activities, budget lines, permits

**Specification:**
- "Link Related Items" action on constraint detail view
- Modal with tabs:
  - **Schedule Activities**: Autocomplete search for activity names/codes; multi-select; shows criticality and dates
  - **Budget Lines**: Multi-select from budget line descriptions; shows original and revised budget
  - **Permits**: Multi-select from permit records (if Permits module exists)
  - **Change Orders**: Link to existing change entries
- Display: Related items shown on constraint detail card with count and mini list
- Removal: Click "x" on related item to unlink; audit trail created

### 9.7 Annotation and Review Layer

**Capability:** Executive stakeholders (PE, CFO, Sponsor) annotate constraints with questions, concerns, or approvals

**Specification:**
- Annotation targets:
  - Constraint record as a whole
  - Specific field values (e.g., `dueDate`, `assigned`, `description`)
  - Status transitions and closure documentation
- Annotation interface: Sidebar or comment thread UI (non-intrusive)
- Annotation fields:
  - `annotatedBy` (PE user)
  - `annotatedAt` (timestamp)
  - `targetConstraintId` (FK)
  - `comment` (text, e.g., "Query: Has mitigation been discussed with subcontractor?")
  - `reply` (optional, PM response)
- Storage: Annotations stored exclusively in `@hbc/field-annotations` artifact; **never** written to Constraints module records
- Display: Annotations visible only to authorized users; not printed on external reports

### 9.8 Export and Reporting

**Capability:** Export constraint, change, and delay data as CSV or PDF summaries

**Specification:**
- **Constraint List CSV**: All active and closed constraints; columns: `no`, `category`, `description`, `assigned`, `bic`, `dateIdentified`, `daysElapsed`, `dueDate`, `completionStatus`, `dateClosed`
- **Change Log CSV**: All change entries; columns: `ceNumber`, `ceDescription`, `reason`, `origin`, `coTotal`, `coDate`, `scheduleImpactDays`, `status`
- **Delay Log CSV**: All delays; columns: `pccoNumber`, `affectedTask`, `criticalPathImpact`, `potentialCostImpact`, `expectedDelayDuration`, `delayStart`, `notificationDate`
- **Summary PDF Report**: One-page or multi-page PDF with:
  - Cover page (project name, date, PM name)
  - Constraints summary section: open count, overdue count, by category breakdown, by BIC team breakdown
  - Change summary: total change orders, net impact (cost and schedule)
  - Delay summary: critical path delays, total delay days, cost impact
  - Charts: constraint age distribution, category pie chart, status counts
  - Attestation: "This report generated [date] and represents current state as of [datetime]"

### 9.9 Spine Publication

**Capability:** All constraint changes trigger spine events per P3-A3

**Specification:**
- **Activity spine**: Log events for constraint creation, status change, closure, reassignment
- **Health spine**: Publish current open constraint count, overdue count, by-category counts, max daysElapsed
- **Work Queue**: Overdue constraints → work queue items; critical path delays → escalation items; pending changes → approval items
- **Related Items spine**: Constraints linked to schedule activities, budget lines, permits

---

## 10. Spine Publication Events

The Constraints module publishes structured events to the project's spines per P3-A3.

### 10.1 Activity Spine Events

| Event | Trigger | Payload | Purpose |
|-------|---------|---------|---------|
| `ConstraintCreated` | PM creates constraint | `{ id, no, category, projectId, assigned, bic, createdAt, createdBy }` | Log constraint identification |
| `ConstraintStatusChanged` | PM transitions status | `{ id, no, projectId, priorStatus, newStatus, changedAt, changedBy }` | Track lifecycle transitions |
| `ConstraintClosed` | PM marks `Closed` | `{ id, no, projectId, dateClosed, closureDocUri, closedBy }` | Record closure and documentation |
| `ConstraintReassigned` | PM reassigns `assigned` or `bic` | `{ id, no, projectId, priorAssigned, newAssigned, reassignedAt }` | Track ownership changes |
| `ChangeEntryCreated` | PM creates change entry | `{ changeId, ceNumber, projectId, coTotal, scheduleImpactDays, createdAt }` | Log change identification |
| `ChangeApproved` | PM approves change entry | `{ changeId, ceNumber, projectId, coTotal, coDate, approvedBy, approvedAt }` | Record change approval |
| `DelayLogged` | PM creates delay record | `{ delayId, pccoNumber, projectId, affectedTask, criticalPathImpact, delayDuration, loggedAt }` | Log schedule delay |

### 10.2 Health Spine Metrics

| Metric | Type | Updated | Purpose |
|--------|------|---------|---------|
| `openConstraintCount` | integer | On constraint creation/closure | Primary constraint health indicator |
| `overdueConstraintCount` | integer | Daily (or on constraint edit) | Escalation trigger; overdue >= 30 days |
| `constraintCountByCategory` | object (map) | On constraint change | Risk distribution visibility; enables prioritization |
| `maxConstraintDaysElapsed` | integer | On constraint creation/closure | Identifies stale, long-open constraints |
| `criticalPathDelayCount` | integer | On delay log entry | Schedule risk indicator |
| `totalPendingChangeOrderValue` | number (USD) | On change entry approval | Financial risk; pending commitments |
| `constraintToScheduleActivityLinkCount` | integer | On link/unlink | Traceability metric |

### 10.3 Work Queue Items

| Item Type | Condition | Actionable |
|-----------|-----------|-----------|
| `ConstraintOverdue` | Constraint `daysElapsed > 30` and `completionStatus != "Closed"` | PM reviews and closes or extends dueDate |
| `ConstraintAtRisk` | Constraint `dueDate < today + 7 days` | PM accelerates resolution |
| `CriticalPathDelay` | Delay `criticalPathImpact = Yes` | PM/PE initiates recovery plan meeting |
| `ChangeApprovalPending` | Change `status = "In Progress"` for > 7 days | PM moves to approval |
| `ConstraintClosureMissing` | Constraint transitioned to `Closed` without `closureDocument` | PM uploads documentation |

---

## 11. Executive Review Annotation Boundary

Per P3-E1 §9 and P3-E2 §5.4, the Constraints module is review-capable. Annotations are stored in `@hbc/field-annotations` and do not mutate Constraints records.

### 11.1 Annotation Targets

PER (Project Executive Review) annotations may be placed on:
- Constraint record as a whole (e.g., "This constraint is critical to project success")
- Constraint fields: `description`, `dueDate`, `assigned`, `bic`, `completionStatus`
- Change entry records: `coTotal`, `scheduleImpactDays`, `status`
- Delay records: `criticalPathImpact`, `expectedDelayDuration`, `potentialCostImpact`
- Overall constraints summary and risk dashboard

### 11.2 Annotation Restrictions

**From P3-E2 §11.2:**
- All annotations stored exclusively in `@hbc/field-annotations`; no annotation data written to Constraints module records
- No annotation may trigger a constraint edit, status change, or validation override
- PM draft edits or unsaved changes are NEVER visible to PER
- PER reviews only published and confirmed constraint snapshots
- Annotation display: non-intrusive sidebar or comment thread; does not obscure data
- PER may flag concerns but has no authority to edit constraints; PM retains all write authority

### 11.3 Annotation Workflow

1. PE/CFO/Sponsor views Constraints module dashboard or detail view
2. PER clicks "Annotate" on a constraint or field
3. PER enters comment (e.g., "Question: Is the assigned person equipped to resolve this scope change?")
4. Annotation saved to `@hbc/field-annotations` with `annotatedBy`, `annotatedAt`, `targetConstraintId`, `comment`
5. PM notified of annotation (via notification or Work Queue)
6. PM may reply inline or acknowledge via separate meeting
7. Annotations are persisted for audit/compliance; visible only to authorized stakeholders

---

## 12. Acceptance Gate Reference

The Constraints Module delivery is subject to Acceptance Gate §18.5 "Constraints Items" from P3-H1 (Acceptance Gates and Delivery Criteria).

**Gate §18.5 Constraints Module Criteria:**
- [ ] All 14 constraint fields (§1.1) fully implemented and typed
- [ ] Constraint CRUD (create, read, update, delete if `Identified` + no links) working
- [ ] Immutability of creation fields (`id`, `no`, `category`, `dateIdentified`) enforced
- [ ] One-directional status transitions (Identified → In Progress → Pending → Closed) enforced
- [ ] `daysElapsed` calculated and updated daily (or on load)
- [ ] Category enumeration (36 values) fully implemented
- [ ] BIC enumeration (32 values) fully implemented
- [ ] Change Entry model (§2) fully implemented with workflow
- [ ] Delay Log model (§3) fully implemented with critical path tracking
- [ ] Related items linkage (§4) to schedule activities, budget lines, permits
- [ ] Constraint list filtering and sorting (§9.1) working
- [ ] Status transition workflow (§9.3) with documentation enforcement
- [ ] Change entry management (§9.4) with approval workflow
- [ ] Delay log management (§9.5) with impact analysis
- [ ] Export (§9.8) to CSV and PDF working
- [ ] Spine events (§10) published correctly
- [ ] Annotation layer (§11) integrated via `@hbc/field-annotations`
- [ ] Overdue and at-risk detection working; displayed in red/yellow
- [ ] User acceptance testing passed with 2+ sample projects
- [ ] All business rules (§7) enforced in code
- [ ] Performance: constraint list load < 1 second for 100 records; filter < 500ms
- [ ] Integration with Schedule module (activity references) verified
- [ ] Integration with Financial module (budget line links) verified
- [ ] Integration with Health spine (metrics publication) verified

**Delivery checklist:**
- [ ] Code complete and committed to main branch
- [ ] Unit tests: > 85% code coverage on status transitions, validations, calculations
- [ ] Integration tests: CRUD, status workflows, related items linkage
- [ ] User documentation in package `README.md`
- [ ] API documentation complete (if applicable)
- [ ] Spine event contracts verified against P3-A3 spec
- [ ] Annotation integration tested with `@hbc/field-annotations`

---

## 13. Field Summary Index

**Quick reference: alphabetical list of all constraint, change, and delay fields defined in this specification.**

| Field Name | Section | Type | Editable | Immutable |
|------------|---------|------|----------|-----------|
| affectedActivityCodes | 4.1 | string[] | Yes (via link/unlink) | No |
| affectedBudgetLines | 4.1 | string[] | Yes (via link/unlink) | No |
| affectedTask | 3.1 | string | Yes | No |
| assigned | 1.1 | string | Yes | No |
| bic | 1.1 | enum | Yes | No |
| category | 1.1 | enum | No | **Yes** |
| ceDescription | 2.1 | string | Yes | No |
| ceNumber | 2.1 | string | No | **Yes** |
| changeId | 2.1 | string | No | **Yes** |
| closureDocument | 1.1 | string (URI) | Yes | No |
| comments | 1.1 | string | Yes (append) | No |
| completionStatus | 1.1 | enum | Yes | No |
| coDate | 2.1 | date | Yes | No |
| coStatus | 2.1 | string | Yes | No |
| coTotal | 2.1 | number (USD) | Yes | No |
| criticalPathImpact | 3.1 | enum | No | **Yes** |
| dateClosed | 1.1 | date | No | **Yes** (once set) |
| dateIdentified | 1.1 | date | No | **Yes** |
| daysElapsed | 1.1 | integer | No (calculated) | No |
| delayId | 3.1 | string | No | **Yes** |
| delayStart | 3.1 | date | Yes | No |
| description | 1.1 | string | Yes | No |
| expectedDelayDuration | 3.1 | integer | Yes | No |
| id | 1.1 | string | No | **Yes** |
| linkedChangeIds | 2.1 | string[] | Yes (append) | No |
| linkedConstraintIds | 2.1 | string[] | Yes (append) | No |
| linkedConstraintIds (delay) | 3.1 | string[] | Yes (append) | No |
| no | 1.1 | string | No | **Yes** |
| notificationDate | 3.1 | date | Yes | No |
| notes | 3.1 | string | Yes (append) | No |
| origin | 2.1 | string | Yes | No |
| originalActivityStart | 3.1 | date | Yes | No |
| pccoNumber | 3.1 | string | No | **Yes** |
| potentialCostImpact | 3.1 | number (USD) | Yes | No |
| projectId | 1.1 | string | No | **Yes** |
| reason | 2.1 | string | Yes | No |
| reference | 1.1 | string | Yes | No |
| relatedPermitIds | 4.1 | string[] | Yes (via link/unlink) | No |
| scheduleImpactDays | 2.1 | integer | Yes | No |
| status (change entry) | 2.1 | enum | Yes | No |

---

## 14. Data Import and Migration Strategy

For initial project setup and historical data backfill, the Constraints module will support:

1. **Constraints.json import**: One-time bulk import of project constraints ledger
2. **Change Log template bulk import** (optional): CSV/Excel import of historical change entries
3. **Delay Log template bulk import** (optional): CSV/Excel import of historical delays
4. **Manual entry**: PM enters constraints, changes, and delays via UI during project execution
5. **Linked data sync**: Related items (schedule activities, budget lines) are resolved by reference and validated on import

**No cascading deletes:** Constraints remain in ledger even if linked items (schedule activities, budget lines) are deleted. Orphaned links are marked "reference no longer available" but records are retained for audit.

---

## 15. Security and Audit Trail

### 15.1 Audit Trail Enforcement

Every constraint, change entry, and delay record includes:
- `createdAt`, `createdBy` (immutable on creation)
- `lastEditedAt`, `lastEditedBy` (updated on each edit)
- `dateClosedAt` (immutable once set)

All edits are logged in `@hbc/audit-log` (or equivalent). No record is hard-deleted; soft-delete via status marking.

### 15.2 Role-Based Access

- **PM**: Full read/write on own project constraints, changes, delays
- **PE/Approver**: Read-only; may approve change entries and forecast overrides
- **Executive/Sponsor**: Read-only; may annotate via `@hbc/field-annotations`
- **Admin**: Read-only; audit/reporting access

---

**Document Version:** 1.0
**Last Updated:** 2026-03-22
**Next Review:** Upon module implementation start
