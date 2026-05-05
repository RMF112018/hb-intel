# Prompt 10 — Fresh Reviewer Prompt

## Objective

Act as an independent reviewer for the completed Wave 15 External Systems Launch Pad implementation. Audit repo truth, tests, guardrails, and residual risks. Do not implement changes unless separately authorized.

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


## Reviewer Scope

This is a review-only prompt.

## Required Review Areas

1. Confirm local repo truth and commits.
2. Confirm Wave 15 docs/artifacts still align with implementation.
3. Confirm models, backend, SPFx client, SPFx surface, and integration seams exist.
4. Confirm tests cover required behavior.
5. Confirm no hard guardrails breached.
6. Confirm package/lockfile/manifest unchanged unless separately authorized.
7. Confirm no live external API behavior.
8. Confirm no command/write routes.
9. Confirm no iframe/current-image embed behavior.
10. Confirm HBI no-authority.
11. Confirm Wave 14 ownership preserved.

## Required Validation

Run read-only inspections and targeted tests as appropriate:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -12
md5 pnpm-lock.yaml
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
```

Run more tests only if needed to resolve uncertainty.

## Final Reviewer Output

Return:

- pass/fail by area;
- evidence;
- files inspected;
- tests run;
- guardrail status;
- residual risks;
- recommended remediation prompts if any.


## Commit

No commit. This is a read-only prompt.

## Final Output Requirements

Use `reference/08_PROMPT_CLOSEOUT_TEMPLATE.md` where applicable. Include exact commands run, validation results, files changed, guardrail attestation, and residual risks.
