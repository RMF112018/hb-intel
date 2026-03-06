# ADR 0009: Azure Functions v4 Backend

**Status:** Accepted
**Date:** 2026-03-03
**Deciders:** HB Intel Architecture Team
**Phase:** 7.0 — Backend/Functions

## Context

The HB Intel PWA (Phase 4) and SPFx webparts (Phase 5) require a secure backend proxy for SharePoint/Graph API operations, a provisioning saga orchestrator for project site creation, and a real-time update layer for the Estimating and Admin pages. A serverless approach minimizes operational overhead and aligns with the existing Azure ecosystem.

## Decision

We adopt **Azure Functions v4 (Node.js, ESM)** as the backend runtime with the following architecture:

1. **Programming model:** Azure Functions v4 `app.http()` / `app.timer()` registration (no `function.json` files)
2. **Build tool:** `tsc` only — Azure Functions does not need bundling; compiles to `dist/`
3. **Service layer:** Ports/adapters pattern with mock implementations behind `HBC_SERVICE_MODE` env var (`mock` for dev, `azure` for production)
4. **Dependency scope:** Backend depends only on `@hbc/models` — no other `@hbc/*` packages (separate Node.js runtime, not browser)
5. **Provisioning saga:** 7-step orchestrator with compensation (rollback), bifurcation (step 5 deferred to 1:00 AM EST timer), retry, and escalation
6. **Proxy layer:** Generic cache-through proxy with MSAL on-behalf-of token acquisition, Redis caching, and throttling support
7. **Real-time updates:** SignalR push for provisioning progress events

## Alternatives Considered

| Option | Pros | Cons |
|---|---|---|
| Azure App Service | Full server, WebSocket native | Higher cost, more ops overhead |
| AWS Lambda | Mature serverless | Different cloud ecosystem, additional auth complexity |
| Durable Functions | Built-in saga support | Additional complexity, proprietary orchestration |

We chose vanilla Azure Functions because the saga logic is simple enough (7 steps) to implement directly, avoiding Durable Functions lock-in while maintaining full control over compensation and retry logic.

## Consequences

- Backend compiles as part of Turborepo pipeline (21 tasks total)
- Mock-first development enables frontend teams to work without Azure dependencies
- Service factory pattern allows incremental swap to real Azure implementations
- Timer function handles deferred web part provisioning without additional infrastructure
- SignalR negotiate endpoint enables future real-time push to PWA/SPFx clients

## Technical Details

### tsconfig Overrides
The backend uses `module: "Node16"`, `moduleResolution: "Node16"`, no DOM lib, and `types: ["node"]` — diverging from the browser-oriented base config.

### Saga Step Execution Order
Immediate: 1 (site) → 2 (doc library) → 3 (templates) → 4 (data lists) → 6 (permissions) → 7 (hub association)
Deferred: 5 (web parts) — executed by 1:00 AM EST timer

### Compensation Strategy
On failure at step N, rollback proceeds from `lastSuccessfulStep` down to step 1 in reverse order. Step 1 compensation (site deletion) cascades removal of libraries, files, and lists. Step 7 compensation (hub disassociation) is independent.
