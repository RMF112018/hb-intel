# Project Home Flagship Command-Center Remediation Package

## Objective

This package instructs a local code agent to remediate the PCC **Project Home** surface into a flagship command-center homepage that moves the homepage closer to the canonical PCC 100-point UI/UX Mold Breaker Scorecard target.

The focus is not a narrow CSS pass. The target is a full Project Home command-center upgrade:

- stronger first-fold command hierarchy;
- lower homepage cognitive load;
- compact operating-priority rail;
- clearer core-control module sequence;
- visible lifecycle continuity and grounded HBI intelligence;
- reduced content-review exposure;
- Project Home-specific accessibility cleanup;
- stronger screenshot/evidence closeout.

## Baseline

Use this baseline unless repo-truth has advanced and the user explicitly names a newer commit:

```text
Commit: 17e4273ebd070dd62ca477297393e6c787441111
Evidence: docs/architecture/evidence/pcc-live/20260507-171608-wave-15A-b5-prompt-05/
Canonical scorecard: docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Mold_Breaker_Scorecard.md
Playwright evidence map: docs/reference/spfx-surfaces/project-control-center/PCC_Playwright_Evidence_Subset_Map.md
```

## Why this package exists

The previous generated Project Home package was too thin. This package follows the deeper structure of the Project Readiness command-surface package and adds Project Home-specific artifacts:

- repo-truth summary;
- closed decisions;
- target architecture;
- implementation plan;
- acceptance criteria;
- validation and evidence closeout;
- evidence gap matrix;
- wireframes;
- local-agent execution checklists;
- detailed, descriptive prompts.

## Package contents

```text
README.md
00_REPO_TRUTH_SUMMARY.md
01_OPEN_DECISIONS_CLOSED.md
02_TARGET_ARCHITECTURE.md
03_IMPLEMENTATION_PLAN.md
04_ACCEPTANCE_CRITERIA.md
05_VALIDATION_AND_EVIDENCE_CLOSEOUT.md
06_EVIDENCE_GAP_MATRIX.md
package_index.json

prompts/
  Prompt_01_Project_Home_Baseline_Audit_And_Guarded_Workplan.md
  Prompt_02_Command_Hero_And_First_Fold_Hierarchy.md
  Prompt_03_Priority_Actions_Command_Rail_Compression.md
  Prompt_04_Core_Control_Module_Cluster_And_Card_Order.md
  Prompt_05_Lifecycle_HBI_And_Source_Intelligence_Promotion.md
  Prompt_06_Content_Source_HBI_Authority_Copy_Pass.md
  Prompt_07_Accessibility_Responsive_And_Screenshot_Evidence_Closeout.md
  Prompt_08_Final_Scorecard_Audit_And_Closeout_Docs.md

wireframes/
  PROJECT_HOME_FLAGSHIP_COMMAND_SURFACE_WIREFRAME.md
  PROJECT_HOME_MOBILE_FIELD_MODE_WIREFRAME.md
  PROJECT_HOME_PROGRESSIVE_DISCLOSURE_WIREFRAME.md

checklists/
  LOCAL_AGENT_EXECUTION_CHECKLIST.md
  POST_IMPLEMENTATION_REVIEW_CHECKLIST.md
  SCORECARD_REVIEW_CHECKLIST.md

evidence/
  PROJECT_HOME_EVIDENCE_BASELINE_MATRIX.md
```

## Recommended execution order

Run the prompts in order. Do not skip Prompt 01. Prompt 01 is designed to re-establish repo truth and confirm that the local branch still matches this package's assumptions before any implementation.

1. **Prompt 01** — Project Home baseline audit and guarded workplan.
2. **Prompt 02** — Hero / first-fold hierarchy.
3. **Prompt 03** — Priority Actions compression.
4. **Prompt 04** — Core-control card order and tier correction.
5. **Prompt 05** — Lifecycle, HBI, and source intelligence promotion.
6. **Prompt 06** — Content/source/HBI authority copy pass.
7. **Prompt 07** — Accessibility, responsive, and screenshot evidence closeout.
8. **Prompt 08** — Final scorecard audit and closeout documentation.

## Expected outcome

At the end of the sequence, Project Home should read as the PCC's flagship operating surface:

- the first scan communicates project identity, operating posture, top actions, source boundaries, and HBI advisory posture;
- the page does not feel like a generic card dump;
- the Project Home priority rail is compact enough for field/mobile use;
- card order aligns with tier/region semantics;
- lifecycle and HBI differentiation are visible earlier without creating false writeback affordances;
- Project Home-specific axe color-contrast findings are resolved;
- new screenshot evidence captures real above-fold and below-fold segments;
- the local agent produces before/after evidence suitable for expert scorecard review.

## Scorecard posture

This package should improve the Project Home contribution to:

- P1 — PCC Product Strategy and Command-Center Clarity;
- P2 — Construction-Tech Mold Breaker Differentiation;
- P4 — Layout, Bento, Card Hierarchy, and Density;
- P5 — Workflow, Interaction, and Next-Action Clarity;
- P6 — State Model, Read-Only, Preview, Degraded, and Source Confidence;
- P7 — Responsive, Field, Touch, and Host-Fit Behavior;
- P8 — Accessibility, Visual Semantics, and Inclusive Use;
- P9 — Evidence, Validation, and Phase 4 Readiness.

Do not claim a final score or Phase 4 readiness. Playwright is evidence support only; final scoring remains expert-reviewed.
