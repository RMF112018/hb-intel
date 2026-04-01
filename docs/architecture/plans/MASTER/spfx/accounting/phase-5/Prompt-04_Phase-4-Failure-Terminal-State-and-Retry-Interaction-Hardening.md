# Prompt-04 — Phase 4 Failure, Terminal State, and Retry Interaction Hardening

## Objective

Make failure, terminal state, retry, and escalation interactions coherent across the provisioning status model, request lifecycle, and operator surfaces.

## Working rules

- Treat the live repo as the authority.
- Do not re-read files that are still within your current context or memory unless needed to verify a contradiction, retrieve exact evidence, or inspect newly changed content.
- Prefer targeted, minimal edits unless broader restructuring is required by the prompt.
- Preserve package and app boundaries unless the prompt explicitly directs otherwise.
- Be explicit about repo fact vs inference vs unresolved issue.
- Do not silently change business semantics established in earlier phases. If you detect a contradiction, document it and resolve it deliberately.


## Implementation goals

Using the earlier Phase 4 findings, harden the system so that:

- failure states are explicit and non-ambiguous
- terminal states are deterministic
- retry behavior does not create contradictory run or status state
- escalation markers are compatible with the durable status model
- request lifecycle and provisioning status do not drift apart after failure or completion

## Required work

- review failure-state semantics
- review completed / base-complete / web-parts-pending / deferred-follow-on semantics if applicable
- review retry and escalation state behavior
- review request reopening or recovery interaction where relevant
- update docs and operational runbook material accordingly

## Deliverables

1. Implement the required code changes.
2. Update the relevant docs and runbooks.
3. Write an implementation report at:

`docs/architecture/reviews/phase-4-failure-terminal-and-retry-interaction-report.md`

## Verification

Provide evidence for:
- failure transition behavior
- retry behavior
- escalation behavior
- terminal-state behavior
- request / status consistency after each
