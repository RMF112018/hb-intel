# Prompt-1-09 — Frontend / SPFx Contract and Authorization Diagnostics

```text
Title: Prompt-1-09 — Frontend / SPFx Contract and Authorization Diagnostics

Objective:
Align the frontend/SPFx caller contract with the new authorization model so delegated scope expectations, token-provider behavior, runtime diagnostics, and production-readiness checks all reflect the final design.

Working rules:
- Treat live repo truth as authoritative.
- Do not re-read files that are still in your active context or memory unless needed to verify a contradiction or capture exact evidence.
- Use official Microsoft documentation as the primary source for platform guidance.
- Keep scope tightly focused on Gap 5 authorization convergence unless a change is required to preserve correctness.
- Do not silently change unrelated behavior.
- Update the central implementation report and any required planning docs before concluding.


Files to inspect first:
- apps/estimating/src/mount.tsx
- apps/estimating/src/config/runtimeConfig.ts
- apps/estimating/src/project-setup/backend/**
- packages/provisioning/src/api-client.ts
- tools/spfx-shell/src/webparts/shell/ShellWebPart.ts
- apps/estimating/config/package-solution.json
- Entra contract doc from Prompt-1-03

Tasks:
1. Verify the frontend contract required for delegated scope acquisition and API audience usage.
2. Adjust runtime diagnostics and production-readiness messaging so they surface missing scope/audience/token-provider prerequisites clearly.
3. Ensure the frontend no longer carries misleading or stale assumptions about the old mixed authorization model.
4. Update any client contracts or helper types to match the stabilized backend auth model.
5. Confirm whether shell/runtime injection changes are needed for better auth diagnostics or cleaner production behavior.
6. Add or update frontend tests around production-readiness/auth diagnostics where appropriate.

Required deliverables:
- Frontend/runtime contract updates as needed
- Diagnostic/test updates as needed
- Implementation report update covering frontend alignment

Acceptance criteria:
- The frontend reflects the final delegated-caller auth contract accurately.
- Production-readiness/auth diagnostics clearly identify missing runtime prerequisites.
- Frontend contracts do not misrepresent or mask the backend authorization model.

Required report update:
- Update `docs/architecture/reviews/project-setup-gap-5-implementation-report.md`
- Distinguish clearly between confirmed repo fact, confirmed Microsoft-guidance fact, inference, and unresolved item.
- Record exact files changed, tests run, results, and any deferred/environment-gated items.

Output expectation:
- Do the work.
- Provide a concise completion summary with changed files, tests run, acceptance status, and any remaining blockers.
```
