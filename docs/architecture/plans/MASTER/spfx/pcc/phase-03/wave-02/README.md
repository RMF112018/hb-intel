# Phase 3 Wave 2 — PCC SPFx Shell Frame Prompt Package — Updated

Generated: 2026-04-29  
Package status: **Updated after decision closure, UI/UX basis-of-design selection, and governing-document reference alignment**  
Governing design reference: `docs/reference/ui-kit/dashboard/dashboard-basis-of-design.png`

## Purpose

This package supersedes the original Phase 3 Wave 2 prompt package for the Project Control Center (PCC) SPFx shell-frame effort. It incorporates decisions closed after the first package was generated, including:

- Wave 2 includes **substantive UI/UX shell-frame work**, not just technical scaffolding.
- PCC shall use the saved dashboard basis-of-design image at `docs/reference/ui-kit/dashboard/dashboard-basis-of-design.png` as the visual-direction reference.
- PCC shall not reuse the `hb-intel-homepage` fixed paired-row layout pattern.
- PCC shall use a controlled flexible bento / masonry-style layout for Project Home and preview cards.
- PCC shell implementation target is `apps/project-control-center/`, proof-gated by Prompt 01 repo-truth confirmation.
- Wave 2 remains shell-frame only: no backend API, no tenant mutation, no live Graph/PnP, no Procore runtime, no workflow execution, no deployment.

## Governing Architecture References

Phase 3 Wave 2 must be executed against the current PCC governing architecture under:

`docs/architecture/blueprint/sp-project-control-center/`

Before executing any Wave 2 prompt, agents must review the following documents:

| Reference | Purpose |
|---|---|
| [`README.md`](../../../../../../blueprint/sp-project-control-center/README.md) | Directory-level guide, source-of-truth hierarchy, frozen decisions, phase closeouts, and agent guardrails for PCC architecture. |
| [`HB_Project_Control_Center_Target_Architecture_Blueprint.md`](../../../../../../blueprint/sp-project-control-center/HB_Project_Control_Center_Target_Architecture_Blueprint.md) | Strategic target architecture, north-star operating model, module map, UX/governance requirements, and enterprise direction. |
| [`Standard_Project_Site_Template_Contract.md`](../../../../../../blueprint/sp-project-control-center/Standard_Project_Site_Template_Contract.md) | Human-readable implementation source of truth for project-site structure, permissions, MVP scope, settings, module records, validation, drift posture, and provisioning contract. |
| [`Project_Control_Center_Development_Roadmap.md`](../../../../../../blueprint/sp-project-control-center/Project_Control_Center_Development_Roadmap.md) | Current phased implementation sequence, completed-phase status, Wave 2 positioning, dependencies, risks, and acceptance criteria. |
| [`dashboard-basis-of-design.png`](../../../../../../../reference/ui-kit/dashboard/dashboard-basis-of-design.png) | Governing visual basis of design for the Phase 3 Wave 2 PCC shell-frame UI/UX direction. |

### Source-of-Truth Rule

The Wave 2 README and prompts are execution guidance only. They do not supersede the PCC blueprint, Standard Project Site Template Contract, development roadmap, or PCC directory README. If Wave 2 prompt language conflicts with the governing architecture documents, stop and reconcile the conflict before implementation.

For implementation detail:

- the **Standard Project Site Template Contract** governs project-site structure, template objects, permissions, settings, validation, provisioning boundaries, MVP scope, and drift posture;
- the **Target Architecture Blueprint** governs strategic architecture, operating model, module intent, UX posture, and governance direction;
- the **Development Roadmap** governs sequencing, phase status, implementation dependencies, and acceptance criteria;
- the **PCC directory README** governs source-of-truth hierarchy, frozen decisions, phase closeouts, and agent guardrails;
- this **Wave 2 README** governs only this shell-frame/UI-UX prompt package.

### Wave 2 Context

Phase 3 Wave 2 is the PCC SPFx shell-frame and UI/UX foundation wave. It is not a backend, provisioning, tenant-mutation, Procore-runtime, workflow-execution, app-catalog-deployment, or production-rollout wave.

Wave 2 must preserve the current closed decisions:

- target shell location: `apps/project-control-center/`;
- shared PCC vocabulary and fixtures: `@hbc/models/pcc`;
- governing UI/UX basis: `docs/reference/ui-kit/dashboard/dashboard-basis-of-design.png`;
- flexible bento/masonry-style PCC layout, not the fixed paired-row homepage layout;
- no live Graph/PnP calls;
- no direct SPFx-to-Procore path;
- no Procore secrets, mirror, or write-back;
- no tenant mutation.

