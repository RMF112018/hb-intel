# Phase 3 Wave 1 — Repo-Truth Audit Summary

## Purpose

This file records the audit basis used to generate the **Phase 3 Wave 1 — PCC Shared Foundations Prompt Package**. It does not implement code. It is a planning artifact for a local coding agent or future ChatGPT session.

## Audit Scope

The audit reviewed the available live repo evidence for:

- Project Control Center architecture and roadmap sources.
- Phase 0, Phase 1, and Phase 2 PCC closeout posture.
- `@hbc/project-site-template` contract/schema/validation boundary.
- `@hbc/project-site-provisioning` no-mutation mapper/proof boundary.
- Existing shared model, auth, audit, fixture, backend, and workspace patterns.
- SPFx and backend boundary implications relevant to Wave 1.

## Important Mismatch

The requested exact Phase 3 directory and files were not found on `main` during this audit:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/README.md
docs/architecture/blueprint/sp-project-control-center/phase-3/01_PCC_Product_Architecture_and_User_Journey_Blueprint.md
docs/architecture/blueprint/sp-project-control-center/phase-3/02_PCC_SPFx_Shell_Design_Spec.md
docs/architecture/blueprint/sp-project-control-center/phase-3/03_PCC_Backend_Service_Contract_Design.md
docs/architecture/blueprint/sp-project-control-center/phase-3/04_PCC_Admin_Workflow_Readiness_Model.md
docs/architecture/blueprint/sp-project-control-center/phase-3/05_Phase_3_Development_Roadmap_Updated.md
docs/architecture/blueprint/sp-project-control-center/phase-3/06_Phase_3_Closeout.md
docs/architecture/blueprint/sp-project-control-center/phase-3/07_Phase_3_Module_Implementation_Plan.md
docs/architecture/blueprint/sp-project-control-center/phase-3/Register_Human_Decision_Register.md
docs/architecture/blueprint/sp-project-control-center/phase-3/Register_Interface_Assumptions.md
docs/architecture/blueprint/sp-project-control-center/phase-3/Register_Open_Decisions.md
docs/architecture/blueprint/sp-project-control-center/phase-3/Register_MVP_Scope.md
docs/architecture/blueprint/sp-project-control-center/phase-3/Register_Workflow_Module_Register.md
```

Closest available current sources were used instead:

```text
docs/architecture/blueprint/sp-project-control-center/README.md
docs/architecture/blueprint/sp-project-control-center/Standard_Project_Site_Template_Contract.md
docs/architecture/blueprint/sp-project-control-center/HB_Project_Control_Center_Target_Architecture_Blueprint.md
docs/architecture/blueprint/sp-project-control-center/Project_Control_Center_Development_Roadmap.md
docs/architecture/blueprint/sp-project-control-center/phase-0/**
docs/architecture/blueprint/sp-project-control-center/phase-1/**
docs/architecture/blueprint/sp-project-control-center/phase-2/**
packages/project-site-template/**
packages/project-site-provisioning/**
packages/models/**
backend/functions/**
package.json
pnpm-workspace.yaml
turbo.json
tsconfig.base.json
```

Prompt 01 requires the executing agent to re-check this mismatch before any code work.

## Repo-Truth Findings

### 1. PCC architecture source-of-truth posture

- The PCC directory README identifies the Standard Project Site Template Contract as the implementable source of truth and the Target Architecture Blueprint as the strategic source.
- Phase 2 is marked complete and Phase 3 planning readiness is marked ready.
- PCC implementation code should not be created directly from blueprint language alone.
- Future SPFx PCC shell is identified as `apps/project-control-center/` once created.
- Future provisioning implementation belongs under `backend/functions/` when authorized.

### 2. Phase 1 package boundary

`@hbc/project-site-template` is a schema/contract/validation package.

Current posture:

- Derivative of the Standard Project Site Template Contract.
- Validation harness exists.
- Full extraction is marked complete.
- It must remain schema/contract/validation-only.
- It must not become a runtime/shared TypeScript model package.
- It must not introduce SPFx, backend, Graph, PnP, tenant mutation, Procore runtime, or secrets.

### 3. Phase 2 package boundary

`@hbc/project-site-provisioning` is a deterministic mapper/planner/proof package.

Current posture:

- Consumes `@hbc/project-site-template`.
- Produces mutation-locked manifests and dry-run proof artifacts.
- Includes no-secret, no-Procore-mirror, and no-tenant-mutation scans.
- Includes apply-gate and drift/repair posture contracts.
- No tenant mutation.
- No Graph/PnP calls.
- No SPFx runtime.
- No Procore runtime.
- Future executor adapter belongs under `backend/functions/`, not inside this package.

### 4. Shared model package pattern

`@hbc/models` is the repo's canonical shared TypeScript model package.

Current posture:

- Contains domain folders under `packages/models/src/<domain>/`.
- Exports domain models through `packages/models/src/index.ts`.
- Supports root and subpath exports.
- Has package-local `build`, `check-types`, `lint`, and `test` scripts.
- Is already consumed by `backend/functions`.
- Contains existing `project`, `auth`, `audit`, `provisioning`, and `admin-control-plane` domains.
- Is the best current candidate for PCC shared foundations unless Wave 0 explicitly chooses a new package.

### 5. Existing role and audit patterns

Existing reusable role/audit patterns include:

- `packages/models/src/auth/ProjectRoles.ts`, with project-scoped role types and registries.
- `packages/models/src/audit/IAuditRecord.ts`, with a generic audit record shape.
- These are useful patterns, but PCC-specific business workflow types should not overwrite or silently reinterpret existing project enums.

### 6. Existing status enum conflict

Existing `packages/models/src/project/ProjectEnums.ts` has legacy status values that do not align cleanly with the PCC contract's `ProjectStatus` values:

```text
PCC contract: Active, On Hold, Closed, Archived
Existing ProjectStatus enum: Active, OnHold, Completed, Cancelled
```

Wave 1 should define PCC-specific project status/stage/type aliases in a PCC namespace or folder, rather than modifying the legacy project enum casually.

### 7. Backend-safe shared boundary

`backend/functions` imports `@hbc/models`, uses shared admin-control-plane models, and has established backend patterns for:

- `withAuth()`
- `requireAdmin` / delegated-scope guards
- Zod request validation
- standardized response helpers
- request ID propagation
- audit/evidence persistence
- readiness/health routes
- admin control-plane routes

Wave 1 should not implement backend routes or APIs, but the shared models should remain safe for backend consumption.

### 8. SPFx-safe shared boundary

Wave 1 shared models must not import:

- `@microsoft/sp-*`
- PnP packages
- Azure SDK packages
- backend runtime packages
- Procore SDKs or HTTP clients
- tenant-specific runtime configuration

The shared foundation should be pure TypeScript models/constants/fixtures/tests.

### 9. Fixture and no-mutation patterns

- `@hbc/project-site-template` uses validation fixtures for schema validation.
- `@hbc/project-site-provisioning` uses deterministic proof fixtures and no-mutation scan utilities.
- Wave 1 can safely introduce deterministic PCC fixtures if code is authorized, but those fixtures should live beside PCC shared models unless Wave 0 chooses a different location.
- Importing the provisioning package directly into SPFx/shared PCC models is not recommended unless Prompt 01 explicitly proves the dependency boundary is acceptable.

## Audit Questions Answered

| Question | Repo-Truth Answer |
|---|---|
| Where should Wave 1 shared foundation code live? | Recommended interim location: `packages/models/src/pcc/`, because `@hbc/models` is the repo's canonical shared model package and is backend-consumed. |
| Existing shared package or new package? | Existing package is recommended. New package would require workspace/path/export decisions and should be treated as an open decision. |
| App-local model folder? | Not recommended. PCC foundations must be shared by later modules, SPFx, and backend. |
| Backend/shared model package? | Yes, `@hbc/models` is already backend-safe and consumed by `backend/functions`. |
| Documentation-only until Wave 0 gate? | Yes. Prompt 01 must confirm Wave 1 code authorization before Prompt 02+ modify code. |
| Existing naming conventions? | Domain folders under `packages/models/src/<domain>/`; barrel exports; `I*` interfaces in some domains; type aliases and constants; tests under `src/**/*.test.ts`. |
| Existing fixture pattern? | Yes in `@hbc/project-site-template` validation fixtures and `@hbc/project-site-provisioning` proof baseline. Use deterministic non-secret fixture constants for PCC. |
| Feature flag/module registry pattern? | Existing feature/cohort patterns appear in auth/shell, but no PCC-specific registry exists. Wave 1 should define model-level module flags only. |
| Role/persona/auth pattern? | `ProjectRole` and related registries exist under `packages/models/src/auth/`. PCC can reuse or map to those without mutating them. |
| Business audit/event pattern? | Generic `IAuditRecord` exists; PCC should define workflow/business audit types separately. |
| No-mutation guard pattern? | Strong pattern exists in `@hbc/project-site-provisioning`; Wave 1 should add pure guard tests or document reuse only if dependency boundaries allow. |
| SPFx-safe shared boundary? | Use pure TypeScript and avoid SPFx/backend/runtime imports. |
| Backend-safe shared boundary? | `@hbc/models` is safe and already imported by backend. |
| Safe before Wave 2/3? | Pure models, registries, fixture constants, flags, and guard tests after Prompt 01 confirms code authorization. |
| Stub/document only before gate? | Anything requiring shell UI, backend APIs, tenant access, repair execution, Graph/PnP, Procore runtime, or live feature-flag runtime. |
| Validation commands? | `git status --short`; `pnpm --filter @hbc/models check-types`; `pnpm --filter @hbc/models test`; `pnpm --filter @hbc/models build`; `pnpm --filter @hbc/models lint` where relevant. |
| Files allowed? | Primarily `packages/models/src/pcc/**`, `packages/models/src/index.ts`, package-local tests/docs, and Phase 3 Wave 1 docs after Prompt 01. |
| Files forbidden? | `apps/**`, `backend/functions/**`, `packages/project-site-template/**`, `packages/project-site-provisioning/**`, manifests, app catalog artifacts, deployment workflows, tenant/provisioning runners, package version bumps unless explicitly authorized. |

## Recommendation

Wave 1 should be implemented as **PCC shared foundations in `@hbc/models`**, under a new `packages/models/src/pcc/` domain, after a no-code Prompt 01 scope lock confirms:

1. the exact Phase 3 planning documents or their absence;
2. code authorization;
3. final package path;
4. export strategy;
5. validation commands.

Wave 1 should not create UI screens, backend routes, tenant mutations, provisioning executor work, direct Procore runtime paths, or deployment changes.
