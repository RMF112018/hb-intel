# Prompt 01 — Wave 13 Implementation Readiness Audit

## Objective

Conduct a read-only local repo-truth audit for PCC Phase 3 Wave 13 `Buyout Log` / `Buyout Control Center`. Do not edit files. Produce a decision-ready report that confirms implementation seams, package scripts, Wave 13 artifact completeness, and the repo-consistent answer to the `buyout-log` placement / future `procurement-and-buyout` affinity issue.

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

Read-only only. No files may be edited, created, staged, or committed.

## Prohibited Scope

- Do not edit source, docs, JSON, package files, lockfiles, manifests, workflows, or generated artifacts.
- Do not run formatting write commands.
- Do not stage or commit.
- Do not implement Wave 13.

## Repo-Truth Files to Inspect

Use `reference/01_REQUIRED_REPO_TRUTH_FILES.md` from this package as the checklist.

At minimum inspect:

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

## Required Local Commands

Run and report exact output:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -12
md5 pnpm-lock.yaml
```

Also run:

```bash
find docs/architecture/blueprint/sp-project-control-center/phase-3/wave-13 -maxdepth 2 -type f | sort
find docs/architecture/blueprint/sp-project-control-center/phase-3/wave-13 -maxdepth 2 -type f | wc -l
```

## Wave 13 Artifact Validation

1. Confirm all six root markdown files exist.
2. Confirm all eight reference JSON files exist.
3. Validate all eight JSON files with `python3 -m json.tool`.
4. Run targeted Prettier check on Wave 13 markdown/json files only:

```bash
pnpm exec prettier --check docs/architecture/blueprint/sp-project-control-center/phase-3/wave-13/*.md docs/architecture/blueprint/sp-project-control-center/phase-3/wave-13/reference/*.json
```

## Repo-Truth Questions to Answer

Answer all 25 questions from `reference/01_REQUIRED_REPO_TRUTH_FILES.md`.

Pay special attention to:

- Whether `WorkflowModules.ts` includes `buyout-log`.
- Whether `WorkflowModules.ts` maps `buyout-log` to `procurement-and-buyout`.
- Whether `procurement-and-buyout` is still `Later`.
- Whether Project Readiness has a source-module/workflow-module seam that can host Buyout Log while preserving future Procurement & Buyout Center affinity.
- Which files Prompt 02 should edit to resolve or bridge the placement issue.

## Web Research Refresh

Perform a current web-search refresh before generating the audit report. Summarize only product-pattern findings relevant to:

- construction buyout;
- bid leveling;
- Procore commitments / SOV / CCO / vendors / insurance compliance;
- Sage committed/actual job-cost posture;
- compliance / SDI / bonds / lien-waiver tracking;
- long-lead procurement and submittal schedule exposure;
- comparable command-center UX patterns.

Do not treat research as authority to clone external tools or violate repo guardrails.

## Validation Commands

No implementation validation is required because this is read-only.

Still run and report:

```bash
git status --short
git diff --name-only
git diff --cached --name-only
md5 pnpm-lock.yaml
```

Expected result: no new changes from this prompt.

## Staged-File Proof Before Commit

No commit. Confirm:

```bash
git diff --name-only
git diff --cached --name-only
```

Both should be empty or should contain only pre-existing user-owned changes not caused by this audit.

## Commit Summary and Commit Description

No commit. This is read-only.

## Final Output Requirements

Return a structured report with:

1. Local HEAD, branch, status, and lockfile MD5.
2. Wave 13 artifact completeness and JSON validation status.
3. Naming/governance sentence validation.
4. `buyout-log` source-model placement finding.
5. Recommended implementation path for the placement/bridge issue.
6. Confirmed model/backend/SPFx seams.
7. Confirmed package scripts.
8. Prompt-by-prompt file edit recommendations.
9. Any stop conditions before Prompt 02.
