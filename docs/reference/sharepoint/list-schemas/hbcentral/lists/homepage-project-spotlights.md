# Homepage Project Spotlights

## 1. Objective
- Tenant-backed schema/reference snapshot for `Homepage Project Spotlights` at `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`.

## 2. List-Level Metadata
- List ID: `f47b2eef-9972-4f08-879f-212c97cecab6`
- Entity Type Name: `Project_x005f_SpotlightList`
- URL: `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral/Lists/Project_Spotlight/AllItems.aspx`
- Default View URL: `/sites/HBCentral/Lists/Project_Spotlight/AllItems.aspx`
- Root Folder URL: `/sites/HBCentral/Lists/Project_Spotlight`
- Base Template / Base Type: `100` / `0`
- Classification: `business/custom`
- Description: ``
- Hidden: `false`
- Item Count: `2`
- Content Types Enabled: `false`
- Versioning: `EnableVersioning=true`, `EnableMinorVersions=false`, `MajorVersionLimit=50`
- Moderation: `EnableModeration=false`
- Attachments Enabled: `true`

## 3. Field Schema

| Display Name | Internal Name | Type | Required | Hidden | Read Only | Indexed | Lookup / Choices / Formula / Notes |
|---|---|---|---|---|---|---|---|
| Attachments | Attachments | Attachments | No | No | No | No |  |
| Audience | Audience | TaxonomyFieldType | No | No | No | No | Lookup->TaxonomyHiddenList.Term$Resources:core,Language;; TermSetId=7ef26231-20f3-4e6a-904c-d74e48908273; SspId=9dcca09f-7c2a-419f-a79f-e64e1f5bcf93 |
| Content Type | ContentType | Computed | No | No | No | No |  |
| CtaLabel | CtaLabel | Text | No | No | No | No | MaxLength=255 |
| CtaUrl | CtaUrl | URL | No | No | No | No |  |
| DisplayOrder | DisplayOrder | Number | Yes | No | No | No |  |
| FreshnessDate | FreshnessDate | DateTime | No | No | No | No |  |
| FreshnessSource | FreshnessSource | Choice | No | No | No | No | Choices: live, curated, manual |
| Headline | Headline | Note | No | No | No | No | RichText=false; Lines=6 |
| HomepageEnabled | HomepageEnabled | Boolean | Yes | No | No | No | Default=1 |
| IsFeatured | IsFeatured | Boolean | Yes | No | No | No | Default=0 |
| LocationText | LocationText | Text | No | No | No | No | MaxLength=255 |
| MilestonesCompleted | MilestonesCompleted | Number | No | No | No | No |  |
| MilestonesTotal | MilestonesTotal | Number | No | No | No | No |  |
| MilestoneSummary | MilestoneSummary | Note | No | No | No | No | RichText=false; Lines=6 |
| PrimaryImageAltText | PrimaryImageAltText | Text | No | No | No | No | MaxLength=255 |
| PrimaryImage | PrimaryImageUrl | URL | No | No | No | No |  |
| ProjectId | ProjectId | Text | No | No | No | No | MaxLength=255 |
| ProjectTeamMembers | ProjectTeamMembers | UserMulti | No | No | No | No | Lookup->User Information List.Id; SelectionMode=0; SelectionGroup=0 |
| ProjectUrl | ProjectUrl | URL | No | No | No | No |  |
| PublishEnd | PublishEnd | DateTime | No | No | No | No |  |
| PublishStart | PublishStart | DateTime | No | No | No | No |  |
| Sector | Sector | Choice | No | No | No | No | Choices: Healthcare, Commercial, Luxury Residential, Multifamily, Marine, Education, Civic / Public, Mixed Use, Choice 9 |
| StaleAfterDays | StaleAfterDays | Number | No | No | No | No |  |
| StatusLabel | StatusLabel | Choice | No | No | No | No | Choices: On Track, Watchlist, At Risk, Completed, Planning, Mobilizing |
| StatusVariant | StatusVariant | Choice | No | No | No | No | Choices: success, warning, danger, info |
| StrategicEmphasis | StrategicEmphasis | Boolean | No | No | No | No | Default=0 |
| Summary | Summary | Note | No | No | No | No | RichText=true; Lines=6 |
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
- Default New Form: `/sites/HBCentral/Lists/Project_Spotlight/NewForm.aspx`
- Default Edit Form: `/sites/HBCentral/Lists/Project_Spotlight/EditForm.aspx`
- Default Display Form: `/sites/HBCentral/Lists/Project_Spotlight/DispForm.aspx`
- Appears Custom Forms (URL heuristic): `true`
- Observed Role Hint: `project-related data/config`

## 5. Relationship Observations
- Contains key field `ProjectId` (likely join/filter dimension).
- Outbound lookup references: AppPrincipals, TaxonomyHiddenList, User Information List.

## 6. Implementation-Relevant Findings
- Non-hidden editable fields: `29`
- Hidden fields: `63`
- Non-hidden lookup fields: `6`
- Unique-enforced fields: `0`
- Indexed non-hidden fields: `0`
- System/OOB fields are included where integration-relevant; app contracts should prefer non-hidden business fields unless specific OOB audit/compliance metadata is required.

## 7. Open Questions / Follow-Up Checks
- Confirm custom form bindings in list settings if app UX depends on Power Apps forms.
- Confirm canonical join keys and index strategy for production query patterns.
- Re-extract after provisioning changes or when schema drift is suspected.
