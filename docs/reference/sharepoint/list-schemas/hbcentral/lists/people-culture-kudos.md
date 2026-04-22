# People Culture Kudos

## 1. Objective
- Tenant-backed schema/reference snapshot for `People Culture Kudos` at `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`.

## 2. List-Level Metadata
- List ID: `b01fa4d2-29b1-4e11-b581-4cb3d0951a79`
- Entity Type Name: `People_x0020_Culture_x0020_KudosList`
- URL: `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral/Lists/People Culture Kudos/Compact.aspx`
- Default View URL: `/sites/HBCentral/Lists/People Culture Kudos/Compact.aspx`
- Root Folder URL: `/sites/HBCentral/Lists/People Culture Kudos`
- Base Template / Base Type: `100` / `0`
- Classification: `business/custom`
- Description: ``
- Hidden: `false`
- Item Count: `5`
- Content Types Enabled: `false`
- Versioning: `EnableVersioning=true`, `EnableMinorVersions=false`, `MajorVersionLimit=50`
- Moderation: `EnableModeration=false`
- Attachments Enabled: `true`

## 3. Field Schema

| Display Name | Internal Name | Type | Required | Hidden | Read Only | Indexed | Lookup / Choices / Formula / Notes |
|---|---|---|---|---|---|---|---|
| AdminReviewedAt | AdminReviewedAt | DateTime | No | No | No | No |  |
| AdminReviewedBy | AdminReviewedBy | User | No | No | No | No | Lookup->User Information List.Id; SelectionMode=0; SelectionGroup=0 |
| AdminReviewFlaggedAt | AdminReviewFlaggedAt | DateTime | No | No | No | No |  |
| AdminReviewFlaggedBy | AdminReviewFlaggedBy | User | No | No | No | No | Lookup->User Information List.Id; SelectionMode=0; SelectionGroup=0 |
| AdminReviewReason | AdminReviewReason | Note | No | No | No | No | RichText=false; Lines=6 |
| ApprovedBy | ApprovedBy | User | No | No | No | No | Lookup->User Information List.Id; SelectionMode=0; SelectionGroup=0 |
| ApprovedDate | ApprovedDate | DateTime | No | No | No | No |  |
| AssignedOwner | AssignedOwner | User | No | No | No | No | Lookup->User Information List.ImnName; SelectionMode=0; SelectionGroup=0 |
| Attachments | Attachments | Attachments | No | No | No | No |  |
| CelebrateCount | CelebrateCount | Number | Yes | No | No | No | Default=0 |
| ClaimedAt | ClaimedAt | DateTime | No | No | No | No |  |
| ClaimOwner | ClaimOwner | User | No | No | No | No | Lookup->User Information List.ImnName; SelectionMode=0; SelectionGroup=0 |
| Content Type | ContentType | Computed | No | No | No | No |  |
| CurrentVisibilityMode | CurrentVisibilityMode | Choice | No | No | No | No | Choices: public, associatedOnly, internalOnly; Default=internalOnly |
| DepartmentRecipients | DepartmentRecipients | TaxonomyFieldType | No | No | No | No | Lookup->TaxonomyHiddenList.Term$Resources:core,Language;; TermSetId=8ed8c9ea-7052-4c1d-a4d7-b9c10bffea6f; SspId=9dcca09f-7c2a-419f-a79f-e64e1f5bcf93 |
| Details | Details | Note | No | No | No | No | RichText=false; Lines=6 |
| Excerpt | Excerpt | Note | Yes | No | No | No | RichText=false; Lines=6 |
| FeaturedExpiresAt | FeaturedExpiresAt | DateTime | No | No | No | No |  |
| Headline | Headline | Text | Yes | No | No | No | MaxLength=255 |
| HomepageEnabled | HomepageEnabled | Boolean | Yes | No | No | No | Default=1 |
| ImageAltText | ImageAltText | Text | No | No | No | No | MaxLength=255 |
| IndividualRecipients | IndividualRecipients | UserMulti | No | No | No | No | Lookup->User Information List.Id; SelectionMode=0; SelectionGroup=0 |
| IsFeatured | IsFeatured | Boolean | No | No | No | No | Default=0 |
| IsFlaggedForAdminReview | IsFlaggedForAdminReview | Boolean | No | No | No | No | Default=0 |
| IsPinned | IsPinned | Boolean | Yes | No | No | No | Default=0 |
| IsRemovedFromPublicView | IsRemovedFromPublicView | Boolean | No | No | No | No | Default=0 |
| IsScheduled | IsScheduled | Boolean | No | No | No | No | Default=0 |
| KudosId | KudosId | Text | Yes | No | No | Yes | MaxLength=255; Unique=true |
| ModeratorNotes | ModeratorNotes | Note | No | No | No | No | RichText=false; Lines=6 |
| PinOrder | PinOrder | Number | No | No | No | No |  |
| PrimaryImage | PrimaryImage | Thumbnail | No | No | No | No |  |
| ProjectGroupRecipients | ProjectGroupRecipients | TaxonomyFieldType | No | No | No | No | Lookup->TaxonomyHiddenList.Term$Resources:core,Language;; TermSetId=85df11fd-19b4-4e81-a6d5-fb6106de56d3; SspId=9dcca09f-7c2a-419f-a79f-e64e1f5bcf93 |
| ProminenceFailureAt | ProminenceFailureAt | DateTime | No | No | No | No |  |
| ProminenceFailureReason | ProminenceFailureReason | Note | No | No | No | No | RichText=true; Lines=6 |
| ProminenceIntent | ProminenceIntent | Choice | No | No | No | No | Choices: standard, pinned, featured; Default=standard |
| PublishEndDate | PublishEndDate | DateTime | No | No | No | No |  |
| PublishStartDate | PublishStartDate | DateTime | No | No | No | No |  |
| ReassignedAt | ReassignedAt | DateTime | No | No | No | No |  |
| ReassignedBy | ReassignedBy | User | No | No | No | No | Lookup->User Information List.ImnName; SelectionMode=0; SelectionGroup=0 |
| RejectionReason | RejectionReason | Note | No | No | No | No | RichText=false; Lines=6 |
| RemovedAt | RemovedAt | DateTime | No | No | No | No |  |
| RemovedBy | RemovedBy | User | No | No | No | No | Lookup->User Information List.Id; SelectionMode=0; SelectionGroup=0 |
| RemovedReason | RemovedReason | Note | No | No | No | No | RichText=false; Lines=6 |
| RestoredAt | RestoredAt | DateTime | No | No | No | No |  |
| RestoredBy | RestoredBy | User | No | No | No | No | Lookup->User Information List.Id; SelectionMode=0; SelectionGroup=0 |
| ReviewedAt | ReviewedAt | DateTime | No | No | No | No |  |
| ReviewedBy | ReviewedBy | User | No | No | No | No | Lookup->User Information List.ImnName; SelectionMode=0; SelectionGroup=0 |
| RevisionGuidance | RevisionGuidance | Note | No | No | No | No | RichText=false; Lines=6 |
| RevisionRequestedAt | RevisionRequestedAt | DateTime | No | No | No | No |  |
| RevisionRequestedBy | RevisionRequestedBy | User | No | No | No | No | Lookup->User Information List.Id; SelectionMode=0; SelectionGroup=0 |
| ScheduleCancelledAt | ScheduleCancelledAt | DateTime | No | No | No | No |  |
| ScheduleCancelledBy | ScheduleCancelledBy | User | No | No | No | No | Lookup->User Information List.ImnName; SelectionMode=0; SelectionGroup=0 |
| ScheduleChangedAt | ScheduleChangedAt | DateTime | No | No | No | No |  |
| ScheduleChangedBy | ScheduleChangedBy | User | No | No | No | No | Lookup->User Information List.ImnName; SelectionMode=0; SelectionGroup=0 |
| ScheduledBy | ScheduledBy | User | No | No | No | No | Lookup->User Information List.Id; SelectionMode=0; SelectionGroup=0 |
| ScheduledPublishAt | ScheduledPublishAt | DateTime | No | No | No | No |  |
| SubmittedBy | SubmittedBy | User | Yes | No | No | No | Lookup->User Information List.Id; SelectionMode=0; SelectionGroup=0 |
| SubmittedDate | SubmittedDate | DateTime | Yes | No | No | No | Default=[today] |
| TeamRecipients | TeamRecipients | TaxonomyFieldType | No | No | No | No | Lookup->TaxonomyHiddenList.Term$Resources:core,Language;; TermSetId=8ed8c9ea-7052-4c1d-a4d7-b9c10bffea6f; SspId=9dcca09f-7c2a-419f-a79f-e64e1f5bcf93 |
| Title | Title | Text | No | No | No | No | MaxLength=255 |
| WasEverPublished | WasEverPublished | Boolean | Yes | No | No | No | Default=0 |
| WithdrawnAt | WithdrawnAt | DateTime | No | No | No | No |  |
| WithdrawnBy | WithdrawnBy | User | No | No | No | No | Lookup->User Information List.Id; SelectionMode=0; SelectionGroup=0 |
| WorkflowStatus | WorkflowStatus | Choice | Yes | No | No | No | Choices: pending, revisionRequested, approved, approvedScheduled, rejected, withdrawn, removedUnpublished |
| Color Tag | _ColorTag | Text | No | No | Yes | No | MaxLength=255; System/OOB-like |
| Label setting | _ComplianceFlags | Lookup | No | No | Yes | No | System/OOB-like |
| Retention label | _ComplianceTag | Lookup | No | No | Yes | No | System/OOB-like |
| Label applied by | _ComplianceTagUserId | Lookup | No | No | Yes | No | System/OOB-like |
| Retention label Applied | _ComplianceTagWrittenTime | Lookup | No | No | Yes | No | System/OOB-like |
| Has Copy Destinations | _HasCopyDestinations | Boolean | No | Yes | Yes | No | System/OOB-like |
| Item is a Record | _IsRecord | Computed | No | No | Yes | No | System/OOB-like |
| Approval Status | _ModerationStatus | ModStat | No | Yes | Yes | No | Choices: 0;#Approved, 1;#Rejected, 2;#Pending, 3;#Draft, 4;#Scheduled; Default=0; System/OOB-like |
| Version | _UIVersionString | Text | No | No | Yes | No | MaxLength=255; System/OOB-like |
| App Created By | AppAuthor | Lookup | No | No | Yes | No | Lookup->AppPrincipals.Title; System/OOB-like |
| App Modified By | AppEditor | Lookup | No | No | Yes | No | Lookup->AppPrincipals.Title; System/OOB-like |
| Created By | Author | User | No | No | Yes | No | Lookup->User Information List.Id; SelectionMode=1; SelectionGroup=0; System/OOB-like |
| Compliance Asset Id | ComplianceAssetId | Text | No | No | Yes | No | MaxLength=255; System/OOB-like |
| Content Type ID | ContentTypeId | ContentTypeId | No | Yes | Yes | No | System/OOB-like |
| Created | Created | DateTime | No | No | Yes | No | System/OOB-like |
| Type | DocIcon | Computed | No | No | Yes | No | System/OOB-like |
| Edit | Edit | Computed | No | No | Yes | No | System/OOB-like |
| Modified By | Editor | User | No | No | Yes | No | Lookup->User Information List.Id; SelectionMode=1; SelectionGroup=0; System/OOB-like |
| Name | FileLeafRef | File | No | Yes | No | No | System/OOB-like |
| URL Path | FileRef | Lookup | No | Yes | Yes | No | System/OOB-like |
| Folder Child Count | FolderChildCount | Lookup | No | No | Yes | No | System/OOB-like |
| GUID | GUID | Guid | No | Yes | Yes | No | System/OOB-like |
| ID | ID | Counter | No | No | Yes | No | System/OOB-like |
| Item Child Count | ItemChildCount | Lookup | No | No | Yes | No | System/OOB-like |
| Title | LinkTitle | Computed | No | No | Yes | No | System/OOB-like |
| Title | LinkTitleNoMenu | Computed | No | No | Yes | No | System/OOB-like |
| Modified | Modified | DateTime | No | No | Yes | No | System/OOB-like |
| Unique Id | UniqueId | Lookup | No | Yes | Yes | No | System/OOB-like |

## 4. Content Types / Forms / Behavioral Context
- Associated Content Types: `Item, Folder`
- Default New Form: `/sites/HBCentral/Lists/People Culture Kudos/NewForm.aspx`
- Default Edit Form: `/sites/HBCentral/Lists/People Culture Kudos/EditForm.aspx`
- Default Display Form: `/sites/HBCentral/Lists/People Culture Kudos/DispForm.aspx`
- Appears Custom Forms (URL heuristic): `true`
- Observed Role Hint: `people/culture feature data`

## 5. Relationship Observations
- Outbound lookup references: AppPrincipals, TaxonomyHiddenList, User Information List.

## 6. Implementation-Relevant Findings
- Non-hidden editable fields: `64`
- Hidden fields: `65`
- Non-hidden lookup fields: `23`
- Unique-enforced fields: `1`
- Indexed non-hidden fields: `1`
- System/OOB fields are included where integration-relevant; app contracts should prefer non-hidden business fields unless specific OOB audit/compliance metadata is required.

## 7. Open Questions / Follow-Up Checks
- Confirm custom form bindings in list settings if app UX depends on Power Apps forms.
- Confirm canonical join keys and index strategy for production query patterns.
- Re-extract after provisioning changes or when schema drift is suspected.
