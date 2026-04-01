# Prompt-02 — Phase 4 Durable Status Contract and Run Correlation Hardening

## Objective

Implement the canonical durable **run-status** contract and make request / run / status correlation explicit, stable, and documented.

Use the Prompt-01 audit findings as the source of truth.

This prompt must harden the current repo model rather than force a different storage architecture without evidence.

## Working Rules

- Treat the live repo as the authority.
- Do not re-read files that are still within your current context or memory unless needed to verify a contradiction, retrieve exact evidence, or inspect newly changed content.
- Prefer targeted, minimal edits unless broader restructuring is required by the prompt.
- Preserve package and app boundaries unless the prompt explicitly directs otherwise.
- Be explicit about repo fact vs inference vs unresolved issue.
- Do not silently change business semantics established in earlier phases. If you detect a contradiction, document it and resolve it deliberately.
- Do not assume Phase 4 requires collapsing per-run persistence into a single project row unless the audit proves that is the correct remedy.

## Implementation Goals

Using the Prompt-01 audit findings, harden the backend and shared contracts so that:

- the durable provisioning-status model is explicit and stable
- project identity, run identity, and status identity are explicitly correlated
- the adopted read model is explicit and documented
- launch responses and later reads align with the same contract
- status field semantics are documented and consistent
- admin and client consumers can rely on the same contract language

## Required Work

- review and harden the backend status shape
- review and harden the table-storage persistence model
- explicitly document whether the repo truth remains:
  - per-run durable rows plus latest-run project reads
  - or a deliberately changed model
- eliminate ambiguous or duplicated correlation fields where repo evidence supports doing so
- ensure launch and retry paths preserve clear run references
- ensure status upserts preserve stable identity semantics
- update package-level status types and client contracts as needed
- update docs to reflect the final adopted model

## Required Files and Areas

- `packages/models/src/provisioning/IProvisioning.ts`
- `packages/provisioning/src/api-client.ts`
- `packages/provisioning/src/store.ts`
- `backend/functions/src/services/table-storage-service.ts`
- `backend/functions/src/functions/provisioningSaga/index.ts`
- `backend/functions/src/functions/provisioningSaga/saga-orchestrator.ts`
- any related tests or docs identified by Prompt-01

## Deliverables

1. Implement the required code changes.
2. Update or create the appropriate reference docs under:

```text
docs/reference/provisioning/
docs/reference/models/
docs/explanation/
docs/maintenance/
docs/architecture/blueprint/current-state-map.md
```

3. Write an implementation report at:

`docs/architecture/reviews/phase-4-durable-status-contract-and-run-correlation-report.md`

## The Report Must Include

- adopted physical persistence model
- adopted logical project-read model
- correlation field table
- launch / retry / latest-read semantics
- status contract changes
- package/client alignment changes
- doc updates
- unresolved residual risks

## Verification

Include concrete verification evidence for:

- launch path
- retry path
- durable status creation
- per-run persistence or deliberate replacement thereof
- latest-run read behavior
- correlation fields
- package/client type alignment
- doc updates

## Completion Standard

This prompt is complete only when the repo contains one explicit, evidence-backed answer to:

> What durable status entities exist, what run identity they represent, and what canonical project-level status read model consumers should rely on.
