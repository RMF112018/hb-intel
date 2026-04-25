# 04 Query Probe Results

All required read-only runtime probes returned HTTP 200. The tenant currently returned zero matching rows for each probe, which is acceptable for schema validation.

## Results

- Scalar-safe content select: HTTP 200, 0 rows
- Project Spotlight active reader filter: HTTP 200, 0 rows
- Company Pulse active reader filter: HTTP 200, 0 rows
- Active placements query: HTTP 200, 0 rows

## Probe URLs

Because SharePoint REST `getbytitle(...)` requires the live display title, probes used the resolved tenant titles while targeting the approved root-folder lists:

- `Foleon Content Registry` for `/sites/HBCentral/Lists/HB_FoleonContentRegistry`
- `Foleon Homepage Placements` for `/sites/HBCentral/Lists/HB_FoleonHomepagePlacements`

The probe shapes match the requested scalar-safe fields and filter conditions.

## Evidence

Full probe evidence is stored at `exports/query-probe-results.json`.
