# P1-F6-T04: Sage Intacct Raw Landing Model

## Raw Custody

- Azure owns raw custody for Sage Intacct financial and project-accounting ingestion runs.
- Raw landing stores source payloads, extraction metadata, and authoritative finance-source identifiers required for replay, audit, and reconciliation.

## Raw Boundaries

- Land financial and project-accounting source records only as needed for governed publication and cross-source matching.
- Preserve source payload fidelity so later contract capture can be replayed without schema invention.
