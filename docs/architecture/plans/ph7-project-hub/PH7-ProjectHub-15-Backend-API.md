# PH7.15 — Project Hub: Backend API & SharePoint Schemas

**Version:** 1.0
**Governed by:** CLAUDE.md v1.2 · `PH7-ProjectHub-Features-Plan.md`
**Purpose:** Define all Azure Functions HTTP triggers for the Project Hub, all SharePoint list schemas, and the Procore budget CSV/Excel parsing service. All endpoints must be secured with Bearer token validation.
**Audience:** Implementation agent(s), technical reviewers.
**Implementation Objective:** A complete, production-ready backend layer that all Project Hub frontend pages consume. Every endpoint validates the caller's Bearer token, checks project membership, and operates via Managed Identity for SharePoint writes.

> **Terminology Note (PH7.9 — 2026-03-09):** "Production-ready backend layer" in this Implementation Objective refers to the **Code-Ready** scope. Full Production-Ready status requires Environment-Ready and Operations-Ready gates, which are tracked separately per the [Release Readiness Taxonomy](../../../reference/release-readiness-taxonomy.md).

---

## Prerequisites

- PH6.2 complete (Bearer token validation middleware in place).
- `apps/functions/src/middleware/authMiddleware.ts` — Bearer token validator available.
- SharePoint site provisioned with a `ProjectHub` subsite or the root site collection available for list creation.

---

## 7.15.1 — Auth Middleware Pattern (Applied to All Endpoints)

Every Project Hub endpoint must use the following pattern:

```typescript
// Applied to every Project Hub HTTP trigger

async function handler(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  // 1. Validate Bearer token
  const user = await validateBearerToken(request);
  if (!user) return { status: 401, body: 'Unauthorized' };

  // 2. Extract projectId from route params
  const { projectId } = request.params;

  // 3. Verify user is a project member (or Admin)
  const isMember = await isProjectMember(projectId, user.upn);
  if (!isMember && user.role !== 'Admin') {
    return { status: 403, body: 'Forbidden — not a project member' };
  }

  // 4. Execute handler logic
  // ...
}
```

---

## 7.15.2 — Complete API Endpoint Registry

### Project / Dashboard Endpoints

| Method | Path | Handler | Description |
|---|---|---|---|
| GET | `/api/project-hub/my-projects` | `getMyProjects` | Projects where current user is a team member |
| GET | `/api/project-hub/projects/:projectId` | `getProject` | Single project record |
| GET | `/api/project-hub/projects/:projectId/dashboard` | `getDashboard` | Aggregated dashboard snapshot |

### Preconstruction

| Method | Path | Description |
|---|---|---|
| GET | `/api/project-hub/projects/:projectId/go-no-go` | BD Go/No-Go record for project (read-only proxy) |
| GET | `/api/project-hub/projects/:projectId/kickoff-checklist` | Kickoff checklist items |
| PATCH | `/api/project-hub/projects/:projectId/kickoff-checklist/:itemId` | Update kickoff item (Estimating roles only) |
| GET | `/api/project-hub/projects/:projectId/estimate-summary` | Estimate panel summary (read-only proxy) |
| GET | `/api/project-hub/projects/:projectId/turnover` | Turnover to Ops record |
| PUT | `/api/project-hub/projects/:projectId/turnover` | Update turnover narrative |
| POST | `/api/project-hub/projects/:projectId/turnover/sign` | Record party sign-off |
| GET | `/api/project-hub/projects/:projectId/autopsy` | Post-bid autopsy (read-only proxy) |

### Project Management

