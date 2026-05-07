# Package Manifest — PCC Phase 3 Wave 15A UI/UX 100-Point Remediation

## Package Name

PCC Phase 3 Wave 15A — UI/UX 100-Point Remediation Guide

## Manifest Version

`00.00.00.02`

## Package Purpose

This package updates the Wave 15A UI Doctrine Remediation Guide to align with the durable PCC 100-point UI/UX Mold Breaker scoring standard. The package now treats the prior 56/56 model as superseded for PCC readiness decisions.

Wave 15A remains the remediation program focused on moving the Project Control Center from its current UI/UX drift posture to a Phase 4-ready, evidence-backed, flagship SPFx product surface.

## Canonical Objective

Remediate PCC shared-system and surface-level UI/UX drift so the app qualifies as a flagship SharePoint-hosted SPFx project control center before Phase 3 closeout and before Phase 4 tenant validation begins.

The target is no longer “achieve 56/56.” The target is:

- **100/100 desired**
- **95/100 minimum for Phase 4 entry consideration**
- **No hard-stop failures**
- **No pillar below 80% of available points**
- **Complete evidence package sufficient for independent re-score**

## Recommended Canonical Path for This Wave Package

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/
```

## Optional Execution Mirror

```text
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/
```

## Canonical Scorecard Location

The scorecard itself is intentionally **not wave-owned**. It should live in the reusable SPFx surface reference area:

```text
docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Mold_Breaker_Scorecard.md
docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Scorecard_Use_Guide.md
```

Wave 15A is the first major consumer of this scorecard, not the owner of the scorecard.

## Included Files

| File | Description | Required? |
|---|---|---|
| `README.md` | Entry point and file map for the updated Wave 15A package. | Yes |
| `00_EXECUTIVE_BRIEF_AND_SCOPE_LOCK.md` | Scope, business reason, success standard, and non-scope. | Yes |
| `01_DOCTRINE_AUTHORITY_AND_SCORECARD_CONTRACT.md` | Updated authority contract referencing the 100-point PCC scorecard. | Yes |
| `02_WAVE_15A_TARGET_ARCHITECTURE.md` | End-state architecture under the 100-point model. | Yes |
| `03_REMEDIATION_ORDER_AND_WORKSTREAM_PLAN.md` | Workstream sequence and dependencies aligned to the updated scorecard. | Yes |
| `04_SHARED_SYSTEM_REMEDIATION_BLUEPRINT.md` | Shared shell/nav/grid/card/state remediation. | Yes |
| `05_SURFACE_REMEDIATION_PLAYBOOKS.md` | Surface-specific remediation guides and acceptance targets. | Yes |
| `06_STATE_MODEL_AND_CONTENT_LANGUAGE_STANDARD.md` | Preview/read-only/degraded/blocked content standard. | Yes |
| `07_VALIDATION_EVIDENCE_AND_100_POINT_GATES.md` | Evidence, validation, hard-stop, and 100-point closeout gates. | Yes |
| `08_AGENT_EXECUTION_PROTOCOL.md` | Execution instructions for implementation agents. | Yes |
| `09_RISKS_DECISIONS_AND_DEFERMENTS.md` | Risks, required decisions, and allowable deferrals. | Yes |
| `10_CLOSEOUT_AND_HANDOFF_TEMPLATE.md` | Final closeout and auditor handoff template. | Yes |
| `11_CANONICAL_REFERENCE_UPDATE.md` | Migration note explaining the shift from 56/56 to the reusable 100-point PCC scorecard. | Yes |

## Intended Users

- Project executive / product sponsor
- PCC implementation agents
- UI doctrine auditors
- SPFx developers
- QA and validation reviewers
- Phase 3 closeout reviewers
- Phase 4 readiness reviewers

## Package Rules

1. Use repo truth, not prior chat memory, as implementation authority.
2. Treat the canonical PCC 100-point scorecard as the scoring authority.
3. Do not claim Phase 4 readiness with any open hard-stop failure.
4. Do not claim flagship readiness below 95/100.
5. Do not remediate individual pages before shared shell, navigation, bento, card, and state primitives are corrected.
6. Do not use generic “polish” language. Every remediation must identify the UX failure mode and the acceptance outcome.
7. Treat the construction-tech UI/UX studies as governing design-decision input for Mold Breaker differentiation.
8. Distinguish doctrine compliance from competitive differentiation. PCC must achieve both.
9. Preserve SharePoint/SPFx host constraints.
10. Do not introduce live mutation, live integration, or runtime write behavior unless separately authorized by the applicable architecture wave.


## Canonical References

Wave 15A now consumes the PCC 100-point scorecard as a durable reference standard, not as a wave-owned scoring file.

- PCC scorecard: `docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Mold_Breaker_Scorecard.md`
- PCC scorecard use guide: `docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Scorecard_Use_Guide.md`
- Construction-tech UI study: `docs/explanation/design-decisions/con-tech-ui-study.md`
- Construction-tech UX study: `docs/explanation/design-decisions/con-tech-ux-study.md`
- SPFx governing standard: `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- Acceptance and scoring model: `docs/reference/ui-kit/doctrine/UI-Doctrine-Acceptance-and-Scoring-Model.md`

