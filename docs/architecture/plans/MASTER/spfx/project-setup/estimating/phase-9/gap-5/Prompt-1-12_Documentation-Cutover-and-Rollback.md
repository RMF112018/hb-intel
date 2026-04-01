# Prompt-1-12 — Documentation, Environment Cutover, and Rollback

```text
Title: Prompt-1-12 — Documentation, Environment Cutover, and Rollback

Objective:
Create the documentation and operational package required to cut over from the old hybrid model to the new claim-based model in a controlled production release.

Working rules:
- Treat live repo truth as authoritative.
- Do not re-read files that are still in your active context or memory unless needed to verify a contradiction or capture exact evidence.
- Use official Microsoft documentation as the primary source for platform guidance.
- Keep scope tightly focused on Gap 5 authorization convergence unless a change is required to preserve correctness.
- Do not silently change unrelated behavior.
- Update the central implementation report and any required planning docs before concluding.


Files to inspect first:
- All artifacts created in Prompts 01–11
- existing deployment runbooks and production-readiness docs
- Entra contract doc and workload/break-glass doc

Tasks:
1. Write the complete cutover plan from the old model to the new model.
2. Document environment prerequisites, Entra configuration steps, role assignment steps, delegated-scope approval steps, break-glass setup, and rollback triggers.
3. Document any live data migration expectations related to stable identity fields.
4. Document coexistence/transition behavior if legacy records remain in the system during cutover.
5. Update production-readiness and handoff docs so they reflect the final authorization architecture rather than the old transitional posture.
6. Make the rollback plan precise and operationally realistic.

Required deliverables:
- `docs/architecture/plans/MASTER/spfx/project-setup/estimating/gap-5-authz/Gap-5_Cutover-and-Rollback-Runbook.md`
- Any required updates to existing production-readiness or deployment docs
- Implementation report update documenting environment-gated prerequisites and rollback

Acceptance criteria:
- The repo contains a usable cutover and rollback package for IT/operations.
- The docs clearly distinguish repo-complete work from environment-executed tasks.
- The old transitional authz posture is no longer represented as the intended steady state.

Required report update:
- Update `docs/architecture/reviews/project-setup-gap-5-implementation-report.md`
- Distinguish clearly between confirmed repo fact, confirmed Microsoft-guidance fact, inference, and unresolved item.
- Record exact files changed, tests run, results, and any deferred/environment-gated items.

Output expectation:
- Do the work.
- Provide a concise completion summary with changed files, tests run, acceptance status, and any remaining blockers.
```
