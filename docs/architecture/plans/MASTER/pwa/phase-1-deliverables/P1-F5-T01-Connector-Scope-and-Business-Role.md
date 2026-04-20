# P1-F5-T01: Procore Connector Scope and Business Role

## Scope

- Procore is the Wave 1 project-operational and financial-control backbone.
- `v1` scope is active projects plus 48 months historical coverage.
- Selected structured domains are commitments, budget, prime contract context, change events and change-order context, daily log, inspections, punch list, and coordination issues.

## Downstream Role

- This connector supplies published read models for Project Hub controls, project-operational status, and cross-source reconciliation.
- It does not bypass the `@hbc/query-hooks` and governed repository boundary.

## Out of Scope

- No binary artifact warehousing in `v1`.
- No writeback or direct feature-package connector consumption.
