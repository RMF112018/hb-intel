# Project Control Center Development Roadmap

## 1. Executive Summary

This roadmap converts the Project Control Center Target Architecture Blueprint and Standard Project Site Template Contract into an implementation sequence grounded in current repo truth.

Completed foundations are now in repo:

- Phase 0 complete (architecture stabilization and schema extraction planning).
- Phase 1 complete (`packages/project-site-template/` machine-readable contract package).
- Phase 2 complete (`packages/project-site-provisioning/` headless no-mutation provisioning boundary).
- Phase 3 Wave 1 complete (`packages/models/src/pcc/` shared PCC read-model foundations).

The next/current implementation wave is Phase 3 Wave 2: PCC SPFx shell-frame and UI/UX foundation. Wave 2 is active/in-progress: Prompt 02 scaffolded `apps/project-control-center/`, and subsequent Wave 2 prompts continue shell/frame/surface preview implementation with fixture-driven posture.

## 1A. Document Authority Split

- **Roadmap authority (this document):** implementation sequencing and current phase/wave execution status.
- **Blueprint authority:** architecture doctrine, product boundaries, and guardrails in [`HB_Project_Control_Center_Target_Architecture_Blueprint.md`](./HB_Project_Control_Center_Target_Architecture_Blueprint.md).
- **Implementation contract authority:** implementation-detail contract in [`Standard_Project_Site_Template_Contract.md`](./Standard_Project_Site_Template_Contract.md).

The recommended execution path is:

1. keep Phase 0/1/2 closeout boundaries frozen as completed foundations;
2. use Wave 1 shared PCC models as Wave 2 shell data foundation;
3. execute Wave 2 shell-frame UI/UX only (no backend/provisioning/tenant seams);
4. deliver governed Team & Access runtime and Document Control runtime in later phases;
5. expand to backend-read models and curated Procore summaries in later phases;
6. move into governance, adoption, analytics, and future enterprise expansion.

No code, schemas, backend files, SPFx packages, manifests, tests, or provisioning scripts are created by this roadmap. This is a documentation, audit, and planning artifact only.

---

## 2. Current Architecture Baseline

| Area                    | Baseline Finding                                                                   | Implementation Meaning                                            |
| ----------------------- | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Strategic architecture  | Defined in `HB_Project_Control_Center_Target_Architecture_Blueprint.md`            | Use as north-star context.                                        |
| Implementation contract | Defined in `Standard_Project_Site_Template_Contract.md`                            | Use as governing implementation source of truth.                  |
| Directory guide         | Added through `README.md`                                                          | Future agents have a navigation and guardrail entry point.        |
| ProjectType             | Frozen as five vertical values                                                     | Use only the frozen values in schemas and UI.                     |
| ProjectStage            | Frozen as six lifecycle values                                                     | Use for module visibility and workflow activation.                |
| ProjectStatus           | Frozen as four operational status values                                           | Use for archive/read-only/visibility behavior.                    |
| Procore model           | Defined through local model package                                                | Use for data-layer and integration decisions.                     |
| Team & Access           | Defined conceptually                                                               | Needs schema, backend workflow, and SPFx implementation.          |
| Control Center Settings | Defined conceptually                                                               | Needs schema, backend update rules, and SPFx implementation.      |
| Provisioning            | Headless no-mutation boundary implemented in `packages/project-site-provisioning/` | Executor/runtime path remains future and backend-scoped.          |
| SPFx PCC shell          | Wave 2 shell target locked at `apps/project-control-center/`                       | Target location is locked and app scaffold exists in repo truth.  |
| PCC shared models       | Implemented in `packages/models/src/pcc/`                                          | Wave 2 uses fixture/read-model posture first (`@hbc/models/pcc`). |
| Site health / drift     | Defined conceptually                                                               | Needs checks, severity model, repair flows, and audit records.    |

---

## 3. Key Audit Findings

