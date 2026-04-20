# P1-F5-T05: Procore Normalized Source-Aligned Model

## Normalized Source-Aligned Records

- Normalize Procore records into source-aligned project, financial-control, change-control, field-operations, inspection, quality, and issue record families.
- Keep source semantics visible instead of collapsing everything into a single canonical project object.
- Maintain source keys, extraction windows, and replay markers needed to rebuild downstream publications.

## Transition Rule

- Normalization feeds the thin canonical core but remains independently queryable for reconciliation and audit.
