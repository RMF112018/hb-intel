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

- **Pre-seeded checklist items:** ~~Deferred to T07~~ — **T07 Decision: Leave empty.** Pre-seeded rows deferred to Wave 1. Lists are provisioned empty; operational teams populate via UI or future bulk-import tooling.
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

> **Resolved (T07):** `PunchBatchId` added to the core Punch List as a plain `Text` field (`Punch Batch Reference`). Uses Text (not Lookup) to avoid cross-list dependency at provisioning time. Operational linkage to Punch List Batches is by convention; formal Lookup upgrade is Wave 1 scope.

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

- **Pre-seeded closeout checklist items:** ~~Deferred to T07~~ — **T07 Decision: Leave empty.** Pre-seeded rows deferred to Wave 1. Lists are provisioned empty.
- **PunchBatchId amendment (T03-R1):** ~~Deferred to T07~~ — **Resolved by T07.** `PunchBatchId` added to core Punch List as plain `Text` field. See §3.3 note above.
- **Cross-family Lookups:** Linking closeout lists to financial or project controls lists is Wave 1 scope.

---

## T04 — Safety / JHA / Incident Schemas

> **Source:** W0-G2-T04 — Safety, JHA, and Incident Data Model
> **Module:** `backend/functions/src/config/safety-list-definitions.ts`
> **List Family:** `safety` — 8 lists (1 parent, 2 children, 5 flat)

### Parent/Child Relationships

| Parent List | Child List | Lookup Field | Lookup Target |
|-------------|-----------|--------------|---------------|
| JHA Log | JHA Steps | `ParentRecord` | `JHA Log:ID` |
| JHA Log | JHA Attendees | `ParentRecord` | `JHA Log:ID` |
| Incident Log | *(flat — no children)* | — | — |
| Site Safety Plans | *(flat — no children)* | — | — |
| Toolbox Talk Log | *(flat — no children)* | — | — |
| Safety Walk Log | *(flat — no children)* | — | — |
| Sub Safety Certifications | *(flat — no children)* | — | — |

### Relationship to Core Safety Log

The core `Safety Log` in `HB_INTEL_LIST_DEFINITIONS` captures lightweight daily safety observations. The T04 `Incident Log` captures detailed incident investigation data at a different level of detail. These are **complementary** — there is no Lookup relationship between them. The core Safety Log is not modified by T04.

### 4.1 JHA Log (parent, provisioningOrder=10)

| Field | InternalName | Type | Required | Choices / Notes |
|-------|-------------|------|----------|-----------------|
| Project ID | `pid` | Text | Yes | indexed, default=`{{projectNumber}}` |
| Title | `Title` | Text | Yes | |
| Status | `Status` | Choice | Yes | `Draft \| Active \| Superseded \| Archived` |
| JHA Date | `JHADate` | DateTime | Yes | |
| Subcontractor Name | `SubcontractorName` | Text | No | |
| Supervisor | `Supervisor` | User | No | |
| Crew Size | `CrewSize` | Number | No | |
| Work Task | `WorkTask` | Text | Yes | |
| Location | `Location` | Text | No | |
| Requires Confined Space Permit | `RequiresConfinedSpacePermit` | Boolean | No | |
| Confined Space Permit Number | `ConfinedSpacePermitNumber` | Text | No | Cross-ref: Project Controls (T05) permit tracking |
| Requires Hot Work Permit | `RequiresHotWorkPermit` | Boolean | No | |
| Hot Work Permit Number | `HotWorkPermitNumber` | Text | No | Cross-ref: Project Controls (T05) permit tracking |
| Emergency Contact | `EmergencyContact` | Text | No | |
| Nearest Hospital | `NearestHospital` | Text | No | |
| Reviewed By | `ReviewedBy` | User | No | |
| Notes | `Notes` | MultiLineText | No | |

### 4.2 JHA Steps (child, provisioningOrder=20)

