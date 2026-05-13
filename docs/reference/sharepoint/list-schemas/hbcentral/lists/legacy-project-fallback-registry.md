# Legacy Project Fallback Registry

## 1. Objective
- Tenant-backed schema/reference snapshot for `Legacy Project Fallback Registry` at `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`.
- Canonical secondary registry that records legacy project folder discoveries produced by the `legacyFallbackDiscovery*` Azure Functions lane.

## 2. List-Level Metadata
- List ID: `2c24aa84-38f4-4793-9576-2ee23bedd74a`
- Display Name: `Legacy Project Fallback Registry`
- URL: `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral/Lists/Legacy%20Project%20Fallback%20Registry`
- Root Folder URL: `/sites/HBCentral/Lists/Legacy Project Fallback Registry`
- Template: `genericList`
- Classification: `business/custom`
- Description: `Canonical secondary registry for legacy project folder fallbacks.`
- Hidden: `false`
- Content Types Enabled: `false`
- Created: `2026-04-18T22:50:40Z`
- Last Modified: `2026-04-19T14:31:28Z`

## 3. Field Schema

| Display Name | Internal Name | Type | Required | Hidden | Read Only | Indexed | Lookup / Choices / Formula / Notes |
|---|---|---|---|---|---|---|---|
| Title | Title | Text | Yes | No | No | No | MaxLength=255 |
| Project Number | ProjectNumber | Text | No | No | No | Yes | MaxLength=255 |
| Project Name Raw | ProjectNameRaw | Text | No | No | No | No | MaxLength=255 |
| Project Name Normalized | ProjectNameNormalized | Text | No | No | No | No | MaxLength=255 |
| Legacy Year | LegacyYear | Number | No | No | No | No | DecimalPlaces=none |
| Source Site Name | SourceSiteName | Text | No | No | No | No | MaxLength=255 |
| Source Site Path | SourceSitePath | Text | No | No | No | No | MaxLength=255 |
| Source Library Name | SourceLibraryName | Text | No | No | No | No | MaxLength=255 |
| Drive Id | DriveId | Text | Yes | No | No | Yes | MaxLength=255 |
| Drive Item Id | DriveItemId | Text | Yes | No | No | Yes | MaxLength=255 |
| Folder Name | FolderName | Text | No | No | No | No | MaxLength=255 |
| Folder Path | FolderPath | Text | No | No | No | No | MaxLength=255 |
| Folder Web Url | FolderWebUrl | Text | No | No | No | No | MaxLength=255; stores URL string (column was recreated 2026-04-19 after a broken untyped column; see §7) |
| Match Status | MatchStatus | Choice | No | No | No | Yes | Choices: matched, unmatched, review-required, ignored, disabled |
| Match Confidence | MatchConfidence | Choice | No | No | No | No | Choices: high, medium, low, none |
| Matched Project List Item Id | MatchedProjectListItemId | Number | No | No | No | No |  |
| Matched Project Title | MatchedProjectTitle | Text | No | No | No | No | MaxLength=255 |
| Match Method | MatchMethod | Choice | No | No | No | No | Choices: project-number-exact, normalized-title-year, manual-bind, manual-override, no-match |
| Last Seen Utc | LastSeenUtc | DateTime | No | No | No | No |  |
| Last Validated Utc | LastValidatedUtc | DateTime | No | No | No | No |  |
| Discovery Run Id | DiscoveryRunId | Text | No | No | No | No | MaxLength=255; joins to `Legacy Project Fallback Sync Runs.RunId` |
| Notes | Notes | Note | No | No | No | No | RichText=false; Lines=6 |
| Is Active | IsActive | Boolean | No | No | No | Yes |  |
| Attachments | Attachments | Attachments | No | No | No | No |  |
| Color Tag | _ColorTag | Text | No | No | Yes | No | MaxLength=255; System/OOB-like |
| Label setting | _ComplianceFlags | Lookup | No | No | Yes | No | System/OOB-like |
| Retention label | _ComplianceTag | Lookup | No | No | Yes | No | System/OOB-like |
| Label applied by | _ComplianceTagUserId | Lookup | No | No | Yes | No | System/OOB-like |
| Retention label Applied | _ComplianceTagWrittenTime | Lookup | No | No | Yes | No | System/OOB-like |
| Item is a Record | _IsRecord | Boolean | No | No | Yes | No | System/OOB-like |
| Version | _UIVersionString | Text | No | No | Yes | No | MaxLength=255; System/OOB-like |
| App Created By | AppAuthor | Lookup | No | No | Yes | No | Lookup->AppPrincipals.Title; System/OOB-like |
| App Modified By | AppEditor | Lookup | No | No | Yes | No | Lookup->AppPrincipals.Title; System/OOB-like |
| Created By | Author | User | No | No | Yes | No | System/OOB-like |
| Compliance Asset Id | ComplianceAssetId | Text | No | No | Yes | No | MaxLength=255; System/OOB-like |
| Content Type | ContentType | Computed | No | No | No | No |  |
| Created | Created | DateTime | No | No | Yes | No | System/OOB-like |
| Type | DocIcon | Computed | No | No | Yes | No | System/OOB-like |
| Edit | Edit | Computed | No | No | Yes | No | System/OOB-like |
| Modified By | Editor | User | No | No | Yes | No | System/OOB-like |
| Folder Child Count | FolderChildCount | Lookup | No | No | Yes | No | System/OOB-like |
| ID | ID | Counter | No | No | Yes | No | System/OOB-like |
| Item Child Count | ItemChildCount | Lookup | No | No | Yes | No | System/OOB-like |
| Title | LinkTitle | Computed | No | No | Yes | No | System/OOB-like |
| Title | LinkTitleNoMenu | Computed | No | No | Yes | No | System/OOB-like |
| Modified | Modified | DateTime | No | No | Yes | No | System/OOB-like |

