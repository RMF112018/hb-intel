# PCC Phase 3 Active Rules

These rules apply only when the task touches the Project Control Center.

## Governing docs

Read current PCC repo truth from:

- `docs/architecture/blueprint/sp-project-control-center/README.md`
- `docs/architecture/blueprint/sp-project-control-center/HB_Project_Control_Center_Target_Architecture_Blueprint.md`
- `docs/architecture/blueprint/sp-project-control-center/Standard_Project_Site_Template_Contract.md`
- `docs/architecture/blueprint/sp-project-control-center/Project_Control_Center_Development_Roadmap.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-2/Phase_2_Closeout.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-1/Wave_1_Closeout.md`
- `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-02/`

## Wave 2 guardrails

Wave 2 is SPFx shell-frame and UI/UX foundation only.

Allowed:
- `apps/project-control-center/` shell-frame work;
- fixture-driven preview UI;
- `@hbc/models/pcc` vocabulary;
- UI/layout components;
- tests and docs directly supporting the shell frame.

Forbidden unless explicitly authorized:
- backend APIs;
- tenant mutation;
- live Graph/PnP;
- Procore runtime, secrets, mirror, write-back;
- direct SPFx-to-Procore;
- access execution;
- approval execution;
- Site Health scanning/repair;
- app catalog deployment;
- CI/CD changes;
- package/manifest version bumps.

## UI basis

Use:
`docs/reference/ui-kit/dashboard/dashboard-basis-of-design.png`

PCC must not reuse the fixed paired-row `hb-intel-homepage` layout pattern. Use the flexible bento/masonry-style Project Home layout decision.