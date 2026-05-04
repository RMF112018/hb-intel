# Domain Model and Data Contracts

## Domain Principles

- Every approval/checkpoint record has a source, policy, route, state, actor model, evidence posture, audit trail, and downstream impact.
- Every decision must be explainable through source references and audit events.
- Business audit events are append-only.
- Source content is referenced, not copied, unless a future document-retention policy authorizes snapshotting.
- Policy versions are frozen at request time.

## Entity Catalog

### ApprovalRequest

Purpose: Request for decision authority over one or more source references.

Required fields:

- `approvalRequestId`
- `projectId`
- `title`
- `description`
- `checkpointFamily`
- `sourceModule`
- `sourceReferences`
- `approvalPolicyId`
- `approvalPolicyVersion`
- `routeId`
- `state`
- `requestedByPrincipalKey`
- `requestedAtUtc`
- `currentStepId`
- `currentActionOwnerRole`
- `currentActionOwnerPrincipalKey`
- `priority`
- `dueUtc`
- `blocksDownstreamWorkflow`
- `createdUtc`
- `updatedUtc`

Optional fields:

- `sensitivityBand`
- `financialExposureBand`
- `legalReviewRequired`
- `complianceReviewRequired`
- `adminVerificationRequired`
- `hbiGroundingRecordIds`
- `supersededByApprovalRequestId`
- `replacementApprovalRequestId`

### ApprovalPolicy

Purpose: Defines the policy that governs a checkpoint family, module, route, required evidence, reason codes, and role authority.

Required fields:

- `approvalPolicyId`
- `version`
- `name`
- `checkpointFamily`
- `sourceModules`
- `effectiveFromUtc`
- `routeTemplateId`
- `allowedDecisionActions`
- `requiredEvidenceRules`
- `requiredReasonCodes`
- `roleActionRules`
- `redactionRules`
- `priorityActionRules`
- `readinessImpactRules`

### ApprovalRoute

Purpose: Ordered set of route steps for a request.

Required fields:

- `routeId`
- `approvalRequestId`
- `mode`
- `steps`
- `startedAtUtc`
- `routeState`

### ApprovalStep

Purpose: Defines one approval/review/acknowledgement/admin-verification step.

Required fields:

- `stepId`
- `routeId`
- `sequenceNumber`
- `mode`
- `requiredApproverRoles`
- `requiredApproverPrincipals`
- `optionalReviewerRoles`
- `completionRule`
- `rejectionPolicy`
- `delegationAllowed`
- `escalationPolicyId`
- `slaId`
- `opensWhen`
- `blocksDownstreamWorkflow`
- `stepState`

### ApprovalParticipant

Purpose: Participant assigned to a step as approver, reviewer, watcher, delegate, admin verifier, or acknowledgement recipient.

Required fields:

- `participantId`
- `stepId`
- `principalKey`
- `role`
- `participantType`
- `assignmentState`
- `assignedAtUtc`

### ApprovalDecision

Purpose: Captures a user decision action.

Required fields:

- `decisionId`
- `approvalRequestId`
- `stepId`
- `actorPrincipalKey`
- `actorRole`
- `decisionAction`
- `sourceState`
- `targetState`
- `reasonCode`
- `comment`
- `evidenceLinks`
- `decidedAtUtc`
- `decisionValidity`
- `auditEventId`

### CheckpointDefinition

Purpose: Template definition for a checkpoint source.

Required fields:

- `checkpointDefinitionId`
- `name`
- `checkpointFamily`
- `sourceModule`
- `defaultPolicyId`
- `requiredSourceFields`
- `requiredEvidenceTypes`
- `defaultMode`
- `defaultSlaId`
- `defaultPriority`
- `defaultReadinessImpact`

### CheckpointInstance

Purpose: Concrete checkpoint created for a project/source item.

Required fields:

- `checkpointInstanceId`
- `projectId`
- `checkpointDefinitionId`
- `sourceReferences`
- `approvalRequestId`
- `state`
- `createdUtc`
- `lastEvaluatedUtc`

### CheckpointGate

Purpose: Represents a readiness/handoff/freeze gate with blocker/evidence/freshness rules.

Required fields:

- `gateId`
- `checkpointInstanceId`
- `gateType`
- `requiredCompletionCriteria`
- `requiredConfidenceCriteria`
- `requiredAuthorityCriteria`
- `requiredEvidenceCriteria`
- `downstreamTargets`
- `blocksIfUnresolved`

### CheckpointEvidenceLink

Purpose: Lineage-preserving reference to evidence.

Required fields:

- `evidenceLinkId`
- `approvalRequestId`
- `sourceSystem`
- `sourceModule`
- `objectType`
- `objectId`
- `displayName`
- `urlOrLocator`
- `evidenceType`
- `addedByPrincipalKey`
- `addedAtUtc`
- `contentOwner`
- `visibilityBand`

### CheckpointSourceReference

Purpose: Pointer to the source item being reviewed.

Required fields:

- `sourceReferenceId`
- `approvalRequestId`
- `sourceModule`
- `sourceRecordId`
- `sourceRecordVersion`
- `sourceRecordState`
- `sourceLastUpdatedUtc`
- `sourceOwner`
- `stalenessState`

### CheckpointPriorityActionLink

Purpose: Relationship between approval/checkpoint and Priority Actions.

Required fields:

- `priorityActionLinkId`
- `approvalRequestId`
- `priorityActionId`
- `linkState`
- `dedupeKey`
- `createdUtc`
- `resolvedUtc`

### CheckpointReadinessImpact

Purpose: Describes how a checkpoint affects readiness.

