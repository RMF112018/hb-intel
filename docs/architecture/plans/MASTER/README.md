# HB Intel Master Plan Set

**Doc Classification:** Planning Authority Index — navigational front door to the HB Intel development plan set.

---

## What This Plan Set Is

This directory contains the complete HB Intel development plan set: a governing master summary, eight phase plans covering the full program lifecycle, and three deliverables folders covering the mandatory artifacts produced during Phase 0 and Phase 1 planning plus the active Phase 3 deliverables index.

The plan set translates the [target-state architecture](../../blueprint/HB-Intel-Blueprint-V4.md) into an executable program of work. The [current-state map](../../blueprint/current-state-map.md) defines what exists today; the plans define how to move from present truth to finished platform state.

**This is the governing planning stack** for the HB Intel development program. It is the authoritative planning baseline for readiness assessment and execution sequencing. Phase 1 implementation should begin only after the documented readiness gates are satisfied (see the [P1-CLOSEOUT register](phase-1-deliverables/P1-CLOSEOUT-Pre-Phase-1-Contradiction-Register.md) for current blocker status).

**Use this README** to understand what plans exist, what state they are in, and where to start reading for your purpose.

---

## Status Legend

| Status | Meaning |
|---|---|
| **Active Reference** | Living governing document — updated as the program evolves |
| **Complete** | Phase execution finished — all deliverables produced, all milestones satisfied, all gate conditions cleared |
| **Planning Complete** | All planning decisions locked; implementation proceeds as dependencies are satisfied |
| **Draft** | Forward-planning document — structure and intent established, detailed planning not yet started |

---

## Master Plan Index

| # | Document | Status | Type | Purpose |
|---|---|---|---|---|
| 00 | [Master Development Summary Plan](00_HB-Intel_Master-Development-Summary-Plan.md) | Active Reference | Program Summary | Governing summary — phase stack, dependency logic, milestones, workstreams |
| 01 | [Phase 0 — Program Control and Repo Truth](01_Phase-0_Program-Control-and-Repo-Truth-Plan.md) | Complete | Phase Plan | Establish planning truth, readiness classification, governance guardrails |
| 02 | [Phase 1 — Production Data Plane and Integration Backbone](02_Phase-1_Production-Data-Plane-and-Integration-Backbone-Plan.md) | Planning Complete | Phase Plan | Real data ownership, adapter architecture, backend contracts, contract testing |
| 03 | [Phase 2 — Personal Work Hub and PWA Shell](03_Phase-2_Personal-Work-Hub-and-PWA-Shell-Plan.md) | Draft | Phase Plan | PWA shell completion, Personal Work Hub as default post-login experience |
| 04 | [Phase 3 — Project Hub and Project Context](04_Phase-3_Project-Hub-and-Project-Context-Plan.md) | Draft | Phase Plan | Project Hub as authoritative project command center |
| 05 | [Phase 4 — Core Business Domain Completion](05_Phase-4_Core-Business-Domain-Completion-Plan.md) | Draft | Phase Plan | Domain module buildout across Admin, Estimating, BD, Accounting, and later domains |
| 06 | [Phase 5 — Search, Connected Records, and Document Access](06_Phase-5_Search-Connected-Records-and-Document-Access-Plan.md) | Draft | Phase Plan | Unified search, connected records, document journey simplification |
| 07 | [Phase 6 — Field-First HB Site Control](07_Phase-6_Field-First-HB-Site-Control-Plan.md) | Draft | Phase Plan | HB Site Control field experience, mobile/tablet patterns, offline-capable workflows |
| 08 | [Phase 7 — HBI Intelligence, Production Hardening, and Rollout](08_Phase-7_HBI-Intelligence-Production-Hardening-and-Rollout-Plan.md) | Draft | Phase Plan | Intelligence features, security hardening, production readiness, enterprise rollout |
| — | [phase-0-deliverables/](phase-0-deliverables/) | Complete | Deliverables Folder | 7 mandatory Phase 0 artifacts (reconciliation, readiness, guardrails, entry criteria) |
| — | [phase-1-deliverables/](phase-1-deliverables/) | Planning Complete | Deliverables Folder | 24 original Phase 1 workstream artifacts plus the authored P1-F umbrella families under Phase 1 deliverables and closeout/reconciliation records; downstream phases consume their published read-model contracts rather than connector internals |
| — | [phase-3-deliverables/](phase-3-deliverables/) | Active Reference | Deliverables Folder | Active Phase 3 deliverables index including locked module-spec packages such as P3-E10, P3-E11, and P3-E13 |

