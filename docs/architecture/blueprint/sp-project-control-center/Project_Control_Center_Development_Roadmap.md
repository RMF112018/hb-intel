# Project Control Center Development Roadmap

## 1. Executive Summary

This roadmap converts the Project Control Center Target Architecture Blueprint and Standard Project Site Template Contract into an implementation sequence.

The governing architecture is strong enough to begin planning and schema extraction, but it is not yet ready for direct backend, SPFx, or provisioning implementation. The next correct step is to convert the human-readable contract into machine-readable template artifacts and a validated dependency backlog.

The recommended execution path is:

1. stabilize architecture and schema extraction planning;
2. convert the contract into structured template models;
3. build the provisioning foundation;
4. build the Project Control Center SPFx shell;
5. deliver governed Team & Access;
6. deliver Document Control;
7. deliver core workflow modules;
8. add Procore mapping and launch-link MVP;
9. expand to curated Procore operational summaries;
10. move into governance, adoption, analytics, and future enterprise expansion.

No code, schemas, backend files, SPFx packages, manifests, tests, or provisioning scripts are created by this roadmap. This is a documentation, audit, and planning artifact only.

---

## 2. Current Architecture Baseline

| Area | Baseline Finding | Implementation Meaning |
|---|---|---|
| Strategic architecture | Defined in `HB_Project_Control_Center_Target_Architecture_Blueprint.md` | Use as north-star context. |
| Implementation contract | Defined in `Standard_Project_Site_Template_Contract.md` | Use as governing implementation source of truth. |
| Directory guide | Added through `README.md` | Future agents have a navigation and guardrail entry point. |
| ProjectType | Frozen as five vertical values | Use only the frozen values in schemas and UI. |
| ProjectStage | Frozen as six lifecycle values | Use for module visibility and workflow activation. |
| ProjectStatus | Frozen as four operational status values | Use for archive/read-only/visibility behavior. |
| Procore model | Defined through local model package | Use for data-layer and integration decisions. |
| Team & Access | Defined conceptually | Needs schema, backend workflow, and SPFx implementation. |
| Control Center Settings | Defined conceptually | Needs schema, backend update rules, and SPFx implementation. |
| Provisioning | Defined as target lifecycle | Needs backend implementation and validation model. |
| SPFx PCC shell | Defined as future app | Needs app creation and UI doctrine alignment. |
| Site health / drift | Defined conceptually | Needs checks, severity model, repair flows, and audit records. |

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

| Risk Area | Issue | Roadmap Response |
|---|---|---|
| Blueprint vs contract authority | Blueprint is strategic, contract is implementable; conflict path needs discipline. | README clarifies source-of-truth hierarchy. |
| Large object catalog | Contract defines a large list/library/module universe. | Phase 0 and Phase 1 require MVP scoping and schema extraction before implementation. |
| Team & Access complexity | Permission templates, access managers, groups, and audit rules span multiple systems. | Team & Access is its own phase after shell foundation. |
| Procore breadth | Full Procore model package is broad. | MVP limits Procore to mapping, launch links, and sync health placeholder. |
| User adoption | PCC fails if it feels like SharePoint administration. | SPFx shell, settings, and Team & Access phases explicitly protect low-friction use. |
| Site drift | Manual SharePoint edits can undermine standardization. | Site Health and repair posture remain core MVP requirements. |

---

## 4. Development Principles

| Principle | Meaning |
|---|---|
| Contract-first | Implementation derives from the Standard Project Site Template Contract. |
| One governed template family | Do not create uncontrolled project-type-specific templates. |
| Conditional seeding, not forks | ProjectType and ProjectStage drive rules inside the same template family. |
| No native SharePoint admin dependency | Normal users operate through PCC UI. |
| Least privilege | Access is template-governed and audited. |
| Backend-routed integrations | External APIs, including Procore, are routed through backend/functions. |
| No secrets in docs or client surfaces | Secrets do not belong in markdown, SPFx, SharePoint, repo source, or client config. |
| Systems of record remain intact | PCC summarizes and links; it does not silently replace Procore or Sage. |
| Validate and repair | Provisioning must include site health, drift detection, audit, and repair paths. |
| Adoption is a feature | Build for daily project-team use, not just technical compliance. |

