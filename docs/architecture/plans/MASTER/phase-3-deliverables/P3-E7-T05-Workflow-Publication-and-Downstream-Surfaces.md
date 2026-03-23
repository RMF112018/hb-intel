# P3-E7-T05 — Workflow Publication and Downstream Surfaces

**Doc ID:** P3-E7-T05
**Parent:** P3-E7 Permits Module
**Phase:** 3
**Workstream:** E — Data Models and Field Specifications
**Part:** 5 of 8
**Owner:** Architecture
**Last Updated:** 2026-03-23

---

## 1. Activity Spine Contract

The Permits module publishes the following activity spine events. All events include `projectId`, `issuedPermitId`, `performedByUserId`, and `occurredAt` (ISO 8601 datetime).

| Event Name | Trigger | Additional Payload Fields |
|---|---|---|
| `PERMIT_APPLICATION_SUBMITTED` | `PermitApplication.applicationStatus → SUBMITTED` | `applicationId`, `permitType`, `jurisdictionName` |
| `PERMIT_APPLICATION_APPROVED` | `PermitApplication.applicationStatus → APPROVED` | `applicationId`, `issuedPermitId`, `permitType` |
| `PERMIT_APPLICATION_REJECTED` | `PermitApplication.applicationStatus → REJECTED` | `applicationId`, `rejectionReason` |
| `PERMIT_ISSUED` | `PermitLifecycleAction(ISSUED)` created | `issuedPermitId`, `permitNumber`, `permitType`, `expirationDate` |
| `PERMIT_STATUS_CHANGED` | Any `PermitLifecycleAction` that changes status | `actionType`, `previousStatus`, `newStatus`, `actionId` |
| `STOP_WORK_ISSUED` | `PermitLifecycleAction(STOP_WORK_ISSUED)` | `issuedPermitId`, `permitNumber`, `notes` |
| `STOP_WORK_LIFTED` | `PermitLifecycleAction(STOP_WORK_LIFTED)` | `issuedPermitId`, `permitNumber` |
| `VIOLATION_ISSUED` | `PermitLifecycleAction(VIOLATION_ISSUED)` | `issuedPermitId`, `permitNumber`, `notes` |
| `INSPECTION_VISIT_RECORDED` | `InspectionVisit.result` set | `visitId`, `linkedCheckpointId`, `result`, `followUpRequired` |
| `INSPECTION_CHECKPOINT_PASSED` | `RequiredInspectionCheckpoint.currentResult → PASS` | `checkpointId`, `checkpointName`, `visitId` |
| `INSPECTION_CHECKPOINT_FAILED` | `RequiredInspectionCheckpoint.currentResult → FAIL` | `checkpointId`, `checkpointName`, `visitId` |
| `DEFICIENCY_OPENED` | `InspectionDeficiency` created | `deficiencyId`, `severity`, `description`, `visitId` |
| `DEFICIENCY_RESOLVED` | `InspectionDeficiency.resolutionStatus → RESOLVED` | `deficiencyId`, `severity`, `resolvedByUserId` |
| `DEFICIENCY_VERIFIED` | `InspectionDeficiency.resolutionStatus → VERIFIED_RESOLVED` | `deficiencyId`, `reinspectionVisitId` |
| `REQUIRED_INSPECTIONS_GENERATED` | Auto-generation from template on permit creation | `issuedPermitId`, `checkpointCount` |
| `REQUIRED_INSPECTIONS_IMPORTED` | xlsx import completed | `issuedPermitId`, `checkpointCount`, `importedById` |
| `PERMIT_EXPIRATION_WARNING` | `PermitLifecycleAction(EXPIRATION_WARNING)` | `issuedPermitId`, `expirationDate`, `daysToExpiration` |
| `PERMIT_EXPIRED` | `PermitLifecycleAction(EXPIRED)` | `issuedPermitId`, `expirationDate` |
| `PERMIT_RENEWED` | `PermitLifecycleAction(RENEWAL_APPROVED)` | `issuedPermitId`, `newExpirationDate`, `renewalDate` |
| `PERMIT_CLOSED` | `PermitLifecycleAction(CLOSED)` | `issuedPermitId`, `permitNumber`, `closedDate` |
| `EVIDENCE_UPLOADED` | `PermitEvidenceRecord` created | `evidenceId`, `evidenceType`, `fileName`, `linkedVisitId?` |

