# Phase 4 — Provisioning Status and Saga Interaction Hardening

## Objective

Complete Phase 4 of the Accounting-side Project Setup production-readiness program by hardening the provisioning status model and the interaction boundary between the request lifecycle, the saga runtime, durable status storage, SignalR updates, polling fallback, and Accounting-facing status consumption.

This phase assumes:
- Phase 1 — Workflow Contract and Boundary Freeze is complete
- Phase 2 — Backend Lifecycle Hardening is complete
- Phase 3 — Accounting App Functional Completion is complete

## Phase Outcome

At the end of this phase, the provisioning system should behave like a production-grade asynchronous workflow surface for Accounting and Admin consumers:

- the launch event produces a durable, queryable status resource
- request, run, and status correlation is explicit and stable
- the status endpoint is the source of truth
- SignalR behaves as an enhancement layer, not a dependency
- terminal and failure states are deterministic
- retries, escalations, and post-launch state transitions are coherent
- Accounting consumes status safely and predictably without owning recovery logic

## Deliverables in this package

- `Phase-4_Provisioning-Status-and-Saga-Interaction-Hardening_Implementation-Plan.md`
- `Prompt-01_Phase-4-Repo-Truth-Provisioning-Status-and-Saga-Audit.md`
- `Prompt-02_Phase-4-Durable-Status-Contract-and-Run-Correlation-Hardening.md`
- `Prompt-03_Phase-4-SignalR-Polling-and-Client-Status-Consumption-Hardening.md`
- `Prompt-04_Phase-4-Failure-Terminal-State-and-Retry-Interaction-Hardening.md`
- `Prompt-05_Phase-4-Accounting-and-Admin-Status-Workflow-Compatibility-Verification.md`
- `Prompt-06_Phase-4-Final-Documentation-Reconciliation-and-Readiness-Report.md`

## Execution order

Run the prompts in numeric order.

1. Prompt-01
2. Prompt-02
3. Prompt-03
4. Prompt-04
5. Prompt-05
6. Prompt-06

Do not skip ahead. Later prompts assume the repo truth, contract decisions, and documentation updates from earlier prompts are already complete.

## Global instructions for the local code agent

- Treat the live repo as the sole implementation authority.
- Do not rely on stale plan assumptions when the code says otherwise.
- Do not re-read files that are still within your current context or memory unless needed to verify a contradiction, retrieve exact evidence, or inspect newly changed content.
- Prefer minimal, well-scoped changes over broad refactors unless the prompt explicitly requires broader restructuring.
- Preserve existing package boundaries unless the prompt explicitly directs a boundary change.
- Update docs as part of the implementation, not as a separate afterthought.
- Record unresolved issues explicitly rather than silently working around them.
- When reporting findings, distinguish clearly between:
  - confirmed repo fact
  - confirmed repo-doc intent
  - inferred conclusion
  - unresolved issue

## Recommended output location for reports

Unless a prompt says otherwise, write audit and closure reports to:

`docs/architecture/reviews/`

## Suggested branch discipline

Use a dedicated Phase 4 branch or stacked branch sequence if you want clean review boundaries between:
- audit / contract work
- backend status hardening
- realtime / polling hardening
- failure / retry interaction hardening
- final documentation reconciliation

## Completion standard

Phase 4 is complete only when:
- durable status truth is explicit and stable
- Accounting and Admin can consume status without ambiguity
- realtime updates degrade safely
- failure and terminal states are coherent
- request / run / status correlation is documented and evidenced
- final docs reflect repo truth
