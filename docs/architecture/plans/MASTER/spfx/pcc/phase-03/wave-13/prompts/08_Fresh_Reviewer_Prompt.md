# Prompt 08 — Fresh Reviewer Prompt

## Objective

Act as a fresh-session implementation reviewer for PCC Phase 3 Wave 13 `Buyout Log` / `Buyout Control Center`. Audit the actual repo truth after local execution, not just commit summaries. Determine implementation completeness, architectural alignment, guardrail compliance, test evidence, and readiness for Wave 14 or hardening.

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

Read-only review only unless the user separately authorizes a remediation prompt. Inspect:

- Wave 13 documentation and closeout files.
- All Prompt 02–07 changed files.
- Model/backend/SPFx tests.
- Package scripts and validation evidence.
- `git log`, `git show`, and actual file contents.

## Prohibited Scope

- Do not edit files.
- Do not stage or commit.
- Do not generate remediation code unless the user explicitly asks.
- Do not rely on commit summaries alone.

## Repo-Truth Files to Inspect

At minimum:

- `docs/architecture/blueprint/sp-project-control-center/HB_Project_Control_Center_Target_Architecture_Blueprint.md`
- `docs/architecture/blueprint/sp-project-control-center/System_of_Record_Matrix.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/01_PCC_Product_Architecture_and_User_Journey_Blueprint.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/05_Phase_3_Development_Roadmap_Updated.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/07_Phase_3_Module_Implementation_Plan.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/Register_MVP_Scope.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/Register_Workflow_Module_Register.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-8/`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-9/`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-10/`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-11/`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-12/`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-13/`
- `packages/models/src/pcc/`
- `packages/models/src/pcc/fixtures/`
- `packages/models/src/index.ts`
- `backend/functions/src/hosts/pcc-read-model/`
- `backend/functions/src/services/__tests__/`
- `apps/project-control-center/src/surfaces/`
- `apps/project-control-center/src/api/`
- `apps/project-control-center/src/fixtures/`
- `apps/project-control-center/src/tests/`
- `apps/project-control-center/package.json`
- `packages/models/package.json`
- `backend/functions/package.json`
- `package.json`

Also inspect the full changed-file set for every Wave 13 implementation commit.

## Review Steps

1. Run and report:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -12
md5 pnpm-lock.yaml
```

2. Identify all Wave 13 implementation commits after baseline `5bb2cbbfeaffddad59d785542677d58914e6f61b`.
3. For each implementation commit:
   - list changed files;
   - inspect actual changed content;
   - compare content to the corresponding prompt instruction;
   - compare content to Wave 13 target architecture;
   - identify omissions, drift, overreach, or guardrail violations.
4. Validate the implementation against:
   - shared contracts and exports;
   - fixture determinism;
   - state machine and completion gates;
   - backend GET-only posture;
   - SPFx fixture-first posture;
   - surface UX sections;
   - Priority Action candidate-only semantics;
   - no external-system mutation;
   - no legal/claim/accounting determinations;
   - no evidence-binary ownership;
   - no Wave 14 approval execution;
   - source-lineage for source-derived values.
5. Run repo-appropriate validation commands after inspecting package scripts.
6. Produce a readiness report with:
   - complete;
   - partially complete;
   - incomplete;
   - blocked;
   - recommendations.

## Validation Commands

Use local repo scripts after inspecting package files. Minimum expected categories:

```bash
git status --short
git diff --check
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
```

## Staged-File Proof Before Commit

No commit. Confirm no edits:

```bash
git diff --name-only
git diff --cached --name-only
```

## Commit Summary and Commit Description

No commit. This is a read-only reviewer prompt.

## Final Output Requirements

Return:

1. Executive review status.
2. Repo-truth baseline and commit range reviewed.
3. Prompt-by-prompt implementation audit.
4. Guardrail audit.
5. Test and validation evidence audit.
6. Source-model placement/bridge audit.
7. Readiness for Wave 14 or hardening.
8. Required remediation prompts if gaps are found.
