# Prompt 09 — Tests, Guardrails, and Implementation Closeout

## Objective

Run final targeted validation, harden any missing test coverage, and add a Wave 15 implementation closeout if authorized. Do not expand runtime scope.

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


## Authorized Scope

- tests related to Wave 15 implementation;
- narrowly scoped bug fixes required by tests;
- optional closeout doc under `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15/`.

## Required Reference Inputs

Read:

```text
docs/09_TESTING_VALIDATION_AND_CLOSEOUT_GATES.md
reference/08_PROMPT_CLOSEOUT_TEMPLATE.md
```

## Required Actions

1. Re-run targeted validations for models, backend, SPFx.
2. Add missing tests only where implementation behavior lacks coverage.
3. Confirm no prohibited scope entered.
4. Confirm lockfile unchanged.
5. Confirm no manifest/Sppkg/version/deployment changes.
6. Add closeout doc if this prompt is being used as final implementation closeout.

## Required Validation

```bash
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm --filter @hbc/spfx-project-control-center build
pnpm --filter @hbc/spfx-project-control-center lint
md5 pnpm-lock.yaml
```

If any command fails because of unrelated pre-existing drift, capture exact failure, identify why it is unrelated, and stop for user guidance unless the fix is inside authorized Wave 15 files.

## Closeout Doc Suggested Path

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15/Wave_15_Implementation_Closeout.md
```

## Closeout Doc Minimum Content

- prompt sequence completed;
- commits and changed files;
- validations;
- guardrails;
- no runtime external writes;
- residual risks;
- future command/write/provisioning gates.


## Commit

Commit scoped changes if validations pass. Use the repo's standard commit summary/description style and include validation/guardrail evidence in the response.

## Final Output Requirements

Use `reference/08_PROMPT_CLOSEOUT_TEMPLATE.md` where applicable. Include exact commands run, validation results, files changed, guardrail attestation, and residual risks.
