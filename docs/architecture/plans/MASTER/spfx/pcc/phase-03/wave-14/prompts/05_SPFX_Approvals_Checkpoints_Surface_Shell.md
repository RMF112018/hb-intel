# Prompt 05 — SPFx Approvals / Checkpoints Surface Shell

## Objective

Implement the Wave 14 SPFx Approvals / Checkpoints surface shell and required read-only UX screen set using the read-model client/fixture patterns established in earlier prompts.

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
apps/project-control-center/src/surfaces/approvals/
apps/project-control-center/src/surfaces/projectHome/
apps/project-control-center/src/components/
apps/project-control-center/src/ui/
apps/project-control-center/src/layout/
apps/project-control-center/src/tests/
```

## Prohibited Scope

- No live decision execution.
- No enabled approve/reject/waive/override/defer/cancel/supersede/manual-close command execution.
- No direct external links that imply source-system writeback.
- No evidence binary upload/download/storage.
- No package/lockfile changes.
- No backend changes in this prompt unless tests reveal a compile seam and you stop for approval.

## Repo-Truth Files to Inspect

- `apps/project-control-center/src/surfaces/approvals/PccApprovalsSurface.tsx`
- `apps/project-control-center/src/surfaces/approvals/PccApprovalsSurface.module.css`
- `apps/project-control-center/src/surfaces/projectHome/PccApprovalsCheckpointsCard.tsx`
- existing surface patterns for constraints, buyout, project readiness, document control, site health, priority actions.
- `apps/project-control-center/src/api/` client from Prompt 04.
- Wave 14 UX/wireframe docs.

## Required UX Surfaces

1. Approvals Home
2. My Approvals
3. Approval Detail
4. Checkpoint Registry
5. Decision History
6. Escalation Queue
7. Admin Verification Queue
8. Module Integration Panels

## Required UX Behavior

- filters, sorting, pagination/read-model paging posture;
- saved-view posture if repo conventions support it;
- disabled action reasons;
- detail drawer/panel posture;
- route progress visualization;
- evidence/source lineage panel;
- audit/decision history panel;
- HBI summary panel with no-authority warning;
- read-only/degraded/loading/empty/access-denied states;
- keyboard traversal and screen-reader-friendly controls;
- no color-only status indicators.

## Implementation Steps

1. Replace or evolve preview-only list/card implementation with read-model-backed view-models.
2. Preserve fixture fallback and preview/degraded states.
3. Add surface sections for the required screen set.
4. Present action affordances as disabled/read-only unless command gate is explicit. Every disabled action must show reason text.
5. Add HBI panel copy that clearly states no decision authority.
6. Add source/evidence lineage panel with read-only references only.
7. Add audit timeline / decision history using append-only event vocabulary.
8. Update Project Home approvals card to consume read-model or view-model adapter rather than direct legacy `SAMPLE_APPROVAL_CHECKPOINTS`, if earlier prompts provide that seam.
9. Add responsive CSS matching existing PCC surface style.
10. Add tests for rendering, states, disabled reasons, HBI warning, no enabled mutation buttons, and no external mutation links.

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
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm --filter @hbc/spfx-project-control-center build
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
