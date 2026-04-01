# Prompt-1-05 — Stable Identity (`oid`) Migration and Data Contract

```text
Title: Prompt-1-05 — Stable Identity (`oid`) Migration and Data Contract

Objective:
Introduce stable identity persistence for Project Setup records so authorization can rely on immutable IDs rather than UPN/email for ownership and actor attribution.

Working rules:
- Treat live repo truth as authoritative.
- Do not re-read files that are still in your active context or memory unless needed to verify a contradiction or capture exact evidence.
- Use official Microsoft documentation as the primary source for platform guidance.
- Keep scope tightly focused on Gap 5 authorization convergence unless a change is required to preserve correctness.
- Do not silently change unrelated behavior.
- Update the central implementation report and any required planning docs before concluding.


Files to inspect first:
- packages/models/src/** relevant provisioning/request models
- backend/functions/src/services/projects-list-contract.ts
- backend/functions/src/** request mappers/repositories
- frontend request submission models as needed
- Target architecture docs

Tasks:
1. Identify every Project Setup model, mapper, repository, and field contract that currently stores or depends on submitter/controller identity via UPN/email only.
2. Design and implement the repo-owned data contract changes needed to persist stable identity fields such as `submittedByOid`, `lastActionByOid`, and any other required actor/ownership fields.
3. Implement dual-write / dual-read compatibility where necessary so existing records remain usable during cutover.
4. Preserve human-readable UPN/email fields only as display/operational metadata where still useful.
5. Update validation, mapping, serialization, and repository behavior accordingly.
6. Add or update tests proving backward compatibility and stable-ID-first behavior.

Required deliverables:
- Model/repository/mapper changes for stable IDs
- `docs/architecture/plans/MASTER/spfx/project-setup/estimating/gap-5-authz/Gap-5_Oid-Migration-and-Data-Contract.md`
- Implementation report update with exact contract changes and compatibility notes

Acceptance criteria:
- Stable identity fields exist in repo-owned code where needed for ownership and actor attribution.
- Authorization-critical logic can rely on stable IDs even while older records continue to work.
- Tests prove compatibility and new persistence behavior.

Required report update:
- Update `docs/architecture/reviews/project-setup-gap-5-implementation-report.md`
- Distinguish clearly between confirmed repo fact, confirmed Microsoft-guidance fact, inference, and unresolved item.
- Record exact files changed, tests run, results, and any deferred/environment-gated items.

Output expectation:
- Do the work.
- Provide a concise completion summary with changed files, tests run, acceptance status, and any remaining blockers.
```
