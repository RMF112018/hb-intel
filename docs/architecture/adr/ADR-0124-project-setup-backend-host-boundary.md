# ADR 0124: Per-Domain Backend Function App Hosts

**Status:** Accepted
**Date:** 2026-03-31
**Deciders:** HB Intel Architecture Team
**Phase:** Phase 1 Remediation — Backend Scope
**Amends:** ADR-0009 (extends deployment topology; does not replace runtime decision)

## Context

ADR-0009 established Azure Functions v4 (Node.js, ESM) as the backend runtime and defined the programming model, service layer pattern, and saga orchestrator. It did not address deployment topology — specifically whether all domains should co-deploy in a single Function App or whether each domain should have its own host.

The current repository has one monolithic Function App host at `backend/functions/src/index.ts` that registers 19 route families across unrelated domains (project requests, provisioning saga, leads, projects, estimating, schedule, buyout, compliance, contracts, risk, scorecards, PMP, and supporting infrastructure). The service factory at `backend/functions/src/services/service-factory.ts` maintains a single container with 9 eagerly initialized services and 10 lazily initialized domain CRUD services.

The Phase 1-5 audit report (`docs/architecture/reviews/project-setup-phase-1-through-5-implementation-and-gap-report.md`) identified this monolithic posture as a Phase 1 launch blocker:

> The package is not truly isolated end-to-end. The frontend surface is isolated, but the backend still registers many unrelated domain routes and services.

The Prioritized Remediation List item 4 called for a decision on the real backend deployment boundary.

## Decision

Adopt **per-domain Azure Function App hosts** backed by **shared monorepo backend libraries**.

Project Setup / Estimating is the first domain host. The current monolithic host is treated as **transitional** and is preserved during migration.

### Shared across all domain hosts (consumed via monorepo imports)

| Category | Examples |
|----------|---------|
| Types and models | `@hbc/models`, `@hbc/acknowledgment`, `@hbc/notification-intelligence`, `@hbc/provisioning` |
| Middleware | `auth.ts`, `validateToken.ts`, `request-id.ts`, `validate.ts` |
| Utilities | `logger.ts`, `response-helpers.ts`, `retry.ts`, `withTelemetry.ts`, `validate-config.ts`, `adapter-mode-guard.ts`, `env.ts`, `table-client-factory.ts`, `diagnose-permissions.ts` |
| Service adapters | `sharepoint-service.ts`, `table-storage-service.ts`, `signalr-push-service.ts`, `managed-identity-token-service.ts`, `graph-service.ts`, `projects-list-contract.ts`, `projects-list-mapper.ts` |
| Domain logic | `state-machine.ts`, saga orchestrator, saga steps, timer handler |
| Validation | Schemas, types, and config validation patterns |

### Separated per domain host

| Concern | Rationale |
|---------|-----------|
| Composition root (`index.ts`) | Only in-scope route imports; no accidental domain leakage |
| Scoped service factory | Only the services the domain needs; auditable dependency surface |
| `host.json` | Domain-specific CORS, timeout, extension bindings |
| App settings / env vars | Domain-specific managed identity, downstream permissions, config validation |
| Health probe | Domain-scoped operational readiness |
| Deployment | Dedicated Azure Function App resource, release gates, smoke tests, runbook |

### Project Setup host scope

The Project Setup domain host carries these 8 route families:

1. `projectRequests` — 4 HTTP functions (submit, list, get, advanceState)
2. `provisioningSaga` — 10 HTTP functions (provision, status, failures, triggerTimer, retry, escalate, runs, archive, ack, forceState)
3. `timerFullSpec` — 1 timer (deferred provisioning step 5)
4. `signalr` — 1 HTTP function (negotiate)
5. `acknowledgments` — 2 HTTP functions (post, get)
6. `notifications` — 7 HTTP + 1 timer + queue functions (send, center, read, dismiss, markAllRead, preferences, digest)
7. `health` — 1 HTTP function
8. `cleanupIdempotency` — 1 timer

### Out of Project Setup scope

These route families remain in the legacy monolithic host until their own domain hosts are created:

- `leads`, `projects`, `estimating`, `schedule`, `buyout`, `compliance`, `contracts`, `risk`, `scorecards`, `pmp` (10 domain CRUD families)
- `proxy` (stub; disposition per gap report item 8)

## Transitional Model

- The existing monolithic host at `backend/functions/src/index.ts` is **not modified** in this phase.
- The Project Setup host is **additive** — a new composition root alongside the existing one.
- Both hosts may coexist during deployment transition. They are separate Azure Function App resources with different hostnames.
- The monolithic host continues serving all routes until the Project Setup host is validated in staging.
- No route conflicts arise because each host is its own Azure resource.
- Once the Project Setup host is validated, the monolithic host can be decomposed domain by domain following this same pattern.

## Consequences

- Each domain team controls its own deployment cadence, CORS policy, managed identity grants, and release gates.
- Shared code stays centralized in the monorepo; no duplication of middleware, adapters, or models.
- The monolithic host becomes a legacy artifact to be decomposed incrementally.
- Future domain hosts (Leads, Projects, Estimating CRUD, etc.) follow this same pattern.
- The `hosts/` directory convention under `backend/functions/src/` establishes a repeatable extraction pattern.
- Config validation at startup can be scoped to only the env vars the domain actually requires, reducing false-negative startup failures.

## References

- ADR-0009: Azure Functions v4 Backend (runtime and programming model)
- Phase 1-5 audit report: `docs/architecture/reviews/project-setup-phase-1-through-5-implementation-and-gap-report.md`
- Boundary freeze plan: `docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-1/Phase-1_Backend-Boundary-Freeze.md`