---

## 5. Dependency Map

| Dependency | Required For | Owner | Status |
|---|---|---|---|
| Blueprint and contract consistency | All implementation phases | Architecture | Mostly stable; Phase 0 verification required |
| Schema extraction plan | Machine-readable contract | Architecture / Engineering | Not started |
| Template schema package target | Provisioning and SPFx consistency | Engineering | Planned as `packages/project-site-template/` |
| Provisioning command model | Backend site creation workflow | Backend / IT | Not started |
| SharePoint list/library schema model | Template application and validation | Engineering / IT | Not started |
| Permission template model | Team & Access | Engineering / IT / Operations | Not started |
| Runtime configuration registry | Entra group IDs, tenant values, integration values | IT / Engineering | Needed |
| People picker foundation | Team & Access UI | SPFx Engineering | Existing foundation expected; needs reuse validation |
| UI doctrine and SPFx surface standards | PCC shell and modules | SPFx Engineering | Existing repo standards |
| Procore model package | Procore MVP and future integrations | Architecture / Backend | Exists |
| Key Vault / backend integration posture | Future Procore sync | IT / Backend | Future / proof-gated |
| Adoption plan | Pilot and rollout | Operations / IT | Not started |

---

## 6. Main Roadmap

| Phase | Priority | Business Value | Technical Dependency | Risk | Complexity | Recommended Owner | Prerequisites | Acceptance Criteria |
|---|---|---|---|---|---|---|---|---|
| Phase 0 — Architecture Stabilization and Schema Extraction Planning | P0 | High | Governing docs | Medium | Medium | Architecture | Current blueprint and contract | Audit complete; extraction plan approved; backlog defined |
| Phase 1 — Machine-Readable Template Contract | P0 | High | Phase 0 | High | High | Platform Engineering | Extraction plan | Initial template schema models defined; no code consumers required yet |
| Phase 2 — Provisioning Foundation | P0 | Very High | Phase 1 | High | High | Backend / IT | Schema models; runtime config | Baseline site can be provisioned and validated in controlled environment |
| Phase 3 — Project Control Center Shell | P1 | Very High | Phase 1 / Phase 2 | Medium | High | SPFx Engineering | Shell target; UI doctrine | PCC shell renders project identity, navigation, readiness, settings entry, access entry |
| Phase 4 — Team & Access Center | P1 | Very High | Phase 2 / Phase 3 | High | High | SPFx + Backend + IT | Permission model; people picker | Governed access workflow works without native SharePoint settings dependency |
| Phase 5 — Document Control Center MVP | P1 | High | Phase 3 | Medium | Medium | SPFx Engineering | Library model; Graph posture | Users can browse/open/download/copy links with permission-aware states |
| Phase 6 — Startup / Permits / Inspections / Closeout MVP Modules | P1 | High | Phase 1 / Phase 3 | Medium | High | Product + SPFx | Workflow seed models | Core workflow modules render seeded project records and readiness rollups |
| Phase 7 — Responsibility Matrix and Action Center | P2 | High | Phase 6 | Medium | High | Product + SPFx + Backend | Responsibility schema | Role-aware responsibilities and actions aggregate into user views |
| Phase 8 — Procore MVP Integration | P1 | High | Phase 2 / Phase 3 | Medium | Medium | Backend + SPFx | Procore mapping schema | Procore mapping, launch links, sync health placeholder operate without direct SPFx API calls |
| Phase 9 — Procore Recommended Practical Model | P2 | Very High | Phase 8 | High | Very High | Backend + Data | Key Vault; canonical store; subject area plan | Curated summaries and lineage records support operational dashboards |
| Phase 10 — Governance, Adoption, and Expansion | P2 / P3 | High | MVP release | Medium | High | Operations + IT + Engineering | Pilot feedback | Rollout model, training, support, analytics, future modules defined |