---

## 2. Health Spine Contract

The Permits module publishes health metrics per `issuedPermitId`. Recalculation triggers are described in T04 §4.3.

### 2.1 Published Health Metrics

| Metric Key | Type | Description |
|---|---|---|
| `permitHealthTier` | `PermitHealthTier` | `CRITICAL \| AT_RISK \| NORMAL \| CLOSED` |
| `expirationRiskTier` | `ExpirationRiskTier` | `CRITICAL \| HIGH \| MEDIUM \| LOW` |
| `daysToExpiration` | `number` | Days until expiration; negative if expired |
| `openHighDeficiencyCount` | `number` | Count of open HIGH-severity deficiencies |
| `openMediumDeficiencyCount` | `number` | Count of open MEDIUM-severity deficiencies |
| `openLowDeficiencyCount` | `number` | Count of open LOW-severity deficiencies |
| `failedBlockingCheckpointCount` | `number` | Count of FAIL checkpoints with `isBlockingCloseout = true` |
| `pendingCheckpointCount` | `number` | Count of checkpoints with `currentResult = PENDING` |
| `passedCheckpointCount` | `number` | Count of checkpoints with `currentResult = PASS` |
| `currentStatus` | `IssuedPermitStatus` | Current permit operational status |
| `threadHealthTier` | `PermitHealthTier` | Worst health tier across all permits in thread |

### 2.2 Project-Level Permit Aggregate Metrics

Published to project health spine for dashboard aggregation:

| Metric Key | Description |
|---|---|
| `criticalPermitCount` | Permits with `derivedHealthTier = CRITICAL` |
| `atRiskPermitCount` | Permits with `derivedHealthTier = AT_RISK` |
| `expiredPermitCount` | Permits with `currentStatus = EXPIRED` |
| `stopWorkPermitCount` | Permits with `currentStatus = STOP_WORK` |
| `expiringWithin30DaysCount` | Active permits with `expirationRiskTier = HIGH` |
| `closedPermitCount` | Permits with `currentStatus = CLOSED` |
| `activePermitCount` | Permits with `currentStatus = ACTIVE` or `ACTIVE_EXPIRING` |

---

## 3. Work Queue Publication Rules

Work queue items are published via `@hbc/my-work-feed`. The following rules govern item creation, assignment, and resolution.

### 3.1 Expiration Work Queue Items

| Rule | Trigger | Item Type | Priority | Assignee | Due Date |
|---|---|---|---|---|---|
| WQ-PRM-01 | `expirationRiskTier → HIGH` | "Permit Expiring — Renewal Required" | HIGH | Permit `accountableRole` user | `expirationDate - 14 days` |
| WQ-PRM-02 | `expirationRiskTier → CRITICAL` | "Permit EXPIRED — Immediate Action" | URGENT | Permit `escalationOwnerId` | Immediate |
| WQ-PRM-03 | `EXPIRATION_WARNING` action created | "Permit Expiring in 30 Days" | MEDIUM | `currentResponsiblePartyId` | `expirationDate - 7 days` |

### 3.2 Inspection Work Queue Items

| Rule | Trigger | Item Type | Priority | Assignee |
|---|---|---|---|---|
| WQ-PRM-04 | Checkpoint `status → CALLED_IN` with no scheduled date after 5 days | "Inspection Not Yet Scheduled" | MEDIUM | `currentResponsiblePartyId` |
| WQ-PRM-05 | `InspectionVisit.followUpRequired = true` | "Re-inspection Required" | HIGH | `nextActionOwnerId` or `currentResponsiblePartyId` |
| WQ-PRM-06 | `RequiredInspectionCheckpoint.result → FAIL` | "Failed Inspection — Action Required" | HIGH | `currentResponsiblePartyId` |
| WQ-PRM-07 | Blocking checkpoint `FAIL` with no subsequent visit after 3 days | "Blocked Closeout Checkpoint — Overdue" | HIGH | `escalationOwnerId` |

