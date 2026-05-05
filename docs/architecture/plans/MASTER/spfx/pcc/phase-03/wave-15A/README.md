# PCC Phase 3 Wave 15A — UI Doctrine Remediation Guide

## Purpose

Wave 15A is a dedicated Project Control Center (PCC) UI doctrine remediation wave inserted after Wave 15 and before Phase 3 closeout. Its purpose is to correct the systemic UX/UI drift identified in the PCC doctrine conformance audit and drive the PCC experience to a documented, evidence-backed 56/56 flagship readiness score.

This wave is not surface polish. It is a shared-system and product-readiness correction wave.

## Recommended Repository Placement

Primary blueprint location:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/
```

Optional implementation-planning mirror:

```text
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/
```

If both locations are used, the blueprint path should remain the canonical product/architecture authority and the plans path should hold execution prompts, agent handoffs, and prompt-by-prompt closeouts.

## Governing Sources

Wave 15A is governed by the current repo-truth versions of:

- `docs/reference/ui-kit/doctrine/`
- `docs/reference/ui-kit/GOVERNANCE-MAP.md`
- `docs/reference/ui-kit/GOVERNANCE-SUPERSESSION.md`
- `docs/reference/ui-kit/standards/`
- `docs/reference/ui-kit/patterns/`
- `docs/reference/spfx-surfaces/homepage-uiux-audit-checklist.md`
- `docs/reference/spfx-surfaces/homepage-uiux-audit-scorecard.md`
- `docs/reference/spfx-surfaces/homepage-uiux-audit-evidence.md`
- `docs/architecture/blueprint/sp-project-control-center/`
- Current source under `apps/project-control-center/`

## Wave 15A Success Standard

Wave 15A is complete only when PCC reaches an evidence-backed 56/56 score against the adapted SPFx full-page product surface scorecard.

No category may remain below 4/4.

## File Map

| File | Purpose |
|---|---|
| `PACKAGE_MANIFEST.md` | Lists the guide files, authority, and intended use. |
| `00_EXECUTIVE_BRIEF_AND_SCOPE_LOCK.md` | Defines the executive reason for Wave 15A, scope, non-scope, and go/no-go standard. |
| `01_DOCTRINE_AUTHORITY_AND_SCORECARD_CONTRACT.md` | Converts doctrine and scorecard expectations into explicit acceptance criteria. |
| `02_WAVE_15A_TARGET_ARCHITECTURE.md` | Defines the target PCC UX/UI architecture required for 56/56. |
| `03_REMEDIATION_ORDER_AND_WORKSTREAM_PLAN.md` | Defines the required sequence of remediation work. |
| `04_SHARED_SYSTEM_REMEDIATION_BLUEPRINT.md` | Deep guide for shell, nav, host fit, grid, cards, state, and project context. |
| `05_SURFACE_REMEDIATION_PLAYBOOKS.md` | Surface-by-surface remediation guide. |
| `06_STATE_MODEL_AND_CONTENT_LANGUAGE_STANDARD.md` | Defines product-grade preview/read-only/degraded/blocked language. |
| `07_VALIDATION_EVIDENCE_AND_56_SCORECARD_GATES.md` | Defines test, screenshot, evidence, and scoring requirements. |
| `08_AGENT_EXECUTION_PROTOCOL.md` | Instructions for local agents executing Wave 15A. |
| `09_RISKS_DECISIONS_AND_DEFERMENTS.md` | Tracks required decisions, risks, and allowed deferrals. |
| `10_CLOSEOUT_AND_HANDOFF_TEMPLATE.md` | Template for Wave 15A closeout and Phase 3 readiness handoff. |

## Required Execution Principle

Do not start by styling individual surfaces. Remediate in this order:

1. Doctrine and scorecard contract.
2. Shared shell and SharePoint host fit.
3. Project context and surface header standard.
4. Navigation / information architecture.
5. Grid, bento, and card hierarchy primitives.
6. State model and preview language.
7. Project Home.
8. Team & Access.
9. Documents.
10. Project Readiness.
11. Site Health.
12. Control Center Settings.
13. Approvals.
14. External Systems.
15. Tenant-hosted validation and final scorecard closeout.

## Required Closeout Standard

Wave 15A may close only when the closeout includes:

- Final 56/56 scorecard.
- Before/after screenshots for all primary surfaces.
- Tenant-hosted SharePoint screenshots in published and edit modes.
- Test results.
- Accessibility and keyboard validation.
- Evidence index tied to source files and screenshots.
- Residual-risk statement.
- Explicit recommendation that PCC may proceed to Phase 3 closeout.
