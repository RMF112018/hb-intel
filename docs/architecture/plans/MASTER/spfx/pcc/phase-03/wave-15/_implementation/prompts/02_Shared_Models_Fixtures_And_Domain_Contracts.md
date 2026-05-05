# Prompt 02 — Shared Models, Fixtures, and Domain Contracts

## Objective

Implement Wave 15 shared TypeScript model contracts, deterministic fixtures, and pure policy/state helpers for External Systems Launch Pad. Do not touch backend routes or SPFx UI in this prompt.

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

- `packages/models/src/pcc/**`
- model tests under `packages/models/src/pcc/**`

## Required Reference Inputs

Read first:

```text
docs/04_DATA_MODEL_AND_READ_MODEL_CONTRACTS.md
reference/03_REQUIRED_CONTRACTS_AND_FIELDS.md
reference/04_HARD_GUARDRAILS.md
```

Then inspect current repo files listed in `reference/01_REQUIRED_REPO_TRUTH_FILES.md` under Models.

## Required Implementation

1. Preserve current external system catalog exports.
2. Add Wave 15 vocabulary tuples/types for categories, link types, approval states, mapping states, source-health states, review states, policy states, audit event types, and HBI lineage/refusal states.
3. Add Wave 15 interfaces/read-model types.
4. Add pure URL policy helper.
5. Add deterministic fixtures for known project, unknown project, degraded source, and backend-unavailable branches.
6. Export new types/fixtures through the existing `@hbc/models/pcc` export path.
7. Add tests.

## URL Policy Helper Requirements

- Use `new URL()`.
- Allow only HTTPS.
- Block localhost/loopback/private-like hosts where practical.
- Match hostnames against approved domains.
- Reject credential-like query parameters.
- Mark iframe/current-image blocked by default.
- Return structured reason codes.

## Required Tests

- Type/vocabulary coverage.
- URL helper allow/deny matrix.
- no secret-like fixture strings.
- fixture serialization.
- HBI allowed/refused fixture behavior.
- unknown project/degraded empty shapes.

## Validation

```bash
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
md5 pnpm-lock.yaml
```

## Prohibited

- No backend route edits.
- No SPFx UI edits.
- No package/lockfile changes.
- No live clients.


## Commit

Commit scoped changes if validations pass. Use the repo's standard commit summary/description style and include validation/guardrail evidence in the response.

## Final Output Requirements

Use `reference/08_PROMPT_CLOSEOUT_TEMPLATE.md` where applicable. Include exact commands run, validation results, files changed, guardrail attestation, and residual risks.