| Field | InternalName | Type | Required | Choices / Notes |
|-------|-------------|------|----------|-----------------|
| Project ID | `pid` | Text | Yes | indexed, default=`{{projectNumber}}` |
| Title | `Title` | Text | Yes | |
| Parent Record | `ParentRecord` | Lookup | Yes | → `JHA Log:ID` |
| Step Number | `StepNumber` | Number | Yes | |
| Step Description | `StepDescription` | MultiLineText | Yes | |
| Hazards | `Hazards` | MultiLineText | Yes | |
| Controls | `Controls` | MultiLineText | Yes | |
| PPE Hard Hat | `PPE_HardHat` | Boolean | No | |
| PPE Safety Glasses | `PPE_SafetyGlasses` | Boolean | No | |
| PPE Hi-Vis | `PPE_HiVis` | Boolean | No | |
| PPE Gloves | `PPE_Gloves` | Boolean | No | |
| PPE Hearing Protection | `PPE_HearingProtection` | Boolean | No | |
| PPE Respirator | `PPE_Respirator` | Boolean | No | |
| PPE Harness | `PPE_Harness` | Boolean | No | |
| PPE Work Boots | `PPE_WorkBoots` | Boolean | No | |
| PPE Other | `PPE_Other` | Text | No | Free-text for unlisted PPE |
| Risk Level | `RiskLevel` | Choice | No | `Low \| Medium \| High` |

### 4.3 JHA Attendees (child, provisioningOrder=20)

| Field | InternalName | Type | Required | Choices / Notes |
|-------|-------------|------|----------|-----------------|
| Project ID | `pid` | Text | Yes | indexed, default=`{{projectNumber}}` |
| Title | `Title` | Text | Yes | |
| Parent Record | `ParentRecord` | Lookup | Yes | → `JHA Log:ID` |
| Company | `Company` | Text | No | |
| Acknowledged Date | `AcknowledgedDate` | DateTime | No | |
| Signature Method | `SignatureMethod` | Choice | No | `Physical \| Digital \| Verbal Acknowledgment` |

### 4.4 Incident Log (flat, provisioningOrder=10)

| Field | InternalName | Type | Required | Choices / Notes |
|-------|-------------|------|----------|-----------------|
| Project ID | `pid` | Text | Yes | indexed, default=`{{projectNumber}}` |
| Title | `Title` | Text | Yes | |
| Status | `Status` | Choice | Yes | `Open \| Under Investigation \| Corrective Action \| Closed` |
| Incident Type | `IncidentType` | Choice | Yes | `Near Miss \| Unsafe Condition \| Equipment Damage \| First Aid \| Medical Treatment \| Lost Time \| Fatality \| Property Damage \| Other` |
| Incident Date | `IncidentDate` | DateTime | Yes | |
| Reported Date | `ReportedDate` | DateTime | No | |
| Location | `Location` | Text | Yes | |
| Person Completing | `PersonCompleting` | User | No | |
| Company of Reporter | `CompanyOfReporter` | Text | No | |
| Employees Involved | `EmployeesInvolved` | MultiLineText | No | |
| Description | `Description` | MultiLineText | Yes | |
| Immediate Causes | `ImmediateCauses` | MultiLineText | No | |
| Contributing Factors | `ContributingFactors` | MultiLineText | No | |
| Corrective Actions | `CorrectiveActions` | MultiLineText | No | |
| Corrective Actions Complete | `CorrectiveActionsComplete` | Boolean | No | |
| OSHA Recordable | `OSHARecordable` | Boolean | No | Not required — per Risk T04-R3 regulatory sensitivity |
| Reviewed By | `ReviewedBy` | User | No | |

### 4.5 Site Safety Plans (flat, provisioningOrder=10)

| Field | InternalName | Type | Required | Choices / Notes |
|-------|-------------|------|----------|-----------------|
| Project ID | `pid` | Text | Yes | indexed, default=`{{projectNumber}}` |
| Title | `Title` | Text | Yes | |
| Plan Type | `PlanType` | Choice | Yes | `HBC SSSP \| Subcontractor SSSP \| Hurricane Preparedness \| Emergency Action Plan \| Other` |
| Status | `Status` | Choice | Yes | `Not Submitted \| Submitted \| Under Review \| Approved \| Expired \| Superseded` |
| Subcontractor Name | `SubcontractorName` | Text | No | |
| Submitted Date | `SubmittedDate` | DateTime | No | |
| Approved Date | `ApprovedDate` | DateTime | No | |
| Expiration Date | `ExpirationDate` | DateTime | No | |
| Document Link | `DocumentLink` | URL | No | Link to document in SharePoint or external system |
| Reviewed By | `ReviewedBy` | User | No | |
| Notes | `Notes` | MultiLineText | No | |

> **Cross-ref (T02):** SSSP submission status tracked here complements Startup Checklist `Services & Equipment` category items that may reference safety plan readiness.

