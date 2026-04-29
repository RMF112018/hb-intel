# Prompt 08 — PCC Backend Read-Model Scaffold, Gated Implementation

## Objective

Create the initial backend read-model scaffold for Project Control Center only if Phase 2 Step 5/6 and the Phase 3 Implementation Gate Review explicitly authorize backend read-model implementation.

This prompt is blocked by default.

## Required Gate

Before starting, verify:

- Phase 3 Implementation Gate Review exists.
- Gate decision authorizes backend read-model scaffold.
- Phase 2 Step 4 dry-run/proof semantics are stable.
- Phase 2 Step 5/6 mutation/executor boundaries are clear enough to avoid accidental executor work.
- Backend work is read-model only.
- No tenant mutation is required.
- No Procore runtime is required.

If any item fails, stop and produce a blocked closeout.

## Required Repo Sources

Audit:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/Phase_3_Implementation_Gate_Review.md
docs/architecture/blueprint/sp-project-control-center/phase-3/PCC_Backend_Service_Contract_Design.md
backend/functions/README.md
backend/functions/**
packages/project-site-template/**
packages/project-site-provisioning/**
packages/**
```

## Allowed Files

Allowed files must be determined by the gate review.

Likely future targets may include:

```text
backend/functions/src/hosts/**
backend/functions/src/services/**
backend/functions/src/routes/**
packages/models/**
```

Only if explicitly authorized.

## Forbidden Scope

- provisioning executor implementation
- tenant mutation
- Graph/PnP live mutation
- Procore runtime
- Procore secrets
- Procore mirror/write-back
- deployment workflow changes
- production rollout
- SPFx implementation
- package/version changes unless explicitly required by repo policy

## Required Implementation Constraints

If authorized:

- Implement read-only route/service scaffold only.
- Do not execute provisioning.
- Do not apply, repair, create, mutate, or assign tenant resources.
- Do not re-derive provisioning plans inside backend.
- Consume stable approved manifest/proof summaries only if available.
- Use established backend auth/response/request-id patterns.
- Include mock/local-safe behavior where repo patterns require it.
- Keep all executor/apply actions absent or disabled.

## Required Closeout Documentation

Create:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/Prompt_08_Backend_Read_Model_Scaffold_Closeout.md
```

Include:

- Gate evidence
- Files changed
- What was implemented
- What remains blocked
- Validation commands
- Auth/readiness notes
- No tenant mutation confirmation
- Recommended next prompt

## Validation

Run appropriate commands for touched backend/package files.

At minimum:

```bash
git status --short
```

Likely:

```bash
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
```

Use repo-correct commands if different.

Do not run deployment, tenant, Graph/PnP, or production commands.

## Required Final Response

Return only:

```text
Commit summary
Commit description
Validation results
Gate evidence
Recommended next prompt
```

## Recommended Commit Summary

```text
feat(pcc): scaffold backend read models
```

## Recommended Commit Description

```text
Manifest: SharePoint Project Control Center

Version: <fill version posture based on repo policy>

Adds the gated initial PCC backend read-model scaffold authorized by the Phase 3 Implementation Gate Review. Establishes read-only backend seams for future PCC shell consumption without provisioning execution, tenant mutation, Graph/PnP mutation, or Procore runtime.

Validation:
- <fill exact commands and results>

Gate evidence:
- <cite Phase 3 Implementation Gate Review decision>

No tenant mutation. No provisioning executor. No Procore runtime, secrets, mirror, or write-back.
```
