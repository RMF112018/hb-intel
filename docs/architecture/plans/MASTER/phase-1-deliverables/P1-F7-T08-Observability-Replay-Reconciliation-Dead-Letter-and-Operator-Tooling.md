# P1-F7-T08: BambooHR Observability, Replay, Reconciliation, Dead-Letter, and Operator Tooling

## Operator Requirements

- Track directory sync runs, employee-detail refresh runs, and webhook delivery outcomes.
- Preserve replay references for both batch pulls and webhook-assisted refreshes.
- Reconcile source employee counts, masked publication counts, and identity-map outcomes.

## Recovery Model

- Operators must be able to replay by company domain, employee scope, and time window without losing provenance or masking controls.