## Governing Inputs

The implementation agent must inspect current repo truth before writing code. The known governing facts at package-generation time are:

1. **Wave 1 closed PCC shared foundations** in `@hbc/models`, including the eight MVP surfaces, work centers, project profile model, personas/capabilities, workflow metadata, launch-link shapes, Site Health read models, fixtures, feature flags, and no-runtime guards.
2. **Phase 2 closed the provisioning boundary** and confirmed the provisioning package is headless and no-mutation.
3. Existing homepage work shows a row/column paired-layout pattern that is inappropriate for PCC because equal-height rows create unused white space and reduce operational density.
4. PCC is a full project operating surface. Its UI must support tight-fitting cards, varied heights, varied spans, preview states, and a command-center visual hierarchy.
5. The user saved the PCC basis-of-design image at `docs/reference/ui-kit/dashboard/dashboard-basis-of-design.png` and future developers must treat that path as the design reference.
6. The governing PCC architecture documents under `docs/architecture/blueprint/sp-project-control-center/` remain the controlling references for strategy, implementation contract, sequencing, phase status, MVP scope, and source-of-truth hierarchy.

## Updated File Inventory

| File | Purpose |
|---|---|
| `00_Repo_Truth_And_Update_Summary.md` | Summarizes repo-truth assumptions and package updates. |
| `01_Wave_2_Decision_Closure_Register.md` | Replaces open decisions with closed positions. |
| `02_PCC_UIUX_Basis_of_Design.md` | Locks the visual and product direction using the saved image path. |
| `03_PCC_UI_Wireframe_and_Flexible_Layout_Contract.md` | Defines the desktop/tablet/mobile wireframe and bento/masonry layout model. |
| `04_Wave_2_Scope_Lock_Implementation_Boundaries.md` | Defines allowed/forbidden files and non-negotiable guardrails. |
| `Prompt_01_...` through `Prompt_09_...` | Updated execution prompts for the implementation sequence. |
| `Wave_2_Validation_Matrix.md` | Validation commands, acceptance gates, and proof requirements. |

## Execution Sequence

Run the prompts in order. Do not skip Prompt 01.

1. `Prompt_01_Wave_2_Repo_Truth_Audit_and_Shell_Scope_Lock.md`
2. `Prompt_02_Wave_2_SPFx_App_Target_and_Scaffold.md`
3. `Prompt_03_Wave_2_UIUX_Basis_and_Flexible_Layout_Frame.md`
4. `Prompt_04_Wave_2_MVP_Surface_Navigation_and_State_Model.md`
5. `Prompt_05_Wave_2_Project_Home_Bento_Dashboard_and_Priority_Actions.md`
6. `Prompt_06_Wave_2_Document_Control_External_Systems_and_Site_Health_Frames.md`
7. `Prompt_07_Wave_2_Team_Access_Settings_Approvals_and_Readiness_Frames.md`
8. `Prompt_08_Wave_2_Fixtures_Preview_Fallbacks_and_No_Runtime_Guards.md`
9. `Prompt_09_Wave_2_Tests_Documentation_Closeout_and_Proof.md`

## Non-Negotiable Boundary

Wave 2 may produce a polished PCC shell frame, navigation model, visual system, preview dashboard, bento layout, and module preview frames. Wave 2 must not produce live backend functionality, tenant mutations, workflow execution, access execution, approval execution, Site Health scanning/repair, Procore runtime, Graph/PnP live calls, app catalog deployment, CI/CD deployment changes, or production rollout.

## Basis-of-Design Handling

The image at `docs/reference/ui-kit/dashboard/dashboard-basis-of-design.png` is a reference design asset saved in the live repo. Agents must reference this path in documentation and inspect it before UI implementation. It is not a pixel-perfect requirement; it governs the visual direction:

- dark navy project intelligence header;
- HB-orange left application navigation rail;
- compact command/search area;
- floating KPI/status cards;
- light cards with varied sizes;
- tight operational bento/masonry grid;
- construction project command-center tone.

## Recommended Commit Posture

Each prompt should produce one coherent commit with a clear summary and description. Keep version bumps, manifest changes, CI/CD deployment changes, tenant calls, and app catalog packaging out of Wave 2 unless a later prompt explicitly authorizes them.
