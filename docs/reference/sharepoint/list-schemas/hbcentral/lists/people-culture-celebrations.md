# People Culture Celebrations

## 1. Objective
- Tenant-backed schema/reference snapshot for `People Culture Celebrations` at `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`.

## 2. List-Level Metadata
- List ID: `b87bf664-0531-418b-902c-726e5fb87083`
- Entity Type Name: `People_x0020_Culture_x0020_AnnouncementsList`
- URL: `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral/Lists/People Culture Announcements/AllItems.aspx`
- Default View URL: `/sites/HBCentral/Lists/People Culture Announcements/AllItems.aspx`
- Root Folder URL: `/sites/HBCentral/Lists/People Culture Announcements`
- Base Template / Base Type: `100` / `0`
- Classification: `business/custom`
- Description: ``
- Hidden: `false`
- Item Count: `1`
- Content Types Enabled: `false`
- Versioning: `EnableVersioning=true`, `EnableMinorVersions=false`, `MajorVersionLimit=50`
- Moderation: `EnableModeration=false`
- Attachments Enabled: `true`

## 3. Field Schema

| Display Name | Internal Name | Type | Required | Hidden | Read Only | Indexed | Lookup / Choices / Formula / Notes |
|---|---|---|---|---|---|---|---|
| AnniversaryYears | AnniversaryYears | Number | No | No | No | No |  |
| AnnouncementId | AnnouncementId | Text | Yes | No | No | Yes | MaxLength=255; Unique=true |
| Attachments | Attachments | Attachments | No | No | No | No |  |
| AudienceTags | AudienceTags | TaxonomyFieldType | No | No | No | No | Lookup->TaxonomyHiddenList.Term$Resources:core,Language;; TermSetId=8ed8c9ea-7052-4c1d-a4d7-b9c10bffea6f; SspId=9dcca09f-7c2a-419f-a79f-e64e1f5bcf93 |
| CelebrationDate | CelebrationDate | DateTime | Yes | No | No | No |  |
| CelebrationType | CelebrationType | Choice | Yes | No | No | No | Choices: Birthday, Anniversary, Promotion, Wedding, Engagement, Baby |
| Content Type | ContentType | Computed | No | No | No | No |  |
| ExternalEmployeeId | ExternalEmployeeId | Text | No | No | No | No | MaxLength=255 |
| HomepageEnabledGovernance extension; adapter can honor this. | HomepageEnabledGovernanceextensi | Boolean | Yes | No | No | No | Default=1 |
| ImageAltText | ImageAltText | Text | No | No | No | No | MaxLength=255 |
| IsFeatured | IsFeatured | Boolean | No | No | No | No | Default=0 |
| LastSynchronizedOn | LastSynchronizedOn | DateTime | No | No | No | No |  |
| PersonDisplayName | PersonDisplayName | Text | No | No | No | No | MaxLength=255 |
| PersonName | PersonName | UserMulti | Yes | No | No | No | Lookup->User Information List.Id; SelectionMode=0; SelectionGroup=0 |
| PrimaryImage | PrimaryImage | Thumbnail | No | No | No | No |  |
| SourceSystem | SourceSystem | Choice | No | No | No | No | Choices: Manual, BambooHR, ADP, Choice 4; Default=Manual |
| Title | Title | Text | No | No | No | No | MaxLength=255 |
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
- Default New Form: `/sites/HBCentral/Lists/People Culture Announcements/NewForm.aspx`
- Default Edit Form: `/sites/HBCentral/Lists/People Culture Announcements/EditForm.aspx`
- Default Display Form: `/sites/HBCentral/Lists/People Culture Announcements/DispForm.aspx`
- Appears Custom Forms (URL heuristic): `true`
- Observed Role Hint: `people/culture feature data`

## 5. Relationship Observations
- Outbound lookup references: AppPrincipals, TaxonomyHiddenList, User Information List.

## 6. Implementation-Relevant Findings
- Non-hidden editable fields: `17`
- Hidden fields: `63`
- Non-hidden lookup fields: `6`
- Unique-enforced fields: `1`
- Indexed non-hidden fields: `1`
- System/OOB fields are included where integration-relevant; app contracts should prefer non-hidden business fields unless specific OOB audit/compliance metadata is required.

## 7. Open Questions / Follow-Up Checks
- Confirm custom form bindings in list settings if app UX depends on Power Apps forms.
- Confirm canonical join keys and index strategy for production query patterns.
- Re-extract after provisioning changes or when schema drift is suspected.
