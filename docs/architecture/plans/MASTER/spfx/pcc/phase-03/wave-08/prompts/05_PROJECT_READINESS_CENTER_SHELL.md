<!--
PCC Phase 3 Wave 8 Prompt Bundle
Use this file as a standalone prompt for the local code agent.
Do not combine with later prompts until this prompt has been completed, validated, committed, and closed out.
-->

## Package-Level Operating Rules

- Work in `/Users/bobbyfetting/hb-intel`.
- Do not re-read files that are still within your current context or memory; only re-open files when you need fresh repo truth, exact line references, or to verify changes after editing.
- Protect unrelated working-tree changes. Record them, do not overwrite them, and do not stage them.
- Do not use `git add .` or broad staging.
- Use explicit path staging only.
- Run `git diff --check` before commit.
- Record `md5 pnpm-lock.yaml` before and after.
- Do not run `pnpm install`, `pnpm add`, or `pnpm update` unless explicitly authorized.
- Do not edit `docs/architecture/plans/**` unless this prompt explicitly authorizes it. Prefer current-state documentation under `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-8/`.
- Preserve Wave 8 as the Project Readiness Module Framework; do not implement Wave 9 checklist content, Wave 10 Permit Log, Wave 11 RACI, Wave 12 Constraints Log, Wave 13 Buyout Log, or Wave 14 Approvals runtime.
- Preserve no-mutation posture: no live Graph file operations, SharePoint list mutations, tenant mutations, permission mutations, Procore runtime/writeback, external-system writeback, approval/workflow execution, secrets/app settings, SPFx package/deployment, or production rollout.

---

# Prompt 05 — Project Readiness Center Shell and Framework Cards

## Role

You are an SPFx UI implementer and construction-operations UX reviewer working in:

```text
/Users/bobbyfetting/hb-intel
```

## Objective

Replace/enhance the static Project Readiness preview surface with a framework-driven **Project Readiness Center** shell using Wave 8 readiness framework fixtures/client data.

Do not implement checklist execution, workflow actions, or backend default cutover.

## Mandatory preflight

```bash
cd /Users/bobbyfetting/hb-intel
git status --short
git branch --show-current
git log --oneline -20
md5 pnpm-lock.yaml
```

Record unrelated changes and do not stage them.

Do not re-read files that are still within your current context or memory; only re-open files when you need fresh repo truth, exact line references, or to verify changes after editing.

## Files to inspect

```text
apps/project-control-center/src/surfaces/projectReadiness/PccProjectReadinessSurface.tsx
apps/project-control-center/src/surfaces/projectReadiness/PccProjectReadinessSurface.module.css
apps/project-control-center/src/shell/PccSurfaceRouter.tsx
apps/project-control-center/src/layout/PccDashboardCard.tsx
apps/project-control-center/src/ui/PccPreviewState.tsx
apps/project-control-center/src/surfaces/projectHome/
apps/project-control-center/src/surfaces/documents/
apps/project-control-center/src/surfaces/teamAccess/
apps/project-control-center/src/tests/
packages/models/src/pcc/ProjectReadinessFramework.ts
packages/models/src/pcc/fixtures/projectReadiness.ts
```

## Files you may modify/create

Expected:

```text
apps/project-control-center/src/surfaces/projectReadiness/PccProjectReadinessSurface.tsx
apps/project-control-center/src/surfaces/projectReadiness/PccProjectReadinessSurface.module.css
apps/project-control-center/src/surfaces/projectReadiness/projectReadinessViewModel.ts
apps/project-control-center/src/surfaces/projectReadiness/projectReadinessAdapter.ts
apps/project-control-center/src/surfaces/projectReadiness/projectReadinessAdapter.test.ts
apps/project-control-center/src/tests/PccProjectReadinessSurface.test.tsx
apps/project-control-center/src/shell/PccSurfaceRouter.tsx
```

Modify router only as required to pass read-model client to Project Readiness.

Do not modify:

```text
docs/architecture/plans/**
pnpm-lock.yaml
package.json
```

## Required UX regions

Implement a flagship shell using existing PCC card/bento patterns. Minimum cards/regions:

1. **Readiness Hero**
   - active lifecycle gate;
   - overall posture;
   - blocker count;
   - evidence confidence;
   - source-health state;
   - preview/read-only badge.

2. **Lifecycle Gate Map**
   - gates from lead/pursuit through turnover/warranty;
   - status/posture per gate;
   - no interactive workflow execution.

3. **Readiness Domain Grid**
   - domain cards with posture, open items, blockers, evidence status.

4. **Blockers & Exceptions**
   - blocked/at-risk items;
   - due dates;
   - owner/accountable persona;
   - dependency/source-module label.

5. **Evidence & Source Health**
   - required/missing/satisfied evidence summaries;
   - source health warnings;
   - HB Document Control Center evidence-reference posture.

6. **Downstream Module Preview**
   - show Wave 9–14 as downstream modules plugging into framework;
   - mark downstream modules as preview/deferred when not implemented.

## Required copy posture

Use product-safe language:

- “Read-only readiness framework preview”
- “No workflow execution is enabled in Wave 8”
- “Evidence links are references only; HB Document Control Center remains the evidence source of record”
- “Checklist item libraries begin in Wave 9”
- “RACI remains Wave 11”

Do not say:

- “submit”
- “approve” as an executable command
- “upload”
- “sync”
- “write back”
- “complete checklist”
- “run workflow”

Unless those terms are clearly in disabled/inert explanatory copy.

## Required tests

Prove:

- Project Readiness Center renders active surface panel for `project-readiness`;
- hero shows read-only/no-execution posture;
- lifecycle gate map renders from fixture/client data;
- domain grid renders multiple domains;
- blocker/evidence/source-health sections render;
- Wave 9 is shown as downstream and not implemented in Wave 8;
- RACI is not shown as Wave 8 implementation;
- action chips/buttons are disabled/inert or absent;
- no prohibited runtime imports/calls are introduced.

## Validation commands

```bash
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm --filter @hbc/spfx-project-control-center build
git diff --check
md5 pnpm-lock.yaml
git status --short
git diff --stat
```

## Staging

Explicit path staging only. Do not use `git add .`.

## Commit summary

```text
feat(spfx-pcc): render project readiness center framework shell
```

## Commit body

```text
Implements the Phase 3 Wave 8 Project Readiness Center framework shell in the PCC SPFx app.

Replaces the static readiness preview with read-only framework cards for lifecycle gates, readiness domains, blockers, evidence/source health, and downstream module posture using deterministic fixture/read-model data. Preserves fixture-first behavior, disabled/inert affordances, and clear Wave 9/Wave 11 boundaries.

No checklist-library implementation, workflow execution, approval execution, upload/download/sync, Graph/PnP/SharePoint REST runtime, Procore runtime, external-system writeback, backend default cutover, package/dependency change, lockfile change, SPFx packaging, deployment, secrets, or app settings are introduced.
```

## Closeout response

Include:

- files changed;
- validation results;
- lockfile md5 before/after;
- UI regions implemented;
- explicit exclusions;
- remaining risks;
- recommended next prompt: Prompt 06.

---
