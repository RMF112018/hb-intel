# 04 — Parser, Validation, and Scoring Engine

## Objective

Define how the upload parser should behave for Release 1.

## Source-of-truth rule

The uploaded workbook is an **input artifact**.

The authoritative safety record is created by the ingestion service after validation and recalculation.

## Parsing stages

### Stage 1 — File validation
- confirm `.xlsx`
- confirm workbook opens
- confirm required sheets exist
- confirm expected worksheet dimensions / anchor cells

### Stage 2 — Template validation
- detect workbook template version
- confirm top labels and response-grid columns match contract
- confirm section header rows match contract
- confirm scoring-weight sheet matches governed expectations

### Stage 3 — Metadata extraction
Extract:
- inspection date
- project/site text
- inspection number
- filename
- uploaded by
- upload timestamp

### Stage 4 — Row parsing
For each governed checklist row:
- row number
- section number
- section name
- item label
- response (`yes`, `no`, `na`, `incomplete`, `multi`)
- notes
- workbook score cell
- workbook flag cell

### Stage 5 — Project resolution
Attempt project match in this order:
1. exact project bind to `Projects`
2. fallback bind to `Legacy Project Fallback Registry`
3. unresolved → review-required

### Stage 6 — Score recalculation
Derive:
- per-row binary score
- per-section counts
- per-section score percentages
- weighted final inspection score

### Stage 7 — Structured record creation
Create:
- ingestion run
- inspection event
- findings
- corrective actions (if staged in Release 1)
- project-week record updates

## Scoring-mode recommendation

Support an explicit field on the inspection event:

- `ScoringMode`
  - `template-compat-v1`
  - `normalized-vNext`

This allows controlled migration once the workbook formula quirks are corrected.

## Finding extraction rules

### Minimum Release 1 rule set
Create a finding when:
- a row response is `No`
- notes field contains meaningful text
- row is marked `INCOMPLETE` or `MULTI`
- parser detects unsafe or malformed inspection behavior

### Suggested finding fields
- checklist row number
- section
- item label
- response
- note text
- severity heuristic
- corrective-action-required flag

## Duplicate detection logic

Suggested duplicate confidence dimensions:
- same project/week/date
- same inspection number
- same checksum
- same response pattern
- same uploader within short time window

## Error-handling classes

- `template-invalid`
- `template-unsupported-version`
- `project-unresolved`
- `duplicate-suspected`
- `parse-error`
- `commit-error`

## Auditability requirement

Every ingestion run should preserve:
- upload file reference
- parser version
- scoring mode
- validation results
- committed record IDs
- error details

## Recommendation

Keep the parser deterministic. Do not use fuzzy AI extraction for Release 1 governed workbook ingestion.
