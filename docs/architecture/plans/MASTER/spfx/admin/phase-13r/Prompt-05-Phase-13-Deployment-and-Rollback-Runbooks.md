# Prompt-05 — Phase 13 Deployment and Rollback Runbooks

## Objective

Create production runbooks for deployment/promotion and rollback/recovery of the Admin SPFx IT Control Center.

## Important execution rules

- Do **not** re-read files still in current context unless needed.
- Build from repo truth and the environment baseline.
- Keep steps specific, ordered, and auditable.
- Do not write fictional automation steps.

## Inputs

Use:
- Prompt-02 and Prompt-03 outputs
- current deployment/config docs
- any CI/CD or packaging docs already in repo

## Create

1. `docs/architecture/plans/MASTER/spfx/admin/phase-13/runbooks/admin-spfx-deployment-and-promotion-runbook.md`
2. `docs/architecture/plans/MASTER/spfx/admin/phase-13/runbooks/admin-spfx-rollback-and-recovery-runbook.md`

## Required deployment runbook content

- purpose
- pre-deployment prerequisites
- environment checks
- packaging/build verification expectations
- deployment/promotion sequence
- post-deployment validation
- evidence capture
- abort conditions
- hand-off / sign-off expectations

## Required rollback/recovery runbook content

- purpose
- rollback triggers
- decision tree for rollback vs hotfix vs degraded operation
- rollback steps
- post-rollback validation
- evidence/audit capture
- stakeholder notification expectations
- residual risk handling

## Validation

Before finishing:
- ensure the steps are actionable,
- ensure rollback guidance is explicit enough for production use,
- ensure both runbooks are aligned with the release-gating document.

## Completion condition

Stop after both runbooks are complete.