| Method | Path | Description |
|---|---|---|
| GET | `/api/project-hub/projects/:projectId/pmp` | Get PMP |
| PUT | `/api/project-hub/projects/:projectId/pmp` | Create/update PMP |
| POST | `/api/project-hub/projects/:projectId/pmp/acknowledge` | Record acknowledgment |
| POST | `/api/project-hub/projects/:projectId/pmp/request-acknowledgments` | Send notifications to pending members |
| GET | `/api/project-hub/projects/:projectId/raci` | Get RACI matrix |
| POST | `/api/project-hub/projects/:projectId/raci/rows` | Add RACI row |
| PATCH | `/api/project-hub/projects/:projectId/raci/rows/:rowId` | Update RACI row |
| DELETE | `/api/project-hub/projects/:projectId/raci/rows/:rowId` | Delete RACI row |
| PUT | `/api/project-hub/projects/:projectId/raci/columns` | Update RACI columns |
| GET | `/api/project-hub/projects/:projectId/startup-checklist` | Get startup checklist |
| PATCH | `/api/project-hub/projects/:projectId/startup-checklist/:itemId` | Update item |
| GET | `/api/project-hub/projects/:projectId/closeout-checklist` | Get closeout checklist |
| PATCH | `/api/project-hub/projects/:projectId/closeout-checklist/:itemId` | Update item |

### Safety

| Method | Path | Description |
|---|---|---|
| GET | `/api/project-hub/projects/:projectId/sssp` | Get SSSP |
| PUT | `/api/project-hub/projects/:projectId/sssp` | Create/update SSSP |
| POST | `/api/project-hub/projects/:projectId/sssp/sub-acknowledgments` | Add/update sub acknowledgment |
| GET | `/api/project-hub/projects/:projectId/jha-log` | Get JHA log entries |
| POST | `/api/project-hub/projects/:projectId/jha-log` | Upload JHA entry |
| DELETE | `/api/project-hub/projects/:projectId/jha-log/:entryId` | Soft delete JHA entry |
| GET | `/api/project-hub/emergency-plans` | Company-wide emergency plans library |
| GET | `/api/project-hub/projects/:projectId/emergency-plan-acknowledgments` | Current year acks |
| POST | `/api/project-hub/projects/:projectId/emergency-plan-acknowledgments` | Record acknowledgment |
| GET | `/api/project-hub/projects/:projectId/incidents` | Get incident reports |
| POST | `/api/project-hub/projects/:projectId/incidents` | Submit incident (triggers notification) |
| GET | `/api/project-hub/projects/:projectId/incidents/:incidentId` | Get single report |

### Quality Control

| Method | Path | Description |
|---|---|---|
| GET | `/api/project-hub/projects/:projectId/qc-checklists` | Get all checklists |
| POST | `/api/project-hub/projects/:projectId/qc-checklists` | Create checklist |
| GET | `/api/project-hub/projects/:projectId/qc-checklists/:checklistId` | Checklist with items |
| PATCH | `/api/project-hub/projects/:projectId/qc-checklists/:checklistId/items/:itemId` | Update item result |
| POST | `/api/project-hub/projects/:projectId/qc-checklists/:checklistId/items` | Add custom item |
| DELETE | `/api/project-hub/projects/:projectId/qc-checklists/:checklistId/items/:itemId` | Remove item |
| GET | `/api/project-hub/projects/:projectId/qc-completion-summary` | Completion summary |
| GET | `/api/project-hub/projects/:projectId/third-party-inspections` | Inspection records |
| POST | `/api/project-hub/projects/:projectId/third-party-inspections` | Add inspection |
| PATCH | `/api/project-hub/projects/:projectId/third-party-inspections/:inspectionId` | Update |

### Warranty

| Method | Path | Description |
|---|---|---|
| GET | `/api/project-hub/projects/:projectId/warranty-requests` | Get all requests |
| POST | `/api/project-hub/projects/:projectId/warranty-requests` | Submit request |
| PATCH | `/api/project-hub/projects/:projectId/warranty-requests/:requestId` | Update status |
| GET | `/api/project-hub/projects/:projectId/warranty-documents` | Get warranty docs |
| POST | `/api/project-hub/projects/:projectId/warranty-documents` | Add warranty doc |
| PATCH | `/api/project-hub/projects/:projectId/warranty-documents/:docId` | Update |
| DELETE | `/api/project-hub/projects/:projectId/warranty-documents/:docId` | Delete |

