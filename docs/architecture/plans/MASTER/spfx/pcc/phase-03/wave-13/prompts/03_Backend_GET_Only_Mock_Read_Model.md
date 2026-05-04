# Prompt 03 — Backend GET-Only Mock Read Model

## Objective

Implement the Wave 13 backend GET-only mock read model for Buyout Log using existing PCC read-model conventions. The route/provider must be deterministic, read-only, fixture-backed, and must not call any external system.

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

Likely edit scope, subject to Prompt 01/02 repo truth:
- `backend/functions/src/hosts/pcc-read-model/**`.
- `backend/functions/src/services/__tests__/**` or repo-consistent backend test location.
- `packages/models/src/pcc/**` only if a minor read-model export correction is required by Prompt 02 contracts.


## Prohibited Scope

No SPFx UI/client changes. No external calls. No POST/PUT/PATCH/DELETE routes. No package/lockfile changes.


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
feat(functions-pcc): add buyout log read model route
```

## Required Deliverables

- Canonical GET-only route, likely:
  - `/api/pcc/projects/{projectId}/buyout-log`
- Provider method, likely:
  - `getBuyoutLog(projectId, viewerPersona?)`
- Known project fixture response.
- Unknown/degraded project safe response.
- Source-status warnings for missing config/source unavailable.
- No write route registration.
- Tests proving:
  - route shape;
  - GET-only posture;
  - provider returns deterministic fixture;
  - unknown project behavior;
  - no Procore/Sage/Graph/Autodesk imports or calls;
  - no write verbs.
