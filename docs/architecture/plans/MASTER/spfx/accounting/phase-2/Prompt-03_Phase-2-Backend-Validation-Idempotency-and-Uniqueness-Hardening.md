# Prompt-03 — Phase 2 Backend Validation, Idempotency, And Uniqueness Hardening

## Objective

Harden all server-side business controls required for safe controller workflow execution, with special emphasis on project-number rules, idempotency, and duplicate-run prevention.

## Preconditions

- Prompt-02 is complete
- the canonical lifecycle / launch contract is frozen

## Working Rules

- Backend validation must be authoritative.
- The client must not be trusted to prevent unsafe transitions.
- Do not re-read files already in active context unless needed to verify a contradiction or capture exact evidence.
- Keep scope limited to backend and closely related contract surfaces.
- Distinguish clearly between:
  - what the request lifecycle already enforces today
  - what downstream activation or duplicate-detection layers enforce elsewhere
  - what Phase 2 still needs to add or tighten

## Required Hardening Areas

### 1. Project Number Rules

Implement or confirm server-side enforcement for:

- required timing of project-number entry
- format validation (`##-###-##`)
- uniqueness validation where the backend lifecycle actually owns it
- clear conflict response behavior for duplicates
- clear machine-readable and human-readable error paths

Do not overstate activation-layer duplicate detection as if request lifecycle code already enforces it.

### 2. Transition Guard Hardening

Ensure server-side blocking exists for business-critical prerequisites, including where applicable:

- unresolved clarification state
- external-setup completion gating
- missing required fields for launch
- invalid reopen / rerun combinations

### 3. Idempotency And Duplicate-Run Prevention

Ensure the backend prevents:

- duplicate provisioning launches for the same request
- repeated transition calls from creating contradictory state
- unsafe reruns when an active or completed run already exists unless explicitly allowed by design

### 4. Explicit Evidence

Ensure that failed validations and blocked launch attempts produce useful operational evidence.

## Required Files To Audit And Update As Needed

```text
backend/functions/src/functions/projectRequests/index.ts
backend/functions/src/functions/provisioningSaga/index.ts
backend/functions/src/functions/provisioningSaga/saga-orchestrator.ts
backend/functions/src/state-machine.ts
backend/functions/src/services/project-requests-repository.ts
backend/functions/src/services/table-storage-service.ts
packages/provisioning/src/api-client.ts
packages/models/src/provisioning/*
docs/architecture/reviews/project-setup-accounting-phase-2-backend-lifecycle-hardening-report.md
```

## Required Deliverables

1. implemented backend validation hardening
2. new or updated tests for:
   - duplicate project-number rejection where Phase 2 actually enforces it
   - invalid launch preconditions
   - duplicate provisioning-run prevention
3. updated Phase 2 report section:
   - Validation And Idempotency Hardening
   - Existing Enforcement Versus Remaining Gaps
   - Open Exceptions / External Dependencies

## Verification

Run targeted checks:

```bash
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test || true
```

Add `pnpm --filter @hbc/provisioning check-types` if API/client contract changes are made.

## Acceptance Criteria

- project-number format rules are enforced server-side to the degree claimed by the prompt
- uniqueness claims are explicit, accurate, and not overstated
- duplicate launches are blocked server-side
- transition preconditions are enforced server-side
- test evidence is recorded in the report