---

## 7. Phase-by-Phase Roadmap

## Phase 0 — Architecture Stabilization and Schema Extraction Planning

### Objective

Prepare the blueprint and contract for machine-readable schema extraction.

### Priority

P0

### Expected Outputs

- final documentation consistency audit;
- schema extraction plan;
- list/library/page/object catalog review;
- dependency list;
- implementation backlog;
- open risk register;
- source-of-truth matrix;
- schema extraction acceptance criteria.

### Key Tasks

- Verify ProjectType, ProjectStage, and ProjectStatus usage.
- Confirm Procore boundary language remains consistent.
- Confirm Team & Access and Control Center Settings are fully traceable to contract sections.
- Identify every object that must become a schema artifact.
- Separate MVP objects from future objects.
- Define naming conventions for machine-readable identifiers.
- Create the implementation backlog without modifying code or schemas.

### Acceptance Criteria

- Both governing files have no active contradictions on enum, Procore, access, or MVP boundaries.
- Every object in the contract has an extraction disposition.
- MVP vs future object lists are explicit.
- Schema extraction can begin without reinterpreting architecture intent.

---

## Phase 1 — Machine-Readable Template Contract

### Objective

Convert the human-readable Standard Project Site Template Contract into initial structured schema artifacts.

### Priority

P0

### Likely Target

```text
packages/project-site-template/
```

### Expected Outputs

- template contract schema plan;
- object catalog schema;
- ProjectType / ProjectStage / ProjectStatus enums;
- list definition model;
- library definition model;
- page definition model;
- permission template model;
- module registry model;
- integration configuration model;
- validation rule model;
- site-health check model;
- versioning model.

### Key Tasks

- Define schema folder structure.
- Convert contract object catalog into structured definitions.
- Encode frozen enums exactly.
- Separate `MVP`, `Future`, `Deferred`, and `Proof-Gated` status markers.
- Add validation rules for no-bypass guardrails.
- Add Procore boundary validation metadata.
- Define schema review and versioning process.

### Acceptance Criteria

- Machine-readable artifacts can represent the contract without losing meaning.
- Obsolete stage/type concepts are not reintroduced as active values.
- `active_construction` exists only as a ProjectStage value.
- ProcoreCompanyId is represented as configuration, not a secret.
- Schema output remains documentation/contract extraction until explicitly wired into implementation.

---

## Phase 2 — Provisioning Foundation

### Objective

Implement the backend provisioning baseline for project team sites.

### Priority

P0

### Likely Targets

```text
backend/functions/
apps/estimating/
apps/accounting/
```

### Expected Outputs

- estimating/accounting handoff contract;
- provisioning command model;
- site creation workflow;
- template application workflow;
- permission group creation;
- global read-only mapping;
- project profile seeding;
- module registry seeding;
- site health record creation;
- provisioning audit record;
- idempotency and retry posture.

### Key Tasks

- Define handoff payload from estimating/accounting.
- Create provisioning orchestration plan.
- Create site URL collision and phase-association handling.
- Apply list/library/page definitions.
- Create SharePoint groups and permission mappings.
- Seed Project Profile and configuration records.
- Seed Procore mapping placeholder and sync health placeholder.
- Run post-provision validation.
- Record provisioning audit.

### Acceptance Criteria

- A controlled environment can provision a baseline project site.
- Site URL follows frozen convention.
- Project metadata, groups, lists, libraries, and configuration records are seeded.
- Site Health record exists.
- Provisioning audit exists.
- No normal workflow requires native SharePoint settings.

---

## Phase 3 — Project Control Center Shell

### Objective

Build the initial SPFx full-page shell for project sites.

### Priority

P1

### Likely Target

```text
apps/project-control-center/
```

### Expected Outputs

- project hero;
- module navigation;
- priority actions rail;
- readiness cards;
- Today / This Week panel;
- Site Health indicator;
- Control Center Settings entry point;
- Team & Access entry point;
- module registry-driven layout;
- preview/fallback states for missing data.

