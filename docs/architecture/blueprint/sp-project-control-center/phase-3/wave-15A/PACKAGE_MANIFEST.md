# Package Manifest — PCC Phase 3 Wave 15A UI Doctrine Remediation

## Package Name

PCC Phase 3 Wave 15A — UI Doctrine Remediation Guide

## Manifest Version

`00.00.00.01`

## Package Purpose

This package provides the top-level guidance required to drive Project Control Center UX/UI remediation from the current audit posture to a 56/56 flagship-ready doctrine score. It is intended to guide multiple implementation prompts, audits, screenshots, and closeouts.

## Canonical Objective

Remediate PCC shared-system and surface-level UX/UI doctrine drift so that the app qualifies as a flagship SharePoint-hosted SPFx product surface before Phase 3 closeout.

## Recommended Canonical Path

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/
```

## Optional Execution Mirror

```text
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/
```

## Included Files

| File                                               | Description                                          | Required? |
| -------------------------------------------------- | ---------------------------------------------------- | --------- |
| `README.md`                                        | Entry point and file map.                            | Yes       |
| `00_EXECUTIVE_BRIEF_AND_SCOPE_LOCK.md`             | Scope, business reason, and non-scope.               | Yes       |
| `01_DOCTRINE_AUTHORITY_AND_SCORECARD_CONTRACT.md`  | Criteria matrix and score contract.                  | Yes       |
| `02_WAVE_15A_TARGET_ARCHITECTURE.md`               | End-state architecture.                              | Yes       |
| `03_REMEDIATION_ORDER_AND_WORKSTREAM_PLAN.md`      | Workstream sequence and dependencies.                | Yes       |
| `04_SHARED_SYSTEM_REMEDIATION_BLUEPRINT.md`        | Shared shell/nav/grid/card/state remediation.        | Yes       |
| `05_SURFACE_REMEDIATION_PLAYBOOKS.md`              | Surface-specific remediation guides.                 | Yes       |
| `06_STATE_MODEL_AND_CONTENT_LANGUAGE_STANDARD.md`  | Preview/read-only/degraded/blocked content standard. | Yes       |
| `07_VALIDATION_EVIDENCE_AND_56_SCORECARD_GATES.md` | Test, screenshot, and scoring gates.                 | Yes       |
| `08_AGENT_EXECUTION_PROTOCOL.md`                   | Agent execution instructions and controls.           | Yes       |
| `09_RISKS_DECISIONS_AND_DEFERMENTS.md`             | Risks, required decisions, and allowable deferrals.  | Yes       |
| `10_CLOSEOUT_AND_HANDOFF_TEMPLATE.md`              | Final closeout and auditor handoff template.         | Yes       |

## Intended Users

- Project executive / product sponsor
- PCC implementation agents
- UI doctrine auditors
- SPFx developers
- QA and validation reviewers
- Phase 3 closeout reviewers

## Package Rules

1. Use repo truth, not prior chat memory, as implementation authority.
2. Do not re-read files already in current agent context unless exact wording, line references, or changed repo state must be verified.
3. Treat UI doctrine as a readiness gate.
4. Do not claim 56/56 without screenshot, test, and source evidence.
5. Do not remediate individual pages before shared shell, grid, card, and state primitives are corrected.
6. Do not use generic “polish” language. Every remediation must identify the UX failure mode and the acceptance outcome.
