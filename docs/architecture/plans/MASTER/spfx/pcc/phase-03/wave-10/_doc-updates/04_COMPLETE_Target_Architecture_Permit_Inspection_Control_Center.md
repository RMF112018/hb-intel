# COMPLETE Target Architecture — Permit & Inspection Control Center

Generated: 2026-05-01

## 1. Module Identity

### Official Wave Name

**Phase 3 / Wave 10 — Permit & Inspection Control Center**

### Legacy / Prior Name

`Permit Log`

### User-Facing Description

A governed project-control surface for permit lifecycle tracking, required inspection readiness, AHJ launcher access, fee exposure, failed/reinspection workflows, evidence-backed closeout, and readiness/schedule-risk escalation.

### Technical Interpretation

The user-facing Wave 10 surface is unified. Internally, the architecture may preserve distinct record families and module IDs:

- `permits`
- `required-inspections`

This allows the repo to retain current registry continuity while presenting a single coherent operating experience.

---

## 2. Objective

The Permit & Inspection Control Center transforms spreadsheet-based permit and inspection logs into a role-aware, evidence-backed, exception-first project-control surface.

The module must help users answer:

- What permits are required?
- What inspections are required?
- Who owns each item?
- What is late, expiring, failed, blocked, missing evidence, or fee-exposed?
- What AHJ link/contact/process applies?
- What work or readiness gate is blocked?
- What evidence proves status?
- What requires action now?

---

## 3. Product Principles

1. **Unified operating surface** — permits and inspections are managed together because they are operationally dependent.
2. **Exception-first UX** — the command center should prioritize blockers, late items, failed inspections, missing evidence, unpaid fees, expiring permits, and upcoming inspection windows.
3. **Evidence-backed closeout** — completion without proof is not trusted.
4. **Launcher-only AHJ boundary** — PCC can store and launch AHJ URLs but must not interact with AHJ systems.
5. **Internal source of truth** — PCC owns internal status, responsibility, readiness impact, audit, and action generation.
6. **AHJ authority preserved** — AHJ portals/records remain the legal external authority.
7. **Template-informed, not template-constrained** — workbook fields seed traceability; product architecture can exceed the spreadsheet.
8. **Role-aware actions** — update, override, fee visibility, evidence, and closeout actions must respect PCC personas.
9. **Readiness-integrated** — permit/inspection posture must feed Project Readiness, Priority Actions, and Approvals / Checkpoints.
10. **No hidden integrations** — any future live integration must be separately authorized.

---

## 4. Source-of-Record Posture

| Data / Action | Source of Truth |
|---|---|
| Internal permit workflow status | PCC |
| Internal inspection workflow status | PCC |
| Legal AHJ status | AHJ portal / AHJ record |
| Evidence documents | HB Document Control Center / SharePoint project record |
| Fee visibility and exposure | PCC |
| Payment/accounting execution | Deferred / accounting system; not Wave 10 |
| Audit history | PCC |
| Readiness impact | PCC Project Readiness framework |
| Priority action generation | PCC Priority Actions Rail |
| Approval / override decisions | PCC Approvals / Checkpoints |
| External navigation | AHJ launcher links only |
| Procore reference | Launcher/reference only unless later authorized |

---

## 5. Core Information Architecture

### Primary Surface

Permit & Inspection Control Center

### Primary Lanes

1. Command Center Overview
2. Permit Lifecycle Lane
3. Inspection Readiness Lane
4. Failed / Reinspection Queue
5. AHJ Launcher & Jurisdiction Panel
6. Fee Exposure Panel
7. Evidence & Closeout Panel
8. Audit / History Panel

### Secondary Views

- Permit table
- Inspection table
- Calendar / inspection window view
- AHJ profile view
- Fee exposure list
- Evidence completeness list
- Priority action list
- Export / report view

---

## 6. UX Model

## 6.1 Command Center Landing

The first screen must answer what needs action now.

Recommended cards:

| Card | Purpose |
|---|---|
| Permits Blocking Work | Permits whose status blocks a readiness gate or scheduled work |
| Inspections Ready to Request | Inspections where readiness criteria are met but request has not been made |
| Failed / Reinspection Required | Failed inspections requiring corrective action or reinspection |
| Expiring Permits | Permits nearing expiration |
| Fees / Receipts Open | Permit fees or reinspection fees awaiting payment/evidence |
| Evidence Missing | Issued/passed/closed records missing proof |
| Conditions Open | Issued permits with unresolved AHJ conditions |
| CO / TCO / Final Exposure | Items blocking occupancy or final closeout |

