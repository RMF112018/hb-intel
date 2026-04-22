# HB Article Workflow History

## 1. Objective
- Tenant-backed schema/reference snapshot for `HB Article Workflow History` at `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`.

## 2. List-Level Metadata
- List ID: `784a69bd-4276-4476-870c-ea957298c8aa`
- Entity Type Name: `HB_x0020_Article_x0020_Workflow_x0020_HistoryList`
- URL: `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral/Lists/HB Article Workflow History/AllItems.aspx`
- Default View URL: `/sites/HBCentral/Lists/HB Article Workflow History/AllItems.aspx`
- Root Folder URL: `/sites/HBCentral/Lists/HB Article Workflow History`
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
| ActionDateUtc | ActionDateUtc | DateTime | Yes | No | No | No |  |
| ActionNote | ActionNote | Note | No | No | No | No | RichText=false; Lines=6 |
| ActorEmail | ActorEmail | Text | No | No | No | No | MaxLength=255 |
| ArticleId | ArticleId | Text | Yes | No | No | No | MaxLength=255 |
| Attachments | Attachments | Attachments | No | No | No | No |  |
| Content Type | ContentType | Computed | No | No | No | No |  |
| HistoryId | HistoryId | Text | Yes | No | No | No | MaxLength=255 |
| NewState | NewState | Choice | Yes | No | No | No | Choices: draft, review, approved, scheduled, published, archived, withdrawn |
| PreviousState | PreviousState | Choice | No | No | No | No | Choices: draft, review, approved, scheduled, published, archived, withdrawn |
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
- Default New Form: `/sites/HBCentral/Lists/HB Article Workflow History/NewForm.aspx`
- Default Edit Form: `/sites/HBCentral/Lists/HB Article Workflow History/EditForm.aspx`
- Default Display Form: `/sites/HBCentral/Lists/HB Article Workflow History/DispForm.aspx`
- Appears Custom Forms (URL heuristic): `true`
- Observed Role Hint: `workflow/history tracking`

## 5. Relationship Observations
- Contains key field `ArticleId` (likely join/filter dimension).
- Outbound lookup references: AppPrincipals, User Information List.

## 6. Implementation-Relevant Findings
- Non-hidden editable fields: `10`
- Hidden fields: `61`
- Non-hidden lookup fields: `4`
- Unique-enforced fields: `0`
- Indexed non-hidden fields: `0`
- System/OOB fields are included where integration-relevant; app contracts should prefer non-hidden business fields unless specific OOB audit/compliance metadata is required.

## 7. Open Questions / Follow-Up Checks
- Confirm custom form bindings in list settings if app UX depends on Power Apps forms.
- Confirm canonical join keys and index strategy for production query patterns.
- Re-extract after provisioning changes or when schema drift is suspected.
