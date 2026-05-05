# Data Model and Read-Model Contracts

## Shared Model Target

Extend `packages/models/src/pcc/ExternalSystems.ts` or create a focused Wave 15 model file if repo patterns support it. Export through `packages/models/src/pcc/index.ts`.

Do not break existing `ExternalSystemId`, `EXTERNAL_SYSTEM_IDS`, `EXTERNAL_SYSTEM_CATALOG`, `IExternalSystemLink`, or `IExternalSystemMissingConfig` consumers.

## Required Vocabulary

### System Categories

Include at least:

- `document-management`
- `project-management`
- `accounting`
- `permitting`
- `private-provider`
- `progress-camera`
- `reality-capture`
- `esignature`
- `crm`
- `calendar`
- `communication`
- `other`

### Launch Link Types

Include at least:

- `project-home`
- `documents`
- `rfis`
- `submittals`
- `drawings`
- `observations`
- `financials`
- `contract`
- `permit-portal`
- `inspection-request`
- `inspection-status`
- `plan-review`
- `private-provider`
- `camera-live`
- `camera-timelapse`
- `camera-dashboard`
- `reality-capture-viewer`
- `custom`

### Approval States

Include at least:

- `draft`
- `submitted`
- `approved`
- `rejected`
- `blocked-by-policy`
- `archived`
- `superseded`

### Mapping States

Include at least:

- `not-mapped`
- `mapped`
- `stale`
- `conflict`
- `missing`
- `review-required`
- `blocked`
- `confirmed`

### Source Health States

Align with existing envelope status vocabulary while allowing row-level source health:

- `healthy`
- `warning`
- `degraded`
- `unavailable`
- `missing-config`
- `access-denied`
- `throttled`
- `stale`
- `unknown`

### HBI Lineage States

- `loading`
- `citation-ready`
- `refusal`
- `unavailable`
- `unauthorized`
- `insufficient-evidence`

## Required Interfaces

Use repo naming conventions, but provide these conceptual shapes.

### External System Definition

Required fields:

- `systemKey`
- `displayName`
- `systemCategory`
- `systemPosture`
- `recordOwner`
- `mvpMode`
- `liveReadPosture`
- `writebackPolicy`
- `allowedLinkTypes`
- `approvedDomains`
- `sortOrder`
- `isActive`

### Project External Launch Link

Required fields:

- `id`
- `projectId`
- `projectNumber`
- `systemKey`
- `linkType`
- `providerName`
- `title`
- `normalizedTargetKey`
- `launchUrl`
- `hostname`
- `openInNewTab`
- `approvalState`
- `requiresApproval`
- `submittedByUpn`
- `submittedAtUtc`
- `approvedByUpn`
- `approvedAtUtc`
- `sortOrder`
- `audienceMode`
- `audiencePersonas`
- `iframeEligible`
- `currentImageEligible`
- `isActive`
- `createdAtUtc`
- `updatedAtUtc`
- `urlPolicyState`
- `policyReason`

### Project External System Mapping

Required fields:

- `id`
- `projectId`
- `projectNumber`
- `systemKey`
- `mappingScope`
- `sourceObjectType`
- `externalObjectId`
- `externalObjectNumber`
- `externalDisplayName`
- `mappingState`
- `freshnessBand`
- `lastVerifiedAtUtc`
- `ownerPersona`
- `ownerUpn`
- `lineage`
- `reviewItemId`

### External Object Reference

Required fields:

- `id`
- `projectId`
- `systemKey`
- `objectType`
- `externalObjectId`
- `externalObjectNumber`
- `externalObjectDisplayName`
- `sourceUrl`
- `sourceOwner`
- `recordAuthority`
- `lastSeenAtUtc`
- `lastVerifiedAtUtc`
- `permissionState`
- `redactionState`
- `evidenceRefs`

### External Review Item

Required fields:

- `id`
- `projectId`
- `systemKey`
- `issueType`
- `subjectKey`
- `reviewState`
- `currentOwnerPersona`
- `currentOwnerUpn`
- `priorityActionId`
- `approvalRequestId`
- `dueAtUtc`
- `issueSummary`
- `resolutionSummary`

### Health Snapshot

Required fields:

- `healthSnapshotId`
- `projectId`
- `systemKey`
- `healthState`
- `severity`
- `observedAtUtc`
- `lastSuccessfulReadAtUtc`
- `statusMessage`
- `recommendedAction`

### Audit Event

Required fields:

- `eventId`
- `projectId`
- `systemKey`
- `eventType`
- `actorUpn`
- `actorPersona`
- `occurredAtUtc`
- `subjectKey`
- `correlationId`
- `summary`
- `metadataJson`

### HBI Lineage Entry

Required fields:

- `fieldKey`
- `fieldLabel`
- `sourceSystemKey`
- `sourceListOrSystem`
- `sourceObjectType`
- `sourceObjectId`
- `transformationNote`
- `confidenceBand`
- `freshnessBand`
- `citationLabel`
- `permissionState`
- `redactionState`

## Required Composite Read Model

Create a composite read model suitable for the Launch Pad surface:

```ts
interface PccExternalSystemsLaunchPadReadModel {
  summary: ...;
  systemDefinitions: readonly ...[];
  projectLaunchLinks: readonly ...[];
  projectMappings: readonly ...[];
  objectReferences: readonly ...[];
  reviewItems: readonly ...[];
  healthSnapshots: readonly ...[];
  auditEvents: readonly ...[];
  hbiLineage: readonly ...[];
  roleActionMatrix?: readonly ...[];
  urlPolicy?: ...;
  degradedStates?: readonly ...[];
}
```

The exact symbol names may vary if the repo has established naming conventions. The conceptual content should not be reduced.

## URL Policy Helper

Create a pure helper that receives a candidate URL and policy context and returns a result without side effects.

Expected behavior:

- parse with `new URL()`, not string-only matching;
- allow only `https`;
- reject localhost and loopback/private-host style inputs in fixtures/helpers where determinable;
- check hostname against approved domain policy;
- flag credential-like query parameters: `token`, `secret`, `password`, `key`, `code`, `sig`, `credential`, plus case-insensitive variants;
- mark custom links as requiring approval;
- default iframe/current-image eligibility to false unless explicitly allowed by policy data;
- return reason codes for UI display and tests.

## Fixture Requirements

Add deterministic fixture coverage for:

- fully configured Procore project link;
- Sage accounting link visible to accounting personas only;
- AHJ permit portal link;
- private provider portal link;
- progress camera provider link blocked from iframe but allowed as external launch;
- DroneDeploy/OpenSpace/Evercam style reality-capture/camera examples as launch-only fixture examples if current catalog vocabulary supports them;
- custom link in draft/submitted/approved/rejected/blocked states;
- stale mapping;
- mapping conflict;
- missing mapping;
- source-health degraded and throttled states;
- audit event timeline;
- HBI citation-ready and refusal examples;
- unknown project and backend-unavailable degraded envelopes.

## Model Tests

Required tests:

- vocabulary tuple exhaustiveness where practical;
- URL policy helper scheme/hostname/query/private-host behavior;
- no secret-like fixture values;
- deterministic fixtures are immutable or treated read-only;
- composite read model can be serialized;
- unknown project returns empty/degraded shape without throwing;
- fixture values do not use production tenant URLs.
