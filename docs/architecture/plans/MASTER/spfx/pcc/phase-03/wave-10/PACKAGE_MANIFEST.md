# Package Manifest

Package: `wave10_permit_inspection_implementation_prompt_set_v2`  
Generated: 2026-05-01  
Target repo: `/Users/bobbyfetting/hb-intel`  
Target branch: local agent must verify  
Target module: Phase 3 / Wave 10 — Permit & Inspection Control Center

## Included Files

### Root

- `README.md` — package overview and execution order.
- `PACKAGE_MANIFEST.md` — this manifest.

### Docs

- `docs/00_EXISTING_WAVE_10_DOCUMENTATION_MAP.md` — Wave 10 documentation and implementation map.
- `docs/01_REPO_TRUTH_AUDIT_SUMMARY.md` — repo-truth audit summary based on available GitHub audit plus required local verification.
- `docs/02_IMPLEMENTATION_SEQUENCE_OVERVIEW.md` — staged build sequence and boundaries.

### Prompts

- `prompts/01_Wave_10_Implementation_Readiness_Audit.md`
- `prompts/02_Shared_Models_And_Fixture_Contracts.md`
- `prompts/03_Backend_GET_Only_Mock_Read_Model.md`
- `prompts/04_SPFX_Read_Model_Client_And_Fixture_Parity.md`
- `prompts/05_SPFX_Permit_Inspection_Control_Center_Surface_Shell.md`
- `prompts/06_Priority_Readiness_Approvals_Integration.md`
- `prompts/07_Tests_Guardrails_And_Implementation_Closeout.md`
- `prompts/08_Fresh_Reviewer_Prompt.md`

### Reference

- `reference/00_CONTROLLING_OBJECTIVE.md`
- `reference/01_REQUIRED_REPO_TRUTH_FILES.md`
- `reference/02_WAVE_10_REQUIRED_FIELDS_AND_STATUSES.md`
- `reference/03_HARD_GUARDRAILS.md`
- `reference/04_VALIDATION_COMMAND_REFERENCE.md`
- `reference/05_RESEARCH_PATTERN_REFERENCE.md`

## Required Fields Locked Into Package

The implementation prompts explicitly require these target-added fields:

- permit `revision`
- permit `applicationValue`
- permit `permitFee`
- inspection `reInspectionFee`

## Required Safety Posture

Wave 10 is allowed to implement internal read-models, fixtures, fixture-first SPFx UI, inert/reference-only actions, and non-mutating integration signals.

Wave 10 is not authorized to implement live AHJ, Procore, Microsoft Graph, SharePoint REST/PnP, evidence storage/upload/sync, external writeback, backend writes, approval execution, packaging, deployment, or production rollout.