### Key Tasks

- Establish app shell architecture.
- Use `@hbc/ui-kit` and repo UI doctrine.
- Render project identity from Project Profile.
- Render module navigation from Module Registry.
- Render MVP readiness cards.
- Add settings and access entry points.
- Add Site Health summary.
- Add fallback states for incomplete provisioning/configuration.

### Acceptance Criteria

- Shell renders as a full-page project operating surface.
- UI does not depend on native SharePoint edit mode.
- Missing or incomplete records show useful, governed fallback states.
- Module visibility respects ProjectStage.
- Archive behavior respects ProjectStatus.

---

## Phase 4 — Team & Access Center

### Objective

Deliver governed project access management inside the PCC UI.

### Priority

P1

### Expected Outputs

- reuse of `HbcPeoplePicker` / repo people-picker foundation;
- invite user workflow;
- permission template selection;
- project-local SharePoint group mapping;
- access audit;
- access request queue;
- phase-based access-manager validation;
- no native SharePoint permission screen dependency.

### Key Tasks

- Confirm people picker foundation and identity shape.
- Build Team & Access UI workflows.
- Implement backend validation for actor authority.
- Apply permission template mappings.
- Audit all access changes.
- Expose project team membership and access history.
- Add plain-language failure states.

### Acceptance Criteria

- Authorized users can add/manage project access through PCC.
- Unauthorized users cannot bypass permission template rules.
- Access changes are audited.
- Procore directory comparison does not auto-grant SharePoint access.
- Native SharePoint permissions screens are not required for normal users.

---

## Phase 5 — Document Control Center MVP

### Objective

Deliver project document navigation and OneDrive/project-library access in the PCC.

### Priority

P1

### Expected Outputs

- project library browser;
- My OneDrive tab;
- project document library tabs;
- breadcrumbs;
- open/download/copy link;
- metadata view;
- permission-aware empty/error states;
- no write actions unless separately approved.

### Key Tasks

- Model project libraries from contract.
- Implement read-only delegated Graph browsing posture.
- Add library tabs and folder breadcrumbs.
- Add open/download/copy-link actions.
- Add permission-aware states.
- Add evidence-link support for workflow modules.

### Acceptance Criteria

- Users can navigate project libraries without native SharePoint library UI dependency.
- File actions remain within approved MVP scope.
- Permission errors are clear.
- No Procore document binary mirror is introduced.

---

## Phase 6 — Startup / Permits / Inspections / Closeout MVP Modules

### Objective

Convert uploaded example workflows into useful project-site modules.

### Priority

P1

### Expected Outputs

- Startup Center;
- Permit & AHJ Center;
- Inspection Readiness Center;
- Closeout & Warranty Center;
- seeded tasks/lists from example documents;
- readiness rollups;
- evidence-link patterns.

### Key Tasks

- Convert example workflows into list-driven modules.
- Seed default task/checklist rows.
- Add readiness rollup logic.
- Add status, responsible role, due date, evidence, and block-condition fields.
- Link module outputs to Project Home.

### Acceptance Criteria

- Each MVP workflow module renders useful project-specific records.
- Readiness cards roll up into Project Home.
- Evidence links point to project libraries.
- Module behavior remains governed by ProjectStage and ProjectStatus.

---

## Phase 7 — Responsibility Matrix and Action Center

### Objective

Convert responsibility matrices into role-aware accountability and task aggregation.

### Priority

P2

### Expected Outputs

- Responsibility Matrix Center;
- My Responsibilities;
- Action Center;
- recurring task generation;
- assignment and escalation logic;
- role-aware views.

### Key Tasks

- Convert responsibility matrix templates into structured role/task records.
- Define recurring responsibility rules.
- Generate Action Center items from matrix, module, and access workflows.
- Add escalation logic.
- Add role/user filter views.

### Acceptance Criteria

