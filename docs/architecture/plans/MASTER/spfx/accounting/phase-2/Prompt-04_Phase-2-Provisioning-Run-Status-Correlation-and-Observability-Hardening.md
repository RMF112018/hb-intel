# Prompt-04 — Phase 2 Provisioning Run, Status Correlation, And Observability Hardening

## Objective

Audit and harden the backend’s durable run/status model so controller-launched provisioning is operationally intelligible, diagnosable, and safe to support in production.

## Preconditions

- Prompt-03 is complete
- backend launch semantics and validation rules are already frozen

## Working Rules

- Prefer durable truth over transient UI state.
- SignalR is enhancement, not authority.
- Do not re-read files already in active context unless needed to verify a contradiction or capture exact evidence.
- Keep the changes bounded to Project Setup lifecycle supportability.
- Start from the existing run/status/admin API surface before asking for net-new model work.

## Required Hardening Areas

### 1. Request / Run / Status Correlation

Ensure the backend can clearly answer:

- which provisioning run belongs to which request
- which status record belongs to which run
- what launch event created the run
- whether a retry / reopen / recovery event superseded a prior run

### 2. Launch Response Contract

Ensure the backend returns a stable and useful response when provisioning is launched, including where appropriate:

- request identity
- run reference
- correlation identity
- initial durable status reference

### 3. Durable Status Consistency

Ensure the durable status record consistently reflects:

- lifecycle / run state
- current step
- terminal state
- failure details
- timestamps
- correlation identifiers
- escalation / retry state where applicable

### 4. Operational Evidence And Diagnostics

Strengthen backend evidence for supportability, including:

- audit-friendly logging
- correlation IDs
- failure reason persistence
- explicit remaining observability gaps in the report and docs

## Primary Files Likely In Scope

```text
backend/functions/src/functions/provisioningSaga/index.ts
backend/functions/src/functions/provisioningSaga/saga-orchestrator.ts
backend/functions/src/functions/provisioningSaga/steps/*
backend/functions/src/functions/projectRequests/index.ts
backend/functions/src/services/table-storage-service.ts
backend/functions/src/utils/logger.ts
packages/models/src/provisioning/*
packages/provisioning/src/api-client.ts
docs/maintenance/provisioning-runbook.md
docs/reference/provisioning/saga-steps.md
docs/architecture/reviews/project-setup-accounting-phase-2-backend-lifecycle-hardening-report.md
```

Pay explicit attention to already-existing surfaces such as:

- `listProvisioningRuns`
- `archiveFailure`
- `acknowledgeEscalation`
- `forceStateTransition`
- existing durable status fields and correlation identifiers

## Required Deliverables

- backend correlation/status hardening changes
- updated tests or verification coverage for status/run behavior
- report updates describing:
  - request/run/status correlation model
  - current durable status authority
  - remaining observability gaps
  - any required downstream UI follow-up for Phase 3

## Verification

Run targeted checks:

```bash
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test || true
pnpm --filter @hbc/provisioning check-types
```

Inspect whether the current runbook still accurately reflects live behavior and classify any stale sections explicitly.

## Acceptance Criteria

- request/run/status relationships are explicit and durable
- launch response contract is clear enough for the Accounting app
- durable status remains the source of truth
- the report documents both the resulting operational model and any remaining gaps honestly
