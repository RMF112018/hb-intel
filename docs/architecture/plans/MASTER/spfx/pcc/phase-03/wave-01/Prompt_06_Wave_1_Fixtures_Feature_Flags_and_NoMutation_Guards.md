# Prompt 06 — Wave 1 Fixtures, Feature Flags, and No-Mutation Guards

## Objective

Add safe deterministic PCC fixture/mock data, feature/module enablement flags, and no-mutation guard utilities/tests if the Prompt 01 scope lock authorizes them.

Do not add real secrets, tenant mutations, live URLs beyond dev-safe placeholders, Procore runtime, or executable repair/provisioning behavior.

## Context

The Project Control Center Phase 3 implementation plan is organized into waves. Wave 1 is the **PCC Shared Foundations** wave.

Wave 1 exists to prepare implementation-neutral shared model contracts, registries, fixture patterns, feature/module flags, and no-mutation guardrails for all later PCC waves.

Wave 1 must not implement shell UI, backend routes, live APIs, tenant execution, Graph/PnP calls, Procore runtime, workflow screens, access execution, Site Health repair execution, production rollout, app catalog deployment, or CI/CD deployment changes.

The repo audit found that the requested exact Phase 3 planning directory was not present on `main` during package generation. You must re-check this before proceeding.


## Repo-Truth Files to Inspect

Inspect:

```text
packages/models/src/pcc/**
packages/models/vitest.config.ts
packages/project-site-template/validation/**
packages/project-site-provisioning/src/guards/no-mutation-guard.ts
packages/project-site-provisioning/src/scans/**
packages/project-site-provisioning/README.md
packages/data-seeding/package.json
docs/architecture/blueprint/sp-project-control-center/Standard_Project_Site_Template_Contract.md
docs/architecture/blueprint/sp-project-control-center/HB_Project_Control_Center_Target_Architecture_Blueprint.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-1/Wave_1_Scope_Lock.md
```

## Files Allowed to Modify

If code is authorized:

```text
packages/models/src/pcc/fixtures/**
packages/models/src/pcc/feature-flags.ts
packages/models/src/pcc/module-flags.ts
packages/models/src/pcc/no-mutation-guards.ts
packages/models/src/pcc/index.ts
packages/models/src/pcc/**/*.test.ts
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-1/**
```

If Prompt 01 chooses a different fixture path, use that path and document why.

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
```

Do not add secrets, real Procore tokens, live mutation operations, Graph/PnP callers, or Procore runtime clients.

## Required Implementation or Documentation Work

Add deterministic non-secret fixtures for local development and tests:

1. Sample project profile.
2. Sample roles/personas.
3. Sample work centers.
4. Sample priority actions.
5. Sample workflow modules.
6. Sample workflow items.
7. Sample external links.
8. Sample Document Control sources.
9. Sample Site Health summary.
10. Feature/module flags for MVP/later/deferred module enablement.
11. No-mutation guard utilities or tests, only if repo-supported and scope-locked.

No-mutation guard requirements:

- Prefer a pure local PCC guard/test that checks fixtures for prohibited key names and runtime-import boundaries.
- Do not import `@hbc/project-site-provisioning` into `@hbc/models` unless Prompt 01 explicitly approves that dependency direction.
- Prohibited fixture patterns must include:
  - secret-like keys: `clientSecret`, `apiKey`, `accessToken`, `refreshToken`, `bearerToken`;
  - mutation intent keys: `execute`, `apply`, `provision`, `mutate`, `createSite`, `createList`, `createLibrary`, `createGroup`, `assignPermission`;
  - Procore mirror/write-back fields: `procoreMirror`, `mirrorTable`, `mirrorRecords`, `writeBack`, `syncToken`.

Feature/module flag requirements:

- Define model-level flag metadata only.
- Do not wire flags into UI, backend routes, launchers, or runtime configuration.
- Include MVP/later/deferred/proof-gated posture where useful.

Tests should verify:

- deterministic fixture IDs and values;
- no fixture secrets;
- no mutation keys;
- no Procore mirror/write-back/sync runtime shape;
- no SPFx/backend/Graph/PnP/Procore imports in PCC shared model files if a simple source-scan test is repo-appropriate.

## Required Guardrails

- Fixtures must be fake, deterministic, and non-secret.
- No live tenant URLs unless already public/dev-safe placeholders are explicitly allowed by Prompt 01.
- No Procore credentials, OAuth fields, tokens, SDKs, or runtime clients.
- No executable mutation behavior.
- No backend routes.
- No SPFx screens.
- No package or manifest version bumps.

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
test(models): add PCC fixtures and no-mutation guard coverage
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

Adds deterministic PCC fixtures, model-level feature/module flags, and no-mutation/no-secret guard coverage where authorized.

```
