# PCC Phase 08 — Product Experience Enhancement, Visual System Refinement, Accessibility, and Evidence Closeout

Generated: 2026-05-11
Repo: `RMF112018/hb-intel`
Current Phase 08 execution baseline HEAD: `877493c31c3a8aa9e2316ca5d958b78b479be059`
Historical package baseline reference: `7d8bae430ab999d4fb38abe8de6689b89d8f4d27`
Package / manifest version: `1.0.0.222`
Lockfile md5: `7c19ccfa8718a42f7f55ce178a626996`

## Purpose

This package contains the Phase 08 product-experience enhancement plan and a focused prompt sequence for executing it. It is designed for local execution by Claude Code using Opus 4.7.

This is **not** a generic UI polish package. It directs the agent to improve PCC as an end-user-facing project command center: stronger command layer, better visual hierarchy, more useful cards, improved module access, insight-led analytics, microinteractions, accessibility, and evidence closeout.

## Package Contents

```text
README.md
package_manifest.json
00_PCC_Phase_08_Product_Experience_Enhancement_Plan.md          (canonical Phase 08 plan)
00_PCC_Phase_08_Product_Experience_Enhancement_Implementation_Plan.md  (historical predecessor, retained for context)
01_Screenshot_Baseline_Findings.md                              (Prompt 02 output — surface-by-surface findings matrix)
reference/
  01_Screenshot_Baseline_Findings_Template.md
  02_Operator_Visual_Review_Checklist.md
  10_Project_Record_Fixture_Folder_Paths.json
  10_Project_Record_Fixture_Summary.md
templates/Closeout_Template.md
auditor/Fresh_Session_Auditor_Prompt_Phase_08.md
prompts/
  00_Preflight_Repo_Truth_Gate.md
  01_Product_Experience_Enhancement_Brief.md
  02_Screenshot_Findings_Matrix.md
  03_Shell_and_Host_Fit_Enhancement.md
  04_Command_Header___Hero_Enhancement.md
  05_Command_Search_Preview_Enhancement.md
  06_Tab_and_Module_Launcher_Enhancement.md
  07_Card_Taxonomy_and_Visual_System.md
  08_Gateway_Action_Enhancement.md
  09_Project_Home_Experience_Enhancement.md
  10_Document_Control_Explorer_Target_Architecture_and_Implementation_Plan.md
  10A_Document_Control_Explorer_Repo_Truth_Gate.md
  10B_Document_Control_Explorer_Model_And_Fixture_Contract.md
  10C_Document_Control_Explorer_Shell_And_Ready_Path_Composition.md
  10D_Document_Control_Explorer_Navigation_State_And_Source_Switching.md
  10E_Document_Control_Explorer_Procore_Directory_And_External_References.md
  10F_Document_Control_Legacy_Card_Reconciliation_And_Guardrail_Migration.md
  10G_Document_Control_Explorer_Accessibility_Responsive_Evidence_And_Closeout.md
  11_Shared_Primary_Dashboard_Surface_Enhancement.md
  12_Analytics_Insight_Enhancement.md
  13_Cross_Surface_Choreography.md
  14_Microinteraction_and_State_Refinement.md
  15_Content_and_Microcopy_Refinement.md
  16_Accessibility_and_Regression_Tests.md
  17_Playwright_Evidence_and_Scorecard_Closeout.md
```

The canonical Phase 08 plan is `00_PCC_Phase_08_Product_Experience_Enhancement_Plan.md`. The `_Implementation_Plan.md` file is the package's earlier predecessor and is retained for historical context only; it is not the governing plan for Phase 08 execution.

### Prompt 10 Replacement Note

The original single-step Document Control enhancement prompt has been superseded by a focused **Document Control Explorer** implementation sequence.

Use:

```text
prompts/10_Document_Control_Explorer_Target_Architecture_and_Implementation_Plan.md
prompts/10A_Document_Control_Explorer_Repo_Truth_Gate.md
prompts/10B_Document_Control_Explorer_Model_And_Fixture_Contract.md
prompts/10C_Document_Control_Explorer_Shell_And_Ready_Path_Composition.md
prompts/10D_Document_Control_Explorer_Navigation_State_And_Source_Switching.md
prompts/10E_Document_Control_Explorer_Procore_Directory_And_External_References.md
prompts/10F_Document_Control_Legacy_Card_Reconciliation_And_Guardrail_Migration.md
prompts/10G_Document_Control_Explorer_Accessibility_Responsive_Evidence_And_Closeout.md
```

