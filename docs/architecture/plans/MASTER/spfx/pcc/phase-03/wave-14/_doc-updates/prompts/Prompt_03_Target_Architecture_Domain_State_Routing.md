# Prompt 03 — Target Architecture, Domain Model, State Machine, and Routing

## Objective

Add the full Wave 14 target architecture and implementation contracts for domain entities, state transitions, routing modes, decision actions, reason codes, stale/supersession rules, and command validation.

## Required Inputs

- `docs/01_Exhaustive_Target_Architecture.md`
- `docs/02_Domain_Model_And_Data_Contracts.md`
- `docs/03_State_Routing_And_Command_Validation.md`
- `artifacts/approval_checkpoint_state_machine.json`
- `artifacts/approval_mode_registry.json`
- `artifacts/approval_decision_action_registry.json`
- `artifacts/approval_role_action_matrix.json`
- `artifacts/approval_validation_rules.json`

## Required Outputs

Create or update Wave 14 docs under:

`docs/architecture/blueprint/sp-project-control-center/phase-3/wave-14/`

Add, at minimum:

- `Wave_14_Approvals_Checkpoints_Target_Architecture.md`
- `Wave_14_Domain_Model_And_State_Machine.md`
- `Wave_14_Routing_And_Permission_Matrix.md`
- `Wave_14_Test_And_Acceptance_Gates.md`

## Required Architecture Coverage

- all canonical states;
- transition table;
- approval modes;
- decision actions;
- reason code catalog;
- reviewer vs approver distinction;
- admin-verification distinction;
- HBI no-authority;
- current action owner / ball-in-court;
- stale-source and supersession rules;
- policy versioning;
- evidence requirements;
- command validation layers.

## Validation

- Every JSON artifact must pass `python3 -m json.tool`.
- Prettier check touched markdown/json.
- Lockfile MD5 unchanged.

## Closeout

Return commit summary/description with validation evidence.
