# Package Manifest — Adobe Sign Flagship UI/UX Remediation

**Package generated:** 2026-05-16  
**Target repo:** `RMF112018/hb-intel`  
**Target application:** `apps/my-dashboard`  
**Target module:** Adobe Sign card inside My Dashboard  
**Current repo baseline:** `7ae348ed5ee912e72a7ec1d703ad53bdc18bd090`  
**Current baseline commit summary:** `adobe-sign: add completed view header toggle to action queue card`

## Purpose

This package is a **decision-closed implementation program** for taking the current My Dashboard Adobe Sign card from its present functional-but-under-authored posture to a **flagship, doctrine-aligned, benchmark-grade operational module**.

The package gives a local code agent:

- the repo-truth baseline;
- the closed product/design decisions;
- the target card anatomy;
- state-by-state render requirements;
- responsive behavior rules;
- accessibility/interaction contract;
- exact staged implementation prompts;
- validation commands;
- commit protocol;
- closeout/evidence requirements;
- a fresh-session reviewer prompt for independent re-audit.

## Locked Outcome

The final module must become:

> A compact, status-aware, premium operational Adobe Sign activity card that surfaces pending work and recent completion intelligence with clear hierarchy, strong host fit, explicit keyboard semantics, and zero low-value stretched whitespace.

## File Inventory

```text
PACKAGE_MANIFEST.md
README.md

docs/
  00_Executive_Implementation_Summary.md
  01_Repo_Truth_Current_State_Audit.md
  02_Closed_Decisions_And_Target_Posture.md
  03_Target_Flagship_Card_Anatomy_And_UX_Spec.md
  04_Component_Architecture_And_File_Map.md
  05_State_Render_Matrix.md
  06_Responsive_And_Shell_Fit_Spec.md
  07_Copy_Deck_And_Content_Rules.md
  08_Data_Contract_And_Backend_Followup_Decisions.md
  09_Accessibility_And_Interaction_Contract.md
  10_Test_Validation_And_Evidence_Plan.md
  11_Implementation_Wave_Plan.md
  12_Acceptance_Targets_And_Scorecard_Recovery.md

prompts/
  01_ReadOnly_RepoTruth_Readiness_Audit.md
  02_Module_Boundary_And_Card_Height_Posture.md
  03_Header_Status_Rail_And_ViewSwitch_Rebuild.md
  04_Activity_Rows_Summary_Rails_And_Preview_Context.md
  05_State_Panels_Copy_Completion_And_Completed_Retry.md
  06_Responsive_ShellFit_And_Compact_Mode_Hardening.md
  07_Accessibility_Tests_Keyboard_And_Regression_Closure.md
  08_Hosted_Evidence_Reaudit_Scorecard_And_Closeout.md
  09_Fresh_Session_Reviewer_Prompt.md
  PROMPT_EXECUTION_SEQUENCE.md

reference/
  00_Audit_Findings_Gap_Register.md
  01_Repo_Truth_File_Inspection_Map.md
  02_Global_Guardrails_Allowed_And_Forbidden_Scope.md
  03_Command_Validation_Lanes.md
  04_Commit_Protocol.md
  05_Input_Audit_Checklist.md
  06_Input_Audit_Scorecard.md
  07_Source_Audit_Prompt.md
  08_Current_Render_Screenshot_Observations.md

artifacts/
  decision_register.json
  state_render_matrix.json
  file_touch_matrix.json

evidence/current-render/
  adobe_sign_action_queue_current.png
  adobe_sign_completed_current.png
```

## Prompt Execution Rule

Execute prompts in strict order:

1. Prompt 01 — read-only repo-truth readiness audit.
2. Review the agent's Prompt 01 report.
3. Prompts 02 through 07 — implementation waves.
4. Prompt 08 — validation/evidence/re-score/closeout.
5. Prompt 09 — optional independent fresh-session re-audit.

Do **not** skip Prompt 01. Do **not** collapse prompts into one mega-edit. The sequence is designed to reduce regressions and preserve evidence.

## Decision-Closed Rule

The product/design decisions in this package are final for this implementation effort. The local agent may stop only when:

- repo truth directly contradicts the package;
- a required file/path does not exist;
- a requested change would require forbidden package/lockfile/manifest/backend expansion;
- a validation failure proves the plan must be revised.

The agent must not reopen settled product decisions casually.

## Standing Context Discipline

Every prompt includes this instruction:

> Do not re-read files that are still within your current context or memory unless repo truth is stale, missing, contradictory, or exact edit context must be verified.

## Completion Definition

This package is complete only when:

- the Adobe Sign card no longer stretches into an oversized sparse well;
- the card heading is stable and noninteractive;
- the view switch is a proper semantic control separate from the heading;
- visible status/freshness context is present;
- queue/completed rows use Adobe-specific activity-row grammar;
- preview-limit semantics are visible where applicable;
- missing completed metadata degrades gracefully;
- completed-panel retry exists for card-owned lazy-fetch error posture;
- responsive behavior is explicit and tested;
- accessibility semantics are upgraded and validated;
- scorecard recovery targets are documented;
- hosted evidence is captured or explicitly flagged as the remaining acceptance gate.
