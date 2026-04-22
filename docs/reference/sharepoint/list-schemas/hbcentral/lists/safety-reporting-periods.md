# Safety Reporting Periods

## 1. Objective

- Schema-authority-backed reference for `Safety Reporting Periods` at `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`.
- Weekly parent records used by Safety Record Keeping for upload defaults, ingestion grouping, and publish lifecycle state.

## 2. List-Level Metadata

- Source Authority: `packages/features/safety/src/lists/fieldSchema.ts`, `packages/features/safety/src/lists/descriptors.ts`
- List ID: `c30e6f0f-44be-49bd-ad14-46701f96cedb`
- ID Provenance: captured from `/tmp/hb-lists.json` and `/tmp/hbsp-Safety_Reporting_Periods.json` on `2026-04-22` for `/sites/HBCentral`.
- Display Name: `Safety Reporting Periods`
- URL: `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral/Lists/Safety%20Reporting%20Periods`
- Root Folder URL: `/sites/HBCentral/Lists/Safety Reporting Periods`
- Template: `genericList (expected)`
- Classification: `business/custom`
- Description: `Weekly parent records for safety inspection cycles.`
- Hidden: `false (expected)`
- Content Types Enabled: `false (expected)`

## 3. Field Schema

| Display Name    | Internal Name | Type     | Required | Hidden | Read Only | Indexed | Lookup / Choices / Formula / Notes     |
| --------------- | ------------- | -------- | -------- | ------ | --------- | ------- | -------------------------------------- |
| Title           | Title         | Text     | Yes      | No     | No        | Unknown | MaxLength=255                          |
| Week Start Date | WeekStartDate | DateTime | Yes      | No     | No        | Unknown | Week boundary start                    |
| Week End Date   | WeekEndDate   | DateTime | Yes      | No     | No        | Unknown | Week boundary end                      |
| Period Label    | PeriodLabel   | Text     | No       | No     | No        | Unknown | Human-readable period string           |
| Status          | Status        | Choice   | No       | No     | No        | Unknown | Choices: `open`, `closed`, `published` |
| Published At    | PublishedAt   | DateTime | No       | No     | No        | Unknown | Publication timestamp                  |
| Published By    | PublishedBy   | User     | No       | No     | No        | Unknown | Person/group reference                 |
| Notes           | Notes         | Note     | No       | No     | No        | Unknown | Multiline text                         |

## 4. Content Types / Forms / Behavioral Context

- Associated Content Types: `Item` (expected)
- Default List Forms: `/sites/HBCentral/Lists/Safety Reporting Periods/AllItems.aspx` (expected)
- Observed Role Hint: parent list for weekly reporting windows.
- Runtime contract note: period selection commonly uses `WeekStartDate desc` ordering; avoid creating forward periods unintentionally.

## 5. Relationship Observations

- Outbound lookup references: AppPrincipals, User Information List (system/OOB metadata), plus standard author/editor fields.
- Inbound logical references:
  - `Safety Project Week Records.ReportingPeriodId`
  - `Safety Inspection Events.ReportingPeriodId`
  - `Safety Ingestion Runs.ReportingPeriodId`

## 6. Implementation-Relevant Findings

- Critical fields from descriptor contract: `WeekStartDate`, `WeekEndDate`, `PeriodLabel`, `Status`.
- Candidate index fields for query stability: `WeekStartDate`, `WeekEndDate`, `Status`.
- Seeding/ensure operations should be idempotent by week identity (`WeekStartDate` and/or canonical title pattern).

## 7. Open Questions / Follow-Up Checks

- Confirm live list GUID and item count in next tenant extraction refresh.
- Confirm indexed-column posture for `WeekStartDate` and `Status` under production query load.
- Re-extract after provisioning changes to replace `Unknown` index flags with tenant-truth values.
