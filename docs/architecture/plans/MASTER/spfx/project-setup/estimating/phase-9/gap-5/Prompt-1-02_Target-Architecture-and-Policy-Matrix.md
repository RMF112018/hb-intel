# Prompt-1-02 — Target Authorization Architecture and Route-Policy Matrix

```text
Title: Prompt-1-02 — Target Authorization Architecture and Route-Policy Matrix

Objective:
Define the complete target authorization architecture, route-policy matrix, claim requirements, and ownership model for Project Setup so all code changes can converge to one design.

Working rules:
- Treat live repo truth as authoritative.
- Do not re-read files that are still in your active context or memory unless needed to verify a contradiction or capture exact evidence.
- Use official Microsoft documentation as the primary source for platform guidance.
- Keep scope tightly focused on Gap 5 authorization convergence unless a change is required to preserve correctness.
- Do not silently change unrelated behavior.
- Update the central implementation report and any required planning docs before concluding.


Files to inspect first:
- Baseline artifacts created in Prompt-1-01
- backend/functions/src/functions/projectRequests/index.ts
- backend/functions/src/functions/provisioningSaga/index.ts
- backend/functions/src/middleware/auth.ts
- backend/functions/src/middleware/validateToken.ts
- relevant models describing requests and provisioning runs

Tasks:
1. Design the final route-policy matrix for every Project Setup route and trigger.
2. Classify each surface as delegated user, privileged delegated user, workload/app-only, internal-only, or unauthenticated by design.
3. Define the delegated scope requirement for interactive API calls.
4. Define the final app-role set, including requester, controller, admin, provisioning admin, support read, override, and automation/workload roles if supported by repo architecture.
5. Define the resource-authorization rules that use stable identity and business ownership instead of UPN lists.
6. Document exactly which routes require scope only, scope plus ownership, scope plus app role, app-only role, or explicit exclusion from the retained PS surface.
7. Create a durable policy matrix doc that later prompts must implement.

Required deliverables:
- `docs/architecture/plans/MASTER/spfx/project-setup/estimating/gap-5-authz/Gap-5_Target-Authorization-Architecture.md`
- `docs/architecture/plans/MASTER/spfx/project-setup/estimating/gap-5-authz/Gap-5_Route-Policy-Matrix.md`
- Update to the central implementation report summarizing the frozen target architecture

Acceptance criteria:
- The route-policy matrix covers every retained route and trigger.
- The architecture doc explicitly separates token validation, delegated scope authorization, business-role authorization, ownership/resource authorization, and workload authorization.
- The docs are concrete enough that prompts 03–11 can implement without reopening fundamental design questions.

Required report update:
- Update `docs/architecture/reviews/project-setup-gap-5-implementation-report.md`
- Distinguish clearly between confirmed repo fact, confirmed Microsoft-guidance fact, inference, and unresolved item.
- Record exact files changed, tests run, results, and any deferred/environment-gated items.

Output expectation:
- Do the work.
- Provide a concise completion summary with changed files, tests run, acceptance status, and any remaining blockers.
```