## 6.2 Permit Lifecycle Lane

Suggested visual grouping:

- Required
- In Preparation
- Submitted
- Under Review
- Comments Returned
- Revision Required
- Resubmitted
- Issued
- Conditions Open
- Closed
- Expired / Void / Not Required

## 6.3 Inspection Readiness Lane

Suggested visual grouping:

- Not Ready
- Ready to Request
- Requested
- Scheduled
- Passed
- Failed
- Reinspection Required
- Closed
- Not Required

## 6.4 Failed / Reinspection Queue

Each failed inspection should create or support:

- failed item summary
- corrective action
- correction owner
- correction due date
- parent inspection ID
- child reinspection ID
- reinspection requested date
- reinspection scheduled window
- reinspection fee
- evidence requirement
- final reinspection result

## 6.5 AHJ Launcher Panel

Project-specific AHJ cards should include:

- AHJ name
- department
- permit portal URL
- inspection portal URL
- fee schedule URL
- contact phone/email
- office hours
- inspection request cutoff notes
- local process notes
- "Launch Portal" action

The module must not scrape, call, submit to, schedule through, or authenticate against the AHJ portal.

## 6.6 Record Detail Drawer

Permit and inspection records should open in a detail drawer or side panel with:

- summary
- status
- owner
- assigned user
- dates
- fees
- AHJ details
- related records
- evidence
- comments
- readiness impact
- priority actions
- audit history

---

## 7. Data Model

## 7.1 Permit Record

Required fields:

| Field | Type | Notes |
|---|---|---|
| `permitId` | string | PCC unique ID |
| `projectId` | string | Project reference |
| `permitType` | enum/string | Master, trade, site, logistics, fire, elevator, etc. |
| `permitSubType` | enum/string | Electrical, Plumbing, Mechanical, Fire Alarm, etc. |
| `scopeDescription` | string | Work covered |
| `location` | string | Building/area/site |
| `permitNumber` | string | AHJ permit number |
| `applicationNumber` | string | AHJ application/process number if separate |
| `revision` | string/number | Required by chat; permit application revision |
| `revisionReason` | string | Why revision was required/submitted |
| `applicationValue` | currency | Required by chat; estimated value of work covered |
| `permitFee` | currency | Required by chat; fee assessed by AHJ for permit issuance |
| `feePaidStatus` | enum | Not Due, Due, Paid, Waived, Unknown |
| `feeReceiptEvidenceLink` | reference | Link to receipt/evidence |
| `responsibleContractor` | string | Contractor/license holder |
| `ownerPersona` | enum | PCC persona |
| `assignedUser` | string | User/UPN |
| `ahjId` | string | AHJ profile reference |
| `dateRequired` | date | Required-by date |
| `dateSubmitted` | date | Submitted to AHJ |
| `dateResubmitted` | date | Resubmission date |
| `dateIssued` | date | Permit issued/received date |
| `dateExpires` | date | Expiration date |
| `status` | enum | Permit status |
| `conditionsOpen` | boolean | AHJ conditions unresolved |
| `conditionsSummary` | string | AHJ conditions |
| `conditionsResolvedDate` | date | Closed condition date |
| `comments` | string | Notes |
| `relatedInspectionIds` | string[] | Related required inspections |
| `relatedReadinessItemId` | string | Project Readiness link |
| `relatedPriorityActionId` | string | Priority Action link |
| `relatedApprovalCheckpointId` | string | Approval/checkpoint link |
| `evidenceLinks` | reference[] | Permit card, issued permit, approved drawings, comments |
| `auditHistory` | event[] | Business audit trail |
| `sourceWorkbookReference` | object | Workbook/sheet/row/column traceability |

## 7.2 Inspection Record

Required fields:

| Field | Type | Notes |
|---|---|---|
| `inspectionId` | string | PCC unique ID |
| `projectId` | string | Project reference |
| `relatedPermitId` | string | Related permit |
| `relatedPermitNumber` | string | AHJ permit number |
| `inspectionType` | enum/string | Building, fire, civil, MEP, special, etc. |
| `inspectionCode` | string | AHJ/code identifier |
| `inspectionNumber` | string | AHJ/system inspection number |
| `inspectionRequestId` | string | Request reference if provided |
| `location` | string | Building/area |
| `readinessCriteria` | string[] | Required before requesting |
| `requestedBy` | string | User/role |
| `dateCalledIn` | date | From workbook |
| `requestedDate` | date | Internal/AHJ request date |
| `scheduledDate` | date | Scheduled date |
| `scheduledWindow` | string | AM/PM/time window |
| `inspectorOrAgency` | string | Inspector/AHJ/third party |
| `result` | enum | Pass, Fail, N/A, Partial if authorized |
| `resultDate` | date | Result date |
| `comments` | string | Inspector comments / notes |
| `verifiedOnline` | boolean/string | From workbook |
| `verifiedBy` | string | Verification owner |
| `verifiedDate` | date | Verification date |
| `failedItemSummary` | string | Deficiencies |
| `correctiveActionRequired` | boolean | Correction required |
| `correctiveActionOwner` | string | Owner |
| `reinspectionRequired` | boolean | Reinspection required |
| `parentInspectionId` | string | Parent failed inspection |
| `childReinspectionId` | string | Child reinspection |
| `reInspectionFee` | currency | Required by chat; fee assessed by AHJ for reinspection |
| `feePaidStatus` | enum | Not Due, Due, Paid, Waived, Unknown |
| `resultEvidenceLink` | reference | Report/result evidence |
| `jobCardEvidenceLink` | reference | Job card/signoff image/PDF |
| `relatedObservationOrIssueId` | string | Corrective action/issue |
| `relatedReadinessItemId` | string | Project Readiness link |
| `relatedPriorityActionId` | string | Priority Action link |
| `auditHistory` | event[] | Business audit trail |
| `sourceWorkbookReference` | object | Workbook/sheet/row/column traceability |

## 7.3 AHJ / Jurisdiction Profile

| Field | Type | Notes |
|---|---|---|
| `ahjId` | string | Unique ID |
| `name` | string | AHJ name |
| `jurisdictionType` | enum | City, county, fire, utility, special district, third party |
| `department` | string | Building/fire/planning/etc. |
| `permitPortalUrl` | URL | Launcher only |
| `inspectionPortalUrl` | URL | Launcher only |
| `feeScheduleUrl` | URL | Launcher only |
| `contactPhone` | string | Informational |
| `contactEmail` | string | Informational |
| `officeHours` | string | Informational |
| `inspectionCutoffNotes` | string | Manual process note |
| `localProcessNotes` | string | Manual process note |
| `lastVerifiedDate` | date | Manual verification |
| `verifiedBy` | string | User/role |
| `source` | string | Manual/admin configured |

## 7.4 Fee Exposure Record

| Field | Type | Notes |
|---|---|---|
| `feeId` | string | Unique ID |
| `projectId` | string | Project |
| `recordType` | enum | Permit, Revision, Reinspection, TCO, CO, Renewal |
| `relatedRecordId` | string | Permit/inspection ID |
| `feeType` | enum | Application, Permit, Revision, Reinspection, Renewal, TCO, CO, Other |
| `amount` | currency | Fee value |
| `status` | enum | Not Due, Due, Paid, Waived, Disputed, Unknown |
| `dueDate` | date | If known |
| `paidDate` | date | If known |
| `payer` | string | HBC/sub/owner/etc. |
| `receiptEvidenceLink` | reference | Receipt |
| `accountingReference` | string | Optional/future |

---

## 8. Status Model

## 8.1 Permit Statuses

Baseline statuses:

- Not Required
- Required
- In Preparation
- Submitted
- Under Review
- Comments Returned
- Revision Required
- Resubmitted
- Approved / Issued
- Conditions Open
- Closed
- Expired
- Void
- Blocked
- Unknown

## 8.2 Inspection Statuses

Baseline statuses:

- Not Required
- Required
- Not Ready
- Ready to Request
- Requested
- Scheduled
- Passed
- Failed
- Reinspection Required
- Reinspection Scheduled
- Canceled
- Closed
- Blocked
- Unknown

## 8.3 Fee Statuses

- Not Applicable
- Not Due
- Due
- Paid
- Waived
- Disputed
- Unknown

