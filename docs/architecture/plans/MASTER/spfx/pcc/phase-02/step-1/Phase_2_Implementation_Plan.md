<!--
Planning package generated from repo-truth audit of RMF112018/hb-intel at commit b34238c4192dee35ca142b172d545a71cd4214c2.
Scope: Phase 2 planning only. No code implementation, repo mutation, tenant mutation, or provisioning execution.
Generated: 2026-04-28
-->

# Phase_2_Implementation_Plan.md

# Phase 2 — Provisioning Foundation Implementation Plan

## Objective

Define and implement the first safe provisioning foundation for the HB Standard Project Site Template by consuming the validated `@hbc/project-site-template` contract through a deterministic, local, non-tenant-mutating planning layer.

Phase 2 must not begin by provisioning SharePoint. It must start by proving that the contract can be loaded, validated, normalized, translated into a stable provisioning manifest, and reported as a dry-run artifact without Graph, PnP, SharePoint, Procore, backend routes, or SPFx UI execution.

## Current Repo Baseline

- Baseline commit: `b34238c4192dee35ca142b172d545a71cd4214c2`
- Phase 1 status: complete.
- Phase 2 status: not started.
- Current package: `@hbc/project-site-template`
- Current package version: `0.1.0`
- Current package type: schema/contract package, not executor.
- Current monorepo package manager: `pnpm@10.13.1`
- Workspace structure includes:
  - `apps/*`
  - `packages/*`
  - `packages/features/*`
  - `backend/*`
  - `tools/*`

## Phase 1 Outputs Available for Consumption

| Output | Location | Phase 2 Use |
|---|---|---|
| Root machine-readable contract | `packages/project-site-template/template-contract.json` | Primary input to consumer/planner. |
| Root contract schema | `packages/project-site-template/schemas/template-contract.schema.json` | Validation gate before planning. |
| 14 family schemas | `packages/project-site-template/schemas/families/` | Family-level validation and normalized model typing. |
| Field maps | `packages/project-site-template/fields/` | Translation input for SharePoint list/library/field planning. |
| Validation harness | `packages/project-site-template/validation/` | Reuse or invoke before any consumer plan generation. |
| Deterministic reports | `packages/project-site-template/validation/reports/` | Baseline proof that the package is clean before Phase 2. |
| Phase 1 closeout | `docs/architecture/blueprint/sp-project-control-center/phase-1/Phase_1_Step_5_Schema_Validation_Harness_Closeout.md` | Entry gate for Phase 2. |

## Phase 2 Scope

Phase 2 includes:

- Phase 2 documentation and consumer-boundary definition.
- Local contract loading.
- Schema validation reuse.
- Normalized in-memory template model.
- Deterministic provisioning manifest generation.
- Dry-run-only reporting.
- Explicit mutation lock / tenant gate design.
- Provisioning action taxonomy.
- Mapping of contract families to future SharePoint/Graph/PnP actions.
- Post-provision validation model design.
- Site-health and repair-loop planning.
- Prompt package for staged code-agent execution.

## Explicitly Out of Scope

Phase 2 Step 1 and Step 2 must not include:

- live SharePoint/Graph/PnP tenant mutation;
- site creation;
- list/library creation;
- group creation;
- permission assignment;
- SPFx Project Control Center implementation;
- backend route implementation;
- Procore runtime integration;
- Procore secrets;
- Procore write-back;
- full Procore mirror;
- external user enablement;
- schema rewrites unless a specific defect is found;
- production deployment;
- tenant app catalog deployment;
- Power Automate provisioning.

## Recommended Architecture

```text
Phase 2 local path

packages/project-site-template/
  └─ schema + contract + validation harness only

packages/project-site-provisioning/        # proposed new package
  ├─ src/loadTemplateContract.ts            # local loader
  ├─ src/validateTemplateContract.ts        # invokes/reuses validation
  ├─ src/normalizeTemplateModel.ts          # canonical normalized model
  ├─ src/buildProvisioningPlan.ts           # ordered non-mutating plan
  ├─ src/writeDryRunReport.ts               # deterministic proof artifacts
  ├─ src/types.ts                           # planner-only types
  ├─ validation/fixtures/                   # planner fixtures
  └─ reports/                               # generated/ignored except approved proofs

docs/architecture/blueprint/sp-project-control-center/phase-2/
  ├─ Phase_2_Step_1_Provisioning_Foundation_Audit_and_Consumer_Boundary.md
  ├─ Phase_2_Template_Consumer_Boundary.md
  ├─ Phase_2_Dry_Run_Manifest_Spec.md
  ├─ Phase_2_Tenant_Mutation_Gate.md
  └─ Phase_2_Closeout.md

backend/functions/                         # future only after gates
  └─ src/services/project-site-provisioning-*   # future executor adapter
```

## Proposed Package / Folder Ownership

### Keep `packages/project-site-template` as schema-only

Do not add Graph, PnP, SharePoint, Procore, SPFx, Azure Functions, or tenant execution dependencies to `@hbc/project-site-template`.

