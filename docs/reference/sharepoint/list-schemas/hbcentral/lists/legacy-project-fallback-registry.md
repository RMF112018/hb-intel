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

| Display Name                 | Internal Name              | Type        | Required | Hidden | Read Only | Indexed | Lookup / Choices / Formula / Notes                                                                       |
| ---------------------------- | -------------------------- | ----------- | -------- | ------ | --------- | ------- | -------------------------------------------------------------------------------------------------------- |
| Title                        | Title                      | Text        | Yes      | No     | No        | No      | MaxLength=255                                                                                            |
| Project Number               | ProjectNumber              | Text        | No       | No     | No        | Yes     | MaxLength=255                                                                                            |
| Project Name Raw             | ProjectNameRaw             | Text        | No       | No     | No        | No      | MaxLength=255                                                                                            |
| Project Name Normalized      | ProjectNameNormalized      | Text        | No       | No     | No        | No      | MaxLength=255                                                                                            |
| Legacy Year                  | LegacyYear                 | Number      | No       | No     | No        | No      | DecimalPlaces=none                                                                                       |
| Source Site Name             | SourceSiteName             | Text        | No       | No     | No        | No      | MaxLength=255                                                                                            |
| Source Site Path             | SourceSitePath             | Text        | No       | No     | No        | No      | MaxLength=255                                                                                            |
| Source Library Name          | SourceLibraryName          | Text        | No       | No     | No        | No      | MaxLength=255                                                                                            |
| Drive Id                     | DriveId                    | Text        | Yes      | No     | No        | Yes     | MaxLength=255                                                                                            |
| Drive Item Id                | DriveItemId                | Text        | Yes      | No     | No        | Yes     | MaxLength=255                                                                                            |
| Folder Name                  | FolderName                 | Text        | No       | No     | No        | No      | MaxLength=255                                                                                            |
| Folder Path                  | FolderPath                 | Text        | No       | No     | No        | No      | MaxLength=255                                                                                            |
| Folder Web Url               | FolderWebUrl               | Text        | No       | No     | No        | No      | MaxLength=255; stores URL string (column was recreated 2026-04-19 after a broken untyped column; see §7) |
| Match Status                 | MatchStatus                | Choice      | No       | No     | No        | Yes     | Choices: matched, unmatched, review-required, ignored, disabled                                          |
| Match Confidence             | MatchConfidence            | Choice      | No       | No     | No        | No      | Choices: high, medium, low, none                                                                         |
| Matched Project List Item Id | MatchedProjectListItemId   | Number      | No       | No     | No        | No      |                                                                                                          |
| Matched Project Title        | MatchedProjectTitle        | Text        | No       | No     | No        | No      | MaxLength=255                                                                                            |
| Match Method                 | MatchMethod                | Choice      | No       | No     | No        | No      | Choices: project-number-exact, normalized-title-year, manual-bind, manual-override, no-match             |
| Last Seen Utc                | LastSeenUtc                | DateTime    | No       | No     | No        | No      |                                                                                                          |
| Last Validated Utc           | LastValidatedUtc           | DateTime    | No       | No     | No        | No      |                                                                                                          |
| Discovery Run Id             | DiscoveryRunId             | Text        | No       | No     | No        | No      | MaxLength=255; joins to `Legacy Project Fallback Sync Runs.RunId`                                        |
| Notes                        | Notes                      | Note        | No       | No     | No        | No      | RichText=false; Lines=6                                                                                  |
| Is Active                    | IsActive                   | Boolean     | No       | No     | No        | Yes     |                                                                                                          |
| Attachments                  | Attachments                | Attachments | No       | No     | No        | No      |                                                                                                          |
| Color Tag                    | \_ColorTag                 | Text        | No       | No     | Yes       | No      | MaxLength=255; System/OOB-like                                                                           |
| Label setting                | \_ComplianceFlags          | Lookup      | No       | No     | Yes       | No      | System/OOB-like                                                                                          |
| Retention label              | \_ComplianceTag            | Lookup      | No       | No     | Yes       | No      | System/OOB-like                                                                                          |
| Label applied by             | \_ComplianceTagUserId      | Lookup      | No       | No     | Yes       | No      | System/OOB-like                                                                                          |
| Retention label Applied      | \_ComplianceTagWrittenTime | Lookup      | No       | No     | Yes       | No      | System/OOB-like                                                                                          |
| Item is a Record             | \_IsRecord                 | Boolean     | No       | No     | Yes       | No      | System/OOB-like                                                                                          |
| Version                      | \_UIVersionString          | Text        | No       | No     | Yes       | No      | MaxLength=255; System/OOB-like                                                                           |
| App Created By               | AppAuthor                  | Lookup      | No       | No     | Yes       | No      | Lookup->AppPrincipals.Title; System/OOB-like                                                             |
| App Modified By              | AppEditor                  | Lookup      | No       | No     | Yes       | No      | Lookup->AppPrincipals.Title; System/OOB-like                                                             |
| Created By                   | Author                     | User        | No       | No     | Yes       | No      | System/OOB-like                                                                                          |
| Compliance Asset Id          | ComplianceAssetId          | Text        | No       | No     | Yes       | No      | MaxLength=255; System/OOB-like                                                                           |
| Content Type                 | ContentType                | Computed    | No       | No     | No        | No      |                                                                                                          |
| Created                      | Created                    | DateTime    | No       | No     | Yes       | No      | System/OOB-like                                                                                          |
| Type                         | DocIcon                    | Computed    | No       | No     | Yes       | No      | System/OOB-like                                                                                          |
| Edit                         | Edit                       | Computed    | No       | No     | Yes       | No      | System/OOB-like                                                                                          |
| Modified By                  | Editor                     | User        | No       | No     | Yes       | No      | System/OOB-like                                                                                          |
| Folder Child Count           | FolderChildCount           | Lookup      | No       | No     | Yes       | No      | System/OOB-like                                                                                          |
| ID                           | ID                         | Counter     | No       | No     | Yes       | No      | System/OOB-like                                                                                          |
| Item Child Count             | ItemChildCount             | Lookup      | No       | No     | Yes       | No      | System/OOB-like                                                                                          |
| Title                        | LinkTitle                  | Computed    | No       | No     | Yes       | No      | System/OOB-like                                                                                          |
| Title                        | LinkTitleNoMenu            | Computed    | No       | No     | Yes       | No      | System/OOB-like                                                                                          |
| Modified                     | Modified                   | DateTime    | No       | No     | Yes       | No      | System/OOB-like                                                                                          |

