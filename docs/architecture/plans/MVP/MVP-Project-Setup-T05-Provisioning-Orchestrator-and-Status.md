# MVP-Project-Setup-T05 — Provisioning Orchestrator and Durable Status

**Phase Reference:** MVP Project Setup Master Plan  
**Spec Source:** `MVP-Project-Setup.md` + MVP Blueprint + MVP Roadmap  
**Decisions Applied:** D-05, D-06, D-08, D-10 through D-12 + R-01 through R-05, R-08  
**Estimated Effort:** 1.2 sprint-weeks  
**Depends On:** T02, T03  
> **Doc Classification:** Canonical Normative Plan — saga/status task; sub-plan of `MVP-Project-Setup-Plan.md`.

---

## Objective

Harden the provisioning engine so it behaves like a reliable asynchronous workflow: idempotent steps, durable status, SignalR push, polling fallback, bounded retries, and throttling-safe execution.

---

## Required Paths

```text
backend/functions/src/functions/provisioningSaga/*
backend/functions/src/functions/projectRequests/*
backend/functions/src/functions/signalr/*
backend/functions/src/functions/timerFullSpec/*
packages/provisioning/src/api-client.ts
packages/provisioning/src/store/*
packages/provisioning/src/hooks/*
packages/models/src/provisioning/*
```

---

## Async Workflow Contract

### Start behavior

- trigger endpoint validates request synchronously
- immediately creates or updates a durable status record
- returns a request/run reference quickly
- never holds the UI connection open for full provisioning completion

### Status behavior

Provide:

- live SignalR push for real-time updates
- durable status endpoint for polling
- stable step count / current step / overall run state
- last successful step
- retry eligibility
- escalation state
- site URL when available

SignalR is an enhancement layer; the status endpoint is the durable truth.

---

## Idempotency Requirements

Each saga step must verify whether its target artifact already exists before create/update operations when feasible.

Examples:

- site already created
- library already exists
- list already exists
- hub association already present
- permission assignment already present
- getting-started page already provisioned
- deferred full-spec step already completed

If an artifact already exists in the expected state, the step should record an idempotent skip or successful no-op rather than fail.

---

## Retry / Backoff Rules

- first failure creates a retry-available state for business retry
- second failure marks the run escalated to Admin
- transient Graph/SharePoint throttling must honor `Retry-After`
- bounded exponential backoff is required where headers are absent but the failure is transient
- noncritical heavy work may remain in the deferred timer path
- retry-from-admin should resume from the last safe checkpoint, not restart completed steps by default

---

## Throttling and Concurrency Rules

- bound concurrency for write-heavy operations
- avoid request spikes against SharePoint / Graph
- prefer Microsoft Graph for operations where equivalent behavior exists and is supported
- isolate deferred/noncritical page/web-part work from the immediate base-site success path
- decorate traffic and log correlation IDs for supportability

---

## SignalR / Poll Fallback Rules

- per-project SignalR groups remain the real-time scope model
- admin group receives all project events
- negotiate tokens are short-lived and must be re-negotiated on reconnect
- polling fallback must continue to work when SignalR fails, is blocked, or has stale group membership
- terminal states close live subscriptions cleanly

---

## Verification Commands

```bash
pnpm --filter @hbc/functions test -- provisioningSaga
pnpm --filter @hbc/functions test -- signalr
pnpm --filter @hbc/provisioning test -- api-client
pnpm --filter @hbc/provisioning test -- store
rg -n "Retry-After|idempotent|DeferredToTimer|poll|SignalR|retryCount|lastSuccessfulStep" backend/functions packages/provisioning packages/models
```
