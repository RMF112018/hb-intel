# 07 — Validation Evidence and 100-Point Gates

## 1. Purpose

This document replaces the older 56/56 validation gate for Wave 15A. It aligns Wave 15A validation with the PCC 100-point UI/UX Mold Breaker scorecard.

## 2. Evidence Principle

A score without evidence is not a score.

Wave 15A cannot close as Phase 4-ready unless evidence proves:

- PCC source behavior.
- Rendered surface hierarchy.
- Tenant-hosted runtime behavior.
- Breakpoint and constrained-container resilience.
- Accessibility and keyboard behavior.
- State-model clarity.
- Workflow and false-affordance safety.
- Mold Breaker differentiation.
- Package/version alignment.

## 3. Required Evidence Matrix

Use the detailed checklist in:

```text
docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Scorecard_Use_Guide.md
```

At minimum, evidence must cover:

| Evidence Area | Required Before Phase 4 |
|---|---|
| Governing doctrine evidence | Yes |
| Mold Breaker study evidence | Yes |
| PCC source evidence | Yes |
| Visual surface evidence | Yes |
| Tenant-hosted/runtime evidence | Yes |
| Responsive/breakpoint/container evidence | Yes |
| Accessibility evidence | Yes |
| Interaction/workflow evidence | Yes |
| State-model evidence | Yes |
| Source-of-record/data-confidence evidence | Yes |
| Content/language evidence | Yes |
| Test evidence | Yes |
| Package/version evidence | Yes |
| Hard-stop evidence | Yes |
| Closure/reproducibility evidence | Yes |

## 4. Required Screenshot Matrix

| Surface / System | Desktop | Laptop | Tablet Landscape | Tablet Portrait | Narrow / Phone | Short Height | High Zoom | Full Scroll | State Evidence |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Shell / Navigation | Required | Required | Required | Required | Required | Required | Required | N/A | Required |
| Project Home | Required | Required | Required | Required | Required | Required | Required | Required | Required |
| Project Readiness | Required | Required | Required | Required | Required | Required | Required | Required | Required |
| Documents | Required | Required | Preferred | Preferred | Preferred | Preferred | Preferred | Required | Required |
| External Platforms | Required | Required | Preferred | Preferred | Preferred | Preferred | Preferred | Required | Required |
| Approvals | Required | Required | Preferred | Preferred | Preferred | Preferred | Preferred | Required | Required |
| Team & Access | Required | Required | Preferred | Preferred | Preferred | Preferred | Preferred | Required | Required |
| Site Health | Required | Required | Preferred | Preferred | Preferred | Preferred | Preferred | Required | Required |
| Settings | Required | Required | Preferred | Preferred | Preferred | Preferred | Preferred | Required | Required |

## 5. Required Automated Tests

At minimum, final validation should include targeted tests or documented equivalents for:

- Routing.
- Active surface fallback.
- Tab keyboard behavior.
- Card hierarchy props.
- Bento direct-child/row-span behavior.
- State component rendering.
- Disabled action explanations.
- Source/read-model adapter behavior.
- Accessibility semantics where testable.

## 6. Required Manual QA

Manual QA should include:

- Keyboard traversal.
- Focus visible check.
- Drawer/modal focus behavior.
- Hover-only meaning check.
- Touch target review.
- Contrast review.
- High zoom review.
- Short-height review.
- Tenant-hosted console review.
- Package/version alignment review.
- Cross-surface consistency review.

## 7. 100-Point Closeout Table

| Pillar | Weight | Score | Evidence IDs | Pass / Fail |
|---|---:|---:|---|---|
| PCC Product Strategy and Command-Center Clarity | 15 |  |  |  |
| Construction-Tech Mold Breaker Differentiation | 20 |  |  |  |
| Shell, Navigation, and Project Context | 12 |  |  |  |
| Layout, Bento, Card Hierarchy, and Density | 12 |  |  |  |
| Workflow, Interaction, and Next-Action Clarity | 12 |  |  |  |
| State Model, Read-Only, Preview, Degraded, and Source Confidence | 10 |  |  |  |
| Responsive, Field, Touch, and Host-Fit Behavior | 8 |  |  |  |
| Accessibility, Visual Semantics, and Inclusive Use | 6 |  |  |  |
| Evidence, Validation, and Phase 4 Readiness | 5 |  |  |  |
| **Total** | **100** |  |  |  |

## 8. Hard-Stop Validation Failures

Any hard-stop failure blocks Phase 4:

- Incumbent mimicry failure.
- Command-center failure.
- Cognitive-overload failure.
- False-affordance failure.
- Field-office divergence failure.
- State-model failure.
- Accessibility failure.
- SharePoint host-fit failure.
- Evidence failure.
- HBI authority failure.

## 9. Evidence Directory Recommendation

```text
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/evidence/
  scorecard/
  screenshots/
  breakpoint/
  accessibility/
  runtime/
  source-review/
  state-model/
  hard-stops/
  closeout/
```

## 10. Required Final Artifacts

Wave 15A closeout must include:

- Final 100-point scorecard.
- Hard-stop checklist.
- Evidence index.
- Screenshot matrix.
- Tenant-hosted runtime proof.
- Accessibility and keyboard proof.
- Breakpoint/container proof.
- State-model proof.
- Mold Breaker comparison findings.
- Open issues/exceptions log.
- Phase 4 readiness statement.

## 11. Phase 4 Gate

PCC may proceed to Phase 4 only if:

- Final score is at least 95/100.
- No hard stop remains.
- No pillar is below 80%.
- Evidence is complete and reproducible.
- Leadership accepts any non-critical residual exceptions in writing.


## Canonical References

Wave 15A now consumes the PCC 100-point scorecard as a durable reference standard, not as a wave-owned scoring file.

- PCC scorecard: `docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Mold_Breaker_Scorecard.md`
- PCC scorecard use guide: `docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Scorecard_Use_Guide.md`
- Construction-tech UI study: `docs/explanation/design-decisions/con-tech-ui-study.md`
- Construction-tech UX study: `docs/explanation/design-decisions/con-tech-ux-study.md`
- SPFx governing standard: `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- Acceptance and scoring model: `docs/reference/ui-kit/doctrine/UI-Doctrine-Acceptance-and-Scoring-Model.md`

