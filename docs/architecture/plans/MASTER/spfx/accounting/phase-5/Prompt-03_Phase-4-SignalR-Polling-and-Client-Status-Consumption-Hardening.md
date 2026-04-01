# Prompt-03 — Phase 4 SignalR, Polling, and Client Status Consumption Hardening

## Objective

Harden the realtime and polling interaction model so SignalR acts as an enhancement layer while the status endpoint remains the authoritative source of truth.

## Working rules

- Treat the live repo as the authority.
- Do not re-read files that are still within your current context or memory unless needed to verify a contradiction, retrieve exact evidence, or inspect newly changed content.
- Prefer targeted, minimal edits unless broader restructuring is required by the prompt.
- Preserve package and app boundaries unless the prompt explicitly directs otherwise.
- Be explicit about repo fact vs inference vs unresolved issue.
- Do not silently change business semantics established in earlier phases. If you detect a contradiction, document it and resolve it deliberately.


## Implementation goals

Using the Phase 4 audit and the hardened status contract from Prompt-02, ensure that:

- SignalR event flow does not become the sole source of truth
- client stores merge realtime updates safely
- reconnect and stale-subscription behavior are sane
- polling fallback remains viable and authoritative
- terminal-state behavior closes or suppresses unnecessary realtime activity
- Accounting and Admin status consumers do not infer state incorrectly from transient events

## Required work

- review SignalR negotiate and subscription flow
- review event publication semantics and event payload shape
- review client-side status consumption / store merge rules
- harden fallback behavior where needed
- update package docs and any inline contract comments needed to explain authoritative status precedence

## Deliverables

1. Implement the required code changes.
2. Update docs as needed.
3. Write an implementation report at:

`docs/architecture/reviews/phase-4-signalr-polling-and-client-status-hardening-report.md`

## Verification

Provide evidence for:
- SignalR connected path
- fallback path
- reconnect or stale subscription handling
- terminal-state handling
- Accounting/Admin client compatibility