- Users can see responsibilities assigned to them.
- PM/PX views show overdue and blocked actions.
- Action Center can aggregate from MVP modules.
- Role changes can be reflected without breaking accountability history.

---

## Phase 8 — Procore MVP Integration

### Objective

Implement Procore mapping, launch links, and sync health placeholder.

### Priority

P1

### Expected Outputs

- ProcoreCompanyId default `5280`;
- Project Procore Mapping;
- Project Manager as mapping owner;
- Project Executive fallback;
- Procore launch links;
- Procore Sync Health placeholder;
- Procore Subject Area Registry seeded disabled;
- no direct SPFx-to-Procore calls;
- no Procore secrets in SharePoint/SPFx/repo/client config.

### Key Tasks

- Implement Procore mapping record.
- Add mapping owner validation.
- Add launch-link UI.
- Seed subject area registry rows disabled.
- Add sync health placeholder.
- Add Site Health checks for missing/invalid Procore mapping.
- Confirm secret handling remains backend-only.

### Acceptance Criteria

- Procore mapping can be configured by the governed owner path.
- Launch links open Procore without exposing secrets.
- SPFx never calls Procore directly.
- Project Accountant is not the mapping owner.
- Site Health flags missing or invalid mapping.

---

## Phase 9 — Procore Recommended Practical Model

### Objective

Enable curated Procore operational summaries through backend/functions and canonical data layer.

### Priority

P2

### Expected Outputs

- backend Procore integration service;
- DMSA / Key Vault posture;
- canonical data layer;
- subject area registry enablement;
- project_management summaries;
- quality_safety summaries;
- documents_design summaries;
- field_execution summaries;
- financials operational summaries;
- lineage records;
- no SharePoint full mirror.

### Key Tasks

- Confirm backend credential strategy.
- Implement extraction and canonical model by subject area.
- Add lineage and sync health.
- Materialize only approved summaries to SharePoint/PCC.
- Add rate-limit and retry policy.
- Add monitoring and audit.

### Acceptance Criteria

- Curated Procore summaries render in PCC with source lineage.
- Raw Procore payloads are not stored in SharePoint.
- Procore financial data is clearly labeled as operational/project-management state.
- Sage remains accounting book of record.
- No write-back exists without a separate amendment.

---

## Phase 10 — Governance, Adoption, and Expansion

### Objective

Move beyond MVP into enterprise operating model.

### Priority

P2 / P3

### Expected Outputs

- Lessons Learned Center;
- Subcontractor Performance Center;
- HBI Assistant;
- cross-project analytics;
- external-user model, if approved;
- write-back architecture, if approved;
- rollout/adoption plan;
- support model;
- training materials;
- change-control procedures.

### Key Tasks

- Pilot with representative projects.
- Capture user feedback and support issues.
- Prioritize future module expansion.
- Define external-user governance.
- Define HBI Assistant scope and guardrails.
- Define cross-project analytics model.
- Establish operational support procedures.

### Acceptance Criteria

- MVP has an adoption path and support model.
- Future features are sequenced by value and risk.
- External access and write-back remain gated by explicit architecture amendments.
- Lessons from pilot are converted into contract and schema updates.

---

## 8. MVP Release Definition

The PCC MVP is the first release that can provision and operate a standardized internal project site without relying on native SharePoint administration for normal project users.

### MVP Must Include

- governed project site provisioning;
- frozen ProjectType / ProjectStage / ProjectStatus values;
- site URL convention;
- baseline lists, libraries, pages, and module records;
- Project Profile;
- Control Center Settings entry point;
- Site Health record and indicator;
- Team & Access Center;
- permission template application;
- access audit;
- Project Home / Command Center;
- Document Control Center read/navigation MVP;
- Startup Center;
- Permit & AHJ Center;
- Inspection Readiness Center;
- Responsibility Matrix Center baseline;
- Closeout & Warranty Center;
- Procore mapping placeholder;
- Procore launch links;
- Procore sync health placeholder;
- no external users;
- no HBI Assistant;
- no Procore write-back;
- no direct SPFx-to-Procore calls.

