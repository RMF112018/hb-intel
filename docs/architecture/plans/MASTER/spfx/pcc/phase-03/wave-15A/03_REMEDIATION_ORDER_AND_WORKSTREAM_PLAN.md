# 03 — Remediation Order and Workstream Plan

## 1. Purpose

This document defines the recommended remediation order for Wave 15A under the 100-point scorecard.

The sequence is dependency-driven. Shared systems must be corrected before individual surfaces are polished.

## 2. Execution Rule

Do not optimize isolated pages before the shared shell, navigation, bento, card, and state systems are stable.

## 3. Workstream Overview

| Workstream | Priority | Primary Scorecard Pillars |
|---|---:|---|
| Scorecard adoption and reference update | 0 | P9 |
| Shared shell, host fit, navigation, project context | 1 | P1, P3, P7, P8 |
| Bento, card hierarchy, density | 2 | P1, P2, P4, P7 |
| State model, disabled/read-only/degraded language | 3 | P5, P6, P8 |
| Project Home command-center recomposition | 4 | P1, P2, P4, P5 |
| Project Readiness decomposition | 5 | P1, P2, P4, P5, P6 |
| External Platforms false-affordance correction | 6 | P2, P5, P6 |
| Approvals workflow clarity | 7 | P2, P5, P6 |
| Documents operational clarity | 8 | P1, P5, P6 |
| Team & Access clarity | 9 | P5, P6, P8 |
| Site Health risk/control clarity | 10 | P1, P5, P6 |
| Settings governance clarity | 11 | P5, P6 |
| Responsive/host-fit/accessibility evidence | 12 | P7, P8, P9 |
| Final independent 100-point scoring | 13 | P9 |

## 4. Detailed Sequence

### Step 0 — Canonical Scorecard Adoption

Update all Wave 15A docs to reference:

```text
docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Mold_Breaker_Scorecard.md
docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Scorecard_Use_Guide.md
```

Remove final readiness dependence on the prior 56/56 model.

### Step 1 — Repo Truth Audit

Confirm current PCC source, surfaces, docs, evidence, package version, and current visual proof.

Required outputs:

- Surface inventory.
- Shared primitive inventory.
- Evidence inventory.
- Current score estimate.
- Hard-stop risk list.

### Step 2 — Shared Shell and Host Fit

Correct:

- SharePoint host fit.
- App canvas ownership.
- Project identity.
- Active surface clarity.
- Navigation behavior.
- Command/search/HBI affordance posture.

### Step 3 — Bento, Card, and Layout Primitives

Correct:

- Equal-weight card wall behavior.
- Primary/secondary/supporting hierarchy.
- Card footprint and row-span stability.
- Density and scanability.
- Breakpoint behavior.

### Step 4 — State Model and Product Language

Correct:

- Preview/read-only/deferred language.
- Disabled action explanations.
- Empty/error/degraded/missing-config states.
- Source-of-record and data confidence language.
- HBI authority boundaries.

### Step 5 — Project Home

Project Home must become the flagship command-center entry point.

Focus:

- Priority actions.
- Project intelligence.
- Risk/status posture.
- Work center navigation.
- Recent activity subordinated to priority work.

### Step 6 — Project Readiness

Project Readiness must be decomposed or reorganized so it does not function as an overloaded module aggregate.

Focus:

- Readiness overview.
- Blockers.
- Lifecycle readiness.
- Permit/inspection.
- Responsibility matrix.
- Constraints.
- Buyout.
- Procore/source confidence.
- Progressive disclosure.

### Step 7 — External Platforms and Approvals

Correct high false-affordance risk:

- External Platforms should not imply launch/write/edit behavior that is not available.
- Approvals should not look like an executable workflow if it is read-only/preview.
- Disabled actions must explain reason and next step.

### Step 8 — Supporting Surfaces

Refine:

- Documents.
- Team & Access.
- Site Health.
- Settings.

### Step 9 — Evidence Completion

Collect:

- Tenant-hosted screenshots.
- Breakpoint screenshots.
- Full-scroll screenshots.
- State screenshots.
- Accessibility/keyboard evidence.
- Console/runtime evidence.
- Package/version evidence.
- Final evidence index.

### Step 10 — Final 100-Point Scoring

Apply the canonical scorecard.

Do not proceed to Phase 4 unless:

- Final score is at least 95/100.
- No hard stops remain.
- No pillar is below 80%.
- Evidence is reproducible.

## 5. Prompt-by-Prompt Suggested Execution

| Prompt | Focus | Expected Output |
|---|---|---|
| Prompt 00 | Scorecard adoption and canonical reference update | Updated docs and scoring references |
| Prompt 01 | Repo-truth audit against 100-point scorecard | Audit report and gap list |
| Prompt 02 | Shared shell/nav/project context | Remediation implementation plan |
| Prompt 03 | Bento/card/layout hierarchy | Remediation implementation plan |
| Prompt 04 | State model and product language | Remediation implementation plan |
| Prompt 05 | Project Home | Surface remediation package |
| Prompt 06 | Project Readiness | Surface remediation package |
| Prompt 07 | External Platforms and Approvals | Surface remediation package |
| Prompt 08 | Documents, Team & Access, Site Health, Settings | Surface remediation package |
| Prompt 09 | Responsive, accessibility, and hosted evidence | Evidence package |
| Prompt 10 | Final independent scoring | Phase 4 readiness report |

## 6. Dependency Notes

- Project Home should not be finalized until shell/card/state standards are locked.
- Project Readiness should not be polished until its information architecture is resolved.
- External Platforms and Approvals must be reviewed for false affordance before final screenshots.
- Accessibility cannot be deferred to the end if primitives are still changing.
- Evidence collection should begin early but final scoring must use final package/version proof.


## Canonical References

Wave 15A now consumes the PCC 100-point scorecard as a durable reference standard, not as a wave-owned scoring file.

- PCC scorecard: `docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Mold_Breaker_Scorecard.md`
- PCC scorecard use guide: `docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Scorecard_Use_Guide.md`
- Construction-tech UI study: `docs/explanation/design-decisions/con-tech-ui-study.md`
- Construction-tech UX study: `docs/explanation/design-decisions/con-tech-ux-study.md`
- SPFx governing standard: `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- Acceptance and scoring model: `docs/reference/ui-kit/doctrine/UI-Doctrine-Acceptance-and-Scoring-Model.md`