## 4. My Projects Source-List Fields — Operator-Gated Target Additions (Verification-Required)

The following fields are repo-side target contract additions for My Projects. They are **live-verified iff `scripts/verify-my-project-role-fields.ts` reports `ready: true`** for the `Legacy Project Fallback Registry` list — until then they are target-only and tenant mutation is operator-gated in later prompts/scripts. The Registry-side `projectStage` Text column is **independent of** the Projects `field_6` reuse — Projects-side rows resolve stage via `field_6`, Registry-side rows resolve stage via this `projectStage` column. The provider's stage-precedence rule is Projects-preferred (B05.10 locked decision).

> **No provider-side fallback.** Unlike the `Projects` list (which has a 4-field legacy fallback), the my-project-links provider has **no fallback** for the Registry's canonical role arrays. A `missing` or `wrong-type` state here directly causes silent zero-match for any user whose only assignments live in legacy-only rows — there is no degraded path. Treat a non-`ready` Registry result as a hard blocker for those users.

> **Schema Readiness Verification** — run `pnpm tsx scripts/verify-my-project-role-fields.ts` (read-only, no `--apply`) to prove whether the 18 canonical columns exist with the expected types (14 role-array `Note`, plus `procoreProject`, `buildingConnectedUrl`, `documentCrunchUrl`, and `projectStage` all `Text`). See `docs/reference/spfx-surfaces/my-dashboard/my-projects-schema-readiness.md` for the interpretation and remediation flow.