### MVP Must Not Include

- owner/client/subcontractor external-user workflows;
- HBI Assistant;
- Procore write-back;
- full Procore data mirror;
- raw Procore payload storage in SharePoint;
- SPFx direct calls to Procore;
- uncontrolled project-type-specific templates;
- normal-user dependency on SharePoint native settings.

---

## 9. Post-MVP Release Tracks

| Track | Priority | Description |
|---|---|---|
| Procore Recommended Practical | P2 | Curated summaries, canonical store, subject areas, lineage, sync health. |
| Advanced Governance | P2 | Repair workflows, drift automation, access review scheduling, central audit mirrors. |
| External Access | P2/P3 | Owner/client/design/subcontractor access workflows if approved. |
| HBI Assistant | P3 | Project-context assistant grounded in PCC records and external summaries. |
| Analytics | P2 | Cross-project readiness, access, site health, closeout, and Procore operational analytics. |
| Lessons Learned / Subcontractor Performance | P2 | Future knowledge and vendor-performance modules. |
| Write-Back Integrations | P3 | Only after explicit governance and security amendment. |

---

## 10. Technical Workstreams

## 10.1 Documentation / Architecture

| Priority | Work | Output |
|---|---|---|
| P0 | Final consistency audit | Architecture issue list and closure plan |
| P0 | Contract-to-schema extraction plan | Schema backlog |
| P1 | ADR process for material changes | Architecture change-control path |
| P1 | Update roadmap after Phase 0 | Implementation-ready roadmap |

## 10.2 Schema / Contract Extraction

| Priority | Work | Output |
|---|---|---|
| P0 | Object catalog schema | Machine-readable object index |
| P0 | Enum schema | Frozen ProjectType / ProjectStage / ProjectStatus |
| P0 | List/library/page model | Provisioning-ready definitions |
| P1 | Permission template model | Team & Access backend contract |
| P1 | Validation rule model | Provisioning and drift checks |

## 10.3 Backend Provisioning

| Priority | Work | Output |
|---|---|---|
| P0 | Provisioning command model | Backend input contract |
| P0 | Site creation workflow | Controlled project site creation |
| P0 | Template application | Lists, libraries, pages, metadata |
| P1 | Validation and audit | Provisioning health record |
| P1 | Repair workflow foundation | Safe repair posture |

## 10.4 SPFx Experience

| Priority | Work | Output |
|---|---|---|
| P1 | PCC shell | Full-page project surface |
| P1 | Project Home | Daily project command center |
| P1 | Team & Access | Governed access UI |
| P1 | Document Control | Library/OneDrive navigation |
| P1 | MVP modules | Startup, permits, inspections, closeout |

## 10.5 Data / Integration

| Priority | Work | Output |
|---|---|---|
| P1 | Procore MVP mapping | Launch links and sync health placeholder |
| P2 | Procore canonical store | Curated summary foundation |
| P2 | Sage boundary validation | Book-of-record clarity |
| P2 | Compass / Document Crunch / Adobe Sign / Cupix planning | Future integration backlog |

## 10.6 Governance / Security

| Priority | Work | Output |
|---|---|---|
| P0 | Permission governance model | Least-privilege template mapping |
| P1 | Access audit | Team & Access traceability |
| P1 | Site Health and drift model | Repair classification |
| P1 | Secrets guardrail validation | No secrets in client/doc surfaces |
| P2 | Access reviews | Operational governance cadence |

## 10.7 Adoption / Operations

| Priority | Work | Output |
|---|---|---|
| P1 | Pilot readiness plan | Initial rollout scope |
| P1 | Training and support model | Project-team enablement |
| P1 | Support triage process | IT / Operations operating model |
| P2 | Feedback loop | Roadmap update process |

---

## 11. Business / Operational Workstreams

