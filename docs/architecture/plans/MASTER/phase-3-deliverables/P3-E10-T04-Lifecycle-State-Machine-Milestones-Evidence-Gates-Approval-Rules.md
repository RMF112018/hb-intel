# P3-E10-T04 — Lifecycle State Machine, Milestones, Evidence Gates, and Approval Rules

| Property | Value |
|----------|-------|
| **Doc ID** | P3-E10-T04 |
| **Parent** | [P3-E10 Project Closeout Module](P3-E10-Project-Closeout-Module-Field-Specification.md) |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Part** | T04 of 11 |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-24 |
| **Status** | Governing — locked architecture |

---

## 1. Hybrid Lifecycle Model

Project Closeout uses a **hybrid lifecycle model** with two distinct but interacting layers:

| Layer | What it governs | Who controls |
|---|---|---|
| **Project-level Closeout State Machine** | The formal stage of the project's closeout process; gates org publication | PM (routine transitions) + PE (formal gate approvals) |
| **Item-level Result Statuses** | Individual checklist item completion state | PM, SUPT (operational execution) |

The layers interact at milestone gates: certain item results or section completions trigger milestone readiness signals that the project-level state machine consumes. However, reaching 100% completion on the checklist does **not** automatically advance the project-level state — stage transitions require explicit action.

---

## 2. Project-Level Closeout State Machine

### 2.1 States

| State | Code | Description | Who can be in this state |
|---|---|---|---|
| Not Started | `NOT_STARTED` | Checklist not yet instantiated; no closeout work started | All projects before closeout activation |
| Activated | `ACTIVATED` | Checklist instantiated; operational work may begin; no items resolved yet | Projects at closeout activation |
| In Progress | `IN_PROGRESS` | At least one item resolved Yes/No/NA | Active closeout |
| Inspections Cleared | `INSPECTIONS_CLEARED` | All final inspections done; C.O. obtained; system validates item 3.11 = Yes | Post-C.O. |
| Turnover Complete | `TURNOVER_COMPLETE` | Section 4 complete; owner turnover package delivered | Post-turnover |
| Owner Acceptance | `OWNER_ACCEPTANCE` | Owner formally accepted the project; evidence required; PE approval required to advance | Post-acceptance |
| Final Completion | `FINAL_COMPLETION` | All contractual obligations met; final payment received; all liens released | Post-financial close |
| Archive Ready | `ARCHIVE_READY` | All Closeout sub-surfaces PE-approved; all gates met; PE approval required | Pre-archive |
| Archived | `ARCHIVED` | Project fully archived; all intelligence published; records immutable | Final state |

### 2.2 State Transition Table

| From | To | Trigger type | Trigger condition | PE approval |
|---|---|---|---|---|
| `NOT_STARTED` | `ACTIVATED` | System | Closeout phase activated on project | No |
| `ACTIVATED` | `IN_PROGRESS` | System | First item result changes to Yes/No/NA | No |
| `IN_PROGRESS` | `INSPECTIONS_CLEARED` | System | Item 3.11 = Yes with itemDate present | No (PE alerted via Work Queue) |
| `INSPECTIONS_CLEARED` | `TURNOVER_COMPLETE` | System | Section 4 `sectionCompletionPercentage = 100%` | No |
| `TURNOVER_COMPLETE` | `OWNER_ACCEPTANCE` | PM action + PE approval | PM submits Owner acceptance evidence; PE approves | **Yes** |
| `OWNER_ACCEPTANCE` | `FINAL_COMPLETION` | System | Item 4.15 = Yes AND Financial module final payment signal received | No |
| `FINAL_COMPLETION` | `ARCHIVE_READY` | PM action + PE approval | PM requests; all 8 archive-ready criteria met; PE approves | **Yes** |
| `ARCHIVE_READY` | `ARCHIVED` | PE action | PE triggers archive; all publication events fire | **Yes** |

