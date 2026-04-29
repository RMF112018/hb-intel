# Prompt 11 — PCC Production Rollout, Gated

## Objective

Plan or execute PCC production rollout only after non-production evidence, operator approval, security review, support readiness, rollback readiness, and all production gates are explicitly closed.

This prompt is production-blocked by default.

## Required Gate

Before starting, verify all of the following:

- Phase 2 closeout complete.
- Phase 3 Implementation Gate Review authorizes production planning or rollout.
- Non-production rollout proof package complete.
- Non-production validation passed.
- Site Health and drift validation passed.
- Rollback/support model approved.
- Security review complete.
- Operator approval documented.
- Production tenant/site targets explicitly identified.
- Production change window approved.
- Procore runtime remains out of scope unless separately approved.

If any item fails, stop and produce a production-blocked closeout.

## Required Repo Sources

Audit:

```text
docs/architecture/blueprint/sp-project-control-center/phase-2/**
docs/architecture/blueprint/sp-project-control-center/phase-3/**
backend/functions/**
apps/**
packages/**
tools/**
.github/**
docs/reference/developer/verification-commands.md
```

## Allowed Files

Only files explicitly authorized by production gate evidence.

Likely documentation targets:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/PCC_Production_Rollout_Readiness.md
docs/architecture/blueprint/sp-project-control-center/phase-3/Prompt_11_Production_Rollout_Closeout.md
```

Execution/deployment files only if explicitly authorized.

## Forbidden Scope

Unless separately and explicitly authorized:

- production tenant mutation
- app catalog deployment
- deployment workflow edits
- Procore runtime
- Procore secrets
- Procore mirror/write-back
- direct SPFx provisioning
- unapproved repair execution

## Required Deliverable

Create:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/PCC_Production_Rollout_Readiness.md
```

Include:

1. Objective
2. Production gate evidence
3. Non-production proof summary
4. Production target inventory
5. Operator approval
6. Security approval
7. Support/readiness model
8. Rollback model
9. Change window
10. Execution checklist
11. Validation checklist
12. Communication plan
13. Production risks
14. Go / No-Go decision
15. Closeout requirements

## Execution Rule

Do not execute production rollout unless:

- the user explicitly instructs execution in this prompt/session;
- all production gates are closed;
- exact commands are reviewed before execution;
- target tenant/sites are confirmed;
- rollback is ready;
- evidence capture is ready.

If production execution is not authorized, produce readiness documentation only.

## Validation

At minimum:

```bash
git status --short
```

If execution is authorized, include exact production validation commands and results.

## Required Final Response

Return only:

```text
Commit summary
Commit description
Validation results
Production gate status
Recommended next prompt
```

## Recommended Commit Summary

```text
docs(pcc): add production rollout readiness package
```

## Recommended Commit Description

```text
Manifest: SharePoint Project Control Center

Version: <fill version posture based on repo policy>

Adds PCC production rollout readiness documentation under docs/architecture/blueprint/sp-project-control-center/phase-3/. Captures production gate evidence, non-production proof summary, production target inventory, operator/security approvals, support and rollback posture, change-window readiness, validation checklist, and go/no-go decision.

Validation:
- <fill exact commands and results>

Production gate status:
- <blocked / ready for approval / authorized / executed>

No Procore runtime, secrets, mirror, or write-back unless separately approved.
```
