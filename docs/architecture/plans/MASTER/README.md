# HB Intel Master Plan Set

**Doc Classification:** Canonical Normative Index — authoritative front door to the HB Intel development plan set.

---

## What This Plan Set Is

This directory contains the complete HB Intel development plan set: a governing master summary, eight phase plans covering the full program lifecycle, and two deliverables folders containing the mandatory artifacts produced during Phase 0 and Phase 1 planning.

The plan set translates the [target-state architecture](../../blueprint/HB-Intel-Blueprint-V4.md) into an executable program of work. The [current-state map](../../blueprint/current-state-map.md) defines what exists today; the plans define how to move from present truth to finished platform state.

**Use this README** to understand what plans exist, what state they are in, and where to start reading for your purpose.

---

## Status Legend

| Status | Meaning |
|---|---|
| **Active Reference** | Living governing document — updated as the program evolves |
| **Planning Complete** | All planning decisions locked; implementation proceeds as dependencies are satisfied |
| **Draft** | Forward-planning document — structure and intent established, detailed planning not yet started |

---

## Master Plan Index

| # | Document | Status | Type | Purpose |
|---|---|---|---|---|
| 00 | [Master Development Summary Plan](00_HB-Intel_Master-Development-Summary-Plan.md) | Active Reference | Program Summary | Governing summary — phase stack, dependency logic, milestones, workstreams |
| 01 | [Phase 0 — Program Control and Repo Truth](01_Phase-0_Program-Control-and-Repo-Truth-Plan.md) | Planning Complete | Phase Plan | Establish planning truth, readiness classification, governance guardrails |
| 02 | [Phase 1 — Production Data Plane and Integration Backbone](02_Phase-1_Production-Data-Plane-and-Integration-Backbone-Plan.md) | Planning Complete | Phase Plan | Real data ownership, adapter architecture, backend contracts, contract testing |
| 03 | [Phase 2 — Personal Work Hub and PWA Shell](03_Phase-2_Personal-Work-Hub-and-PWA-Shell-Plan.md) | Draft | Phase Plan | PWA shell completion, Personal Work Hub as default post-login experience |
| 04 | [Phase 3 — Project Hub and Project Context](04_Phase-3_Project-Hub-and-Project-Context-Plan.md) | Draft | Phase Plan | Project Hub as authoritative project command center |
| 05 | [Phase 4 — Core Business Domain Completion](05_Phase-4_Core-Business-Domain-Completion-Plan.md) | Draft | Phase Plan | Domain module buildout across Admin, Estimating, BD, Accounting, and later domains |
| 06 | [Phase 5 — Search, Connected Records, and Document Access](06_Phase-5_Search-Connected-Records-and-Document-Access-Plan.md) | Draft | Phase Plan | Unified search, connected records, document journey simplification |
| 07 | [Phase 6 — Field-First HB Site Control](07_Phase-6_Field-First-HB-Site-Control-Plan.md) | Draft | Phase Plan | HB Site Control field experience, mobile/tablet patterns, offline-capable workflows |
| 08 | [Phase 7 — HBI Intelligence, Production Hardening, and Rollout](08_Phase-7_HBI-Intelligence-Production-Hardening-and-Rollout-Plan.md) | Draft | Phase Plan | Intelligence features, security hardening, production readiness, enterprise rollout |
| — | [phase-0-deliverables/](phase-0-deliverables/) | Planning Complete | Deliverables Folder | 7 mandatory Phase 0 artifacts (reconciliation, readiness, guardrails, entry criteria) |
| — | [phase-1-deliverables/](phase-1-deliverables/) | Planning Complete | Deliverables Folder | 24 Phase 1 artifacts (schemas, adapters, contracts, test plans, staging readiness) |

---

## Plan Set Structure

```
MASTER/
├── README.md                        ← You are here — plan set index
├── 00_Master-Development-Summary    ← Governing summary (Active Reference)
├── 01_Phase-0                       ← Phase plan (Planning Complete)
├── 02_Phase-1                       ← Phase plan (Planning Complete)
├── 03–08_Phases-2-through-7         ← Phase plans (Draft — forward planning)
├── phase-0-deliverables/            ← 7 artifacts + index README
│   └── README.md                    ← Phase 0 deliverables index
└── phase-1-deliverables/            ← 24 artifacts + index README
    └── README.md                    ← Phase 1 deliverables index
```

