# Preconstruction Continuity Source Template Mapping

## Purpose

Define how source templates should be extracted and mapped into Preconstruction Continuity documentation/reference JSONs.

## Source Template Rules

- Do not modify source workbooks/PDFs.
- Do not unprotect protected workbooks.
- Use source templates as inventory, seed taxonomy, and evidence.
- Preserve sheet/page/row/column/cell/source-section references.
- Classify sensitive fields before making them visible.
- Do not expose raw executive/committee comments without permission model.
- Do not use source workbook layout as target UX.

## Required Extraction Outputs

The local agent should populate or update:

```text
source_template_extraction_snapshot.json
source_template_field_map_requirements.json
```

## Required Mapping Sections

- Go / No-Go decision fields.
- Score / score-band fields.
- Executive override fields.
- Strategy and differentiator fields.
- Client / market / relationship context.
- Risk and staffing assumptions.
- Estimating Kickoff deliverables.
- Due dates and bid calendar fields.
- Assignment/owner fields.
- Evidence/source-document fields.
- Comments and sensitive notes.

## Unified Lifecycle Mapping

| Source Field Type | Target Use |
|---|---|
| final GO decision | lifecycle event + carry-forward snapshot |
| why pursue / strategy | Project Memory |
| differentiators | Project Memory + future-reference knowledge |
| assumptions | Project Memory + traceability candidates |
| staffing/resource assumptions | readiness signal, not HR commitment |
| kickoff deliverables | future Estimating Kickoff records |
| due dates | lifecycle events + Priority Action candidates |
| owner assignments | workflow responsibility only |
| source docs | Document Control evidence link |
| sensitive comments | restricted or withheld memory, not HBI-visible unless allowed |

## Validation

- JSON files must validate with `python3 -m json.tool`.
- Markdown/JSON touched files must pass Prettier.
- Lockfile must remain unchanged.
- No source workbook/PDF may appear modified in `git status`.
