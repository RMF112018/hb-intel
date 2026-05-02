# Prompt 05 — Closeout Validation

You are working in `/Users/bobbyfetting/hb-intel`.

Your task is to validate the Wave 11 documentation update and produce closeout.

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


## Required Review Scope

Review:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-11/
docs/architecture/blueprint/sp-project-control-center/HB_Project_Control_Center_Target_Architecture_Blueprint.md
docs/architecture/blueprint/sp-project-control-center/phase-3/01_PCC_Product_Architecture_and_User_Journey_Blueprint.md
docs/architecture/blueprint/sp-project-control-center/phase-3/05_Phase_3_Development_Roadmap_Updated.md
docs/architecture/blueprint/sp-project-control-center/phase-3/07_Phase_3_Module_Implementation_Plan.md
docs/architecture/blueprint/sp-project-control-center/phase-3/Register_Workflow_Module_Register.md
docs/architecture/blueprint/sp-project-control-center/phase-3/Register_MVP_Scope.md
docs/reference/example/Responsibility Matrix - Template.xlsx
docs/reference/example/Responsibility Matrix - Owner Contract Template.xlsx
```

## Required Validation Questions

1. Is Wave 11 consistently named `Responsibility Matrix`?
2. Does the target architecture define the subtitle `RACI + Owner-Contract Responsibility Control Center`?
3. Does it define one unified module, not two spreadsheet launchers?
4. Does it preserve source traceability to both workbooks?
5. Does it distinguish template definitions from project instances?
6. Does it define template version governance?
7. Does it define workbook import and human review workflow?
8. Does it separate contract-party responsibility from internal RACI?
9. Does it include decision-rights overlay?
10. Does it include contract clause / obligation reference model?
11. Does it include Team & Access role resolution?
12. Does it include assignment lifecycle and handoff rules?
13. Does it include current action owner / ball-in-court model?
14. Does it include workflow-step model?
15. Does it include notification and escalation policy?
16. Does it include evidence / Document Control posture?
17. Does it include Matrix Health Score?
18. Does it include Priority Actions integration?
19. Does it include Project Readiness integration?
20. Does it preserve Wave 14 Approvals / Checkpoints authority?
21. Does the default item JSON parse?
22. Are owner-contract placeholder rows not treated as active default obligations unless verified?
23. Are no runtime claims introduced?
24. Are no legal-advice claims introduced?
25. Are no external-system mutation claims introduced?
26. Is `pnpm-lock.yaml` unchanged?

## Required Closeout File

Create or update:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-11/Wave_11_Documentation_Closeout.md
```

Closeout must include:

- files changed;
- scope completed;
- workbook extraction summary;
- source research summary;
- validation commands and results;
- lockfile MD5 before/after;
- no-runtime confirmation;
- no-legal-advice confirmation;
- no-external-mutation confirmation;
- residual risks;
- next recommended wave / prompt.

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


## Commit

Recommended commit summary:

```text
docs(pcc): close wave 11 responsibility matrix planning
```

Recommended commit description:

```text
Closes the Wave 11 Responsibility Matrix documentation update.

Validates target architecture, scope lock, resolved decisions, workbook source mapping, default item JSON, source traceability, research basis, guardrails, and no-runtime/no-mutation posture for the Responsibility Matrix module.

Documentation-only. No runtime, package, lockfile, manifest, deployment, tenant, external-system, legal-advice, or production changes.
```

## Final Output Requirements

Return:

- final closeout summary;
- validation results;
- staged file proof;
- commit hash if committed;
- remaining risks or blockers;
- recommendation for next prompt/session.
