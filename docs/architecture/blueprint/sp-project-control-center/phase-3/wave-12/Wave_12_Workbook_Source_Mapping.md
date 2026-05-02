# Wave 12 Workbook Source Mapping

Date: 2026-05-02
Wave: 12
Workbook: `docs/reference/example/HB_ConstraintsLog_Template.xlsx`

## Purpose

Define source-traceable mapping from the Constraints Log workbook into Wave 12 documentation reference artifacts while preventing workbook rows from becoming active default constraints.

## Workbook Truth (Re-validated in Prompt 05)

The following values were re-read from workbook structure in this prompt:

- Sheets: `ActionItems`, `Help`
- `ActionItems` used range: `A1:K934`
- `ActionItems` merged ranges: `A3:K6`, `A1:G1`, `H1:K1`
- Data validation rules: `4`
- Hidden rows: `810`
- Formula count (worksheet scan): `795`
- Standard header row: `10` (`No #`, `DESCRIPTION`, `DATE IDENTIFIED`, `STATUS`, `DAYS ELAPSED`, `REFERENCE`, `RESPONSIBLE`, `B.I.C`, `DUE`, `COMPLETION DATE`, `COMMENTS`)
- Key section markers:
  - `1. PERMITS - OPEN` (row `11`)
  - `1. PERMITS - CLOSED` (row `111`)
  - `2. AHJ COORDINATION - OPEN` (row `114`)
  - `2. AHJ COORDINATION - CLOSED` (row `214`)
  - `3. DESIGN DEVELOPMENT` (row `218`)
  - `3. DESIGN DEVELOPMENT - CLOSED` (row `318`)
  - `4. UTILITY SERVICE PROVIDERS - OPEN` (row `321`)
  - `4. UTILITY SERVICE PROVIDERS - CLOSED` (row `421`)
  - `5. HEDRICK BROTHERS INTERNAL COORDINATION ITEMS` (row `424`)
  - `5. HEDRICK BROTHERS INTERNAL COORDINATION ITEMS - CLOSED` (row `524`)
  - `6. CONSTRUCTION PROGRESS - OPEN` (row `527`)
  - `6. CONSTRUCTION PROGRESS - CLOSED` (row `627`)
  - `7. {NEW SECTION} - OPEN` (rows `630`, `730`)
  - `CHANGE TRACKING` (row `733`)
  - `Delay Log` (row `834`)

## Mapping Posture

- Workbook is a source/reference taxonomy input.
- Workbook rows are not runtime records.
- Workbook rows do not become active default constraints unless project-specific verification exists.
- Change Tracking and Delay Log sections are mapped as exposure source context only, not legal/claim/delay-determination engines.

## Classification Model

Artifacts under `wave-12/reference/` classify workbook content into:

- sections;
- fields;
- sample rows;
- placeholder rows;
- ambiguous rows/items;
- change-tracking and delay-log source sections.

## Wave 12 Boundary Alignment

- Governing docs place Wave 12 under Project Readiness.
- Current source model maps `constraints-log` to `risk-issues-decision`.
- This mapping document is documentation-only and does not authorize source edits.

## Guardrails

- No runtime implementation change is authorized by this mapping.
- No external-system writeback/mutation behavior is introduced.
- No legal/claim/entitlement/compensability/delay-damages/forensic schedule analysis determinations are introduced.
