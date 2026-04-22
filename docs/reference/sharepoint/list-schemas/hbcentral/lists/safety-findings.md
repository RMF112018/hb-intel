# Safety Findings

## 1. Objective

- Schema-authority-backed reference for `Safety Findings` at `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`.
- Structured findings extracted from inspection events for risk tracking and corrective-action workflows.

## 2. List-Level Metadata

- Source Authority: `packages/features/safety/src/lists/fieldSchema.ts`, `packages/features/safety/src/lists/descriptors.ts`
- List ID: `8140e59a-0fed-4681-8e8d-8360c93d2d08`
- ID Provenance: captured from `/tmp/hb-lists.json` and `/tmp/hbsp-Safety_Findings.json` on `2026-04-22` for `/sites/HBCentral`.
- Display Name: `Safety Findings`
- URL: `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral/Lists/Safety%20Findings`
- Root Folder URL: `/sites/HBCentral/Lists/Safety Findings`
- Template: `genericList (expected)`
- Classification: `business/custom`
- Description: `Structured findings derived from inspection events.`
- Hidden: `false (expected)`
- Content Types Enabled: `false (expected)`

## 3. Field Schema

| Display Name        | Internal Name            | Type    | Required | Hidden | Read Only | Indexed | Lookup / Choices / Formula / Notes                         |
| ------------------- | ------------------------ | ------- | -------- | ------ | --------- | ------- | ---------------------------------------------------------- |
| Title               | Title                    | Text    | Yes      | No     | No        | Unknown | MaxLength=255                                              |
| Inspection Event    | InspectionEventId        | Lookup  | Yes      | No     | No        | Unknown | Lookup -> `Safety Inspection Events`                       |
| Project-Week Record | ProjectWeekRecordId      | Lookup  | No       | No     | No        | Unknown | Lookup -> `Safety Project Week Records`                    |
| Section Number      | SectionNumber            | Number  | No       | No     | No        | Unknown | Checklist section number                                   |
| Section Name        | SectionName              | Text    | No       | No     | No        | Unknown | Section label                                              |
| Checklist Row       | ChecklistRowNumber       | Number  | No       | No     | No        | Unknown | Checklist row number                                       |
| Checklist Item      | ChecklistItemLabel       | Note    | No       | No     | No        | Unknown | Checklist item text                                        |
| Finding Type        | FindingType              | Choice  | No       | No     | No        | Unknown | Choices: `no-response`, `incomplete`, `multi`, `note-only` |
| Severity            | Severity                 | Choice  | No       | No     | No        | Unknown | Choices: `info`, `medium`, `high`                          |
| Finding Summary     | FindingSummary           | Note    | No       | No     | No        | Unknown | Summary text                                               |
| Original Note       | OriginalNoteText         | Note    | No       | No     | No        | Unknown | Original note payload                                      |
| Requires CA         | RequiresCorrectiveAction | Boolean | No       | No     | No        | Unknown | Corrective-action flag                                     |
| Is Open             | IsOpen                   | Boolean | No       | No     | No        | Unknown | Open-state flag                                            |

## 4. Content Types / Forms / Behavioral Context

- Associated Content Types: `Item` (expected)
- Default List Forms: `/sites/HBCentral/Lists/Safety Findings/AllItems.aspx` (expected)
- Observed Role Hint: child list for normalized issue/finding rows tied to inspection events.

## 5. Relationship Observations

- Outbound lookup references:
  - `InspectionEventId` -> `Safety Inspection Events`
  - `ProjectWeekRecordId` -> `Safety Project Week Records`
- No additional enforced lookups in schema authority.

## 6. Implementation-Relevant Findings

- Critical fields from descriptor contract: `InspectionEventId`, `ProjectWeekRecordId`, `SectionNumber`, `ChecklistRowNumber`, `FindingType`, `Severity`.
- Candidate index fields: `InspectionEventId`, `ProjectWeekRecordId`, `Severity`, `FindingType`, `IsOpen`, `ChecklistRowNumber`.
- Risk severity and finding-type choice values are strict contract values for reporting consistency.

## 7. Open Questions / Follow-Up Checks

- Confirm tenant GUID and item count during next extraction refresh.
- Confirm indexed-column posture for `InspectionEventId` and `IsOpen` for open-findings queries.
- Re-extract after provisioning to replace `Unknown` index flags with tenant-truth values.
