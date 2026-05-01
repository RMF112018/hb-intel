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

# Prompt 01 — Repo-Truth Gate, Research-Backed Authorization, and Wave 8 Implementation Scope-Lock

## Role

You are a senior repo-truth auditor, construction-operations product strategist, SPFx/TypeScript architecture reviewer, and implementation-scope gatekeeper working in:

```text
/Users/bobbyfetting/hb-intel
```

## Objective

Resolve the current Wave 8 scope-lock tension before any source implementation. Update or create blueprint/current-state Wave 8 documentation that authorizes a bounded implementation posture for **PCC Phase 3 / Wave 8 — Project Readiness Module Framework**.

This is a documentation and authorization-gate prompt. Do not modify source code.

## Mandatory preflight

Run:

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
docs/architecture/blueprint/sp-project-control-center/README.md
docs/architecture/blueprint/sp-project-control-center/Project_Control_Center_Development_Roadmap.md
docs/architecture/blueprint/sp-project-control-center/HB_Project_Control_Center_Target_Architecture_Blueprint.md
docs/architecture/blueprint/sp-project-control-center/Standard_Project_Site_Template_Contract.md
docs/architecture/blueprint/sp-project-control-center/phase-3/01_PCC_Product_Architecture_and_User_Journey_Blueprint.md
docs/architecture/blueprint/sp-project-control-center/phase-3/05_Phase_3_Development_Roadmap_Updated.md
docs/architecture/blueprint/sp-project-control-center/phase-3/07_Phase_3_Module_Implementation_Plan.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-7/
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-8/
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-9/
packages/models/src/pcc/PccReadModels.ts
packages/models/src/pcc/PccMvpSurfaces.ts
apps/project-control-center/src/surfaces/projectReadiness/PccProjectReadinessSurface.tsx
backend/functions/src/hosts/pcc-read-model/pcc-read-model-routes.test.ts
```

## Research-informed findings to incorporate

Use the package research findings above. Do not need to browse unless you need to refresh a claim. Incorporate these concepts into the Wave 8 implementation authorization docs:

- OSHA safety readiness: management responsibility, worker participation, hazard identification, hazard prevention/control, training, multi-employer coordination.
- CII/PDRI readiness: domain/gate readiness, project definition completeness, risk-factor identification, mitigation action visibility, repeated readiness checks.
- CMAA/AIA closeout readiness: closeout responsibility clarity, interdependent procedures, substantial-completion responsibilities, outstanding-work timelines, evidence/document readiness.
- Procore/Autodesk workflow patterns: template vs project instance, customizable sections/items, comments/evidence/status, closeout package visibility, project-level customization without corrupting master templates.
- Microsoft governance: metadata, lifecycle, records, permissions, and source-of-record boundaries.

## Files you may modify

Preferred:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-8/Wave_8_Project_Readiness_Module_Framework_Scope_Lock.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-8/Wave_8_Implementation_Authorization.md
```

Only if needed for consistency:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/05_Phase_3_Development_Roadmap_Updated.md
docs/architecture/blueprint/sp-project-control-center/phase-3/07_Phase_3_Module_Implementation_Plan.md
docs/architecture/blueprint/sp-project-control-center/Project_Control_Center_Development_Roadmap.md
```

Do not modify:

```text
docs/architecture/plans/**
packages/**
backend/**
apps/**
pnpm-lock.yaml
package.json
```

## Required documentation decisions

Document that Wave 8 is now authorized only for:

- shared model/read-model framework contracts;
- deterministic framework fixtures;
- optional backend mock-provider GET-only read-model route extension;
- SPFx fixture/client parity;
- Project Readiness Center shell/cards;
- inert/disabled action affordances;
- source/degraded-state rendering;
- ownership/evidence/risk/blocker summary display;
- closeout documentation.

Document that Wave 8 remains forbidden from:

- live runtime integrations;
- mutations;
- actual workflow execution;
- checklist-library implementation;
- package/dependency changes;
- tenant/deployment activity.

## Validation commands

```bash
git diff --check
pnpm exec prettier --check docs/architecture/blueprint/sp-project-control-center/phase-3/wave-8/Wave_8_Project_Readiness_Module_Framework_Scope_Lock.md docs/architecture/blueprint/sp-project-control-center/phase-3/wave-8/Wave_8_Implementation_Authorization.md
md5 pnpm-lock.yaml
git status --short
git diff --stat
```

If a touched roadmap file needs formatting, include it explicitly in the Prettier command.

## Staging

Use explicit path staging only. Do not use `git add .`.

## Commit summary

```text
docs(pcc): authorize wave 8 readiness framework implementation
```

## Commit body

```text
Authorizes a bounded Phase 3 Wave 8 implementation posture for the Project Readiness Module Framework.

Documents research-informed readiness framework principles, implementation scope, source-of-record boundaries, downstream Wave 9–14 relationships, and no-runtime/no-mutation guardrails. Confirms Wave 8 may proceed with shared model/read-model contracts, deterministic fixtures, optional GET-only mock read-model route, SPFx fixture/client parity, Project Readiness Center shell rendering, inert action affordances, source/degraded-state rendering, and closeout documentation only.

No source code, backend route, SPFx runtime behavior, package/dependency change, lockfile change, Graph/PnP/SharePoint REST runtime, Procore runtime, external writeback, workflow execution, tenant mutation, deployment, secrets, or app settings are introduced.
```

## Closeout response

Include:

- files changed;
- validation results;
- lockfile md5 before/after;
- explicit exclusions;
- whether Wave 8 implementation is authorized for Prompt 02;
- remaining risks;
- recommended next prompt: Prompt 02.

---
