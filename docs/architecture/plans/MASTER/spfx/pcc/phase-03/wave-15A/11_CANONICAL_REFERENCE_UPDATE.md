# 11 — Canonical Reference Update: 56/56 to 100-Point PCC Scorecard

## 1. Purpose

This document explains the Wave 15A package update from the older 56/56 UI doctrine model to the reusable PCC 100-point UI/UX Mold Breaker scorecard.

## 2. What Changed

The old Wave 15A package was built around the homepage-adapted 56/56 scorecard. That model was useful for initial doctrine framing, but it is not clear or specific enough for PCC Phase 4 readiness.

The updated model uses:

```text
docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Mold_Breaker_Scorecard.md
docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Scorecard_Use_Guide.md
```

## 3. Why the Scorecard Moved

The PCC scorecard should govern PCC beyond Wave 15A. Therefore, it should not live inside a wave-specific folder.

Recommended canonical location:

```text
docs/reference/spfx-surfaces/project-control-center/
```

Wave 15A is a consumer of the scorecard. It is not the owner of the scorecard.

## 4. Required Repo Reference Updates

Update Wave 15A package docs that refer to:

```text
56/56
56 scorecard
07_VALIDATION_EVIDENCE_AND_56_SCORECARD_GATES.md
01_DOCTRINE_AUTHORITY_AND_SCORECARD_CONTRACT.md as the final score source
```

To instead refer to:

```text
docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Mold_Breaker_Scorecard.md
docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Scorecard_Use_Guide.md
07_VALIDATION_EVIDENCE_AND_100_POINT_GATES.md
```

## 5. Required Source References

The scorecard must include and preserve these references:

```text
docs/explanation/design-decisions/con-tech-ui-study.md
docs/explanation/design-decisions/con-tech-ux-study.md
docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md
docs/reference/ui-kit/doctrine/UI-Doctrine-Acceptance-and-Scoring-Model.md
```

## 6. Interpretation Rule

If a legacy Wave 15A document still references 56/56, interpret that reference as superseded by the 100-point scorecard unless explicitly preserved for historical context.

## 7. Readiness Rule

PCC cannot enter Phase 4 under the updated package unless:

- Final score is at least 95/100.
- No hard stops remain.
- No pillar is below 80%.
- Evidence matrix is complete.
- Package/version alignment is proven.
- Phase 4 readiness statement is explicit.

## 8. Migration Checklist

| Item | Complete? |
|---|---:|
| Add canonical scorecard files under `docs/reference/spfx-surfaces/project-control-center/` |  |
| Update Wave 15A README references |  |
| Update Wave 15A package manifest |  |
| Rename or supersede old 56 validation gate doc |  |
| Add 100-point closeout table |  |
| Add Mold Breaker criteria references |  |
| Add evidence matrix references |  |
| Update closeout template |  |
| Update agent execution protocol |  |
| Update package manifest version |  |


## Canonical References

Wave 15A now consumes the PCC 100-point scorecard as a durable reference standard, not as a wave-owned scoring file.

- PCC scorecard: `docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Mold_Breaker_Scorecard.md`
- PCC scorecard use guide: `docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Scorecard_Use_Guide.md`
- Construction-tech UI study: `docs/explanation/design-decisions/con-tech-ui-study.md`
- Construction-tech UX study: `docs/explanation/design-decisions/con-tech-ux-study.md`
- SPFx governing standard: `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- Acceptance and scoring model: `docs/reference/ui-kit/doctrine/UI-Doctrine-Acceptance-and-Scoring-Model.md`

