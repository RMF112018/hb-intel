<!--
Planning package generated from repo-truth audit of RMF112018/hb-intel at commit b34238c4192dee35ca142b172d545a71cd4214c2.
Scope: Phase 2 planning only. No code implementation, repo mutation, tenant mutation, or provisioning execution.
Generated: 2026-04-28
-->

# Phase_2_Audit_Report.md

# Phase 2 — Provisioning Foundation Repo-Truth Audit Report

## Objective

Conduct a planning-only repo-truth audit for **Phase 2 — Provisioning Foundation and Template Consumer Boundary**. The objective is to define how the validated `@hbc/project-site-template` contract should be consumed by future provisioning foundation work without prematurely touching SharePoint, Graph, Procore, SPFx, or tenant state.

## Audit Basis

- Repository: `RMF112018/hb-intel`
- Baseline commit: `b34238c4192dee35ca142b172d545a71cd4214c2`
- Baseline commit title: `test(project-site-template): close phase 1 schema validation gate`
- Audit type: repo-truth planning audit.
- Implementation posture: no implementation performed; no files modified; no provisioning logic generated.

## Primary Files Audited

### Required Project Control Center architecture files

| Requested File | Audit Result |
|---|---|
| `docs/architecture/blueprint/sp-project-control-center/README.md` | Not found at baseline commit. A README update/recreation is recommended. |
| `docs/architecture/blueprint/sp-project-control-center/Standard_Project_Site_Template_Contract.md` | Found and audited. This is the human-readable source of truth for project-site provisioning. |
| `docs/architecture/blueprint/sp-project-control-center/HB_Project_Control_Center_Target_Architecture_Blueprint.md` | Found and audited. This governs strategic PCC architecture and recommended repo targets. |
| `docs/architecture/blueprint/sp-project-control-center/Project_Control_Center_Development_Roadmap.md` | Not found at baseline commit. A PCC-specific roadmap file should be created or the repo should explicitly point to the current governing roadmap location. |

### Phase 0 / Phase 1 closeout and planning files audited

- `docs/architecture/blueprint/sp-project-control-center/phase-0/Phase_0_Step_2_Closeout_Report.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-1/Phase_1_Step_5_Schema_Validation_Harness_Closeout.md`
- Search results also confirmed related Phase 0 / Phase 1 files:
  - `Phase_0_Step_1_Architecture_Stabilization_Audit.md`
  - `Phase_0_Step_1_Consistency_Check_Register.md`
  - `Phase_0_Step_1_Schema_Extraction_Readiness_Backlog.md`
  - `Phase_0_Step_2_Schema_Extraction_Plan.md`
  - `Phase_0_Step_2_Object_Catalog_Disposition.md`
  - `Phase_0_Step_2_Schema_Family_Taxonomy.md`
  - `Phase_0_Step_2_Validation_Rule_Table_Plan.md`
  - Phase 1 Step 1–4 closeout and notes files surfaced by search.

### Machine-readable contract package audited

- `packages/project-site-template/README.md`
- `packages/project-site-template/package.json`
- `packages/project-site-template/template-contract.json`
- `packages/project-site-template/schemas/template-contract.schema.json`
- `packages/project-site-template/schemas/families/*`
- `packages/project-site-template/fields/*`
- `packages/project-site-template/validation/validate-template-contract.mjs`
- `packages/project-site-template/validation/contract-integrity-checks.mjs`
- `packages/project-site-template/validation/reports/schema-validation-report.json`
- `packages/project-site-template/validation/reports/contract-integrity-report.json`
- `packages/project-site-template/docs/*`

### Repo convention files and folders audited or searched

- `package.json`
- `pnpm-workspace.yaml`
- `packages/provisioning/README.md`
- `backend/functions/package.json`
- `backend/functions/src/services/sharepoint-service.ts`
- `backend/functions/src/services/sharepoint-provisioning-service.ts`
- `backend/functions/src/services/safety-provisioning-service.ts`
- `backend/functions/src/services/graph-list-discovery-service.ts`
- `docs/architecture/plans/MASTER/platform/config-registry/provisioning-runbook.md`
- `tools/pnp-runner-local/scripts/provision-platform-configuration-registry.ps1`
- Targeted search terms included:
  - `provision`
  - `provisioning`
  - `PnP`
  - `pnp`
  - `Graph`
  - `SharePoint`
  - `site design`
  - `site script`
  - `lists`
  - `fields`
  - `content type`
  - `tenant`
  - `HBCentral`
  - `project site`
  - `template-contract`
  - `project-site-template`
  - `validation harness`
  - `dry-run`
  - `rollback`
  - `site health`
  - `repair`

## Executive Findings

### Finding 1 — Phase 1 is complete and consumable, but only as a validated contract package

Repo truth confirms:

- `template-contract.json.status.fullExtractionComplete` is `true`.
- All 14 schema families are populated.
- The validation harness runs cleanly.
- `schema-validation-report.json` has `unexpectedOutcomes: 0`.
- `contract-integrity-report.json` has `16/16` checks passing.
- Phase 2 implementation has not started.
- The package remains a schema/contract package, not a runtime executor.

### Finding 2 — `@hbc/project-site-template` must not become the provisioning executor

