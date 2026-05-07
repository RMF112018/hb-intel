# Repo-Truth Summary Used by This Package

This package is based on the current repo-truth and evidence reviewed through the GitHub connector in the active audit session.

## Key confirmed facts

- `PccProjectReadinessSurface.tsx` currently renders the native Project Readiness regions plus embedded Lifecycle Readiness, Permit/Inspection, Responsibility Matrix, Constraints Log, Buyout Log, Procore source confidence, and Unified Lifecycle cards in the Project Readiness route.
- The surface intentionally renders `PccDashboardCard` children directly under the surrounding `PccBentoGrid` to preserve the bento direct-child invariant.
- The live screenshot evidence run `docs/architecture/evidence/pcc-live/20260507-134047/surface-screenshots-1778175753367/` reports Project Readiness with 62 DOM card summaries, compared with 16 for Project Home, 11 for Approvals, and 10 for External Systems.
- The live breakpoint evidence run `docs/architecture/evidence/pcc-live/20260507-134047/breakpoints-1778175676324/` reports Project Readiness with 62 cards at every viewport and confirms severe vertical density, including 56,264 px measured container height at phone-390 and 26,960 px at standard-laptop-1366 in the fetched matrix.
- The shared bento/card primitives already expose explicit tier, region, footprint, row-span, heading, active-surface, and direct-child semantics. Current evidence points to Project Readiness composition density, not a primitive defect.
- `PccCardTierContract.test.tsx` currently includes Project Readiness in the generic explicit-source/direct-child loop and has targeted Project Readiness assertions for embedded cards that now need to select the relevant detail section before asserting those cards.
- `PccProjectReadinessSurface.test.tsx` currently asserts no enabled buttons inside the Project Readiness panel. That must be revised to allow local drill-down view-selection controls while continuing to prohibit executable workflow actions.

## Governing references

- `docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Mold_Breaker_Scorecard.md`
- `docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Scorecard_Use_Guide.md`
- `docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Evidence_Taxonomy.md`
- `docs/reference/spfx-surfaces/project-control-center/PCC_Playwright_Evidence_Subset_Map.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-Acceptance-and-Scoring-Model.md`
- `docs/architecture/evidence/pcc-live/20260507-134047/README.md`, if present in the live repo.

## Implementation posture

This is an implementation package for the local code agent. It intentionally does not modify repo files. The agent must perform repo-truth verification before edits, then make the code/test changes in controlled passes.
