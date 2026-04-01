# Phase 4 — Provisioning Status and Saga Interaction Hardening — Implementation Plan

## Objective

Harden the provisioning execution-read boundary so the Project Setup system behaves like a reliable production asynchronous workflow. This phase focuses on the durable status contract, saga/runtime interaction, request-run-status correlation, realtime versus polling behavior, and terminal / failure / retry semantics as consumed by Accounting and Admin.

---

## Scope

### In scope

- Provisioning status contract hardening
- request / run / status correlation hardening
- SignalR negotiation, push, reconnect, and fallback review
- status endpoint source-of-truth enforcement
- terminal-state and failure-state consistency
- retry / escalation / reopen interaction review
- Accounting and Admin compatibility verification
- repo-doc reconciliation for the provisioning-status model

### Out of scope

- new business lifecycle semantics beyond Phase 1 / Phase 2 decisions
- major UI redesign of Accounting or Admin
- unrelated SharePoint provisioning step refactors unless required to support status correctness
- infrastructure rollout and tenant configuration work beyond code and docs needed for this phase

---

## Implementation sequence

### Stage 1 — Repo-truth audit

Prompt-01 establishes the current implementation truth for:
- saga launch flow
- status creation / updates
- request / run / status identifiers
- SignalR path
- polling path
- failure / retry transitions
- Accounting and Admin status consumption

### Stage 2 — Durable status contract and correlation hardening

Prompt-02 hardens the backend so:
- every launch produces or updates a canonical durable status resource
- correlation between request, provisioning run, and status resource is explicit
- status resource fields are sufficient for Accounting / Admin consumption
- launch response and status reads align with the hardened contract

### Stage 3 — Realtime and polling hardening

Prompt-03 hardens:
- SignalR negotiation and event semantics
- reconnect and stale-subscription behavior
- client-facing fallback logic
- status endpoint primacy over realtime updates

### Stage 4 — Failure, terminal state, and retry interaction hardening

Prompt-04 aligns:
- failed state handling
- completed / base-complete / pending follow-on work semantics
- retry, escalation, and terminal transitions
- post-failure and post-terminal status behavior

### Stage 5 — Surface compatibility verification

Prompt-05 validates that Accounting and Admin consume the hardened status model correctly without introducing boundary drift or duplicate ownership.

### Stage 6 — Final reconciliation and closure

Prompt-06 produces the final implementation and readiness report, reconciles all docs, and identifies remaining risks or blockers.

---

## Required repo areas

Expected focus areas include, as applicable:

```text
backend/functions/src/functions/provisioningSaga/*
backend/functions/src/functions/projectRequests/*
backend/functions/src/functions/signalr/*
backend/functions/src/functions/timerFullSpec/*
backend/functions/src/services/*
backend/functions/src/utils/*
packages/provisioning/src/*
apps/accounting/src/*
apps/admin/src/*
docs/architecture/reviews/*
docs/reference/provisioning/*
docs/maintenance/*
docs/architecture/blueprint/current-state-map.md
```

---

## Key success criteria

- Durable status resource is authoritative and consistent
- request / run / status correlation is explicit and documented
- SignalR is an enhancement layer; polling remains safe and authoritative
- terminal and failure states are deterministic
- retry / escalation interaction does not create contradictory state
- Accounting and Admin consume the same status truth correctly
- repo docs reflect the actual implementation

---

## Risks to watch

- duplicate or ambiguous status resources
- stale SignalR state overriding durable truth
- request state and provisioning status diverging
- failure / retry loops that do not preserve clear operator intent
- UI messaging that implies ownership or actions outside the correct app boundary
- documentation drifting from repo truth after implementation

---

## Required reporting standard

Each prompt should leave behind:
- repo-truth findings
- files changed
- rationale for each material decision
- explicit unresolved issues
- recommended follow-on work, if any

The final closure report must clearly state whether Phase 4 is:
- complete
- substantially complete with residual risks
- blocked
