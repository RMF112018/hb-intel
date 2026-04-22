# HB Article Template Registry

## 1. Objective
- Tenant-backed schema/reference snapshot for `HB Article Template Registry` at `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`.

## 2. List-Level Metadata
- List ID: `1ff18492-ba73-4591-a16e-2d4576744f18`
- Entity Type Name: `HB_x0020_Article_x0020_Template_x0020_RegistryList`
- URL: `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral/Lists/HB Article Template Registry/AllItems.aspx`
- Default View URL: `/sites/HBCentral/Lists/HB Article Template Registry/AllItems.aspx`
- Root Folder URL: `/sites/HBCentral/Lists/HB Article Template Registry`
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
| ArticleSubjects | ArticleSubjects | MultiChoice | No | No | No | No | Choices: TBD |
| Attachments | Attachments | Attachments | No | No | No | No |  |
| BodyProfileKey | BodyProfileKey | Text | Yes | No | No | No | MaxLength=255 |
| Content Type | ContentType | Computed | No | No | No | No |  |
| ContentTypes | ContentTypes | MultiChoice | Yes | No | No | No | Choices: TBD |
| Destination | Destination | Choice | Yes | No | No | No | Choices: companyPulse, projectSpotlight |
| GalleryProfileKey | GalleryProfileKey | Text | No | No | No | No | MaxLength=255 |
| HeroProfileKey | HeroProfileKey | Text | Yes | No | No | No | MaxLength=255 |
| IsActive | IsActive | Boolean | Yes | No | No | No | Default=1 |
| Notes | Notes | Note | No | No | No | No | RichText=false; Lines=6 |
| PageShellTemplateKey | PageShellTemplateKey | Text | Yes | No | No | No | MaxLength=255 |
| ProjectStages | ProjectStages | MultiChoice | No | No | No | No | Choices: TBD |
| RequiredFieldSetKey | RequiredFieldSetKey | Text | Yes | No | No | No | MaxLength=255 |
| ShowBody | ShowBody | Boolean | Yes | No | No | No | Default=1 |
| ShowGallery | ShowGallery | Boolean | Yes | No | No | No | Default=1 |
| ShowHero | ShowHero | Boolean | Yes | No | No | No | Default=1 |
| ShowSecondaryImage | ShowSecondaryImage | Boolean | Yes | No | No | No | Default=1 |
| ShowTeamViewer | ShowTeamViewer | Boolean | Yes | No | No | No | Default=1 |
| SpotlightTypes | SpotlightTypes | MultiChoice | No | No | No | No | Choices: TBD |
| TeamViewerProfileKey | TeamViewerProfileKey | Text | No | No | No | No | MaxLength=255 |
| TemplateKey | TemplateKey | Text | Yes | No | No | No | MaxLength=255 |
| TemplateName | TemplateName | Text | Yes | No | No | No | MaxLength=255 |
| TemplatePriority | TemplatePriority | Number | Yes | No | No | No |  |
| Title | Title | Text | Yes | No | No | No | MaxLength=255 |
| VersionLabel | VersionLabel | Text | No | No | No | No | MaxLength=255 |
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
- Default New Form: `/sites/HBCentral/Lists/HB Article Template Registry/NewForm.aspx`
- Default Edit Form: `/sites/HBCentral/Lists/HB Article Template Registry/EditForm.aspx`
- Default Display Form: `/sites/HBCentral/Lists/HB Article Template Registry/DispForm.aspx`
- Appears Custom Forms (URL heuristic): `true`
- Observed Role Hint: `template/config registry`

## 5. Relationship Observations
- Contains key field `TemplateKey` (likely join/filter dimension).
- Contains key field `Destination` (likely join/filter dimension).
- Outbound lookup references: AppPrincipals, User Information List.

## 6. Implementation-Relevant Findings
- Non-hidden editable fields: `25`
- Hidden fields: `61`
- Non-hidden lookup fields: `4`
- Unique-enforced fields: `0`
- Indexed non-hidden fields: `0`
- System/OOB fields are included where integration-relevant; app contracts should prefer non-hidden business fields unless specific OOB audit/compliance metadata is required.

## 7. Open Questions / Follow-Up Checks
- Confirm custom form bindings in list settings if app UX depends on Power Apps forms.
- Confirm canonical join keys and index strategy for production query patterns.
- Re-extract after provisioning changes or when schema drift is suspected.
