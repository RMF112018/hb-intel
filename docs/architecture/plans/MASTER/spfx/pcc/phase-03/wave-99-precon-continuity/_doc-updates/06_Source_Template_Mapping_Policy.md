# 06 — Source Template Mapping Policy

## Purpose

Define how Go / No-Go and Estimating Kickoff source templates are mapped into the unified lifecycle architecture without becoming workbook clones.

## Template Treatment

Source templates are:

- field inventory;
- evidence and lineage sources;
- seed taxonomy;
- historical context;
- fixture scenario sources;
- source mapping references.

Source templates are not:

- target UX contracts;
- runtime schema by themselves;
- source-of-record replacement;
- permission model replacement;
- authorization to expose sensitive comments;
- evidence-binary storage plans;
- workbook-mutation instructions.

## Required Mapping Metadata Per Source Field

Every mapped field must declare:

- source template path;
- source workbook/PDF/sheet/page;
- source row/column/cell/section where possible;
- source label;
- target record family;
- target field name;
- source owner;
- PCC ownership posture: source-owned, PCC-native, or PCC-derived;
- mutability;
- visibility classification;
- redaction level;
- HBI readability;
- Project Memory eligibility;
- traceability edge eligibility;
- Priority Action eligibility;
- audit requirement;
- notes.

## Required Record Mapping Families

| Source Template Area | Target Unified Lifecycle Use |
|---|---|
| Go / No-Go decision result | lifecycle event + carry-forward snapshot |
| committee score / band | source-lineage-backed Project Memory summary, restricted where sensitive |
| executive override | restricted memory + audit event + executive lens visibility |
| win strategy / differentiators | Project Memory and future-reference knowledge with redaction |
| client / market / pursuit rationale | Project Memory with role-stage lens filtering |
| risk and staffing assumptions | readiness signals + Project Memory + traceability candidates |
| proposal / marketing / estimating deliverables | Estimating Kickoff deliverables and readiness signals |
| kickoff dates / deadlines | lifecycle events and priority-action candidates |
| owner assignments | workflow responsibility only, not HR staffing commitment |
| handoff package status | readiness signal and checkpoint seam |
| evidence file references | Document Control evidence links only |

## HBI Eligibility

A mapped source field is HBI-readable only when:

1. the user has project access;
2. the user has source/system access or the PCC projection is classification-approved;
3. the field is not privileged/restricted beyond the user's persona;
4. the field has source lineage;
5. the field is not stale beyond its declared use;
6. the answer can include citation metadata or safely refuse.

## Cross-Project Reuse

Closed-project future-reference use is allowed only when:

- reuse classification is approved;
- sensitive pursuit/client/margin/executive content is redacted;
- source lineage is preserved;
- HBI output is citation-grounded or refuses;
- the user's lens permits cross-project reference.

## Extraction Rules

- Use `openpyxl` for workbook extraction.
- Do not unprotect workbooks.
- Do not overwrite source files.
- Use PDF visual review for layout only where required.
- Preserve exact source row/cell/page references in mapping JSON where possible.
- If source truth cannot be extracted safely, mark the field as `unverified-source-mapping` and stop before inventing values.
