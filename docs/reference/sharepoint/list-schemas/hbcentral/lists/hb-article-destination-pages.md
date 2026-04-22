# HB Article Destination Pages

## 1. Objective
- Tenant-backed schema/reference snapshot for `HB Article Destination Pages` at `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`.

## 2. List-Level Metadata
- List ID: `eedc141e-4146-4302-9cb6-5da5d95270da`
- Entity Type Name: `HB_x0020_Article_x0020_Destination_x0020_PagesList`
- URL: `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral/Lists/HB Article Destination Pages/AllItems.aspx`
- Default View URL: `/sites/HBCentral/Lists/HB Article Destination Pages/AllItems.aspx`
- Root Folder URL: `/sites/HBCentral/Lists/HB Article Destination Pages`
- Base Template / Base Type: `100` / `0`
- Classification: `business/custom`
- Description: ``
- Hidden: `false`
- Item Count: `0`
- Content Types Enabled: `false`
- Versioning: `EnableVersioning=true`, `EnableMinorVersions=false`, `MajorVersionLimit=50`
- Moderation: `EnableModeration=false`
- Attachments Enabled: `true`

## 3. Field Schema

| Display Name | Internal Name | Type | Required | Hidden | Read Only | Indexed | Lookup / Choices / Formula / Notes |
|---|---|---|---|---|---|---|---|
| ArticleId | ArticleId | Text | Yes | No | No | No | MaxLength=255 |
| Attachments | Attachments | Attachments | No | No | No | No |  |
| BindingId | BindingId | Text | Yes | No | No | No | MaxLength=255 |
| Content Type | ContentType | Computed | No | No | No | No |  |
| LastSyncDateUtc | LastSyncDateUtc | DateTime | No | No | No | No |  |
| LastSyncMessage | LastSyncMessage | Note | No | No | No | No | RichText=false; Lines=6 |
| PageId | PageId | Text | No | No | No | No | MaxLength=255 |
| PageName | PageName | Text | No | No | No | No | MaxLength=255 |
| PageShellVersion | PageShellVersion | Text | No | No | No | No | MaxLength=255 |
| PageTemplateKey | PageTemplateKey | Text | Yes | No | No | No | MaxLength=255 |
| PageUrl | PageUrl | URL | No | No | No | No |  |
| PublishedDateUtc | PublishedDateUtc | DateTime | No | No | No | No |  |
| PublishStatus | PublishStatus | Choice | Yes | No | No | No | Choices: draft, published, error, scheduled |
| RenderVersion | RenderVersion | Text | No | No | No | No | MaxLength=255 |
| SyncStatus | SyncStatus | Choice | No | No | No | No | Choices: in-sync, pending, error |
| TargetSiteUrl | TargetSiteUrl | Text | Yes | No | No | No | MaxLength=255 |
| Title | Title | Text | Yes | No | No | No | MaxLength=255 |
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
- Default New Form: `/sites/HBCentral/Lists/HB Article Destination Pages/NewForm.aspx`
- Default Edit Form: `/sites/HBCentral/Lists/HB Article Destination Pages/EditForm.aspx`
- Default Display Form: `/sites/HBCentral/Lists/HB Article Destination Pages/DispForm.aspx`
- Appears Custom Forms (URL heuristic): `true`
- Observed Role Hint: `page binding/destination tracking`

## 5. Relationship Observations
- Contains key field `ArticleId` (likely join/filter dimension).
- Contains key field `BindingId` (likely join/filter dimension).
- Contains key field `PageTemplateKey` (likely join/filter dimension).
- Outbound lookup references: AppPrincipals, User Information List.

## 6. Implementation-Relevant Findings
- Non-hidden editable fields: `17`
- Hidden fields: `61`
- Non-hidden lookup fields: `4`
- Unique-enforced fields: `0`
- Indexed non-hidden fields: `0`
- System/OOB fields are included where integration-relevant; app contracts should prefer non-hidden business fields unless specific OOB audit/compliance metadata is required.

## 7. Open Questions / Follow-Up Checks
- Confirm custom form bindings in list settings if app UX depends on Power Apps forms.
- Confirm canonical join keys and index strategy for production query patterns.
- Re-extract after provisioning changes or when schema drift is suspected.
