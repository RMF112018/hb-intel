# Prompt 06 — Priority, Readiness, Approvals, Document Control, and External Seams

## Objective

Wire safe reference-only Wave 13 integration seams so Buyout Log participates in Project Readiness, Priority Action candidates, adjacent Wave 9–14 modules, Document Control evidence references, and External Systems launch-only posture without external mutation.

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

- `apps/project-control-center/src/surfaces/projectReadiness/`
- `apps/project-control-center/src/surfaces/priorityActions/`
- `apps/project-control-center/src/surfaces/documentControl/`
- `apps/project-control-center/src/surfaces/approvals/`
- `apps/project-control-center/src/surfaces/externalSystems/`
- `apps/project-control-center/src/surfaces/buyoutLog/`
- `apps/project-control-center/src/tests/`
- `packages/models/src/pcc/BuyoutLog.ts`
- `packages/models/src/pcc/ProjectReadinessFramework.ts`
- `packages/models/src/pcc/fixtures/`

## Prohibited Scope

- Any file not needed for this prompt’s objective.
- Any unrelated refactor.
- Any broad formatting pass.
- Any lockfile/package/manifest/workflow/deployment change unless this prompt explicitly authorizes it.
- Any external-system runtime behavior, writeback, sync, or mutation.

## Repo-Truth Files to Inspect

- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-9/`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-10/`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-11/`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-12/`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-13/`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-14/`
- `packages/models/src/pcc/ProjectReadinessFramework.ts`
- `apps/project-control-center/src/surfaces/projectReadiness/`
- `apps/project-control-center/src/surfaces/buyoutLog/`

## Implementation Steps

1. Inspect adjacent module conventions before editing:
   - Wave 9 Project Lifecycle Readiness Center;
   - Wave 10 Permit & Inspection Control Center;
   - Wave 11 Responsibility Matrix;
   - Wave 12 Constraints Log;
   - Wave 14 Approvals / Checkpoints if present;
   - Document Control evidence/link conventions;
   - External Systems launcher conventions.
2. Add Buyout Log readiness references/cues only where repo conventions support them.
3. Surface Priority Action candidate references from Buyout fixtures/read model; do not execute actions.
4. Add reference links or read-only cross-module context to:
   - unbought scope blocking readiness;
   - permit/inspection implications where documented;
   - responsibility/BIC mapping;
   - constraints/dependency risk;
   - approval/checkpoint prompts for future Wave 14 only.
5. Add Document Control evidence-link references only; no upload/download/sync/storage ownership.
6. Add External Systems launcher/reference posture only; no Procore/Sage runtime calls.
7. Add Procore/Sage source-lineage placeholders only.
8. Add tests proving candidate-only/reference-only behavior and absence of external mutation.
9. Keep UI language clear: this surface identifies risk/action posture, not legal, claim, or accounting determinations.

## Validation Commands

```bash
git status --short
md5 pnpm-lock.yaml
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
git diff --check
pnpm exec prettier --check packages/models/src/pcc/**/*.ts apps/project-control-center/src/**/*.ts apps/project-control-center/src/**/*.tsx
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
feat(pcc): wire buyout log readiness seams
```

Commit description:

```text
Adds reference-only Buyout Log seams for Project Readiness, Priority Action candidates, adjacent PCC modules, Document Control evidence links, External Systems launch posture, and Procore/Sage source-lineage placeholders without introducing writeback, sync, approval execution, or external runtime calls.
```

## Final Output Requirements

Return:
- seams wired;
- files changed;
- tests added;
- validation output;
- explicit confirmation that all seams are reference-only/candidate-only.
