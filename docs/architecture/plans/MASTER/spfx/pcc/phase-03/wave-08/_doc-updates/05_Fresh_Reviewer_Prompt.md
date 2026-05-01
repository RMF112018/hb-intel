# Prompt 05 — Fresh Reviewer Prompt for Wave 8 Documentation + Persona Alignment

## Role

You are a fresh senior reviewer for the `hb-intel` repo. Review the completed Wave 8 documentation/persona correction pass.

Repo path:

```text
/Users/bobbyfetting/hb-intel
```

## Critical instruction

Do not re-read files that are still within your current context or memory. Since this is a fresh review, inspect only the files required to validate the committed or staged changes.

## Review objective

Validate that the local agent correctly implemented the documentation and PCC persona-set changes required to prepare **PCC Phase 3 / Wave 8 — Project Readiness Module Framework** for implementation.

## Required checks

Run:

```bash
cd /Users/bobbyfetting/hb-intel
git status --short
git log --oneline -5
git show --stat --oneline HEAD
git show --name-only --oneline HEAD
md5 pnpm-lock.yaml
```

Then inspect the changed files from the latest commit or staged diff.

## Validate documentation

Confirm:

1. Wave 8 is defined as **Project Readiness Module Framework**.
2. User-facing name is **Project Readiness Center**.
3. Wave 8 is a framework, not a checklist, dashboard-only view, status card, or link hub.
4. Wave 9 remains Job Startup Checklist / Lifecycle Checklist.
5. Wave 10 remains Permit Log.
6. Wave 11 remains Responsibility Matrix / RACI.
7. Wave 12 remains Constraints Log.
8. Wave 13 remains Buyout Log.
9. Wave 14 remains Approvals / Checkpoints.
10. Wave 8 integrates with but does not duplicate:
    - Priority Actions;
    - HB Document Control Center;
    - Team & Access;
    - Approvals / Checkpoints;
    - External Systems;
    - Site Health;
    - future closeout workflows.
11. Readiness domains are documented.
12. Lifecycle gates are documented and mapped to existing PCC project stages.
13. Readiness item/checkpoint shape is documented.
14. Blocker-first scoring/posture is documented.
15. Source-of-record posture is documented.
16. Guardrails and explicit exclusions are documented.
17. Closeout file exists and accurately reflects what changed.

## Validate persona set

Inspect:

```text
packages/models/src/pcc/PccUserRoles.ts
packages/models/src/pcc/PccUserRoles.test.ts
packages/models/src/auth/ProjectRoles.ts
```

Confirm:

1. Existing personas were preserved.
2. Missing Wave 8 personas were added or otherwise accounted for:
   - estimator;
   - chief-estimator;
   - director-of-preconstruction;
   - project-coordinator;
   - external-design-team;
   - owner-client-viewer;
   - subcontractor-limited.
3. `viewer` remains compatible and is labeled as Project Viewer if updated.
4. `project-accounting` remains compatible and is labeled to cover Project Accounting / Project Accountant if updated.
5. Every persona has:
   - label;
   - tier;
   - category;
   - ProjectRole mapping key.
6. `ProjectRole` was not mutated unless the closeout justifies it.
7. External/deferred personas do not gain default readiness update/approve/override/configure authority.

## Run validation

Use repo-correct targeted equivalents:

```bash
pnpm --filter @hbc/models test -- PccUserRoles
pnpm --filter @hbc/models check-types
git diff --check
pnpm exec prettier --check <touched markdown files>
md5 pnpm-lock.yaml
```

## Pass / fail criteria

Pass only if:

- documentation is consistent;
- persona model is complete and compatible;
- targeted validation passes;
- no forbidden files or runtime changes were introduced;
- `pnpm-lock.yaml` is unchanged;
- no external integrations, tenant mutations, deployments, or backend route changes were introduced.

Fail if any contradiction remains, especially:
- Wave 8 described as the Startup Checklist;
- Wave 8 described only as a static dashboard;
- readiness scoring hides blockers;
- Project Readiness Center duplicates Priority Actions, Site Health, or Approvals;
- missing persona metadata;
- `ProjectRole` modified unnecessarily;
- plans directory edited without authorization;
- lockfile changed.

## Reviewer output format

Return:

```text
Review result: Pass / Fail

Summary

Findings

Validation evidence

Required fixes, if any

Recommended next step
```
