# 01 — Doctrine Authority and Scorecard Contract

## 1. Purpose

This file converts the governing UI doctrine and SPFx audit scorecard into a Wave 15A acceptance contract. It must be used before implementation begins and during every remediation checkpoint.

## 2. Governing Authority Stack

Use the current repo-truth versions of the following files and directories:

1. `docs/reference/ui-kit/doctrine/`
2. `docs/reference/ui-kit/GOVERNANCE-MAP.md`
3. `docs/reference/ui-kit/GOVERNANCE-SUPERSESSION.md`
4. `docs/reference/ui-kit/standards/`
5. `docs/reference/ui-kit/patterns/`
6. `docs/reference/spfx-surfaces/homepage-uiux-audit-checklist.md`
7. `docs/reference/spfx-surfaces/homepage-uiux-audit-scorecard.md`
8. `docs/reference/spfx-surfaces/homepage-uiux-audit-evidence.md`
9. `docs/architecture/blueprint/sp-project-control-center/`
10. Current PCC source under `apps/project-control-center/`

If any lower-level PCC implementation detail conflicts with the UI doctrine, the doctrine controls unless a written exception exists.

## 3. Scorecard Adaptation

The homepage/SPFx scorecard is adapted to PCC as a SharePoint-hosted full-page product surface. PCC is not a simple widget. It is a project operations command center embedded in HB Central.

The scoring model is:

- 14 categories.
- 4 points per category.
- 56 points maximum.
- 56/56 required for Wave 15A closeout.
- No category may remain below 4.

## 4. Category Acceptance Contract

| ID  | Category                                  | 4/4 Acceptance Standard                                                                                       | Evidence Required                             |
| --- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| S01 | Surface purpose and product clarity       | PCC purpose is immediately understood as project control, not a fixture preview.                              | Screenshots, README, surface headers.         |
| S02 | Project context and operational hierarchy | Every surface shows project identity, phase/status, state, and next action.                                   | Before/after screenshots for all surfaces.    |
| S03 | Information architecture / navigation     | Navigation reflects operational workflow and surface state, not just a list of modules.                       | Shell screenshot, nav tests, keyboard review. |
| S04 | Shell / host fit                          | PCC fits actual SharePoint chrome in published and edit modes without excessive vertical or horizontal waste. | Tenant screenshots at required widths.        |
| S05 | Layout / grid composition                 | No broken columns, clipped content, dead canvas, or false equal-width treatment.                              | Responsive screenshots and layout tests.      |
| S06 | Card hierarchy and density                | Cards are organized into command, operational, and reference tiers with clear priority.                       | Component evidence and screenshots.           |
| S07 | Visual hierarchy / scan path              | User scan path is project context → state → action → detail.                                                  | Screenshot annotations.                       |
| S08 | Typography / spacing / content rhythm     | Text scale, spacing, density, and labels are consistent and product-grade.                                    | Screenshot review and style audit.            |
| S09 | Color / token discipline                  | Color supports brand, hierarchy, and semantic state without overpowering content.                             | Token/style audit and screenshots.            |
| S10 | State model clarity                       | Live, preview, read-only, degraded, unavailable, blocked, and setup-required states are operationally clear.  | State matrix and component tests.             |
| S11 | Interaction affordance                    | Controls are useful, explained, or removed. Disabled controls include operational explanation.                | Surface tests and screenshots.                |
| S12 | Accessibility / keyboard confidence       | Keyboard, focus, contrast, ARIA, and disabled states pass review.                                             | Accessibility checklist evidence.             |
| S13 | Responsive/container behavior             | All surfaces work across required SharePoint host widths.                                                     | Screenshot matrix.                            |
| S14 | Product confidence / executive polish     | PCC is leadership-demo-ready and does not read as unfinished.                                                 | Final panel review and 56/56 closeout.        |

## 5. Hard Gates

The following defects block 56/56 regardless of other improvements:

- Team & Access or any surface renders as an unusable narrow column.
- Any surface is dominated by “Preview content not available.”
- Any primary surface lacks project identity.
- Any primary action is disabled without explanation or alternative.
- SharePoint tenant screenshot shows clipped content or horizontal overflow.
- Preview/wave/fixture language remains primary user-facing content.
- Shell chrome visually dominates operational content.
- Keyboard focus cannot traverse nav and primary actions.
- No final screenshot evidence exists.

## 6. Scoring Protocol

Each implementation pass must update the scorecard:

```text
Category:
Previous score:
New score:
Evidence:
Files changed:
Screenshots:
Residual gap:
Reviewer confidence:
```

No agent may self-claim a category as 4/4 without evidence.

## 7. Required Score Trajectory

Recommended minimum scoring trajectory:

| Checkpoint                       | Minimum Score | Required Condition                                                 |
| -------------------------------- | ------------: | ------------------------------------------------------------------ |
| Baseline                         |         24/56 | Audit accepted.                                                    |
| After shared shell/host fit      |         34/56 | No global layout blockers.                                         |
| After grid/card/state primitives |         42/56 | Shared system supports product-grade surfaces.                     |
| After first-impression surfaces  |         48/56 | Home, Team & Access, Documents, Readiness substantially corrected. |
| After remaining surfaces         |         53/56 | All surfaces usable and coherent.                                  |
| Final validation                 |         56/56 | Tenant evidence, accessibility, and closeout complete.             |
