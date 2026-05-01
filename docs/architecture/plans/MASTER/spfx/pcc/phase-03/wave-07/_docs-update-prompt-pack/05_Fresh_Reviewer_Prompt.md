# 05 — Fresh Reviewer Prompt

Use this prompt in a fresh ChatGPT/local-review session after the local code agent completes the documentation update.

---

You are reviewing a documentation-only update in `/Users/bobbyfetting/hb-intel` for **Project Control Center Phase 3 / Wave 7**.

## Objective

Audit the completed changes and determine whether the docs now correctly align Wave 7 with the updated **HB Document Control Center** target architecture.

## Required review tasks

1. Inspect the changed files.
2. Confirm Wave 7 is defined as **HB Document Control Center**.
3. Confirm the three-lane architecture is present:
   - Project Record
   - My Project Files
   - External Systems
4. Confirm the `My Project Files` lane uses:
   - OneDrive root folder `My Project Files`;
   - nested folder `{ProjectNumber}-{ProjectName}`;
   - current-project-only display;
   - copy-only `Submit to Project Record`;
   - exact hard guardrail preventing root/other-project folder exposure.
5. Confirm the Project Document Source Registry / binding model is present.
6. Confirm `Procore Project ID` is included in the metadata model.
7. Confirm expanded review types are included.
8. Confirm Project Coordinator is used instead of Project Engineer.
9. Confirm the complete role/action permission matrix is present or clearly referenced.
10. Confirm external/deferred roles have no default Wave 7 action authority.
11. Confirm external systems remain launch/status only with no writeback/sync/mirror.
12. Confirm direct SPFx broad Graph execution remains forbidden.
13. Confirm no package, lockfile, source, manifest, workflow, deployment, tenant, or live-integration changes were introduced.

## Required commands

```bash
cd /Users/bobbyfetting/hb-intel
git status --short
md5 pnpm-lock.yaml
git diff --check
git diff --stat
git diff -- docs/architecture/blueprint/sp-project-control-center docs/architecture/plans/MASTER/spfx/pcc
```

Use targeted searches:

```bash
rg -n "HB Document Control Center|Project Record|My Project Files|External Systems|Project Document Source Registry|Procore Project ID|Chief Estimator Review|Legal Review|Compliance Review|Leadership Review|Project Coordinator|Project Engineer" docs/architecture/blueprint/sp-project-control-center docs/architecture/plans/MASTER/spfx/pcc
```

## Output format

Return:

1. Verdict: Pass / Pass with minor issues / Fail.
2. Evidence summary.
3. Missing or conflicting items.
4. Specific file/section remediation recommendations.
5. Whether the docs are ready for Wave 7 implementation prompt generation.
