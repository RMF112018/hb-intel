# Workflow List Schemas — G2 Consolidated Reference

> **Doc Classification:** Living Reference (Diátaxis) — Reference quadrant; data model audience; consolidated schema reference for all Wave 0 Group 2 workflow-family lists.

**Source:** W0-G2-T01 — Shared List Schema Standards and PID Contract (§2–§3, §6)
**Populated By:** T02 (Startup), T03 (Closeout), T04 (Safety), T05 (Project Controls), T06 (Financial)
**Consumers:** T07 (provisioning saga), T09 (integration tests), Wave 1 app teams

---

## Mandatory Fields — Every G2 List

Every G2 workflow-family list must include the following fields in addition to workflow-specific fields:

| Field | InternalName | Type | Required | Notes |
|-------|-------------|------|----------|-------|
| Project ID | `pid` | Text | Yes | See [PID Contract](./pid-contract.md) — indexed, default = `projectNumber` |
| Title | `Title` | Text | Yes | SharePoint built-in — repurposed per list (record number, item name) |
| Status | `Status` | Choice | Yes | Workflow-specific choices defined per list in T02–T06 |
| Created | *(built-in)* | DateTime | Auto | SharePoint-managed — do not declare in `IListDefinition.fields[]` |
| Modified | *(built-in)* | DateTime | Auto | SharePoint-managed — do not declare in `IListDefinition.fields[]` |
| Created By | *(built-in)* | User | Auto | SharePoint-managed — do not declare in `IListDefinition.fields[]` |

---

## Naming Conventions

### List Titles
- Use sentence case (not ALL CAPS or Title Case With Every Word)
- Use plain language matching operational vocabulary
- Maximum 50 characters
- Examples: `Startup Checklist Items`, `JHA Log`, `Buyout Log`, `Permit Log`

### Internal Field Names
- PascalCase without spaces (exception: `pid` is lowercase per contract)
- Never use spaces (SharePoint encodes as `_x0020_`)
- Never use reserved SharePoint names (`ID`, `Author`, `Editor`, `Created`, `Modified`)
- Examples: `StartDate`, `DueDate`, `AssignedTo`, `ParentRecord`

### Choice Field Patterns

| Pattern | Choices | Used For |
|---------|---------|----------|
| Checklist items | `Open \| In Progress \| Complete \| N/A` | Startup, closeout, safety checklists |
| Log entries | `Open \| In Progress \| Closed` | JHA, permits, inspections, constraints |
| Approval workflows | `Pending \| Submitted \| Approved \| Rejected` | Buyout, subcontract, draw schedule |
| Financial records | `Pending \| Active \| Complete \| On Hold` | Forecast, GC-GR |

T02–T06 use these patterns as defaults. Workflow-specific deviations must be documented with rationale.

---

## Seeded-File Classification Model

| State | Definition | G2 Action |
|-------|-----------|-----------|
| **Seed now** | Needs both a backing list and a seeded template file for current operational use | Create list + create asset file + add to `template-file-manifest.ts` |
| **List only** | Sufficiently captured by a SharePoint list; no template file needed | Create list only |
| **Reference file only** | Too early-stage or document-centric for a list in Wave 0 | Create asset file + add to `template-file-manifest.ts` |
| **Future feature target** | Recognized but neither list nor file appropriate in Wave 0 | No G2 provisioning action; log as Wave 1 input |

---

## T02 — Startup / Kickoff / Handoff Schemas

> **Source:** W0-G2-T02 — Startup, Kickoff, and Handoff Data Model
> **Module:** `backend/functions/src/config/startup-list-definitions.ts`
> **List Family:** `startup` — 5 lists (3 parent/flat, 2 child)

### Parent/Child Relationships

| Parent List | Child List | Lookup Field | Lookup Target |
|-------------|-----------|--------------|---------------|
| Startup Checklist | Startup Checklist Items | `ParentRecord` | `Startup Checklist:ID` |
| Estimating Kickoff Log | Kickoff Responsibility Items | `ParentRecord` | `Estimating Kickoff Log:ID` |
| Project Responsibility Matrix | *(flat — no children)* | — | — |

### 2.1 Startup Checklist (parent, provisioningOrder=10)

