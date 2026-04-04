# Prompt-06 — Phase 13 Incident Triage, Recovery, and Break-Glass Runbooks

## Objective

Create production runbooks for incident triage, service recovery, and tightly governed break-glass handling where justified.

## Important execution rules

- Do **not** re-read files already in current context unless needed.
- Keep break-glass guidance minimal, controlled, and auditable.
- Do not normalize unsafe manual intervention.

## Inputs

Use:
- Prompt-01 through Prompt-05 outputs
- support model doc
- any existing incident or ops docs

## Create

1. `docs/architecture/plans/MASTER/spfx/admin/phase-13/runbooks/admin-spfx-incident-triage-runbook.md`
2. `docs/architecture/plans/MASTER/spfx/admin/phase-13/runbooks/admin-spfx-service-recovery-runbook.md`
3. `docs/architecture/plans/MASTER/spfx/admin/phase-13/runbooks/admin-spfx-break-glass-guidance.md`

## Required incident triage content

- symptom categories
- first checks
- severity guidance
- evidence gathering checklist
- escalation triggers
- when to stop and escalate

## Required service recovery content

- common recovery classes
- validation after recovery
- audit/evidence capture expectations
- when recovery is not safe without engineering involvement

## Required break-glass guidance

- purpose and limitations
- allowed scenarios only
- approval/evidence expectations
- post-action review requirement
- prohibition against using break-glass as normal operations

## Validation

Before finishing:
- ensure break-glass guidance is tightly limited,
- ensure recovery guidance references support/escalation ownership,
- ensure the runbooks do not assume privileged access paths that are not documented.

## Completion condition

Stop after the three runbook docs are complete.