---

## Plan Set Structure

```
MASTER/
├── README.md                        ← You are here — plan set index
├── 00_Master-Development-Summary    ← Governing summary (Active Reference)
├── 01_Phase-0                       ← Phase plan (Complete)
├── 02_Phase-1                       ← Phase plan (Planning Complete)
├── 03–08_Phases-2-through-7         ← Phase plans (Draft — forward planning)
├── phase-0-deliverables/            ← 7 artifacts + index README
│   └── README.md                    ← Phase 0 deliverables index
├── phase-1-deliverables/            ← 24 original artifacts + authored P1-F umbrella families + index README
│   └── README.md                    ← Phase 1 deliverables index
└── phase-3-deliverables/            ← Active Phase 3 deliverables index + split T-file packages
    └── README.md                    ← Phase 3 deliverables index
```

**How the layers relate:**
- The **Master Summary (00)** governs the entire program — phase sequencing, dependency logic, milestones, and workstreams.
- Each **Phase Plan (01–08)** defines scope, workstreams, milestones, and acceptance criteria for one execution phase.
- Each **Deliverables Folder** contains the artifacts produced during that phase's planning, with its own index README describing status, reading paths, and completion criteria.
- The **Phase 3 Deliverables Folder** is the active deliverable index for Project Hub planning, including the split-file module packages that refine Workstream E specifications.

---

## Current State of the Plan Set

### Completed planning records

**Phase 0 — Program Control and Repo Truth**
Execution complete (2026-03-16). Seven mandatory deliverables produced: reconciliation memo, divergence log, production readiness matrix, development guardrail sheet, environment and promotion matrix, Phase 1 entry checklist, and open decisions register. All five milestones (M0.1–M0.5) satisfied, all six Phase 1 entry blockers resolved, and all 17 completion gate checkboxes cleared (see P0-E1). These artifacts established the program truth baseline that Phase 1 planning built upon.

**Phase 1 — Production Data Plane and Integration Backbone**
Planning and implementation established the original A-E workstreams, and the plan set now includes an active repo-truth-grounded extension: the authored `P1-F` family set under [phase-1-deliverables](phase-1-deliverables/). The original 24 tracked workstream artifacts and closeout records remain in place. Workstream F now governs the multi-wave native integration program against current implementation reality without claiming the target Azure-first runtime is already complete. Downstream plans in Phases 3-5 must treat `P1-F` families as governed upstream dependencies and consume published read models or governed repositories only. See [P1-CLOSEOUT](phase-1-deliverables/P1-CLOSEOUT-Pre-Phase-1-Contradiction-Register.md) and [P1 Native Integration Audit](phase-1-deliverables/P1-CLOSEOUT-Native-Integration-Backbone-Repo-Truth-Audit.md) for the reconciliation basis.

**Phase 1 Implementation Baseline (updated 2026-03-19):**

| Dimension | Status |
|---|---|
| Phase 0 control baseline | **Complete** — all milestones satisfied, all gates cleared (2026-03-16) |
| Phase 1 planning | **Complete** — 24 deliverables final, all transport decisions locked, contradiction closeout 7/7 PASS |
| Implementation verdict | **Code-complete** — B1 (11/11 repos), C1, C2, C3, D1, E1 all delivered and tested |
| Remaining blockers for staging execution | IT-side function app deployment, auth app registration, environment variable configuration; IT Graph permission grant; PO schema approval |
| Recommended immediate next step | Resolve IT-side staging deployment blockers to execute P1-E2 staging readiness checklist |

**Phase 1 native integration extension (2026-03-25):**

- [`P1-F1` Native Integration Backbone family](phase-1-deliverables/P1-F1-Native-Integration-Backbone-Master-Index.md) is now the governing umbrella for the authored `P1-F2` through `P1-F19` connector and expansion-pack families.
- The family is explicitly grounded in current repo truth and the completed Phase 1 native integration audit.
- Present truth still lives in [current-state-map](../../blueprint/current-state-map.md); `P1-F1` governs the transition and connector-program planning model, not a claim that the Azure-first target is already implemented today.
- The implementation companion for this planning set is the [Native Integration Backbone Implementation Guide](../../how-to/developer/native-integration-backbone-implementation-guide.md), which translates `P1-F*` and downstream reconciliations into package/runtime responsibilities, seam changes, publication rules, and rollout guidance.

For the full three-tier implementation-entry gate, see [`phase-1-deliverables/README.md`](phase-1-deliverables/README.md) §Phase 1 Implementation-Entry Gate.

