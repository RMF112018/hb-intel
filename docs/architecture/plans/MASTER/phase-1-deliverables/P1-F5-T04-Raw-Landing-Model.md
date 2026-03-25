# P1-F5-T04: Procore Raw Landing Model

## Raw Custody

- Azure owns raw custody for all Procore ingestion runs.
- Raw landing stores source payloads and extraction metadata for projects, commitments, budgets, prime contract context, change-control records, daily logs, inspections, punch items, and coordination issues.

## Raw Boundaries

- Land full structured record detail for the selected operational domains.
- Preserve project- and source-level identifiers for replay and reconciliation.
- Exclude binary artifact warehousing in `v1`.