| Field | InternalName | Type | Required | Choices / Notes |
|-------|-------------|------|----------|-----------------|
| Project ID | `pid` | Text | Yes | indexed, default=`{{projectNumber}}` |
| Title | `Title` | Text | Yes | |
| Status | `Status` | Choice | Yes | `Open \| In Progress \| Complete` |
| Project Manager | `ProjectManager` | User | No | |
| Project Executive | `ProjectExecutive` | User | No | |
| Superintendent | `Superintendent` | User | No | |
| Contract Date | `ContractDate` | DateTime | No | |
| Project Start Date | `ProjectStartDate` | DateTime | No | |
| Procore Project ID | `ProcoreProjectId` | Text | No | |
| Department | `Department` | Choice | Yes | `commercial \| luxury-residential` |
| Notes | `Notes` | MultiLineText | No | |

### 2.2 Startup Checklist Items (child, provisioningOrder=20)

| Field | InternalName | Type | Required | Choices / Notes |
|-------|-------------|------|----------|-----------------|
| Project ID | `pid` | Text | Yes | indexed, default=`{{projectNumber}}` |
| Title | `Title` | Text | Yes | |
| Parent Record | `ParentRecord` | Lookup | Yes | → `Startup Checklist:ID` |
| Category | `Category` | Choice | Yes | `Contract Review \| Job Setup \| Services & Equipment \| Permits \| Procore Setup \| Other` |
| Status | `Status` | Choice | Yes | `N/A \| Open \| Complete` |
| Assigned To | `AssignedTo` | User | No | |
| Due Date | `DueDate` | DateTime | No | |
| Completed Date | `CompletedDate` | DateTime | No | |
| Notes | `Notes` | MultiLineText | No | |

### 2.3 Estimating Kickoff Log (parent, provisioningOrder=10)

| Field | InternalName | Type | Required | Choices / Notes |
|-------|-------------|------|----------|-----------------|
| Project ID | `pid` | Text | Yes | indexed, default=`{{projectNumber}}` |
| Title | `Title` | Text | Yes | |
| Status | `Status` | Choice | Yes | `Scheduled \| In Progress \| Complete` |
| Kickoff Date | `KickoffDate` | DateTime | No | |
| Estimating Lead | `EstimatingLead` | User | No | |
| Operations Lead | `OperationsLead` | User | No | |
| Contract Type | `ContractType` | Choice | No | `Lump Sum \| GMP \| Cost Plus \| CM \| Other` |
| Budget Transferred | `BudgetTransferred` | Boolean | No | |
| Schedule Received | `ScheduleReceived` | Boolean | No | |
| Drawings Transferred | `DrawingsTransferred` | Boolean | No | |
| Notes | `Notes` | MultiLineText | No | |

### 2.4 Kickoff Responsibility Items (child, provisioningOrder=20)

| Field | InternalName | Type | Required | Choices / Notes |
|-------|-------------|------|----------|-----------------|
| Project ID | `pid` | Text | Yes | indexed, default=`{{projectNumber}}` |
| Title | `Title` | Text | Yes | |
| Parent Record | `ParentRecord` | Lookup | Yes | → `Estimating Kickoff Log:ID` |
| Category | `Category` | Choice | Yes | `Owner Notices \| RFI \| Submittal \| Change Order \| Budget \| Schedule \| Safety \| Quality \| Subcontractor \| Other` |
| Primary Owner | `PrimaryOwner` | User | No | |
| Support Owner | `SupportOwner` | User | No | |
| Status | `Status` | Choice | Yes | `Open \| Acknowledged \| Complete` |
| Notes | `Notes` | MultiLineText | No | |

### 2.5 Project Responsibility Matrix (flat, provisioningOrder=10)

| Field | InternalName | Type | Required | Choices / Notes |
|-------|-------------|------|----------|-----------------|
| Project ID | `pid` | Text | Yes | indexed, default=`{{projectNumber}}` |
| Title | `Title` | Text | Yes | |
| Category | `Category` | Choice | Yes | `Project Management \| Field \| Safety \| Quality \| Finance \| Executive` |
| Primary Role | `PrimaryRole` | Choice | No | `PX \| Sr. PM \| PM \| PA \| Superintendent \| Safety \| QAQC \| Other` |
| Primary Person | `PrimaryPerson` | User | No | |
| Support Person | `SupportPerson` | User | No | |
| Notes | `Notes` | Text | No | Plain Text (not MultiLineText) per T02 §2.5 |

### Seeded File Mapping

| File Name | Format | Target Library | Classification |
|-----------|--------|---------------|----------------|
| Estimating Kickoff Template.xlsx | Excel | Project Documents | Reference file only |
| Responsibility Matrix Template.xlsx | Excel | Project Documents | Reference file only |
| Project Management Plan Template.docx | Word | Project Documents | Reference file only |
| Procore Startup Checklist Reference.pdf | PDF | Project Documents | Reference file only |

