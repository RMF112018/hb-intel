# Final Validation, Commit, and Handoff

## Context

Use current repo truth. Do not re-read files that are already in context unless exact edit context is required or the file may have changed.

Tenant target: `https://hedrickbrotherscom.sharepoint.com/sites/26999HBCentralTestProject`

Governing documents:
- `docs/explanation/design-decisions/con-tech-ui-study.md`
- `docs/explanation/design-decisions/con-tech-ux-study.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-Acceptance-and-Scoring-Model.md`
- `docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Mold_Breaker_Scorecard_v2.md`

Critical distinction: automate evidence and traceability; do not claim the full 100-point score is automatically calculated without expert review.


## Objective

Run full validation, Playwright list/run/self-skip checks, secret/artifact safety checks, Prettier, and diff checks. Commit implementation without auth state or generated artifacts. Provide closeout with automated evidence coverage and expert-review-required residuals.

## Required Closeout From Agent

Return:

```text
Prompt completed.

Files changed:
- <paths>

Validation:
- <commands and results>

Evidence / scorecard impact:
- <EV IDs / pillars / hard stops affected>

Residual risks or pending items:
- <items>
```