| Workstream | Priority | Owner | Outputs |
|---|---|---|---|
| Project role ownership | P0 | Operations | Confirm PX/PM/MoOE/PA responsibilities in PCC workflows |
| Project setup handoff | P0 | Estimating / Accounting | Finalize handoff fields and approval timing |
| Access governance | P1 | Operations / IT | Confirm permission templates and access managers |
| Workflow standardization | P1 | Operations | Validate startup, permits, inspections, closeout records |
| Adoption | P1 | Operations / IT | Pilot group, training, support, feedback |
| Change management | P2 | Leadership / Operations | Launch communications and transition plan |

---

## 12. Risks and Mitigations

| Risk | Level | Mitigation |
|---|---|---|
| Implementing from blueprint instead of contract | High | README source-of-truth rules; schema extraction from contract only |
| Overbuilding MVP | High | Maintain MVP release definition and deferred list |
| Permission drift | High | Team & Access Center, audit, Site Health, repair workflows |
| Procore clone risk | High | Mapping/launch-link MVP; curated summary future; no full mirror |
| Secret exposure | High | Backend-only secrets; no secrets in SharePoint/SPFx/docs/repo |
| Schema mismatch | Medium | Phase 0 extraction plan and validation rules |
| Adoption failure | Medium | Full-page shell, low-friction workflows, no native SharePoint admin dependency |
| Large scope | High | Phase-based roadmap and P0/P1/P2 prioritization |
| External access pressure | Medium | Keep deferred until explicit future release |
| Integration complexity | High | Backend-routed boundary and subject-area phasing |

---

## 13. Acceptance Criteria by Phase

| Phase | Acceptance Criteria Summary |
|---|---|
| Phase 0 | Docs audited; extraction plan approved; backlog and dependencies defined |
| Phase 1 | Machine-readable schema can represent contract objects and frozen rules |
| Phase 2 | Baseline site can be provisioned, seeded, validated, and audited |
| Phase 3 | PCC shell renders project identity, navigation, readiness, settings, access, and health |
| Phase 4 | Access can be managed through PCC UI with audit and permission templates |
| Phase 5 | Users can browse project documents and OneDrive context without native library dependency |
| Phase 6 | MVP workflow modules operate from structured lists and roll up readiness |
| Phase 7 | Responsibilities and actions aggregate into role-aware views |
| Phase 8 | Procore mapping, launch links, and sync health placeholder are operational |
| Phase 9 | Curated Procore summaries render with lineage and backend-only integration |
| Phase 10 | Governance, adoption, support, analytics, and future expansion plans are active |

---

## 14. Recommended Immediate Next Steps

1. Approve this roadmap as the execution guide for PCC planning.
2. Open Phase 0 as a documentation and schema-readiness task.
3. Produce a contract object extraction table from `Standard_Project_Site_Template_Contract.md`.
4. Identify MVP-only vs future objects across pages, libraries, lists, modules, integrations, and permission templates.
5. Draft the `packages/project-site-template/` schema structure without creating implementation code.
6. Define provisioning command inputs from estimating/accounting.
7. Define runtime configuration source for Entra group IDs, tenant values, and integration settings.
8. Prepare a first implementation backlog grouped by schema, backend, SPFx, security, and adoption.
9. Do not start backend provisioning or SPFx implementation until Phase 0 and Phase 1 acceptance criteria are met.

---

## 15. Validation Checklist

| Check | Result |
|---|---|
| References `Standard_Project_Site_Template_Contract.md` | Passed |
| References `HB_Project_Control_Center_Target_Architecture_Blueprint.md` | Passed |
| References `procore_hbintel_data_model_package/` | Passed |
| Includes phased plan | Passed |
| Includes priorities | Passed |
| Includes dependencies | Passed |
| Includes risks | Passed |
| Includes acceptance criteria | Passed |
| Includes MVP scope | Passed |
| Includes Procore workstream | Passed |
| Includes Team & Access workstream | Passed |
| Includes provisioning workstream | Passed |
| Includes schema extraction workstream | Passed |
| Confirms no code/schema/SPFx/backend changes required | Passed |
| Avoids invented secrets, credentials, tokens, or IDs | Passed |
