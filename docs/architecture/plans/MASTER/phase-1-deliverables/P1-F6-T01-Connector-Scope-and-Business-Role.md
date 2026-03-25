# P1-F6-T01: Sage Intacct Connector Scope and Business Role

## Scope

- Sage Intacct is the Wave 1 financial backbone and project-accounting backbone.
- `v1` focuses on ingest-first financial and project-accounting data needed for governed published read models and cross-source reconciliation.

## Downstream Role

- The connector supports Project Hub financial-control consumers, reconciliation workflows, and governed operational reporting.
- It supplies finance-aligned publications without leaking raw ERP contracts into feature packages.

## Out of Scope

- No direct feature-package ERP reads.
- No writeback or bidirectional ERP mutation in `v1`.
