# People Culture Announcements

## 1. Objective
- Tenant-backed schema/reference snapshot for `People Culture Announcements` at `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`.

## 2. List-Level Metadata
- List ID: `2cd191fc-a7ea-49f2-af05-c395c2326e57`
- Entity Type Name: `People_x0020_Culture_x0020_Announcements1List`
- URL: `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral/Lists/People Culture Announcements1/AllItems.aspx`
- Default View URL: `/sites/HBCentral/Lists/People Culture Announcements1/AllItems.aspx`
- Root Folder URL: `/sites/HBCentral/Lists/People Culture Announcements1`
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
| AnnouncementId | AnnouncementId | Text | Yes | No | No | Yes | MaxLength=255; Unique=true |
| AnnouncementPerson | AnnouncementPerson | User | Yes | No | No | No | Lookup->User Information List.Id; SelectionMode=0; SelectionGroup=0 |
| AnnouncementType | AnnouncementType | Choice | Yes | No | No | No | Choices: promotion, newHire, baby, wedding, special |
| Attachments | Attachments | Attachments | No | No | No | No |  |
| AudienceTags | AudienceTags | TaxonomyFieldType | No | No | No | No | Lookup->TaxonomyHiddenList.Term$Resources:core,Language;; TermSetId=8ed8c9ea-7052-4c1d-a4d7-b9c10bffea6f; SspId=9dcca09f-7c2a-419f-a79f-e64e1f5bcf93 |
| Content Type | ContentType | Computed | No | No | No | No |  |
| CtaLabel | CtaLabel | Text | No | No | No | No | MaxLength=255 |
| CtaUrl | CtaUrl | URL | No | No | No | No |  |
| EndDisplayDate | EndDisplayDate | DateTime | No | No | No | No |  |
| Headline | Headline | Text | Yes | No | No | No | MaxLength=255 |
| HomepageEnabled | HomepageEnabled | Boolean | Yes | No | No | No | Default=1 |
| ImageAltText | ImageAltText | Text | No | No | No | No | MaxLength=255 |
| InternalNotes | InternalNotes | Note | No | No | No | No | RichText=false; Lines=6 |
| IsPinned | IsPinned | Boolean | Yes | No | No | No | Default=0 |
| OpenInNewTab | OpenInNewTab | Boolean | No | No | No | No | Default=1 |
| PersonDisplayName | PersonDisplayName | Text | No | No | No | No | MaxLength=255 |
| PrimaryImage | PrimaryImage | Thumbnail | No | No | No | No |  |
| PriorityOverride | PriorityOverride | Number | No | No | No | No |  |
| PublishDate | PublishDateMapstopublishDate_x00 | DateTime | Yes | No | No | No | Default=[today] |
| StartDisplayDate | StartDisplayDate | DateTime | No | No | No | No |  |
| Summary | Summary | Note | Yes | No | No | No | RichText=false; Lines=6 |
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
- Default New Form: `/sites/HBCentral/Lists/People Culture Announcements1/NewForm.aspx`
- Default Edit Form: `/sites/HBCentral/Lists/People Culture Announcements1/EditForm.aspx`
- Default Display Form: `/sites/HBCentral/Lists/People Culture Announcements1/DispForm.aspx`
- Appears Custom Forms (URL heuristic): `true`
- Observed Role Hint: `people/culture feature data`

## 5. Relationship Observations
- Outbound lookup references: AppPrincipals, TaxonomyHiddenList, User Information List.

## 6. Implementation-Relevant Findings
- Non-hidden editable fields: `22`
- Hidden fields: `63`
- Non-hidden lookup fields: `6`
- Unique-enforced fields: `1`
- Indexed non-hidden fields: `1`
- System/OOB fields are included where integration-relevant; app contracts should prefer non-hidden business fields unless specific OOB audit/compliance metadata is required.

## 7. Open Questions / Follow-Up Checks
- Confirm custom form bindings in list settings if app UX depends on Power Apps forms.
- Confirm canonical join keys and index strategy for production query patterns.
- Re-extract after provisioning changes or when schema drift is suspected.