## 4. Prompt 02 Target Additions (Provisioning-Required)

The following fields are repo-side target contract additions for My Projects and are not yet represented as live-verified columns in the snapshot table above.

| Internal Name | Target Type | Required | Indexed | Storage/Semantics |
|---|---|---|---|---|
| leadEstimatorUpns | Note (MultiLineText) | No | No | JSON-serialized `string[]` |
| estimatorUpns | Note (MultiLineText) | No | No | JSON-serialized `string[]` |
| idsManagerUpns | Note (MultiLineText) | No | No | JSON-serialized `string[]` |
| projectAccountantUpns | Note (MultiLineText) | No | No | JSON-serialized `string[]` |
| projectAdministratorUpns | Note (MultiLineText) | No | No | JSON-serialized `string[]` |
| projectCoordinatorUpns | Note (MultiLineText) | No | No | JSON-serialized `string[]` |
| superintendentUpns | Note (MultiLineText) | No | No | JSON-serialized `string[]` |
| leadSuperintendentUpns | Note (MultiLineText) | No | No | JSON-serialized `string[]` |
| projectManagerUpns | Note (MultiLineText) | No | No | JSON-serialized `string[]` |
| leadProjectManagerUpns | Note (MultiLineText) | No | No | JSON-serialized `string[]` |
| projectExecutiveUpns | Note (MultiLineText) | No | No | JSON-serialized `string[]` |
| safetyCoordinatorUpns | Note (MultiLineText) | No | No | JSON-serialized `string[]` |
| qcManagerUpns | Note (MultiLineText) | No | No | JSON-serialized `string[]` |
| warrantyManagerUpns | Note (MultiLineText) | No | No | JSON-serialized `string[]` |
| procoreProject | Text | No | No | Raw Procore project identifier/token |

## 5. Schema Gap Table (Prompt 02)

| Concern | Live Snapshot | Target Contract | Tenant Mutation Owner |
|---|---|---|---|
| Canonical role arrays + `procoreProject` | Not present in live snapshot table | Add 14 role-array Note fields + `procoreProject` Text | Later operator-gated provisioning/migration path (Prompt 06/07) |
| `FolderWebUrl` type drift | Live snapshot is `Text` | Descriptor remains `URL` in Prompt 02 | Operator-pending provisioning-readiness issue (documented; no destructive recreation in Prompt 02) |

## 6. Content Types / Forms / Behavioral Context
- Associated Content Types: `Item`
- Default List Forms: `/sites/HBCentral/Lists/Legacy Project Fallback Registry/AllItems.aspx`
- Observed Role Hint: canonical registry populated by timer-triggered `legacyFallbackDiscoveryRun` handler in the `@hbc/functions` Azure Functions app.

## 7. Relationship Observations
- Outbound lookup references: AppPrincipals, User Information List.
- Logical foreign keys:
  - `DiscoveryRunId` → `Legacy Project Fallback Sync Runs.RunId` (per-run provenance; not an enforced SharePoint lookup).
  - `MatchedProjectListItemId` → `Projects.ID` on HBCentral when `MatchStatus == matched` (contractual join, not enforced).
- Composite natural key: `(DriveId, DriveItemId)` — the handler upserts on this pair; both fields indexed.

## 8. Implementation-Relevant Findings
- Writer: `backend/functions/src/services/legacy-fallback/discovery-repository.ts` — `upsertRegistryRecord()` now uses a Graph-native list client ([graph-list-client.ts](../../../../../backend/functions/src/services/legacy-fallback/graph-list-client.ts)) that filters payload to declared non-readonly columns before POST/PATCH.
- Indexed fields: `ProjectNumber`, `DriveId`, `DriveItemId`, `MatchStatus`, `IsActive` — use these as filter keys to avoid non-indexed query warnings.
- Non-hidden editable business fields: 24.
- Stale-reconciliation contract: the discovery handler calls `listActiveRegistryRecordsByYear(year)` then `markRegistryRecordsInactive(...)` at end of each run to flip `IsActive=false` for folders not re-seen; identity is preserved by the `(DriveId, DriveItemId)` pair.
- Graph field-payload shape: numbers and booleans are native JSON values; choice fields accept the literal choice string; `LegacyYear` is a plain numeric, not a SharePoint Year column.

## 9. Open Questions / Follow-Up Checks
- The original `FolderWebUrl` column was created without a usable type definition (Graph POST returned `500 generalException` for any payload shape). It was deleted and recreated 2026-04-19 as a text column of `MaxLength=255`. If folder paths can exceed 255 chars, widen the column or truncate in the writer.
- Prompt 02 intentionally keeps descriptor/runtime handling unchanged (`FolderWebUrl` remains `URL` in descriptor, while live snapshot remains `Text`) and carries this as an explicit operator-gated type drift for provisioning readiness; no destructive column recreation is in scope.
- `MatchConfidence` is a choice column but the writer currently stores values from a domain enum (`none`, `low`, `medium`, `high`). Confirm both sets stay in sync whenever the matching engine's confidence vocabulary evolves.
- Consider adding an index on `LegacyYear` if registry review queries filter by year (Graph `$filter=fields/LegacyYear eq N` currently requires `Prefer: HonorNonIndexedQueriesWarningMayFailRandomly`).
- Re-extract after schema changes via `scripts/provision-legacy-fallback-lists.ts` or manual column edits.
