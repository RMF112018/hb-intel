# Prompt-02 — Phase 8: Lifecycle Verification Coverage Hardening

## Objective

Implement or complete the missing verification coverage required to prove the Project Setup lifecycle behaves correctly across core request, controller, launch, provisioning, and completion paths.

## Required working approach

1. Using the Prompt-01 audit as input, harden verification coverage for:
   - request submission and validation
n   - controller queue and detail actions
   - external setup gating behavior
   - provisioning launch behavior
   - status transitions through completion and failure

2. Prioritize:
   - deterministic tests close to the business rules
   - state-machine and route-contract validation
   - Accounting-facing workflow coverage
   - backend transition and launch-guard coverage

3. Update or add tests in the appropriate locations and ensure the relevant test commands pass.

4. Update progress and evidence in:
   - `docs/architecture/reviews/project-setup-phase-8-reliability-testing-and-operational-readiness-audit.md`

## Required outputs

- implemented or expanded lifecycle verification coverage
- updated documentation describing what was added and what remains deferred
- clear evidence of passing commands or justified remaining gaps

## Rules

- Do not invent unsupported behavior just to satisfy tests.
- Prefer verifying frozen contract behavior rather than speculative future behavior.
- Keep tests aligned with repo-truth state semantics and role boundaries.
