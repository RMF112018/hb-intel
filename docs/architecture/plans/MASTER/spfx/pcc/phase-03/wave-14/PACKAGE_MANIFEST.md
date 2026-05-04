# Package Manifest — PCC Wave 14 Approvals / Checkpoints Implementation Prompt Set

## Package Name

`pcc_wave14_approvals_checkpoints_implementation_prompt_set`

## Purpose

Provide a developer-ready, staged implementation prompt package for Wave 14 Approvals / Checkpoints, adapted to repo truth and research findings.

## Content Inventory

| Path | Purpose |
| --- | --- |
| README.md | Package use instructions and execution rules |
| docs/00_EXISTING_WAVE_14_DOCUMENTATION_MAP.md | Governing docs, Wave 14 docs/artifacts, repo seams, and current posture |
| docs/01_REPO_TRUTH_AUDIT_SUMMARY.md | Remote repo-truth findings and local revalidation requirements |
| docs/02_IMPLEMENTATION_SEQUENCE_OVERVIEW.md | Staged execution plan, dependencies, deliverables, validation, stop conditions |
| prompts/01_Wave_14_Implementation_Readiness_Audit.md | Read-only local audit prompt |
| prompts/02_Shared_Models_Fixtures_State_Machine_And_Contracts.md | Shared models/fixtures/state machine prompt |
| prompts/03_Backend_GET_Only_Mock_Read_Model.md | Backend GET-only read model prompt |
| prompts/04_SPFX_Read_Model_Client_And_Fixture_Parity.md | SPFx client/fallback/parity prompt |
| prompts/05_SPFX_Approvals_Checkpoints_Surface_Shell.md | SPFx UI surface prompt |
| prompts/06_Priority_Readiness_Source_Module_And_Wave13G_Seams.md | Integration seams prompt |
| prompts/07_Tests_Guardrails_And_Implementation_Closeout.md | Tests/closeout prompt |
| prompts/08_Fresh_Reviewer_Prompt.md | Fresh-session implementation reviewer prompt |
| reference/00_CONTROLLING_OBJECTIVE.md | Module identity and controlling objective |
| reference/01_REQUIRED_REPO_TRUTH_FILES.md | Required file/path checklist |
| reference/02_WAVE_14_REQUIRED_FIELDS_STATUSES_AND_CONTRACTS.md | Required domain/state/read-model/UX contracts |
| reference/03_HARD_GUARDRAILS.md | Hard prohibitions |
| reference/04_VALIDATION_COMMAND_REFERENCE.md | Validation command guide |
| reference/05_RESEARCH_PATTERN_REFERENCE.md | Research sources and implementation implications |

## Hard Usage Rules

- Execute prompts in order.
- Prompt 01 is read-only and produces no commit.
- Every implementation prompt must start by revalidating local repo truth.
- Every implementation prompt must stage only authorized files.
- Every commit must include validation evidence and guardrail attestation.
- Do not import dependency candidates or mutate package files unless separately authorized.

## Package Limitations

- The generator could not run local commands under `/Users/bobbyfetting/hb-intel`.
- Remote GitHub audit cannot prove local worktree cleanliness.
- Public research informs patterns only; it does not authorize cloning commercial product behavior or adding runtime dependencies.
