# Package Manifest — PCC Scorecard Evidence Automation and Audit Support

## Primary Objective

Implement a comprehensive evidence and audit-support system for the PCC 100-point UI/UX Mold Breaker scorecard.

The implementation must support:

- EV-37 through EV-106.
- EV-125 through EV-134.
- All 9 weighted scorecard pillars.
- All 10 hard-stop gates.
- Reproducible Phase 4 readiness evaluation.

## Scope

This package includes:

1. PCC live SharePoint Playwright lane.
2. Evidence registry and artifact writer.
3. Surface navigation and screenshot capture.
4. Runtime, console, host-boundary, and package/version proof.
5. Breakpoint/container/touch/overflow evidence.
6. Accessibility checks, including optional axe integration.
7. Workflow/action/source/state evidence.
8. Conditional edit-mode/high-zoom/unauthorized/drawer evidence.
9. Doctrine/source/Mold Breaker audit support.
10. Content/language/HBI authority review support.
11. Scorecard traceability and hard-stop evaluation artifacts.
12. Final report generation.

## Execution Sequence

1. `Prompt_00_Repo_Truth_Audit_And_Governing_Doc_Check.md`
2. `Prompt_01_Playwright_Live_Harness_Auth_And_Safety.md`
3. `Prompt_02_Evidence_Registry_And_Manifest_Writer.md`
4. `Prompt_03_Scorecard_Traceability_And_Hard_Stop_Model.md`
5. `Prompt_04_Surface_Page_Object_Navigation_And_Runtime_Smoke.md`
6. `Prompt_05_Surface_Screenshot_And_Full_Scroll_Evidence.md`
7. `Prompt_06_Breakpoint_Container_Overflow_Rowspan_Touch_Evidence.md`
8. `Prompt_07_Accessibility_Axe_Keyboard_Focus_ARIA_Contrast_Evidence.md`
9. `Prompt_08_Workflow_Action_Source_State_And_False_Affordance_Evidence.md`
10. `Prompt_09_Conditional_Edit_Mode_High_Zoom_Drawer_Unauthorized_State_Evidence.md`
11. `Prompt_10_Content_Language_Source_Of_Record_And_HBI_Authority_Audit.md`
12. `Prompt_11_Doctrine_Source_And_Mold_Breaker_Audit_Artifacts.md`
13. `Prompt_12_Surface_And_Primitive_Evidence_Blocks.md`
14. `Prompt_13_Scorecard_Report_Generator_And_Audit_Package.md`
15. `Prompt_14_Final_Validation_Commit_And_Handoff.md`

## Required Safety

- Do not commit auth storage state.
- Do not commit raw Playwright artifacts by default.
- Do not mutate SharePoint tenant data.
- Do not make live tenant tests mandatory CI gates until stable.
- Do not claim scorecard points solely from automation where expert review is required.
- Do not mark conditional evidence as captured unless actually captured.

## Evidence Status Taxonomy

- `captured`
- `asserted`
- `partially-captured`
- `operator-pending`
- `expert-review-required`
- `not-automatable-current-host`
- `blocked`
- `failed`

## Final Acceptance

The package is implemented when the repo can generate:

- Playwright evidence artifacts.
- EV coverage matrix.
- Pillar evidence map.
- Hard-stop worksheet.
- Findings register.
- Source/doctrine/Mold Breaker review artifacts.
- Content/HBI/source-of-record audit artifacts.
- Completed draft scorecard package ready for expert scoring.
