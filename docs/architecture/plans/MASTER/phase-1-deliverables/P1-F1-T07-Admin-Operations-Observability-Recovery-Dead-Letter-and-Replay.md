# P1-F1-T07: Admin Operations, Observability, Recovery, Dead-Letter, and Replay

## 1. Operator Model

The native integration backbone requires explicit operator workflows. At minimum, future implementation must support operator visibility into:

- run status,
- recent failures,
- replay eligibility,
- dead-letter counts,
- publication lag,
- reconciliation backlog,
- connector configuration state.

## 2. Observability Expectations

The family locks the need for observability across:

- acquisition triggers,
- processing runs,
- normalization and mapping stages,
- publication stages,
- replay and recovery actions,
- connector failure modes.

Current backend observability seams are useful inputs, but they do not yet satisfy the full target integration-operations model.

## 3. Dead-Letter Handling

Dead-letter handling is required for:

- irrecoverable ingest payloads,
- repeated mapping failures,
- publication failures after retry,
- operator-required review items.

Dead-letter is not a silent discard path. It is an operator workflow and audit concern.

## 4. Replay and Recovery

Replay must support:

- batch rerun by connector or time window,
- selective record republish,
- post-fix normalization rerun,
- post-fix mapping rerun,
- failure recovery without manual re-entry.

## 5. Run Ledgers and Audit Ledgers

The family requires run-level and audit-level visibility so operators can answer:

- what ran,
- what failed,
- what published,
- what replayed,
- what remains unresolved,
- who triggered or approved the recovery action.

## 6. Failure Classification

Failure handling should distinguish:

- source availability failure,
- auth/secret failure,
- transport failure,
- normalization failure,
- mapping/reconciliation failure,
- publication failure,
- operator-policy failure.

## 7. Escalation Boundary

Operator surfaces should absorb recoverable failure handling before failures leak into downstream user-facing experiences. Downstream consumers should receive stable published read models, not connector-runtime fault details.
