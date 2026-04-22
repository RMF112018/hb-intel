# Projects

## 1. Objective
- Tenant-backed schema/reference snapshot for `Projects` at `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`.

## 2. List-Level Metadata
- List ID: `1ac57cbb-9f0a-457f-9c97-081a29f45b12`
- Entity Type Name: `ProjectsList`
- URL: `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral/Lists/Projects/AllItems.aspx`
- Default View URL: `/sites/HBCentral/Lists/Projects/AllItems.aspx`
- Root Folder URL: `/sites/HBCentral/Lists/Projects`
- Base Template / Base Type: `100` / `0`
- Classification: `business/custom`
- Description: ``
- Hidden: `false`
- Item Count: `4`
- Content Types Enabled: `false`
- Versioning: `EnableVersioning=true`, `EnableMinorVersions=false`, `MajorVersionLimit=50`
- Moderation: `EnableModeration=false`
- Attachments Enabled: `true`

## 3. Field Schema

| Display Name | Internal Name | Type | Required | Hidden | Read Only | Indexed | Lookup / Choices / Formula / Notes |
|---|---|---|---|---|---|---|---|
| addOns | addOns | Note | No | No | No | No | RichText=false; Lines=6 |
| Attachments | Attachments | Attachments | No | No | No | No |  |
| clarificationItems | clarificationItems | Note | No | No | No | No | RichText=false; Lines=6 |
| clarificationRequestedAt | clarificationRequestedAt | DateTime | No | No | No | No |  |
| Content Type | ContentType | Computed | No | No | No | No |  |
| ProjectId | field_1 | Text | No | No | No | No | MaxLength=255 |
| GroupMembersJson | field_10 | Note | No | No | No | No | RichText=false; Lines=6 |
| GroupLeadersJson | field_11 | Note | No | No | No | No | RichText=false; Lines=6 |
| Department | field_12 | Text | No | No | No | No | MaxLength=255 |
| EstimatedValue | field_13 | Number | No | No | No | No |  |
| ClientName | field_14 | Text | No | No | No | No | MaxLength=255 |
| StartDate | field_15 | Number | No | No | No | No |  |
| ContractType | field_16 | Text | No | No | No | No | MaxLength=255 |
| ProjectNumber | field_2 | Text | No | No | No | No | MaxLength=255 |
| ClarificationNote | field_20 | Number | No | No | No | No |  |
| CompletedBy | field_21 | Number | No | No | No | No |  |
| CompletedAt | field_22 | Number | No | No | No | No |  |
| SiteUrl | field_23 | Text | No | No | No | No | MaxLength=255 |
| RetryCount | field_24 | Number | No | No | No | No |  |
| ProjectName | field_3 | Text | No | No | No | No | MaxLength=255 |
| ProjectLocation | field_4 | Text | No | No | No | No | MaxLength=255 |
| ProjectType | field_5 | Text | No | No | No | No | MaxLength=255 |
| ProjectStage | field_6 | Text | No | No | No | No | MaxLength=255 |
| SubmittedBy | field_7 | Text | No | No | No | No | MaxLength=255 |
| SubmittedAt | field_8 | Number | No | No | No | No |  |
| RequestState | field_9 | Text | No | No | No | No | MaxLength=255 |
| leadEstimatorUpn | leadEstimatorUpn | Text | No | No | No | No | MaxLength=255 |
| officeDivision | officeDivision | Text | No | No | No | No | MaxLength=255 |
| procoreProject | procoreProject | Text | No | No | No | No | MaxLength=255 |
| projectCity | projectCity | Text | No | No | No | No | MaxLength=255 |
| projectCounty | projectCounty | Text | No | No | No | No | MaxLength=255 |
| projectExecutiveUpn | projectExecutiveUpn | Text | No | No | No | No | MaxLength=255 |
| projectManagerUpn | projectManagerUpn | Text | No | No | No | No | MaxLength=255 |
| projectState | projectState | Text | No | No | No | No | MaxLength=255 |
| projectStreetAddress | projectStreetAddress | Text | No | No | No | No | MaxLength=255 |
| projectZip | projectZip | Number | No | No | No | No |  |
| requesterRetryUsed | requesterRetryUsed | Text | No | No | No | No | MaxLength=255 |
| sageAccessUpns | sageAccessUpns | Note | No | No | No | No | RichText=false; Lines=6 |
| supportingEstimatorUpns | supportingEstimatorUpns | Note | No | No | No | No | RichText=false; Lines=6 |
| timberscanApproverUpn | timberscanApproverUpn | Text | No | No | No | No | MaxLength=255 |
| Title | Title | Text | No | No | No | No | MaxLength=255 |
| viewerUPNs | viewerUPNs | Note | No | No | No | No | RichText=false; Lines=6 |
| Year | Year | Number | No | No | No | No |  |
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
- Default New Form: `/sites/HBCentral/Lists/Projects/NewForm.aspx`
- Default Edit Form: `/sites/HBCentral/Lists/Projects/EditForm.aspx`
- Default Display Form: `/sites/HBCentral/Lists/Projects/DispForm.aspx`
- Appears Custom Forms (URL heuristic): `true`
- Observed Role Hint: `project master registry (likely)`

## 5. Relationship Observations
- Outbound lookup references: AppPrincipals, User Information List.

## 6. Implementation-Relevant Findings
- Non-hidden editable fields: `43`
- Hidden fields: `61`
- Non-hidden lookup fields: `4`
- Unique-enforced fields: `0`
- Indexed non-hidden fields: `0`
- System/OOB fields are included where integration-relevant; app contracts should prefer non-hidden business fields unless specific OOB audit/compliance metadata is required.

## 7. Open Questions / Follow-Up Checks
- Confirm custom form bindings in list settings if app UX depends on Power Apps forms.
- Confirm canonical join keys and index strategy for production query patterns.
- Re-extract after provisioning changes or when schema drift is suspected.