Required fields:

- `readinessImpactId`
- `approvalRequestId`
- `readinessDomain`
- `gateId`
- `impactType`
- `blocksReadiness`
- `confidenceImpact`
- `completionImpact`
- `exposureImpact`

### CheckpointEscalation

Purpose: Records escalation state and ownership.

Required fields:

- `escalationId`
- `approvalRequestId`
- `escalationReason`
- `escalatedFromRole`
- `escalatedToRole`
- `escalatedAtUtc`
- `slaBreachUtc`
- `escalationState`

### CheckpointDelegation

Purpose: Delegates review/approval within allowed policy.

Required fields:

- `delegationId`
- `approvalRequestId`
- `fromPrincipalKey`
- `toPrincipalKey`
- `fromRole`
- `toRole`
- `delegationReason`
- `delegatedAtUtc`
- `expiresUtc`
- `delegationState`

### CheckpointReminder

Purpose: Records reminder issuance.

Required fields:

- `reminderId`
- `approvalRequestId`
- `recipientPrincipalKey`
- `recipientRole`
- `reminderType`
- `sentAtUtc`
- `deliveryChannel`
- `reminderState`

### CheckpointSla

Purpose: Defines due, warning, escalation, and expiration thresholds.

Required fields:

- `slaId`
- `name`
- `dueDuration`
- `warningDuration`
- `escalationDuration`
- `expirationDuration`
- `calendarBasis`
- `businessDayCalendarId`

### CheckpointAuditEvent

Purpose: Append-only event record for business and security traceability.

Required fields:

- `eventId`
- `approvalRequestId`
- `eventType`
- `actorPrincipalKey`
- `actorRole`
- `occurredUtc`
- `sourceState`
- `targetState`
- `decisionAction`
- `reasonCode`
- `commentPresent`
- `evidenceRefs`
- `sourceModule`
- `sourceRecordId`
- `correlationId`
- `requestId`
- `redactionApplied`
- `unauthorizedAttempt`
- `externalWritebackAttempted`
- `hbiInvolved`
- `auditTrailType`

### CheckpointComment

Purpose: Comment thread item attached to a request, step, or decision.

Required fields:

- `commentId`
- `approvalRequestId`
- `stepId`
- `authorPrincipalKey`
- `authorRole`
- `body`
- `createdUtc`
- `visibilityBand`
- `redactionState`

### CheckpointAttachmentReference

Purpose: Attachment/file reference without transferring ownership.

Required fields:

- `attachmentReferenceId`
- `approvalRequestId`
- `sourceSystem`
- `fileObjectId`
- `fileName`
- `fileOwner`
- `visibilityBand`
- `addedAtUtc`

### CheckpointHbiGroundingRecord

Purpose: HBI summary/citation support record.

Required fields:

- `hbiGroundingRecordId`
- `approvalRequestId`
- `sourceCitationRefs`
- `summaryText`
- `uncertaintyStatement`
- `generatedAtUtc`
- `decisionAuthorityWarning`
- `refusalApplied`

## Policy Versioning

Every `ApprovalRequest` must store the policy ID and policy version active at request time. If policy changes while an approval is pending, the active request remains governed by the original policy unless explicitly superseded.

## Current Action Owner / Ball-In-Court Fields

Every active request must expose:

- `currentActionOwnerRole`
- `currentActionOwnerPrincipalKey`
- `currentStepId`
- `nextActionDueUtc`
- `blockedByStepIds`
- `waitingOnRoles`
- `waitingOnPrincipals`
- `lastActionUtc`
- `agingBucket`

## Evidence Requirements by Checkpoint Family

| Checkpoint Family | Required Evidence |
| --- | --- |
| Access / Security | requestor, target role, permission template, business justification, external-user flag |
| Workflow Item Review | source item reference, source status, owner, due date, comment/evidence if exception exists |
| Readiness Gate | blocker summary, required checklist evidence, unresolved constraints, deferral list |
| Handoff / Freeze | snapshot/version ID, variance summary, downstream target, handoff owner |
| Exception / Waiver / Override | reason code, evidence, risk/exposure acknowledgement, elevated authority |
| External Mapping Correction | source system, object ID, mapping issue, proposed correction, owner |
| Site Health / Repair | finding, severity, repair request summary, admin verification requirement |
| Executive Escalation | escalation reason, exposure summary, decision history, recommended next action |
| Technical / Admin | technical finding, governance exception, verification checklist |
| Estimating Workbench | estimate snapshot, freeze version, cost-code map, bid leveling summary, downstream seed |

## Reason Code Catalog

Reason codes must be structured, not free text only.

| Action | Required Reason Code Families |
| --- | --- |
| `reject-return` | incomplete-evidence, incorrect-source, missing-authority, conflicting-data, scope-unclear |
| `request-revision` | missing-field, evidence-update-required, source-item-change-required, routing-correction |
| `defer` | external-dependency, owner-delay, client-input-pending, authority-review-pending |
| `waive-with-reason` | low-risk-exception, time-sensitive-business-need, non-applicable-condition, documented-alternate-control |
| `override-with-reason` | executive-direction, emergency-condition, governance-approved-exception, project-critical-path-impact |
| `escalate` | overdue, high-risk, high-cost, disputed-decision, authority-conflict |
| `cancel` | source-cancelled, duplicate-request, created-in-error, no-longer-applicable |
| `supersede` | source-version-changed, snapshot-replaced, policy-version-replaced, route-rebuilt |
| `manual-close` | admin-cleanup, historical-reconciliation, migrated-record, duplicate-terminal-record |
