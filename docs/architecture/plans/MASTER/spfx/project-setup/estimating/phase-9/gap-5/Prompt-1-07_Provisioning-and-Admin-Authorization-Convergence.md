# Prompt-1-07 — Provisioning and Admin Route Authorization Convergence

```text
Title: Prompt-1-07 — Provisioning and Admin Route Authorization Convergence

Objective:
Converge provisioning, oversight, and operational admin routes onto the same shared authorization model so privileged human paths are consistent across the Project Setup domain.

Working rules:
- Treat live repo truth as authoritative.
- Do not re-read files that are still in your active context or memory unless needed to verify a contradiction or capture exact evidence.
- Use official Microsoft documentation as the primary source for platform guidance.
- Keep scope tightly focused on Gap 5 authorization convergence unless a change is required to preserve correctness.
- Do not silently change unrelated behavior.
- Update the central implementation report and any required planning docs before concluding.


Files to inspect first:
- backend/functions/src/functions/provisioningSaga/index.ts
- shared authorization policy code
- route-policy matrix
- any admin/oversight UI contracts that depend on these routes

Tasks:
1. Audit each provisioning and admin route against the target policy matrix.
2. Refactor all retained privileged human routes to use explicit shared-policy enforcement for delegated scope, app roles, and ownership where applicable.
3. Differentiate clearly between operational admin routes, support read routes, controller routes, and override routes.
4. Ensure retry/escalate/status behaviors reflect the intended role/ownership model and do not inherit accidental open access.
5. Ensure any route that should be backend-internal or app-only is clearly separated from delegated interactive use.
6. Add or update tests for all provisioning/admin route authorization outcomes.

Required deliverables:
- Refactored provisioning/admin route authorization
- Updated route/integration tests
- Implementation report update documenting route-by-route convergence

Acceptance criteria:
- Privileged delegated routes use one coherent authorization model.
- Route access aligns with the policy matrix from Prompt-1-02.
- Tests prove positive and negative authorization outcomes across provisioning/admin routes.

Required report update:
- Update `docs/architecture/reviews/project-setup-gap-5-implementation-report.md`
- Distinguish clearly between confirmed repo fact, confirmed Microsoft-guidance fact, inference, and unresolved item.
- Record exact files changed, tests run, results, and any deferred/environment-gated items.

Output expectation:
- Do the work.
- Provide a concise completion summary with changed files, tests run, acceptance status, and any remaining blockers.
```
