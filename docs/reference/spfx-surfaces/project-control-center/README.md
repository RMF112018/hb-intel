# Project Control Center SPFx Surface Reference

## Purpose

This folder is the canonical reusable UI/UX scoring and evidence authority for the Project Control Center (PCC) as a SharePoint-hosted SPFx surface.

This folder is not wave-specific. Wave 15A is the first major consumer of these standards, but the standards apply across Phase 3 closeout, Phase 4 readiness, and future PCC phases.

## Canonical Files

| File | Purpose |
|---|---|
| `PCC_100_Point_UIUX_Mold_Breaker_Scorecard.md` | Governing 100-point PCC UI/UX Mold Breaker scorecard. |
| `PCC_100_Point_UIUX_Scorecard_Use_Guide.md` | Procedure for applying the scorecard and interpreting Playwright/manual evidence. |
| `PCC_100_Point_UIUX_Evidence_Taxonomy.md` | Canonical EV-001 through EV-134 evidence taxonomy. |
| `PCC_Playwright_Evidence_Subset_Map.md` | Current Playwright-supported EV subset and artifact map. |

## Canonical Filename Rule

The canonical scorecard filename is:

```text
docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Mold_Breaker_Scorecard.md
```

Do not use durable references to `_v2`, draft, temporary, or generated package filenames.

## Required Governing References

```text
docs/explanation/design-decisions/con-tech-ui-study.md
docs/explanation/design-decisions/con-tech-ux-study.md
docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md
docs/reference/ui-kit/doctrine/UI-Doctrine-Acceptance-and-Scoring-Model.md
```

## Playwright Evidence Relationship

The current live Playwright evidence suite supports 80 of the 134 canonical EV IDs:

```text
EV-037..EV-106
EV-125..EV-134
```

The remaining EVs are manual, documentary, operator-supplied, or expert-review evidence unless the Playwright registry is later expanded.