### 3.1 Architecture Completeness

The blueprint and contract together define the major architectural components needed for PCC:

- project-site lifecycle;
- site identity and URL rules;
- project metadata;
- module map;
- standard pages;
- document libraries;
- SharePoint lists;
- permissions;
- Team & Access;
- Control Center Settings;
- Procore integration;
- site health and drift;
- MVP vs future scope;
- Decision Closure Register.

The missing bridge is not strategy; it is machine-readable implementation shape.

### 3.2 Internal Consistency

The documents are now largely consistent on the most important architecture rules:

- ProjectType, ProjectStage, and ProjectStatus are orthogonal;
- archive is a ProjectStatus value, not a lifecycle stage;
- Procore remains backend-routed;
- Sage Intacct remains the accounting book of record;
- Project Accountant is not the Procore mapping owner;
- normal users should not rely on native SharePoint settings/edit screens;
- Procore directory comparison does not grant SharePoint access.

### 3.3 Implementation Readiness

The documents are ready for:

- schema extraction planning;
- backlog decomposition;
- dependency mapping;
- provisioning design;
- SPFx shell planning;
- Procore MVP planning.

The documents are not yet ready for:

- direct provisioning implementation;
- direct SPFx component buildout;
- direct Procore sync implementation;
- direct permission automation;
- list schema generation without extraction rules.

### 3.4 Missing Dependencies

The following dependencies must be resolved or designed before implementation:

- machine-readable template contract structure;
- schema validation rules;
- provisioning command model;
- runtime configuration source for group IDs and environment values;
- SharePoint list/library field model;
- page and module registry model;
- permission template model;
- site-health severity model;
- repair workflow boundaries;
- Procore backend credential and Key Vault posture for future integration;
- adoption and operating support plan.

### 3.5 Ambiguous / Risk Areas

| Risk Area                       | Issue                                                                                 | Roadmap Response                                                                     |
| ------------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Blueprint vs contract authority | Blueprint is strategic, contract is implementable; conflict path needs discipline.    | README clarifies source-of-truth hierarchy.                                          |
| Large object catalog            | Contract defines a large list/library/module universe.                                | Phase 0 and Phase 1 require MVP scoping and schema extraction before implementation. |
| Team & Access complexity        | Permission templates, access managers, groups, and audit rules span multiple systems. | Team & Access is its own phase after shell foundation.                               |
| Procore breadth                 | Full Procore model package is broad.                                                  | MVP limits Procore to mapping, launch links, and sync health placeholder.            |
| User adoption                   | PCC fails if it feels like SharePoint administration.                                 | SPFx shell, settings, and Team & Access phases explicitly protect low-friction use.  |
| Site drift                      | Manual SharePoint edits can undermine standardization.                                | Site Health and repair posture remain core MVP requirements.                         |

---

## 4. Development Principles

| Principle                             | Meaning                                                                             |
| ------------------------------------- | ----------------------------------------------------------------------------------- |
| Contract-first                        | Implementation derives from the Standard Project Site Template Contract.            |
| One governed template family          | Do not create uncontrolled project-type-specific templates.                         |
| Conditional seeding, not forks        | ProjectType and ProjectStage drive rules inside the same template family.           |
| No native SharePoint admin dependency | Normal users operate through PCC UI.                                                |
| Least privilege                       | Access is template-governed and audited.                                            |
| Backend-routed integrations           | External APIs, including Procore, are routed through backend/functions.             |
| No secrets in docs or client surfaces | Secrets do not belong in markdown, SPFx, SharePoint, repo source, or client config. |
| Systems of record remain intact       | PCC summarizes and links; it does not silently replace Procore or Sage.             |
| Validate and repair                   | Provisioning must include site health, drift detection, audit, and repair paths.    |
| Adoption is a feature                 | Build for daily project-team use, not just technical compliance.                    |

---

## 5. Dependency Map

