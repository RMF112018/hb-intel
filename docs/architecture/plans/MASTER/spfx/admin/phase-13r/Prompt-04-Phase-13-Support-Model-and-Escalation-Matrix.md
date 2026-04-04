# Prompt-04 — Phase 13 Support Model and Escalation Matrix

## Objective

Create the support ownership model and escalation matrix for the Admin SPFx IT Control Center in production.

## Important execution rules

- Do **not** re-read files already in current context unless needed.
- Keep this practical and concise.
- Do not invent large support organizations that repo or operating context does not support.

## Inputs

Use:
- Prompt-01 through Prompt-03 outputs
- any existing runbook/support docs in repo

## Create

- `docs/architecture/plans/MASTER/spfx/admin/phase-13/admin-spfx-phase-13-support-model-and-escalation-matrix.md`

## Required sections

1. **Purpose**
2. **Support tiers / ownership groups**
3. **Primary responsibilities by tier**
4. **Escalation triggers**
5. **Sev / priority guidance**
6. **Hand-off expectations**
7. **Communication and evidence expectations**
8. **Out-of-scope issues and routing guidance**

## Required content

Define at minimum:
- operator/admin responsibilities
- engineering/backend responsibilities
- platform/M365/Azure responsibilities where relevant
- escalation path for:
  - failed rollout/deployment
  - degraded backend runtime
  - auth or permission issues
  - audit/logging gaps
  - broken admin workflows
  - configuration drift or broken standards
- expected evidence to attach before escalation

## Validation

Before finishing:
- ensure the model is compatible with a small, realistic support footprint,
- ensure every major failure mode has an owner and escalation route,
- ensure the document references runbooks instead of duplicating them.

## Completion condition

Stop after the support model doc is complete.