### 4.6 Toolbox Talk Log (flat, provisioningOrder=10)

| Field | InternalName | Type | Required | Choices / Notes |
|-------|-------------|------|----------|-----------------|
| Project ID | `pid` | Text | Yes | indexed, default=`{{projectNumber}}` |
| Title | `Title` | Text | Yes | |
| Talk Date | `TalkDate` | DateTime | Yes | |
| Facilitator | `Facilitator` | User | No | |
| Attendee Count | `AttendeeCount` | Number | No | |
| Status | `Status` | Choice | Yes | `Conducted \| Missed \| Rescheduled` |
| Notes | `Notes` | MultiLineText | No | |

### 4.7 Safety Walk Log (flat, provisioningOrder=10)

| Field | InternalName | Type | Required | Choices / Notes |
|-------|-------------|------|----------|-----------------|
| Project ID | `pid` | Text | Yes | indexed, default=`{{projectNumber}}` |
| Title | `Title` | Text | Yes | |
| Walk Date | `WalkDate` | DateTime | Yes | |
| Conducted By | `ConductedBy` | User | No | |
| Findings Count | `FindingsCount` | Number | No | |
| Findings Resolved | `FindingsResolved` | Number | No | |
| Status | `Status` | Choice | Yes | `Scheduled \| Conducted \| Findings Pending \| Complete` |
| Notes | `Notes` | MultiLineText | No | |

### 4.8 Sub Safety Certifications (flat, provisioningOrder=10)

| Field | InternalName | Type | Required | Choices / Notes |
|-------|-------------|------|----------|-----------------|
| Project ID | `pid` | Text | Yes | indexed, default=`{{projectNumber}}` |
| Title | `Title` | Text | Yes | |
| Subcontractor Name | `SubcontractorName` | Text | Yes | |
| Certification Type | `CertificationType` | Choice | Yes | `OSHA 10 \| OSHA 30 \| Competent Person \| Equipment Operator \| First Aid/CPR \| Other` |
| Holder Name | `HolderName` | Text | No | |
| Issue Date | `IssueDate` | DateTime | No | |
| Expiration Date | `ExpirationDate` | DateTime | No | |
| Status | `Status` | Choice | Yes | `Active \| Expiring Soon \| Expired \| Not Submitted` |
| Document Link | `DocumentLink` | URL | No | Link to certification document |

### Seeded File Mapping

| File Name | Format | Target Library | Classification |
|-----------|--------|---------------|----------------|
| JHA Form Template.docx | Word | Project Documents | Reference file only |
| JHA Instructions.docx | Word | Project Documents | Reference file only |
| Incident Report Form.docx | Word | Project Documents | Reference file only |
| Site Specific Safety Plan Template.docx | Word | Project Documents | Reference file only |

