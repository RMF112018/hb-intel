# Bids

## 1. Objective
- Tenant-backed schema/reference snapshot for `Bids` at `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`.

## 2. List-Level Metadata
- List ID: `84492873-8ece-4e2f-822b-c11f3435f35d`
- Entity Type Name: `BidsList`
- URL: `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral/Lists/Bids/AllItems.aspx`
- Default View URL: `/sites/HBCentral/Lists/Bids/AllItems.aspx`
- Root Folder URL: `/sites/HBCentral/Lists/Bids`
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
| Attachments | Attachments | Attachments | No | No | No | No |  |
| Content Type | ContentType | Computed | No | No | No | No |  |
| ProjectId | field_1 | Text | No | No | No | No | MaxLength=255 |
| BidAmount | field_11 | Number | No | No | No | No |  |
| ReviewedAmount | field_12 | Number | No | No | No | No |  |
| RecommendedAmount | field_13 | Number | No | No | No | No |  |
| AwardAmount | field_14 | Number | No | No | No | No |  |
| BidDueDate | field_15 | Number | No | No | No | No |  |
| ProjectNumber | field_2 | Text | No | No | No | No | MaxLength=255 |
| BidLifecycleStatus | field_20 | Text | No | No | No | No | MaxLength=255 |
| AwardDecision | field_21 | Text | No | No | No | No | MaxLength=255 |
| ContractExecutionStatus | field_22 | Text | No | No | No | No | MaxLength=255 |
| ExecutedDate | field_23 | Number | No | No | No | No |  |
| IsExecuted | field_24 | Number | No | No | No | No |  |
| ComplianceStatus | field_25 | Text | No | No | No | No | MaxLength=255 |
| EVerifySentDate | field_26 | Number | No | No | No | No |  |
| EVerifyReminder1Date | field_27 | Number | No | No | No | No |  |
| EVerifyReminder2Date | field_28 | Number | No | No | No | No |  |
| EVerifyReceivedDate | field_29 | Number | No | No | No | No |  |
| ProjectName | field_3 | Text | No | No | No | No | MaxLength=255 |
| EVerifyDocumentStatus | field_30 | Text | No | No | No | No | MaxLength=255 |
| ScopeReviewNotes | field_31 | Note | No | No | No | No | RichText=false; Lines=6 |
| AwardNotes | field_32 | Note | No | No | No | No | RichText=false; Lines=6 |
| ComplianceNotes | field_33 | Note | No | No | No | No | RichText=false; Lines=6 |
| Buyer | field_34 | Text | No | No | No | No | MaxLength=255 |
| ProjectExecutive | field_35 | Text | No | No | No | No | MaxLength=255 |
| CreatedFromWorkbook | field_36 | Number | No | No | No | No |  |
| SourceWorkbookName | field_37 | Text | No | No | No | No | MaxLength=255 |
| SourceRowKey | field_38 | Text | No | No | No | No | MaxLength=255 |
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
- Default New Form: `/sites/HBCentral/Lists/Bids/NewForm.aspx`
- Default Edit Form: `/sites/HBCentral/Lists/Bids/EditForm.aspx`
- Default Display Form: `/sites/HBCentral/Lists/Bids/DispForm.aspx`
- Appears Custom Forms (URL heuristic): `true`
- Observed Role Hint: `list role inferred from schema and naming`

## 5. Relationship Observations
- Outbound lookup references: AppPrincipals, User Information List.

## 6. Implementation-Relevant Findings
- Non-hidden editable fields: `30`
- Hidden fields: `61`
- Non-hidden lookup fields: `4`
- Unique-enforced fields: `0`
- Indexed non-hidden fields: `0`
- System/OOB fields are included where integration-relevant; app contracts should prefer non-hidden business fields unless specific OOB audit/compliance metadata is required.

## 7. Open Questions / Follow-Up Checks
- Confirm custom form bindings in list settings if app UX depends on Power Apps forms.
- Confirm canonical join keys and index strategy for production query patterns.
- Re-extract after provisioning changes or when schema drift is suspected.