### 3.3 Deficiency Work Queue Items

| Rule | Trigger | Item Type | Priority | Assignee |
|---|---|---|---|---|
| WQ-PRM-08 | `InspectionDeficiency` created with `severity = HIGH` | "High-Severity Deficiency — Immediate Action" | URGENT | `assignedToPartyId` or `currentResponsiblePartyId` |
| WQ-PRM-09 | `InspectionDeficiency` created with `severity = MEDIUM` | "Deficiency Logged — Action Required" | MEDIUM | `assignedToPartyId` |
| WQ-PRM-10 | Deficiency past `dueDate` | "Deficiency Overdue" | HIGH | `escalationOwnerId` |
| WQ-PRM-11 | Deficiency `RESOLVED` requires inspector verification | "Deficiency Resolution — Verify at Re-inspection" | MEDIUM | `nextActionOwnerId` |

### 3.4 Lifecycle Work Queue Items

| Rule | Trigger | Item Type | Priority | Assignee |
|---|---|---|---|---|
| WQ-PRM-12 | `PermitLifecycleAction(STOP_WORK_ISSUED)` | "STOP WORK ORDER — Immediate Attention" | URGENT | `escalationOwnerId` |
| WQ-PRM-13 | `PermitLifecycleAction(VIOLATION_ISSUED)` | "Violation Notice Received" | HIGH | `currentResponsiblePartyId` |
| WQ-PRM-14 | `PermitLifecycleAction(requiresAcknowledgment = true)` | "Permit Action Requires Acknowledgment" | HIGH | `nextActionOwnerId` |
| WQ-PRM-15 | Permit `ISSUED` — new permit activated | "New Permit — Review and Assign Responsibility" | MEDIUM | Project Manager |

### 3.5 Work Queue Item Resolution

Work queue items are automatically resolved when:

| Item | Resolution Trigger |
|---|---|
| WQ-PRM-01, WQ-PRM-03 | `PermitLifecycleAction(RENEWAL_INITIATED)` or `expirationRiskTier` drops |
| WQ-PRM-02 | `PermitLifecycleAction(RENEWAL_APPROVED)` |
| WQ-PRM-05 | New `InspectionVisit` created for the checkpoint |
| WQ-PRM-06, WQ-PRM-07 | `RequiredInspectionCheckpoint.currentResult → PASS` |
| WQ-PRM-08, WQ-PRM-09 | `InspectionDeficiency.resolutionStatus → RESOLVED` |
| WQ-PRM-10 | `InspectionDeficiency.resolutionStatus → RESOLVED` or `WAIVED` |
| WQ-PRM-12 | `PermitLifecycleAction(STOP_WORK_LIFTED)` |
| WQ-PRM-13 | `PermitLifecycleAction(VIOLATION_RESOLVED)` |
| WQ-PRM-14 | `PermitLifecycleAction.acknowledgedAt` set |
| WQ-PRM-15 | `IssuedPermit.currentResponsiblePartyId` assigned |

---

## 4. Related Items Integration (@hbc/related-items)

The Permits module publishes the following related-item relationships:

| Relation Source | Relation Target | Relationship Type | Direction |
|---|---|---|---|
| `IssuedPermit` | Schedule milestone (from P3-E5/E6) | `PERMIT_GATES_MILESTONE` | Permit blocks milestone until active |
| `IssuedPermit` | Constraint record (from P3-E5/E6) | `PERMIT_IS_CONSTRAINT` | Permit status drives constraint state |
| `IssuedPermit` | Financial line item (from P3-E4) | `PERMIT_FEE_LINE` | Permit fee amount linked to budget line |
| `InspectionVisit` | Schedule milestone | `INSPECTION_PRECEDES_MILESTONE` | Inspection must pass before phase proceeds |
| `RequiredInspectionCheckpoint` | Schedule milestone | `CHECKPOINT_GATES_MILESTONE` | Checkpoint pass gates phase completion |

Related-item data is published via `@hbc/related-items` contract. The Permits module is the producer; schedule and financial modules are consumers.

