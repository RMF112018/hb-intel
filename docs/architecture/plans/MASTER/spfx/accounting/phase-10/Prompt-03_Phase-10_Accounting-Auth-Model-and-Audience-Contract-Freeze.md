# Prompt-03 — Phase 10 Accounting Auth Model and Audience Contract Freeze

## Objective

Define and implement the authoritative production auth model for the Accounting SPFx surface so that frontend token acquisition, backend token validation, runtime config, and deployment docs all point to the same supported contract.

## Context

The audit found that Project Setup has a more mature production auth path than Accounting. Accounting must either align to that model or implement an explicitly different but equally well-defined supported contract.

## Working Rules

- Treat the live repo as the source of truth.
- Do not re-read files that are already in your active context or memory unless you need to verify a contradiction, confirm exact wording, or inspect a file you have not yet opened.
- Do not rely on stale phase documents when repo truth disagrees.
- Do not make assumptions about production readiness that are not evidenced in code, build artifacts, tests, or docs.
- Keep changes narrowly scoped to the objective of this prompt unless a directly dependent correction is required.
- When you change behavior, also update the governing docs and validation evidence that define or prove that behavior.
- Prefer additive, explicit, and test-backed changes over hidden fallbacks.
- If you discover that a requested change is already fully implemented in repo truth, do not re-implement it. Instead, document the repo truth, close the gap in the affected docs, and continue to the next unresolved item.

## Required Repo Focus

- `apps/accounting/src/`
- `apps/estimating/src/`
- `backend/functions/src/middleware/auth.ts`
- `backend/functions/src/middleware/validateToken.ts`
- `packages/provisioning/src/api-client.ts`
- any Accounting token helpers, runtime config helpers, or mount/bootstrap files
- any auth contract and release docs for Project Setup and Accounting


## Tasks

1. Determine the correct production auth model for Accounting:
   - preferred option: align Accounting to the mature SPFx audience-scoped token model used by Project Setup where appropriate
   - if a different model is required, document exactly why and where the boundary differs
2. Freeze the Accounting audience contract:
   - what audience the frontend requests
   - where that audience is injected/configured
   - how backend validation expects it
   - how stale or missing values are surfaced
3. Implement any missing Accounting-side runtime/token plumbing needed to satisfy the chosen contract.
4. Eliminate or explicitly quarantine any deprecated or ambiguous token patterns that should not remain in the Accounting production path.
5. Add/update an Accounting-specific auth contract doc that covers:
   - SPFx production token acquisition
   - runtime config dependencies
   - backend validation alignment
   - non-production behavior
   - failure diagnostics
6. Update tests to prove the chosen Accounting auth contract is real and not just documented.


## Deliverables

- finalized Accounting production auth/runtime contract in code
- Accounting-specific auth contract documentation
- tests or verification artifacts proving contract alignment


## Acceptance Criteria

- Accounting no longer has an ambiguous production auth posture
- frontend audience resolution and backend audience validation are explicitly aligned
- the chosen model is documented with no hand-waving
- deprecated or transitional patterns are either removed from the production path or clearly marked as out of scope


## Output Format

Provide:
1. the chosen Accounting auth model and why it is correct
2. the exact repo changes made
3. the validation/testing evidence
4. the doc path that now defines the authoritative Accounting auth contract

