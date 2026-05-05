# 04 — Field-Level Data Contracts

## Core DTOs

### ExternalSystemDefinition

`systemKey`, `displayName`, `systemCategory`, `systemPosture`, `recordOwner`, `mvpMode`, `liveReadPosture`, `writebackPolicy`, `allowedLinkTypes`, `approvedDomains`, `sortOrder`, `isActive`.

### ProjectExternalLaunchLink

`id`, `projectId`, `projectNumber`, `systemKey`, `linkType`, `providerName`, `title`, `normalizedTargetKey`, `launchUrl`, `hostname`, `openInNewTab`, `approvalState`, `requiresApproval`, `submittedByUpn`, `submittedAtUtc`, `approvedByUpn`, `approvedAtUtc`, `sortOrder`, `audienceMode`, `audiencePersonas`, `iframeEligible`, `currentImageEligible`, `isActive`, `createdAtUtc`, `updatedAtUtc`.

### ProjectExternalSystemMapping

`id`, `projectId`, `projectNumber`, `systemKey`, `mappingScope`, `sourceObjectType`, `externalObjectId`, `externalObjectNumber`, `externalDisplayName`, `mappingState`, `freshnessBand`, `lastVerifiedAtUtc`, `ownerPersona`, `ownerUpn`, `lineage`, `reviewItemId`.

### ExternalObjectReference

`id`, `projectId`, `systemKey`, `objectType`, `externalObjectId`, `externalObjectNumber`, `externalObjectDisplayName`, `sourceUrl`, `sourceOwner`, `recordAuthority`, `lastSeenAtUtc`, `lastVerifiedAtUtc`, `permissionState`, `redactionState`, `evidenceRefs`.

### ExternalReviewItem

`id`, `projectId`, `systemKey`, `issueType`, `subjectKey`, `reviewState`, `currentOwnerPersona`, `currentOwnerUpn`, `priorityActionId`, `approvalRequestId`, `dueAtUtc`, `issueSummary`, `resolutionSummary`.