## 8.4 Evidence Statuses

- Not Required
- Required
- Missing
- Provided
- Accepted
- Rejected / Needs Replacement
- Override Accepted

---

## 9. Status Transition Rules

## 9.1 Permit Transition Rules

Allowed normal progression:

`Required → In Preparation → Submitted → Under Review → Comments Returned → Revision Required → Resubmitted → Under Review → Approved / Issued → Conditions Open → Closed`

Alternative paths:

- `Required → Not Required`
- `Submitted / Under Review → Blocked`
- `Approved / Issued → Expired`
- `Expired → Required` if renewal/completion permit required
- `Approved / Issued → Closed` only if evidence is attached or override accepted

## 9.2 Inspection Transition Rules

Allowed normal progression:

`Required → Not Ready → Ready to Request → Requested → Scheduled → Passed → Closed`

Failure path:

`Scheduled → Failed → Reinspection Required → Reinspection Scheduled → Passed → Closed`

Alternative paths:

- `Required → Not Required`
- `Ready to Request → Blocked`
- `Requested → Canceled`
- `Scheduled → Canceled`
- `Failed → Closed` only with authorized no-reinspection decision and audit reason

---

## 10. Role / Action Model

| Action | Recommended Authorized Roles |
|---|---|
| View permits / inspections | PM, PX, Superintendent, Project Coordinator, Project Accounting, Safety / QAQC, Executive Oversight, Project Viewer, PCC Admin |
| Create permit record | PM, PX, Project Coordinator, PCC Admin |
| Create inspection record | PM, Superintendent, Project Coordinator, Safety / QAQC, PCC Admin |
| Update normal status | Assigned owner, PM, Superintendent, Project Coordinator, Safety / QAQC where applicable |
| Update fee fields | PM, Project Coordinator, Project Accounting, PCC Admin |
| Mark permit issued / closed | PM, PX, Project Coordinator, PCC Admin |
| Mark inspection passed / failed | Superintendent, PM, Safety / QAQC, Project Coordinator, PCC Admin |
| Create reinspection item | Superintendent, PM, Safety / QAQC, Project Coordinator |
| Attach evidence | Assigned owner, PM, Superintendent, Project Coordinator, Project Accounting, Safety / QAQC |
| Override status | PCC Admin, PX, PM, Manager of Operational Excellence |
| Configure templates | PCC Admin, Manager of Operational Excellence; PM/PX only for project-level allowed configuration |
| View audit | PCC Admin, IT Admin, PX, PM, Manager of Operational Excellence, Executive Oversight |

---

## 11. Priority Action Generation Rules

Generate Priority Actions when:

- permit is required and not started within configured lead time
- permit is submitted but review age exceeds threshold
- comments returned and no revision owner is assigned
- revision required and due date is approaching/overdue
- permit expires within configured warning window
- permit is expired
- permit fee due or receipt missing
- issued permit lacks evidence
- AHJ conditions remain open past due date
- inspection is ready to request but not requested
- inspection is scheduled in the next configured window
- inspection failed
- reinspection required but not scheduled
- reinspection fee due
- inspection passed but evidence/job-card proof missing
- final/TCO/CO-related inspection is blocking closeout

---

## 12. Project Readiness Integration

Permit and inspection records should feed the Wave 8 Project Readiness framework.

Readiness domains:

- Permits / Jurisdiction
- Safety / QAQC
- Startup / Mobilization
- Schedule / Milestones
- Closeout / Turnover

Readiness impact examples:

| Condition | Readiness Impact |
|---|---|
| Master building permit not issued | Startup / mobilization blocked |
| Trade permit not issued | Trade work blocked |
| Permit expired | Work-at-risk / stop-work risk |
| Inspection not ready | Follow-on work at-risk |
| Failed inspection | Work blocked / rework exposure |
| Reinspection not scheduled | Schedule risk |
| Missing permit evidence | Closeout confidence risk |
| CO/TCO inspection incomplete | Occupancy/turnover blocked |

---

## 13. Approvals / Checkpoints Integration

Approvals / Checkpoints should be used for:

- permit status override
- evidence-free closeout override
- expired permit handling decision
- permit condition closure approval
- reinspection waiver/no-reinspection decision
- high-impact fee exposure acknowledgement
- CO/TCO readiness checkpoint
- AHJ process exception