| Dependency                              | Required For                                       | Owner                         | Status                                                      |
| --------------------------------------- | -------------------------------------------------- | ----------------------------- | ----------------------------------------------------------- |
| Blueprint and contract consistency      | All implementation phases                          | Architecture                  | Mostly stable; Phase 0 verification required                |
| Schema extraction plan                  | Machine-readable contract                          | Architecture / Engineering    | Complete (Phase 0 closeout)                                 |
| Template schema package target          | Provisioning and SPFx consistency                  | Engineering                   | Complete (`packages/project-site-template/`)                |
| Provisioning command model              | Backend site creation workflow                     | Backend / IT                  | Phase 2 boundary complete; live executor deferred           |
| SharePoint list/library schema model    | Template application and validation                | Engineering / IT              | Planned (post-Wave 2 runtime phases)                        |
| Permission template model               | Team & Access                                      | Engineering / IT / Operations | Planned (post-Wave 2 runtime phases)                        |
| Runtime configuration registry          | Entra group IDs, tenant values, integration values | IT / Engineering              | Needed                                                      |
| People picker foundation                | Team & Access UI                                   | SPFx Engineering              | Existing foundation expected; needs reuse validation        |
| UI doctrine and SPFx surface standards  | PCC shell and modules                              | SPFx Engineering              | Existing repo standards                                     |
| Procore model package                   | Procore MVP and future integrations                | Architecture / Backend        | Exists                                                      |
| Key Vault / backend integration posture | Future Procore sync                                | IT / Backend                  | Future / proof-gated                                        |
| Wave 1 shared PCC models                | Wave 2 shell UI data posture                       | Platform Engineering          | Complete (`packages/models/src/pcc/`)                       |
| Wave 2 shell target path                | SPFx shell implementation location                 | SPFx Engineering              | Locked to `apps/project-control-center/` (scaffold present) |
| Adoption plan                           | Pilot and rollout                                  | Operations / IT               | Future                                                      |

---

## 6. Main Roadmap

