# Prompt 07 — Wave 1 Exports, Tests, and Documentation Closeout

## Objective

Finalize PCC shared foundation exports, tests, documentation, validation proof, and Wave 1 closeout.

Confirm that only shared foundations were implemented and that Wave 2 readiness is documented without starting Wave 2.

## Context

The Project Control Center Phase 3 implementation plan is organized into waves. Wave 1 is the **PCC Shared Foundations** wave.

Wave 1 exists to prepare implementation-neutral shared model contracts, registries, fixture patterns, feature/module flags, and no-mutation guardrails for all later PCC waves.

Wave 1 must not implement shell UI, backend routes, live APIs, tenant execution, Graph/PnP calls, Procore runtime, workflow screens, access execution, Site Health repair execution, production rollout, app catalog deployment, or CI/CD deployment changes.

The repo audit found that the requested exact Phase 3 planning directory was not present on `main` during package generation. You must re-check this before proceeding.


## Repo-Truth Files to Inspect

Inspect:

```text
packages/models/package.json
packages/models/src/index.ts
packages/models/src/pcc/**
packages/models/tsconfig.json
packages/models/vitest.config.ts
package.json
turbo.json
pnpm-workspace.yaml
docs/architecture/blueprint/sp-project-control-center/README.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-1/**
packages/project-site-template/README.md
packages/project-site-provisioning/README.md
backend/functions/README.md
```

## Files Allowed to Modify

If code/docs are authorized:

```text
packages/models/src/pcc/**
packages/models/src/index.ts
packages/models/README.md             # only if repo has/needs one and Prompt 01 allowed it
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-1/**
```

## Files Forbidden to Modify

Do not modify:

```text
apps/**
backend/functions/**
packages/project-site-template/**
packages/project-site-provisioning/**
packages/provisioning/**
tools/**
.github/**
dist/**
*.sppkg
package.json             # unless Prompt 01 explicitly authorized script-only changes; no version bump
pnpm-workspace.yaml
turbo.json
tsconfig.base.json
```

Do not start Wave 2 shell work or Wave 3 backend read-model work.

## Required Implementation or Documentation Work

1. Finalize PCC domain barrel exports.
2. Export PCC shared models from the repo-approved package entry point.
3. Confirm subpath import strategy works according to existing package patterns.
4. Confirm tests cover:
   - frozen PCC enum/status values;
   - work center registry;
   - workflow module registry;
   - external system registry;
   - Site Health severity values;
   - no-mutation/no-secret/no-Procore-mirror fixture posture.
5. Add/update Wave 1 closeout documentation.
6. Document the final shared model surface and intended consumers.
7. Document what Wave 2 can consume.
8. Confirm Wave 2 readiness without implementing Wave 2.
9. Confirm Wave 3 backend readiness without implementing Wave 3.
10. Confirm no package or SPFx manifest version bumps unless explicitly authorized.
11. Produce final commit summary and commit description.

## Required Guardrails

- No PCC shell UI.
- No Project Home UI.
- No backend route/API.
- No provisioning executor.
- No tenant mutation.
- No Graph/PnP live calls.
- No Procore runtime, secrets, mirror, or write-back.
- No direct SPFx-to-Procore path.
- No production rollout.
- No app catalog deployment.
- No CI/CD deployment changes.
- No package or manifest version bump unless explicitly authorized.

## Required Validation Commands

Run:

```bash
git status --short
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
pnpm --filter @hbc/models build
```

If lint is relevant:

```bash
pnpm --filter @hbc/models lint
```

If touched docs or package state affects broader workspace confidence:

```bash
pnpm check-types
```

Do not run deployment/app catalog/tenant commands.

## Required Closeout Response Format

Return only the following sections:

```markdown
## Execution Summary
- ...

## Files Changed
- ...

## Validation
- Command: ...
  - Result: ...

## Guardrail Confirmation
- No PCC shell UI implemented: Confirmed / Not confirmed
- No backend route/API implemented: Confirmed / Not confirmed
- No provisioning executor or tenant mutation: Confirmed / Not confirmed
- No Graph/PnP live calls: Confirmed / Not confirmed
- No Procore runtime, secrets, mirror, or write-back: Confirmed / Not confirmed
- No package/SPFx manifest version bump: Confirmed / Not confirmed
- No CI/CD deployment change: Confirmed / Not confirmed

## Open Decisions / Follow-ups
- ...

## Recommended Commit Summary
...

## Recommended Commit Description
...
```


## Recommended Commit Summary

```text
docs(models): close PCC shared foundations wave 1
```

## Recommended Commit Description

```text
Manifest: SharePoint Project Control Center

Version: no package or SPFx version change unless explicitly authorized.

Preserves Phase 3 Wave 1 guardrails:
- no PCC shell implementation;
- no backend route/API implementation;
- no provisioning executor;
- no tenant mutation;
- no Graph/PnP live calls;
- no Procore runtime, secrets, mirror, or write-back;
- no direct SPFx-to-Procore path;
- no production rollout.

Finalizes exports, tests, documentation, and closeout for PCC Phase 3 Wave 1 Shared Foundations. Confirms no shell/backend/API/provisioning/module implementation occurred.

```
