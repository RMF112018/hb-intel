# Prompt 05 — SPFx Buyout Log Surface Shell

## Objective

Implement the user-facing Wave 13 Buyout Log / Buyout Control Center surface shell with safe read-only or safe-local UI behavior, aligned with existing PCC surface conventions and Project Readiness placement.

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

- `apps/project-control-center/src/shell/PccSurfaceRouter.tsx`
- `apps/project-control-center/src/surfaces/projectReadiness/`
- `apps/project-control-center/src/surfaces/buyoutLog/`
- `apps/project-control-center/src/components/`
- `apps/project-control-center/src/tests/`
- `apps/project-control-center/src/api/`
- `packages/models/src/pcc/BuyoutLog.ts`

## Prohibited Scope

- Any file not needed for this prompt’s objective.
- Any unrelated refactor.
- Any broad formatting pass.
- Any lockfile/package/manifest/workflow/deployment change unless this prompt explicitly authorizes it.
- Any external-system runtime behavior, writeback, sync, or mutation.

## Repo-Truth Files to Inspect

- `apps/project-control-center/src/shell/PccSurfaceRouter.tsx`
- `apps/project-control-center/src/surfaces/projectReadiness/PccProjectReadinessSurface.tsx`
- `apps/project-control-center/src/surfaces/projectReadiness/projectReadinessAdapter.ts`
- `apps/project-control-center/src/surfaces/projectReadiness/projectReadinessViewModel.ts`
- `apps/project-control-center/src/api/pccReadModelClient.ts`
- `apps/project-control-center/src/api/pccFixtureReadModelClient.ts`
- `packages/models/src/pcc/BuyoutLog.ts`
- `packages/models/src/pcc/fixtures/buyoutLog.ts`

## Implementation Steps

1. Inspect existing PCC surface patterns, bento/card primitives, degraded/loading/empty-state conventions, and tests.
2. Place Buyout Log under the Project Readiness user journey while preserving Procurement / Project Controls classification and future Procurement & Buyout Center affinity.
3. Build a surface entry using the SPFx client/fixture seam from Prompt 04.
4. Implement required UX sections:
   - Buyout Command Center;
   - Buyout Package Table;
   - Budget vs Commitment Matrix;
   - Unbought Scope Queue;
   - Procore Reconciliation View;
   - Buyout Package Detail Drawer or Detail Panel;
   - Compliance / SDI / Bond section;
   - Procurement / Submittal / Lead-Time section;
   - Evidence / Source Lineage section;
   - Audit History section.
5. Render source labels and lineage for source-derived fields.
6. Add display-only role/BIC cues. Do not implement permission mutation.
7. Add loading, empty, degraded/backend-unavailable, source-unavailable, read-only, and access-display states using repo-standard patterns.
8. Add tests for surface render, critical sections, degraded states, source-lineage display, and no external action buttons.
9. Do not add external-system calls, writes, approval execution, binary evidence behavior, or automatic commitment/PO/subcontract creation.

## Validation Commands

```bash
git status --short
md5 pnpm-lock.yaml
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
git diff --check
pnpm exec prettier --check apps/project-control-center/src/surfaces/**/*.ts apps/project-control-center/src/surfaces/**/*.tsx apps/project-control-center/src/components/**/*.ts apps/project-control-center/src/components/**/*.tsx apps/project-control-center/src/tests/**/*.ts apps/project-control-center/src/tests/**/*.tsx
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
feat(pcc): add buyout control center surface shell
```

Commit description:

```text
Adds the Wave 13 Buyout Control Center SPFx surface shell with command center, package table, budget-vs-commitment matrix, unbought scope, reconciliation, detail, compliance, procurement, evidence/source-lineage, and audit sections while preserving read-only fixture-first guardrails.
```

## Final Output Requirements

Return:
- surface path(s);
- UX sections implemented;
- states covered;
- tests added;
- validation output;
- explicit confirmation of no external writes, no approval execution, and no evidence-binary ownership.
