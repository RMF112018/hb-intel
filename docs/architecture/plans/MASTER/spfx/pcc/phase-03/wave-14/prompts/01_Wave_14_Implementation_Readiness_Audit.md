# Prompt 01 — Wave 14 Implementation Readiness Audit

## Objective

Run a read-only local repo-truth audit for Wave 14 Approvals / Checkpoints. Do not edit files, do not stage files, and do not commit.

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
- Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.
- Preserve Wave 14 as a PCC-native approval/checkpoint control layer.
- Preserve source-module ownership. Do not transfer source record ownership to Phase 14.
- Preserve Wave 13G as Estimating Workbench feature/UX authority.
- Backend posture is GET-only until a separate command gate is explicitly authorized.
- SPFx posture is fixture-first unless the repo-standard backend opt-in path is already present and explicitly used.
- Do not add live approval execution, command handlers, external-system writeback, SharePoint/Graph/PnP mutation, tenant/list/group/security mutation, package/dependency changes, workflow changes, CI changes, deployment, or production rollout.
- Do not add legal, claim, entitlement, compensability, delay-damages, pricing, award, or accounting authority behavior.
- HBI may summarize/cite visible evidence and explain policy requirements only. HBI must not approve, reject, waive, override, defer, cancel, supersede, manual-close, price, recommend award as authority, post accounting entries, or execute source-system mutations.
- Do not use Power Automate as an MVP runtime dependency. It is reference architecture only unless a future integration gate authorizes it.
- Do not run broad formatting across the repo.
- Do not mutate `package.json`, `pnpm-lock.yaml`, SPFx manifests, tenant config, or deployment/package-solution files unless the prompt explicitly authorizes it and you first stop for approval.
- Do not edit `docs/architecture/plans/**` unless the prompt explicitly authorizes a closeout/auditor artifact there.


## Prohibited Scope

- No file edits.
- No package/lockfile/manifest changes.
- No source implementation.
- No documentation updates.
- No formatting writes.

## Repo-Truth Files to Inspect

Use `reference/01_REQUIRED_REPO_TRUTH_FILES.md` from this package as the checklist.

At minimum, inspect:

- Wave 14 blueprint docs;
- Wave 14 `_doc-updates/artifacts/*.json`;
- current approvals model/fixtures/surface files;
- backend read-model provider/routes;
- SPFx API read-model clients;
- project home approvals card;
- package scripts for models/functions/SPFx.

## Audit Steps

1. Run initial repo-truth commands.
2. Confirm latest HEAD and whether it includes `8924b5ce6432a7afe154d5f67fda8cf28164ec67` or equivalent Wave 14 closeout.
3. Confirm worktree cleanliness and identify unrelated user-owned drift.
4. Confirm all Wave 14 blueprint docs exist.
5. Confirm all JSON artifacts listed in `manifest.json` exist.
6. Validate all Wave 14 JSON artifacts with `python3 -m json.tool`.
7. Confirm closeout table references Prompt 01–07 evidence.
8. Inspect current model/fixture/surface/backend/client posture.
9. Confirm package scripts from `packages/models/package.json`, `backend/functions/package.json`, and `apps/project-control-center/package.json`.
10. Produce a recommended implementation sequence and stop/go report.

## Validation Commands

Read-only commands only:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -12
md5 pnpm-lock.yaml
python3 -m json.tool <each-wave-14-json-artifact> >/dev/null
```

## Commit

No commit. Read-only report only.

## Final Output Requirements

Return:

- branch/HEAD;
- worktree status;
- lockfile MD5;
- Wave 14 documentation/artifact pass/fail;
- existing approvals model/surface/backend/client posture;
- confirmed package scripts;
- implementation-readiness gaps;
- stop/go recommendation.