**Governing rules:**
- States cannot be skipped. API rejects any transition that would bypass an intermediate state.
- No rollback is permitted after `FINAL_COMPLETION`. If evidence was submitted prematurely, PE must annotate and PM must correct the underlying records before PE approves `ARCHIVE_READY`.
- `ARCHIVED` is a terminal state. No further mutations to any Closeout record are permitted.

---

## 3. Item-Level Result Statuses

Individual checklist items have four result states. These are the operational day-to-day statuses that PM and SUPT work with.

| Result | Code | Description | Transition to other results |
|---|---|---|---|
| Pending | `PENDING` | Default on creation; work not started on this item | → Any |
| Yes | `YES` | Item is complete / satisfied | → No (correction), → NA (with justification) |
| No | `NO` | Item was checked; determined not complete or not applicable | → Yes (on completion), → NA |
| N/A | `NA` | Item is not applicable to this project | Required items require `naJustification` before save; → Yes if circumstances change |

**Item-level audit:** Every result change is recorded in `@hbc/versioned-record` with userId, timestamp, previous value, and new value. This is the audit trail for any governance review.

**No auto-resolution from related-items signals:** Even if a related-items link (e.g., a permit reaching FINAL status) suggests an item might be ready, the system surfaces this as a suggestion ("Permit is Final — ready to mark item 3.9 Yes?"). The user must confirm. The result is never set automatically.

---

## 4. Milestone Definitions

### 4.1 CloseoutMilestone Record

13 milestones are instantiated per project on checklist creation. Each milestone is a first-class record.

| Field | Type | Description |
|---|---|---|
| `milestoneId` | `string` | UUID |
| `projectId` | `string` | FK |
| `milestoneKey` | `enum` | One of the 13 keys below |
| `milestoneLabel` | `string` | Human-readable |
| `status` | `enum` | `PENDING` \| `EVIDENCE_PENDING` \| `READY_FOR_APPROVAL` \| `APPROVED` \| `BYPASSED` |
| `evidenceType` | `enum` | How this milestone is evidenced |
| `evidenceRecordId` | `string` | ID of evidencing record |
| `evidenceDate` | `date` | Date evidence was recorded |
| `externalDependency` | `boolean` | True if Owner/AHJ action is required |
| `approvalRequired` | `boolean` | PE approval needed to advance |
| `approvedAt` | `datetime` | PE timestamp |
| `approvedBy` | `string` | PE userId |
| `spineEvent` | `string` | Activity Spine event on approval |
| `notes` | `string` | Optional |

### 4.2 Complete Milestone Table

| Key | Label | State it advances to | Evidence type | External dep. | PE approval |
|---|---|---|---|---|---|
| `CHECKLIST_ACTIVATED` | Checklist Activated | `ACTIVATED` | System | No | No |
| `TASKS_COMPLETE` | All Tasks Complete | *(informational)* | Section 1 complete | No | No |
| `DOCUMENTS_COMPLETE` | Key Documents Complete | *(informational)* | Items 2.6 + 2.10 = Yes | No | No |
| `CO_OBTAINED` | Certificate of Occupancy Obtained | `INSPECTIONS_CLEARED` | Item 3.11 = Yes + date | **Yes — AHJ** | No (PE alerted) |
| `TURNOVER_COMPLETE` | Owner Turnover Complete | `TURNOVER_COMPLETE` | Section 4 = 100% | No | No |
| `OWNER_ACCEPTANCE` | Owner Formal Acceptance | `OWNER_ACCEPTANCE` | Document attachment required | **Yes — Owner** | **Yes** |
| `LIENS_RELEASED` | All Liens Released | *(informational; required for FINAL_COMPLETION gate)* | Item 4.15 = Yes | No | No |
| `FILES_RETURNED` | Files Returned to Estimator | *(informational)* | Item 5.5 = Yes | No | No |
| `FINAL_COMPLETION` | Final Completion | `FINAL_COMPLETION` | Item 4.15 + Financial payment signal | No | No |
| `SCORECARDS_COMPLETE` | All Sub Scorecards PE-Approved | *(required for ARCHIVE_READY gate)* | All FinalCloseout scorecards PE_APPROVED | No | No |
| `LESSONS_APPROVED` | Lessons Report PE-Approved | *(required for ARCHIVE_READY gate)* | LessonsLearningReport = PE_APPROVED | No | No |
| `AUTOPSY_COMPLETE` | Autopsy PE-Approved | *(required for ARCHIVE_READY gate)* | AutopsyRecord.publicationStatus = PE_APPROVED | No | No |
| `ARCHIVE_READY` | Archive Ready | `ARCHIVE_READY` | All 8 criteria below | No | **Yes** |

