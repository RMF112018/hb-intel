# Prompt 07 — Tests, Guardrails, and Implementation Closeout

## Objective

Run final Wave 13 implementation validation, add any missing guardrail tests, and create the Wave 13 implementation closeout documentation under the blueprint Wave 13 path.

## Required Instruction Phrase

```text
Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.
```

## Working Directory

```text
/Users/bobbyfetting/hb-intel
```

## Global Guardrails

- Do not edit `docs/architecture/plans/**` unless separately authorized.
- Do not run broad formatting or broad Prettier writes across the repo.
- Do not change package dependencies, `pnpm-lock.yaml`, manifests, workflows, CI, deployment files, or tenant configuration unless the prompt explicitly authorizes and justifies it.
- Do not add backend write routes or mutation endpoints.
- Do not add Procore, Sage, Microsoft Graph, SharePoint REST/PnP, Autodesk, AHJ portal, utility portal, scraping, polling, sync, mirror, or write-back runtime behavior.
- Do not create, update, approve, post, or transmit commitments, purchase orders, subcontracts, SOVs, CCOs, invoices, payments, accounting entries, legal notices, claims, or entitlement determinations.
- Do not implement evidence-binary upload/download/sync/storage ownership in Wave 13; store/display references only.
- Do not execute Wave 14 approval/checkpoint behavior; create only reference prompts, signals, or candidate records.
- Stage only files authorized by the active prompt.
- Keep backend Wave 13 read model GET-only.
- Keep SPFx fixture-first unless backend opt-in is already repo-standard and explicitly configured.
- Preserve source-lineage for every source-derived value.



## Allowed Files / Likely Files

- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-13/Wave_13_Implementation_Closeout.md`
- `packages/models/src/pcc/**/*.test.ts`
- `backend/functions/src/**/*.test.ts`
- `apps/project-control-center/src/**/*.test.ts`
- `apps/project-control-center/src/**/*.test.tsx`

## Prohibited Scope

- Any file not needed for this prompt’s objective.
- Any unrelated refactor.
- Any broad formatting pass.
- Any lockfile/package/manifest/workflow/deployment change unless this prompt explicitly authorizes it.
- Any external-system runtime behavior, writeback, sync, or mutation.

## Repo-Truth Files to Inspect

- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-13/`
- `packages/models/src/pcc/`
- `backend/functions/src/hosts/pcc-read-model/`
- `apps/project-control-center/src/`
- `package.json`
- `packages/models/package.json`
- `backend/functions/package.json`
- `apps/project-control-center/package.json`

## Implementation Steps

1. Audit all Prompt 02–06 commits against Wave 13 target architecture and guardrails.
2. Add missing targeted tests only. Do not refactor implementation unless a guardrail/test gap requires it.
3. Add/confirm tests for:
   - model contracts and exports;
   - fixture determinism;
   - state transition maps;
   - completion gates;
   - waiver validation;
   - source-lineage requirements;
   - backend GET-only route behavior;
   - SPFx fixture/backend parity;
   - surface rendering and degraded states;
   - candidate-only Priority Action posture;
   - no prohibited imports/runtime calls;
   - no non-GET backend route.
4. Add `Wave_13_Implementation_Closeout.md` under the Wave 13 blueprint path.
5. Closeout must record:
   - commit sequence;
   - files changed by implementation;
   - validation commands/results;
   - lockfile status;
   - package/manifest/workflow/tenant status;
   - source-model placement/bridge decision;
   - remaining risks;
   - explicit no-writeback/no-mutation/no-accounting/no-legal/no-production-rollout confirmation.
6. Do not edit `docs/architecture/plans/**`.
7. Do not run broad formatting. Only targeted Prettier check/write if absolutely required on files touched by this prompt.

## Validation Commands

```bash
git status --short
md5 pnpm-lock.yaml
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
git diff --check
pnpm exec prettier --check docs/architecture/blueprint/sp-project-control-center/phase-3/wave-13/*.md packages/models/src/pcc/**/*.ts backend/functions/src/**/*.ts apps/project-control-center/src/**/*.ts apps/project-control-center/src/**/*.tsx
```

Also run targeted guardrail greps appropriate to touched files, for example:

```bash
grep -R "methods: \['GET'\]" backend/functions/src/hosts/pcc-read-model -n
grep -R "fetch(" apps/project-control-center/src -n
grep -R "@pnp\|Graph\|Procore\|Sage\|POST\|PATCH\|PUT\|DELETE" packages/models/src/pcc backend/functions/src/hosts/pcc-read-model apps/project-control-center/src -n
```

Do not treat string literals in documentation/tests as violations; inspect context.

## Staged-File Proof Before Commit

Before committing, run and report:

```bash
git status --short
git diff --name-only
git diff --cached --name-only
md5 pnpm-lock.yaml
```

Stage only files authorized by this prompt. Then run:

```bash
git diff --cached --name-only
git diff --cached --stat
```

## Commit Summary and Commit Description

Use this commit summary:

```text
test(pcc): close wave 13 buyout log implementation
```

Commit description:

```text
Completes Wave 13 Buyout Log implementation validation with targeted guardrail coverage and blueprint closeout evidence, confirming model, backend, SPFx, fixture, source-lineage, GET-only, fixture-first, no-writeback, no-accounting, no-legal-determination, and no-production-rollout posture.
```

## Final Output Requirements

Return:
- final commit hash;
- validation matrix;
- closeout doc path;
- source-model placement/bridge final decision;
- known residual risks;
- recommendation to run Prompt 08 in a fresh session.
