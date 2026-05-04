# Prompt 06 — Unified Lifecycle Integration Seams

## Objective

Wire safe Buyout Log integration seams into Project Readiness, Priority Actions, unified lifecycle memory/traceability concepts, Document Control evidence references, External Systems launcher-only posture, and future Wave 14 Approvals prompts. Keep all integration behavior reference-only and fixture-safe.

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
- `packages/models/src/pcc/**` for candidate/reference types only if Prompt 02 did not include them.
- `apps/project-control-center/src/surfaces/projectReadiness/**`.
- `apps/project-control-center/src/surfaces/priorityActions/**` if existing repo conventions support Priority Action previews.
- `apps/project-control-center/src/surfaces/documentControl/**` only for evidence-reference display if repo-standard.
- `apps/project-control-center/src/surfaces/externalSystems/**` only for launcher/reference display if repo-standard.
- `apps/project-control-center/src/tests/**`.


## Prohibited Scope

No approval execution. No evidence binary upload/download/storage. No external-system API calls. No Procore/Sage writeback. No new shell routes. No package/lockfile changes.


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
feat(spfx-pcc): wire buyout log lifecycle integration seams
```

## Required Seams

- Project Readiness source-module placement / linking.
- Priority Actions candidate references.
- Lifecycle Readiness references where appropriate.
- Permit/Inspection reference links where buyout readiness depends on permits/inspections.
- Responsibility Matrix reference links for BIC/decision-rights context.
- Constraints Log reference links for blockers and make-ready issues.
- Document Control evidence-link references only.
- External Systems launcher-only posture for Procore/Sage/SharePoint.
- Future Wave 14 approval/checkpoint prompts only; no execution.
- Project Memory contribution markers.
- Traceability edge display or reference markers.
- HBI eligibility markers but no live Ask-HBI integration unless existing Project Home HBI reads the model through current fixture data.

## Tests

- Existing region remains read-only.
- Priority Action candidate data renders without executing workflow.
- Evidence references do not own binaries.
- External Systems references do not call or write to external systems.
- Approvals prompts do not execute approvals.
- Source-lineage and traceability markers render.
- Forbidden route/workspace tokens absent.
