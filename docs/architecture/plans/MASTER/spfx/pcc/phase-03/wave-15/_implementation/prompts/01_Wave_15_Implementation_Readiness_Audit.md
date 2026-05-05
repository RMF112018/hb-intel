# Prompt 01 — Wave 15 Implementation Readiness Audit

## Objective

Run a read-only local repo-truth audit for Wave 15 External Systems Launch Pad. Do not edit files, stage files, or commit.

## Required Instruction Phrase

```text
Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.
```

## Working Directory

```bash
cd /Users/bobbyfetting/hb-intel
```

## Required Initial Repo-Truth Commands

Run and record:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -12
md5 pnpm-lock.yaml
```

If the worktree is not clean, distinguish user-owned drift from authorized prompt scope before editing. Do not stage unrelated files.

## Global Guardrails

- Work only in `/Users/bobbyfetting/hb-intel`.
- Preserve Wave 15 as a governed launch/reference layer first.
- Preserve no-writeback, no-sync, no-mirror posture.
- Preserve source-system ownership of source records.
- Preserve PCC ownership of launch/mapping/review/audit/health posture records.
- Preserve Wave 14 ownership of approval/checkpoint semantics.
- Preserve HBI no-authority posture.
- Do not add live external-system API calls.
- Do not add SharePoint/Graph/PnP writes.
- Do not add tenant/list/group/security mutation.
- Do not add command/write routes.
- Do not add iframe/current-image embed behavior.
- Do not add package dependencies or mutate lockfile.
- Do not mutate SPFx manifests, SPPKGs, deployment config, or CI workflows.
- Do not run broad formatting across the repo.


## Prohibited Scope

- No file edits.
- No package/lockfile/manifest changes.
- No source implementation.
- No documentation updates.
- No formatting writes.

## Required Files to Inspect

Use:

```text
reference/01_REQUIRED_REPO_TRUTH_FILES.md
reference/02_CANONICAL_WAVE15_DOCS_AND_ARTIFACTS.md
```

At minimum, inspect:

- Wave 15 blueprint docs and wireframes;
- Wave 15 JSON artifacts;
- current `ExternalSystems.ts` model;
- current fixtures;
- current PCC read-model contracts;
- backend provider/routes;
- SPFx read-model client files;
- existing External Systems surface files;
- current project-home/project-readiness/approvals seam files after commit `fca4748...` or local equivalent.

## Audit Steps

1. Run initial repo-truth commands.
2. Confirm local HEAD and whether it includes/supersedes `8f95f3f3146b9f90e752e80a0bcdd4dad2c5027d` and `fca4748bdc774c4e613b1f613f531aef6b8573d4`.
3. Confirm worktree cleanliness.
4. Confirm Wave 15 canonical docs, schema docs, wireframes, and artifacts exist.
5. Validate Wave 15 JSON artifacts with `python3 -m json.tool`.
6. Confirm current External Systems runtime remains old preview or identify if it has already evolved.
7. Confirm backend route/client/fallback patterns.
8. Confirm package scripts.
9. Produce an implementation-readiness gap report.

## Validation Commands

Read-only only:

```bash
python3 -m json.tool docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15/artifacts/external_url_policy_contract.json >/dev/null
python3 -m json.tool docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15/artifacts/external_system_role_action_matrix.json >/dev/null
python3 -m json.tool docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15/artifacts/hbi_allowed_refused_behavior.json >/dev/null
```

Validate all remaining Wave 15 JSON artifacts if practical.

## Stop/Go Report

Return:

- branch/HEAD/status/lockfile MD5;
- canonical docs pass/fail;
- JSON artifact pass/fail;
- runtime posture summary;
- current file seams;
- local deviations from this package;
- go/no-go recommendation for Prompt 02.


## Commit

No commit. This is a read-only prompt.

## Final Output Requirements

Use `reference/08_PROMPT_CLOSEOUT_TEMPLATE.md` where applicable. Include exact commands run, validation results, files changed, guardrail attestation, and residual risks.