### 4.3 Archive-Ready Gate (8 Criteria)

All criteria must be `true` before PE may approve the `ARCHIVE_READY` milestone:

| # | Criterion | Check mechanism |
|---|---|---|
| 1 | Overall checklist completion ≥ 100% (or all remaining items = NA with justification) | `completionPercentage = 100` OR all non-Yes items have `result = NA` AND `naJustification` present |
| 2 | Section 6 all 5 items = Yes (including integration-driven items 6.3, 6.4, 6.5) | Section 6 `sectionCompletionPercentage = 100` |
| 3 | C.O. obtained | Item 3.11 = Yes with `itemDate` |
| 4 | All liens released | Item 4.15 = Yes |
| 5 | All registered subs have PE-approved FinalCloseout scorecard | `SCORECARDS_COMPLETE` milestone = `APPROVED` |
| 6 | LessonsLearningReport PE-approved | `LESSONS_APPROVED` milestone = `APPROVED` |
| 7 | AutopsyRecord PE-approved | `AUTOPSY_COMPLETE` milestone = `APPROVED` |
| 8 | Financial module final payment signal received | Cross-module signal present: `financialFinalPaymentConfirmed = true` |

**UI behavior:** The "Request Archive Ready Approval" action is disabled and surfaces a gate-readiness panel showing each criterion's current pass/fail status. Once all pass, the action is enabled and a PE Work Queue item is raised.

---

## 5. PE Approval Authority Matrix

| Action | PM | SUPT | PE |
|---|---|---|---|
| Mark checklist items Yes/No/NA | Yes | Yes (within scope) | Annotate only |
| Add overlay items | Yes | No | No |
| Advance to INSPECTIONS_CLEARED | Automatic | — | Alerted |
| Advance to TURNOVER_COMPLETE | Automatic | — | — |
| Advance to OWNER_ACCEPTANCE | Submit evidence | — | **Approve** |
| Approve FinalCloseout scorecard for publication | No | No | **Yes** |
| Approve LessonsLearningReport for publication | No | No | **Yes** |
| Approve AutopsyRecord | No | No | **Yes** |
| Approve individual LearningLegacyOutput | No | No | **Yes** |
| Approve ARCHIVE_READY | No | No | **Yes** |
| Trigger ARCHIVED | No | No | **Yes** |
| Request revision on any submitted record | No | No | **Yes** |

---

## 6. Owner and AHJ Dependent Milestones

Two milestones have external dependencies that cannot be self-certified by the project team:

| Milestone | External party | Evidence requirement | What PE does |
|---|---|---|---|
| `CO_OBTAINED` | AHJ (Authority Having Jurisdiction) | C.O. or C.C. document attached to item 3.11; document must reference project address and permit number | PE is alerted and must acknowledge; no PE approval required to advance state machine |
| `OWNER_ACCEPTANCE` | Owner / Owner's Representative | Formal acceptance document, sign-off form, or written communication; attached to the `OWNER_ACCEPTANCE` milestone record | **PE must explicitly approve**; PM cannot self-certify; PE reviews attached evidence |

For `OWNER_ACCEPTANCE`: if the Owner acceptance is verbal or informal, PM must note this in the milestone and PE must annotate an acknowledgment via `@hbc/field-annotations`. The system will not accept an unapproved `OWNER_ACCEPTANCE` advancement.

