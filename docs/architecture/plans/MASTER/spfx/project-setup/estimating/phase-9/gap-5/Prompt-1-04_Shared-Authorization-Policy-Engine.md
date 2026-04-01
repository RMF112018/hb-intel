# Prompt-1-04 — Shared Authorization Policy Engine and Claims Model

```text
Title: Prompt-1-04 — Shared Authorization Policy Engine and Claims Model

Objective:
Implement a shared backend authorization layer so Project Setup no longer relies on route-local ad hoc authorization logic and can consistently enforce scope, roles, ownership, and workload rules.

Working rules:
- Treat live repo truth as authoritative.
- Do not re-read files that are still in your active context or memory unless needed to verify a contradiction or capture exact evidence.
- Use official Microsoft documentation as the primary source for platform guidance.
- Keep scope tightly focused on Gap 5 authorization convergence unless a change is required to preserve correctness.
- Do not silently change unrelated behavior.
- Update the central implementation report and any required planning docs before concluding.


Files to inspect first:
- backend/functions/src/middleware/auth.ts
- backend/functions/src/middleware/validateToken.ts
- backend/functions/src/functions/projectRequests/index.ts
- backend/functions/src/functions/provisioningSaga/index.ts
- backend/functions/src/state-machine.ts
- Target architecture and route-policy docs

Tasks:
1. Introduce a shared authorization policy module or equivalent abstraction that centralizes the Project Setup authorization model.
2. Standardize the claims model made available to handlers so delegated/user identity, app-only identity, roles, scope, token type, and stable IDs are explicit.
3. Implement reusable checks for delegated scope, required roles, ownership/resource access, workload/app-only access, and override/break-glass handling.
4. Remove route-local authorization duplication where practical and replace it with the shared policy layer.
5. Preserve backward compatibility only where needed for an orderly migration, but make deprecation explicit and finite.
6. Add or update tests that prove the policy engine behavior independently of specific route handlers.

Required deliverables:
- Shared authorization policy code in the backend
- Policy-level unit tests
- Implementation report update documenting the new shared enforcement layer

Acceptance criteria:
- Project Setup authorization decisions are no longer primarily implemented as scattered route-local one-offs.
- The shared policy layer can express delegated scope checks, role checks, workload checks, and ownership checks.
- Tests prove the policy layer behavior and cover negative cases.

Required report update:
- Update `docs/architecture/reviews/project-setup-gap-5-implementation-report.md`
- Distinguish clearly between confirmed repo fact, confirmed Microsoft-guidance fact, inference, and unresolved item.
- Record exact files changed, tests run, results, and any deferred/environment-gated items.

Output expectation:
- Do the work.
- Provide a concise completion summary with changed files, tests run, acceptance status, and any remaining blockers.
```
