# PCC Phase 3 Planning Deliverables

Generated: 2026-04-28

## Purpose

This package converts the Phase 3 interview decisions into planning-ready Markdown deliverables for the Project Control Center (PCC).

The deliverables are designed to support Phase 3 planning while Phase 2 provisioning remains in progress. They preserve the Phase 3 planning-only boundary:

- no SPFx implementation;
- no backend implementation;
- no provisioning executor;
- no tenant mutation;
- no Graph/PnP live calls;
- no SharePoint site/list/library/group/page/permission creation;
- no Procore runtime implementation;
- no direct SPFx-to-Procore path;
- no production rollout;
- no package or manifest version bumps;
- no CI/CD deployment changes;
- no code binding to unstable Phase 2 manifest exports.

## Files

| File | Purpose |
|---|---|
| `01_PCC_Product_Architecture_and_User_Journey_Blueprint.md` | Defines PCC MVP product scope, personas, work centers, user journeys, functional modules, and day-one operating model. |
| `02_PCC_SPFx_Shell_Design_Spec.md` | Defines future PCC shell layout, regions, states, breakpoints, accessibility, and UI doctrine acceptance criteria. |
| `03_PCC_Backend_Service_Contract_Design.md` | Defines future backend service/read-model boundaries without implementation. |
| `04_PCC_Admin_Workflow_Readiness_Model.md` | Defines admin/control-plane workflows, approvals, Site Health, drift, repair request, and rollout readiness. |
| `05_Phase_3_Development_Roadmap_Updated.md` | Updates Phase 3 sequencing using the interview decisions. |
| `06_Phase_3_Closeout.md` | Captures package closeout, validation posture, and recommended next prompt. |
| `07_Phase_3_Module_Implementation_Plan.md` | Formally defines the Phase 3 module-by-module implementation waves, dependencies, exit criteria, and validation expectations. |
| `Register_Human_Decision_Register.md` | Captures every human decision resolved during the interview. |
| `Register_Interface_Assumptions.md` | Captures assumptions that must be validated before implementation. |
| `Register_Open_Decisions.md` | Captures remaining decisions that should not be invented. |
| `Register_MVP_Scope.md` | Defines MVP, later-phase, and blocked scope. |
| `Register_Workflow_Module_Register.md` | Defines MVP/later workflow modules and their target state. |

## Recommended Repo Location

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/
```

## Recommended Next Repo Prompt

Use `06_Phase_3_Closeout.md` for the next commit-ready prompt and commit description.


---

## Phase 3 Implementation Plan Added

The Phase 3 package now includes a formal implementation plan. The plan assigns each PCC module/work center to its own wave and preserves the required sequencing principle:

1. implementation gate review;
2. shared foundations;
3. SPFx shell frame;
4. backend read-model foundation;
5. module-by-module implementation;
6. hardening and non-production readiness.

The plan does not authorize provisioning execution, tenant mutation, Procore runtime, direct SPFx-to-Procore calls, production rollout, or package/deployment changes outside gated implementation prompts.
