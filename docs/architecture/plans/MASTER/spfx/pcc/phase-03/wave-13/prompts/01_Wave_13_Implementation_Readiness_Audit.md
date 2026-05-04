# Prompt 01 — Wave 13 Implementation Readiness Audit

## Objective

Conduct a read-only audit before any Wave 13 implementation. Confirm current repo truth, Wave 13 planning artifacts, unified lifecycle developer contracts, source-model placement, route taxonomy, package scripts, model/backend/SPFx seams, and the exact implementation sequence for Prompts 02–07. Do not edit files and do not commit.

## Required Instruction Phrase

```text
Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.
```

## Working Directory

```text
/Users/bobbyfetting/hb-intel
```


## Global Hard Guardrails

- Keep Wave 13 as a safe PCC Project Readiness workflow module.
- Buyout Log is an MVP Project Readiness workflow module with Procurement / Project Controls classification and future Procurement & Buyout Center affinity.
- Do not create a standalone `buyout-log` shell route unless current repo route taxonomy already explicitly authorizes it. Current unified lifecycle route taxonomy treats Buyout Log as a workflow/module region under approved PCC surfaces, not as a new shell workspace.
- Do not implement Procore, Sage, Microsoft Graph, Autodesk, Document Crunch, Adobe Sign, DocuSign, AHJ, utility, vendor-portal, or external-system runtime calls.
- Do not implement writeback, mirroring, scraping, sync, polling, production rollout, or tenant mutation.
- Do not create Procore commitments, purchase orders, subcontracts, SOVs, CCOs, invoices, or payments.
- Do not post to Sage or make accounting determinations.
- Do not make legal, claim, entitlement, compensability, delay-damages, or forensic schedule-analysis determinations.
- Do not create legal/contractual obligations automatically.
- Do not own evidence binaries in Wave 13; use Document Control / SharePoint evidence references only.
- Do not execute approvals/checkpoints; Wave 14 owns approval/checkpoint execution.
- Do not edit `docs/architecture/plans/**` unless the prompt explicitly authorizes it. This package does not authorize it.
- Do not change package dependencies, `pnpm-lock.yaml`, SharePoint manifests, workflows/CI, or deployment artifacts unless a prompt explicitly authorizes and justifies it. These prompts do not authorize them.
- Use fixture-first and read-only posture unless a prompt explicitly authorizes a repo-standard backend opt-in seam.
- Stage only files authorized by the current prompt.


## Allowed Files / Likely Files

Read-only inspection only. Likely files/directories:
- Governing PCC docs and unified lifecycle developer contracts.
- `phase-3/wave-13/**`.
- `packages/models/src/pcc/**`.
- `backend/functions/src/hosts/pcc-read-model/**`.
- `apps/project-control-center/src/api/**`.
- `apps/project-control-center/src/surfaces/**`.
- package manifests.


## Prohibited Scope

No edits. No staged files. No commit.


## Required Repo Truth / Validation Commands

Run and record before edits:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -12
md5 pnpm-lock.yaml
```

Expected lockfile MD5 unless explicitly justified and authorized:

```text
c56df7b79986896624536aab74d609f4
```

Run before commit:

```bash
git diff --check
git diff --stat
git diff --name-only
git diff --cached --name-only
```

For touched markdown/json files:

```bash
pnpm exec prettier --check <touched markdown/json files>
```

For touched JSON files:

```bash
python3 -m json.tool <each touched json file> >/dev/null
```

For source implementation prompts, inspect the relevant `package.json` files before selecting package commands. Do not guess package scripts. Use repo-confirmed equivalents of:

```bash
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
```



## Commit Discipline

- Commit only after all validation gates pass.
- Do not push unless explicitly instructed.
- The final response must include:
  - branch and HEAD before/after;
  - files inspected;
  - files changed;
  - validation commands/results;
  - lockfile MD5 before/after;
  - guardrail confirmation;
  - commit hash, title, and description if committed;
  - explicit note that push was not performed unless instructed.


## Recommended Commit Title

```text
no commit — read-only audit
```

## Implementation Steps

1. Run repo-truth commands.
2. Validate the Wave 13 artifact inventory:
   - six root markdown docs;
   - eight reference JSON files;
   - workbook source path exists.
3. Validate all Wave 13 reference JSONs with `python3 -m json.tool`.
4. Inspect unified lifecycle developer contracts:
   - route taxonomy;
   - bounded contexts;
   - state machines;
   - field dictionary;
   - permission/redaction;
   - HBI citation/refusal;
   - source integration;
   - audit/degraded states;
   - module onboarding;
   - validation gates.
5. Inspect `WorkflowModules.ts` and any Project Readiness source-module taxonomy to determine the current `buyout-log` placement.
6. Decide one of:
   - Preserve `buyout-log -> procurement-and-buyout` as affinity and add a Project Readiness/source-module bridge; or
   - Make a minimal model metadata correction if repo truth explicitly supports it.
7. Inspect package scripts and record exact validation commands for models/backend/SPFx.
8. Inspect existing read-model route/provider and SPFx client patterns.
9. Inspect Project Readiness surface conventions for embedded module regions.
10. Produce a read-only report.

## Required Final Output

- Branch/HEAD/status.
- Lockfile MD5.
- Wave 13 artifact validation.
- Unified lifecycle contract readiness.
- `buyout-log` placement recommendation.
- Exact prompt-by-prompt file plan.
- Exact validation commands confirmed by package scripts.
- No commit confirmation.
