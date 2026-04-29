<!--
Planning package generated from repo-truth audit of RMF112018/hb-intel at commit b34238c4192dee35ca142b172d545a71cd4214c2.
Scope: Phase 2 planning only. No code implementation, repo mutation, tenant mutation, or provisioning execution.
Generated: 2026-04-28
-->

# Phase_2_Template_Consumer_Boundary.md

# Phase 2 — Template Consumer Boundary

## Purpose

This document defines the boundary between the validated project-site template contract and all downstream consumers. Its purpose is to prevent Phase 2 from collapsing contract validation, provisioning planning, tenant mutation, site-health repair, backend execution, SPFx rendering, and Procore integration into one unsafe implementation step.

## Boundary Summary

```text
Contract Package
  ↓
Template Consumer
  ↓
Provisioning Planner
  ↓
Dry-Run Artifact Generator
  ↓
Tenant Mutation Gate
  ↓
Future Tenant Executor
  ↓
Post-Provision Validator
  ↓
Site Health / Repair Loop
  ↓
SPFx / PCC UI Consumer
```

Only the first four layers are appropriate for early Phase 2. Tenant execution and SPFx consumption come later.

## Layer Definitions

### 1. Schema Package

Owner:

```text
packages/project-site-template/
```

Owns:

- `template-contract.json`
- root schema
- 14 family schemas
- field maps
- validation scripts
- deterministic validation reports
- package README/docs

Does not own:

- runtime provisioning;
- tenant mutation;
- SharePoint/Graph/PnP execution;
- backend HTTP routes;
- SPFx UI;
- Procore runtime integration;
- secret management.

Allowed Phase 2 change types:

- documentation update;
- validation harness defect fix;
- schema defect fix only if repo-truth contradiction is found;
- no provisioning dependencies.

### 2. Template Consumer

Proposed owner:

```text
packages/project-site-provisioning/
```

Owns:

- local loading of contract JSON;
- path resolution;
- validation invocation;
- family traversal;
- normalized read-only model construction;
- cross-family consistency checks.

Does not own:

- action execution;
- tenant discovery;
- tenant mutation;
- environment-variable-bound execution;
- backend routes.

Output:

```text
NormalizedProjectSiteTemplate
```

### 3. Provisioning Planner

Proposed owner:

```text
packages/project-site-provisioning/
```

Owns:

- mapping normalized template into ordered plan actions;
- assigning dependencies;
- assigning idempotency keys;
- identifying blockers;
- classifying actions as mutable, documentation-only, deferred, or proof-gated.

Does not own:

- Graph/PnP calls;
- SharePoint tenant writes;
- site existence checks;
- live permission assignment.

Output:

```text
ProjectSiteProvisioningPlan
```

### 4. Dry-Run Artifact Generator

Proposed owner:

```text
packages/project-site-provisioning/
```

Owns:

- deterministic JSON dry-run manifest;
- markdown dry-run proof report;
- blocker report;
- Procore boundary report;
- tenant mutation gate status report.

Does not own:

- live execution.

Output locations should be finalized by Phase 2 Step 1. Recommended:

```text
packages/project-site-provisioning/reports/
docs/architecture/blueprint/sp-project-control-center/phase-2/proof/
```

### 5. Tenant Mutation Executor

Future owner:

```text
backend/functions/
```

or a separately approved local harness under:

```text
tools/
```

Owns:

- actual Graph/PnP/SharePoint mutations;
- site creation;
- library/list/page/group/permission creation;
- audit records;
- app install;
- hub association;
- tenant-state inspection.

Does not own:

- interpretation of raw contract without a frozen manifest;
- Procore runtime integration during Phase 2;
- production mutation by default.

This layer is blocked until:

- dry-run manifest accepted;
- target tenant/site approved;
- auth posture approved;
- rollback strategy documented;
- human approval gate defined.

### 6. Validation / Post-Provision Checker

Future owner:

```text
backend/functions/
packages/project-site-provisioning/
```

