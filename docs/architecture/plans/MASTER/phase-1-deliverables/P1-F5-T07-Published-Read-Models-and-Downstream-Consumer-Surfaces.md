# P1-F5-T07: Procore Published Read Models and Downstream Consumer Surfaces

## Published Read Models

- Project financial-control snapshot
- Commitment and budget variance views
- Prime contract and change-control timeline views
- Daily field-operations, inspections, punch-list, and coordination issue views

## Consumer Boundary

- Published read models are consumed through governed repositories and `@hbc/query-hooks`.
- PWA source modules and feature packages must not call Procore directly.