**How the layers relate:**
- The **Master Summary (00)** governs the entire program — phase sequencing, dependency logic, milestones, and workstreams.
- Each **Phase Plan (01–08)** defines scope, workstreams, milestones, and acceptance criteria for one execution phase.
- Each **Deliverables Folder** contains the artifacts produced during that phase's planning, with its own index README describing status, reading paths, and completion criteria.

---

## Current State of the Plan Set

### Completed planning records

**Phase 0 — Program Control and Repo Truth**
Planning complete. Seven mandatory deliverables produced: reconciliation memo, divergence log, production readiness matrix, development guardrail sheet, environment and promotion matrix, Phase 1 entry checklist, and open decisions register. These artifacts established the program truth baseline that Phase 1 planning built upon.

**Phase 1 — Production Data Plane and Integration Backbone**
Planning complete. Twenty-four deliverables produced across five workstreams: data ownership model (15 schemas), adapter architecture (3 plans), backend service contracts (3 specs), write safety and recovery (1 plan), and contract testing infrastructure (2 plans). All design decisions are locked. Implementation is gated on upstream deliverables (proxy adapters, backend routes, auth middleware, observability instrumentation).

### Forward-planning documents

**Phases 2–7** are draft plans with structure and intent established. They define scope and sequencing for the remaining program lifecycle but have not undergone the detailed planning process that Phases 0 and 1 completed. Detailed planning for each phase will occur as its predecessor reaches material completion.

---

## Reading Paths

### Executive / Program Overview
1. **This README** — Plan set overview and status
2. **[Master Summary (00)](00_HB-Intel_Master-Development-Summary-Plan.md)** — Phase stack, milestones, dependency logic
3. **[Phase 1 Deliverables README](phase-1-deliverables/README.md)** — Planning completion summary and deliverables index

### Architecture and Data Governance
1. **[Master Summary (00)](00_HB-Intel_Master-Development-Summary-Plan.md)** — Platform assumptions and governing hierarchy
2. **[Phase 1 Plan (02)](02_Phase-1_Production-Data-Plane-and-Integration-Backbone-Plan.md)** — Data plane architecture and workstream design
3. **[P1-A1 Data Ownership Matrix](phase-1-deliverables/P1-A1-Data-Ownership-Matrix.md)** → **[P1-A2 Source-of-Record Register](phase-1-deliverables/P1-A2-Source-of-Record-Register.md)** → **[P1-C1 Backend Service Contract Catalog](phase-1-deliverables/P1-C1-Backend-Service-Contract-Catalog.md)**

### Implementation / Engineering
1. **[Phase 1 Deliverables README](phase-1-deliverables/README.md)** — Full deliverables index with status and reading paths
2. **[P1-B1 Proxy Adapter Implementation Plan](phase-1-deliverables/P1-B1-Proxy-Adapter-Implementation-Plan.md)** — TDD engineering plan for all 11 domain repositories
3. **[P1-E1 Contract Test Suite Plan](phase-1-deliverables/P1-E1-Contract-Test-Suite-Plan.md)** — Locked transport conventions and test infrastructure

### Forward Planning
1. **[Master Summary (00)](00_HB-Intel_Master-Development-Summary-Plan.md)** — Cross-phase dependency logic and parallel work guidance
2. **Phase plans 03–08** — Scope and sequencing for Phases 2–7
3. **[Phase 0 Open Decisions Register](phase-0-deliverables/P0-E2-Open-Decisions-Register.md)** — Decisions deferred to future phases

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
- **Current-State Map:** [docs/architecture/blueprint/current-state-map.md](../../blueprint/current-state-map.md)
- **Target Architecture (Blueprint V4):** [docs/architecture/blueprint/HB-Intel-Blueprint-V4.md](../../blueprint/HB-Intel-Blueprint-V4.md)
- **Package Relationship Map:** [docs/architecture/blueprint/package-relationship-map.md](../../blueprint/package-relationship-map.md)

---

**Last Updated:** 2026-03-18
