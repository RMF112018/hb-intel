# P1-F5-T08: Procore Observability, Replay, Reconciliation, Dead-Letter, and Operator Tooling

## Operator Requirements

- Track run ledgers by project scope, extraction window, and domain slice.
- Record replayable raw custody pointers and normalized-to-published reconciliation counts.
- Provide dead-letter handling for malformed or unsupported payloads without losing replay context.

## Recovery Model

- Operators must be able to replay by project, domain family, and historical window while preserving audit history.