---

## 7. Work Queue Items Raised by Lifecycle Events

| Trigger | Work Queue item | Assignee | Priority | Auto-close when |
|---|---|---|---|---|
| Item 3.11 not Yes and project in `IN_PROGRESS` for > 60 days | C.O. not yet obtained | PM | High | Item 3.11 = Yes |
| Item 4.14 `calculatedDate` within 14 days and item 4.15 ≠ Yes | Lien deadline approaching | PM | Critical | Item 4.15 = Yes |
| Item 4.14 `calculatedDate` passed and item 4.15 ≠ Yes | Lien deadline missed | PM | Critical | Item 4.15 = Yes |
| 30+ days in `FINAL_COMPLETION` with no scorecard `PE_APPROVED` | Subcontractor evaluations overdue | PM | Medium | All subs `PE_APPROVED` |
| 45+ days in `FINAL_COMPLETION` with LessonsLearningReport = Draft | Lessons not submitted | PM | Medium | Report submitted |
| All 8 Archive-Ready criteria pass | Archive Ready — PE approval needed | PE | High | Milestone approved or declined |
| `OWNER_ACCEPTANCE` evidence submitted | Owner Acceptance evidence — PE review needed | PE | High | Milestone approved or declined |
| Any submitted scorecard awaiting PE review | [Project] Scorecard for [Sub] needs PE review | PE | Medium | Scorecard approved or revision requested |

---

## 8. TypeScript Enums

```typescript
enum CloseoutLifecycleState {
  NotStarted = 'NOT_STARTED',
  Activated = 'ACTIVATED',
  InProgress = 'IN_PROGRESS',
  InspectionsCleared = 'INSPECTIONS_CLEARED',
  TurnoverComplete = 'TURNOVER_COMPLETE',
  OwnerAcceptance = 'OWNER_ACCEPTANCE',
  FinalCompletion = 'FINAL_COMPLETION',
  ArchiveReady = 'ARCHIVE_READY',
  Archived = 'ARCHIVED',
}

enum ChecklistItemResult {
  Pending = 'PENDING',
  Yes = 'YES',
  No = 'NO',
  NA = 'NA',
}

enum MilestoneStatus {
  Pending = 'PENDING',
  EvidencePending = 'EVIDENCE_PENDING',
  ReadyForApproval = 'READY_FOR_APPROVAL',
  Approved = 'APPROVED',
  Bypassed = 'BYPASSED',
}

enum MilestoneKey {
  ChecklistActivated = 'CHECKLIST_ACTIVATED',
  TasksComplete = 'TASKS_COMPLETE',
  DocumentsComplete = 'DOCUMENTS_COMPLETE',
  CoObtained = 'CO_OBTAINED',
  TurnoverComplete = 'TURNOVER_COMPLETE',
  OwnerAcceptance = 'OWNER_ACCEPTANCE',
  LiensReleased = 'LIENS_RELEASED',
  FilesReturned = 'FILES_RETURNED',
  FinalCompletion = 'FINAL_COMPLETION',
  ScorecardsComplete = 'SCORECARDS_COMPLETE',
  LessonsApproved = 'LESSONS_APPROVED',
  AutopsyComplete = 'AUTOPSY_COMPLETE',
  ArchiveReady = 'ARCHIVE_READY',
}

enum MilestoneEvidenceType {
  System = 'System',
  ChecklistItem = 'ChecklistItem',
  ChecklistSection = 'ChecklistSection',
  DocumentAttachment = 'DocumentAttachment',
  CrossModuleSignal = 'CrossModuleSignal',
  SubsurfaceApproved = 'SubsurfaceApproved',
}
```

---

*[← T03](P3-E10-T03-Closeout-Execution-Checklist-Template-Library-Overlay-Model.md) | [Master Index](P3-E10-Project-Closeout-Module-Field-Specification.md) | [T05 →](P3-E10-T05-Lessons-Learned-Operating-Model-and-Intelligence-Publication.md)*
