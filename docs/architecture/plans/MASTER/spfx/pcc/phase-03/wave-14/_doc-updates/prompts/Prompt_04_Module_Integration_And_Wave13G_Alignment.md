# Prompt 04 — Source Module Integration, Priority Actions, Project Readiness, and Wave 13G Alignment

## Objective

Document how Phase 14 integrates with PCC source modules while preserving source ownership and Wave 13G authority.

## Required Inputs

- `docs/04_Source_Module_Integration_Contracts.md`
- `artifacts/approval_source_module_integration_matrix.json`
- existing docs for Waves 6 and 8-13
- Wave 13G documentation if present locally

## Required Outputs

Create/update:

- `Wave_14_Source_Module_Integration_Contract.md`
- `Wave_14_Wave13G_Estimating_Checkpoint_Contract.md`
- governing cross-references in roadmap/module register docs.

## Required Coverage

- Team & Access approval/checkpoint contract.
- Document Control evidence/source mapping.
- Project Readiness readiness gate behavior.
- Permit & Inspection waiver/exception behavior.
- Responsibility Matrix exceptions.
- Constraints Log deferrals/waivers/overrides.
- Buyout Log handoff checkpoints.
- Estimating Workbench / Wave 13G checkpoint seams.
- External Systems mapping correction.
- Site Health repair request review.
- Priority Actions creation/dedupe/resolve/suppress.
- Executive Oversight and Admin Review Surfaces.

## Wave 13G Rules

- Wave 13G owns estimating feature contracts and UX.
- Phase 14 owns approval/checkpoint queue semantics.
- Estimate freeze, baseline, handoff, validation override, buyout seed, template-admin approval, and cost-code mapping exception must route through Phase 14 semantics when checkpointed.
- HBI cannot price, approve, waive, override, or recommend award as authority.

## Validation

- Validate JSON if changed.
- Prettier check touched markdown/json.
- Lockfile MD5 unchanged.

## Closeout

Return commit summary/description with files changed, validation, and residual risks.
