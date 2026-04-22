# Safety Project Week Records

## 1. Objective

- Schema-authority-backed reference for `Safety Project Week Records` at `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`.
- One record per project per reporting period; contains weekly rollups and publish/review state.

## 2. List-Level Metadata

- Source Authority: `packages/features/safety/src/lists/fieldSchema.ts`, `packages/features/safety/src/lists/descriptors.ts`
- List ID: `404546f4-c827-4d87-816b-fa526c15852b`
- ID Provenance: captured from `/tmp/hb-lists.json` and `/tmp/hbsp-Safety_Project_Week_Records.json` on `2026-04-22` for `/sites/HBCentral`.
- Display Name: `Safety Project Week Records`
- URL: `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral/Lists/Safety%20Project%20Week%20Records`
- Root Folder URL: `/sites/HBCentral/Lists/Safety Project Week Records`
- Template: `genericList (expected)`
- Classification: `business/custom`
- Description: `One record per project per reporting period; holds weekly rollup.`
- Hidden: `false (expected)`
- Content Types Enabled: `false (expected)`

## 3. Field Schema

| Display Name         | Internal Name               | Type    | Required | Hidden | Read Only | Indexed | Lookup / Choices / Formula / Notes                                                                    |
| -------------------- | --------------------------- | ------- | -------- | ------ | --------- | ------- | ----------------------------------------------------------------------------------------------------- |
| Title                | Title                       | Text    | Yes      | No     | No        | Unknown | MaxLength=255                                                                                         |
| Reporting Period     | ReportingPeriodId           | Lookup  | Yes      | No     | No        | Unknown | Lookup -> `Safety Reporting Periods`                                                                  |
| Project              | ProjectLookupId             | Lookup  | No       | No     | No        | Unknown | Lookup -> `Projects`                                                                                  |
| Legacy Registry Item | LegacyRegistryItemId        | Number  | No       | No     | No        | Unknown | Legacy fallback row id                                                                                |
| Project Source       | ProjectSourceClassification | Choice  | No       | No     | No        | Unknown | Choices: `project`, `legacy-only`, `project+legacy`, `unresolved`                                     |
| Project Number       | ProjectNumber               | Text    | Yes      | No     | No        | Unknown | Canonical project identity                                                                            |
| Project Name         | ProjectNameSnapshot         | Text    | No       | No     | No        | Unknown | Snapshot field                                                                                        |
| Project Stage        | ProjectStageSnapshot        | Text    | No       | No     | No        | Unknown | Snapshot field                                                                                        |
| Project Location     | ProjectLocationSnapshot     | Text    | No       | No     | No        | Unknown | Snapshot field                                                                                        |
| Expected This Week   | ExpectedInspectionThisWeek  | Boolean | No       | No     | No        | Unknown | Expected inspection signal                                                                            |
| Inspection Count     | InspectionCount             | Number  | No       | No     | No        | Unknown | Weekly rollup                                                                                         |
| Average Score        | AverageInspectionScore      | Number  | No       | No     | No        | Unknown | Weekly rollup                                                                                         |
| Highest Risk Level   | HighestRiskFindingLevel     | Choice  | No       | No     | No        | Unknown | Choices: `info`, `medium`, `high`                                                                     |
| Weekly Summary       | WeeklySummary               | Note    | No       | No     | No        | Unknown | Multiline summary                                                                                     |
| Manager Review       | ManagerReviewStatus         | Choice  | No       | No     | No        | Unknown | Choices: `not-required`, `pending`, `approved`                                                        |
| Publish Status       | PublishStatus               | Choice  | No       | No     | No        | Unknown | Choices: `not-started`, `awaiting-upload`, `in-progress`, `completed`, `review-required`, `published` |

## 4. Content Types / Forms / Behavioral Context

- Associated Content Types: `Item` (expected)
- Default List Forms: `/sites/HBCentral/Lists/Safety Project Week Records/AllItems.aspx` (expected)
- Observed Role Hint: bridge between reporting period and inspection events with project-resolution context.

## 5. Relationship Observations

- Outbound lookup references:
  - `ReportingPeriodId` -> `Safety Reporting Periods`
  - `ProjectLookupId` -> `Projects`
- Inbound references:
  - `Safety Inspection Events.ProjectWeekRecordId`
  - `Safety Findings.ProjectWeekRecordId`
- Logical (non-enforced) join: `LegacyRegistryItemId` aligns to `Legacy Project Fallback Registry.ID` when fallback source is used.

## 6. Implementation-Relevant Findings

- Critical fields from descriptor contract: `ReportingPeriodId`, `ProjectNumber`, `ProjectNameSnapshot`, `InspectionCount`, `AverageInspectionScore`, `PublishStatus`.
- Candidate index fields: `ReportingPeriodId`, `ProjectNumber`, `PublishStatus`, `ProjectSourceClassification`.
- Provisioning/seed logic must preserve `ProjectSourceClassification` choice vocabulary exactly.

## 7. Open Questions / Follow-Up Checks

- Confirm tenant GUID and item count during next extraction refresh.
- Confirm whether `ProjectNumber` requires explicit index under observed load.
- Re-extract after provisioning to replace `Unknown` index flags with tenant-truth values.