The supporting Project Record fixture references for this sequence live in:

```text
reference/10_Project_Record_Fixture_Folder_Paths.json
reference/10_Project_Record_Fixture_Summary.md
```

The Prompt 10 sequence reorients the Documents surface from a lane-card/dashboard refinement into an explorer-first file-access surface with a Documents-local source rail, Project Record folder browsing, project-scoped My Project Files posture, and Procore deep-link directory treatment.

## Execution Order

Execute prompts in numeric order. Do not skip Prompt 00.

| Prompt | Purpose                                 | Expected Change Type            |
| -----: | --------------------------------------- | ------------------------------- |
|     00 | Confirm local repo truth and drift      | No code unless diagnostics only |
|     01 | Add/align product experience brief      | Docs                            |
|     02 | Create screenshot findings matrix       | Docs                            |
|     03 | Shell and host-fit refinement           | Runtime/CSS/tests               |
|     04 | Command header / hero enhancement       | Runtime/CSS/tests               |
|     05 | Command search preview enhancement      | Runtime/CSS/tests               |
|     06 | Tab/module launcher enhancement         | Runtime/CSS/tests               |
|     07 | Card taxonomy and visual system         | Runtime/CSS/tests               |
|     08 | Gateway action enhancement              | Runtime/CSS/tests               |
|     09 | Project Home experience enhancement     | Runtime/CSS/tests               |
|     10 | Document Control Explorer target architecture / implementation plan | Docs / execution contract |
|    10A | Document Control Explorer repo-truth gate | No code unless diagnostics only |
|    10B | Explorer model and Project Record fixture contract | Runtime/types/tests |
|    10C | Explorer shell and ready-path composition | Runtime/CSS/tests |
|    10D | Explorer navigation state, source switching, breadcrumb traversal, module focus | Runtime/tests |
|    10E | Procore deep-link directory and external launch references | Runtime/CSS/tests |
|    10F | Legacy Document Control card reconciliation and guardrail migration | Runtime/tests |
|    10G | Explorer accessibility, responsive evidence, and Prompt 10 closeout | Evidence/docs/tests/runtime fixes as needed |
|     11 | Shared primary dashboard enhancement    | Runtime/CSS/tests               |
|     12 | Analytics insight enhancement           | Runtime/CSS/tests               |
|     13 | Cross-surface card choreography         | Runtime/CSS/tests               |
|     14 | Microinteraction/state refinement       | CSS/tests                       |
|     15 | Content/microcopy refinement            | Runtime copy/tests              |
|     16 | Accessibility/regression hardening      | Tests/runtime fixes             |
|     17 | Playwright evidence/scorecard closeout  | Evidence/docs/tests             |

## Critical Repo-Truth Baseline

Current Phase 08 execution baseline HEAD (established by Prompt 00):

```text
877493c31c3a8aa9e2316ca5d958b78b479be059
```

Historical package baseline reference (do not use as execution baseline):

```text
7d8bae430ab999d4fb38abe8de6689b89d8f4d27
```

The current execution baseline is two commits forward of the historical baseline; the forward commits add (a) Phase 06 v1.0.0.219 screenshot reliability rerun evidence, and (b) this wave-b13 plan package. Neither alters PCC runtime source, package/manifest versions, or `pnpm-lock.yaml`.

The latest inspected baseline confirms:

- exact Sage book-of-record/no-writeback cue posture on Cost & Time,
- no affirmative Sage writeback/sync/mutation language on the cue,
- Cost & Time first direct bento card is `Module status`,
- selected module card does not absorb the Sage cue,
- `pnpm-lock.yaml` md5: `7c19ccfa8718a42f7f55ce178a626996`,
- `echarts ^5.6.0` is present,
- `echarts-for-react` is absent,
- PCC package-solution, spfx-shell package-solution, and PCC webpart manifest aligned at `1.0.0.219`.

Local execution must verify current repo truth before edits.

