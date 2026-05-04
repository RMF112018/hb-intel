# Prompt 02 — Shared Models, Fixtures, State Machine, and Contracts

## Objective

Implement the Wave 13 model-layer contracts, deterministic fixtures, state machines, completion-gate utilities, source-lineage posture, Project Memory / traceability contributions, HBI eligibility markers, and tests for Buyout Log. Resolve or bridge the `buyout-log` placement issue using Prompt 01 repo truth.

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

Likely edit scope, subject to Prompt 01 repo truth:
- `packages/models/src/pcc/BuyoutLog.ts` or repo-consistent equivalent.
- `packages/models/src/pcc/fixtures/buyoutLog.ts` or repo-consistent equivalent.
- `packages/models/src/pcc/WorkflowModules.ts` only if Prompt 01 confirms a minimal safe bridge/correction.
- `packages/models/src/pcc/ProjectReadinessFramework.ts` only if Prompt 01 confirms needed source-module bridge.
- `packages/models/src/pcc/index.ts`.
- `packages/models/src/pcc/*.test.ts`.
- `packages/models/src/pcc/fixtures/index.ts`.


## Prohibited Scope

No backend/SPFx/docs changes except extremely narrow doc closeout notes if Prompt 01 explicitly requires them. No package/lockfile changes.


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
feat(models-pcc): add wave 13 buyout log contracts
```

## Required Deliverables

- `BuyoutPackage` primary record contract.
- Child record contracts:
  - `BuyoutScopeLine`
  - `BudgetAllocation`
  - `CommitmentLink`
  - `ComplianceRequirement`
  - `ProcurementMilestone`
  - `EvidenceLink`
  - `ReconciliationIssue`
  - `AuditEvent`
  - `PriorityActionCandidate`
  - `ProjectMemoryContribution`
  - `TraceabilityEdgeContribution`
  - `HbiEligibilityMarker`
- Closed status vocabularies.
- State transition map and transition guard utilities.
- Completion gate utility.
- Waiver validation utility.
- Budget vs commitment reconciliation utility.
- Field mutability vocabulary.
- Source-lineage / evidence-link requirement helpers.
- HBI eligibility predicate that requires source lineage and permission-safe posture.
- Deterministic fixtures for ready, blocked, compliance-hold, over-budget, missing-lineage, unknown/degraded cases.
- Tests for:
  - exports;
  - enum/status exhaustiveness;
  - state transitions;
  - completion gates;
  - waiver rules;
  - source-lineage requirements;
  - HBI eligibility;
  - fixture determinism;
  - `buyout-log` bridge/correction.
