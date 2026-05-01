# 03 — Documentation Update Instructions

## Objective

Update the Phase 3 / Wave 7 planning, blueprint, and roadmap documentation so that Wave 7 accurately reflects the updated **HB Document Control Center** target architecture.

Use `02_Target_Architecture_Reference_HB_Document_Control_Center.md` as the authoritative architecture reference.

## Primary docs to inspect and update

Inspect these files first:

```text
docs/architecture/blueprint/sp-project-control-center/Project_Control_Center_Development_Roadmap.md
docs/architecture/blueprint/sp-project-control-center/HB_Project_Control_Center_Target_Architecture_Blueprint.md
docs/architecture/blueprint/sp-project-control-center/Standard_Project_Site_Template_Contract.md
docs/architecture/blueprint/sp-project-control-center/phase-3/01_PCC_Product_Architecture_and_User_Journey_Blueprint.md
docs/architecture/blueprint/sp-project-control-center/phase-3/05_Phase_3_Development_Roadmap_Updated.md
docs/architecture/blueprint/sp-project-control-center/phase-3/07_Phase_3_Module_Implementation_Plan.md
```

If Wave 7-specific folders already exist, inspect/update them:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-7/
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-07/
```

If they do not exist and repo convention supports opening wave planning folders, create a narrow set of docs such as:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-7/Wave_7_Scope_Lock.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-7/Wave_7_Target_Architecture.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-7/Wave_7_Permission_Model.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-7/Wave_7_Source_Binding_Model.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-7/Wave_7_Implementation_Sequence.md
```

Only create new docs if doing so is consistent with existing wave folder patterns.

## Required content updates

1. Rename the Wave 7 target to **HB Document Control Center**.
2. Replace the old two-lane model with the updated three-lane architecture:
   - Project Record
   - My Project Files
   - External Systems
3. Add Project Record lane definition.
4. Add My Project Files lane definition and exact hard guardrail.
5. Add External Systems lane definition.
6. Add Project Document Source Registry.
7. Add backend API/read-model posture.
8. Add metadata model updates, including `procoreProjectId`.
9. Add review types and routing.
10. Add role/action permission model.
11. Use **Project Coordinator**, not Project Engineer.
12. Add search strategy, upload rules, path/folder constraints, refresh/change tracking, throttling/resilience states, audit model, sharing-link policy, admin repair/reconciliation, fixture/mock strategy, Wave 7 acceptance criteria, and implementation sequence.

## Preservation rules

- Do not rewrite prior waves’ closeout history.
- Do not re-sequence Responsibility Matrix into Wave 7.
- Do not remove existing decisions unless replacing them with the updated target architecture and documenting why.
- Do not create contradictory definitions between blueprint, roadmap, and phase-specific docs.
- Prefer adding “current target architecture” language where historical wording must remain.
