# PCC Phase 3 Wave 11 — Responsibility Matrix Documentation Update Prompt Package

Generated: 2026-05-02

## Purpose

This package instructs a local code agent to implement detailed and comprehensive documentation updates for **PCC Phase 3 / Wave 11 — Responsibility Matrix**.

It follows the structure of the Wave 10 Permit & Inspection documentation-update prompt package, adapted for Wave 11 and the Responsibility Matrix module.

This is a **documentation-update prompt package only**. It does not implement runtime code.

## Final Module Direction

**Official user-facing module name:** Responsibility Matrix

**Subtitle:** RACI + Owner-Contract Responsibility Control Center

**Module posture:** A governed, template-driven, project-instance-based Project Readiness module that converts company responsibility workbooks into source-traceable, item-level responsibility records.

The target architecture must define:

- template library and version governance;
- project responsibility instances separate from template definitions;
- workbook import, mapping, review, and approval workflow;
- two-axis model separating contract-party responsibility from internal RACI;
- owner-contract obligation reference model;
- RACI/RAM baseline plus decision-rights overlay;
- assignment lifecycle, handoff, and Team & Access role resolution;
- current action owner / ball-in-court posture;
- workflow-step model;
- notification and escalation policy;
- evidence / Document Control link posture;
- Matrix Health Score;
- Priority Actions and Project Readiness integration;
- Approvals / Checkpoints handoff posture;
- snapshot/export governance;
- explicit no-legal-advice and no-external-mutation guardrails.

## Source Inputs

### Workbook templates

The local agent must inspect the repo-resident files:

```text
docs/reference/example/Responsibility Matrix - Template.xlsx
docs/reference/example/Responsibility Matrix - Owner Contract Template.xlsx
```

Prior extraction found:

- 109 workbook-derived default responsibility items:
  - 82 from the PM sheet;
  - 27 from the Field sheet.
- 36 ambiguous owner-contract placeholder rows.
- The owner-contract workbook contains a template structure and party-code posture, but not populated default obligation descriptions.

The local agent must verify these findings against the live repo files before documenting them as repo truth.

## Package Structure

```text
00_Repo_Truth_Basis.md
01_Workbook_Source_Analysis.md
02_Web_Research_Summary.md
03_Resolved_Decisions_Register.md
04_COMPLETE_Target_Architecture_Responsibility_Matrix.md
05_Documentation_Update_Roadmap.md
06_Prompt_01_Repo_Audit_And_Workbook_Traceability.md
07_Prompt_02_Governing_Docs_Update.md
08_Prompt_03_Wave11_Target_Architecture_File.md
09_Prompt_04_Workbook_Mapping_Appendix_And_Default_Items_JSON.md
10_Prompt_05_Closeout_Validation.md
11_Reviewer_Prompt.md
reference/default_responsibility_matrix_items.json
reference/default_responsibility_matrix_items_schema.md
reference/workbook_extraction_notes.md
reference/research_source_index.md
```

## Required Target Docs in Repo

The local agent should create or update:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-11/Responsibility_Matrix_Target_Architecture.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-11/Wave_11_Responsibility_Matrix_Scope_Lock.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-11/Wave_11_Resolved_Decisions_Register.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-11/Wave_11_Workbook_Source_Mapping.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-11/Wave_11_Documentation_Closeout.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-11/reference/default_responsibility_matrix_items.json
```

The local agent may update governing docs only where repo truth confirms the need.

## Hard Guardrails

- Documentation only.
- No runtime implementation.
- No code changes.
- No package/dependency/lockfile changes.
- No manifest or workflow changes.
- No SPFx packaging or deployment.
- No tenant mutation.
- No Procore, Sage, Microsoft Graph, SharePoint REST/PnP, AHJ, Document Crunch, Adobe Sign, or external-system runtime operations.
- No legal advice.
- No automatic creation of legal obligations.
- No replacement of executed contracts.
- No production rollout.
