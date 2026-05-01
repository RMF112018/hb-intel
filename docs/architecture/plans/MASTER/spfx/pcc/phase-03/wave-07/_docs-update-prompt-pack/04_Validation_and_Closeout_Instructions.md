# 04 — Validation and Closeout Instructions

## Required validation commands

From repo root:

```bash
cd /Users/bobbyfetting/hb-intel
git status --short
md5 pnpm-lock.yaml
git diff --check
```

Because this is documentation-only, source builds are not required unless the agent changes source files, which it should not do.

If markdown formatting rules exist in the repo, run the appropriate formatting check. If unsure, inspect nearby prior closeouts for validation commands before running broad commands.

Suggested targeted search validations:

```bash
rg -n "HB Document Control Center|My Project Files|Project Document Source Registry|Project Coordinator|Project Engineer|Microsoft Files Lane|External Document Systems Lane|Procore Project ID|Chief Estimator Review|Legal Review|Compliance Review|Leadership Review" docs/architecture/blueprint/sp-project-control-center docs/architecture/plans/MASTER/spfx/pcc
```

## Required proof points

The closeout must state:

1. Files inspected.
2. Files changed.
3. Confirmation that `pnpm-lock.yaml` checksum did not change.
4. Confirmation that `git diff --check` is clean.
5. Confirmation that changes are documentation-only.
6. Confirmation that no source files, package files, manifests, workflows, lockfiles, deployment artifacts, or tenant settings were changed.
7. Confirmation that Wave 7 remains HB Document Control Center and was not re-sequenced to Responsibility Matrix.
8. Confirmation that Project Coordinator replaced Project Engineer in the Wave 7 permission model.
9. Confirmation that the hard `My Project Files` guardrail is present.
10. Confirmation that external writeback/sync/mirror remains forbidden in Wave 7.
11. Confirmation that SPFx direct broad Graph execution remains forbidden in Wave 7.

## Required commit summary format

```text
Commit summary

docs(pcc): update wave 7 hb document control architecture

Commit description

Updates Phase 3 Wave 7 planning, blueprint, and roadmap documentation to align the wave with the HB Document Control Center target architecture.

Defines the three-lane model: Project Record, My Project Files, and External Systems.

Adds project source binding through the Project Document Source Registry, OneDrive-backed My Project Files guardrails, Procore Project ID metadata, expanded review types, role/action permission matrix, backend-mediated Graph posture, source health, audit, repair, sharing-link, fixture, and Wave 7 acceptance criteria.

Preserves documentation-only scope. No application source, backend source, package, lockfile, manifest, workflow, deployment, tenant, live Graph, Procore, Document Crunch, Adobe Sign, or permission mutation changes.
```

## Required final response to user

After execution, summarize:

- what changed;
- what files changed;
- validation results;
- any residual risks or open decisions;
- recommended next step.