Allowed future changes:

- documentation updates;
- validation harness refinements;
- schema defect remediation;
- generated deterministic validation reports.

### Add `packages/project-site-provisioning` for local planner/consumer

This should be a headless package similar in spirit to `@hbc/provisioning` but narrower and safer:

- no UI;
- no tenant mutation;
- no backend route exports;
- no PnP/Graph dependencies in Step 2 / Step 3;
- consumes `@hbc/project-site-template`;
- outputs deterministic manifest and reports;
- testable with local fixtures.

### Use `backend/functions` only after mutation gates

The backend is the eventual execution boundary because the contract and blueprint identify backend functions as the provisioning authority. However, backend implementation should start only after the local manifest is stable and mutation gates are approved.

## Template Consumer Boundary

| Layer | Owns | Must Not Own |
|---|---|---|
| Schema package | Source contract JSON, schemas, field maps, validation harness | Provisioning execution, Graph, PnP, backend routes, SPFx, Procore runtime |
| Template consumer | Load/validate contract, resolve paths, normalize family data | Create tenant actions or call SharePoint |
| Provisioning planner | Convert normalized model into ordered action manifest | Execute actions |
| Dry-run artifact generator | Deterministic reports, warnings, blockers, would-create/would-update actions | Tenant mutation |
| Tenant executor | Future Graph/PnP/SharePoint mutation | Schema interpretation without frozen manifest |
| Post-provision checker | Read-only validation of actual tenant state vs manifest | Unapproved repair |
| Site-health / repair loop | Drift classification and approved repair recommendations | Silent mutation |
| SPFx/PCC UI consumer | Display project/site health/status/settings | Direct Procore calls, native SharePoint admin bypass, tenant provisioning execution |

## Provisioning Safety Model

Phase 2 safety defaults:

- default mode is local and read-only;
- dry-run is required before any mutation;
- tenant mutation must be impossible unless an explicit executor is invoked with approved parameters;
- environment variables must not be needed for local manifest generation;
- no secrets in repo;
- no Procore runtime or credentials;
- all generated artifacts must be deterministic;
- all live execution must emit proof artifacts;
- all mutation must be idempotency-keyed and auditable.

## Dry-Run First Strategy

The dry-run manifest should answer:

1. What would be created?
2. What would be updated or repaired?
3. What is already satisfied?
4. What cannot be planned from current contract data?
5. What tenant-specific values are required but unavailable?
6. Which actions are blocked by missing gates?
7. Which actions are documentation/config only and must not mutate tenant state?

Recommended manifest top-level shape:

```json
{
  "manifestVersion": "0.1.0",
  "sourceCommit": "b34238c4192dee35ca142b172d545a71cd4214c2",
  "templateVersion": "1.0.0-proposed",
  "mode": "dry-run",
  "mutationLocked": true,
  "target": {
    "tenant": null,
    "siteUrl": null,
    "environment": "local"
  },
  "actions": [],
  "blockers": [],
  "warnings": [],
  "procoreBoundary": {
    "runtimeIntegration": false,
    "secretsAllowed": false,
    "fullMirrorAllowed": false
  }
}
```

## Step-by-Step Implementation Sequence

### Phase 2 Step 1 — Provisioning Foundation Audit and Consumer Boundary

Type: documentation-only.

Allowed touch:

- `docs/architecture/blueprint/sp-project-control-center/phase-2/**`
- optionally README update recommendation only; do not touch schema/package code.

Deliverables:

- Phase 2 entry audit.
- Template consumer boundary.
- Mutation gate.
- Dry-run manifest spec.
- initial risk register and backlog.

Exit criteria:

- no code changes;
- no schema changes;
- no backend/SPFx/provisioning implementation;
- accepted consumer boundary.

### Phase 2 Step 2 — Template Loader and Read-Only Consumer

Type: local code, no tenant.

Recommended touch:

- create `packages/project-site-provisioning/`
- add package-local tests/fixtures
- add package-local README
- do not modify backend functions.

Build:

- load `packages/project-site-template/template-contract.json`;
- resolve family schemas and field maps;
- invoke/reuse `@hbc/project-site-template validate:all`;
- produce normalized read-only model.

Exit criteria:

- local tests pass;
- deterministic output;
- no Graph/PnP/SPFx/backend dependencies;
- no tenant env vars required.

### Phase 2 Step 3 — Deterministic Provisioning Plan Generator

Type: local code, no tenant.

Build:

- action taxonomy:
  - `create-site`
  - `configure-site-settings`
  - `create-page`
  - `create-library`
  - `create-list`
  - `create-field`
  - `create-view`
  - `create-group`
  - `assign-permission`
  - `seed-configuration-record`
  - `seed-module-record`
  - `seed-workflow-template`
  - `seed-integration-placeholder`
  - `create-site-health-record`
  - `validate-post-provision`
  - `documentation-only`
  - `deferred`
  - `blocked-by-gate`
- dependency ordering;
- idempotency keys;
- deterministic manifest writer.

