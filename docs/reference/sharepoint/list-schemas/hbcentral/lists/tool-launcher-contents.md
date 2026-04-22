# Tool Launcher Contents

## 1. Objective
- Tenant-backed schema/reference snapshot for `Tool Launcher Contents` at `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`.

## 2. List-Level Metadata
- List ID: `d805a503-c359-4f94-a732-ac799f93790b`
- Entity Type Name: `Tool_x0020_Launcher_x0020_ContentsList`
- URL: `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral/Lists/Tool Launcher Contents/AllItems.aspx`
- Default View URL: `/sites/HBCentral/Lists/Tool Launcher Contents/AllItems.aspx`
- Root Folder URL: `/sites/HBCentral/Lists/Tool Launcher Contents`
- Base Template / Base Type: `100` / `0`
- Classification: `business/custom`
- Description: ``
- Hidden: `false`
- Item Count: `9`
- Content Types Enabled: `false`
- Versioning: `EnableVersioning=true`, `EnableMinorVersions=false`, `MajorVersionLimit=50`
- Moderation: `EnableModeration=false`
- Attachments Enabled: `true`

## 3. Field Schema

| Display Name | Internal Name | Type | Required | Hidden | Read Only | Indexed | Lookup / Choices / Formula / Notes |
|---|---|---|---|---|---|---|---|
| Access Request Destination | AccessRequestDestination | URL | No | No | No | No |  |
| Attachments | Attachments | Attachments | No | No | No | No |  |
| Content Type | ContentType | Computed | No | No | No | No |  |
| Favorite Eligible | FavoriteEligible | Boolean | No | No | No | No | Default=0 |
| Featured | Featured | Boolean | No | No | No | No | Default=1 |
| Platform Key | field_1 | Text | No | No | No | No | MaxLength=255 |
| Featured Sort Order | field_10 | Number | No | No | No | No |  |
| Sort Order | field_11 | Number | No | No | No | No |  |
| Audience Visibility | field_12 | Text | No | No | No | No | MaxLength=255 |
| Audience Rules JSON | field_13 | Text | No | No | No | No | MaxLength=255 |
| Aliases / Keywords | field_14 | Text | No | No | No | No | MaxLength=255 |
| Support Owner | field_16 | Text | No | No | No | No | MaxLength=255 |
| Notice Status | field_19 | Text | No | No | No | No | MaxLength=255 |
| Launch URL | field_2 | URL | No | No | No | No |  |
| Notice Badge Text | field_20 | Text | No | No | No | No | MaxLength=255 |
| Notice Details | field_21 | Text | No | No | No | No | MaxLength=255 |
| Notice Expires On | field_22 | DateTime | No | No | No | No |  |
| Status Badge Tone | field_26 | Text | No | No | No | No | MaxLength=255 |
| Vendor / Product Family | field_27 | Text | No | No | No | No | MaxLength=255 |
| Tenant / Environment Label | field_28 | Text | No | No | No | No | MaxLength=255 |
| Official Logo Asset Reference | field_3 | Text | No | No | No | No | MaxLength=255 |
| Last Reviewed On | field_30 | DateTime | No | No | No | No |  |
| Notes | field_31 | Text | No | No | No | No | MaxLength=255 |
| Logo Asset Reference (Dark) | field_4 | Text | No | No | No | No | MaxLength=255 |
| Preferred Logo Type | field_5 | Text | No | No | No | No | MaxLength=255 |
| Short Descriptor | field_6 | Text | No | No | No | No | MaxLength=255 |
| Workflow Shelf | field_7 | Text | No | No | No | No | MaxLength=255 |
| Category | field_8 | Text | No | No | No | No | MaxLength=255 |
| Help Link | HelpLink | URL | No | No | No | No |  |
| Is Active | IsActive | Boolean | No | No | No | No | Default=1 |
| Open In New Tab | OpenInNewTab | Boolean | No | No | No | No | Default=1 |
| Requires Review | RequiresReview | Boolean | No | No | No | No | Default=0 |
| Support Owner Reference | SupportOwnerReference | URL | No | No | No | No |  |
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
| Platform Name | LinkTitle | Computed | No | No | Yes | No | System/OOB-like |
| Title | LinkTitleNoMenu | Computed | No | No | Yes | No | System/OOB-like |
| Modified | Modified | DateTime | No | No | Yes | No | System/OOB-like |
| Unique Id | UniqueId | Lookup | No | Yes | Yes | No | System/OOB-like |

## 4. Content Types / Forms / Behavioral Context
- Associated Content Types: `Item, Folder`
- Default New Form: `/sites/HBCentral/Lists/Tool Launcher Contents/NewForm.aspx`
- Default Edit Form: `/sites/HBCentral/Lists/Tool Launcher Contents/EditForm.aspx`
- Default Display Form: `/sites/HBCentral/Lists/Tool Launcher Contents/DispForm.aspx`
- Appears Custom Forms (URL heuristic): `true`
- Observed Role Hint: `homepage configuration data`

## 5. Relationship Observations
- Outbound lookup references: AppPrincipals, User Information List.

## 6. Implementation-Relevant Findings
- Non-hidden editable fields: `34`
- Hidden fields: `61`
- Non-hidden lookup fields: `4`
- Unique-enforced fields: `0`
- Indexed non-hidden fields: `0`
- System/OOB fields are included where integration-relevant; app contracts should prefer non-hidden business fields unless specific OOB audit/compliance metadata is required.

## 7. Open Questions / Follow-Up Checks
- Confirm custom form bindings in list settings if app UX depends on Power Apps forms.
- Confirm canonical join keys and index strategy for production query patterns.
- Re-extract after provisioning changes or when schema drift is suspected.
