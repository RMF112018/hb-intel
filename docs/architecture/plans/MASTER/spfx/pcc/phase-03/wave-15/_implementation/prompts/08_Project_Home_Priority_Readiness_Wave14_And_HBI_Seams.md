# Prompt 08 — Project Home, Priority Actions, Readiness, Wave 14, and HBI Seams

## Objective

Implement additive Wave 15 integration seams for Project Home, Priority Actions, Project Readiness, Wave 14 approvals/checkpoints, and HBI without transferring source ownership or adding write behavior.

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

- `apps/project-control-center/src/surfaces/projectHome/**`
- `apps/project-control-center/src/surfaces/projectReadiness/**`
- `apps/project-control-center/src/viewModels/**`
- related SPFx tests
- External Systems surface files only as needed for integration wiring

## Required Reference Inputs

Read:

```text
docs/02_IMPLEMENTATION_SEQUENCE_OVERVIEW.md
docs/03_TARGET_ARCHITECTURE_AND_RUNTIME_SCOPE.md
reference/04_HARD_GUARDRAILS.md
```

Also inspect current Wave 14 seam files because `main` may include `fca4748...` changes.

## Required Implementation

1. Create pure adapter(s) for External Systems -> Priority Action candidates.
2. Create pure adapter(s) for External Systems -> Project Readiness blocker/reference rows.
3. Add Project Home summary/card slot if existing project-home pattern supports it.
4. Add Wave 14 handoff reference only where mapping correction/checkpoint semantics apply.
5. Preserve Wave 14 source-module ownership and decision authority.
6. Preserve HBI no-authority.
7. Add tests for dedupe, mapping, and ownership captions.

## Candidate Priority Actions

Use additive candidates for:

- pending custom link review;
- blocked launch link;
- stale mapping;
- mapping conflict;
- missing critical mapping;
- source health degraded/throttled;
- admin verification required;
- HBI insufficient evidence requiring human review.

Do not create active command behavior.

## Required Tests

- deterministic dedupe keys;
- terminal/archived/resolved items skipped;
- source ownership metadata preserved;
- Wave 14 handoff references are references only;
- Project Home/card summary renders without importing full surface internals;
- HBI no-authority retained.

## Validation

```bash
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm --filter @hbc/spfx-project-control-center build
pnpm --filter @hbc/spfx-project-control-center lint
md5 pnpm-lock.yaml
```


## Commit

Commit scoped changes if validations pass. Use the repo's standard commit summary/description style and include validation/guardrail evidence in the response.

## Final Output Requirements

Use `reference/08_PROMPT_CLOSEOUT_TEMPLATE.md` where applicable. Include exact commands run, validation results, files changed, guardrail attestation, and residual risks.
