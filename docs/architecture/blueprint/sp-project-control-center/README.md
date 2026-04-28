# Project Control Center Architecture

## Purpose

This directory contains the governing architecture, implementation contract, Procore integration model, and development sequencing for the SharePoint Project Control Center (PCC).

The PCC is the standardized SharePoint project-site operating surface for Hedrick Brothers Construction. It defines how project sites are provisioned, secured, configured, integrated, validated, repaired, and used by project teams.

This directory is not a marketing package. It is a practical reference for architects, developers, IT administrators, and code agents working on project-site standardization.

---

## Plain-English Summary

The Project Control Center is a governed SharePoint team site pattern for HB projects.

Each project site should be:

- created through a controlled provisioning workflow;
- structured the same way every time;
- secured through governed permission templates;
- operated through a branded SPFx project shell;
- configured through Project Control Center settings, not native SharePoint settings;
- connected to Procore, Sage Intacct, and other project systems without duplicating their full transactional records;
- validated through site-health and drift checks.

The PCC does **not** replace Procore, Sage Intacct, Compass, Document Crunch, Adobe Sign, Cupix, Microsoft Teams, Outlook, or SharePoint. It organizes project-level access, navigation, summaries, readiness checks, workflow records, and document surfaces around those systems.

---

## Governing Documents

| Document / Folder | Purpose | Read Order |
|---|---|---:|
| [`HB_Project_Control_Center_Target_Architecture_Blueprint.md`](./HB_Project_Control_Center_Target_Architecture_Blueprint.md) | Strategic target architecture, north-star operating model, module map, and enterprise direction. | 1 |
| [`Standard_Project_Site_Template_Contract.md`](./Standard_Project_Site_Template_Contract.md) | Human-readable implementation source of truth for project site structure, permissions, settings, modules, provisioning, validation, and MVP scope. | 2 |
| [`Project_Control_Center_Development_Roadmap.md`](./Project_Control_Center_Development_Roadmap.md) | Prioritized implementation roadmap derived from the blueprint and contract. | 3 |
| [`procore_hbintel_data_model_package/`](./procore_hbintel_data_model_package/) | Procore data-model and integration reference package for canonical modeling, extraction priorities, SharePoint materialization boundaries, and analytics posture. | 4 |

---

## Phase Closeouts

| Phase | Status | Documents |
|---|---|---|
| Phase 0 — Architecture Stabilization & Schema Extraction Planning | Complete | [`phase-0/`](./phase-0/) |
| Phase 1 — Machine-Readable Template Contract | Complete (full extraction gate closed) | [`phase-1/`](./phase-1/) |
| Phase 2 — Provisioning Boundary (no-mutation chain) | **Complete (Steps 1–6).** Final closeout: [`phase-2/Phase_2_Closeout.md`](./phase-2/Phase_2_Closeout.md). Phase 3 planning readiness: Ready. | [`phase-2/`](./phase-2/) |

Phase 2 step closeouts (audit & boundary; mapper scaffold; contract-coverage mapper; dry-run proof artifacts; apply-gate scaffold; validation + drift/repair posture + final closeout) live in [`phase-2/`](./phase-2/):

- [Step 1 — Provisioning Foundation Audit](./phase-2/Phase_2_Step_1_Provisioning_Foundation_Audit.md)
- [Step 1 — Consumer Boundary](./phase-2/Phase_2_Step_1_Consumer_Boundary.md)
- [Step 1 — Closeout](./phase-2/Phase_2_Step_1_Closeout.md)
- [Step 2 — Mapper Scaffold Closeout](./phase-2/Phase_2_Step_2_Project_Site_Provisioning_Mapper_Scaffold_Closeout.md)
- [Step 3 — Mapper Expansion Closeout](./phase-2/Phase_2_Step_3_Provisioning_Manifest_Mapper_Expansion_Closeout.md)
- [Step 4 — Dry-Run Proof Closeout](./phase-2/Phase_2_Step_4_Dry_Run_Proof_Artifact_Generation_Closeout.md)
- [Step 5 — Apply-Gate Closeout](./phase-2/Phase_2_Step_5_Non_Production_Executor_Adapter_Boundary_Apply_Gate_Closeout.md)
- [Step 6 — Validation / Drift / Repair Posture Closeout](./phase-2/Phase_2_Step_6_Validation_Drift_Repair_Posture_Closeout.md)
- [**Phase 2 Closeout (final)**](./phase-2/Phase_2_Closeout.md)

The dated execution-scaffold package — Foleon prompts, audit report, implementation plan, prompt package, risk register, execution backlog — lives separately under [`docs/architecture/plans/MASTER/spfx/pcc/phase-02/step-1/`](../../plans/MASTER/spfx/pcc/phase-02/step-1/) and is referenced rather than duplicated.

---

## Source of Truth

| Scope | Governing Source |
|---|---|
| Strategic intent and architectural north star | Target Architecture Blueprint |
| Implementable site template, permission model, MVP scope, settings, and validation rules | Standard Project Site Template Contract |
| Procore canonical model and integration recommendations | `procore_hbintel_data_model_package/` |
| Sequencing and execution priorities | Development Roadmap |
| Future machine-readable template artifacts | `packages/project-site-template/` once created |
| Future provisioning implementation | `backend/functions/` once implemented |
| Future SPFx PCC shell | `apps/project-control-center/` once implemented |

