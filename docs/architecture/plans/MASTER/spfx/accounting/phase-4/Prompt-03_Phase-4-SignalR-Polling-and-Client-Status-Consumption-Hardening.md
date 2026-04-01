# Prompt-03 — Phase 4 SignalR, Polling, and Client Status Consumption Hardening

## Objective

Harden the realtime and polling interaction model so SignalR acts as an enhancement layer while the durable status endpoint remains the authoritative source of truth.

Use the Phase 4 audit and the hardened status contract from Prompt-02.

## Working Rules

- Treat the live repo as the authority.
- Do not re-read files that are still within your current context or memory unless needed to verify a contradiction, retrieve exact evidence, or inspect newly changed content.
- Prefer targeted, minimal edits unless broader restructuring is required by the prompt.
- Preserve package and app boundaries unless the prompt explicitly directs otherwise.
- Be explicit about repo fact vs inference vs unresolved issue.
- Do not silently change business semantics established in earlier phases. If you detect a contradiction, document it and resolve it deliberately.
- Do not treat Accounting as the primary direct SignalR/status client unless repo truth proves otherwise.

## Implementation Goals

Using the Phase 4 audit and the hardened status contract from Prompt-02, ensure that:

- SignalR event flow does not become the sole source of truth
- the status endpoint remains authoritative
- client stores merge realtime updates safely against durable reads
- reconnect and stale-subscription behavior are sane
- terminal-state behavior suppresses or closes unnecessary realtime activity where appropriate
- direct clients do not infer provisioning truth incorrectly from transient events
- indirect surfaces remain compatible with the adopted status model

## Required Work

Review and harden, as applicable:

### Backend realtime path
- negotiate route behavior
- project-group and admin-group semantics
- event payload shape
- terminal-state cleanup behavior
- push-service error handling

### Client consumption path
- `useProvisioningSignalR`
- provisioning store merge logic
- requester/PWA progress view baseline-versus-overlay rules
- fallback polling behavior
- stale-event handling
- terminal-state handling

### Documentation
- update package docs and inline comments as needed to explain authoritative status precedence

## Required Files and Areas

- `backend/functions/src/functions/signalr/index.ts`
- `backend/functions/src/services/signalr-push-service.ts`
- `packages/provisioning/src/hooks/useProvisioningSignalR.ts`
- `packages/provisioning/src/store.ts`
- `apps/pwa/src/routes/provisioning/ProvisioningProgressView.tsx`
- `apps/pwa/src/hooks/provisioning/useProvisioningApi.ts`
- any surface docs or reference docs materially affected

## Deliverables

1. Implement the required code changes.
2. Update docs as needed.
3. Write an implementation report at:

`docs/architecture/reviews/phase-4-signalr-polling-and-client-status-hardening-report.md`

## Verification

Provide evidence for:

- SignalR negotiate path
- SignalR connected path
- fallback polling path
- reconnect behavior
- stale-subscription or stale-event handling
- terminal-state handling
- requester/PWA direct-client compatibility
- preserved authoritative status precedence

## Additional Hard Requirement

Your final report must explicitly state:

- which consumer currently treats API status as baseline
- what realtime data is allowed to override
- what realtime data is **not** allowed to override
- how terminal states affect connection and refresh behavior

## Completion Standard

This prompt is complete only when the repo has one coherent explanation of how realtime updates, store merge rules, and authoritative status reads interact in practice.