> **Resolved (T07 — T04-R2):** G1 `safety-pack` add-on consolidated. The add-on now provisions `Site Specific Safety Plan Template.docx` (matching T04's canonical name). The prior `Safety Plan Template.docx` name is retired. Single asset, single name.

### Cross-Family References

- **Project Controls (T05):** JHA Log permit number fields (`ConfinedSpacePermitNumber`, `HotWorkPermitNumber`) cross-reference permit tracking in T05 project controls lists. Cross-family Lookup fields are Wave 1 scope; T04 stores permit numbers as plain Text for now (per §4.1).
- **Startup (T02):** Site Safety Plans `Status` field (SSSP submission tracking) complements Startup Checklist items that may reference safety plan readiness as a project startup milestone.

### Limitations and Deferred Decisions

- **JHA manual-entry limitation (T04-R1):** The JHA 3-list structure (Log → Steps → Attendees) is schema-ready but has no entry-form UI in Wave 0. JHA data entry requires direct list interaction until the Wave 1 JHA entry form is built.
- **Safety-pack add-on coordination (T04-R2):** ~~Deferred to T07~~ — **Resolved by T07.** Consolidated to `Site Specific Safety Plan Template.docx`. See template asset note above.
- ~~**T07:** Wiring safety definitions into Step 4 provisioning dispatch.~~ — **Done.** Safety lists wired into `workflow-list-definitions.ts` and provisioned via Step 4.
- **T09:** Integration tests for safety list provisioning.
- **Wave 1:** JHA entry form UI, safety dashboard, incident management workflows, OSHA recordkeeping integration.

---

## T05 — Project Controls / Permits / Inspections / Constraints Schemas

> **Source:** W0-G2-T05 — Project Controls, Permits, Inspections, and Constraints Data Model
> **Module:** `backend/functions/src/config/project-controls-list-definitions.ts`
> **List Family:** `project-controls` — 3 lists (all flat, no parent/child relationships)

### Relationship to Core Lists

T05 lists are **complementary** to — and do not duplicate — any core `HB_INTEL_LIST_DEFINITIONS` lists:

- **Permit Log** — tracks permit lifecycle (application → issuance → expiration → final inspection). No equivalent in core lists.
- **Required Inspections** — tracks AHJ/private/third-party inspections with pass/fail results. No equivalent in core lists.
- **Constraints Log** — tracks prerequisites for work to begin (proactive, schedule-driven). Distinct from the core **Issues Log** which tracks problems that have occurred (reactive, general-purpose). See §5.4 below.

No Lookup fields exist between T05 lists and core lists. All cross-references use Text fields containing permit numbers or constraint descriptions.

### 5.1 Permit Log (flat, provisioningOrder=10)

| Field | InternalName | Type | Required | Choices / Notes |
|-------|-------------|------|----------|-----------------|
| Project ID | `pid` | Text | Yes | indexed, default=`{{projectNumber}}` |
| Permit Name / Description | `Title` | Text | Yes | E.g., "Master Building Permit — Town of Palm Beach" |
| Permit Type | `PermitType` | Choice | Yes | `Master Building \| Roofing \| Plumbing \| HVAC \| Electrical \| Fire Suppression \| Fire Alarm \| Elevator \| Demolition \| Site / Civil \| Environmental \| Sub Permit \| Other` |
| Issuing Authority | `IssuingAuthority` | Text | No | E.g., "Town of Palm Beach Building Dept" |
| Permit Number | `PermitNumber` | Text | No | Official permit number once issued |
| Status | `Status` | Choice | Yes | `Not Applied \| Applied \| Under Review \| Issued \| Active \| Expired \| Revisions Required \| Final` |
| Application Date | `ApplicationDate` | DateTime | No | |
| Issued Date | `IssuedDate` | DateTime | No | |
| Expiration Date | `ExpirationDate` | DateTime | No | |
| Final Inspection Date | `FinalInspectionDate` | DateTime | No | Date final inspection was passed |
| Permit Holder | `HolderType` | Choice | No | `HBC \| Subcontractor \| Owner` |
| Subcontractor Name | `SubcontractorName` | Text | No | Applicable when HolderType = Subcontractor |
| Permit Cost | `CostAmount` | Number | No | |
| Permit Document | `DocumentLink` | URL | No | Link to permit PDF in document library |
| Notes | `Notes` | MultiLineText | No | |

### 5.2 Required Inspections (flat, provisioningOrder=10)

| Field | InternalName | Type | Required | Choices / Notes |
|-------|-------------|------|----------|-----------------|
| Project ID | `pid` | Text | Yes | indexed, default=`{{projectNumber}}` |
| Inspection Description | `Title` | Text | Yes | E.g., "Electrical Rough-In Inspection" |
| Trade | `Trade` | Choice | Yes | `Building \| Structural \| Plumbing \| HVAC \| Electrical \| Fire Suppression \| Fire Alarm \| Roofing \| Civil \| Elevator \| Special Inspection \| Other` |
| Inspection Category | `InspectionCategory` | Choice | Yes | `Required (AHJ) \| Private Provider \| Third-Party Special \| Owner Required` |
| Related Permit # | `PermitNumber` | Text | No | Cross-reference to `Permit Log` permit number (same family, Text-based, not Lookup) |
| Status | `Status` | Choice | Yes | `Pending \| Scheduled \| Passed \| Failed \| Rescheduled \| N/A` |
| Scheduled Date | `ScheduledDate` | DateTime | No | |
| Inspection Date | `InspectionDate` | DateTime | No | Actual inspection date |
| Inspector Name | `InspectorName` | Text | No | |
| Inspector Agency | `InspectorAgency` | Text | No | |
| Result | `Result` | Choice | No | `Pass \| Partial Pass \| Fail \| Deferred` |
| Failure Reason | `FailureReason` | MultiLineText | No | Expected when Result = Fail |
| Corrective Action Due Date | `CorrectiveActionDue` | DateTime | No | |
| Re-inspection Date | `ReinspectionDate` | DateTime | No | |
| Inspection Report | `InspectionReportLink` | URL | No | |
| Notes | `Notes` | MultiLineText | No | |

### 5.3 Constraints Log (flat, provisioningOrder=10)

| Field | InternalName | Type | Required | Choices / Notes |
|-------|-------------|------|----------|-----------------|
| Project ID | `pid` | Text | Yes | indexed, default=`{{projectNumber}}` |
| Constraint Description | `Title` | Text | Yes | Brief description of the constraint |
| Constraint Type | `ConstraintType` | Choice | Yes | `Information Required \| Approval Pending \| Material Lead Time \| Access / Sequencing \| Subcontractor \| Owner Decision \| Permit \| Weather \| Other` |
| Status | `Status` | Choice | Yes | `Open \| In Progress \| Resolved \| Deferred` |
| Work Activity Blocked | `WorkActivityBlocked` | Text | No | What work cannot proceed because of this constraint |
| Constraint Owner | `Owner` | User | No | Person responsible for resolving |
| Date Identified | `DateIdentified` | DateTime | Yes | |
| Target Resolution Date | `TargetResolutionDate` | DateTime | No | |
| Actual Resolution Date | `ActualResolutionDate` | DateTime | No | |
| Impact if Unresolved | `ImpactIfUnresolved` | Choice | No | `No Impact \| Minor Delay \| Moderate Delay \| Critical Path Impact` |
| Related Permit # | `RelatedPermit` | Text | No | Cross-reference to Permit Log |
| Notes | `Notes` | MultiLineText | No | |

### 5.4 Constraints Log vs Issues Log Distinction

These two lists occupy **related but distinct** operational domains:

| Aspect | Issues Log (core G1) | Constraints Log (T05) |
|--------|---------------------|----------------------|
| **Purpose** | Tracks problems that have occurred | Tracks prerequisites for work to begin |
| **Orientation** | Reactive — respond to issues | Proactive — prevent schedule delays |
| **Context** | General-purpose issue tracking | Schedule-driven, tied to 3-week look-ahead |
| **Lifecycle** | Issue arises → investigated → resolved | Constraint identified → tracked → removed before work starts |
| **Examples** | Design error found, material defect, coordination failure | Awaiting RFI response, material on order, owner decision pending |

No Lookup relationship exists between them. A constraint may become an issue if unresolved past the target date, but this transition is operational, not schema-enforced.

### 5.5 3-Week Look-Ahead Treatment

The 3-week look-ahead / schedule artifact is classified as **reference-file-only** in the T05 seeded-file classification model. No list is created in Wave 0:

- Schedule data is currently managed in external tools (Primavera P6, MS Project) with exports stored in `ResDir/08-Schedule/3 Week Look Ahead/`
- A structured list would require schedule integration that is out of scope for Wave 0
- The `Constraints Log` captures the constraint-management aspect of look-ahead planning
- **Wave 1 scope:** The `@hbc/bic-next-move` package will consume `Constraints Log` data for schedule-risk intelligence. A digital 3-week look-ahead list may be created at that time.

### Seeded File Mapping

| File Name | Format | Target Library | Classification |
|-----------|--------|---------------|----------------|
| Required Inspections Template.xlsx | Excel | Project Documents | Seed now |

### Cross-Family References

- **Safety (T04):** JHA Log permit number fields (`ConfinedSpacePermitNumber`, `HotWorkPermitNumber`) cross-reference permit tracking in T05's `Permit Log`. No Lookup — stored as plain Text per T04 §4.1.
- **Startup (T02):** Startup Checklist items in the `Permits` category reference permit application status tracked in T05's `Permit Log`.
- **Closeout (T03):** Closeout Checklist items in the `Inspections` category reference final inspection completion tracked in T05's `Required Inspections` list. Final inspections as closeout milestones.
- **Within T05:** `PermitNumber` (Text) on Required Inspections cross-references Permit Log permit numbers. `RelatedPermit` (Text) on Constraints Log cross-references Permit Log. All intra-family references are Text-based, not Lookup.

### Deferred Decisions

- **Pre-seeded inspection rows (T05-R2):** ~~Deferred to T07~~ — **T07 Decision: Leave empty.** Pre-seeded rows deferred to Wave 1. Lists are provisioned empty.
- **Constraints Log description (T05-R3):** ~~Deferred to T07~~ — **Resolved by T08.** List description enrichment (including Constraints Log vs Issues Log distinction) is T08 scope (validation rules and description enrichment).
- **Permit jurisdiction variance (T05-R1):** `PermitType` choice list represents common Florida construction permits. The `Other` catch-all covers jurisdictional variance. Wave 1 will allow jurisdiction-specific permit type configuration without schema changes.
- ~~**T07:** Wiring project-controls definitions into Step 4 provisioning dispatch.~~ — **Done.** Project-controls lists wired into `workflow-list-definitions.ts` and provisioned via Step 4.
- **T09:** Integration tests for project-controls list provisioning.
- **Wave 1:** Permit expiration alerting, inspection dashboard, schedule-risk intelligence (`@hbc/bic-next-move`), 3-week look-ahead digital list.

---

## T06 — Financial / Buyout / Forecast / Draw / Subcontract Schemas

> **Source:** W0-G2-T06 — Financial, Buyout, Forecast, Draw, and Subcontract Data Model
> **Module:** `backend/functions/src/config/financial-list-definitions.ts`
> **List Family:** `financial` — 5 lists (1 parent, 1 child, 3 flat)

### Parent/Child Relationships

| Parent List | Child List | Lookup Field | Lookup Target |
|-------------|-----------|--------------|---------------|
| Buyout Log | Buyout Bid Lines | `ParentRecord` | `Buyout Log:ID` |
| Draw Schedule | *(flat — no children)* | — | — |
| Financial Forecast Status | *(flat — no children)* | — | — |
| Subcontract Compliance Log | *(flat — no children)* | — | — |

### 6.1 Buyout Log (parent, provisioningOrder=10)

| Field | InternalName | Type | Required | Choices / Notes |
|-------|-------------|------|----------|-----------------|
| Project ID | `pid` | Text | Yes | indexed, default=`{{projectNumber}}` |
| Scope Package Name | `Title` | Text | Yes | |
| Status | `Status` | Choice | Yes | `Pending Bids \| Bids Received \| Under Review \| Awarded \| Executed \| On Hold` |
| Division | `Division` | Choice | No | `Division 01 \| Division 02 \| Division 03 \| Division 04 \| Division 05 \| Division 06 \| Division 07 \| Division 08 \| Division 09 \| Division 10 \| Division 11 \| Division 12 \| Division 13 \| Division 14 \| Division 15 \| Division 16 \| Other` |
| Budget Amount | `BudgetAmount` | Number | No | |
| Award Amount | `AwardAmount` | Number | No | |
| Awarded To | `AwardedTo` | Text | No | |
| Award Date | `AwardDate` | DateTime | No | |
| Contract Executed Date | `ContractExecutedDate` | DateTime | No | |
| NTP Date | `NTPDate` | DateTime | No | Notice to Proceed |
| Scheduled Start Date | `ScheduledStartDate` | DateTime | No | |
| Scheduled Completion Date | `ScheduledCompletionDate` | DateTime | No | |
| Insurance COI Received | `InsuranceCOIReceived` | Boolean | No | |
| Bonding Required | `BondingRequired` | Boolean | No | |
| Bond Received | `BondReceived` | Boolean | No | |
| Procore Subcontract ID | `ProcoreSubcontractId` | Text | No | Bridge to Procore post-award contract (see §6.6) |
| Notes | `Notes` | MultiLineText | No | |

### 6.2 Buyout Bid Lines (child, provisioningOrder=20)

| Field | InternalName | Type | Required | Choices / Notes |
|-------|-------------|------|----------|-----------------|
| Project ID | `pid` | Text | Yes | indexed, default=`{{projectNumber}}` |
| Bid Description | `Title` | Text | Yes | |
| Buyout Log | `ParentRecord` | Lookup | Yes | → `Buyout Log:ID` |
| Subcontractor Name | `SubcontractorName` | Text | Yes | |
| Bid Amount | `BidAmount` | Number | No | |
| Bid Date | `BidDate` | DateTime | No | |
| Bid Status | `BidStatus` | Choice | No | `Invited \| Pending \| Submitted \| Declined \| Awarded \| Alternate \| Rejected` |
| Scope | `Scope` | MultiLineText | No | |
| Contact Name | `ContactName` | Text | No | |
| Contact Email | `ContactEmail` | Text | No | |
| Notes | `Notes` | MultiLineText | No | |

### 6.3 Draw Schedule (flat, provisioningOrder=10)

| Field | InternalName | Type | Required | Choices / Notes |
|-------|-------------|------|----------|-----------------|
| Project ID | `pid` | Text | Yes | indexed, default=`{{projectNumber}}` |
| Line Item Description | `Title` | Text | Yes | |
| Cost Code | `CostCode` | Text | No | |
| Contract Budget | `ContractBudget` | Number | No | |
| Current Forecast | `CurrentForecast` | Number | No | |
| Billed to Date | `BilledToDate` | Number | No | |
| Remaining Budget | `RemainingBudget` | Number | No | |
| Percent Complete | `PercentComplete` | Number | No | |
| Status | `Status` | Choice | Yes | `On Track \| At Risk \| Over Budget \| Complete` |
| Last Updated | `LastUpdated` | DateTime | No | |
| Notes | `Notes` | MultiLineText | No | |

### 6.4 Financial Forecast Status (flat, provisioningOrder=10)

| Field | InternalName | Type | Required | Choices / Notes |
|-------|-------------|------|----------|-----------------|
| Project ID | `pid` | Text | Yes | indexed, default=`{{projectNumber}}` |
| Forecast Period | `Title` | Text | Yes | |
| Forecast Month | `ForecastMonth` | DateTime | Yes | |
| Status | `Status` | Choice | Yes | `Not Started \| In Progress \| Submitted \| Approved` |
| Procore Budget Updated | `ProcoreBudgetUpdated` | Boolean | No | Checklist gate |
| Forecast Summary Complete | `ForecastSummaryComplete` | Boolean | No | Checklist gate |
| Vendor Quotes Received | `VendorQuotesReceived` | Boolean | No | Checklist gate |
| GC-GR Updated | `GCGRUpdated` | Boolean | No | Checklist gate |
| Contract Type | `ContractType` | Choice | No | `CM/GMP \| Lump Sum \| Cost Plus \| Other` |
| Project Type | `ProjectType` | Choice | No | `New Construction \| Renovation \| Other` |
| Submitted By | `SubmittedBy` | User | No | |
| Submission Date | `SubmissionDate` | DateTime | No | |
| Notes | `Notes` | MultiLineText | No | |

### 6.5 Subcontract Compliance Log (flat, provisioningOrder=10)

| Field | InternalName | Type | Required | Choices / Notes |
|-------|-------------|------|----------|-----------------|
| Project ID | `pid` | Text | Yes | indexed, default=`{{projectNumber}}` |
| Requirement Description | `Title` | Text | Yes | |
| Subcontractor Name | `SubcontractorName` | Text | Yes | |
| Requirement Type | `RequirementType` | Choice | Yes | `General Liability Insurance \| Workers Comp Insurance \| Auto Insurance \| Professional Liability \| Umbrella \| Payment Bond \| Performance Bond \| Safety Program \| OSHA Compliance \| W-9 \| Other` |
| Status | `Status` | Choice | Yes | `Required — Not Received \| Received \| Verified \| Expired \| Waived` |
| Date Requested | `DateRequested` | DateTime | No | |
| Date Received | `DateReceived` | DateTime | No | |
| Expiration Date | `ExpirationDate` | DateTime | No | |
| Document Link | `DocumentLink` | URL | No | Link to compliance document |
| Waiver Approval | `WaiverApproval` | Text | No | |
| Notes | `Notes` | MultiLineText | No | |

### 6.6 Buyout Log vs Procore Boundary

The Buyout Log and Procore occupy **complementary but distinct** domains in the subcontract lifecycle:

| Aspect | Buyout Log (HB Intel) | Procore |
|--------|----------------------|---------|
| **Phase** | Pre-award bidding intelligence | Post-award contract authority |
| **Scope** | Scope packages, bid solicitation, award decisions | Executed contracts, cost codes, actuals |
| **Authority** | Operative during bidding and award | Authoritative after contract execution |
| **Data** | Budget estimates, bid comparisons, award rationale | Committed values, change orders, invoices |

**Bridge:** The `ProcoreSubcontractId` field on Buyout Log links a scope package to its corresponding Procore subcontract record after award. This is a one-directional Text reference (not a live integration). During transition: Buyout Log is operative pre-award; Procore is authoritative post-award.

### 6.7 Draw Schedule — Simplified Model

The Draw Schedule list uses a **row-per-budget-line** structure rather than a monthly exploded matrix:

- SharePoint custom lists cannot natively replicate a monthly cash-flow matrix (columns-per-month) without schema changes each period
- The simplified structure tracks cumulative budget, forecast, billed, and remaining per line item
- The seeded `Draw Schedule Template.xlsx` is the operational tool for detailed monthly draw management during the transition period
- Wave 1 financial intelligence features will consume the simplified list data for project-level financial health indicators

### 6.8 Subcontract Compliance (T06) vs Sub Safety Certifications (T04) Boundary

These two lists track **mutually exclusive** compliance domains for subcontractors:

| Aspect | Subcontract Compliance Log (T06) | Sub Safety Certifications (T04) |
|--------|----------------------------------|--------------------------------|
| **Domain** | Legal and insurance compliance | Safety training and certification |
| **Tracks** | General liability, workers comp, auto, professional liability, umbrella insurance; payment and performance bonds; W-9s | OSHA 10/30 certs, competent person certs, equipment operator certs, first aid/CPR |
| **Owner** | Project management / accounting | Safety department |
| **Family** | `financial` | `safety` |

No overlapping records — a subcontractor's insurance COI goes in T06; their OSHA 30 card goes in T04. The `Safety Program` and `OSHA Compliance` choices in T06's `RequirementType` refer to program-level documentation (does the sub have a written safety program?), not individual certifications.

### GC-GR Treatment

The GC-GR (General Conditions / General Requirements) analysis is classified as **reference-file-only** in the T06 seeded-file model. No dedicated list is created:

- GC-GR tracking is document-centric (spreadsheet analysis of line-item costs)
- The `GCGRUpdated` Boolean field on `Financial Forecast Status` tracks whether the GC-GR analysis has been refreshed as part of each forecast cycle
- GC-GR analysis workflows are Wave 1 scope (`@hbc/post-bid-autopsy` or dedicated financial intelligence module)

### Future Feature Targets

The following are recognized but receive **no G2 provisioning action** — they are logged as Wave 1+ inputs:

- **Lessons Learned** → Future feature target for `@hbc/post-bid-autopsy` (Wave 2+)
- **Subcontractor Scorecard SOP** → Future feature target for `@hbc/post-bid-autopsy` (Wave 2+)

### Seeded File Mapping

| File Name | Format | Target Library | Classification |
|-----------|--------|---------------|----------------|
| Buyout Log Template.xlsx | Excel | Project Documents | Reference file only |
| Draw Schedule Template.xlsx | Excel | Project Documents | Seed now |
| Financial Forecast Checklist.xlsx | Excel | Project Documents | Reference file only |

### Cross-Family References

- **Closeout (T03):** Closeout Checklist completion milestones may correlate with final payment milestones tracked in Draw Schedule. Cross-family Lookup fields are Wave 1 scope.
- **Project Controls (T05):** Permit costs tracked in T05's `Permit Log` (`CostAmount`) relate to budget line items in Draw Schedule. No Lookup — tracked independently.
- **Safety (T04):** Sub Safety Certifications (T04) and Subcontract Compliance Log (T06) are complementary but mutually exclusive (see §6.8). No cross-family Lookup.

### Deferred Decisions

- ~~**T07:** Wiring financial definitions into Step 4 provisioning dispatch.~~ — **Done.** Financial lists wired into `workflow-list-definitions.ts` and provisioned via Step 4.
- **T07 (T06-R2):** ~~Deferred to T07~~ — **T07 Decision: Simplified model confirmed.** Row-per-budget-line structure is the production model. Monthly exploded matrix deferred to Wave 1 financial intelligence features. `Draw Schedule Template.xlsx` remains the operational bridge.
- **T07 (T06-R3):** ~~Deferred to T07~~ — **Resolved by T08.** Buyout Log vs Procore boundary documentation deferred to T08 list description enrichment scope.
- **T07 (T06-R4):** ~~Deferred to T07~~ — **Resolved by T08.** Subcontract Compliance vs T04 Sub Safety Certifications boundary enforcement deferred to T08 list description enrichment scope.
- **T09:** Integration tests for financial list provisioning.
- **Wave 1:** Financial intelligence features, GC-GR analysis workflows, draw schedule monthly matrix, financial health dashboard.
- **Wave 2+:** Lessons Learned, Subcontractor Scorecard SOP (`@hbc/post-bid-autopsy`).

---

*End of Workflow List Schemas v1.1 — T07 resolved: all 5 families wired into provisioning, PunchBatchId added, safety-pack consolidated, pre-seeded items deferred to Wave 1, Draw Schedule simplified model confirmed, T06-R3/R4 description enrichment deferred to T08*
