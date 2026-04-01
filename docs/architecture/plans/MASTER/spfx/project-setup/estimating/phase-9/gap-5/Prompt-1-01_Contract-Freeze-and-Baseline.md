# Prompt-1-01 — Gap 5 Contract Freeze and Implementation Baseline

```text
Title: Prompt-1-01 — Gap 5 Contract Freeze and Implementation Baseline

Objective:
Freeze the target authorization posture for Gap 5, inventory every current authorization surface in repo truth, and create the implementation scaffold that the remaining prompts will use.

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
- apps/estimating/src/** relevant auth/runtime files
- packages/provisioning/src/** relevant client files
- existing Project Setup phase/review docs relevant to Gap 5

Tasks:
1. Create the implementation scaffold under `docs/architecture/plans/MASTER/spfx/project-setup/estimating/gap-5-authz/`.
2. Create the central report at `docs/architecture/reviews/project-setup-gap-5-implementation-report.md` if it does not exist.
3. Inventory every current authn/authz decision path for Project Setup, including delegated user routes, admin routes, timers, internal routes, and any workload/app-only surfaces.
4. Identify every place where authorization depends on UPN, email, env vars, raw role claims, route-local conditionals, or implicit trust.
5. Identify every place where stable identity fields (`oid`, `sub`) already exist or are missing in models and persistence contracts.
6. Define the exact implementation baseline and freeze the target outcome for the rest of the prompt package.
7. Document the precise repo-owned blockers and the likely external prerequisites, but do not implement the later prompts yet.

Required deliverables:
- `docs/architecture/reviews/project-setup-gap-5-implementation-report.md` with a baseline section
- `docs/architecture/plans/MASTER/spfx/project-setup/estimating/gap-5-authz/Gap-5_Baseline-Inventory.md`
- `docs/architecture/plans/MASTER/spfx/project-setup/estimating/gap-5-authz/Gap-5_Target-Outcome-Summary.md`

Acceptance criteria:
- The baseline inventory covers every retained Project Setup route family and authorization path.
- The report clearly identifies all current UPN-based, role-based, and ownership-based decisions.
- The target outcome summary is specific enough to guide all later prompts without re-deciding architecture.

Required report update:
- Update `docs/architecture/reviews/project-setup-gap-5-implementation-report.md`
- Distinguish clearly between confirmed repo fact, confirmed Microsoft-guidance fact, inference, and unresolved item.
- Record exact files changed, tests run, results, and any deferred/environment-gated items.

Output expectation:
- Do the work.
- Provide a concise completion summary with changed files, tests run, acceptance status, and any remaining blockers.
```
