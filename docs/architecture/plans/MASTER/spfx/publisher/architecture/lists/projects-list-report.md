# Projects List Report

## 1. Objective
- Extracted tenant-backed schema and implementation-critical metadata for the SharePoint `Projects` list.
- Target site: `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`
- Target list URL: `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral/Lists/Projects/AllItems.aspx`
- Scripts/utilities used:
  - `tools/pnp-runner-local/scripts/invoke-pnp-extraction.ps1` (baseline list-schema extraction)
  - Supplemental read-only PnP extraction command flow (`Get-PnPList`, `Get-PnPField`, `Get-PnPContentType`) for metadata depth not emitted in baseline output

## 2. Extraction Method
- Baseline extraction output: `/tmp/projects-baseline-raw.json`, `/tmp/projects-baseline-normalized.json`, `/tmp/projects-baseline-summary.md`.
- Supplemental extraction output: `/tmp/projects-supplemental-raw.json`.
- Auth/runtime assumption: delegated device-code login with configured app registration (`9bc3ab49-b65d-410a-85ad-de819febfddc`, tenant `0e834bd7-628b-42c8-b9ec-ecebc9719be4`).
- Repo script modifications: none.
- Limitations: custom-form binding cannot be conclusively proven from URL pattern alone; taxonomy properties were checked but no taxonomy fields were observed in this extraction.

## 3. List Summary

| List Title | Resolved URL | Template/Base Type | Item Count | Content Types Enabled | Notes / Status |
|---|---|---:|---:|---|---|
| Projects | https://hedrickbrotherscom.sharepoint.com/sites/HBCentral/Lists/Projects/AllItems.aspx | 100/0 | 4 | false | Resolved and extracted successfully |

## 4. List-Level Metadata
- Resolved title: `Projects`
- List GUID: `1ac57cbb-9f0a-457f-9c97-081a29f45b12`
- Entity type name: `ProjectsList`
- Site URL: `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`
- Default view URL: `/sites/HBCentral/Lists/Projects/AllItems.aspx`
- Base template/base type: `100` / `0`
- Description: ``
- Content types enabled: `false`
- Versioning: `EnableVersioning=true`, `EnableMinorVersions=false`, `MajorVersionLimit=50`, `MajorWithMinorVersionsLimit=0`
- Moderation/approval: `EnableModeration=false`
- Attachments enabled: `true`
- Item count: `4`
- Hidden: `false`
- List validation formula/message: not defined in extracted metadata.

## 5. Field Schema

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

Supplemental field behavior notes:
- Non-hidden editable field count: `43`
- Hidden field count: `61`
- Non-hidden lookup/person fields: `4`
- Unique-enforced fields observed: `0`
- Indexed non-hidden fields observed: `0`
- Taxonomy fields observed: `none`

## 6. Content Types / Forms / Behavioral Context
- Associated content types: `Item, Folder`
- Default New form: `/sites/HBCentral/Lists/Projects/NewForm.aspx`
- Default Edit form: `/sites/HBCentral/Lists/Projects/EditForm.aspx`
- Default Display form: `/sites/HBCentral/Lists/Projects/DispForm.aspx`
- Appears custom forms (URL heuristic): `true`
- Behavioral context from schema surface: list is a standard custom list (template 100) with OOB Item/Folder content types present and no extra custom content types attached at extraction time.

## 7. Implementation-Relevant Findings
- The `Projects` list resolved cleanly and is readable; list identity/metadata captured.
- Schema includes both custom/business fields and a substantial OOB/system field set (hidden + read-only).
- No obvious custom key field identified by naming pattern in non-hidden editable fields; consumers may rely on `ID`, `GUID`, `Title`, or other domain-specific columns.
- Project-oriented field names observed: `field_1, field_2, field_3, field_4, field_5, field_6, procoreProject, projectCity, projectCounty, projectExecutiveUpn, projectManagerUpn, projectState, projectStreetAddress, projectZip`.
- No taxonomy columns and no custom unique/index enforcement were detected from extracted settings; verify scale/performance posture if this list is high-volume lookup source.
- Person/lookup fields include OOB author/editor and any explicit lookup fields listed in the schema table; these should be handled carefully in integrations and migrations.
- System/OOB fields likely safe to ignore for most app payload contracts unless required for auditing/compliance: `ContentTypeId`, `_ModerationStatus`, `Author`, `Editor`, `Created`, `Modified`, `GUID`, `UniqueId`, `FileRef`, `FileLeafRef`, `_Compliance*` fields.

## 8. Relationship / Integration Observations
- From schema alone, `Projects` appears positioned as a potential master project registry list (given list name and standard metadata profile), but authoritative downstream consumers cannot be proven from list schema in isolation.
- Fields likely used for project lookup/filter/join should be treated as candidates where naming indicates identifiers/keys/codes; confirm with runtime query traces in consuming apps.
- If publisher/spotlight integrations exist, linkage likely occurs through text-key/ID field conventions rather than enforced SharePoint lookup constraints unless explicitly present in non-hidden fields.
- Provisioning/setup/security usage is not directly encoded beyond form/content-type/list settings and any custom columns; deeper app-layer usage requires consumer query inspection.

## 9. Open Questions / Follow-Up Checks
- Which specific `Projects` columns are contractually authoritative for cross-app identity (e.g., external project ID vs list `ID` vs `Title`)?
- Are Power Apps custom forms bound despite default-form-like URLs? Confirm via list form settings/UI.
- Should any project key fields be indexed or unique-enforced for scale and integrity?
- Which downstream services/webparts query `Projects`, and which fields are required vs optional in those contracts?
