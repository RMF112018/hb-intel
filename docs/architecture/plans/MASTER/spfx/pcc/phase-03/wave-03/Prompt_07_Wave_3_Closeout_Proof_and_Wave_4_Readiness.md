# Prompt 07 — Wave 3 Closeout, Proof, and Wave 4 Readiness

You are working in the live `RMF112018/hb-intel` repository on `main`.

## Objective

Close Phase 3 Wave 3 with validation proof, documentation updates, deferred-scope confirmation, and a clear readiness decision for Wave 4.

Wave 3 is complete only if the PCC backend read-model foundation is documented, tested, and remains read-only/no-mutation. The system must not be represented as a live operational PCC release unless a later approved wave explicitly changes that posture.

## Required Prerequisite

Verify all prior Wave 3 closeouts exist:

- `Wave_3_Scope_Lock.md`
- `Wave_3_Backend_Route_and_DTO_Placement.md`
- `Wave_3_Read_Model_Contracts_Closeout.md`
- `Wave_3_Backend_Mock_Provider_Closeout.md`
- `Wave_3_Read_Only_Routes_Closeout.md`
- `Wave_3_SPFX_Client_Boundary_Closeout.md`

If any are missing, stop and produce a blocking gap report.

## Repo Files to Inspect

Inspect:

- all Wave 3 closeouts;
- `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-03/README.md`;
- `docs/architecture/blueprint/sp-project-control-center/phase-3/05_Phase_3_Development_Roadmap_Updated.md`;
- `docs/architecture/blueprint/sp-project-control-center/phase-3/07_Phase_3_Module_Implementation_Plan.md`;
- `packages/models/src/pcc/**`;
- `backend/functions/src/**` relevant PCC files;
- `apps/project-control-center/src/**` relevant API/client files;
- `apps/project-control-center/README.md`;
- package files only for status verification, not editing unless a prior prompt touched them.

Do not repeatedly re-read unchanged files already in context unless freshness is required.

## Allowed Files

Create or update only:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-3/Wave_3_Closeout.md
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-03/README.md
apps/project-control-center/README.md
```

Update roadmap/status docs only if required to mark Wave 3 complete and if the scope lock allows it. Do not modify source code in this prompt.

## Forbidden Work

Do not modify:

- backend source;
- SPFx source;
- shared model source;
- package manifests;
- lockfiles;
- workflows;
- deployment files;
- SPFx manifests;
- provisioning packages.

Do not run:

- deployment;
- `.sppkg` packaging;
- app catalog upload;
- Graph/PnP tenant operations;
- Procore API;
- provisioning executor;
- repair runner;
- tenant mutation.

## Required Closeout Coverage

`Wave_3_Closeout.md` must document:

1. Executive summary.
2. Wave 3 prompt-by-prompt closeout index.
3. Implemented files.
4. Route namespace and final route list.
5. Read-model contract inventory.
6. Mock provider inventory.
7. SPFx client-boundary inventory.
8. Auth posture.
9. Default data mode.
10. Fixture fallback.
11. No-mutation guard coverage.
12. Validation command results.
13. Package/lockfile status.
14. Deferred work.
15. Explicit forbidden claims.
16. Wave 4 readiness recommendation.

## Required Validation

Run all relevant package-level commands. At minimum:

```bash
git status --short
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
pnpm --filter @hbc/functions build
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm --filter @hbc/spfx-project-control-center build
```

If package names differ, use actual package names and document the difference.

Do not run deployment, tenant, Graph/PnP, Procore, provisioning executor, app catalog, or `.sppkg` commands.

## Required Non-Claims

The closeout must not claim:

- live backend data source exists;
- tenant calls were made or tested;
- Graph/PnP integration exists;
- Procore integration exists;
- Document Crunch integration exists;
- Adobe Sign integration exists;
- access requests execute;
- approvals execute;
- Site Health scans/repairs run;
- provisioning runs;
- package was deployed;
- app catalog was updated;
- production readiness exists.

## Required Deferred Scope Register

Document these as deferred unless repo truth says a later approved prompt changed them:

- live Graph-backed Document Control file operations;
- live SharePoint/OneDrive source discovery;
- Procore runtime;
- Document Crunch runtime;
- Adobe Sign runtime;
- Team & Access permission execution;
- approval execution;
- Site Health scanner and repair runner;
- persistence/write models;
- provisioning preview/apply execution;
- SPFx packaging/deployment;
- hosted SharePoint parity proof;
- production rollout.

## Wave 4 Readiness Recommendation

The closeout must recommend the next wave.

Default recommendation unless repo truth contradicts:

- Wave 4 should be **Project Home / Command Center backend integration and read-model consumption hardening**, using the read-model foundation from Wave 3.
- Wave 4 should not start workflow writes or live tenant mutation.
- Wave 4 should focus on consuming read models safely, state mapping, role-aware shaping, and preserving fixture fallback.

## Expected Final Readiness Statement

Include a final readiness statement similar to:

```text
Phase 3 Wave 3 is complete when PCC shared read-model contracts, mock backend provider scaffolding, read-only backend route family, SPFx client boundary, fixture fallback, validation proof, and no-mutation guardrails are implemented and documented. The PCC remains a controlled read-model foundation and is not a live operational release, tenant execution surface, provisioning executor, or Procore runtime.
```

## Expected Commit Summary

```text
docs(pcc): close wave 3 backend read-model foundation
```

## Expected Commit Description

```text
Closes Phase 3 Wave 3 for the PCC Backend Read-Model Foundation.

Documents the shared read-model contracts, mock backend provider, read-only backend route family, SPFx client boundary, fixture fallback posture, validation proof, no-mutation guardrails, deferred live-operation work, and Wave 4 readiness recommendation.

No tenant mutation, provisioning executor, Graph/PnP mutation, Procore runtime, Document Crunch runtime, Adobe Sign runtime, Site Health repair execution, access execution, approval execution, deployment, `.sppkg`, app catalog upload, or production rollout is introduced.
```
