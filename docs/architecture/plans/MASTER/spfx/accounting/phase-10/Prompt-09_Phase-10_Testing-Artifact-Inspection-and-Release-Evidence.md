# Prompt-09 — Phase 10 Testing, Artifact Inspection, and Release Evidence

## Objective

Prove the Phase 10 implementation with tests, freshly built artifacts, and release-evidence documents rather than relying on source inspection alone.

## Context

The prior audit distinguished strongly between repo truth and packaged-artifact truth. Phase 10 must close that gap with concrete evidence.

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

- `apps/accounting/src/test/`
- any shared test helpers touched by the implementation
- packaging/build scripts
- release/readiness/review doc paths used by this workstream
- freshly built `.sppkg` outputs in `dist/sppkg/`


## Tasks

1. Run the relevant test suites for the Accounting surface and any shared runtime/build logic changed in Phase 10.
2. Add missing tests required to prove the new runtime/auth/package behavior.
3. Perform a fresh Accounting package build from current repo truth.
4. Inspect the fresh `.sppkg` directly and capture evidence for:
   - package identity/version
   - declared permission posture
   - packaged shell asset references
   - runtime injection evidence
   - any other closure-critical packaged behavior
5. Author a Phase 10 validation report that distinguishes:
   - confirmed repo fact
   - confirmed packaged-artifact fact
   - unresolved external prerequisite
6. If anything still fails or remains under-evidenced, do not hide it. Record it explicitly as residual work or external dependency.


## Deliverables

- updated/added tests
- fresh build output
- packaged-artifact inspection report
- Phase 10 validation report


## Acceptance Criteria

- the implementation is backed by runnable tests and real artifact evidence
- the validation report is suitable for release decision-making
- residual issues are explicit rather than implied away


## Output Format

Provide:
1. the test commands run and their outcomes
2. the build command(s) run
3. the key packaged-artifact findings
4. the path to the new Phase 10 validation report

