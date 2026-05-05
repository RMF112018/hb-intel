# Required Contracts and Fields

Use this file as the implementation minimum. Do not reduce the content unless repo truth proves an equivalent contract already exists.

## Required Read-Model Families

- External Systems Launch Pad composite.
- External System Registry.
- Project External Launch Links.
- Project External System Mappings.
- External Object References.
- External Review Items.
- External System Health Snapshots.
- External System Audit Events.
- HBI Source Lineage.
- URL Policy Evaluation.
- Role/Action Visibility.

## Required UI States

- loading
- ready/available
- empty
- stale
- degraded
- missing-config
- blocked-by-policy
- unauthorized
- unavailable
- backend-unavailable
- source-unavailable
- redacted
- refusal
- citation-ready

## Required Policy Fields

- scheme
- hostname
- policyState
- allowIframe
- allowCurrentImagePreview
- requiresPmPxApproval
- policyReason
- lastReviewedAt
- reviewedByUpn

## Required Link Fields

- projectId
- projectNumber
- systemKey
- linkType
- providerName
- title
- normalizedTargetKey
- launchUrl
- hostname
- approvalState
- requiresApproval
- submittedByUpn
- approvedByUpn
- sortOrder
- audienceMode
- audiencePersonas
- iframeEligible
- currentImageEligible
- isActive
- urlPolicyState
- policyReason

## Required Mapping Fields

- projectId
- projectNumber
- systemKey
- mappingScope
- sourceObjectType
- externalObjectId
- externalObjectNumber
- externalDisplayName
- mappingState
- freshnessBand
- lastVerifiedAtUtc
- ownerPersona
- ownerUpn
- lineage
- reviewItemId

## Required Review Item Fields

- projectId
- systemKey
- issueType
- subjectKey
- reviewState
- currentOwnerPersona
- currentOwnerUpn
- priorityActionId
- approvalRequestId
- dueAtUtc
- issueSummary
- resolutionSummary

## Required HBI Behavior

Allowed:

- explain visible mappings;
- summarize source health;
- cite lineage;
- refuse unsupported/authority-seeking requests.

Refused:

- approve/reject/archive/restore;
- mutate any source system;
- bypass redaction/access;
- make legal/accounting/claim/award decisions.