### Deferred Decisions

- **Pre-seeded checklist items:** Whether to insert default rows into `Startup Checklist Items` or `Kickoff Responsibility Items` at provisioning time is deferred to T07. T07 will decide insert-at-provision vs. leave-empty based on operational feedback.
- **Cross-family references:** No startup-family list references lists from other families. Future cross-family Lookups (e.g., linking to closeout lists) are Wave 1 scope.

---

## T03 — Closeout / Turnover / Punch Schemas

> **Source:** W0-G2-T03 — Closeout, Turnover, and Punch Data Model
> **Module:** `backend/functions/src/config/closeout-list-definitions.ts`
> **List Family:** `closeout` — 5 lists (1 parent, 1 child, 3 flat)

### Parent/Child Relationships

| Parent List | Child List | Lookup Field | Lookup Target |
|-------------|-----------|--------------|---------------|
| Closeout Checklist | Closeout Checklist Items | `ParentRecord` | `Closeout Checklist:ID` |
| Punch List Batches | *(flat — no children)* | — | — |
| Turnover Package Log | *(flat — no children)* | — | — |
| Subcontractor Evaluations | *(flat — no children)* | — | — |

> **Open item (T07):** `PunchBatchId` Lookup amendment to the core Punch List will link individual punch items to a batch record. Deferred to T07 per T03-R1.

### 3.1 Closeout Checklist (parent, provisioningOrder=10)

| Field | InternalName | Type | Required | Choices / Notes |
|-------|-------------|------|----------|-----------------|
| Project ID | `pid` | Text | Yes | indexed, default=`{{projectNumber}}` |
| Title | `Title` | Text | Yes | |
| Status | `Status` | Choice | Yes | `Not Started \| In Progress \| Punch Phase \| Turnover Phase \| Complete` |
| Target Substantial Completion | `TargetSubstantialCompletion` | DateTime | No | |
| Actual Substantial Completion | `ActualSubstantialCompletion` | DateTime | No | |
| Target Final Completion | `TargetFinalCompletion` | DateTime | No | |
| Actual Final Completion | `ActualFinalCompletion` | DateTime | No | |
| Stage 1 Complete | `Stage1Complete` | Boolean | No | |
| Stage 2 Complete | `Stage2Complete` | Boolean | No | |
| Stage 3 Complete | `Stage3Complete` | Boolean | No | |
| Stage 4 Complete | `Stage4Complete` | Boolean | No | |
| Certificate of Occupancy | `CertificateOfOccupancy` | Boolean | No | |
| CO Date | `CODate` | DateTime | No | |
| Punch List Items Total | `PunchListItemsTotal` | Number | No | |
| Punch List Items Closed | `PunchListItemsClosed` | Number | No | |
| Project Manager | `ProjectManager` | User | No | |
| Notes | `Notes` | MultiLineText | No | |

### 3.2 Closeout Checklist Items (child, provisioningOrder=20)

| Field | InternalName | Type | Required | Choices / Notes |
|-------|-------------|------|----------|-----------------|
| Project ID | `pid` | Text | Yes | indexed, default=`{{projectNumber}}` |
| Title | `Title` | Text | Yes | |
| Parent Record | `ParentRecord` | Lookup | Yes | → `Closeout Checklist:ID` |
| Category | `Category` | Choice | Yes | `Tasks \| Document Tracking \| Inspections \| Turnover \| Post Turnover \| Closeout Documents` |
| Status | `Status` | Choice | Yes | `N/A \| Open \| In Progress \| Complete` |
| Assigned To | `AssignedTo` | User | No | |
| Due Date | `DueDate` | DateTime | No | |
| Completed Date | `CompletedDate` | DateTime | No | |
| Responsible Party | `ResponsibleParty` | Choice | No | `HBC \| Owner \| Architect \| Sub \| AHJ` |
| Notes | `Notes` | MultiLineText | No | |

### 3.3 Punch List Batches (flat, provisioningOrder=10)

| Field | InternalName | Type | Required | Choices / Notes |
|-------|-------------|------|----------|-----------------|
| Project ID | `pid` | Text | Yes | indexed, default=`{{projectNumber}}` |
| Title | `Title` | Text | Yes | |
| Walk Date | `WalkDate` | DateTime | No | |
| Walk Type | `WalkType` | Choice | No | `Owner \| Architect \| HBC Internal \| AHJ` |
| Status | `Status` | Choice | Yes | `Open \| In Progress \| Complete` |
| Items Total | `ItemsTotal` | Number | No | |
| Items Closed | `ItemsClosed` | Number | No | |
| Conducted By | `ConductedBy` | User | No | |
| Notes | `Notes` | MultiLineText | No | |