Do not create project-site implementation code directly from the blueprint alone. The blueprint provides strategy; the contract governs implementation.

---

## Relationship Between the Blueprint and Contract

| Question | Blueprint | Contract |
|---|---|---|
| What is PCC trying to become? | Primary source | Supporting context |
| What must be provisioned on each project site? | Summary | Primary source |
| Which modules exist and why? | Primary source for module map | Governing source for MVP/future scope and object catalog |
| Which lists, libraries, permissions, settings, and validation rules govern implementation? | Supporting context | Primary source |
| How should conflicts be resolved? | Blueprint wins strategically; contract must be amended to align | Contract wins for implementation unless blueprint conflict requires amendment |

Material implementation work should trace to the contract. Material architecture changes should update both documents or explicitly record why only one document changed.

---

## Procore Model Package

The Procore model package lives here:

```text
docs/architecture/blueprint/sp-project-control-center/procore_hbintel_data_model_package/
```

Its purpose is to define how Procore data should be understood and integrated into HB Intel without turning SharePoint into a full Procore clone.

Key rules:

- Procore remains the system of record for Procore-owned workflows.
- PCC summarizes, contextualizes, deep-links, and selectively materializes Procore data.
- SharePoint lists are not a full mirror of Procore transactional data.
- Procore secrets never belong in SharePoint, SPFx, markdown, repo source, or client configuration.
- SPFx modules do not call the Procore API directly.
- Procore integration is routed through `backend/functions/`.

---

## Current MVP Architecture Status

The current architecture is in a documentation-ready state for roadmap planning and schema extraction.

| Area | Status |
|---|---|
| PCC target architecture | Defined in blueprint |
| Standard project site contract | Defined and marked as source of truth |
| ProjectType / ProjectStage / ProjectStatus distinction | Frozen for MVP |
| Procore mapping baseline | Frozen for MVP |
| Team & Access model | Defined; implementation pending |
| Control Center Settings | Defined; implementation pending |
| Site URL convention | Frozen for MVP |
| MVP vs future scope | Mostly defined; implementation sequencing now captured in roadmap |
| Machine-readable schema | Not created; next architecture-to-implementation bridge |
| Provisioning implementation | Not created for PCC; future `backend/functions/` work |
| SPFx PCC shell | Not created; future `apps/project-control-center/` work |

---

## Current Frozen Decisions

| Decision | Frozen Value / Rule |
|---|---|
| ProjectType enum | `commercial`, `multifamily`, `municipal`, `luxury_residential`, `environmental` |
| ProjectStage enum | `lead`, `estimating`, `preconstruction`, `active_construction`, `closeout`, `warranty` |
| ProjectStatus enum | `Active`, `On Hold`, `Closed`, `Archived` |
| Archive classification | Archive is `ProjectStatus = Archived`, not a ProjectStage |
| Site URL convention | `/sites/{ProjectBaseNumberNoHyphen}` derived from the first six characters of the accounting project number with non-numeric characters stripped |
| Phase suffix default | Phase suffixes associate to the existing base project site by default |
| M365 Group / Teams posture | Project sites are M365 / Teams connected by default |
| Identity model | Hybrid Entra + project-local SharePoint group model |
| No uncontrolled template forks | Use conditional seeding within the governed template family |
| No native SharePoint admin dependency | Normal users operate through PCC UI, not native SharePoint settings/edit screens |
| Procore Company ID | `ProcoreCompanyId = 5280`; configuration, not a secret |
| Procore mapping owner | Project Manager; fallback Project Executive when no PM is assigned |
| Project Accountant mapping role | Project Accountant is not the Procore mapping owner |
| Procore API boundary | `backend/functions/` |
| SPFx-to-Procore calls | Not allowed |
| Procore write-back in MVP | Not allowed |
| External users in MVP | Not allowed |
| HBI Assistant first release | Deferred from MVP |
| Procore directory comparison | Does not auto-grant SharePoint access |
| Sage Intacct role | Accounting book of record |

---

## Key Deferred Decisions

| Deferred Item | Practical Meaning |
|---|---|
| External users | Owner, client, design-team, and subcontractor external access is out of MVP scope. |
| External access approval workflow | Future release item; do not block MVP. |
| HBI Assistant | Architecture hooks may exist, but no HBI Assistant in the first PCC release. |
| Procore write-back | No PCC-originated writes to Procore until separately approved and proof-gated. |
| Procore sync cadence by subject area | Future Recommended Practical model item. |
| Webhooks vs polling | Future integration architecture decision. |
| Canonical Procore storage target | Future data-platform decision. |
| Raw Procore payload retention | Future data-governance decision. |
| Per-project-type seeding expansion beyond frozen rules | Future conditional-seeding enhancement. |
| External-user / Procore-directory reconciliation beyond comparison | Future access-governance release item. |

---

## How to Use This Directory

