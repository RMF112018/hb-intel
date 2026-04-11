# Schema Reference Appendix — HB Kudos v3 Governing SharePoint Field Map

This appendix is the field-level storage reference for the v3 HB Kudos prompt package.

## Governing Lists

### 1. `People Culture Kudos`
The main system of record for:
- recognition content
- workflow state
- recipient targeting
- homepage visibility
- scheduling
- prominence
- claim / assignment / reassignment
- moderation and admin-review metadata
- remove / restore lifecycle
- engagement counts

### 2. `Kudos Audit Events`
The durable event journal for:
- workflow transitions
- assignment changes
- moderation actions
- schedule/prominence actions
- public/internal notes
- before/after snapshots

## `People Culture Kudos` — Governing Field Inventory

### Core identity and content
- `Title`
- `KudosId`
- `Headline`
- `Excerpt`
- `Details`
- `PrimaryImage`
- `ImageAltText`

### Submission / approval identities
- `SubmittedBy`
- `SubmittedDate`
- `ApprovedBy`
- `ApprovedDate`

### Recipient targeting
- `IndividualRecipients`
- `TeamRecipients`
- `DepartmentRecipients`
- `ProjectGroupRecipients`

### Public visibility / prominence
- `HomepageEnabled`
- `PublishStartDate`
- `PublishEndDate`
- `IsPinned`
- `PinOrder`
- `IsFeatured`
- `FeaturedExpiresAt`
- `ProminenceIntent`
- `ProminenceFailureAt`
- `ProminenceFailureReason`

### Workflow / moderation / lifecycle
- `WorkflowStatus`
- `WasEverPublished`
- `RejectionReason`
- `ModeratorNotes`
- `RevisionRequestedBy`
- `RevisionRequestedAt`
- `RevisionGuidance`
- `WithdrawnBy`
- `WithdrawnAt`
- `IsFlaggedForAdminReview`
- `AdminReviewFlaggedBy`
- `AdminReviewFlaggedAt`
- `AdminReviewReason`
- `AdminReviewedBy`
- `AdminReviewedAt`
- `RemovedBy`
- `RemovedAt`
- `RemovedReason`
- `IsRemovedFromPublicView`
- `RestoredBy`
- `RestoredAt`

### Scheduling
- `IsScheduled`
- `ScheduledPublishAt`
- `ScheduledBy`
- `ScheduleChangedBy`
- `ScheduleChangedAt`
- `ScheduleCancelledBy`
- `ScheduleCancelledAt`

### Work ownership
- `ClaimOwner`
- `ClaimedAt`
- `AssignedOwner`
- `ReassignedBy`
- `ReassignedAt`
- `ReviewedBy`
- `ReviewedAt`

### Audience / engagement
- `CurrentVisibilityMode`
- `CelebrateCount`

### Relevant system fields
- `ID`
- `Created`
- `Modified`
- `Author`
- `Editor`
- `Attachments`
- `FileRef`

## `Kudos Audit Events` — Required Core Fields

- `Title`
- `KudosId`
- `EventType`
- `Actor`
- `EventAt`
- `OldValue`
- `NewValue`
- `PublicNote`
- `InternalNote`

## Governing Choice Sets

### `WorkflowStatus`
Use the live list values as authoritative. The operating model must support this canonical set:
- `pending`
- `revisionRequested`
- `approved`
- `approvedScheduled`
- `rejected`
- `withdrawn`
- `removedUnpublished`

If current code uses alternative labels, create an explicit mapping rather than silently drifting.

### `ProminenceIntent`
- `standard`
- `pinned`
- `featured`

### `CurrentVisibilityMode`
- `public`
- `associatedOnly`
- `internalOnly`

### `EventType`
Treat the live SharePoint choice set as the governing enum for the audit reducer. The implementation should support, at minimum, the expected event families:
- submit
- approve
- reject
- revisionRequested
- reopen
- remove
- restore
- flagAdminReview
- clearAdminReview
- claim
- reassign
- schedule
- unschedule
- feature
- unfeature
- pin
- unpin
- celebrate

## UI Semantics for Governing Fields

### Recipient fields
- `IndividualRecipients` must map to a real people-selector and avatar-based recipient presentation.
- `TeamRecipients`, `DepartmentRecipients`, and `ProjectGroupRecipients` must map to explicit bucketed recipient UI with shared chip/tag/summary treatments.
- A plain text comma-delimited recipient field is not an acceptable final-state UI contract.

### Workflow / prominence / visibility fields
- `WorkflowStatus`, `ProminenceIntent`, and `CurrentVisibilityMode` must map to shared status primitives rather than ad hoc local badges.
- The employee experience and governance experience should share one coherent status language.

### Governance detail / timeline fields
- scheduling, claim/reassignment, admin-review, remove/restore, and revision fields must map to shared governance detail sections and/or shared audit timeline blocks.
- `OldValue` / `NewValue` should be written in a form the UI can safely summarize without exposing brittle raw blobs to end users.

### Engagement
- `CelebrateCount` must map to a shared recognition engagement presentation pattern.

## Field Responsibility Rules

### User-authored / submitter-authored inputs
- `Headline`
- `Excerpt`
- `Details`
- recipient bucket fields
- `PrimaryImage`
- `ImageAltText`

### HR/admin-authored moderation inputs
- `RejectionReason`
- `ModeratorNotes`
- `RevisionGuidance`
- `AdminReviewReason`
- scheduling/prominence choices when explicitly changed by authorized users

### System-managed workflow fields
Treat these as application-managed, not casually user-authored:
- `WorkflowStatus`
- `WasEverPublished`
- `HomepageEnabled`
- `PublishStartDate`
- `PublishEndDate`
- `IsRemovedFromPublicView`
- remove/restore timestamps and actors
- revision/withdrawal timestamps and actors
- admin-review flags/timestamps/actors
- scheduling flags/timestamps/actors
- `IsPinned`
- `IsFeatured`
- `FeaturedExpiresAt`
- `PinOrder`
- `ProminenceFailureAt`
- `ProminenceFailureReason`
- `ClaimOwner`
- `ClaimedAt`
- `AssignedOwner`
- `ReassignedBy`
- `ReassignedAt`
- `ReviewedBy`
- `ReviewedAt`
- `CurrentVisibilityMode`
- `CelebrateCount`

## Recommended Indexes / Query Hotspots

If SharePoint indexing constraints allow, prefer indexing:
- `KudosId`
- `WorkflowStatus`
- `SubmittedDate`
- `ApprovedDate`
- `IsFlaggedForAdminReview`
- `IsRemovedFromPublicView`
- `IsScheduled`
- `ScheduledPublishAt`
- `IsPinned`
- `IsFeatured`
- `CurrentVisibilityMode`
- `ClaimOwner`
- `AssignedOwner`

The audit list should preferably index:
- `KudosId`
- `EventAt`

## Implementation Posture

- Use these list schemas as the primary mapping target.
- Do not invent replacement fields where the correct field already exists.
- Document any repo/list mismatch explicitly if code/contracts still assume missing fields.
- Prefer durable audit history in `Kudos Audit Events` instead of overloading the main list item with every historical transition.