---

## 5. Workflow Handoff Integration (@hbc/workflow-handoff)

The following permit workflow transitions use `@hbc/workflow-handoff` to transfer accountability between parties:

| Handoff Scenario | From Party | To Party | Trigger |
|---|---|---|---|
| Permit submitted to jurisdiction | GC Representative | Jurisdiction (external) | `PermitApplication.applicationStatus → SUBMITTED` |
| Jurisdiction returns for more info | Jurisdiction (external) | Project Manager | `applicationStatus → ADDITIONAL_INFO_REQUIRED` |
| Inspection scheduled | Project Manager | Inspector | `InspectionVisit` created |
| Deficiency assigned | Inspector (originator) | Site Supervisor | `InspectionDeficiency.assignedToPartyId` set |
| Resolution for verification | Site Supervisor | Inspector | `InspectionDeficiency.resolutionStatus → RESOLVED` + `requiresReinspection = true` |
| Stop-work response | Jurisdiction | Project Manager + Escalation Owner | `PermitLifecycleAction(STOP_WORK_ISSUED)` |

Each handoff creates a `@hbc/workflow-handoff` record and triggers the corresponding work queue item. Handoff completion is tracked by the work queue item resolution.

---

## 6. BIC Next Move Integration (@hbc/bic-next-move)

`@hbc/bic-next-move` surfaces the recommended next action for the responsible party on each permit. The following next-move prompts are registered:

| Status / Condition | Next Move Prompt | Surface |
|---|---|---|
| `currentStatus = ACTIVE` + checkpoint `NOT_SCHEDULED` | "Call in [checkpointName] inspection" | Permit detail + work queue |
| `currentStatus = ACTIVE_EXPIRING` | "Start renewal process before [expirationDate]" | Permit list + permit detail |
| `currentStatus = STOP_WORK` | "Contact jurisdiction to resolve stop-work order" | Permit detail (banner) |
| `currentStatus = VIOLATION_ISSUED` | "Respond to violation notice — due [dueDate]" | Permit detail (banner) |
| Open HIGH deficiency | "Resolve deficiency: [description]" | Inspection log + permit detail |
| `followUpRequired = true` on visit | "Schedule re-inspection for [checkpointName]" | Permit detail |
| All blocking checkpoints passed | "Confirm closeout conditions and close permit" | Permit detail |

---

## 7. PER Annotation Scope

Executive Review (PER) annotations on Permit records use `@hbc/field-annotations`. Annotation anchors reference specific fields and records.

### 7.1 Annotatable Record Types

| Record Type | Annotation Scope |
|---|---|
| `IssuedPermit` | Any field; full record |
| `InspectionVisit` | `result`, `inspectorNotes`, `followUpRequired`, full record |
| `InspectionDeficiency` | `description`, `severity`, `resolutionStatus`, `resolutionNotes` |
| `RequiredInspectionCheckpoint` | `currentResult`, `status`, `checkpointName` |

`PermitLifecycleAction` records are not annotatable (they are immutable audit records).

### 7.2 Annotation Anchor Structure

```typescript
interface IPermitAnnotationAnchor {
  issuedPermitId: string;
  recordType: 'IssuedPermit' | 'InspectionVisit' | 'InspectionDeficiency' | 'RequiredInspectionCheckpoint';
  recordId: string;
  fieldKey?: string;    // Specific field; null for full-record annotations
}
```

### 7.3 PER Permitted Actions

| Action | Permitted |
|---|---|
| Create annotation on `IssuedPermit` or sub-record field | Yes |
| View all annotations on a permit | Yes |
| Recommend renewal, escalation, or policy action | Yes (as annotation) |
| Export annotated permit summary | Yes |
| Mutate any permit field or status | No |
| Create or update `InspectionVisit` | No |
| Create `PermitLifecycleAction` | No |

---

*[← T04](P3-E7-T04-Inspection-Deficiency-and-Compliance-Control.md) | [Master Index](P3-E7-Permits-Module-Field-Specification.md) | [T06 →](P3-E7-T06-UX-Surface-Operational-Views-and-Reporting.md)*