1. Start with the Target Architecture Blueprint for strategic context.
2. Use the Standard Project Site Template Contract as the governing implementation source of truth.
3. Use the Development Roadmap to determine execution order.
4. Use the Procore model package only for Procore data-model and integration decisions.
5. Do not modify the contract casually; material changes require architecture review.
6. Do not implement new PCC objects unless they trace to the contract or a recorded amendment.
7. Do not create schema artifacts until the schema extraction phase is explicitly opened.
8. Do not build SPFx or backend implementation from roadmap language alone; the roadmap sets sequence, not final contracts.

---

## What Future Agents Should Read First

Before making PCC changes, read:

1. `HB_Project_Control_Center_Target_Architecture_Blueprint.md`
2. `Standard_Project_Site_Template_Contract.md`
3. `Project_Control_Center_Development_Roadmap.md`
4. `procore_hbintel_data_model_package/README.md`
5. `docs/reference/ui-kit/doctrine/` before any SPFx UI work
6. `docs/reference/spfx-surfaces/` before any SharePoint-hosted surface work
7. `docs/reference/sharepoint/list-schemas/` before list or provisioning work

For Procore work, also read the full Procore package before touching integration boundaries.

---

## What Future Agents Must Not Modify Casually

Do not casually modify:

- ProjectType, ProjectStage, or ProjectStatus values;
- site URL convention;
- permission template names or access-manager rules;
- Procore ownership / boundary rules;
- no-secrets guardrails;
- no-native-SharePoint-admin guardrails;
- MVP vs deferred scope boundaries;
- Decision Closure Register statuses;
- project-local vs HBCentral source-of-truth boundaries;
- Sage Intacct system-of-record language;
- Procore materialization boundaries;
- external-user MVP exclusions.

Changes to these areas require an architecture amendment and should update the blueprint, contract, roadmap, and any future machine-readable schema together.

---

## Guardrails

- Do not create project-site implementation code directly from the blueprint alone; derive from the contract.
- Do not bypass the Project Control Center UI by requiring users to use native SharePoint settings.
- Do not introduce direct SPFx-to-Procore API calls.
- Do not store Procore secrets in SharePoint, SPFx, markdown, repo source, or client configuration.
- Do not treat Procore as replaced by PCC.
- Do not treat SharePoint lists as a full mirror of Procore transactional data.
- Do not create uncontrolled project-type-specific templates; use conditional seeding within the governed template family.
- Do not grant SharePoint access based solely on Procore directory membership.
- Do not treat Sage Intacct financial book-of-record data as owned by PCC.
- Do not make normal users responsible for SharePoint page edit mode, list settings, library settings, content-type settings, or advanced permissions.
- Do not treat archived projects as a lifecycle stage; archive is a ProjectStatus value.
- Do not treat `active_construction` as a ProjectType; it is only a ProjectStage.

---

## Do Not Bypass

| Boundary | Do Not Bypass Rule |
|---|---|
| SharePoint administration | Normal users must use PCC settings and workflows, not native SharePoint settings or advanced permissions screens. |
| Procore API | SPFx must not call Procore directly; all Procore API traffic belongs behind `backend/functions/`. |
| Permission governance | Access must be granted through Team & Access workflows and governed templates, not ad-hoc group editing. |
| Secrets management | Secrets must never be committed, documented, stored in SharePoint, stored in SPFx, or exposed to client config. |
| System-of-record boundaries | PCC may summarize and contextualize external data, but it must not silently become the system of record for Procore or Sage-owned data. |

---

## Development Roadmap

Use the roadmap for implementation sequencing:

[`Project_Control_Center_Development_Roadmap.md`](./Project_Control_Center_Development_Roadmap.md)

Recommended next implementation phase:

**Phase 0 — Architecture Stabilization and Schema Extraction Planning**

This phase should close any remaining documentation contradictions, produce a schema extraction plan, and prepare the contract to become machine-readable before backend, SPFx, or provisioning work begins.

---

## Architecture Guardrails for Implementation

| Area | Guardrail |
|---|---|
| Documentation / Architecture | Keep blueprint strategic and contract implementable. Record material changes in both where required. |
| Schema / Contract Extraction | Derive schema from contract, not from ad-hoc implementation preferences. |
| Backend Provisioning | Use repeatable, auditable, least-privilege provisioning through `backend/functions/`. |
| SPFx Experience | Build a full-page PCC shell using repo UI doctrine and SPFx surface standards. |
| Data / Integration | Respect systems of record; summarize and deep-link rather than mirror wholesale. |
| Governance / Security | Use governed permission templates, audit records, drift detection, and repair workflows. |
| Adoption / Operations | Design for low-friction daily use by project teams; no SharePoint-admin literacy requirement. |

---

## Validation Notes

This directory guide intentionally:

- references the Target Architecture Blueprint;
- references the Standard Project Site Template Contract;
- references `procore_hbintel_data_model_package/`;
- links the Development Roadmap;
- preserves current MVP frozen decisions;
- identifies deferred decisions;
- states source-of-truth precedence;
- reinforces no-bypass guardrails;
- avoids invented IDs, secrets, credentials, or implementation-only assumptions.