`packages/project-site-template/package.json` explicitly describes the package as a machine-readable contract with schema family contracts and package-local validation harness only. It also has no backend, SPFx, SharePoint, Graph, Procore, or provisioning runtime dependency.

Phase 2 should preserve that boundary:

- allowed: contract loading, schema validation, normalized read-only model derivation;
- not allowed: Graph/PnP calls, tenant mutation, SPFx rendering, Procore runtime integration, backend route implementation.

### Finding 3 — A new consumer/planner layer is needed before backend or tenant work

The contract and blueprint both point to backend functions as the eventual provisioning authority, but the validated package itself is not executable provisioning logic. Phase 2 should introduce a safe local consumer/planner layer before the backend executor is connected.

Recommended ownership:

```text
packages/project-site-template/          # remains schema + validation source
packages/project-site-provisioning/      # proposed new local consumer/planner package
docs/architecture/blueprint/sp-project-control-center/phase-2/   # Phase 2 planning docs/proofs
backend/functions/                       # future executor only after mutation gates
```

### Finding 4 — Existing backend provisioning code is useful but unsafe as the first Phase 2 step

Existing backend services prove the repo already has SharePoint/PnP seams and Graph discovery seams:

- `SharePointProvisioningService` owns actual PnP mutations.
- `SafetyProvisioningService` demonstrates a dry-run posture before mutation.
- `GraphListDiscoveryService` centralizes Graph list discovery.

However, current `SharePointProvisioningService` contains live tenant-mutating methods and a site URL generator that does not match the frozen PCC URL rule. It should not be wired to the project-site template until Phase 2 produces a deterministic dry-run manifest and explicit mutation gates.

### Finding 5 — Repo convention strongly favors dry-run proof artifacts before mutation

Two strong repo patterns apply:

- Safety provisioning supports `dryRun` and produces diagnostics and would-create / would-update outcomes.
- The platform configuration registry runbook requires scripts/docs first, then dry-run, review of proof artifacts, then live execution only after a clean dry-run and independent validator.

Phase 2 should copy this pattern.

### Finding 6 — PCC README and PCC roadmap are missing from the requested paths

The requested files:

```text
docs/architecture/blueprint/sp-project-control-center/README.md
docs/architecture/blueprint/sp-project-control-center/Project_Control_Center_Development_Roadmap.md
```

were not found at the audited commit. This does not block Phase 2 planning, but it creates a governance/documentation gap. Phase 2 Step 1 should create a `phase-2/` planning index and recommend or generate a README update.

### Finding 7 — External SharePoint conventions support but do not override repo truth

Microsoft SharePoint documentation supports the overall direction that consistent site provisioning can be automated using site templates/site scripts and that PnP provisioning is a common reusable remote-provisioning pattern. Microsoft also introduced Microsoft Graph beta site creation with lower-permission site creation scope (`Sites.Create.All`) in late 2025. These are useful planning references only; repo truth still governs Phase 2 until a tool choice is explicitly closed.

## Phase 1 Output Readiness

| Readiness Item | Status | Evidence |
|---|---:|---|
| Phase 1 final gate commit exists | Confirmed | Commit `b34238c4192dee35ca142b172d545a71cd4214c2` |
| `fullExtractionComplete` true | Confirmed | `template-contract.json` |
| All 14 family schemas populated | Confirmed | `template-contract.json`, README, integrity report |
| Schema validation clean | Confirmed | `schema-validation-report.json` |
| Contract integrity clean | Confirmed | `contract-integrity-report.json` |
| Deterministic reports produced | Confirmed | Phase 1 Step 5 closeout |
| Phase 2 implementation not started | Confirmed | Phase 1 closeout and commit message |
| Procore boundary enforced | Confirmed | `integrations.schema.json`, integrity report |
| Runtime provisioning executor exists in package | Not present | Package intentionally has no runtime/provisioning dependency |

## Residual Phase 1 Limitations Phase 2 Must Account For

1. `template-contract.json.status.readiness` still reads `scaffold-only` even though full extraction is complete. That may be historical/stale terminology and should not be changed unless a Phase 2 prompt explicitly authorizes a documentation/status cleanup.
2. `packages/project-site-template/README.md` contains current Phase 1 completion text but also retains older scaffold-era sections such as “Current Status” and “Phase 1 Next Steps.” README cleanup is recommended.
3. `provisioning-validation` validates record shape only; it does not implement a provisioning runtime.
4. Rollback fields are optional/deferred; no project-site rollback executor exists.
5. No Phase 2 package, CLI, manifest generator, backend adapter, or dry-run artifact generator exists yet.
6. Existing backend `SharePointProvisioningService` has a project URL strategy and site type behavior that do not match the frozen PCC contract; it should be treated as existing infrastructure precedent, not drop-in PCC provisioning logic.
7. No CI gate for `@hbc/project-site-template validate:all` was confirmed as part of Phase 1; future consumption should add CI only after the consumer boundary is established.

## Recommended Conclusion

Phase 2 should proceed as a staged planning and local-consumer effort:

1. Document the boundary.
2. Create a local read-only consumer/planner package.
3. Generate deterministic dry-run plans.
4. Design mutation gates.
5. Only then introduce a non-production backend or local harness executor.
6. Defer production tenant mutation, SPFx PCC UI, and Procore runtime integration.
