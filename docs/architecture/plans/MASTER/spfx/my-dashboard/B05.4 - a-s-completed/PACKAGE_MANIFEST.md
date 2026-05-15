# Package Manifest

## Package name

`adobe_sign_completed_toggle_prompt_package`

## Objective

Deliver a decision-closed implementation package for the My Dashboard Adobe Sign enhancement that introduces a header-level `Action Queue` / `Completed` view toggle inside the existing single Adobe Sign card and implements a complete backend/frontend read-model lane for recent completed agreements.

## Governing assumptions already locked

- Current repo continuation anchor: `0926216b3dbfc603af05a8c87e547db20be52406`
- Current implementation already supports the live pending action queue and confirmed `/v6/search` response parsing for `agreementAssetsResults.agreementAssetsResultList`.
- The enhancement must not destabilize the working pending path.
- The completed view must be a sibling lane, not a generalization of the pending action queue DTO.
- `Completed` uses a 30-day bounded read-only recent-agreement view.
- UI control location is the existing card sub-head/title position.

## Directory tree

```text
adobe_sign_completed_toggle_prompt_package/
├── README.md
├── PACKAGE_MANIFEST.md
├── FILE_TREE.txt
├── 00_Plan_Summary.md
├── 01_Repo_Truth_Audit_Summary.md
├── 02_Outside_Research_Summary.md
├── 03_Closed_Decision_Register.md
├── 04_Full_Absolute_Implementation_Plan.md
├── 05_Target_Contract_Route_And_DTO_Map.md
├── 06_UI_Interaction_State_And_Copy_Matrix.md
├── 07_Validation_Command_Ledger.md
├── 08_Execution_Run_Order.md
├── 09_Implementation_Risk_Register_And_Burden_Of_Proof.md
├── supporting/
│   ├── 00_Current_Repo_Truth_Map.md
│   ├── 01_Audit_To_Implementation_Delta_Register.md
│   ├── 02_Validation_And_Commit_Closeout_Template.md
│   ├── 03_Expected_New_Symbols_And_Identifiers.md
│   └── 04_Exact_Copy_Library_And_DOM_Markers.md
└── prompts/
    ├── Prompt_01_Repo_Truth_Adobe_Search_Confirmation_And_Scope_Lock.md
    ├── Prompt_02_Shared_Contracts_Routes_Fixtures_And_Exports.md
    ├── Prompt_03_Backend_Search_Intent_Request_Builder_And_Search_Seam.md
    ├── Prompt_04_Backend_Recent_Completions_Adapter_Provider_Route_And_Telemetry.md
    ├── Prompt_05_Frontend_Client_Lazy_Completed_View_State_And_VM.md
    ├── Prompt_06_Adobe_Card_Header_Toggle_Completed_Panel_And_UI_Test_Closure.md
    ├── Prompt_07_Documentation_Reconciliation_Validation_And_Commit_Closeout.md
    └── Prompt_08_Final_Integrated_Regression_Review_And_Release_Readiness.md
```

## Execution posture

- Run one prompt at a time.
- Review the local agent closeout after each prompt.
- Do not combine prompts unless explicitly choosing to run a master pass manually.
- Do not let the agent skip Prompt 01: the exact Adobe `/v6/search` completed-filter request body must be confirmed before code implementation.
- Prompt 01 is read-only; Prompts 02–07 implement; Prompt 08 performs integrated verification and remediates any scoped residual defects.

## Prohibited package substitutions

Do not reinterpret the package as:

- a UI-only refactor;
- a completed activity audit-only memo;
- a separate companion card;
- a pending action queue redesign;
- a historical Adobe dashboard analytics initiative.

This package is specifically and only the **Adobe Sign completed header-toggle implementation**.
