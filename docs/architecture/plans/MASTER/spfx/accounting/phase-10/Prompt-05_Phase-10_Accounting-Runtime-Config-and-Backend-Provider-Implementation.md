# Prompt-05 — Phase 10 Accounting Runtime Config and Backend Provider Implementation

## Objective

Implement the Accounting-side runtime config, backend provider, and readiness behavior needed to make the Accounting SPFx surface operationally consistent with its declared production contract.

## Context

Project Setup has a clearer runtimeConfig/backend-provider pattern with production readiness checks and environment-state awareness. Accounting must reach an equivalent level of explicitness for its supported production path.

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

- `apps/accounting/src/App.tsx`
- `apps/accounting/src/router/`
- `apps/accounting/src/pages/`
- any Accounting runtime config helpers, backend context/providers, token helpers, bootstrap/mount files
- `packages/provisioning/` if Accounting uses the shared provisioning client
- relevant Project Setup implementations in `apps/estimating/src/`


## Tasks

1. Evaluate whether Accounting needs its own runtime config helper and backend provider layer comparable to the Project Setup pattern.
2. Implement the missing pieces needed so Accounting can:
   - receive injected runtime config from the shell
   - validate or at least clearly surface missing production prerequisites
   - route backend/API behavior through an explicit boundary instead of implicit assumptions
3. Ensure the Accounting runtime path does not silently degrade in ways that obscure deployment defects.
4. Where appropriate, align Accounting with the established Project Setup production-readiness pattern without cloning unnecessary complexity.
5. Add tests that prove:
   - runtime config is consumed correctly
   - missing required config is surfaced intentionally
   - the provider/client boundary behaves as documented


## Deliverables

- Accounting runtime config implementation
- Accounting backend/context/provider implementation if required
- tests covering the new behavior
- updated docs if the runtime contract changed


## Acceptance Criteria

- Accounting has a clear runtime boundary for production behavior
- injected shell config is actually consumed and validated
- missing prerequisites are surfaced intentionally rather than hidden
- tests prove the path works the way the docs say it works


## Output Format

Provide:
1. a concise implementation summary
2. the new or changed runtime/provider files
3. the tests added or updated
4. any docs updated to reflect the new runtime path

