# Prompt 07 — Tests, Guardrails, and Implementation Closeout

## Objective

Run final hardening, guardrail tests, and implementation closeout for Wave 13 Buyout Log. Add or update closeout documentation only after source implementation is validated.

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

Likely edit scope:
- Tests in touched packages/apps.
- Closeout doc under `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-13/` if repo convention supports implementation closeout.
- No `docs/architecture/plans/**`.


## Prohibited Scope

No feature expansion beyond closing gaps discovered during testing. No broad formatting. No package/lockfile/manifest/workflow changes unless already required and authorized by prior prompts, which this package does not expect.


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
docs(pcc): close wave 13 buyout log implementation
```

## Required Hardening Areas

- Model tests.
- Backend tests.
- SPFx tests.
- Guard tests:
  - no external imports;
  - no live URLs;
  - no write methods/routes;
  - no forbidden workspace/route markers;
  - no HBI source-of-truth claims;
  - no legal/claim/accounting determination language.
- Accessibility and degraded-state coverage.
- Validation evidence.

## Required Closeout Sections

1. Objective.
2. Starting and ending repo truth.
3. Files changed by prompt/stage.
4. Model contract proof.
5. Backend read-model proof.
6. SPFx UI proof.
7. Unified lifecycle integration proof.
8. Guardrail proof.
9. Validation evidence.
10. Lockfile/package/manifest posture.
11. Deferred items.
12. Readiness for Wave 14 / next wave.
