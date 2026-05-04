# Prompt 03 — Backend GET-Only Mock Read Model

## Objective

Implement GET-only backend read-model provider/route coverage for Wave 14 Approvals / Checkpoints using the existing PCC read-model host conventions.

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
backend/functions/src/hosts/pcc-read-model/
backend/functions/src/hosts/pcc-read-model/read-models/
backend/functions/src/hosts/pcc-read-model/*.test.ts
backend/functions/src/services/__tests__/
packages/models/src/pcc/
```

## Prohibited Scope

- No POST/PUT/PATCH/DELETE routes.
- No backend command handlers.
- No persistence.
- No Graph/PnP/SharePoint REST/Procore/Sage/Power Automate runtime calls.
- No package/lockfile/manifest/workflow changes.
- No SPFx source.

## Repo-Truth Files to Inspect

- `backend/functions/src/hosts/pcc-read-model/pcc-read-model-routes.ts`
- `backend/functions/src/hosts/pcc-read-model/read-models/pcc-read-model-provider.ts`
- `backend/functions/src/hosts/pcc-read-model/read-models/pcc-mock-read-model-provider.ts`
- `backend/functions/src/hosts/pcc-read-model/pcc-read-model-routes.test.ts`
- tests that assert GET-only posture and prohibited imports.
- Model contracts from Prompt 02.

## Implementation Steps

1. Confirm Prompt 02 model contracts are present and exported.
2. Inspect existing one-route-per-module conventions.
3. Decide whether to implement:
   - one composite `approvals` route; or
   - split route families; or
   - composite first with nested read-model families.
   Default to one composite route if current PCC conventions favor surface/module route IDs.
4. Extend provider interface with approvals/checkpoints read model method(s).
5. Extend mock provider with deterministic known-project, unknown-project, and backend-unavailable behavior.
6. Preserve read-model envelope shape, source-status warnings, generated timestamps, read-only flag, and fixture determinism.
7. Register GET-only route(s) under `/api/pcc/projects/{projectId}/...`.
8. Add tests proving:
   - route exists;
   - route method is GET only;
   - known project returns populated envelope;
   - unknown project returns safe degraded/empty project-scoped data while preserving module identity;
   - provider has no prohibited imports/runtime calls;
   - no write routes exist;
   - no external-system mutation path exists.

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

Recommended targeted commands if scripts match local repo:

```bash
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
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