| Phase                                                               | Priority | Business Value | Technical Dependency | Risk   | Complexity | Recommended Owner             | Prerequisites                                 | Acceptance Criteria                                                                                                                                                                             |
| ------------------------------------------------------------------- | -------- | -------------- | -------------------- | ------ | ---------- | ----------------------------- | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase 0 — Architecture Stabilization and Schema Extraction Planning | P0       | High           | Governing docs       | Medium | Medium     | Architecture                  | Complete                                      | Complete                                                                                                                                                                                        |
| Phase 1 — Machine-Readable Template Contract                        | P0       | High           | Phase 0              | High   | High       | Platform Engineering          | Complete                                      | Complete                                                                                                                                                                                        |
| Phase 2 — Provisioning Foundation Boundary                          | P0       | Very High      | Phase 1              | High   | High       | Backend / IT                  | Complete                                      | Complete boundary package; runtime executor deferred                                                                                                                                            |
| Phase 3 Wave 1 — Shared Foundations (`@hbc/models/pcc`)             | P0       | Very High      | Phase 1 / Phase 2    | Medium | High       | Platform Engineering          | Complete                                      | Complete                                                                                                                                                                                        |
| Phase 3 Wave 2 — PCC SPFx Shell Frame and UI/UX Foundation          | P1       | Very High      | Phase 3 Wave 1       | Medium | High       | SPFx Engineering              | Wave 1 closeout and scope lock                | Fixture-driven shell-frame with 8 MVP surfaces and required fallback states                                                                                                                     |
| Phase 4 — Team & Access Center                                      | P1       | Very High      | Phase 2 / Phase 3    | High   | High       | SPFx + Backend + IT           | Permission model; people picker               | Governed access workflow works without native SharePoint settings dependency                                                                                                                    |
| Phase 5 — Document Control Center MVP                               | P1       | High           | Phase 3              | Medium | Medium     | SPFx Engineering              | Library model; Graph posture                  | Two-lane delivery: Microsoft Files Lane enables governed file-management capabilities; External Document Systems Lane provides launch/deep-link/visibility without external document ownership. |
| Phase 6 — Startup / Permits / Inspections / Closeout MVP Modules    | P1       | High           | Phase 1 / Phase 3    | Medium | High       | Product + SPFx                | Workflow seed models                          | Core workflow modules render seeded project records and readiness rollups                                                                                                                       |
| Phase 7 — RACI Responsibility Matrix and Action Center              | P2       | High           | Phase 6              | Medium | High       | Product + SPFx + Backend      | Responsibility schema; seed normalization policy; contract-party classification model; internal RACI assignment model | Definition-complete governed matrix: seeded project-level RACI from `docs/reference/example/Responsibility Matrix - Template.xlsx` and `docs/reference/example/Responsibility Matrix - Owner Contract Template.xlsx`; governance-required legacy marker normalization (`X`, `Support`, `Review`, `Sign-Off`); Admin/PX/PM edit authority; role-aware responsibility/action views and traceable seed metadata (`workbook`, `sheet`, `row`, `family`, `version`) for later implementation planning. |
| Phase 8 — Procore MVP Integration                                   | P1       | High           | Phase 2 / Phase 3    | Medium | Medium     | Backend + SPFx                | Procore mapping schema                        | Procore mapping, launch links, sync health placeholder operate without direct SPFx API calls                                                                                                    |
| Phase 9 — Procore Recommended Practical Model                       | P2       | Very High      | Phase 8              | High   | Very High  | Backend + Data                | Key Vault; canonical store; subject area plan | Curated summaries and lineage records support operational dashboards                                                                                                                            |
| Phase 10 — Governance, Adoption, and Expansion                      | P2 / P3  | High           | MVP release          | Medium | High       | Operations + IT + Engineering | Pilot feedback                                | Rollout model, training, support, analytics, future modules defined                                                                                                                             |

---

### Phase 3 Wave 2 — PCC SPFx Shell Frame and UI/UX Foundation

#### Objective

Build the PCC shell-frame and operating-dashboard UI/UX foundation only.

#### Target

`apps/project-control-center/` (locked Wave 2 target location; scaffold present in repo truth).

#### Basis-of-Design Asset

`docs/reference/ui-kit/dashboard/dashboard-basis-of-design.png`

#### Includes

- command-center header with project identity and command/search zone;
- HB orange application navigation rail;
- flexible bento/masonry-style dashboard grid (no fixed equal-height row coupling);
- internal navigation over `PCC_MVP_SURFACE_IDS` (8 MVP surfaces);
- fixture-driven preview from `@hbc/models/pcc`;
- preview, empty, loading, error, missing-config, unavailable-fixture, unauthorized-persona states;
- accessibility and responsive behavior.

#### Excludes

- live backend APIs or route creation;
- live Graph/PnP calls;
- tenant mutation or provisioning executor work;
- Procore runtime/API/secrets/mirror/write-back;
- workflow execution, Site Health scan/repair execution;
- app catalog deployment, production rollout, CI/CD changes.

#### Acceptance Criteria

- shell renders from Wave 1 fixtures in `@hbc/models/pcc`;
- all 8 MVP surfaces are navigable;
- layout is flexible and avoids fixed paired-row equal-height constraints;
- basis-of-design direction is recognizable;
- required fallback states are present;
- no forbidden runtime seams are introduced.

### Wave 2 Decision Closures

| Decision Area         | Closed Position                                                                                  |
| --------------------- | ------------------------------------------------------------------------------------------------ |
| Shell location        | `apps/project-control-center/` is the locked target.                                             |
| Data posture          | Wave 1 fixtures/read models first; no live backend read-model API in Wave 2.                     |
| Authorization posture | Persona/capability metadata are display hints only, not authoritative auth.                      |
| Surface navigation    | Internal state/tab navigation is based on `PCC_MVP_SURFACE_IDS`.                                 |
| Layout                | Flexible bento/masonry dashboard with variable card footprints.                                  |
| Forbidden seams       | No backend/provisioning/tenant mutation/live Graph/PnP/Procore runtime/deploy changes in Wave 2. |

