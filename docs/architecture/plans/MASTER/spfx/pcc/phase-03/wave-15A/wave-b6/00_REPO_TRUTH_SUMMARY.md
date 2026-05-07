# Repo-Truth Summary Used by This Package

## Baseline commit and evidence

```text
Baseline commit: 17e4273ebd070dd62ca477297393e6c787441111
Latest Project Home evidence path reviewed: docs/architecture/evidence/pcc-live/20260507-171608-wave-15A-b5-prompt-05/
```

## Governing references

```text
docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Mold_Breaker_Scorecard.md
docs/reference/spfx-surfaces/project-control-center/PCC_Playwright_Evidence_Subset_Map.md
docs/architecture/evidence/pcc-live/README.md
docs/explanation/design-decisions/con-tech-ui-study.md
docs/explanation/design-decisions/con-tech-ux-study.md
docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md
docs/reference/ui-kit/doctrine/UI-Doctrine-Acceptance-and-Scoring-Model.md
```

## Project Home source files in scope

Primary composition and read-model path:

```text
apps/project-control-center/src/surfaces/projectHome/PccProjectHome.tsx
apps/project-control-center/src/surfaces/projectHome/PccProjectHomeReadModelContent.tsx
apps/project-control-center/src/surfaces/projectHome/projectHomeAdapter.ts
apps/project-control-center/src/surfaces/projectHome/projectHomeViewModel.ts
apps/project-control-center/src/surfaces/projectHome/useProjectHomeReadModel.ts
```

Core Project Home cards:

```text
apps/project-control-center/src/surfaces/projectHome/PccProjectIntelligenceCard.tsx
apps/project-control-center/src/surfaces/projectHome/PccPriorityActionsCard.tsx
apps/project-control-center/src/surfaces/projectHome/PccPriorityActionsRail.tsx
apps/project-control-center/src/surfaces/projectHome/PccPriorityActionsRail.module.css
apps/project-control-center/src/surfaces/projectHome/PccMissingConfigurationsCard.tsx
apps/project-control-center/src/surfaces/projectHome/PccSiteHealthSummaryCard.tsx
apps/project-control-center/src/surfaces/projectHome/PccProjectHomeProcoreSnapshotCard.tsx
apps/project-control-center/src/surfaces/projectHome/PccApprovalsCheckpointsCard.tsx
apps/project-control-center/src/surfaces/projectHome/PccProjectReadinessCard.tsx
apps/project-control-center/src/surfaces/projectHome/PccDocumentControlCard.tsx
apps/project-control-center/src/surfaces/projectHome/PccExternalSystemsCard.tsx
apps/project-control-center/src/surfaces/projectHome/PccTeamSnapshotCard.tsx
apps/project-control-center/src/surfaces/projectHome/PccRecentActivityCard.tsx
apps/project-control-center/src/surfaces/projectHome/PccProjectHomeUnifiedLifecycleSection.tsx
apps/project-control-center/src/surfaces/projectHome/PccProjectHomeAskHbiSection.tsx
apps/project-control-center/src/surfaces/projectHome/PccProjectHome.module.css
```

Tests and contracts:

```text
apps/project-control-center/src/tests/PccProjectHome.test.tsx
apps/project-control-center/src/tests/PccApp.optIn.test.tsx
apps/project-control-center/src/tests/PccCardTierContract.test.tsx
apps/project-control-center/src/surfaces/projectHome/projectHomeAdapter.test.ts
apps/project-control-center/src/surfaces/projectHome/useProjectHomeReadModel.test.ts
```

## Current Project Home render paths

### Fixture-only path

`PccProjectHome.tsx` renders the fixture-only baseline when `readModelClient` is omitted. Current fixture-only order:

1. Project Intelligence
2. Priority Actions
3. Missing Configurations
4. Site Health Summary
5. Approvals & Checkpoints
6. Project Readiness
7. Document Control Center
8. External Platforms
9. Team Snapshot
10. Recent Activity

Fixture-only Project Home must remain deterministic, no-read-model, and testable.

### Read-model-driven path

`PccProjectHomeReadModelContent.tsx` renders the read-model-driven path when `readModelClient` is supplied. The current live evidence path shows 16 cards:

