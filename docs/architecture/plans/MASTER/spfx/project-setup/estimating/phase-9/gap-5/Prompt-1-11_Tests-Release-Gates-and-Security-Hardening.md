# Prompt-1-11 — Tests, Release Gates, and Security Hardening

```text
Title: Prompt-1-11 — Tests, Release Gates, and Security Hardening

Objective:
Add the comprehensive tests and machine-checkable release gates needed to prevent regression back to the old hybrid authorization model and to prove the new model is production-ready in repo-owned code.

Working rules:
- Treat live repo truth as authoritative.
- Do not re-read files that are still in your active context or memory unless needed to verify a contradiction or capture exact evidence.
- Use official Microsoft documentation as the primary source for platform guidance.
- Keep scope tightly focused on Gap 5 authorization convergence unless a change is required to preserve correctness.
- Do not silently change unrelated behavior.
- Update the central implementation report and any required planning docs before concluding.


Files to inspect first:
- All changed code from Prompts 04–10
- existing backend/frontend test suites
- existing release-gates or boundary tests
- implementation report

Tasks:
1. Design and implement comprehensive tests for delegated scope checks, role checks, ownership checks, workload checks, break-glass behavior, and backward compatibility for migrated records.
2. Add release-gate coverage that fails if request-time UPN authorization is reintroduced as the steady-state model.
3. Add release-gate coverage that fails if privileged routes drift away from the route-policy matrix.
4. Add tests/gates for stable-ID authorization behavior and app-only workload behavior.
5. Run the relevant suites and record exact results.
6. Update the implementation report with a precise acceptance matrix.

Required deliverables:
- Expanded test coverage
- Release-gate updates
- Implementation report update with test evidence and acceptance matrix

Acceptance criteria:
- Repo truth now has machine-checkable proof that the new authorization model is enforced.
- Regression back to env-based runtime authorization would fail tests or gates.
- Test evidence is specific enough to support architecture and release decisions.

Required report update:
- Update `docs/architecture/reviews/project-setup-gap-5-implementation-report.md`
- Distinguish clearly between confirmed repo fact, confirmed Microsoft-guidance fact, inference, and unresolved item.
- Record exact files changed, tests run, results, and any deferred/environment-gated items.

Output expectation:
- Do the work.
- Provide a concise completion summary with changed files, tests run, acceptance status, and any remaining blockers.
```
