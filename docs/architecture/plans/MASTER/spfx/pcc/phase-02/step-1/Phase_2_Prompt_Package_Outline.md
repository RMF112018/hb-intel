<!--
Planning package generated from repo-truth audit of RMF112018/hb-intel at commit b34238c4192dee35ca142b172d545a71cd4214c2.
Scope: Phase 2 planning only. No code implementation, repo mutation, tenant mutation, or provisioning execution.
Generated: 2026-04-28
-->

# Phase_2_Prompt_Package_Outline.md

# Phase 2 — Prompt Package Outline

## Package Objective

Create a staged prompt package for a local code agent that advances Phase 2 from planning to local deterministic template consumption without tenant mutation.

## Prompt 01 — Phase 2 Step 1: Provisioning Foundation Audit and Consumer Boundary Documentation

### Objective

Create the Phase 2 documentation foundation only. Do not implement code.

### Allowed Touch

```text
docs/architecture/blueprint/sp-project-control-center/phase-2/**
```

Optional only if explicitly approved:

```text
docs/architecture/blueprint/sp-project-control-center/README.md
```

### Forbidden Touch

```text
packages/project-site-template/template-contract.json
packages/project-site-template/schemas/**
packages/project-site-template/fields/**
backend/functions/**
apps/**
tools/**
.github/workflows/**
```

### Required Output

- `Phase_2_Step_1_Provisioning_Foundation_Audit_and_Consumer_Boundary.md`
- `Phase_2_Template_Consumer_Boundary.md`
- `Phase_2_Dry_Run_Manifest_Spec.md`
- `Phase_2_Tenant_Mutation_Gate.md`
- `Phase_2_Step_1_Closeout.md`

### Validation

- Confirm no code/schema/backend/SPFx/provisioning files changed.
- Confirm no tenant mutation.
- Confirm all docs reference baseline commit.
- Confirm next prompt is Step 2 local package scaffold.

## Prompt 02 — Phase 2 Step 2: Template Loader and Read-Only Consumer Package

### Objective

Create a local, deterministic, non-tenant-mutating template consumer package.

### Allowed Touch

```text
packages/project-site-provisioning/**
docs/architecture/blueprint/sp-project-control-center/phase-2/**
```

### Forbidden Touch

```text
backend/functions/**
apps/**
tools/pnp-runner-local/**
packages/project-site-template/schemas/**
packages/project-site-template/template-contract.json
```

### Required Constraints

- Do not re-read files already in current context unless necessary.
- No `@pnp/*`.
- No `@azure/functions`.
- No SPFx imports.
- No Procore runtime imports.
- No environment variables required for tests.
- No network calls.
- No tenant mutation.
- Use `@hbc/project-site-template` as source input or direct repo-relative path if package export is not yet available.

### Required Output

- package scaffold;
- loader;
- validator wrapper or validation invocation;
- normalized model builder;
- unit tests;
- README;
- closeout report.

## Prompt 03 — Phase 2 Step 3: Deterministic Provisioning Plan Generator

### Objective

Convert normalized template model into deterministic dry-run provisioning action manifest.

### Allowed Touch

```text
packages/project-site-provisioning/**
docs/architecture/blueprint/sp-project-control-center/phase-2/**
```

### Required Build

- action taxonomy;
- family-to-action translation;
- dependency ordering;
- idempotency keys;
- blocker model;
- deterministic manifest writer;
- fixture tests.

### Required Guardrails

- no tenant mutation;
- no Graph/PnP;
- no backend;
- no SPFx;
- no Procore runtime.

## Prompt 04 — Phase 2 Step 4: Dry-Run Validation Reports

### Objective

Generate deterministic proof artifacts for the dry-run manifest.

### Required Build

- JSON summary;
- markdown proof;
- action counts;
- blockers;
- warnings;
- Procore boundary proof;
- mutation gate status proof;
- byte-stability tests.

## Prompt 05 — Phase 2 Step 5: Tenant Mutation Gate Design

### Objective

Document and test the mutation gate contract before executor work.

### Allowed Touch

```text
docs/architecture/blueprint/sp-project-control-center/phase-2/**
packages/project-site-provisioning/**
```

### Required Build

- gate schema/model;
- required approvals;
- target tenant/site model;
- auth mode placeholders;
- rollbackRef;
- post-provision validator contract;
- “live mutation impossible by default” tests.

## Prompt 06 — Phase 2 Step 6: Initial Non-Production Provisioning Harness

### Objective

Only after Prompts 01–05 are complete and accepted, create an initial non-production executor adapter.

### Allowed Touch

To be decided after Prompt 05. Likely one of:

```text
backend/functions/src/services/project-site-provisioning/**
tools/project-site-provisioning/**
```

### Hard Gate

This prompt must not be run until:

- dry-run manifest is stable;
- mutation gate is documented;
- non-prod target is identified;
- human approval model is defined;
- rollback/repair path exists.

## Recommended Next Exact Prompt

```text
Phase 2 Step 1 — Provisioning Foundation Audit and Consumer Boundary Documentation

You are working in RMF112018/hb-intel at the current main branch, with Phase 1 closed by commit b34238c4192dee35ca142b172d545a71cd4214c2.

Objective:
Create documentation only for Phase 2 — Provisioning Foundation and Template Consumer Boundary. Do not implement code. Do not modify schemas. Do not create provisioning logic. Do not touch backend, SPFx, tools, workflows, package versions, or tenant state.

Allowed files:
- docs/architecture/blueprint/sp-project-control-center/phase-2/**

Required deliverables:
1. Phase_2_Step_1_Provisioning_Foundation_Audit_and_Consumer_Boundary.md
2. Phase_2_Template_Consumer_Boundary.md
3. Phase_2_Dry_Run_Manifest_Spec.md
4. Phase_2_Tenant_Mutation_Gate.md
5. Phase_2_Step_1_Closeout.md

Required content:
- prove Phase 1 complete;
- prove Phase 2 implementation has not started;
- identify the schema package boundary;
- define the template consumer, planner, dry-run generator, tenant executor, post-provision checker, site-health/repair loop, and SPFx/PCC UI consumer boundaries;
- define dry-run-first strategy;
- define tenant mutation gate;
- preserve Procore boundary;
- recommend `packages/project-site-provisioning/` as the proposed local planner package, but do not create it yet;
- identify missing README / roadmap documentation gap;
- include acceptance criteria and next prompt.

Forbidden:
- no code;
- no schema rewrites;
- no package.json changes;
- no backend;
- no SPFx;
- no Graph/PnP;
- no Procore runtime;
- no live tenant mutation.

Validation:
- show `git diff --name-only`;
- confirm only phase-2 markdown files changed;
- confirm no generated reports or package files changed;
- provide commit summary and description.
```
