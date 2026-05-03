# PCC Subcontractor Scorecard — Enhanced Documentation Update Package

Generated: 2026-05-03

## Purpose

This package provides a comprehensive documentation-update plan and ready-to-adapt documentation drafts for the **PCC Subcontractor Scorecard**, using a closed-decision target architecture with developer-ready implementation contracts.

It is designed for a local code agent working in:

`/Users/bobbyfetting/hb-intel`

## What This Package Does

- Defines the **Subcontractor Scorecard** as a PCC-native module in the existing **Subcontractor Performance Center** work center.
- Converts the current draft workbook into a structured source-field inventory, scoring taxonomy, and seed model, not a target UX clone.
- Resolves all architecture decisions noted in the review: module placement, route posture, TypeScript model, scoring algorithm, state machine, permissions, validation, publication, source lineage, fixtures, HBI guardrails, analytics, and acceptance criteria.
- Preserves field-level system-of-record boundaries across PCC, Procore, Sage, SharePoint/HB Document Control, Compass/Bespoke Metrics, and HBI.
- Provides staged prompts for documentation-only implementation by a local code agent.

## What This Package Does Not Do

- It does not implement runtime source code.
- It does not add backend routes.
- It does not add SPFx screens.
- It does not call Procore, Sage, Microsoft Graph, SharePoint REST/PnP, Compass, or any external system.
- It does not create, update, or delete Procore commitments, RFIs, submittals, punch items, companies, inspections, observations, or files.
- It does not post accounting data or update Sage.
- It does not mutate Compass/Bespoke Metrics prequalification data.
- It does not create an automatic vendor exclusion, blacklist, default, debarment, termination, or legal conclusion mechanism.
- It does not change `pnpm-lock.yaml`, package manifests, CI, SPFx manifests, or production deployment artifacts.

## Package Structure

```text
pcc_subcontractor_scorecard_documentation_update_package/
  README.md
  00_Repo_Truth_Context.md
  01_Research_Source_Summary.md
  02_Closed_Decisions_Register.md
  03_Comprehensive_Target_Architecture.md
  04_Developer_Implementation_Contracts.md
  05_Documentation_Update_Map.md
  06_Workbook_Source_Mapping_Policy.md
  docs/subcontractor-scorecard/
    Subcontractor_Scorecard_Target_Architecture.md
    Subcontractor_Scorecard_Scope_Lock.md
    Subcontractor_Scorecard_System_Of_Record_And_Integration_Model.md
    Subcontractor_Scorecard_Developer_Implementation_Decisions_And_Contracts.md
    Subcontractor_Scorecard_Workbook_Source_Mapping.md
    Subcontractor_Scorecard_Documentation_Closeout_Template.md
  prompts/
    Prompt_01_Repo_Audit_Workbook_Extraction_And_Source_Truth.md
    Prompt_02_Governing_Docs_Alignment.md
    Prompt_03_Target_Architecture_Documentation.md
    Prompt_04_Developer_Contracts_And_Reference_JSONs.md
    Prompt_05_Workbook_Source_Mapping_And_Seed_JSON_Finalization.md
    Prompt_06_Closeout_Validation_And_Commit.md
    Fresh_Session_Reviewer_Prompt_Subcontractor_Scorecard_Enhanced.md
  reference/
    subcontractor_scorecard_module_data_contract.json
    subcontractor_scorecard_state_machine.json
    field_mutability_matrix.json
    scorecard_validation_rules.json
    scorecard_exception_reason_codes.json
    fixture_scenarios.json
    procore_vendor_performance_data_mapping_reference.json
    scorecard_workbook_field_mapping.json
    analytics_definitions.json
    permission_matrix.json
    source_research_urls.json
```

## Canonical Closed Decisions

1. The module is `Subcontractor Scorecard`, hosted under `Subcontractor Performance Center` / `subcontractor-performance`.
2. It is a future-workstream documentation target, not an insertion into Phase 3 MVP Waves 8-14.
3. PCC owns scorecard workflow, scoring, review, publication, audit, recommendation, and derived intelligence.
4. Procore, Sage, Compass, and SharePoint/HB Document Control retain ownership of their source records.
5. Every source-backed claim requires lineage.
6. The workbook is source field inventory and v1 scoring seed, not target UX.
7. The scorecard is decision support only; it cannot automatically exclude or blacklist a vendor.
8. Draft/restricted content must not appear in estimating/procurement/executive rollups.
9. Approved records are versioned; corrections create revisions.
10. HBI cannot score, approve, publish, or make legal/procurement-exclusion decisions.

## Recommended Local-Agent Sequence

Run the prompts in order:

1. `prompts/Prompt_01_Repo_Audit_Workbook_Extraction_And_Source_Truth.md`
2. `prompts/Prompt_02_Governing_Docs_Alignment.md`
3. `prompts/Prompt_03_Target_Architecture_Documentation.md`
4. `prompts/Prompt_04_Developer_Contracts_And_Reference_JSONs.md`
5. `prompts/Prompt_05_Workbook_Source_Mapping_And_Seed_JSON_Finalization.md`
6. `prompts/Prompt_06_Closeout_Validation_And_Commit.md`

Then use:

- `prompts/Fresh_Session_Reviewer_Prompt_Subcontractor_Scorecard_Enhanced.md`

for independent review before implementation prompting.