| Index | Card                               | Tier  | Region      | Footprint | Observed concern                                                   |
| ----: | ---------------------------------- | ----- | ----------- | --------- | ------------------------------------------------------------------ |
|     0 | Project Intelligence Header        | tier1 | command     | hero      | Correct active panel carrier; label/title needs flagship treatment |
|     1 | Priority Actions                   | tier2 | operational | wide      | Too tall on phone; needs compact command-rail treatment            |
|     2 | Missing Configurations             | state | state       | standard  | Too high unless blocking                                           |
|     3 | Site Health Summary                | tier2 | operational | standard  | Keep near top if active risk, otherwise compact                    |
|     4 | Procore snapshot                   | tier3 | deferred    | standard  | Too high for deferred content                                      |
|     5 | Approvals & Checkpoints            | tier2 | operational | standard  | Should be in core-control cluster above Procore                    |
|     6 | Project Readiness                  | tier2 | operational | standard  | Should be in core-control cluster                                  |
|     7 | Document Control Center            | tier2 | operational | wide      | Should be in core-control cluster                                  |
|     8 | External Platforms                 | tier3 | reference   | standard  | Correctly lower-tier                                               |
|     9 | Team Snapshot                      | tier3 | rail        | rail      | Correct lower-tier context                                         |
|    10 | Recent Activity                    | tier3 | reference   | tall      | Correct lower-tier history                                         |
|    11 | Lifecycle Timeline                 | tier2 | detail      | detail    | Strong differentiator but too late                                 |
|    12 | Project Memory                     | tier3 | reference   | standard  | Good continuity content but too late/large on mobile               |
|    13 | Project Lens                       | tier3 | rail        | rail      | Low-risk preview rail                                              |
|    14 | Related Records                    | tier3 | detail      | detail    | Good traceability, lower page                                      |
|    15 | Ask HBI — Grounded Project Answers | tier2 | detail      | detail    | Strong differentiator but buried last                              |

## Current evidence facts

### Screenshot evidence

The screenshot inventory provides three Project Home captures:

```text
surface-project-home-above-fold.png
surface-project-home-full-page.png
surface-project-home-scroll-001.png
```

Each is 1280 × 720. The scroll segment currently has `scrollY: 0`, so the available screenshot evidence does not prove lower-page quality.

### Breakpoint / density facts

Project Home measured container height:

```text
phone-390:              8432 px
tablet-portrait-768:    6464 px
tablet-landscape-1024:  4304 px
small-laptop-1180:      4688 px
standard-laptop-1366:   3848 px
```

No horizontal overflow was observed.

Project Home phone card measurements include:

```text
Project Intelligence:   315 px
Priority Actions:      2573 px
Missing Configurations: 318 px
Document Control:       558 px
Project Memory:         966 px
Ask HBI:                485 px, with 5 min touch-target issues
```

### Accessibility facts

Project Home had:

```text
Axe violations: 4
ARIA needs-review: 2
Contrast review entries: 2
Touch issues: 18
Hover risks: 0
Dialog/modal needs-review: 0
```

The axe findings are color-contrast issues on Project Intelligence metric labels.

### Content facts

Project Home had:

```text
Copy snippets: 79
Headings: 20
Actions: 28
State snippets: 2
Source snippets: 1
HBI snippets: 2
Owner/action snippets: 2
Mock/demo snippets: 1
Needs-review findings: 27
```

The main Project Home content review categories are:

- disabled controls missing clear reason copy;
- HBI authority boundary risk terms;
- source-of-record language review support;
- construction language review support;
- state-copy quality review support;
- owner/action/responsibility review support;
- mock/fixture transparency review support.

### Workflow facts

Project Home workflow summary included:

```text
Action observations: 29
Primary actions: 9
Disabled without reason: 0
False affordance needs-review: 0
State observations: 14
Source observations: 1
HBI risk: 0 in workflow summary
```

The detailed action summary includes substantial SharePoint host chrome, so Project Home-owned workflow findings must be separated from host-owned observations.

## Implementation posture

This is a controlled Project Home remediation. It should not become a platform-wide refactor. Keep changes local unless a prompt explicitly allows a broader test or evidence harness update.
