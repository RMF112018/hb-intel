# 02 — Domain Model and Data Contracts

## Stable ID Rules

| Record | ID Format |
|---|---|
| Health check definition | `shc_{category}_{slug}` |
| Health snapshot | `shs_{projectId}_{yyyyMMddHHmmss}` |
| Finding | `shf_{projectId}_{checkKey}_{yyyyMMddHHmmss}` |
| Evidence reference | `she_{projectId}_{findingId}_{ordinal}` |
| Drift classification | `shd_{category}_{slug}` |
| Repair request | `shr_{projectId}_{findingId}_{yyyyMMddHHmmss}` |
| Admin verification | `shv_{projectId}_{findingId}_{yyyyMMddHHmmss}` |
| Audit event | `sha_{projectId}_{eventType}_{yyyyMMddHHmmss}_{shortHash}` |

## Core Records

### SiteHealthCheckDefinition

Defines one governed health check.

Required fields:

- `checkKey`
- `displayName`
- `category`
- `defaultSeverity`
- `sourceModule`
- `desiredStateReference`
- `evidenceRequired`
- `redactionPolicyKey`
- `isActive`
- `appliesToStages`
- `appliesToPersonas`

### SiteHealthSnapshot

Defines a timeboxed aggregate health state.

Required fields:

- `snapshotId`
- `projectId`
- `snapshotAt`
- `overallStatus`
- `worstSeverity`
- `healthyCount`
- `attentionRequiredCount`
- `degradedCount`
- `criticalCount`
- `blockedCount`
- `sourceStatus`
- `lastSuccessfulReadAt`
- `staleAfterMinutes`

### SiteHealthFinding

Defines a queue-ready diagnostic finding.

Required fields:

- `findingId`
- `projectId`
- `checkKey`
- `category`
- `severity`
- `status`
- `title`
- `summary`
- `detectedAt`
- `lastObservedAt`
- `ownerPersona`
- `actionMode`
- `evidenceBundleId`
- `redactionPolicyKey`
- `priorityActionCandidateId`
- `checkpointCandidateId`

### SiteHealthEvidenceReference

Defines evidence without storing secrets or raw tenant-admin objects.

Required fields:

- `evidenceId`
- `projectId`
- `findingId`
- `sourceSystem`
- `sourceRecordType`
- `sourceRecordId`
- `observedAt`
- `lastSuccessfulReadAt`
- `confidence`
- `redactionLevel`
- `displayLabel`
- `deepLinkPolicy`
- `safeDeepLink`

### SiteHealthDesiredState

Defines the expected state.

Required fields:

- `desiredStateId`
- `projectId`
- `templateVersion`
- `checkKey`
- `objectFamily`
- `objectKey`
- `requiredFields`
- `requiredIndexes`
- `requiredViews`
- `requiredGroups`
- `requiredSettings`

### SiteHealthObservedState

Defines the observed state.

Required fields:

- `observedStateId`
- `projectId`
- `observedAt`
- `sourceSystem`
- `objectFamily`
- `objectKey`
- `observedFields`
- `observedIndexes`
- `observedViews`
- `observedGroups`
- `sourceStatus`

### SiteHealthDriftClassification

Defines how differences become findings.

Required fields:

- `classificationKey`
- `category`
- `differenceType`
- `defaultSeverity`
- `defaultStatus`
- `repairEligibility`
- `adminVerificationRequired`
- `priorityActionEligible`
- `checkpointEligible`

### SiteHealthRepairRequest

Defines a future-gated repair request record.

Required fields:

- `repairRequestId`
- `projectId`
- `findingId`
- `requestedAction`
- `requestStatus`
- `requestedBy`
- `requestedByPersona`
- `requestedAt`
- `adminVerificationId`
- `wave14CheckpointId`
- `blockedReason`

### SiteHealthAdminVerification

Defines evidence review and technical verification.

Required fields:

- `adminVerificationId`
- `projectId`
- `findingId`
- `verificationStatus`
- `verifier`
- `verifierPersona`
- `verifiedAt`
- `evidenceBundleId`
- `verificationNotes`
- `repairReadinessOutcome`

### SiteHealthAuditEvent

Defines PCC business audit, not Microsoft Purview replacement.

Required fields:

- `auditEventId`
- `projectId`
- `eventType`
- `actor`
- `actorPersona`
- `occurredAt`
- `correlationId`
- `relatedFindingId`
- `beforeStateJson`
- `afterStateJson`
- `redactionApplied`

## DTO Families

Create TypeScript interfaces in a future implementation package using these names:

- `IPccSiteHealthReadModel`
- `IPccSiteHealthFindingsReadModel`
- `IPccSiteHealthTemplateComplianceReadModel`
- `IPccSiteHealthProvisioningStatusReadModel`
- `IPccSiteHealthListLibraryComplianceReadModel`
- `IPccSiteHealthPermissionPostureReadModel`
- `IPccSiteHealthSettingsHealthReadModel`
- `IPccSiteHealthExternalSourceHealthReadModel`
- `IPccSiteHealthAdminVerificationReadModel`
- `IPccSiteHealthAuditHistoryReadModel`
- `IPccSiteHealthHbiContextReadModel`

All DTOs must be wrapped in the existing PCC read-model envelope pattern and must preserve `sourceStatus`, `mode`, `readOnly`, `warnings`, and `viewerPersona` semantics.
