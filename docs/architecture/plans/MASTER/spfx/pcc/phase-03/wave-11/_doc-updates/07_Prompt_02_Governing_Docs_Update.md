# Prompt 02 — Governing Blueprint / Roadmap Docs Update

You are working in `/Users/bobbyfetting/hb-intel`.

Your task is to update governing PCC documentation so Phase 3 / Wave 11 is consistently defined as the complete **Responsibility Matrix** target module.

## Global Guardrails

- Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.
- Do not overwrite unrelated working-tree changes.
- Do not edit `docs/architecture/plans/**` unless the user explicitly authorizes canonical plan-library edits.
- Do not introduce package dependencies.
- Do not change `pnpm-lock.yaml`.
- Do not run `pnpm install`, `pnpm add`, or equivalent.
- Do not package, deploy, or upload SPFx packages.
- Do not mutate a tenant, SharePoint site, Microsoft Graph object, Procore project, Sage record, AHJ portal, or any external system.
- Do not introduce secrets, app settings, environment variables, CI/workflow changes, deployment manifests, package manifests, or production rollout instructions.
- Keep the work documentation-only unless a later prompt explicitly authorizes runtime implementation.
- Preserve Wave 8 Project Readiness Module Framework boundaries and Wave 14 Approvals / Checkpoints ownership.
- Preserve Team & Access, HB Document Control Center, Priority Actions, External Systems, and Project Readiness integration seams without claiming runtime execution.
- Preserve workbook source traceability for every default responsibility item.
- Treat the Responsibility Matrix workbooks as source references, not final UX constraints.
- Treat contract references as project-controls metadata, not legal interpretation.
- Explicitly prohibit contract interpretation as legal advice and automatic creation of legal obligations.
- Use targeted documentation validation. Do not run broad formatting across the repo.


## Precondition

Use Prompt 01 repo-truth findings. Do not re-run full workbook extraction unless the results are stale, missing, or contradictory.

## Likely Allowed Files

Only update where repo truth confirms the need:

```text
docs/architecture/blueprint/sp-project-control-center/HB_Project_Control_Center_Target_Architecture_Blueprint.md
docs/architecture/blueprint/sp-project-control-center/phase-3/01_PCC_Product_Architecture_and_User_Journey_Blueprint.md
docs/architecture/blueprint/sp-project-control-center/phase-3/05_Phase_3_Development_Roadmap_Updated.md
docs/architecture/blueprint/sp-project-control-center/phase-3/07_Phase_3_Module_Implementation_Plan.md
docs/architecture/blueprint/sp-project-control-center/phase-3/Register_Workflow_Module_Register.md
docs/architecture/blueprint/sp-project-control-center/phase-3/Register_MVP_Scope.md
```

## Required Documentation Updates

Ensure governing docs describe Wave 11 as:

- official name: `Responsibility Matrix`;
- subtitle: `RACI + Owner-Contract Responsibility Control Center`;
- a single unified Project Readiness module;
- not two separate spreadsheet launchers;
- template-driven and project-instance-based;
- source-traceable to both company workbooks;
- based on 109 PM/Field default items and owner-contract mapping structure, subject to local workbook verification;
- responsible for internal RACI, contract-party responsibility mapping, assignment lifecycle, handoffs, current action owner, workflow steps, evidence references, exceptions, and Matrix Health Score;
- integrated with Project Readiness, Priority Actions, Team & Access, HB Document Control Center, Approvals / Checkpoints, and External Systems;
- documentation-only, with no runtime claims.

## Required Guardrail Language

Governing docs must state or preserve:

- no legal advice;
- no automatic creation of legal obligations;
- no replacement of executed contracts;
- no external-system writeback;
- no Procore/Sage/Microsoft Graph/SharePoint REST/PnP/AHJ runtime mutation;
- Approvals / Checkpoints owns approval execution;
- HB Document Control Center owns evidence binaries;
- Team & Access owns project roster/access state.

## Required Validation Commands

Run and capture:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -12
md5 pnpm-lock.yaml
git diff --check
pnpm exec prettier --check <touched markdown/json files>
git diff --cached --name-only
```

Do not run package build/test commands for this documentation-only update unless you intentionally touch source/runtime files, which this prompt does not authorize.


## Staged File Proof

After edits:

```bash
git diff --cached --name-only
```

If not committing in this prompt, provide `git diff --name-only`.

## Commit

Commit only the governing-docs update if validation passes and the user/agent workflow expects one commit per prompt.

Recommended commit summary:

```text
docs(pcc): align wave 11 responsibility matrix governance
```

Recommended commit description:

```text
Aligns governing PCC Phase 3 documentation for Wave 11 Responsibility Matrix.

Defines the module as a unified RACI + owner-contract responsibility control center with template governance, project-instance records, source workbook traceability, assignment lifecycle, current action owner, workflow steps, evidence links, exceptions, Matrix Health Score, and integration seams with Project Readiness, Priority Actions, Team & Access, Document Control, and Approvals / Checkpoints.

Documentation-only. No runtime, package, lockfile, manifest, deployment, tenant, external-system, legal-advice, or production changes.
```

## Final Output Requirements

Return:

- files changed;
- summary of updates;
- validation results;
- lockfile MD5 before/after;
- staged file list;
- commit hash if committed;
- next recommended prompt.
