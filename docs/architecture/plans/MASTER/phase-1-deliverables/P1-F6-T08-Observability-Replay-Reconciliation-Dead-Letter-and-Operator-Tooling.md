# P1-F6-T08: Sage Intacct Observability, Replay, Reconciliation, Dead-Letter, and Operator Tooling

## Operator Requirements

- Track finance ingestion runs, scope windows, and normalized-to-published reconciliation counts.
- Maintain replay references to raw payload sets and mapping versions used in each publication round.
- Dead-letter unexpected contract drift without dropping accounting provenance.

## Recovery Model

- Operators must be able to replay by accounting window, publication set, and project scope while preserving audit history.
