# Workbook Source Extraction Summary — Wave 12 Constraints Log

Generated: 2026-05-02

## Source Workbook

- Uploaded workbook inspected: `/mnt/data/HB_ConstraintsLog_Template(4).xlsx`
- Canonical repo target path: `docs/reference/example/HB_ConstraintsLog_Template.xlsx`
- Uploaded workbook SHA-256: `8b999632009ec374eca6d5350eba68622f3d63ecc75901d03369bede655f9f8a`

## Workbook Posture Decision

The workbook is a **source reference and seed taxonomy**, not a UX contract. It has not been widely adopted and must not be replicated shot-for-shot.

Final use:

- Section headers seed target categories.
- Columns seed target fields and source-traceability mappings.
- Placeholder rows remain placeholder capacity only.
- Sample rows remain sample-only unless verified as live project data.
- Change Tracking informs linkage to change exposure only.
- Delay Log informs linkage to delay exposure only.
- Help sheet and Vertex42 references are template support, not product architecture requirements.

## Workbook Metadata

{
  "filename": "HB_ConstraintsLog_Template(4).xlsx",
  "sha256": "8b999632009ec374eca6d5350eba68622f3d63ecc75901d03369bede655f9f8a",
  "sheets": [
    {
      "sheetName": "ActionItems",
      "sheetId": "1",
      "xmlPath": "xl/worksheets/sheet1.xml",
      "usedRange": "A1:K934",
      "mergedCells": [
        "A3:K6",
        "A1:G1",
        "H1:K1"
      ],
      "formulaCount": 795,
      "hiddenRowCount": 810,
      "hiddenRowsFirst25": [
        22,
        23,
        24,
        25,
        26,
        27,
        28,
        29,
        30,
        31,
        32,
        33,
        34,
        35,
        36,
        37,
        38,
        39,
        40,
        41,
        42,
        43,
        44,
        45,
        46
      ],
      "hiddenColumns": [],
      "dataValidations": [
        {
          "type": "list",
          "range": "D734:D833 D837:D934 D630",
          "formula1": "\"Not Started,25%,50%,75%,100%,On Hold,Pending\""
        },
        {
          "type": "list",
          "range": "D836",
          "formula1": "\"IDENTIFIED, OWNER NOTIFIED, CO ISSUED, CO APPROVED, CLOSED W/ EXTENSION, CLOSED NO EXTENSION, CLOSED NO IMPACT\""
        },
        {
          "type": "list",
          "range": "G836:G934",
          "formula1": "\"Y, N, TBD\""
        },
        {
          "type": "list",
          "range": "D628:D629 D525:D526 D12:D110 D422:D423 D322:D420 D319:D320 D219:D317 D215:D217 D115:D213 D112:D113 D425:D523 D528:D626 D631:D729 D731:D732",
          "formula1": "\" ,IDENTIFIED,PENDING,IN PROGRESS,ON HOLD,CLOSED,VOID\""
        }
      ],
      "conditionalFormattingRangeCount": 99
    },
    {
      "sheetName": "Help",
      "sheetId": "2",
      "xmlPath": "xl/worksheets/sheet2.xml",
      "usedRange": "A1:D34",
      "mergedCells": [],
      "formulaCount": 0,
      "hiddenRowCount": 0,
      "hiddenRowsFirst25": [],
      "hiddenColumns": [],
      "dataValidations": [],
      "conditionalFormattingRangeCount": 0
    }
  ],
  "sharedStringsCount": 194
}

## Extraction Summary

- Sheets: `ActionItems, Help`
- ActionItems used range: `A1:K934`
- Help used range: `A1:D34`
- Merged cells: `A3:K6, A1:G1, H1:K1`
- Formula count: `795`
- Hidden row count: `810`
- Data validation rules: `4`
- Conditional formatting ranges: `99`
- Seed categories extracted: `16`
- Default fields extracted: `33`
- Populated sample rows extracted: `7`
- Placeholder capacity rows extracted: `688`

## Data Validations

- Range `D734:D833 D837:D934 D630`: type `list`, formula `"Not Started,25%,50%,75%,100%,On Hold,Pending"`
- Range `D836`: type `list`, formula `"IDENTIFIED, OWNER NOTIFIED, CO ISSUED, CO APPROVED, CLOSED W/ EXTENSION, CLOSED NO EXTENSION, CLOSED NO IMPACT"`
- Range `G836:G934`: type `list`, formula `"Y, N, TBD"`
- Range `D628:D629 D525:D526 D12:D110 D422:D423 D322:D420 D319:D320 D219:D317 D215:D217 D115:D213 D112:D113 D425:D523 D528:D626 D631:D729 D731:D732`: type `list`, formula `" ,IDENTIFIED,PENDING,IN PROGRESS,ON HOLD,CLOSED,VOID"`

## Section Rows

- Row 11: `1. PERMITS - OPEN`
- Row 111: `1. PERMITS - CLOSED`
- Row 114: `2. AHJ COORDINATION - OPEN`
- Row 214: `2. AHJ COORDINATION - CLOSED`
- Row 218: `3. DESIGN DEVELOPMENT`
- Row 318: `3. DESIGN DEVELOPMENT - CLOSED`
- Row 321: `4. UTILITY SERVICE PROVIDERS - OPEN`
- Row 421: `4. UTILITY SERVICE PROVIDERS - CLOSED`
- Row 424: `5. HEDRICK BROTHERS INTERNAL COORDINATION ITEMS`
- Row 524: `5. HEDRICK BROTHERS INTERNAL COORDINATION ITEMS - CLOSED`
- Row 527: `6. CONSTRUCTION PROGRESS - OPEN`
- Row 627: `6. CONSTRUCTION PROGRESS - CLOSED`
- Row 630: `7. {NEW SECTION} - OPEN`
- Row 730: `7. {NEW SECTION} - OPEN`
- Row 733: `CHANGE TRACKING`
- Row 834: `Delay Log`

## Sample Rows

- Row 115: `Right Turn Lane North Approach` — constraint — IN PROGRESS
- Row 116: `Median Landscaping at Jog Road` — constraint — IN PROGRESS
- Row 117: `Jog Road South Approach Left Turn Lane Extension` — constraint — IDENTIFIED
- Row 118: `Amenity Completion` — constraint — IN PROGRESS
- Row 120: `AHJ CLOSE-OUT REQUIREMENTS` — constraint — no status
- Row 215: `School Bus Shelter Completion` — constraint — CLOSED
- Row 836: `PBC Permit Delay - PDI Claim` — delay-log — CLOSED W/ EXTENSION

## Final Extraction Rule

No workbook row becomes an active default constraint. The workbook is used to generate:

- `reference/default_constraints_log_seed_structure.json`
- workbook-source mapping documentation
- default category/field posture
- source-traceability requirements
- import/classification guardrails
