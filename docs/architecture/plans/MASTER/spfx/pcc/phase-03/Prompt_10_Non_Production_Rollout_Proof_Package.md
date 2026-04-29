# Prompt 10 — PCC Non-Production Rollout Proof Package

## Objective

Plan and execute a non-production rollout proof package for PCC only after Phase 2 closeout authorizes non-production execution and the Phase 3 Implementation Gate Review confirms readiness.

This prompt is blocked by default.

## Required Gate

Before starting, verify:

- Phase 2 closeout exists.
- Phase 3 Implementation Gate Review authorizes non-production rollout proof.
- Approved manifest and proof artifact exist.
- Human approval checkpoint exists.
- Non-production target is defined.
- Executor boundary is authorized for non-production only.
- Post-provision validation posture exists.
- Rollback/support posture exists.

If any item fails, stop and produce a blocked closeout.

## Required Repo Sources

Audit:

```text
docs/architecture/blueprint/sp-project-control-center/phase-2/**
docs/architecture/blueprint/sp-project-control-center/phase-3/**
packages/project-site-provisioning/**
packages/project-site-template/**
backend/functions/**
tools/pnp-runner-local/**
docs/reference/developer/verification-commands.md
```

## Allowed Files

Only files explicitly authorized by the gate review and Phase 2 closeout.

Likely documentation targets:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/PCC_Non_Production_Rollout_Proof_Package.md
docs/architecture/blueprint/sp-project-control-center/phase-3/Prompt_10_Non_Production_Rollout_Closeout.md
```

Implementation/execution files only if explicitly authorized by gate evidence.

## Forbidden Scope

- production rollout
- broad tenant mutation outside approved non-production target
- unapproved Graph/PnP mutation
- unapproved executor changes
- Procore runtime
- Procore secrets/mirror/write-back
- direct SPFx provisioning
- app catalog deployment unless explicitly authorized

## Required Deliverable

Create:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/PCC_Non_Production_Rollout_Proof_Package.md
```

Include:

1. Objective
2. Gate evidence
3. Non-production target
4. Approved manifest reference
5. Dry-run proof reference
6. Human approval evidence
7. Execution boundary
8. Validation plan
9. Site Health validation
10. Drift validation
11. Rollback/support plan
12. Evidence capture checklist
13. Production-blocked statement
14. Risks
15. Open issues
16. Recommended next prompt

## Execution Rule

Do not execute tenant mutation unless the prompt is being run in an environment where:

- explicit user authorization has been given;
- the non-production target is confirmed;
- the repo gate documents authorize execution;
- the required operator credentials/context are available;
- the command sequence is understood and evidence capture is ready.

If execution is not possible, produce the proof package as a plan and state that execution was not run.

## Validation

At minimum:

```bash
git status --short
```

If execution is authorized, include exact non-production validation commands and results.

Never run production commands.

## Required Final Response

Return only:

```text
Commit summary
Commit description
Validation results
Execution status
Recommended next prompt
```

## Recommended Commit Summary

```text
docs(pcc): add non-production rollout proof package
```

## Recommended Commit Description

```text
Manifest: SharePoint Project Control Center

Version: <fill version posture based on repo policy>

Adds the PCC non-production rollout proof package under docs/architecture/blueprint/sp-project-control-center/phase-3/. Defines the approved manifest/proof, non-production target, approval checkpoint, execution boundary, validation plan, Site Health/drift validation, rollback/support posture, and production-blocked status.

Validation:
- <fill exact commands and results>

Execution status:
- <not executed / executed against approved non-production target>

No production rollout. No Procore runtime, secrets, mirror, or write-back.
```