### Forward-planning documents

**Phases 2–7** are draft plans with structure and intent established. They define scope and sequencing for the remaining program lifecycle but have not undergone the detailed planning process that Phases 0 and 1 completed. Detailed planning for each phase will occur as its predecessor reaches material completion.

---

## Relationship to Other Plan Stacks

The MASTER plan set provides program-level planning: phase sequencing, milestones, deliverables, and governance. It is not the only planning stack in the repository. Other plan families handle sprint-level execution and domain feature planning.

### MVP / Wave 0 — Active execution baseline
The `plans/MVP/` directory contains the active sprint-level execution plans for pre-Phase-1 implementation. Organized into six groups:
- **G1** — Contracts and Configuration (sites-selected validation, environment config, group model, notification contract, site template)
- **G2** — Backend Hardening and Workflow Data Foundations (list schemas, provisioning saga, validation, seeding)
- **G3** — Shared Platform Wiring and Workflow Experience
- **G4** — SPFx Surfaces and Workflow Experience
- **G5** — Hosted PWA Requester Surfaces
- **G6** — Admin Support and Observability

MVP/Wave 0 plans implement the production data plane and integration backbone defined by MASTER Phase 1 and its deliverables. The MASTER Phase 1 deliverables (schemas, contracts, test plans) are the governing design authority; the MVP/Wave 0 plans translate those designs into implementation tasks.

### PH7 Remediation — Completed
The `plans/ph7-remediation/` directory contains the Phase 7 P1 stabilization plans (PH7.1–PH7.12). These were signed off on 2026-03-09 (see ADR-0091 and the PH7 final verification evidence package). They are now completed execution records.

**Exception:** PH7.13 (Stub Detection Enforcement) continues independently of the PH7.12 sign-off gate.

### PH7 Domain Plans — Pending Wave 1
Feature-level plans for Business Development, Estimating, Project Hub, Admin, and Breakout Webparts are classified as Canonical Normative Plan but are pending Wave 1 activation. Located in `plans/ph7-business-development/`, `plans/ph7-estimating/`, `plans/ph7-project-hub/`, and related directories.

### Shared Features and UI Kit
The `plans/shared-features/` and `plans/UI-Kit/` directories contain shared-feature planning families (SF01–SF29). Some are completed (Historical Foundational), others are active or deferred. See the [current-state map](../../blueprint/current-state-map.md) §2 for per-family classification.

---

## Reading Paths

### Executive / Program Overview
1. **This README** — Plan set overview and status
2. **[Master Summary (00)](00_HB-Intel_Master-Development-Summary-Plan.md)** — Phase stack, milestones, dependency logic
3. **[Phase 1 Deliverables README](phase-1-deliverables/README.md)** — Planning completion summary and deliverables index
4. **[`P1-F1` Native Integration Backbone family](phase-1-deliverables/P1-F1-Native-Integration-Backbone-Master-Index.md)** — Governing umbrella for the authored native integration family set, publication boundary, and wave structure

### Architecture and Data Governance
1. **[Master Summary (00)](00_HB-Intel_Master-Development-Summary-Plan.md)** — Platform assumptions and governing hierarchy
2. **[Phase 1 Plan (02)](02_Phase-1_Production-Data-Plane-and-Integration-Backbone-Plan.md)** — Data plane architecture and workstream design
3. **[`P1-F1` Native Integration Backbone family](phase-1-deliverables/P1-F1-Native-Integration-Backbone-Master-Index.md)** — Current umbrella for transitional custody, publication boundary, and wave structure
4. **Named connector families as needed** — [P1-F5](phase-1-deliverables/P1-F5-Procore-Connector-Family.md), [P1-F6](phase-1-deliverables/P1-F6-Sage-Intacct-Connector-Family.md), [P1-F7](phase-1-deliverables/P1-F7-BambooHR-Connector-Family.md), [P1-F12](phase-1-deliverables/P1-F12-Microsoft-365-Graph-Content-Connector-Family.md), and [P1-F14](phase-1-deliverables/P1-F14-Oracle-Primavera-Connector-Family.md) when reconciling downstream consumer plans
4. **[P1-A1 Data Ownership Matrix](phase-1-deliverables/P1-A1-Data-Ownership-Matrix.md)** → **[P1-A2 Source-of-Record Register](phase-1-deliverables/P1-A2-Source-of-Record-Register.md)** → **[P1-C1 Backend Service Contract Catalog](phase-1-deliverables/P1-C1-Backend-Service-Contract-Catalog.md)**

