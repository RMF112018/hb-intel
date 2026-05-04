# Prompt 13D — Backend Mock Adapter Boundary and Read-Model Seams

## Objective

Add backend mock-only Procore data-layer provider boundaries and GET-only read-model seams.

## Required Work

1. Add provider interfaces and mock provider methods for Procore mapping, sync health, and signals.
2. Add GET-only read-model route(s) if required by the architecture.
3. Return deterministic envelopes from model fixtures.
4. Add tests for available/source-unavailable/backend-unavailable branches.
5. Extend route/no-runtime guardrails.

## Forbidden

No live Procore calls, no SDK, no fetch/axios to external systems, no POST/PUT/PATCH/DELETE, no timers/queues unless inert/documented.

## Validation

Run @hbc/functions check-types/test and lockfile MD5 proof.
