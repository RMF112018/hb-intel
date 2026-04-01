# Prompt-1-03 — Entra App Registration, App Roles, and Delegated Scope Contract

```text
Title: Prompt-1-03 — Entra App Registration, App Roles, and Delegated Scope Contract

Objective:
Translate the target architecture into a precise Entra app registration contract for the Project Setup API and its callers, including delegated scopes, app roles, assignment model, and environment prerequisites.

Working rules:
- Treat live repo truth as authoritative.
- Do not re-read files that are still in your active context or memory unless needed to verify a contradiction or capture exact evidence.
- Use official Microsoft documentation as the primary source for platform guidance.
- Keep scope tightly focused on Gap 5 authorization convergence unless a change is required to preserve correctness.
- Do not silently change unrelated behavior.
- Update the central implementation report and any required planning docs before concluding.


Files to inspect first:
- Target architecture and route-policy docs from Prompt-1-02
- apps/estimating/config/package-solution.json
- apps/estimating/src/mount.tsx
- apps/estimating/src/config/runtimeConfig.ts
- tools/spfx-shell/src/webparts/shell/ShellWebPart.ts
- backend/functions/src/middleware/validateToken.ts
- any deployment/runbook docs that mention API audience or auth config

Tasks:
1. Define the exact delegated scope contract required for SPFx/browser callers.
2. Define the exact API app-role catalog required for privileged users and workloads.
3. Map those roles to Entra assignment guidance, including whether groups, users, managed identities, or service principals receive each assignment.
4. Document how the API should treat delegated tokens versus app-only tokens.
5. Document what repo-owned config and what environment-owned config must exist for the model to work.
6. Identify whether any current token-validation logic or runtime-config expectations must change to support the contract cleanly.
7. Create a precise Entra contract doc and update the implementation report.

Required deliverables:
- `docs/architecture/plans/MASTER/spfx/project-setup/estimating/gap-5-authz/Gap-5_Entra-App-Role-and-Scope-Contract.md`
- Implementation report update summarizing Entra contract decisions and repo implications

Acceptance criteria:
- The Entra contract doc specifies scopes, roles, assignment targets, and required claims.
- The doc clearly distinguishes repo-owned implementation work from environment-executed setup steps.
- The doc is specific enough that later prompts can implement validation, policies, and runbooks without re-interpreting the identity model.

Required report update:
- Update `docs/architecture/reviews/project-setup-gap-5-implementation-report.md`
- Distinguish clearly between confirmed repo fact, confirmed Microsoft-guidance fact, inference, and unresolved item.
- Record exact files changed, tests run, results, and any deferred/environment-gated items.

Output expectation:
- Do the work.
- Provide a concise completion summary with changed files, tests run, acceptance status, and any remaining blockers.
```
