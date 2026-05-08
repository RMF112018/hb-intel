# PCC Playwright Near-Term Evidence-Harness Prompt Package

## Purpose

This package instructs a local code agent to implement the **Near-Term** items from the PCC Playwright evidence-harness roadmap.

This package follows the Immediate / Highest ROI package and assumes those earlier improvements are either complete or will be reconciled before closeout.

## Near-Term Roadmap Items Covered

| Roadmap Item | Objective | Prompt Coverage |
|---|---|---|
| 7 | Add per-surface evidence packets | Prompts 01–02 |
| 8 | Add focus path screenshots and landmark maps | Prompts 03–04 |
| 9 | Add state/source matrix | Prompts 05–06 |
| 10 | Add workflow scenario scripts | Prompts 07–08 |
| 11 | Add content/Mold Breaker reports | Prompts 09–10 |
| Closeout | Validate the Near-Term package as an integrated evidence-support system | Prompt 11 |

## Package Contents

```text
README.md
Implementation_Plan.md
prompts/
  Prompt_01_Per_Surface_Evidence_Packet_Model.md
  Prompt_02_Per_Surface_Evidence_Packet_Writer_Integration.md
  Prompt_03_Focus_Path_Timeline_And_Screenshot_Evidence.md
  Prompt_04_Heading_Landmark_Aria_Semantic_Maps.md
  Prompt_05_State_Source_Matrix_Model_And_Capture.md
  Prompt_06_State_Source_Matrix_Writer_And_Report_Integration.md
  Prompt_07_Workflow_Scenario_Scripts_No_Mutation.md
  Prompt_08_Workflow_Scenario_Report_And_False_Affordance_Integration.md
  Prompt_09_Content_Corpus_And_Construction_Language_Report.md
  Prompt_10_Mold_Breaker_Incumbent_Failure_Report.md
  Prompt_11_Near_Term_Closeout_Validation.md
```

## Primary Implementation Area

Expected implementation is concentrated under:

```text
e2e/pcc-live/
docs/architecture/evidence/pcc-live/
docs/reference/spfx-surfaces/project-control-center/
```

Potential root script updates may be acceptable if limited to adding Playwright convenience scripts and no dependency changes.

## Scorecard Boundary

Playwright evidence supports expert review. It does not score the PCC UI, pass/fail hard stops, certify EVs as finally captured, or approve Phase 4 readiness.

## Expected Output Themes

The package should produce or improve:

- `surface-evidence-packets/`
- focus path timeline outputs;
- focus path screenshot inventory outputs;
- heading / landmark / ARIA relationship maps;
- state/source matrices;
- workflow scenario scripts and reports;
- false-affordance scenario evidence;
- visible-copy corpuses by card/surface;
- construction-language reports;
- Mold Breaker / incumbent failure-mode reports;
- integrated Near-Term closeout report.

## Execution Guidance

Run prompts sequentially. Do not skip closeout. If any prompt uncovers a conflicting repo-truth condition, stop and report it before expanding scope.

## Suggested Commit Hygiene

Each prompt should produce a focused commit. Do not mix unrelated changes. Do not stage or commit raw evidence unless operator-reviewed and scrubbed.

Recommended commit title style:

```text
feat(pcc-live): add <near-term evidence lane / artifact>
```
