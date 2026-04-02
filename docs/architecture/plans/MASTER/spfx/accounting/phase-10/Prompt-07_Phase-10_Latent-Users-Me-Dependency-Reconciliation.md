# Prompt-07 — Phase 10 Latent `/api/users/me/*` Dependency Reconciliation

## Objective

Either remove the latent `/api/users/me/*` dependency surface from the relevant production bundles or explicitly govern and document why it remains acceptable debt after Phase 10.

## Context

The audit treated the `/api/users/me/*` strings as dead dependencies for current scope rather than active blockers, but they still remain in bundled output and still represent same-origin/cookie-based assumptions if ever enabled.

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

- `packages/complexity/src/`
- relevant consuming apps:
  - `apps/accounting/`
  - `apps/estimating/`
- existing review docs on the latent dependency gap
- any build artifacts or tests that inspect bundled output


## Tasks

1. Re-check the current implementation state of the latent `/api/users/me/*` dependency handling.
2. Decide the right closure path:
   - preferred path if safe and low-risk: remove the latent production-bundle surface or constrain it more tightly
   - alternative path: formally govern it as accepted deferred debt with explicit rationale and tests
3. If code changes are made, ensure they do not break current complexity behavior.
4. If dynamic import, tree-shaking, or conditional loading is the chosen path, verify the resulting bundle behavior rather than assuming it.
5. Update the relevant review/docs so they describe the final state precisely:
   - removed
   - still bundled but unreachable
   - intentionally deferred with rationale


## Deliverables

- code changes if chosen
- bundle or build evidence proving the final state
- updated review/doc language describing the final closure posture


## Acceptance Criteria

- the final state of the latent dependency is explicit and evidenced
- no misleading claim remains in docs
- if the strings remain bundled, that is documented as an intentional, justified outcome rather than an accidental ambiguity


## Output Format

Provide:
1. the chosen closure path
2. the exact evidence supporting it
3. any code changes made
4. the docs updated to reflect the final posture