---

## 6A. Controlled Tenant-Hosted Validation Gates (Phase 3)

The first appropriate point to build the PCC `.sppkg` for hosted validation is **after Phase 3 Wave 4**, through:

- **Wave 4A — Controlled Non-Production Tenant SPPKG Visual Validation Gate**

Wave 4A is a controlled non-production tenant-hosted visual-validation gate only. It authorizes:

- PCC `.sppkg` build;
- approved non-production app-catalog or site-collection app-catalog upload/install actions;
- controlled SharePoint validation-page rendering to validate host behavior (canvas sizing, theme behavior, responsive layout, asset loading, and Project Home / Command Center visual quality).

Wave 4A does not imply functional completeness, formal readiness, or production rollout.

An optional follow-up gate may be used after Wave 5:

- **Wave 5A — Optional Controlled Tenant Revalidation After Priority Actions Rail**

Wave 5A is optional and is not the first hosted validation point. It exists only to revalidate hosted behavior after Wave 5 changes the landing experience.

For Wave 4A and Wave 5A:

- no broad tenant mutation is authorized; tenant activity is limited to approved non-production catalog/install actions and controlled validation-page actions required for visual validation;
- no production rollout;
- no production app-catalog deployment;
- no tenant-wide deployment unless explicitly approved;
- no unrelated site/page changes;
- no permission/group mutation;
- no provisioning execution;
- no live backend default cutover;
- no Azure Functions deployment or Azure service setup;
- no live Graph/PnP operational work beyond package/app validation commands;
- no Procore runtime, no Document Crunch runtime, and no Adobe Sign runtime;
- no Site Health scan/repair execution;
- no access execution;
- no approval execution;
- no workflow write-through.

Wave 20 remains the formal hardening and non-production readiness gate for doctrine validation, accessibility validation, full responsive validation, guardrail regression testing, documentation closeout, and readiness package preparation. Production rollout remains separately approved.

---

## 7. Recommended Immediate Next Steps

1. Confirm Prompt 01 repo-truth audit and scope lock remain satisfied as Wave 2 continues.
2. Keep `apps/project-control-center/` as the locked shell target while implementing subsequent Wave 2 preview prompts.
3. Continue Wave 2 shell-frame UI/UX preview implementation under fixture/read-model-first posture.
4. Keep Wave 2 data posture fixture/read-model-first through `@hbc/models/pcc`.
5. Do not introduce backend routes, provisioning executor work, tenant mutation, live Graph/PnP, or Procore runtime in Wave 2.
6. Preserve direct SPFx-to-Procore ban and no-secrets guardrails.

---

## 8. Validation Checklist

| Check                                                                   | Result |
| ----------------------------------------------------------------------- | ------ |
| References `Standard_Project_Site_Template_Contract.md`                 | Passed |
| References `HB_Project_Control_Center_Target_Architecture_Blueprint.md` | Passed |
| References `procore_hbintel_data_model_package/`                        | Passed |
| Includes phase/wave table with current statuses                         | Passed |
| Includes priorities                                                     | Passed |
| Includes dependencies                                                   | Passed |
| Includes risks                                                          | Passed |
| Includes Wave 2 boundaries and acceptance criteria                      | Passed |
| Includes Procore workstream                                             | Passed |
| Includes Team & Access sequencing                                       | Passed |
| Includes provisioning boundary status                                   | Passed |
| Confirms no code/schema/SPFx/backend changes required                   | Passed |
| Avoids invented secrets, credentials, tokens, or IDs                    | Passed |