depending on whether the check is local-only or tenant-read-only.

Owns:

- compare actual tenant state against manifest;
- validate created site, lists, fields, views, pages, groups, permissions, configuration records;
- produce post-provision report;
- feed site-health baseline.

Does not own:

- automatic repair unless separate repair gate is approved.

### 7. Site-Health / Repair Loop

Future owner:

```text
backend/functions/
apps/project-control-center/      # display only later
```

Owns:

- drift severity;
- repair tier classification;
- repair eligibility;
- operator-facing guidance;
- audit trail.

Does not own:

- silent repair;
- unapproved permission changes;
- Procore write-back.

### 8. SPFx / PCC UI Consumer

Future owner:

```text
apps/project-control-center/
apps/document-control-center/
```

Owns:

- showing project-site readiness;
- surfacing site-health;
- guided settings;
- team/access management UI;
- module navigation.

Does not own:

- provisioning execution;
- native SharePoint admin operations;
- direct Procore calls;
- secret handling.

## Contract Family to Provisioning Action Mapping

| Contract Family | Future Planner Output | Tenant Mutation? | Notes |
|---|---|---:|---|
| `template-manifest` | template metadata, version, source refs | No direct mutation | Drives reports and version records. |
| `enums` | validation constants | No direct mutation | Governs allowed values. |
| `settings` | configuration record plan | Yes, later | Some values are runtime config only; secrets excluded. |
| `permissions` | group/permission-template plan | Yes, later | Blocked until identity targets and approval gates close. |
| `site` | site identity/settings plan | Yes, later | URL/site type decision must be reconciled before mutation. |
| `pages` | page creation/config plan | Yes, later | SPFx page implementation deferred. |
| `libraries` | library creation/config plan | Yes, later | Must preserve sync/folder permission policy. |
| `lists` | list/field/view creation plan | Yes, later | Requires field translation rules. |
| `modules` | module registry/config plan | Yes, later | Visibility is `ProjectStage`-keyed only. |
| `workflows` | workflow seed records | Yes, later | No Power Automate implementation in early Phase 2. |
| `integrations` | placeholders/config/deep-link posture | Limited, later | Procore runtime is out of scope; placeholders only. |
| `site-health` | health check catalog and severity rules | No direct mutation in planner | Site health records later. |
| `provisioning-validation` | validation stage records | No direct mutation in planner | Defines audit/check record shape only. |
| `validation-rules` | planner checks and blocker categories | No direct mutation | Cross-layer rules cannot be schema-only. |

## Documentation / Configuration-Only Families

These should not directly mutate tenant state in Phase 2 Step 2 / Step 3:

- `template-manifest`
- `enums`
- `validation-rules`
- portions of `site-health`
- portions of `provisioning-validation`
- portions of `integrations` that are deferred, placeholder-only, or runtime-configuration only.

## Mutation Lock Requirements

Every dry-run manifest must carry:

```json
{
  "mutationLocked": true,
  "liveMutationAllowed": false,
  "requiresHumanApproval": true
}
```

No executor should accept a manifest unless:

- manifest was generated by the approved planner;
- manifest has a stable hash;
- manifest source commit is recorded;
- dry-run report exists;
- live run target is explicit;
- approval identity is recorded.

## Boundary Acceptance Rules

A Phase 2 implementation violates the boundary if it:

- adds `@pnp/*` to `@hbc/project-site-template`;
- adds Azure Functions dependencies to `@hbc/project-site-template`;
- adds SPFx dependencies to `@hbc/project-site-template`;
- directly creates a SharePoint site from the template package;
- calls Procore from SPFx;
- stores or references Procore secrets in repo;
- generates live mutation scripts before dry-run manifest spec is approved;
- treats placeholder Procore OC-17 / OC-18 rows as full canonical Procore mirror records;
- introduces schema rewrites without defect evidence;
- starts `apps/project-control-center/` before backend/provisioning boundaries are settled.
