# Prompt 06 — Wave 4 Guardrails, Validation, and Fixture Fallback Hardening

You are working in the live `RMF112018/hb-intel` repository on `main`.

## Objective

Harden Wave 4 guardrails after Project Home opt-in wiring. Prove the default fixture posture, backend opt-in boundary, fallback behavior, and no-mutation/no-runtime constraints are enforceable by tests and source scans.

This prompt should not add new product functionality. It closes validation gaps and hardens architectural proof.

## Required Prerequisite

Verify Prompt 05 is complete and accepted.

Required file must exist:

- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-4/Wave_4_Project_Home_Opt_In_Wiring_Closeout.md`

If Prompt 05 did not preserve fixture default behavior, stop and produce a blocking gap report.

## Repo Files to Inspect

Inspect:

- `apps/project-control-center/src/api/**`
- `apps/project-control-center/src/tests/**`
- `apps/project-control-center/src/mount.tsx`
- `apps/project-control-center/src/PccApp.tsx`
- `apps/project-control-center/src/shell/**`
- `apps/project-control-center/src/surfaces/projectHome/**`
- `apps/project-control-center/src/ui/PccPreviewState.tsx`
- `backend/functions/src/hosts/pcc-read-model/**`
- `backend/functions/src/services/__tests__/pcc-read-model-no-runtime.test.ts`
- `packages/models/src/pcc/PccReadModels.ts`
- `apps/project-control-center/README.md`
- all Wave 4 closeout files created so far.

Do not repeatedly re-read unchanged files already in context.

## Required Implementation

Strengthen guardrails and tests. Do not add new user-facing features.

### Required guard coverage

Ensure tests or source scans prove:

- fixture mode is the default for `mount`, `PccApp`, and client factory;
- backend mode requires explicit config;
- `backendBaseUrl` or equivalent is required for real backend HTTP use;
- missing backend config produces safe fallback;
- `fetch(` appears only in the backend HTTP client implementation and direct tests/mocks;
- no `POST`, `PUT`, `PATCH`, or `DELETE` read-model client behavior exists;
- no Graph/PnP/SharePoint REST client imports exist in the PCC SPFx app;
- no Procore, Document Crunch, Adobe Sign, provisioning, repair, permission mutation, or approval execution imports/tokens exist in the PCC SPFx app and PCC read-model backend host;
- only Project Home is wired to the read-model seam in Wave 4;
- other surfaces remain fixture/preview-driven;
- Project Home fallback states render through the existing `PccPreviewState` catalog;
- tests fail if a future change silently switches default mode to backend.

### README / closeout alignment

Update `apps/project-control-center/README.md` only if needed to reflect the new Wave 4 truth:

- read-model client is no longer fully dormant;
- Project Home may consume it in explicit opt-in backend mode;
- default remains fixture;
- no live tenant/external-system runtime exists;
- backend HTTP client is transport-only and read-only.

Do not rewrite unrelated Wave 2/3 documentation.

## Allowed Files

Modify only:

```text
apps/project-control-center/src/api/**
apps/project-control-center/src/tests/**
apps/project-control-center/src/surfaces/projectHome/**
apps/project-control-center/README.md
backend/functions/src/hosts/pcc-read-model/**.test.ts
backend/functions/src/services/__tests__/pcc-read-model-no-runtime.test.ts
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-4/Wave_4_Guardrails_and_Fallback_Closeout.md
```

Backend modifications are limited to tests/source scans. Do not alter backend runtime route behavior in Prompt 06 unless a guard test cannot be written without a tiny testability-only export, and document that choice.

## Forbidden Work

Do not modify:

- backend route runtime behavior;
- package manifests;
- lockfiles;
- workflows;
- deployment files;
- SPFx manifests;
- non-Project Home product surfaces except tests/source scans.

Do not introduce:

- default backend cutover;
- tenant mutation;
- write routes (`POST`, `PUT`, `PATCH`, `DELETE`);
- Graph/PnP/SharePoint REST live operations;
- Procore runtime, SDK, secrets, sync, mirror, or write-back;
- Document Crunch runtime;
- Adobe Sign runtime;
- provisioning execution;
- Site Health scanner or repair execution;
- Team & Access permission execution;
- approval execution;
- package/version/manifest/deployment/app-catalog work unless this prompt explicitly authorizes it.

No additional `fetch(` usage is allowed beyond the Prompt 03 backend HTTP client allowlist.

## Required Tests

Add or update tests to prove all required guard coverage above.

At minimum, include regression tests for:

1. fixture default;
2. backend mode explicit opt-in;
3. missing backend config fallback;
4. backend-unavailable envelope rendering;
5. direct surface imports from backend HTTP client are disallowed;
6. `fetch(` allowlist;
7. forbidden runtime import/token scan;
8. no write-route methods.

## Validation

Run:

```bash
git status --short
md5 pnpm-lock.yaml
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
pnpm --filter @hbc/functions build
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm --filter @hbc/spfx-project-control-center build
md5 pnpm-lock.yaml
```

If `pnpm-lock.yaml` changes, stop and report.

## Closeout

Create:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-4/Wave_4_Guardrails_and_Fallback_Closeout.md
```

Closeout must include:

- files changed;
- guard list implemented;
- fallback states covered;
- default fixture proof;
- backend opt-in proof;
- fetch allowlist proof;
- no write route / no mutation proof;
- validation results;
- lockfile checksum before/after;
- documentation alignment summary;
- recommended next prompt.

## Expected Commit Summary

```text
test(spfx-pcc): harden wave 4 backend opt-in guardrails
```

## Expected Commit Description

```text
Hardens Wave 4 PCC guardrails and fixture fallback validation after Project Home opt-in read-model wiring.

Adds regression proof for fixture-default behavior, explicit backend opt-in, missing-config/backend-unavailable fallback, fetch allowlisting, no write-route methods, no forbidden runtime imports, and Project Home-only read-model consumption. Updates documentation only as needed to reflect the controlled Wave 4 posture. No tenant mutation, Graph/PnP live runtime, Procore runtime, Document Crunch runtime, Adobe Sign runtime, provisioning executor, repair execution, permission execution, approval execution, package changes, lockfile changes, manifest changes, deployment, or app-catalog work is introduced.
```
