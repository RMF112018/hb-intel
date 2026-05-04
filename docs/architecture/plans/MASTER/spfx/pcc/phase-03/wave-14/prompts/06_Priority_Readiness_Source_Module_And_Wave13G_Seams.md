# Prompt 06 — Priority, Readiness, Source Module, and Wave 13G Seams

## Objective

Wire safe read-only integration seams between Wave 14 approvals/checkpoints and Priority Actions, Project Readiness, source modules, Wave 13G Estimating Workbench references, External Systems, and Site Health.

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
apps/project-control-center/src/surfaces/priorityActions/
apps/project-control-center/src/surfaces/projectReadiness/
apps/project-control-center/src/surfaces/documentControl/
apps/project-control-center/src/surfaces/approvals/
apps/project-control-center/src/surfaces/externalSystems/
apps/project-control-center/src/surfaces/siteHealth/
apps/project-control-center/src/viewModels/
apps/project-control-center/src/tests/
packages/models/src/pcc/
```

## Prohibited Scope

- No source module ownership transfer.
- No evidence binary ownership.
- No external writeback/sync/mirror.
- No Procore/Sage/Graph/PnP/SharePoint mutation.
- No Wave 13G feature/UX ownership changes.
- No approval command execution.
- No package/lockfile changes.

## Repo-Truth Files to Inspect

- Wave 14 Source Module Integration Contract.
- Wave 14 Wave13G Estimating Checkpoint Contract.
- `apps/project-control-center/src/surfaces/priorityActions/`
- `apps/project-control-center/src/surfaces/projectReadiness/`
- `apps/project-control-center/src/surfaces/documentControl/`
- `apps/project-control-center/src/surfaces/externalSystems/`
- `apps/project-control-center/src/surfaces/siteHealth/`
- Prompt 02 models and Prompt 05 view-models.

## Required Integration Seams

- Priority Actions candidate references and dedupe/resolve/suppress behavior.
- Project Readiness gate references and blocker rollups.
- Team & Access admin verification references.
- Document Control evidence links only.
- Permit/Inspection exception/waiver references.
- Responsibility Matrix exception/escalation references.
- Constraints Log deferral/waiver/override references.
- Buyout Log handoff/checkpoint references.
- Wave 13G estimating freeze/baseline/handoff/validation override/buyout seed/template-admin/cost-code mapping exception references.
- External Systems mapping correction references only.
- Site Health repair/admin verification references.
- Executive Oversight/Admin Review visibility references.

## Implementation Steps

1. Add pure adapter/utilities for approval-derived Priority Action candidates.
2. Implement deterministic dedupe key: `projectId|approvalRequestId|currentStepId|actionType`.
3. Map terminal/superseded/expired/manual-close/no-longer-current step states to resolve/suppress posture.
4. Surface readiness gate blocker references without owning readiness source data.
5. Add source-module integration panels to Approvals surface using read-only references.
6. Preserve Wave 13G feature ownership language in UI copy or test assertions where applicable.
7. Add tests that prove source boundaries and no mutation.
8. Add guardrail tests for forbidden runtime imports or action labels that imply execution.

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
pnpm --filter @hbc/models test
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
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
