# Hero Banner Config

## 1. Objective
- Tenant-backed schema/reference snapshot for `Hero Banner Config` at `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`.

## 2. List-Level Metadata
- List ID: `b8993a20-403d-42b6-b137-f496171ac771`
- Entity Type Name: `Hero_x0020_Banner_x0020_ConfigList`
- URL: `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral/Lists/Hero Banner Config/AllItems.aspx`
- Default View URL: `/sites/HBCentral/Lists/Hero Banner Config/AllItems.aspx`
- Root Folder URL: `/sites/HBCentral/Lists/Hero Banner Config`
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
| Attachments | Attachments | Attachments | No | No | No | No |  |
| BackgroundImageUrl | BackgroundImageUrl | URL | No | No | No | No |  |
| Content Type | ContentType | Computed | No | No | No | No |  |
| Enabled | Enabled | Boolean | Yes | No | No | No | Default=1 |
| Eyebrow | Eyebrow | Text | No | No | No | No | MaxLength=255 |
| Headline | Headline | Text | No | No | No | No | MaxLength=255 |
| LastPublishedBy | LastPublishedBy | User | No | No | No | No | Lookup->User Information List.Id; SelectionMode=1; SelectionGroup=0 |
| LastPublishedOn | LastPublishedOn | DateTime | No | No | No | No |  |
| Message | Message | Note | No | No | No | No | RichText=false; Lines=6 |
| Metadata | MetadataLine | Text | No | No | No | No | MaxLength=255 |
| PrimaryCtaLabel | PrimaryCtaLabel | Text | No | No | No | No | MaxLength=255 |
| PrimaryCtaOpenInNewTab | PrimaryCtaOpenInNewTab | Boolean | No | No | No | No | Default=0 |
| PrimaryCtaUrl | PrimaryCtaUrl | URL | No | No | No | No |  |
| SecondaryCtaLabel | SecondaryCtaLabel | Text | No | No | No | No | MaxLength=255 |
| SecondaryCtaOpenInNewTab | SecondaryCtaOpenInNewTab | Boolean | No | No | No | No | Default=0 |
| SecondaryCtaUrl | SecondaryCtaUrl | URL | No | No | No | No |  |
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
- Default New Form: `/sites/HBCentral/Lists/Hero Banner Config/NewForm.aspx`
- Default Edit Form: `/sites/HBCentral/Lists/Hero Banner Config/EditForm.aspx`
- Default Display Form: `/sites/HBCentral/Lists/Hero Banner Config/DispForm.aspx`
- Appears Custom Forms (URL heuristic): `true`
- Observed Role Hint: `homepage configuration data`

## 5. Relationship Observations
- Outbound lookup references: AppPrincipals, User Information List.

## 6. Implementation-Relevant Findings
- Non-hidden editable fields: `17`
- Hidden fields: `61`
- Non-hidden lookup fields: `5`
- Unique-enforced fields: `0`
- Indexed non-hidden fields: `0`
- System/OOB fields are included where integration-relevant; app contracts should prefer non-hidden business fields unless specific OOB audit/compliance metadata is required.

## 7. Open Questions / Follow-Up Checks
- Confirm custom form bindings in list settings if app UX depends on Power Apps forms.
- Confirm canonical join keys and index strategy for production query patterns.
- Re-extract after provisioning changes or when schema drift is suspected.
