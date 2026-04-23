# 06 — Workbook Parsing Target Assessment

## Current workbook reality
The uploaded workbook is no longer just a visible user form. It now includes a dedicated parser-support layer:
- hidden `ParserMeta` sheet,
- explicit `TemplateVersion`,
- explicit `ParserContractVersion`,
- parser-oriented named ranges,
- data validation on date and inspection-number entry points,
- and a stronger multi-line key-findings seam.

## Current parser reality
The parser does not currently use those seams. It still:
- validates visible anchors,
- reads fixed visible cells,
- hardcodes `TEMPLATE_VERSION = 'v1'`,
- hardcodes `PARSER_VERSION = 'parser-v1'`,
- and treats key findings as one visible free-text cell.

That is now below the quality of the source artifact.

## Recommended precedence model
### 1. `ParserMeta` authority
When present and valid, use `ParserMeta` as the primary source for:
- template identity,
- parser contract version,
- raw inspection date,
- raw inspection number,
- raw project/site text,
- totals,
- safety score,
- reporting week start/end,
- reporting period label,
- normalized key findings.

### 2. Named-range authority
When `ParserMeta` is absent or incomplete, prefer named ranges:
- `InspectionDateCell`
- `InspectionNumberCell`
- `ProjectSiteCell`
- `TotalYesCell`
- `TotalNoCell`
- `TotalNACell`
- `SafetyScoreCell`
- `KeyFindingsLines`
- `ParserTemplateVersion`
- `ParserContractVersion`
- parser-support named ranges on `ParserMeta`

### 3. Legacy visible-cell fallback
Only after those two layers fail should the parser fall back to:
- `ScoreCard!B3`
- `ScoreCard!E3`
- `ScoreCard!B4`
- `ScoreCard!G4:G7`
- visible findings block fallback

## Required contract validations
The backend should validate:
1. workbook can be opened,
2. required visible sheets still exist,
3. expected template identity marker exists and is valid,
4. expected parser contract version exists and is in the accepted set,
5. required parse targets are readable,
6. inspection date and inspection number are syntactically valid,
7. reporting period derivation can be computed,
8. key findings seam is readable even when blank,
9. legacy fallback path is available only when the new contract markers are missing and backward-compat mode is intentionally allowed.

## Authoritative parse targets
The parser/backend should treat the following as authoritative when available:
- inspection date,
- inspection number,
- reporting period derivation inputs,
- normalized key findings text,
- template identity,
- parser contract version.

## Reporting-period derivation
Preferred logic:
1. trust workbook-provided week-start/week-end/period-label values when they come from the parser-support layer and validate cleanly,
2. otherwise derive from the authoritative inspection date in backend code,
3. reject if neither workbook nor backend derivation can produce a valid reporting period.

## Key findings extraction
The current single-cell assumption should be replaced with:
- normalized parser-support text when present,
- otherwise line-based extraction from the named findings range,
- otherwise visible-block fallback,
- with backend normalization into a deterministic newline-joined string plus any structured finding rows derived from checklist failures.

## Recommended response model
The backend should support a **preview/validation** result before final commit:
- template identity status,
- parser contract version status,
- parsed metadata,
- reporting period resolution,
- project resolution,
- warnings,
- blocking errors,
- normalized key findings preview,
- duplicate risk / supersession risk,
- and a commit-readiness flag.

## Invalid-template diagnostics
Examples of required diagnostics:
- missing `ParserMeta` with fallback allowed,
- missing `ParserMeta` with fallback not allowed,
- unsupported `ParserContractVersion`,
- template version mismatch,
- unreadable inspection date,
- invalid inspection number,
- findings seam missing,
- workbook totals inconsistent with parsed responses,
- reporting period cannot be derived or resolved.