### Implementation / Engineering
1. **[Phase 1 Deliverables README](phase-1-deliverables/README.md)** — Full deliverables index with status and reading paths
2. **[P1-B1 Proxy Adapter Implementation Plan](phase-1-deliverables/P1-B1-Proxy-Adapter-Implementation-Plan.md)** — TDD engineering plan for all 11 domain repositories
3. **[P1-E1 Contract Test Suite Plan](phase-1-deliverables/P1-E1-Contract-Test-Suite-Plan.md)** — Locked transport conventions and test infrastructure
4. **[`P1-F1` Native Integration Backbone family](phase-1-deliverables/P1-F1-Native-Integration-Backbone-Master-Index.md)** — Governing integration-program extension for future connector families

### Forward Planning
1. **[Master Summary (00)](00_HB-Intel_Master-Development-Summary-Plan.md)** — Cross-phase dependency logic and parallel work guidance
2. **Phase plans 03–08** — Scope and sequencing for Phases 2–7
3. **[Phase 3 Deliverables README](phase-3-deliverables/README.md)** — Active Phase 3 specification index and module-package reading paths
4. **[Phase 0 Open Decisions Register](phase-0-deliverables/P0-E2-Open-Decisions-Register.md)** — Decisions deferred to future phases

---

## How to Use This README

| If you want to… | Start here |
|---|---|
| Understand the full program structure | [Master Summary (00)](00_HB-Intel_Master-Development-Summary-Plan.md) |
| See what planning has been completed | [Current State](#current-state-of-the-plan-set) section above |
| Find a specific Phase 1 deliverable | [Phase 1 Deliverables README](phase-1-deliverables/README.md) |
| Find a specific Phase 0 deliverable | [Phase 0 Deliverables README](phase-0-deliverables/README.md) |
| Look up a Phase 1 schema for a domain | [P1-A3](phase-1-deliverables/P1-A3-SharePoint-Lists-Libraries-Schema-Register.md) through [P1-A15](phase-1-deliverables/P1-A15-Prime-Contracts-Schema.md) by domain name |
| Understand the backend API surface | [P1-C1 Backend Service Contract Catalog](phase-1-deliverables/P1-C1-Backend-Service-Contract-Catalog.md) |
| Plan implementation work | [Phase 1 Deliverables README](phase-1-deliverables/README.md) — implementation reading path |
| Understand future phase scope | Phase plans 03–08 (Draft status — structure and intent only) |

---

## Practical Notes

- **Completed phase records are reference artifacts.** Phase 0 and Phase 1 deliverables document locked decisions. They should be consulted during implementation but do not change unless an explicit decision revision occurs.
- **The Master Summary (00) is a living document.** It governs sequencing, milestones, and workstream structure across the full program and is updated as the program evolves.
- **Draft phase plans define intent, not locked decisions.** Phases 2–7 establish scope and sequencing direction. Detailed planning occurs as each phase approaches execution.
- **Present truth lives outside this plan set.** The [current-state map](../../blueprint/current-state-map.md) and live repository code govern what exists today. Plan artifacts govern what was decided and what is intended — not what has been built.

---

## Related References

- **Phase 0 Deliverables Index:** [phase-0-deliverables/README.md](phase-0-deliverables/README.md)
- **Phase 1 Deliverables Index:** [phase-1-deliverables/README.md](phase-1-deliverables/README.md)
- **P1-F1 Native Integration Backbone family:** [phase-1-deliverables/P1-F1-Native-Integration-Backbone-Master-Index.md](phase-1-deliverables/P1-F1-Native-Integration-Backbone-Master-Index.md)
- **Phase 3 Deliverables Index:** [phase-3-deliverables/README.md](phase-3-deliverables/README.md)
- **Current-State Map:** [docs/architecture/blueprint/current-state-map.md](../../blueprint/current-state-map.md)
- **Target Architecture (Blueprint V4):** [docs/architecture/blueprint/HB-Intel-Blueprint-V4.md](../../blueprint/HB-Intel-Blueprint-V4.md)
- **Package Relationship Map:** [docs/architecture/blueprint/package-relationship-map.md](../../blueprint/package-relationship-map.md)

---

**Last Updated:** 2026-03-20 — P2-A1 comprehensive repo-truth drift audit completed. All shared-package references verified as current and mature (my-work-feed SF29, notification-intelligence SF10, session-state SF12, smart-empty-state SF11, project-canvas SF13, auth stable). No overclaiming of implementation in P2-A1 plan detected. All package bindings added for clarity. Phase 2 plan repo-truth foundations updated with maturity classification.
