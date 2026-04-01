# Prompt-02 — Phase 4 Durable Status Contract and Run Correlation Hardening

## Objective

Implement the canonical durable provisioning status contract and make request / run / status correlation explicit, stable, and documented.

## Working rules

- Treat the live repo as the authority.
- Do not re-read files that are still within your current context or memory unless needed to verify a contradiction, retrieve exact evidence, or inspect newly changed content.
- Prefer targeted, minimal edits unless broader restructuring is required by the prompt.
- Preserve package and app boundaries unless the prompt explicitly directs otherwise.
- Be explicit about repo fact vs inference vs unresolved issue.
- Do not silently change business semantics established in earlier phases. If you detect a contradiction, document it and resolve it deliberately.


## Implementation goals

Using the Prompt-01 audit findings, harden the backend so that:

- the launch event creates or updates a single canonical durable status resource
- request identity, run identity, and status identity are explicitly correlated
- the status contract is sufficient for Accounting and Admin consumption
- launch responses and later reads align with the same model
- status resource field semantics are documented and consistent

## Required work

- review and harden the backend status shape
- eliminate ambiguous or duplicated correlation fields
- ensure the launch path preserves clear run references
- ensure status upserts preserve stable identity semantics
- update any package-level status types and client contracts needed to reflect the hardened truth
- update docs to reflect the final contract

## Deliverables

1. Implement the required code changes.
2. Update or create the appropriate reference docs under:

```text
docs/reference/provisioning/
docs/maintenance/
docs/architecture/blueprint/current-state-map.md
```

3. Write an implementation report at:

`docs/architecture/reviews/phase-4-durable-status-contract-and-run-correlation-report.md`

## Verification

Include concrete verification evidence for:
- launch path
- durable status creation
- correlation fields
- package/client type alignment
- doc updates
