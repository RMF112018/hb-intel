# Prompt 05 — Read Models, SharePoint Storage Posture, SPFx UX, and Wireframes

## Objective

Document the read-model/command-model separation, SharePoint index/storage posture, SPFx UX contract, and wireframes for Phase 14.

## Required Inputs

- `docs/05_Read_Model_Command_Model_And_SharePoint_Storage.md`
- `docs/06_SPFX_UX_Accessibility_Contract.md`
- `docs/07_Wireframes_And_Interaction_Model.md`
- `docs/wireframes/**`
- `artifacts/approval_read_model_command_contract.json`
- `artifacts/sharepoint_index_strategy.json`
- `artifacts/ux_wireframe_inventory.json`

## Required Outputs

Create/update:

- `Wave_14_SPFX_UX_And_Wireframes.md`
- `Wave_14_SharePoint_Read_Model_And_Storage_Posture.md`
- wireframe markdown files under the Wave 14 documentation path or referenced planning path.

## Required Coverage

- Approvals Home.
- My Approvals.
- Approval Detail.
- Checkpoint Registry.
- Decision History.
- Escalation Queue.
- Admin Verification Queue.
- Module Integration Panels.
- queue filters, sorting, pagination, saved views, and disabled action reasons.
- accessibility and keyboard behavior.
- SharePoint list candidates and indexed columns.
- no default item-level unique permission strategy.
- read-model-first, command-model-gated posture.

## Forbidden

- No runtime UI implementation.
- No SPFx source changes.
- No SharePoint list creation.
- No package/dependency changes.

## Validation

- Validate JSON if changed.
- Prettier check touched markdown/json.
- Lockfile MD5 unchanged.

## Closeout

Return commit summary/description with validation evidence.