---

## 14. HB Document Control Center Integration

Evidence links should resolve to Document Control / SharePoint project record references where available.

Evidence categories:

- permit application
- permit revision package
- issued permit
- permit card / job card
- approved stamped drawings
- AHJ comments
- fee receipt
- inspection request confirmation
- inspection result
- failed inspection notice
- corrective-action evidence
- reinspection result
- final inspection signoff
- TCO / CO / CC certificate

Wave 10 should not upload/sync/manage files directly unless later implementation scope explicitly authorizes it. Documentation should describe evidence references and Document Control ownership.

---

## 15. Template / Configuration Model

Recommended configuration layers:

1. Company baseline permit and inspection templates
2. Project-type templates
3. Region/AHJ templates
4. Project-specific overrides
5. Record-level exceptions

Controlled configurable items:

- permit types
- inspection types
- readiness gates
- status visibility
- fee exposure types
- evidence requirements
- warning thresholds
- AHJ launcher cards
- local process notes

Global template configuration should be limited to PCC Admin and Manager of Operational Excellence. Project-level overrides may be allowed for PM/PX within controlled boundaries.

---

## 16. Reporting Model

Recommended dashboards:

- PM Command View
- PX Risk View
- Superintendent Field Readiness View
- Project Coordinator Action Queue
- Project Accounting Fee Exposure View
- Safety / QAQC Inspection View
- Executive Read-Only Summary
- Closeout / CO / TCO Readiness View

Recommended filters:

- AHJ
- permit type
- inspection type
- location/building
- responsible contractor
- owner
- status
- due date
- expiration window
- fee status
- evidence status
- readiness impact
- failed/reinspection state

---

## 17. Audit Model

Audit event types:

- record created
- owner assigned
- owner changed
- status changed
- due date changed
- permit submitted
- revision submitted
- AHJ comment logged
- permit issued
- fee entered
- fee status changed
- evidence attached
- evidence accepted/rejected
- inspection requested
- inspection scheduled
- inspection result changed
- failure logged
- corrective action created
- reinspection created
- override requested
- override approved/rejected
- record closed

Minimum audit fields:

- event ID
- event type
- record ID
- actor
- actor persona
- timestamp
- old value
- new value
- reason/comment
- related evidence
- correlation ID

---

## 18. Import / Migration Model

The architecture must support converting existing workbook data into governed records.

Recommended import phases:

1. workbook source inventory
2. sheet/column extraction
3. row classification
4. field mapping
5. status normalization
6. date normalization
7. permit/inspection relationship inference
8. ambiguity queue
9. source traceability capture
10. import preview
11. import acceptance / rejection

The first implementation should not silently import ambiguous data.

---

## 19. Guardrails

- No AHJ scraping/API integration.
- No external portal automation.
- No external credential storage.
- No automated permit submission.
- No automated inspection scheduling.
- No automated AHJ status lookup.
- No external writeback.
- No hidden Procore/Microsoft/Adobe/Document Crunch/Sage/Compass integration.
- No direct SPFx tenant mutation.
- No package/dependency/lockfile changes during docs-only update.
- No claim that PCC legal status supersedes AHJ.
- No evidence-free closed status without authorized override.
- No free-form status sprawl that breaks reporting.
- No spreadsheet-first UX as the primary experience.

---

## 20. Acceptance Criteria

Wave 10 planning documentation is acceptable when:

- Wave 10 is renamed/redefined as Permit & Inspection Control Center.
- Prior Permit Log naming is preserved only as legacy/subcomponent context.
- Permit and required inspection records are both first-class.
- Required chat fields are present:
  - `revision`
  - `applicationValue`
  - `permitFee`
  - `reInspectionFee`
- Workbook source traceability is documented.
- AHJ launcher-only posture is explicit.
- Procore launcher/reference-only posture is explicit.
- UX is exception-first and not spreadsheet-first.
- Fee exposure, evidence, failed inspection, and reinspection workflows are first-class.
- Role/action model is documented.
- Status model and transition rules are documented.
- Project Readiness, Priority Actions, Approvals / Checkpoints, HB Document Control Center, External Systems, and Site Health relationships are documented.
- Guardrails are documented.
- No runtime implementation is implied.
- No external integration is implied.
