# Legacy Project Fallback Sync Runs

## 1. Objective
- Tenant-backed schema/reference snapshot for `Legacy Project Fallback Sync Runs` at `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`.
- Operational run log recording every invocation of the `legacyFallbackDiscoveryTimer` / `legacyFallbackDiscoveryRun` Azure Functions handler.

## 2. List-Level Metadata
- List ID: `1b743807-4969-42e1-b4a8-674ed3cab47f`
- Display Name: `Legacy Project Fallback Sync Runs`
- URL: `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral/Lists/Legacy%20Project%20Fallback%20Sync%20Runs`
- Root Folder URL: `/sites/HBCentral/Lists/Legacy Project Fallback Sync Runs`
- Template: `genericList`
- Classification: `operational logging / audit`
- Description: `Operational run log for legacy fallback discovery/sync operations.`
- Hidden: `false`
- Content Types Enabled: `false`
- Created: `2026-04-18T22:51:45Z`
- Last Modified: `2026-04-19T14:28:16Z`

## 3. Field Schema

| Display Name | Internal Name | Type | Required | Hidden | Read Only | Indexed | Lookup / Choices / Formula / Notes |
|---|---|---|---|---|---|---|---|
| Title | Title | Text | Yes | No | No | No | MaxLength=255; formatted as `Legacy fallback sync <yearsCsv>` |
| Run Id | RunId | Text | Yes | No | No | Yes | MaxLength=255; UUID set by the handler |
| Started Utc | StartedUtc | DateTime | Yes | No | No | No |  |
| Completed Utc | CompletedUtc | DateTime | No | No | No | No | null while `Status=running` |
| Status | Status | Choice | No | No | No | Yes | Choices: running, completed, failed |
| Years Processed | YearsProcessed | Note | No | No | No | No | RichText=false; Lines=6; stores JSON array, e.g. `[2022]` or `[2019,2020,2021,2023,2025,2026]` |
| Folders Scanned | FoldersScanned | Number | No | No | No | No |  |
| Records Created | RecordsCreated | Number | No | No | No | No |  |
| Records Updated | RecordsUpdated | Number | No | No | No | No |  |
| Records Unmatched | RecordsUnmatched | Number | No | No | No | No |  |
| Error Count | ErrorCount | Number | No | No | No | No |  |
| Summary Json | SummaryJson | Note | No | No | No | No | RichText=false; Lines=6; full run summary incl. per-source stats, errors, sample records |
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

## 4. Content Types / Forms / Behavioral Context
- Associated Content Types: `Item`
- Default List Forms: `/sites/HBCentral/Lists/Legacy Project Fallback Sync Runs/AllItems.aspx`
- Observed Role Hint: write-only run log; the discovery handler adds one row per invocation and patches the same row when the run terminates.

## 5. Relationship Observations
- Outbound lookup references: AppPrincipals, User Information List.
- Logical foreign key: `RunId` is referenced by `Legacy Project Fallback Registry.DiscoveryRunId` (contractual, not enforced).
- There is no inbound lookup from this list to any other.

## 6. Implementation-Relevant Findings
- Writer: `backend/functions/src/services/legacy-fallback/discovery-repository.ts` — `startSyncRun()` appends a row with `Status=running`; `completeSyncRun()` patches the same row to `Status=completed`/`failed` and fills the numeric counters + `SummaryJson`.
- Graph-native column-filter in [graph-list-client.ts](../../../../../backend/functions/src/services/legacy-fallback/graph-list-client.ts) silently drops payload fields not present on the list, so drift between code and schema is tolerated until the missing column is needed by a consumer.
- Live schema omits fields the code also computes: `RecordsMatched`, `RecordsReviewRequired`, `RecordsMarkedInactive`, `DurationMs`, `SourceFailureCount`, `MatchAnomalyExceeded`, `FirstErrorMessage`. They're retained inside the handler and persisted into `SummaryJson` rather than as standalone columns. Provision these as explicit columns if direct SharePoint reporting is required.
- Non-hidden editable business fields: 11.
- Indexed fields: `RunId`, `Status` — use these as filter keys.

## 7. Open Questions / Follow-Up Checks
- Decide whether to add the seven code-side counters above as first-class columns or rely on `SummaryJson` parsing for monitoring dashboards.
- `YearsProcessed` is written as a JSON array string inside a Note field; consumer queries filtering on year are easier against the Registry list (which has `LegacyYear` as a typed column) than this list.
- Consider a retention/pruning policy: the handler writes a row per invocation and the timer is daily, so row growth is bounded but never trimmed by the lane itself.
