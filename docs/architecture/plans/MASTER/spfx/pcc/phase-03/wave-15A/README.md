# PCC Phase 3 Wave 15A — UI/UX 100-Point Remediation Guide

## Purpose

This package governs the Wave 15A remediation path for the HB Intel Project Control Center (PCC). It updates the original 56/56 UI Doctrine Remediation Guide to align with the durable PCC 100-point UI/UX Mold Breaker scorecard.

Wave 15A is no longer judged by the old 56/56 homepage-adapted model. Wave 15A must now prepare PCC for the reusable PCC-specific scoring standard:

```text
docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Mold_Breaker_Scorecard.md
docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Scorecard_Use_Guide.md
```

## Recommended Repository Placement

Canonical Wave 15A package location:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/
```

Optional execution mirror:

```text
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/
```

Reusable PCC scorecard location:

```text
docs/reference/spfx-surfaces/project-control-center/
```

## Governing Sources

This package depends on:

- `docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Mold_Breaker_Scorecard.md`
- `docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Scorecard_Use_Guide.md`
- `docs/explanation/design-decisions/con-tech-ui-study.md`
- `docs/explanation/design-decisions/con-tech-ux-study.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-Acceptance-and-Scoring-Model.md`

## Wave 15A Success Standard

Wave 15A is successful only when PCC can credibly enter final scoring against the 100-point scorecard with:

- 100/100 target score.
- 95/100 minimum Phase 4 entry consideration.
- No hard-stop failures.
- No scorecard pillar below 80% of available points.
- Complete evidence matrix.
- Tenant-hosted, breakpoint, accessibility, state, and runtime proof.
- Clear Mold Breaker differentiation from incumbent construction-tech UX/UI failure modes.

## File Map

| File | Purpose |
|---|---|
| `PACKAGE_MANIFEST.md` | Package inventory and canonical path guidance. |
| `00_EXECUTIVE_BRIEF_AND_SCOPE_LOCK.md` | Executive framing, scope, and success standard. |
| `01_DOCTRINE_AUTHORITY_AND_SCORECARD_CONTRACT.md` | Authority stack and 100-point scorecard contract. |
| `02_WAVE_15A_TARGET_ARCHITECTURE.md` | Target architecture after remediation. |
| `03_REMEDIATION_ORDER_AND_WORKSTREAM_PLAN.md` | Sequenced workstream plan. |
| `04_SHARED_SYSTEM_REMEDIATION_BLUEPRINT.md` | Shared shell/nav/grid/card/state remediation. |
| `05_SURFACE_REMEDIATION_PLAYBOOKS.md` | Surface-specific playbooks. |
| `06_STATE_MODEL_AND_CONTENT_LANGUAGE_STANDARD.md` | State and language standards. |
| `07_VALIDATION_EVIDENCE_AND_100_POINT_GATES.md` | Validation gates and evidence matrix alignment. |
| `08_AGENT_EXECUTION_PROTOCOL.md` | Agent execution protocol. |
| `09_RISKS_DECISIONS_AND_DEFERMENTS.md` | Risks, decisions, and deferments. |
| `10_CLOSEOUT_AND_HANDOFF_TEMPLATE.md` | Closeout and handoff template. |
| `11_CANONICAL_REFERENCE_UPDATE.md` | Explains 56/56-to-100-point migration. |

## Required Execution Principle

Correct shared systems first:

1. Shell and host fit.
2. Navigation and project context.
3. Bento/grid and card hierarchy.
4. State model and language.
5. Accessibility and responsive behavior.
6. First-impression surfaces.
7. Highest-risk operational surfaces.
8. Supporting surfaces.
9. Evidence and independent scoring.

Do not start with page-level styling fixes.

## Required Closeout Standard

Wave 15A may not close as Phase 4-ready unless:

- PCC is scored using the 100-point scorecard.
- The score is at least 95/100.
- No hard stops remain.
- Evidence is complete and reproducible.
- The final package/version being scored matches the screenshot/runtime evidence.
- The closeout report states Phase 4 readiness directly.


## Canonical References

Wave 15A now consumes the PCC 100-point scorecard as a durable reference standard, not as a wave-owned scoring file.

- PCC scorecard: `docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Mold_Breaker_Scorecard.md`
- PCC scorecard use guide: `docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Scorecard_Use_Guide.md`
- Construction-tech UI study: `docs/explanation/design-decisions/con-tech-ui-study.md`
- Construction-tech UX study: `docs/explanation/design-decisions/con-tech-ux-study.md`
- SPFx governing standard: `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- Acceptance and scoring model: `docs/reference/ui-kit/doctrine/UI-Doctrine-Acceptance-and-Scoring-Model.md`

