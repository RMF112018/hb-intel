# Prompt 05 — SPFx Buyout Log Project Readiness Surface

## Objective

Implement the user-facing Buyout Log / Buyout Control Center UI as an embedded Project Readiness module region or repo-standard module section. It must not create a standalone buyout shell workspace unless Prompt 01 found an already-approved route taxonomy authorizing it.

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
- `apps/project-control-center/src/surfaces/projectReadiness/**`.
- `apps/project-control-center/src/surfaces/buyoutLog/**` only if repo convention uses module subfolders for embedded regions.
- `apps/project-control-center/src/components/**` only for reusable local UI primitives if necessary.
- `apps/project-control-center/src/tests/**`.


## Prohibited Scope

No shell route addition unless route taxonomy explicitly authorizes it. No backend/client changes unless Prompt 04 missed a compile-required seam. No external calls. No package/lockfile changes.


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
feat(spfx-pcc): add buyout log project readiness surface
```

## Required UX Regions

Implement read-only / safe-local UI for:

1. Buyout Command Center.
2. Buyout Package Table.
3. Budget vs Commitment Matrix.
4. Unbought Scope Queue.
5. Procore Reconciliation View.
6. Buyout Package Detail Drawer or Detail Panel.
7. Compliance / SDI / Bond section.
8. Procurement / Submittal / Lead-Time section.
9. Evidence / Source Lineage section.
10. Audit History section.

## Unified Lifecycle Requirements

- Show Project Readiness impact.
- Show source-lineage badges.
- Show traceability edges / related records.
- Show Project Memory contribution posture.
- Show HBI eligibility as future-gated / citation-required.
- Display degraded/empty/stale/permission-restricted states.
- Use no-blame, no-legal, no-accounting-determination language.

## Tests

- Card/region rendering.
- Table/detail drawer behavior.
- Loading/error/degraded/empty states.
- Source-lineage labels.
- No anchors to live Procore/Sage/Graph endpoints.
- No route/workspace markers for forbidden buyout workspaces.
- Bento/direct-child invariants where applicable.
- Accessibility for alerts/controls.
