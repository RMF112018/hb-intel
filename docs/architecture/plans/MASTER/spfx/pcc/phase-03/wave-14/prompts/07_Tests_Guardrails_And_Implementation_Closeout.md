# Prompt 07 — Tests, Guardrails, and Implementation Closeout

## Objective

Complete Wave 14 implementation validation, add missing guardrail tests, update implementation closeout documentation, and produce final commit evidence.

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


## Allowed / Likely Files

Subject to local repo truth:

```text
packages/models/src/pcc/**/*.test.ts
backend/functions/src/**/*.test.ts
apps/project-control-center/src/**/*.test.ts
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-14/Wave_14_Implementation_Closeout.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-14/Wave_14_Documentation_Closeout.md
```

If the repo already has a Wave 14 implementation closeout naming convention, use it. Do not write under `docs/architecture/plans/**` unless separately authorized.

## Prohibited Scope

- No new feature implementation except test/closeout fixes needed to close gaps from Prompts 02–06.
- No package/lockfile changes.
- No SPFx manifest/deployment changes.
- No backend write routes.
- No external-system/tenant mutation.
- No broad formatting.

## Required Test Categories

- model contract coverage;
- state transition valid/invalid paths;
- route-mode completion rules;
- reason-code and evidence validation;
- stale-source and supersession blocking;
- redaction and permission visibility;
- HBI no-authority/refusal behavior;
- fixture determinism;
- backend GET-only route behavior;
- SPFx client fixture/backend fallback behavior;
- SPFx rendering states;
- disabled action reasons;
- no prohibited imports/runtime calls;
- no enabled mutation buttons/links;
- package/lockfile/manifest/workflow guardrails.

## Implementation Steps

1. Run full targeted validation suite across packages touched by Prompts 02–06.
2. Identify missing guardrail tests or brittle assertions.
3. Add only targeted tests/closeout fixes.
4. Create/update Wave 14 implementation closeout.
5. Closeout must include:
   - Prompt 01–06 commit table;
   - final HEAD;
   - lockfile MD5 before/after;
   - validation command table;
   - file scope summary;
   - runtime posture;
   - residual risks;
   - follow-on hardening recommendations;
   - explicit guardrail attestation.
6. Do not claim production readiness or live approval execution.

## Baseline Validation Commands

Use repo-correct commands after inspecting package scripts. At minimum, run applicable targeted checks:

```bash
git status --short
git diff --check
git diff --name-only
git diff --cached --name-only
md5 pnpm-lock.yaml
```

For source/model/backend/SPFx prompts, use confirmed package scripts only. Current remote audit identified these likely scripts:

```bash
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
```

For markdown/json closeout files, use targeted Prettier only:

```bash
pnpm exec prettier --check <touched-markdown-json-files>
```

Never use broad `prettier --write` across the repo.

Recommended full targeted validation, subject to local scripts:

```bash
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm --filter @hbc/spfx-project-control-center build
pnpm exec prettier --check <touched-markdown-json-files>
git diff --check
```

## Staged-File Proof Before Commit

Before committing, show:

```bash
git diff --cached --name-only
git diff --cached --check
md5 pnpm-lock.yaml
```

Confirm the staged files match the allowed scope for this prompt. Do not commit unrelated drift.

## Commit Summary and Description

Use this format:

```text
Commit Summary
<type(scope): concise summary>

Commit Description
<paragraph describing exactly what changed>

Validation
- <command>: pass/fail
- <command>: pass/fail

Guardrails
- no external-system mutation
- no backend write routes
- no tenant/list/group/security mutation
- no package/lockfile/SPFx manifest/workflow mutation unless explicitly authorized
- HBI no-authority preserved
```

## Final Output Requirements

Return:

- files changed;
- validation commands and outcomes;
- lockfile MD5 before/after;
- staged-file proof;
- guardrail attestation;
- residual risks;
- exact commit summary and commit description;
- any required stop condition or user decision.
