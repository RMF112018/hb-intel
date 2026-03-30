# Prompt 01 — Repo Truth and Auth Surface Baseline

## Objective

Conduct a repo-truth-first auth audit for the isolated Project Setup package, then produce the baseline auth matrix that will govern all later Phase 3 work.

## Context

You are continuing the HB Intel Estimating / Project Setup production-readiness effort in the authoritative repo:

- Repository: `https://github.com/RMF112018/hb-intel.git`

Known facts for this phase:
- The package is intended to support both `ui-review` and `production` modes.
- The current deployable artifact still behaves as a `ui-review`-first build.
- The Project Setup production path needs a deliberate SPFx-to-API auth contract.
- Phase 3 is focused on auth correctness, not broad infrastructure redesign.

## Critical instructions

- Treat live repo truth as authoritative implementation truth.
- Treat the current isolated Project Setup package posture already established in prior phases as authoritative scope truth.
- Do not re-read files already in your active context or memory unless needed to verify a contradiction or retrieve exact evidence.
- Do not start redesign work until you have produced the baseline inventory and auth matrix.
- Distinguish clearly between:
  1. confirmed repo fact
  2. confirmed current mode/auth fact
  3. inferred conclusion
  4. unresolved issue

## Required work

1. Audit all frontend code involved in:
   - `ui-review` / `production` mode selection
   - auth/bootstrap
   - token sourcing
   - Project Setup API client initialization
2. Audit all backend code involved in:
   - route auth protection
   - token validation
   - service initialization assumptions tied to auth
   - managed identity or app-only access paths
3. Inventory every retained Project Setup backend route and classify:
   - mode(s) allowed
   - auth required or not required
   - token source expectation
   - delegated vs app-only implications
4. Produce a baseline auth matrix with at minimum:
   - route / capability
   - caller
   - current frontend assumption
   - current backend expectation
   - current token source
   - current validator path
   - current mode gating
   - delegated vs app-only classification
   - mismatch notes
5. Produce a gap list for:
   - opaque token assumptions
   - validator misalignment
   - ambiguous mode behavior
   - missing route protections
   - misleading OBO abstractions

## Required deliverables

- Baseline auth matrix markdown file
- Auth gap summary markdown file
- Short repo-truth findings summary in the chat

## Acceptance criteria

- No implementation changes are made in this prompt.
- The matrix is complete enough to govern all later Phase 3 work.
- Every retained Project Setup route and auth touchpoint is accounted for.
