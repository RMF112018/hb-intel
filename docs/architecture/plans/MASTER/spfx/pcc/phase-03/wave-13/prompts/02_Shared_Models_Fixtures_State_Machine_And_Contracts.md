# Prompt 02 — Shared Models, Fixtures, State Machine, and Contracts

## Objective

Implement Wave 13 shared TypeScript model contracts, deterministic fixtures, lifecycle/state-machine utilities, completion gates, waiver validation posture, reconciliation status values, priority action reason codes, and the smallest safe source-model placement bridge/correction supported by Prompt 01 repo truth.

## Required Instruction Phrase

```text
Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.
```

## Working Directory

```text
/Users/bobbyfetting/hb-intel
```

## Global Guardrails

- Do not edit `docs/architecture/plans/**` unless separately authorized.
- Do not run broad formatting or broad Prettier writes across the repo.
- Do not change package dependencies, `pnpm-lock.yaml`, manifests, workflows, CI, deployment files, or tenant configuration unless the prompt explicitly authorizes and justifies it.
- Do not add backend write routes or mutation endpoints.
- Do not add Procore, Sage, Microsoft Graph, SharePoint REST/PnP, Autodesk, AHJ portal, utility portal, scraping, polling, sync, mirror, or write-back runtime behavior.
- Do not create, update, approve, post, or transmit commitments, purchase orders, subcontracts, SOVs, CCOs, invoices, payments, accounting entries, legal notices, claims, or entitlement determinations.
- Do not implement evidence-binary upload/download/sync/storage ownership in Wave 13; store/display references only.
- Do not execute Wave 14 approval/checkpoint behavior; create only reference prompts, signals, or candidate records.
- Stage only files authorized by the active prompt.
- Keep backend Wave 13 read model GET-only.
- Keep SPFx fixture-first unless backend opt-in is already repo-standard and explicitly configured.
- Preserve source-lineage for every source-derived value.



## Allowed Files / Likely Files

- `packages/models/src/pcc/BuyoutLog.ts`
- `packages/models/src/pcc/BuyoutLog.test.ts`
- `packages/models/src/pcc/fixtures/buyoutLog.ts`
- `packages/models/src/pcc/fixtures/index.ts`
- `packages/models/src/pcc/index.ts`
- `packages/models/src/index.ts`
- `packages/models/src/pcc/WorkflowModules.ts`
- `packages/models/src/pcc/WorkflowModules.test.ts`
- `packages/models/src/pcc/ProjectReadinessFramework.ts`
- `packages/models/src/pcc/ProjectReadinessFramework.test.ts`

## Prohibited Scope

- Any file not needed for this prompt’s objective.
- Any unrelated refactor.
- Any broad formatting pass.
- Any lockfile/package/manifest/workflow/deployment change unless this prompt explicitly authorizes it.
- Any external-system runtime behavior, writeback, sync, or mutation.

## Repo-Truth Files to Inspect

- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-13/Buyout_Log_Target_Architecture.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-13/Wave_13_Developer_Implementation_Decisions_And_Contracts.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-13/reference/*.json`
- `packages/models/src/pcc/WorkflowModules.ts`
- `packages/models/src/pcc/PccWorkCenters.ts`
- `packages/models/src/pcc/ProjectReadinessFramework.ts`
- `packages/models/src/pcc/fixtures/projectReadiness.ts`
- `packages/models/package.json`

## Implementation Steps

1. Re-read Prompt 01 final report and do not repeat already-current file reads unless repo truth needs verification.
2. Inspect Wave 13 JSON contracts and convert stable values into repo-compatible TypeScript literal unions/interfaces.
3. Add `BuyoutPackage` and required child record contracts: `BuyoutScopeLine`, `BudgetAllocation`, `CommitmentLink`, `ComplianceRequirement`, `ProcurementMilestone`, `EvidenceLink`, `ReconciliationIssue`, `AuditEvent`, `PriorityActionCandidate`.
4. Add field mutability model preserving PCC-owned, source-derived, calculated, waived, and read-only semantics.
5. Add lifecycle/state transition utilities from `buyout_state_machine.json`.
6. Add completion-gate utilities that cannot return complete without vendor, amount, LOI/subcontract/PO, commitment, compliance, procurement risk, reconciliation, and source-lineage posture.
7. Add waiver validation requiring reason, approver, timestamp, and evidence.
8. Add deterministic fixture data reflecting happy path, over/under budget variance, missing commitment link, compliance waiver, reconciliation mismatch, and blocked/deferred scenarios.
9. Export models and fixtures through existing repo export barrels.
10. Resolve or preserve the `buyout-log -> procurement-and-buyout` placement issue using the smallest safe repo-consistent bridge identified by Prompt 01. Do not invent a new architecture. Add regression tests for the selected posture.
11. Add model tests for exports, fixture determinism, state transitions, completion gates, waiver validation, lineage, and placement/bridge behavior.

## Validation Commands

```bash
git status --short
md5 pnpm-lock.yaml
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
git diff --check
pnpm exec prettier --check packages/models/src/pcc/**/*.ts packages/models/src/index.ts
```

## Staged-File Proof Before Commit

Before committing, run and report:

```bash
git status --short
git diff --name-only
git diff --cached --name-only
md5 pnpm-lock.yaml
```

Stage only files authorized by this prompt. Then run:

```bash
git diff --cached --name-only
git diff --cached --stat
```

## Commit Summary and Commit Description

Use this commit summary:

```text
feat(pcc): add wave 13 buyout log shared contracts
```

Commit description:

```text
Adds Wave 13 Buyout Log shared model contracts, deterministic fixtures, state-machine/completion-gate utilities, waiver/reconciliation posture, priority-action candidate vocabulary, and repo-consistent module placement bridge/correction while preserving source-lineage and no-writeback guardrails.
```

## Final Output Requirements

Return:
- files changed;
- placement/bridge decision and why;
- validation output;
- lockfile MD5 before/after;
- any residual risks for backend Prompt 03.