### Financial

| Method | Path | Description |
|---|---|---|
| POST | `/api/project-hub/projects/:projectId/procore-budget-upload` | Upload + parse budget file |
| GET | `/api/project-hub/projects/:projectId/procore-budget` | Get parsed budget items |
| GET | `/api/project-hub/projects/:projectId/financial-summary` | Get summary |
| PUT | `/api/project-hub/projects/:projectId/financial-summary` | Update summary |
| GET | `/api/project-hub/projects/:projectId/gc-gr-forecast` | Get GC/GR forecast |
| PATCH | `/api/project-hub/projects/:projectId/gc-gr-forecast/:costCode` | Update line item |
| GET | `/api/project-hub/projects/:projectId/cash-flow` | Get cash flow rows |
| PATCH | `/api/project-hub/projects/:projectId/cash-flow/:rowId` | Update pay app |

### Schedule

| Method | Path | Description |
|---|---|---|
| POST | `/api/project-hub/projects/:projectId/schedule/upload` | Upload + parse schedule file |
| GET | `/api/project-hub/projects/:projectId/schedule/uploads` | Upload history |
| GET | `/api/project-hub/projects/:projectId/schedule/milestones` | Active milestones |
| POST | `/api/project-hub/projects/:projectId/schedule/milestones` | Add manual milestone |
| PATCH | `/api/project-hub/projects/:projectId/schedule/milestones/:milestoneId` | Update |
| GET | `/api/project-hub/projects/:projectId/schedule/summary` | Summary stats |

### Buyout Log

| Method | Path | Description |
|---|---|---|
| GET | `/api/project-hub/projects/:projectId/buyout-log` | Entries + summary |
| PATCH | `/api/project-hub/projects/:projectId/buyout-log/:entryId` | Update entry |
| POST | `/api/project-hub/projects/:projectId/buyout-log/entries` | Add custom row |

### Permit Log & Inspections

| Method | Path | Description |
|---|---|---|
| GET | `/api/project-hub/projects/:projectId/permit-log` | Get permits |
| POST | `/api/project-hub/projects/:projectId/permit-log` | Add permit |
| PATCH | `/api/project-hub/projects/:projectId/permit-log/:entryId` | Update permit |
| DELETE | `/api/project-hub/projects/:projectId/permit-log/:entryId` | Soft delete |
| GET | `/api/project-hub/projects/:projectId/permit-log/:permitId/inspections` | Get inspections |
| PATCH | `/api/project-hub/projects/:projectId/permit-log/:permitId/inspections/:inspectionId` | Update inspection |
| POST | `/api/project-hub/projects/:projectId/permit-log/:permitId/inspections` | Add inspection |

### Constraints Log

| Method | Path | Description |
|---|---|---|
| GET | `/api/project-hub/projects/:projectId/constraints` | Get constraints |
| POST | `/api/project-hub/projects/:projectId/constraints` | Add constraint |
| PATCH | `/api/project-hub/projects/:projectId/constraints/:entryId` | Update |
| DELETE | `/api/project-hub/projects/:projectId/constraints/:entryId` | Soft delete |
| GET | `/api/project-hub/projects/:projectId/change-tracking` | Get change tracking entries |
| POST | `/api/project-hub/projects/:projectId/change-tracking` | Add entry |
| PATCH | `/api/project-hub/projects/:projectId/change-tracking/:entryId` | Update |
| GET | `/api/project-hub/projects/:projectId/delay-log` | Get delay log entries |
| POST | `/api/project-hub/projects/:projectId/delay-log` | Add entry |
| PATCH | `/api/project-hub/projects/:projectId/delay-log/:entryId` | Update |

### Reports

