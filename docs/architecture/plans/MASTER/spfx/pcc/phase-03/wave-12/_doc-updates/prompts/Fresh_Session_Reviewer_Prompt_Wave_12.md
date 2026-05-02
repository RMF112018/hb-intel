# Fresh Session Reviewer Prompt — Wave 12 Constraints Log Documentation

## Objective

Conduct an exhaustive fresh-session review of the completed Wave 12 Constraints Log documentation package against repo truth, this target architecture package, and current subject-matter research.

## Required Inputs

Review the implemented docs under:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-12/
```

Review governing docs:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/05_Phase_3_Development_Roadmap_Updated.md
docs/architecture/blueprint/sp-project-control-center/phase-3/07_Phase_3_Module_Implementation_Plan.md
docs/architecture/blueprint/sp-project-control-center/phase-3/Register_Workflow_Module_Register.md
docs/architecture/blueprint/sp-project-control-center/phase-3/Register_MVP_Scope.md
docs/architecture/blueprint/sp-project-control-center/phase-3/01_PCC_Product_Architecture_and_User_Journey_Blueprint.md
docs/architecture/blueprint/sp-project-control-center/HB_Project_Control_Center_Target_Architecture_Blueprint.md
```


## Universal Guardrails

Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.

This prompt is documentation-only. Do not change source/runtime code, backend routes, SPFx surfaces, package manifests, dependencies, lockfiles, workflows, CI, deployment manifests, tenant configuration, or external-system integrations.

Do not edit `docs/architecture/plans/**` unless a separate explicit authorization is provided.

Do not introduce Procore, Primavera/P6, Sage, Microsoft Graph, SharePoint REST/PnP, Autodesk, AHJ, utility portal, or other external-system runtime behavior.

Do not create legal, claim, entitlement, compensability, delay-damages, or forensic schedule analysis determinations.

Preserve the distinction:
- risk = uncertain future event or condition;
- constraint = known blocker to planned work;
- issue = active problem;
- delay exposure = potential or actual schedule-impact condition requiring review;
- change exposure = potential or actual scope/cost/contract impact requiring review.


## Review Criteria

Confirm:

- Official module name remains `Constraints Log`.
- Subtitle/description is `Make-Ready Constraint & Risk Exposure Center`.
- Wave 12 is Project Readiness-aligned.
- Embedded risk matrix is present and fully specified.
- Constraint exposure matrix is present and fully specified.
- Risk vs constraint vs issue vs delay vs change distinctions are clear.
- Scoring rules and override rules are deterministic.
- State machines are deterministic.
- UX screens and saved views are specified.
- Role/permission model is specified.
- Workbook posture is source/reference only.
- Change Tracking and Delay Log are linkage-only.
- Integration boundaries are explicit.
- External-system/runtime/legal/claim/delay guardrails are explicit.
- JSON artifacts validate.
- Documentation is implementation-ready for a future local code agent.

## Required Validation

Run:

```bash
git status --short
git diff --check
pnpm exec prettier --check <wave 12 markdown/json files and touched governing docs>
python3 -m json.tool docs/architecture/blueprint/sp-project-control-center/phase-3/wave-12/reference/default_constraints_log_seed_structure.json >/tmp/wave12_constraints_seed_structure_validated.json
python3 -m json.tool docs/architecture/blueprint/sp-project-control-center/phase-3/wave-12/reference/risk_matrix_config_reference.json >/tmp/wave12_risk_matrix_config_validated.json
python3 -m json.tool docs/architecture/blueprint/sp-project-control-center/phase-3/wave-12/reference/constraint_exposure_scoring_reference.json >/tmp/wave12_constraint_exposure_config_validated.json
```

## Final Output

Return:

- pass/fail summary;
- discrepancies;
- required fixes;
- optional improvements;
- final reviewer recommendation.