## Global Guardrails

## Global Execution Rules

These rules apply to this prompt and every later Phase 08 prompt.

1. Work in the `RMF112018/hb-intel` repo.
2. Treat this phase as **PCC Product Experience Enhancement**, not a CSS-only polish pass.
3. Preserve the current Phase 05/06/07 runtime architecture unless this prompt explicitly authorizes a narrow change.
4. Preserve the current eight primary-tab model:
   - `project-home`
   - `core-tools`
   - `documents`
   - `estimating-preconstruction`
   - `startup-closeout`
   - `project-controls`
   - `cost-time`
   - `systems-administration`
5. Do not reintroduce a permanent PCC sidebar.
6. Do not move `data-pcc-active-surface-panel` back to a card. It must remain shell-owned on `main[role="tabpanel"]`.
7. Preserve the bento direct-child invariant. Do not add wrappers between `PccBentoGrid` and `PccDashboardCard` unless the wrapper is itself an intentionally tested grid child and does not break layout.
8. Do not add dependencies. Do not add `echarts-for-react`. `echarts` direct usage remains the approved analytics approach.
9. Do not create live SharePoint, Graph, Procore, Sage, Azure, tenant, or app-catalog mutations.
10. Preserve read-only / preview / launch-only / no-writeback posture.
11. Do not introduce fake affordances. A non-working search/action/control must not appear live without clear preview or disabled state.
12. Do not put developer copy in the UI. Avoid end-user-visible words like `mock`, `placeholder`, `TODO`, `fixture`, or `demo` unless a governed preview/sample label already exists and is intentionally user-facing.
13. Do not weaken tests to pass. Update tests only when the expected product contract has intentionally changed.
14. Use stable `[data-*]` markers and semantic roles for tests. Do not test CSS module class names as behavior contracts.
15. Do not re-read files that are still within the current context or memory. Only open files needed to verify current repo truth, inspect drift, or make the scoped change.
16. If local repo truth differs from this package, classify the drift and proceed only when the change can be safely aligned without overwriting operator-owned work.

### Document Control Explorer Guardrail Clarification

The no-sidebar guardrail prohibits a **global or permanent PCC application sidebar**. It does **not** prohibit the Prompt 10 Documents-local explorer source rail.

Prompt 10 expressly authorizes an in-surface Document Control source rail that:
- exists only inside the `documents` surface;
- keeps `Document Control Home`, `Project Record`, `My Project Files`, and `Procore` directly accessible;
- remains available for one-click source switching even when a user is several folders deep inside a selected source;
- does not alter the global PCC shell, primary tab model, or shell-owned active-panel contract.

Project Home work may occur in parallel during Prompt 10 execution. Prompt 10 work must not revert, overwrite, or casually normalize parallel Project Home changes.

## Current Runtime Model

Use the current Phase 05 grouped primary-tab model, not the older surface registry references that may still exist in older architecture documents.

Current primary tabs:

```text
project-home
core-tools
documents
estimating-preconstruction
startup-closeout
project-controls
cost-time
systems-administration
```

## End-State Definition

The implementation is complete only when screenshots and tests prove that PCC:

1. feels like a project command center,
2. has a stronger command header,
3. uses a more premium tab/module launcher experience,
4. visually differentiates card types,
5. gives every card a purpose,
6. presents analytics as insights,
7. preserves no-writeback and source authority,
8. has no duplicate header cards,
9. has no horizontal clipping,
10. preserves keyboard and accessibility behavior,
11. preserves bento direct-child invariants,
12. delivers a Document Control Explorer that supports one-click cross-source switching from any folder depth,
13. produces updated evidence and closeout notes.

## Local Agent Instructions

When executing any prompt:

1. Start by restating the prompt objective.
2. Inspect only files needed for that prompt.
3. Do not re-read files still in current context.
4. Make the narrowest set of changes that satisfies the prompt.
5. Run the required validations.
6. Provide a closeout in the required format.
7. During Prompt 10 execution, preserve parallel Project Home work and classify drift rather than overwriting it.
8. Do not claim completion if validation or evidence is blocked.

## Final Closeout Requirement

Use `templates/Closeout_Template.md` for every prompt closeout.
