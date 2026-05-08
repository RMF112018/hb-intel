# Package Manifest — PCC Phase 03 Conditional Command Header Content v2

## Package Name

`PCC_Phase_03_Conditional_Command_Header_Content_Package_v2`

## Generated Files

```text
COMMON_REQUIREMENTS.md
PACKAGE_MANIFEST.md
README.md
Implementation_Plan.md
Prompt_01_Repo_Baseline_And_Phase_2_Verification.md
Prompt_02_Surface_Command_Header_Metadata.md
Prompt_03_PccProjectHeroBand_Conditional_Rendering.md
Prompt_04_Header_A11y_And_Responsive_Semantics.md
Prompt_05_Tests_And_Targeted_Validation.md
Prompt_06_Phase_4_Handoff_Inventory.md
Auditor_Prompt_For_Phase_3_Completion_Review.md
```

## Execution Order

```text
01 -> 02 -> 03 -> 04 -> 05 -> 06
```

## Required Auditor Use

Use `Auditor_Prompt_For_Phase_3_Completion_Review.md` in a fresh ChatGPT session to review:

- Prompt 01 plan;
- Prompt 01 completion;
- each later local-agent plan;
- each following-execution report;
- final Phase 03 closeout.

## Package Design Notes

This package intentionally separates:

- repo baseline and target metadata design;
- metadata implementation;
- header rendering implementation;
- accessibility/responsive hardening;
- tests/validation;
- Phase 04 handoff inventory.

This prevents the local agent from collapsing Phase 03 into Phase 04 duplicate-card removal or Phase 05 module launcher work.