> **Deferred (T07):** Punch List Batch → core Punch List linkage via `PunchBatchId` Lookup field amendment (T03-R1).

### 3.4 Turnover Package Log (flat, provisioningOrder=10)

| Field | InternalName | Type | Required | Choices / Notes |
|-------|-------------|------|----------|-----------------|
| Project ID | `pid` | Text | Yes | indexed, default=`{{projectNumber}}` |
| Title | `Title` | Text | Yes | |
| Category | `Category` | Choice | Yes | `O&M Manual \| As-Built Drawing \| Warranty \| Certification \| Survey \| Commissioning Report \| Other` |
| Status | `Status` | Choice | Yes | `Pending \| Requested \| Received \| Reviewed \| Submitted to Owner \| Accepted` |
| Subcontractor Name | `SubcontractorName` | Text | No | |
| Date Requested | `DateRequested` | DateTime | No | |
| Date Received | `DateReceived` | DateTime | No | |
| Date Submitted to Owner | `DateSubmittedToOwner` | DateTime | No | |
| Storage Location | `StorageLocation` | URL | No | Link to document in SharePoint or external system |
| Notes | `Notes` | MultiLineText | No | |

> **O&M Manual Log consolidation:** T03 plan §1 lists "O&M Manual Log" as a separate classification row, but §2 provides no separate schema. The `Turnover Package Log` covers O&M manuals via its `Category` choice field (`O&M Manual`). This is intentional consolidation, not a gap.

### 3.5 Subcontractor Evaluations (flat, provisioningOrder=10)

| Field | InternalName | Type | Required | Choices / Notes |
|-------|-------------|------|----------|-----------------|
| Project ID | `pid` | Text | Yes | indexed, default=`{{projectNumber}}` |
| Title | `Title` | Text | Yes | |
| Subcontractor Name | `SubcontractorName` | Text | Yes | |
| Trade | `Trade` | Text | No | |
| Overall Rating | `OverallRating` | Choice | No | `Excellent \| Good \| Satisfactory \| Poor \| Unacceptable` |
| Safety Rating | `SafetyRating` | Choice | No | `Excellent \| Good \| Satisfactory \| Poor \| Unacceptable` |
| Quality Rating | `QualityRating` | Choice | No | `Excellent \| Good \| Satisfactory \| Poor \| Unacceptable` |
| Schedule Rating | `ScheduleRating` | Choice | No | `Excellent \| Good \| Satisfactory \| Poor \| Unacceptable` |
| Communication Rating | `CommunicationRating` | Choice | No | `Excellent \| Good \| Satisfactory \| Poor \| Unacceptable` |
| Recommend for Future Work | `RecommendForFutureWork` | Boolean | No | |
| Evaluated By | `EvaluatedBy` | User | No | |
| Evaluation Date | `EvaluationDate` | DateTime | No | |
| Notes | `Notes` | MultiLineText | No | |

### Seeded File Mapping

| File Name | Format | Target Library | Classification |
|-----------|--------|---------------|----------------|
| Project Closeout Guide.docx | Word | Project Documents | Reference file only |
| Closeout Checklist Reference.pdf | PDF | Project Documents | Reference file only |

### Cross-Family References

- **Financial (T06):** Closeout Checklist completion milestones may correlate with final payment milestones tracked in T06 financial lists. Cross-family Lookup fields are Wave 1 scope.
- **Project Controls (T05):** Punch List Batches relate to inspection workflows in T05. Cross-family linkage deferred to Wave 1.

### Deferred Decisions

- **Pre-seeded closeout checklist items:** Whether to insert default rows into `Closeout Checklist Items` at provisioning time is deferred to T07.
- **PunchBatchId amendment (T03-R1):** Adding a `PunchBatchId` Lookup field to the core Punch List (linking items to batches) is deferred to T07.
- **Cross-family Lookups:** Linking closeout lists to financial or project controls lists is Wave 1 scope.

---

## T04 — Safety / JHA / Incident Schemas

*Section populated by T04 implementation. Placeholder for list field schemas.*

---

## T05 — Project Controls / Permits / Inspections Schemas

*Section populated by T05 implementation. Placeholder for list field schemas.*

---

## T06 — Financial / Buyout / Forecast Schemas

*Section populated by T06 implementation. Placeholder for list field schemas.*

---

*End of Workflow List Schemas v1.0 — scaffold; populated incrementally by T02–T06*
