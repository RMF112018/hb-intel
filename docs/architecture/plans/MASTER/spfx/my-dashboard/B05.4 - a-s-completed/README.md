# Adobe Sign `Completed` Header-Toggle Implementation Prompt Package

## Purpose

This package instructs a local code agent to implement the **full and complete Adobe Sign completed-agreements enhancement** inside the HB Intel **My Dashboard** application.

The package is decision-closed. It does not ask the agent to invent product behavior, choose competing architectures, or re-decide user-facing posture. It directs the agent to:

1. preserve the now-working **Adobe Sign pending action queue**;
2. replace the current static `Action Queue` card sub-head with a **dynamic header toggle**:
   - `Action Queue`
   - `Completed`
3. add a **lazy-loaded, read-only completed-agreements lane** beneath the same single Adobe Sign card;
4. implement the backend route, shared contracts, telemetry, frontend state, UI, tests, and documentation required for production-grade closure;
5. complete the work without tenant mutation, runtime deployment, package-manifest edits, lockfile changes, or unrelated code drift.

## Locked product decision

The Adobe Sign card remains one card.

The card header must render:

```text
Adobe Sign
Action Queue    Completed
```

Behavior:

- `Action Queue` is selected by default.
- The selected label is visually larger, stronger, and occupies the existing card sub-head emphasis.
- The deselected label is adjacent, smaller, but still deliberate and clearly interactive.
- Selecting `Completed` swaps the header emphasis and conditionally renders the completed-agreements card body.
- Selecting `Action Queue` restores the pending-action body.
- The control belongs in the card header/title slot, **not** as a separate body tab row below the header.

## Locked completed-view definition

`Completed` means:

> Adobe Sign agreements in a completed terminal state, visible to the authenticated Adobe Sign principal, bounded to the last 30 days, ordered most recent first.

It does **not** mean:

- actions personally completed by the current user;
- agreements the user personally signed;
- all completed agreements across the tenant;
- agreements merely modified recently without a completed terminal state.

The UI label is intentionally short:

```text
Completed
```

The body copy may use fuller language such as:

```text
No completed Adobe Sign agreements were found in the last 30 days.
```

## Package run order

Execute prompts in this order and do not skip ahead:

1. `prompts/Prompt_01_Repo_Truth_Adobe_Search_Confirmation_And_Scope_Lock.md`
2. `prompts/Prompt_02_Shared_Contracts_Routes_Fixtures_And_Exports.md`
3. `prompts/Prompt_03_Backend_Search_Intent_Request_Builder_And_Search_Seam.md`
4. `prompts/Prompt_04_Backend_Recent_Completions_Adapter_Provider_Route_And_Telemetry.md`
5. `prompts/Prompt_05_Frontend_Client_Lazy_Completed_View_State_And_VM.md`
6. `prompts/Prompt_06_Adobe_Card_Header_Toggle_Completed_Panel_And_UI_Test_Closure.md`
7. `prompts/Prompt_07_Documentation_Reconciliation_Validation_And_Commit_Closeout.md`
8. `prompts/Prompt_08_Final_Integrated_Regression_Review_And_Release_Readiness.md`

## Package contents

### Governing documents

- `00_Plan_Summary.md`
- `01_Repo_Truth_Audit_Summary.md`
- `02_Outside_Research_Summary.md`
- `03_Closed_Decision_Register.md`
- `04_Full_Absolute_Implementation_Plan.md`
- `05_Target_Contract_Route_And_DTO_Map.md`
- `06_UI_Interaction_State_And_Copy_Matrix.md`
- `07_Validation_Command_Ledger.md`
- `08_Execution_Run_Order.md`
- `09_Implementation_Risk_Register_And_Burden_Of_Proof.md`

### Supporting documents

- `supporting/00_Current_Repo_Truth_Map.md`
- `supporting/01_Audit_To_Implementation_Delta_Register.md`
- `supporting/02_Validation_And_Commit_Closeout_Template.md`
- `supporting/03_Expected_New_Symbols_And_Identifiers.md`
- `supporting/04_Exact_Copy_Library_And_DOM_Markers.md`

### Local-agent prompts

- `prompts/Prompt_01_...` through `prompts/Prompt_08_...`

## Mandatory operating rule repeated in every prompt

> **Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.**

## Global constraints

The local agent must not:

- run live Adobe Sign tenant requests;
- mutate SharePoint, Adobe Sign, Procore, Graph, or any external tenant;
- deploy Azure Functions;
- deploy SharePoint packages;
- edit SPFx manifests;
- edit CI/CD workflows;
- run `pnpm install`, `pnpm add`, or any dependency mutation;
- change `pnpm-lock.yaml`;
- change package versions unless a prompt expressly authorizes it;
- broaden scope beyond the Adobe Sign completed-toggle implementation.

## Expected final outcome

At completion:

- the existing pending action queue still works exactly as it does now;
- the card header now toggles between `Action Queue` and `Completed`;
- `Completed` lazy-loads recent completed agreements only on first selection;
- completed results use a separate read-model lane, route, DTO family, adapter, telemetry event, and UI panel;
- the new route is read-only, actor-bound, protected, and bounded;
- the completed display does not overstate user action ownership;
- docs, tests, telemetry, copy, and regression evidence are updated;
- every scoped implementation prompt has a proof-of-closure closeout.
