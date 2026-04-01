# Prompt-1-08 — Workload and App-Only Authorization

```text
Title: Prompt-1-08 — Workload and App-Only Authorization

Objective:
Implement the future-state authorization model for workload, timer, and internal execution paths so automation is governed explicitly by app-only/workload roles and not by user-style assumptions.

Working rules:
- Treat live repo truth as authoritative.
- Do not re-read files that are still in your active context or memory unless needed to verify a contradiction or capture exact evidence.
- Use official Microsoft documentation as the primary source for platform guidance.
- Keep scope tightly focused on Gap 5 authorization convergence unless a change is required to preserve correctness.
- Do not silently change unrelated behavior.
- Update the central implementation report and any required planning docs before concluding.


Files to inspect first:
- backend/functions/src/functions/provisioningSaga/index.ts
- timer/full-spec and other internal trigger files retained in the PS host
- auth and token validation layers
- managed identity or internal execution abstractions used by the host
- route-policy matrix and Entra contract docs

Tasks:
1. Identify every retained workload/app-only or internal execution path in the Project Setup host.
2. Define and implement the distinction between delegated user execution and app-only/workload execution in code.
3. Ensure app-only tokens, managed-identity-backed execution, or internal triggers are authorized through explicit workload roles/policies where applicable.
4. Eliminate accidental reliance on user-specific claims such as UPN for workload paths.
5. Clarify which operations are true internal-only paths and which should still require explicit app-only authorization checks.
6. Add or update tests for workload/app-only authorization behavior and failure modes.

Required deliverables:
- Code changes implementing workload/app-only authorization
- Tests covering workload/app-only paths
- `docs/architecture/plans/MASTER/spfx/project-setup/estimating/gap-5-authz/Gap-5_Workload-and-Break-Glass-Model.md` initial version
- Implementation report update documenting workload posture

Acceptance criteria:
- Workload/app-only paths are explicit and no longer piggyback on delegated-user assumptions.
- Authorization for automation paths is expressed clearly in code and docs.
- Tests prove workload and delegated execution are distinguished correctly.

Required report update:
- Update `docs/architecture/reviews/project-setup-gap-5-implementation-report.md`
- Distinguish clearly between confirmed repo fact, confirmed Microsoft-guidance fact, inference, and unresolved item.
- Record exact files changed, tests run, results, and any deferred/environment-gated items.

Output expectation:
- Do the work.
- Provide a concise completion summary with changed files, tests run, acceptance status, and any remaining blockers.
```
