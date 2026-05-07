# 01 — Doctrine Authority and Scorecard Contract

## 1. Purpose

This document defines the authority stack and scoring contract for Wave 15A after adoption of the PCC 100-point UI/UX Mold Breaker scorecard.

It replaces the older 56/56 Wave 15A scoring posture for PCC readiness decisions.

## 2. Governing Authority Stack

Apply the following authority stack in order:

1. **SPFx governing doctrine**
   - `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
2. **Acceptance and scoring model**
   - `docs/reference/ui-kit/doctrine/UI-Doctrine-Acceptance-and-Scoring-Model.md`
3. **PCC 100-point scorecard**
   - `docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Mold_Breaker_Scorecard.md`
4. **PCC scorecard use guide**
   - `docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Scorecard_Use_Guide.md`
5. **Construction-tech Mold Breaker studies**
   - `docs/explanation/design-decisions/con-tech-ui-study.md`
   - `docs/explanation/design-decisions/con-tech-ux-study.md`
6. **PCC architecture / blueprint docs**
   - `docs/architecture/blueprint/sp-project-control-center/`
7. **Wave 15A package docs**
   - `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/`
8. **Current repo source**
   - `apps/project-control-center/`

If doctrine and local implementation disagree, doctrine wins unless a documented leadership decision supersedes it.

## 3. Scorecard Contract

Wave 15A uses the following scorecard model:

| Pillar | Weight |
|---|---:|
| PCC Product Strategy and Command-Center Clarity | 15 |
| Construction-Tech Mold Breaker Differentiation | 20 |
| Shell, Navigation, and Project Context | 12 |
| Layout, Bento, Card Hierarchy, and Density | 12 |
| Workflow, Interaction, and Next-Action Clarity | 12 |
| State Model, Read-Only, Preview, Degraded, and Source Confidence | 10 |
| Responsive, Field, Touch, and Host-Fit Behavior | 8 |
| Accessibility, Visual Semantics, and Inclusive Use | 6 |
| Evidence, Validation, and Phase 4 Readiness | 5 |
| **Total** | **100** |

## 4. Required Score Trajectory

| Score | Meaning | Wave 15A Interpretation |
|---:|---|---|
| 100 | Fully flagship | Desired target |
| 95–99 | Phase 4-ready if no hard stops | Minimum acceptable range |
| 90–94 | Near flagship | Not ready under current goal |
| 80–89 | Professional but not flagship | Not ready |
| 70–79 | Baseline only | Not ready |
| Below 70 | Material drift | Not ready |

## 5. Hard Gates

The following hard-stop categories block Phase 4 regardless of numeric score:

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

Refer to the canonical scorecard for the exact hard-stop definitions.

## 6. Category Acceptance Contract

Every remediation action must clearly identify which scoring pillar it improves.

Examples:

| Remediation Type | Primary Scorecard Pillars |
|---|---|
| Shell / hero / active surface correction | P1, P3, P7, P8 |
| Navigation and command/search refinement | P2, P3, P5, P8 |
| Bento/card hierarchy remediation | P1, P2, P4, P7 |
| Disabled action language | P5, P6, P8 |
| Read-only/degraded state treatment | P5, P6, P9 |
| Project Readiness decomposition | P1, P2, P4, P5 |
| External Platforms false-affordance correction | P2, P5, P6 |
| Hosted breakpoint evidence | P7, P9 |
| Keyboard/focus evidence | P8, P9 |

## 7. Evidence Contract

A score may not be claimed without supporting evidence. The required evidence model is defined in:

```text
docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Scorecard_Use_Guide.md
```

At minimum, Wave 15A closeout must include:

- Source evidence.
- Visual screenshot evidence.
- Tenant-hosted runtime evidence.
- Breakpoint and constrained-container evidence.
- Accessibility evidence.
- Interaction/workflow evidence.
- State-model evidence.
- Source-of-record/data-confidence evidence.
- Mold Breaker comparison evidence.
- Package/version alignment evidence.
- Hard-stop checklist.
- Independent re-score readiness.

## 8. Scoring Protocol

- Score each subcategory separately.
- Do not award full credit where evidence is missing.
- Do not treat source-code intent as a substitute for hosted, visual, accessibility, breakpoint, or interaction evidence.
- Separate confirmed findings from suspected findings.
- Mark evidence gaps explicitly.
- Block Phase 4 when any hard-stop gate fails.
- Do not use the old 56/56 model for final PCC readiness.


## Canonical References

Wave 15A now consumes the PCC 100-point scorecard as a durable reference standard, not as a wave-owned scoring file.

- PCC scorecard: `docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Mold_Breaker_Scorecard.md`
- PCC scorecard use guide: `docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Scorecard_Use_Guide.md`
- Construction-tech UI study: `docs/explanation/design-decisions/con-tech-ui-study.md`
- Construction-tech UX study: `docs/explanation/design-decisions/con-tech-ux-study.md`
- SPFx governing standard: `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- Acceptance and scoring model: `docs/reference/ui-kit/doctrine/UI-Doctrine-Acceptance-and-Scoring-Model.md`