| Method | Path | Description |
|---|---|---|
| GET | `/api/project-hub/projects/:projectId/px-reviews` | Review history |
| GET | `/api/project-hub/projects/:projectId/px-reviews/draft` | Auto-assembled draft |
| PUT | `/api/project-hub/projects/:projectId/px-reviews/draft` | Save narrative overrides |
| POST | `/api/project-hub/projects/:projectId/px-reviews/export` | Generate PDF |
| GET | `/api/project-hub/projects/:projectId/owner-reports` | Report history |
| GET | `/api/project-hub/projects/:projectId/owner-reports/draft` | Current draft |
| PUT | `/api/project-hub/projects/:projectId/owner-reports/draft` | Save |
| POST | `/api/project-hub/projects/:projectId/owner-reports/export` | Generate PDF |

---

## 7.15.3 — SharePoint List Schemas

All lists are created in the root HB Intel site collection (or per-project SharePoint site where noted). Deploy via setup script using PnPjs.

**Per-project lists** (created by provisioning saga Step 4 for each new project):
Lists marked with `[per-project]` are created inside the provisioned project SharePoint site.

**Global lists** (created in root HB Intel site):
Lists marked with `[global]` exist once and are scoped by `ProjectId` column.

---

### Startup & Closeout Checklist Items `[per-project]`

List name: `StartupChecklistItems`

| Column | Type | Required |
|---|---|---|
| `Title` | Single line | Yes — item text |
| `ProjectId` | Single line | Yes |
| `Category` | Single line | Yes |
| `Status` | Choice: NotStarted/InProgress/Complete/NA | Yes |
| `DueDate` | Date and Time | No |
| `CompletedByUpn` | Single line | No |
| `CompletedByName` | Single line | No |
| `CompletedAt` | Date and Time | No |
| `Notes` | Multiple lines | No |
| `SortOrder` | Number | Yes |

Repeat schema for `CloseoutChecklistItems` with additional columns:
| `HasDocument` | Yes/No | No |
| `DocumentUrl` | Hyperlink | No |
| `DocumentName` | Single line | No |

---

### Project Management Plan `[per-project]`

List name: `ProjectManagementPlans` — single item per project (versioned via `Version` column)

| Column | Type | Required |
|---|---|---|
| `ProjectId` | Single line | Yes |
| `Version` | Number | Yes |
| `ContentJson` | Multiple lines | Yes — serialized IProjectManagementPlan body |
| `CreatedByUpn` | Single line | Yes |
| `LastUpdatedAt` | Date and Time | Yes |

List name: `PmpAcknowledgments`

| Column | Type |
|---|---|
| `ProjectId` | Single line |
| `MemberUpn` | Single line |
| `MemberName` | Single line |
| `Role` | Single line |
| `Status` | Choice: Pending/Acknowledged/Declined |
| `AcknowledgedAt` | Date and Time |

---

### RACI Rows `[per-project]`

List name: `RaciRows`

| Column | Type |
|---|---|
| `ProjectId` | Single line |
| `TaskOrDecision` | Single line |
| `AssignmentsJson` | Multiple lines — serialized Record<string, RaciRole> |
| `Notes` | Multiple lines |
| `SortOrder` | Number |

---

### Site Specific Safety Plans `[per-project]`

List name: `SiteSafetyPlans` — single item per project

| Column | Type |
|---|---|
| `ProjectId` | Single line |
| `Version` | Number |
| `ContentJson` | Multiple lines — serialized ISiteSafetyPlan |
| `LastUpdatedAt` | Date and Time |

List name: `SubAcknowledgments`

| Column | Type |
|---|---|
| `ProjectId` | Single line |
| `SubcontractorCompany` | Single line |
| `ContactName` | Single line |
| `ContactUpn` | Single line |
| `Status` | Choice: Pending/Acknowledged/Declined |
| `AcknowledgedAt` | Date and Time |
| `DocumentType` | Choice: SSSP/JHA/EmergencyPlan |

---

### JHA Log Entries `[per-project]`

List name: `JhaLogEntries`

| Column | Type |
|---|---|
| `ProjectId` | Single line |
| `JhaDate` | Date and Time |
| `WorkActivity` | Single line |
| `PreparedByUpn` | Single line |
| `PreparedByName` | Single line |
| `PreparedByCompany` | Single line |
| `FileUrl` | Hyperlink |
| `FileName` | Single line |
| `FileUploadedAt` | Date and Time |
| `Notes` | Multiple lines |
| `IsDeleted` | Yes/No |