Exit criteria:

- same input produces byte-identical manifest;
- contract families map to action families without tenant access;
- unplannable items become blockers, not assumptions.

### Phase 2 Step 4 — Dry-Run Validation Reports

Type: local code/reporting, no tenant.

Build:

- markdown dry-run proof report;
- JSON dry-run summary;
- blocker summary;
- Procore boundary summary;
- tenant mutation gate status summary.

Exit criteria:

- reports deterministic;
- no timestamps unless explicitly excluded from byte-stable proof;
- reports can be committed or ignored per repo policy.

### Phase 2 Step 5 — Tenant Mutation Gate Design

Type: documentation and test harness design.

Define:

- approved target tenant;
- approved target non-production site or site collection;
- required env vars;
- authentication mode;
- Graph/PnP split;
- human approval;
- run ID/correlation ID;
- rollbackRef;
- mutation lock semantics;
- independent post-run validator.

Exit criteria:

- executor cannot run without explicit gate inputs;
- no production mutation path exists by default;
- no secrets in repo/config.

### Phase 2 Step 6 — Initial Non-Production Provisioning Harness

Type: future implementation only after Steps 1–5.

Build:

- adapter that consumes frozen dry-run manifest;
- non-production only;
- live mode requires explicit flag and approved target;
- proof artifact emitted before and after execution;
- independent validator required.

Exit criteria:

- one controlled non-production run;
- no production target;
- no Procore runtime;
- rollback/repair notes captured.

### Phase 2 Step 7 — Post-Provision Validation / Site Health Integration

Type: future implementation after non-prod harness.

Build:

- read-only tenant-state comparison;
- site health record generation;
- repair classification;
- no automatic repair unless separate approval.

Exit criteria:

- drift detected and classified;
- repair path documented;
- no silent mutation.

## Validation Gates

Before any Phase 2 plan generation:

- `pnpm --filter @hbc/project-site-template validate:all`
- `node packages/project-site-template/validation/validate-template-contract.mjs`
- `node packages/project-site-template/validation/contract-integrity-checks.mjs`

Before any consumer package merge:

- package-local unit tests;
- deterministic output test;
- no dependency on `@pnp/*`, `@azure/functions`, SPFx, Procore, or SharePoint in Step 2 / Step 3;
- no secret-class fields;
- no mutation code.

Before any backend executor:

- manifest schema frozen;
- dry-run manifest accepted;
- mutation gate accepted;
- target tenant/site approved;
- auth posture approved;
- rollback/repair posture accepted.

## Tenant Mutation Gates

Live tenant mutation is blocked unless all gates are true:

| Gate | Required Before Mutation |
|---|---|
| Dry-run accepted | A clean dry-run report exists and was reviewed. |
| Target confirmed | Tenant, site URL, environment, and purpose are explicit. |
| Auth confirmed | Managed identity, Graph, PnP, or local PnP runner posture is approved. |
| Human approval | Named owner approves the run. |
| Secrets policy | No secrets in repo or SharePoint config. |
| Idempotency | Every action has stable idempotency key. |
| Rollback | RollbackRef or manual rollback runbook exists. |
| Post-provision validation | Independent validator exists. |
| Site-health write path | Site health/audit storage target is defined. |
| Procore boundary | No Procore runtime, secrets, writeback, or full mirror. |
| Production lock | Production mode defaults to disabled. |

## Risks and Open Decisions

Primary risks:

- missing PCC README and roadmap file;
- existing backend project-site creation logic conflicts with frozen PCC naming/site posture;
- mutation could occur prematurely if current backend mutators are reused directly;
- `template-contract.json.status.readiness` may confuse consumers;
- rollback and repair are not implementation-ready;
- auth model for PCC provisioning is not yet closed;
- Procore scope creep could compromise boundaries.

See `Phase_2_Risk_Register.md`.

## Recommended Next Prompt

Run:

```text
Phase 2 Step 1 — Provisioning Foundation Audit and Consumer Boundary Documentation
```

The next prompt should instruct the local code agent to create planning documents only under:

```text
docs/architecture/blueprint/sp-project-control-center/phase-2/
```

It must not create runtime provisioning code, backend routes, SPFx code, Graph/PnP logic, Procore integration, or tenant mutation scripts.

## Acceptance Criteria

The Phase 2 plan is acceptable only if:

- Phase 1 completion is explicitly proven.
- Phase 2 implementation is explicitly confirmed as not started.
- Exact audited files are listed.
- Repo-truth references are included.
- `packages/project-site-template` remains schema-only.
- A proposed ownership location exists for Phase 2 planner code.
- Dry-run-first strategy is mandatory.
- Default posture is no live tenant mutation.
- Tenant mutation gate is explicit.
- Rollback/repair planning path exists.
- Procore runtime implementation remains out of scope.
- No schema rewrite occurs unless a defect is found.
- No SPFx implementation occurs in Phase 2 Step 1.
- No backend implementation occurs until consumer boundary is defined.
- Prompt package outline exists for local code-agent execution.
