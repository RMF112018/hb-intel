# Prompt-1-06 — Request Lifecycle Authorization Convergence

```text
Title: Prompt-1-06 — Request Lifecycle Authorization Convergence

Objective:
Refactor the Project Setup request lifecycle so request-state transitions, list/detail access, and submitter/controller/admin behavior all use the shared policy model rather than env-based UPN lists.

Working rules:
- Treat live repo truth as authoritative.
- Do not re-read files that are still in your active context or memory unless needed to verify a contradiction or capture exact evidence.
- Use official Microsoft documentation as the primary source for platform guidance.
- Keep scope tightly focused on Gap 5 authorization convergence unless a change is required to preserve correctness.
- Do not silently change unrelated behavior.
- Update the central implementation report and any required planning docs before concluding.


Files to inspect first:
- backend/functions/src/functions/projectRequests/index.ts
- backend/functions/src/state-machine.ts
- shared authorization policy code from Prompt-1-04
- stable-ID work from Prompt-1-05
- route-policy matrix

Tasks:
1. Refactor request-lifecycle authorization to enforce the final delegated scope, role, and ownership model.
2. Eliminate steady-state runtime dependence on `ADMIN_UPNS` and `CONTROLLER_UPNS` for request-lifecycle decisions.
3. Move any remaining transitional compatibility into an explicit, temporary migration path only if strictly necessary.
4. Ensure submitter self-service flows are enforced by ownership/resource checks using stable identity.
5. Ensure controller/admin actions are enforced by app-role-based authorization through the shared policy layer.
6. Adjust state-machine helpers if needed so they express business permissions cleanly without reintroducing env-based auth logic.
7. Add or update exhaustive tests for request submission, list visibility, detail access, and all state transitions.

Required deliverables:
- Refactored request-lifecycle authorization code
- Route and integration tests covering request lifecycle authorization
- Implementation report update recording removal or isolation of UPN-list dependence

Acceptance criteria:
- Request-lifecycle authorization no longer depends permanently on env-based UPN lists.
- Submitter access is ownership/resource-based.
- Controller/admin access is role-based and enforced consistently through the shared policy layer.
- Tests prove all major request lifecycle cases.

Required report update:
- Update `docs/architecture/reviews/project-setup-gap-5-implementation-report.md`
- Distinguish clearly between confirmed repo fact, confirmed Microsoft-guidance fact, inference, and unresolved item.
- Record exact files changed, tests run, results, and any deferred/environment-gated items.

Output expectation:
- Do the work.
- Provide a concise completion summary with changed files, tests run, acceptance status, and any remaining blockers.
```