---

### Incident Reports `[per-project]`

List name: `IncidentReports`

| Column | Type |
|---|---|
| `ProjectId` | Single line |
| `ContentJson` | Multiple lines — serialized IIncidentReport |
| `IncidentDate` | Date and Time |
| `IncidentType` | Choice |
| `SubmittedByUpn` | Single line |
| `SubmittedAt` | Date and Time |

---

### QC Checklists & Items `[per-project]`

List name: `QcChecklists`

| Column | Type |
|---|---|
| `ProjectId` | Single line |
| `ChecklistName` | Single line |
| `CsiDivision` | Single line |
| `IsCustom` | Yes/No |
| `CreatedByUpn` | Single line |

List name: `QcChecklistItems`

| Column | Type |
|---|---|
| `ChecklistId` | Single line |
| `ProjectId` | Single line |
| `ItemText` | Single line |
| `Result` | Choice: Pass/Fail/NA/Pending |
| `CompletedByUpn` | Single line |
| `CompletedAt` | Date and Time |
| `Notes` | Multiple lines |
| `PhotoUrlsJson` | Multiple lines |
| `SortOrder` | Number |

---

### Warranty `[per-project]`

List name: `WarrantyRequests`

| Column | Type |
|---|---|
| `ProjectId` | Single line |
| `RequestNumber` | Single line |
| `ContentJson` | Multiple lines — serialized IWarrantyRequest |
| `Status` | Choice |
| `Urgency` | Choice |
| `SubmittedAt` | Date and Time |

List name: `WarrantyDocuments`

| Column | Type |
|---|---|
| `ProjectId` | Single line |
| `DocumentTitle` | Single line |
| `WarrantyExpirationDate` | Date and Time |
| `AlertDaysBefore` | Number |
| `AlertSentAt` | Date and Time |
| `ContentJson` | Multiple lines |

---

### Financial Forecast `[per-project]`

List name: `FinancialForecastSummaries` — one row per period

| Column | Type |
|---|---|
| `ProjectId` | Single line |
| `ForecastPeriodEnding` | Date and Time |
| `ContentJson` | Multiple lines |

List names: `GcGrForecastLineItems`, `CashFlowRows`, `ForecastChecklistItems` — all follow the same pattern: `ProjectId`, `ContentJson`, plus key indexed fields for querying.

---

### Schedule `[per-project]`

List name: `ScheduleMilestones`

| Column | Type |
|---|---|
| `ProjectId` | Single line |
| `MilestoneCode` | Single line |
| `MilestoneName` | Single line |
| `Phase` | Single line |
| `BaselineDate` | Date and Time |
| `ForecastDate` | Date and Time |
| `ActualDate` | Date and Time |
| `Status` | Choice |
| `IsCriticalPath` | Yes/No |
| `SortOrder` | Number |
| `IsActive` | Yes/No |

List name: `ScheduleUploads`

| Column | Type |
|---|---|
| `ProjectId` | Single line |
| `FileName` | Single line |
| `FileFormat` | Choice: XER/XML/CSV |
| `UploadedByUpn` | Single line |
| `UploadedAt` | Date and Time |
| `ParsedMilestoneCount` | Number |
| `IsActive` | Yes/No |

---

### Buyout Log `[per-project]`

List name: `BuyoutLogEntries`

| Column | Type |
|---|---|
| `ProjectId` | Single line |
| `RefNumber` | Single line |
| `CsiDivision` | Single line |
| `CsiDescription` | Single line |
| `SubcontractorVendor` | Single line |
| `ContractAmount` | Currency |
| `OriginalBudget` | Currency |
| `LoiDateToBeSent` | Date and Time |
| `LoiReturnedExecuted` | Date and Time |
| `SubmittalDates` | Single line |
| `LeadTimes` | Single line |
| `SubName` | Single line |
| `BallInCourt` | Single line |
| `EnrolledInSdi` | Yes/No |
| `BondRequired` | Yes/No |
| `Comments` | Multiple lines |
| `SortOrder` | Number |