| Internal Name            | Display Name                    | Target Type          | Required | Indexed | Storage/Semantics                                   |
| ------------------------ | ------------------------------- | -------------------- | -------- | ------- | --------------------------------------------------- |
| leadEstimatorUpns        | Lead Estimator Upns             | Note (MultiLineText) | No       | No      | JSON-serialized `string[]`                          |
| estimatorUpns            | Estimator Upns                  | Note (MultiLineText) | No       | No      | JSON-serialized `string[]`                          |
| idsManagerUpns           | Ids Manager Upns                | Note (MultiLineText) | No       | No      | JSON-serialized `string[]`                          |
| projectAccountantUpns    | Project Accountant Upns         | Note (MultiLineText) | No       | No      | JSON-serialized `string[]`                          |
| projectAdministratorUpns | Project Administrator Upns      | Note (MultiLineText) | No       | No      | JSON-serialized `string[]`                          |
| projectCoordinatorUpns   | Project Coordinator Upns        | Note (MultiLineText) | No       | No      | JSON-serialized `string[]`                          |
| superintendentUpns       | Superintendent Upns             | Note (MultiLineText) | No       | No      | JSON-serialized `string[]`                          |
| leadSuperintendentUpns   | Lead Superintendent Upns        | Note (MultiLineText) | No       | No      | JSON-serialized `string[]`                          |
| projectManagerUpns       | Project Manager Upns            | Note (MultiLineText) | No       | No      | JSON-serialized `string[]`                          |
| leadProjectManagerUpns   | Lead Project Manager Upns       | Note (MultiLineText) | No       | No      | JSON-serialized `string[]`                          |
| projectExecutiveUpns     | Project Executive Upns          | Note (MultiLineText) | No       | No      | JSON-serialized `string[]`                          |
| safetyCoordinatorUpns    | Safety Coordinator Upns         | Note (MultiLineText) | No       | No      | JSON-serialized `string[]`                          |
| qcManagerUpns            | QC Manager Upns                 | Note (MultiLineText) | No       | No      | JSON-serialized `string[]`                          |
| warrantyManagerUpns      | Warranty Manager Upns           | Note (MultiLineText) | No       | No      | JSON-serialized `string[]`                          |
| procoreProject           | Procore Project                 | Text                 | No       | No      | Raw Procore project identifier/token                |
| buildingConnectedUrl     | Autodesk BuildingConnected Link | Text                 | No       | No      | Legacy-row external URL (https://); empty if N/A    |
| documentCrunchUrl        | Document Crunch Link            | Text                 | No       | No      | Legacy-row external URL (https://); empty if N/A    |
| projectStage             | Project Stage                   | Text                 | No       | No      | Legacy-row stage (Registry equivalent of `field_6`) |

## 5. Schema Gap Table (Prompt 02)

| Concern                                                                    | Live Snapshot                      | Target Contract                                                            | Readiness Verification                                                                                                                       | Tenant Mutation Owner                                                                              |
| -------------------------------------------------------------------------- | ---------------------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Canonical role arrays + `procoreProject`                                   | Not present in live snapshot table | Add 14 role-array Note fields + `procoreProject` Text                      | `scripts/verify-my-project-role-fields.ts` (read-only; `ready: true` ⇒ live-verified). No provider fallback — non-`ready` is a hard blocker. | Later operator-gated provisioning/migration path (Prompt 06/07)                                    |
| External-launch link columns (`buildingConnectedUrl`, `documentCrunchUrl`) | Not present in live snapshot table | Add 2 Text columns for the B05.10 multi-platform launch surface            | `scripts/verify-my-project-role-fields.ts` (read-only; `ready: true` ⇒ live-verified, expected `Text`).                                      | Later operator-gated provisioning step (B05.10 Prompt 06)                                          |
| Registry-side `projectStage`                                               | Not present in live snapshot table | Add 1 Text column (legacy-row stage; Projects-side `field_6` is unchanged) | `scripts/verify-my-project-role-fields.ts` (read-only; `ready: true` ⇒ live-verified, expected `Text`).                                      | Later operator-gated provisioning step (B05.10 Prompt 06)                                          |
| `FolderWebUrl` type drift                                                  | Live snapshot is `Text`            | Descriptor remains `URL` in Prompt 02                                      | Out of scope for the My Projects readiness probe                                                                                             | Operator-pending provisioning-readiness issue (documented; no destructive recreation in Prompt 02) |

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
