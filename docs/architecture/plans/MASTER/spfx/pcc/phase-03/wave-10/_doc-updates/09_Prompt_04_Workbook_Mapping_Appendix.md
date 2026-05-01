# Prompt 04 — Workbook Mapping Appendix

You are working in `/Users/bobbyfetting/hb-intel`.

Your task is to create a workbook source mapping appendix for Wave 10.

## Global Guardrails

- Do not re-read files that are still within current context or memory.
- Do not overwrite unrelated working-tree changes.
- Do not edit `docs/architecture/plans/**` unless explicitly authorized and consistent with repo governance.
- Do not introduce package dependencies.
- Do not change `pnpm-lock.yaml`.
- Do not run `pnpm install`, `pnpm add`, or equivalent.
- Do not package or deploy SPFx.
- Do not mutate tenant or external systems.
- Do not introduce secrets/app settings.
- Do not perform live AHJ, Procore, Microsoft Graph, Adobe, Document Crunch, Sage, Compass, or other external operations.
- Use targeted docs validation first.
- Keep AHJ interactions to launcher links only unless a later implementation phase explicitly authorizes more.
- Preserve workbook source traceability.
- Preserve Wave 10 relationship to Wave 8 Project Readiness and Wave 14 Approvals / Checkpoints.
- Preserve repo-truth citations and actual file paths.


## Output File

Create or update:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-10/Wave_10_Workbook_Source_Mapping.md
```

## Required Work

Use repo-resident workbooks:

```text
docs/reference/example/Permit_Log_Template.xlsx
docs/reference/example/Inspection-Log-Template.xlsx
```

## Required Sections

1. Permit Log workbook inventory
2. Inspection Log workbook inventory
3. Sheet names and used ranges
4. Column mapping tables
5. Sample row analysis
6. Status/dropdown/value analysis
7. Formula and conditional formatting findings
8. Hidden row/column findings
9. Workbook-derived fields
10. Workbook-enhanced fields
11. Chat-required fields:
    - `revision`
    - `applicationValue`
    - `permitFee`
    - `reInspectionFee`
12. Research-informed fields
13. Repo-alignment fields
14. Ambiguous fields requiring user review
15. Import/migration posture
16. Source traceability requirements

## Mapping Classification

Each target field must be classified as one of:

- Workbook-derived
- Workbook-enhanced
- Chat-required
- Research-informed
- Repo-alignment
- Future/deferred

## Validation

```bash
git diff --check
pnpm exec prettier --check docs/architecture/blueprint/sp-project-control-center/phase-3/wave-10/Wave_10_Workbook_Source_Mapping.md
md5 pnpm-lock.yaml
git status --short
```