---

### Permit Log & Inspections `[per-project]`

List name: `PermitLogEntries`

| Column | Type |
|---|---|
| `ProjectId` | Single line |
| `RefNumber` | Single line |
| `Location` | Single line |
| `PermitType` | Choice: PRIMARY/SUB/TEMP |
| `PermitNumber` | Single line |
| `Description` | Single line |
| `ResponsibleContractor` | Single line |
| `Address` | Single line |
| `DateRequired` | Date and Time |
| `DateSubmitted` | Date and Time |
| `DateReceived` | Date and Time |
| `DateExpires` | Date and Time |
| `Status` | Choice |
| `Ahj` | Single line |
| `Comments` | Multiple lines |
| `SortOrder` | Number |

List name: `RequiredInspections`

| Column | Type |
|---|---|
| `ProjectId` | Single line |
| `PermitId` | Single line — lookup to PermitLogEntries |
| `InspectionName` | Single line |
| `CodeReference` | Single line |
| `DateCalledIn` | Date and Time |
| `Result` | Choice: Pass/Fail/N/A/Pending |
| `Comment` | Multiple lines |
| `VerifiedOnline` | Yes/No |
| `SortOrder` | Number |

---

### Constraints Log `[per-project]`

List name: `ConstraintEntries`

| Column | Type |
|---|---|
| `ProjectId` | Single line |
| `SequenceNumber` | Number |
| `Description` | Single line |
| `DateIdentified` | Date and Time |
| `Status` | Choice: Open/Closed |
| `Reference` | Single line |
| `Responsible` | Single line |
| `BallInCourt` | Single line |
| `DueDate` | Date and Time |
| `CompletionDate` | Date and Time |
| `Comments` | Multiple lines |
| `Category` | Choice (7 categories) |
| `SortOrder` | Number |

Repeat schema for `ChangeTrackingEntries` (same columns, no category) and `DelayLogEntries` (same + `DelayDays: Number`).

---

### Reports `[per-project]`

List name: `PxReviews`

| Column | Type |
|---|---|
| `ProjectId` | Single line |
| `ReviewDate` | Date and Time |
| `ContentJson` | Multiple lines |
| `PdfExportUrl` | Hyperlink |

List name: `OwnerReports`

| Column | Type |
|---|---|
| `ProjectId` | Single line |
| `ReportNumber` | Number |
| `ReportPeriodStart` | Date and Time |
| `ReportPeriodEnd` | Date and Time |
| `ContentJson` | Multiple lines |
| `PdfExportUrl` | Hyperlink |

---

## 7.15.4 — Provisioning Saga Integration

The following Project Hub SharePoint lists must be created during project provisioning (Step 4 of PH6 saga) for every new project:
- `StartupChecklistItems` — seeded with 37 items from master checklist template
- `CloseoutChecklistItems` — seeded with 43 items from master checklist template
- `BuyoutLogEntries` — seeded with 14 CSI division rows (no budget values yet)
- All other per-project lists created empty

The provisioning saga Step 4 must be updated (`PH6.4`) to include Project Hub list creation using PnPjs batch operations.

---

## Verification

```bash
# After implementing all endpoints:
pnpm turbo run build --filter=functions

# Spot-check auth: call any endpoint without Bearer token → expect 401
# Spot-check membership: call endpoint with valid token for non-member → expect 403

# Run SharePoint list setup script:
node scripts/setup-project-hub-lists.js --site-url {siteUrl}
# Verify all lists created with correct columns

# Verify provisioning saga Step 4 creates Project Hub lists for a test project
```

<!-- IMPLEMENTATION PROGRESS & NOTES
Task file created: 2026-03-07
Status: Ready for implementation
Next: PH7.16 — Testing, CI/CD & Documentation
-->
