# 06 — Workbook Parsing Target Assessment

## Important constraint

The workbook file itself was not available for direct inspection in this session.

This assessment is therefore based on:
- the prompt’s workbook-contract description
- the current parser implementation on `main`

That is still enough to identify the intended backend target shape.

## Parser targets already supported in code

The parser contract already recognizes or supports:

- `ParserMeta` sheet
- named ranges for parser-critical values
- template version marker
- parser contract version marker
- inspection date
- inspection number
- project/site text
- total yes / no / N/A
- safety score
- reporting-week start
- reporting-week end
- reporting-period label
- key findings normalized seam
- named range lines for key findings

## Current authority order

The current parser code already establishes the correct general source order:

1. `ParserMeta`
2. named ranges
3. legacy fallback only when markers are absent

That is the right direction.

## What should be authoritative

The backend should treat these as parser-authoritative or parser-governed:

- inspection date
- inspection number
- project/site text
- workbook totals
- workbook score
- reporting-period derivation markers when present
- normalized key findings seam
- template identity
- parser contract version

## What should no longer be authoritative from intake context

The backend should stop treating the front-end request context as authoritative for:
- inspection date
- inspection number

Those values can still be supplied for operator convenience, but they should only be used for:
- preview comparison
- mismatch detection
- explicit conflict messaging

They should not silently override parsed workbook values.

## Recommended authority model

### Case 1 — parser markers present
Use:
- `ParserMeta` first
- named ranges second
- no legacy fallback for the parser-governed values
- explicit incompatibility errors if required markers are missing/invalid

### Case 2 — parser markers absent
Use:
- named ranges when present
- legacy visible-cell fallback
- mark compatibility status as legacy-compatible
- warn that parser-first assurances were unavailable

## Reporting-period derivation behavior

If reporting-week start / end / label markers are present:
- require all three together
- validate them as a complete set
- compare parsed inspection date against the selected reporting period
- fail preview if the inspection date is outside the selected period

If those markers are absent:
- fall back to current reporting-period resolution path
- still validate selected reporting period against parsed inspection date

## Key findings behavior

When markers are present:
- use normalized ParserMeta key findings first
- named-range line seam second
- do not depend on brittle visible free-text regions

When markers are absent:
- use legacy visible-cell/range fallback
- clearly mark that path as fallback behavior

## Preview response should explicitly return

- template marker presence
- template version
- parser contract version
- whether parser-first mode was active
- value source for:
  - inspection date
  - inspection number
  - project/site text
  - key findings
- conflicts between intake-entered values and parsed workbook values
- reporting-period mismatch details
- duplicate/supersession risk
- normalized key findings preview

## Invalid-template diagnostics should be explicit

Examples:
- missing required sheet
- unsupported template marker
- unsupported parser contract version
- incomplete reporting-period marker set
- missing key findings seam when parser markers are present
- unreadable inspection date
- invalid inspection number

## Net conclusion

The updated workbook materially improves backend design options.

The backend should now fully embrace a **parse-first authority model** instead of treating the intake context as co-equal authority for parser-critical values.

