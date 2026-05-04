# Prompt 02 — Shared Models, Fixtures, State Machine, and Contracts

## Objective

Implement Wave 14 shared TypeScript model contracts, deterministic fixtures, state-machine utilities, HBI refusal utilities, and tests under the repo-consistent PCC model package.

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
packages/models/src/pcc/
packages/models/src/pcc/fixtures/
packages/models/src/pcc/*.test.ts
packages/models/src/pcc/fixtures/*.test.ts
packages/models/src/index.ts
```

## Prohibited Scope

- No backend routes.
- No SPFx source.
- No package/lockfile changes.
- No Graph/PnP/SharePoint/Procore/Sage imports.
- No command execution runtime.
- No external writeback.
- No edits to `docs/architecture/plans/**`.

## Repo-Truth Files to Inspect

- `packages/models/src/pcc/ApprovalCheckpoint.ts`
- `packages/models/src/pcc/fixtures/approvals.ts`
- `packages/models/src/pcc/PccReadModels.ts`
- `packages/models/src/pcc/index.ts`
- Prior wave model patterns: `ConstraintsLog.ts`, `BuyoutLog.ts`, `ProjectReadinessFramework.ts`, `ResponsibilityMatrix.ts`, `UnifiedLifecycle.ts`
- Wave 14 blueprint docs and JSON artifacts.

## Implementation Steps

1. Inspect existing approval/checkpoint vocabulary before editing.
2. Decide whether to extend `ApprovalCheckpoint.ts`, create a new Wave 14 file, or bridge the old preview contract to a richer Wave 14 model. Prefer smallest safe extension aligned to existing barrels.
3. Add/extend typed contracts for:
   - `ApprovalRequest`
   - `ApprovalPolicy`
   - `ApprovalPolicyVersion`
   - `ApprovalRoute`
   - `ApprovalStep`
   - `ApprovalParticipant`
   - `ApprovalDecision`
   - `CheckpointDefinition`
   - `CheckpointInstance`
   - `CheckpointEvidenceLink`
   - `CheckpointSourceReference`
   - `CheckpointAuditEvent`
   - `ApprovalPriorityActionLink`
4. Add state/status tuples matching Wave 14 docs.
5. Add approval mode tuple and completion-rule helpers.
6. Add decision action and reason-code registries.
7. Add stale-source/supersession helpers.
8. Add evidence requirement validation helpers.
9. Add HBI no-authority/refusal helpers.
10. Add redaction/audit-event vocabulary.
11. Add deterministic fixtures covering queue/detail/registry/history/escalation/admin/policy/analytics families.
12. Export all new types/utilities/fixtures through existing barrels.
13. Add tests for:
   - tuple coverage;
   - transition validity;
   - route-mode completion;
   - evidence/reason-code validation;
   - stale/supersession blocking;
   - HBI refusal;
   - fixture determinism;
   - no prohibited runtime imports.

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
