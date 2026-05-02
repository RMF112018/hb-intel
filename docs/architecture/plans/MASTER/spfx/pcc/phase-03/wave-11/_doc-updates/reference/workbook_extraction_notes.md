# Workbook Extraction Notes

Generated from uploaded workbook XML on 2026-05-02 08:36:58 local container time.

## Extraction Method

- Parsed `.xlsx` workbook package XML directly from uploaded files.
- Extracted workbook/sheet structure, used ranges, merged cells, frozen panes, hidden row/column flags, tables, named ranges, formulas/cached values, data validations, conditional formatting, and sheet protection where present.
- Classified rows as default responsibility items only when they contained a responsibility/task description. Placeholder, blank, instruction, legend, or formatting-only rows were captured in notes or `ambiguousItems`.
- Did not infer legal/contractual requirement from blank/nonblank cells alone.

## Summary Counts

- Default items extracted: `109`
- Ambiguous / excluded rows captured: `36`
- PM sheet default items: `82`
- Field sheet default items: `27`
- Owner-contract default items: `0` prefilled items; placeholder rows captured as ambiguous.

## General Responsibility Matrix: `Responsibility Matrix - Template(3).xlsx`
Named ranges / defined names: `[{"name": "NOCDate", "localSheetId": null, "text": "Field!$A$1"}, {"name": "_xlnm.Print_Area", "localSheetId": "0", "text": "PM!$A$1:$I$88"}]`
### Sheet `PM`
- Used range: `A1:I86`
- Merged cells: `[]`
- Frozen panes: `None`
- Hidden columns: `[]`
- Hidden rows: `[]`
- Tables: `[]`
- Data validations: `[]`
- Conditional formatting: `[]`
- Sheet protection: `None`
- Formula count: `0`
### Sheet `Field`
- Used range: `A1:H78`
- Merged cells: `['H4:H5', 'B4:B5', 'C4:C5', 'D4:D5', 'E4:E5', 'F4:F5', 'G4:G5']`
- Frozen panes: `None`
- Hidden columns: `[]`
- Hidden rows: `[]`
- Tables: `[]`
- Data validations: `[]`
- Conditional formatting: `[]`
- Sheet protection: `None`
- Formula count: `0`
## Owner Contract Responsibility Matrix: `Responsibility Matrix - Owner Contract Template(3).xlsx`
Named ranges / defined names: `[{"name": "_xlnm.Print_Area", "localSheetId": "0", "text": "Template!$A$1:$D$42"}]`
### Sheet `Template`
- Used range: `A1:F45`
- Merged cells: `['A2:D2']`
- Frozen panes: `None`
- Hidden columns: `[]`
- Hidden rows: `[]`
- Tables: `[]`
- Data validations: `[]`
- Conditional formatting: `[]`
- Sheet protection: `None`
- Formula count: `0`


## Important Classification Notes

- `Responsibility Matrix - Template.xlsx` has two active source sheets: `PM` and `Field`.
- `PM` sheet rows 4-74 and 76-86 were treated as workbook-derived responsibility/reminder rows because they include task descriptions.
- `Field` sheet rows with category + task descriptions were treated as workbook-derived responsibility rows; blank category-only rows were excluded.
- `Responsibility Matrix - Owner Contract Template.xlsx` contains row slots with `Article=0` and `Page=0`, plus a party-code legend. It does not contain actual owner-contract default descriptions in the uploaded version.
- Source party code `C` in the owner-contract legend means `Contractor Activity`; it must not be confused with RACI `C = Consulted`.
