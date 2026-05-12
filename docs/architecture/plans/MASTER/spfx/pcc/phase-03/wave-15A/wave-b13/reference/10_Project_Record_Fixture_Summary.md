# Phase 08 Prompt 10 — Project Record Fixture Directory Summary

## Purpose

This support note summarizes the uploaded SharePoint-style project directory template used by the Document Control explorer implementation package. The implementation prompts treat it as a deterministic, read-only/no-writeback **Project Record** preview tree.

## Fixture Facts

- Source archive: `00-000-00 Proposed Project Directory.zip`
- Root directory: `00-000-00 Proposed Project Directory`
- Directory paths represented, including root: `233`
- Directory paths beneath root: `232`
- Maximum relative folder depth: `5`
- Valid fixture content is folder-only; archive noise such as `__MACOSX/` and `.DS_Store` is intentionally excluded.

## Locked Top-Level Project Record Folders

- `00_Project_Admin`
- `10_Preconstruction`
- `20_Construction`
- `30_Financials`
- `40_Closeout`
- `50_3rd_Party`
- `60_Media`

## Representative Second-Level Structure

### `00_Project_Admin`

- `Contracts`
- `Insurance`
- `Owner_Deliverables`
- `Permits`
- `Team_Files`

### `10_Preconstruction`

- `Business_Development`
- `Estimating`
- `Marketing`
- `Team_Files`

### `20_Construction`

- `Daily_Reports`
- `Meetings`
- `Monthly_Reports`
- `RFIs`
- `Safety`
- `Schedule`
- `Submittals`
- `Team_Files`
- `Testing_Inspections`

### `30_Financials`

- `Budget`
- `Change_Orders`
- `Forecasts`
- `Pay_Applications`
- `Team_Files`

### `40_Closeout`

- `00_TOC_Letters`
- `01_Warranty`
- `02_Directory`
- `03_Certificates`
- `04_CD_Archive`
- `05_AsBuilts`
- `06_O&M_Manuals`
- `07_Permits`
- `08_Reports`
- `09_Submittals`
- `10_AtticStock`
- `11_FixedAssets`
- `12_Closeout_Log`
- `13_Punchlist`
- `14_Evaluation`
- `15_Utils_Services`
- `Team_Files`

### `50_3rd_Party`

- `Architect`
- `Consultants`
- `Engineer`
- `Owner`
- `Team_Files`

### `60_Media`

- `Aerials`
- `Photos`
- `Team_Files`
- `Video`

## Implementation Use

- Use `10_Project_Record_Fixture_Folder_Paths.json` as the authoritative package support source when implementing the typed Project Record preview tree.
- The local code agent should translate this support data into the repo's preferred typed fixture/model structure; it should not add the raw ZIP archive to runtime source.
- Folder labels and folder ordering should remain deterministic. Preserve supplied label text unless a prompt explicitly authorizes a user-facing display-label transform.
- The explorer must support navigation through the full represented hierarchy; deep folder traversal is part of acceptance, not decorative data.
