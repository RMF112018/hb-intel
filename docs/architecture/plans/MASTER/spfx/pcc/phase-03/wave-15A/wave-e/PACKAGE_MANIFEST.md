# Package Manifest — PCC Phase 3 Wave 15A / Wave E State Model and Product Language Remediation

## Package Identity

- Package: `wave-e-state-model-product-language-remediation`
- Intended repository placement: `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-E-state-model-product-language-remediation/`
- Source assignment: Wave 15A / Wave E — State Model and Product Language
- Generated from uploaded prompt: `Fresh_Session_Prompt_Wave15A_WaveE_State_Model_Product_Language(1).md`
- Repository audited: `RMF112018/hb-intel`
- Remote snapshot observed: `6b9f3fc4608f95ae728f94aba4999e6cd15491e4`
- Generated: `2026-05-05`

## Purpose

This package gives a local code agent a staged, evidence-backed remediation and verification plan for PCC-wide operational state behavior and product language.

It is intentionally not a runtime implementation. It does not contain final code. It tells the local agent what to inspect, what to change only if current repo truth still shows gaps, what to test, what screenshots/evidence to capture, and what closeout language is allowed.

## Repo-Truth Qualification

Current repo truth already includes a Wave 15A Prompt 05 closeout claiming substantial completion of state/product-language remediation. That closeout reports:

- product-grade defaults in `PccPreviewState`;
- `reason` and `nextStep` slots;
- a `PccDisabledAffordance` helper for inert controls with accessible explanations;
- centralized `pccSurfacePostureCopy`;
- Documents source-state messaging;
- surface copy migrations across Documents, Approvals, Project Home, Project Readiness, External Systems, Site Health, Control Center Settings, and Team & Access;
- exact-string state tests and disabled-action tests;
- no lockfile drift.

This package must therefore be used in one of two modes:

1. **Verification/hardening mode** — if the local worktree already includes Prompt 05 changes.
2. **Implementation mode** — if the local worktree is behind the audited main branch and still contains developer-facing state language.

## File Inventory

### Root

| File | Purpose |
|---|---|
| `PACKAGE_MANIFEST.md` | Package identity, source authority, execution mode, file inventory. |
| `README.md` | Operator-facing execution instructions and first prompt guidance. |

### Documentation

| File | Purpose |
|---|---|
| `docs/00_WAVE_E_REPO_TRUTH_AUDIT_FINDINGS.md` | Confirmed repo-truth findings, inspected files, readiness posture. |
| `docs/01_STATE_MODEL_DOCTRINE_MATRIX.md` | Doctrine-to-implementation matrix for Wave E. |
| `docs/02_CURRENT_STATE_COMPONENT_AND_LANGUAGE_INVENTORY.md` | Current state components, mapping utilities, and language inventory. |
| `docs/03_SURFACE_STATE_USAGE_INVENTORY.md` | Surface-by-surface state usage and gap inventory. |
| `docs/04_TARGET_STATE_TAXONOMY_AND_CONTENT_STANDARD.md` | Target state taxonomy, fields, copy rules, and forbidden language. |
| `docs/05_DISABLED_ACTION_AND_PREVIEW_SAFE_INTERACTION_STANDARD.md` | Disabled-action standard and preview-safe affordance requirements. |
| `docs/06_IMPLEMENTATION_REQUIREMENTS.md` | Specific staged implementation/hardening requirements. |
| `docs/07_TEST_SCREENSHOT_AND_ACCESSIBILITY_EVIDENCE_PLAN.md` | Test, screenshot, keyboard, and evidence requirements. |
| `docs/08_RISK_DECISION_AND_DEFERMENT_LOG.md` | Risks, decisions, deferments, and closeout limits. |

### Prompts

| File | Purpose |
|---|---|
| `prompts/Prompt_01_State_Model_Scope_Lock_And_File_Map.md` | Validate scope, source ownership, file map, and execution mode. |
| `prompts/Prompt_02_Shared_State_Taxonomy_Components_And_Mapping.md` | Harden shared state taxonomy, mapping, and primitives. |
| `prompts/Prompt_03_Product_Language_Migration_And_Diagnostics_Repositioning.md` | Migrate product language and move diagnostics out of primary hierarchy. |
| `prompts/Prompt_04_Disabled_Action_Explanations_And_Preview_Safe_Affordances.md` | Ensure all inert controls are explained and accessible. |
| `prompts/Prompt_05_Apply_State_Model_To_All_Current_PCC_Surfaces.md` | Apply/verify state model across all routed PCC surfaces. |
| `prompts/Prompt_06_State_Model_Tests_Screenshots_And_Accessibility_Evidence.md` | Add/verify tests, screenshots, keyboard, and accessibility evidence. |
| `prompts/Prompt_07_Wave_E_Closeout_Evidence_And_Handoff.md` | Produce final Wave E closeout/handoff without overclaiming 56/56. |

### Artifact Templates

| File | Purpose |
|---|---|
| `artifacts/scorecard-impact-template.md` | Template for documenting scorecard impact. |
| `artifacts/screenshot-evidence-index-template.md` | Template for screenshot index and capture metadata. |
| `artifacts/wave-agent-closeout-template.md` | Template for local-agent closeout. |
| `artifacts/source-file-map-template.md` | Template for state-source and language-source map. |

## Execution Order

1. `Prompt_01_State_Model_Scope_Lock_And_File_Map.md`
2. `Prompt_02_Shared_State_Taxonomy_Components_And_Mapping.md`
3. `Prompt_03_Product_Language_Migration_And_Diagnostics_Repositioning.md`
4. `Prompt_04_Disabled_Action_Explanations_And_Preview_Safe_Affordances.md`
5. `Prompt_05_Apply_State_Model_To_All_Current_PCC_Surfaces.md`
6. `Prompt_06_State_Model_Tests_Screenshots_And_Accessibility_Evidence.md`
7. `Prompt_07_Wave_E_Closeout_Evidence_And_Handoff.md`

## Non-Implementation Boundary

This package does not authorize backend/API scope creep, live Microsoft Graph/PnP/Procore/Document Crunch/Adobe Sign calls, routing ID changes, SharePoint app-catalog deployment, `.sppkg` generation, or final 56/56 claims.
