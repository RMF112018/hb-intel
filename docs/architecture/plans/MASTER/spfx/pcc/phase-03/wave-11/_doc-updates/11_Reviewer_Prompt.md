# Fresh Reviewer Prompt — Wave 11 Responsibility Matrix Documentation

You are acting as a fresh reviewer for the `hb-intel` repository.

Your task is to validate whether the Wave 11 documentation update correctly defines the **Responsibility Matrix** target architecture.

## Review Scope

Review latest repo truth for:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-11/
docs/architecture/blueprint/sp-project-control-center/HB_Project_Control_Center_Target_Architecture_Blueprint.md
docs/architecture/blueprint/sp-project-control-center/phase-3/01_PCC_Product_Architecture_and_User_Journey_Blueprint.md
docs/architecture/blueprint/sp-project-control-center/phase-3/05_Phase_3_Development_Roadmap_Updated.md
docs/architecture/blueprint/sp-project-control-center/phase-3/07_Phase_3_Module_Implementation_Plan.md
docs/architecture/blueprint/sp-project-control-center/phase-3/Register_Workflow_Module_Register.md
docs/architecture/blueprint/sp-project-control-center/phase-3/Register_MVP_Scope.md
packages/models/src/pcc/WorkflowModules.ts
docs/reference/example/Responsibility Matrix - Template.xlsx
docs/reference/example/Responsibility Matrix - Owner Contract Template.xlsx
```

## Required Review Questions

1. Does Wave 11 consistently use `Responsibility Matrix` as the official module name?
2. Does the architecture define `RACI + Owner-Contract Responsibility Control Center` as the subtitle?
3. Is the module one unified Responsibility Matrix rather than separate spreadsheet launchers?
4. Does the architecture define a template-driven, project-instance-based model?
5. Does it preserve source traceability to both company workbooks?
6. Does it correctly treat the PM/Field workbook as the source of default responsibility rows?
7. Does it correctly treat the owner-contract workbook as structure/template posture unless live extraction proves populated obligations?
8. Does the default items JSON include all verified default rows and ambiguous items?
9. Does the target architecture separate contract-party responsibility from internal RACI?
10. Does it prevent confusion between Contractor and Consulted?
11. Does it include RACI and expanded codes?
12. Does it include decision-rights overlay?
13. Does it include current action owner / ball-in-court logic?
14. Does it include workflow steps?
15. Does it include assignment lifecycle and handoff?
16. Does it include Team & Access role resolution?
17. Does it include evidence / Document Control posture?
18. Does it include Priority Actions integration?
19. Does it include Project Readiness integration?
20. Does it preserve Wave 14 approval execution authority?
21. Does it include Matrix Health Score?
22. Does it include notification and escalation posture?
23. Does it include snapshot/export governance?
24. Does it include audit events?
25. Does it explicitly prohibit legal advice and automatic contract obligation creation?
26. Does it explicitly prohibit runtime/external-system mutation?
27. Does it avoid package, lockfile, manifest, deployment, tenant, and production changes?
28. Does it include validation evidence and closeout?

## Required Commands

Run:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -12
md5 pnpm-lock.yaml
git diff --check
pnpm exec prettier --check <wave-11 markdown/json files and governing docs touched>
python -m json.tool docs/architecture/blueprint/sp-project-control-center/phase-3/wave-11/reference/default_responsibility_matrix_items.json >/tmp/wave11_default_items_validated.json
```

## Reviewer Output Format

Return:

1. Overall verdict:
   - PASS
   - PASS WITH MINOR ISSUES
   - NEEDS REVISION
2. Critical issues.
3. Minor issues.
4. Repo-truth discrepancies.
5. Workbook-source discrepancies.
6. Guardrail violations, if any.
7. Validation command results.
8. Recommendation for next action.

## Hard Reviewer Standard

Fail the package if it:

- treats owner-contract placeholder rows as active obligations without evidence;
- collapses contract-party and RACI fields;
- omits template/project instance separation;
- omits legal/no-obligation guardrails;
- implies runtime implementation;
- mutates source/package/lockfile/deployment/tenant/external systems;
- omits workbook traceability;
- omits default item JSON validation.
