# HB Intel — Blueprint Crosswalk & Program Navigation Guide

> **Doc Classification:** Canonical Current-State — authoritative navigation guide for the HB Intel blueprint corpus; consolidates summary-level blueprint/program narrative and bridges to the future `HB-Intel-Unified-Blueprint.md`.

**Version:** 1.0
**Created:** 2026-03-14
**Created by:** HB Intel Documentation Consolidation Agent
**Purpose:** This document is the single entry point for understanding what HB Intel is, where it has been, where it is going, how the major document families relate, and what the active delivery streams are. It consolidates summary-level blueprint/program narrative from previously overlapping documents, preserves historical progress notes, and establishes the bridge into the future `HB-Intel-Unified-Blueprint.md`.

**Governed by:** `CLAUDE.md` v1.3 · ADR-0084 · `current-state-map.md` (Tier 1)

---

## Table of Contents

1. [What Is HB Intel?](#1-what-is-hb-intel)
2. [How to Read This Repo — The 5 Reading Layers](#2-how-to-read-this-repo--the-5-reading-layers)
3. [Document Family Map](#3-document-family-map)
4. [Phase Delivery Sequence — Complete Picture](#4-phase-delivery-sequence--complete-picture)
5. [PH7 Stabilization vs PH7 Expansion — Clarification](#5-ph7-stabilization-vs-ph7-expansion--clarification)
6. [Active Delivery Streams (As of 2026-03-14)](#6-active-delivery-streams-as-of-2026-03-14)
7. [Shared-Feature Primitives Landscape](#7-shared-feature-primitives-landscape)
8. [MVP Plan Branch](#8-mvp-plan-branch)
9. [Preserved Historical Progress Notes](#9-preserved-historical-progress-notes)
10. [Superseded and Reframed Documents](#10-superseded-and-reframed-documents)
11. [Bridge to HB-Intel-Unified-Blueprint.md](#11-bridge-to-hb-intel-unified-blueprintmd)

---

## 1. What Is HB Intel?

HB Intel is a construction project management intelligence platform for H&B Construction. It replaces a monolithic SPFx webpart with a clean, scalable monorepo that delivers:

- **A standalone PWA** (Procore-like primary experience for fluent use outside SharePoint)
- **11 dedicated breakout SPFx webparts** (focused departmental and project-specific use inside SharePoint)
- **HB Site Control** (separate mobile-first connected application for field personnel)
- **Azure Functions backend** (serverless proxy, provisioning saga, SignalR, authentication)

The architecture is governed by five core principles: **scalability**, **stability**, **security**, **performance**, and **maintainability**. Dual-mode authentication (MSAL for PWA, native SharePoint context for webparts) enables the platform to operate in both hosted environments without code changes.

**MVP rollout priority:** Accounting → Estimating → Project Hub → Leadership → Business Development

---

## 2. How to Read This Repo — The 5 Reading Layers

The HB Intel repo uses a strict five-layer document hierarchy established by ADR-0084. Understanding which layer a document belongs to prevents misreading historical plans as current truth.

| Layer | Question Answered | Primary Sources | Classification |
|-------|------------------|-----------------|----------------|
| **Layer 1 — Current Truth** | What does the repo contain right now? | `current-state-map.md`, package READMEs, codebase | Canonical Current-State |
| **Layer 2 — Target Architecture** | What must HB Intel become? | `HB-Intel-Blueprint-V4.md` | Canonical Normative Plan |
| **Layer 3 — Historical Baseline** | How did we get here? | `hb-intel-foundation-plan.md`, PH2–PH6 plans, SF01–SF21 plans | Historical Foundational |
| **Layer 4 — Active Plan Branches** | What is being built now and next? | PH7 domain plans, PH7 remediation plans, MVP plans | Canonical Normative Plan |
| **Layer 5 — Future Unified Blueprint** | Where will all this converge? | `HB-Intel-Unified-Blueprint.md` _(not yet created — see §11)_ | Will be Canonical Normative Plan |

**Conflict rule (ADR-0084, Tier 1):** When documents disagree about what the repo currently contains, `current-state-map.md` governs. Each divergence is annotated as controlled evolution, not-yet-implemented, or superseded.

---

## 3. Document Family Map

### 3.1 Core Governance Documents (Always Authoritative)

| Document | Classification | Role | Update Policy |
|----------|---------------|------|---------------|
| `docs/architecture/blueprint/current-state-map.md` | Canonical Current-State | Present implementation truth | Living — updated with each structural change |
| `docs/README.md` | Canonical Current-State | Navigation index | Living |
| `docs/architecture/blueprint/HB-Intel-Blueprint-V4.md` | Canonical Normative Plan | Locked target architecture | Comment-only |
| `docs/architecture/plans/hb-intel-foundation-plan.md` | Historical Foundational | Original exhaustive implementation instructions | Locked — comment-only |
| `docs/architecture/adr/` (all files) | Permanent Decision Rationale | Append-only architectural decisions | Append-only |
| `docs/architecture/blueprint/HB-Intel-Blueprint-Crosswalk.md` (this file) | Canonical Current-State | Summary blueprint/program navigation | Living — updated as landscape changes |

### 3.2 Phase Execution Plans — By Phase Family

| Family | Files | Classification | Status |
|--------|-------|---------------|--------|
| PH2 (`PH2-Shared-Packages-Plan.md`) | 1 | Historical Foundational | Complete |
| PH3 (`PH3-Query-State-Mngmt-Plan.md`) | 1 | Historical Foundational | Complete |
| PH4 (`PH4-Shell-Consolidation.md`, `PH4-UI-Design-Plan.md`, `PH4.3–PH4.19-UI-Design-Plan.md`) | ~24 | Historical Foundational | Complete |
| PH4B (`PH4B-UI-Design-Plan.md`, `PH4B.1–PH4B.18-*`) | ~21 | Historical Foundational | Complete |
| PH4C (`PH4C-UI-Design-Completion-Plan.md`, `PH4C.1–PH4C.13-*`) | ~15 | Historical Foundational | Complete |
| PH5 (`PH5-Auth-Shell-Plan.md`, `PH5.1–PH5.19-*`) | ~21 | Historical Foundational | Complete |
| PH5C (`PH5C-Auth-Shell-Plan.md`, `PH5C.1–PH5C.10-*`) | ~11 | Historical Foundational | Complete — signed off 2026-03-07 |
| PH6 (`PH6-Provisioning-Plan.md`, `PH6.1–PH6.16-*`) | ~18 | Historical Foundational | Complete |
| PH6F (`PH6F-DeadWiring-*`, `PH6F-1–PH6F-10-*`, `PH6F.1–PH6F.5-*`) | ~18 | Historical Foundational | Complete |
| PH7 remediation (`ph7-remediation/PH7.1–PH7.13-*`) | ~20 | Canonical Normative Plan | PH7.12 is the gate plan; PH7.13 active |
| PH7 breakout webparts (`PH7-Breakout-Webparts-Plan.md` + `ph7-breakout-webparts/PH7-BW-0–BW-11`) | 13 | Canonical Normative Plan | Active infrastructure layer |
| PH7 Estimating feature (`PH7-Estimating-Features.md` + `ph7-estimating/PH7-Estimating-1–12`) | 13 | Canonical Normative Plan | Awaiting BW infrastructure completion |
| PH7 Project Hub feature (`PH7-ProjectHub-Features-Plan.md` + `ph7-project-hub/PH7-ProjectHub-1–16`) | 17 | Canonical Normative Plan | Awaiting BW infrastructure completion |
| PH7 Business Development feature (`PH7-BD-Features.md` + `ph7-business-development/PH7-BD-1–9`) | 10 | Canonical Normative Plan | Awaiting BW infrastructure completion |
| PH7 Admin feature (`PH7-Admin-Feature-Plan.md`) | 1 | Canonical Normative Plan | Awaiting BW infrastructure completion |
| Review Mode (`PH7-ReviewMode-Plan.md` + `PH7-RM-1–9-*`) | 10 | Deferred Scope | Not yet activated — must reclassify before implementation |
| PH9b UX Enhancements (`PH9b-UX-Enhancement-Plan.md`) | 1 | Deferred Scope | Post-Phase-7 — not yet assigned to an active phase |
| MVP Plans (`MVP/MVP-Project-Setup-Plan.md` + T01–T09) | 10 | Canonical Normative Plan | Pending refinement pass (see MVP Plan Review 2026-03-13) |
| MVP Plan Review (`MVP/MVP-Plan-Review-2026-03-13.md`) | 1 | Canonical Current-State | Active review — identifies corrections needed before coding |

### 3.3 Shared-Feature Plan Families

| Family | Primitives | Classification | Status |
|--------|-----------|---------------|--------|
| SF01–SF03 (sharepoint-docs, bic-next-move, complexity) | `@hbc/sharepoint-docs`, `@hbc/bic-next-move`, `@hbc/complexity` | Historical Foundational | Complete — Tier-1 primitives |
| SF04 (acknowledgment) | `@hbc/acknowledgment` | Historical Foundational | Complete v0.1.0 |
| SF05 (step-wizard) | `@hbc/step-wizard` | Historical Foundational | Complete v0.1.0 |
| SF06 (versioned-record) | `@hbc/versioned-record` | Canonical Normative Plan | Scaffold v0.0.1 — pending PH7.12 sign-off |
| SF07 (field-annotations) | `@hbc/field-annotations` | Historical Foundational | Complete v0.1.0 |
| SF08 (workflow-handoff) | `@hbc/workflow-handoff` | Historical Foundational | Complete v0.1.0 |
| SF09 (data-seeding) | `@hbc/data-seeding` | Historical Foundational | Scaffold v0.0.1 |
| SF10 (notification-intelligence) | `@hbc/notification-intelligence` | Historical Foundational | Complete v0.0.1 |
| SF11 (smart-empty-state) | `@hbc/smart-empty-state` | Historical Foundational | Complete v0.0.1 |
| SF12 (session-state) | `@hbc/session-state` | Historical Foundational | Complete v0.0.1 |
| SF13 (project-canvas) | `@hbc/project-canvas` | Historical Foundational | Complete v0.0.1 |
| SF14 (related-items) | `@hbc/related-items` | Historical Foundational | Complete |
| SF15 (ai-assist) | `@hbc/ai-assist` | Historical Foundational | Complete |
| SF16 (search) | Planning family only | Canonical Normative Plan | Planning stage — ADR-0105 reserved |
| SF17 (admin-intelligence) | `@hbc/features-admin` | Historical Foundational | Complete |
| SF18 (estimating bid-readiness) | `@hbc/features-estimating` over `@hbc/health-indicator` | Historical Foundational | Complete |
| SF19 (bd score benchmark) | `@hbc/features-business-development` over `@hbc/score-benchmark` | Historical Foundational | Complete |
| SF20 (bd heritage) | `@hbc/features-business-development` over `@hbc/strategic-intelligence` | Historical Foundational | Complete |
| SF21 (project health pulse) | `@hbc/features-project-hub` | Historical Foundational | Complete |
| SF22 (post-bid learning loop) | `@hbc/post-bid-autopsy` | Canonical Normative Plan | Planning family authored; T01–T07 defined |

### 3.4 Other Architecture Documents

| Document | Classification | Role |
|----------|---------------|------|
| `docs/architecture/ngx-tracker.md` | Historical Foundational | NGX modernization completion tracker; all 8 areas complete as of Phase 4.15 |
| `docs/architecture/plans/HB-Intel-Feature-Phase-Mapping-Recommendation.md` | Superseded / Archived Reference | Pre-Phase-6 feature mapping recommendation; all content superseded by completed Phase 6 and active PH7 plans; progress notes preserved in §9 of this document |
| `docs/architecture/plans/PH7-Estimating-Feature-Plan.md` | Superseded / Archived Reference | v1.0 monolithic plan explicitly superseded by `PH7-Estimating-Features.md` v2.0 |
| `docs/architecture/blueprint/HB-Intel-Blueprint-Consolidation-Report.md` | Historical Foundational | Consolidation process record for this consolidation pass; audit trail |

---

## 4. Phase Delivery Sequence — Complete Picture

The following table shows the complete delivery trajectory of HB Intel. This view consolidates progress context from historical planning documents.

```
COMPLETED (as of 2026-03-07 or earlier)
═══════════════════════════════════════
Phase 0   Prerequisites — Node, pnpm, repo bootstrap
Phase 1   Root monorepo configuration (turbo.json, pnpm-workspace, tsconfig.base)
Phase 2   Shared packages (@hbc/models, @hbc/data-access, @hbc/query-hooks, @hbc/auth)
Phase 3   Dev harness (apps/dev-harness)
Phase 4   PWA + UI Kit (HB Intel Design System, 30+ Hbc-prefixed components, Shell)
Phase 4B  UI Design Audit & Remediation
Phase 4C  UI Design Completion (accessibility, shimmer, token enforcement, Storybook)
Phase 5   Auth/Shell (dual-mode auth, Zustand stores, ShellCore, WorkspacePageShell)
Phase 5C  Auth/Shell hardening (DevToolbar, PersonaRegistry, 100% audit coverage)
           ↳ Signed off 2026-03-07 by all 7 roles; all 12 verification gates passed
Phase 6   Provisioning Modernization (saga hardening, SignalR, state engine, 7-state
           lifecycle, @hbc/provisioning package, Estimating + Accounting app surfaces,
           cross-app notifications, Admin failures dashboard)
           ↳ Complete (PH6 plans reclassified to Historical Foundational)
Phase 6F  Dead-wiring cleanup (connectivity bar, sign-out orchestration, feature
           registration, redirect memory, role landing paths, SPFx bridge, etc.)
           ↳ Complete

PHASE 7 STABILIZATION — ACTIVE (PH7 remediation)
══════════════════════════════════════════════════
PH7.1   Current-State Architecture Map (Tier 1 doc created — current-state-map.md)
PH7.2   Auth Store Responsibility Narrowing
PH7.3   Shell Core Decomposition
PH7.4   Shared-Feature Tier-1 Normalization (SF01–SF09 elevated to mandatory primitives)
PH7.5   Complexity Retrofit Completion + ESLint boundary rules
PH7.6   BIC Standardization
PH7.7   SharePoint Docs Hardening
PH7.8   Test Governance Normalization (Vitest P1 workspace; branches: 95)
PH7.9   Release Semantics & Readiness Taxonomy (ADR-0083)
PH7.10  Documentation Drift Classification (ADR-0084)
PH7.11  ADRs, Reference Docs & Developer Rules (ADR catalog rebuilt; conflicts resolved)
PH7.12  Final Verification & Sign-Off ← GATE: must pass before feature expansion
PH7.13  Stub Detection Enforcement (PH7.13-T01 through T09 — independent of PH7.12 gate)

Shared Features SF04–SF21 built in parallel with PH7 stabilization:
  SF04 acknowledgment ✅ | SF05 step-wizard ✅ | SF06 versioned-record (scaffold)
  SF07 field-annotations ✅ | SF08 workflow-handoff ✅ | SF09 data-seeding (scaffold)
  SF10 notification-intelligence ✅ | SF11 smart-empty-state ✅ | SF12 session-state ✅
  SF13 project-canvas ✅ | SF14 related-items ✅ | SF15 ai-assist ✅
  SF16 search (planning) | SF17 admin-intelligence ✅ | SF18 estimating bid-readiness ✅
  SF19 bd score benchmark ✅ | SF20 bd heritage ✅ | SF21 project health pulse ✅
  SF22 post-bid learning loop (planning — T01–T07 defined)

PHASE 7 EXPANSION — PENDING PH7.12 SIGN-OFF
═══════════════════════════════════════════
PH7 BW   Breakout Webparts Infrastructure (PH7-BW-0 through BW-11)
PH7 Est  Estimating module feature build-out (PH7-Estimating-1 through 12)
PH7 PHb  Project Hub module feature build-out (PH7-ProjectHub-1 through 16)
PH7 BD   Business Development module feature build-out (PH7-BD-1 through 9)
PH7 Adm  Admin module feature build-out (PH7-Admin-Feature-Plan.md)

MVP Plans (MVP-Project-Setup-Plan + T01-T09) — needs refinement per Plan Review 2026-03-13

DEFERRED SCOPE (must not begin without reclassification)
════════════════════════════════════════════════════════
Review Mode (@hbc/review-mode — PH7-ReviewMode-Plan + PH7-RM-1 through 9)
PH9b UX Enhancements (My Work Feed, coaching, draft persistence, instrumentation)
SF16 Search (@hbc/search)
SF22 Post-Bid Learning Loop (partial — T08-T09 not yet defined)

FUTURE
══════
Phase 8+  External integrations (Sage Intacct, Procore API, Azure Monitor Workbooks,
           SharePoint site archival)
```

---

## 5. PH7 Stabilization vs PH7 Expansion — Clarification

Phase 7 has two distinct branches that use overlapping naming and must not be confused:

### PH7 Stabilization (P1 Remediation Series)
- **Files:** `docs/architecture/plans/ph7-remediation/PH7.1` through `PH7.13`
- **Purpose:** P1 technical debt remediation, governance normalization, and quality gates
- **Gate:** PH7.12 (`Final Verification and Sign-Off`) is the gate plan. ADR-0090 must exist on disk before any feature-expansion phase begins
- **Status:** PH7.1–PH7.11 complete; PH7.12 and PH7.13 active
- **Classification:** Canonical Normative Plan (PH7.12, PH7.13 with Tier 1 banners; sub-plans Tier 2)

### PH7 Expansion (Feature Build-Out Series)
- **Files:** `PH7-Breakout-Webparts-Plan.md`, `PH7-Estimating-Features.md`, `PH7-ProjectHub-Features-Plan.md`, `PH7-BD-Features.md`, `PH7-Admin-Feature-Plan.md`, and all domain sub-task files in `ph7-breakout-webparts/`, `ph7-estimating/`, `ph7-project-hub/`, `ph7-business-development/`
- **Purpose:** Building the 11 SPFx feature modules with full business logic, testing, and documentation
- **Gate:** May not begin until PH7.12 acceptance criteria are fully satisfied and ADR-0090 exists on disk
- **Status:** Plans authored; implementation pending PH7.12 gate
- **Classification:** Canonical Normative Plan

### Root-Level PH7 Plans vs Domain Sub-Plans Relationship

Each domain has:
1. A **root-level master summary** (e.g., `PH7-Estimating-Features.md`) — provides locked decisions, scope definition, and task file index
2. **Numbered task files** in a domain subdirectory (e.g., `ph7-estimating/PH7-Estimating-1-Foundation.md`) — contain implementation detail

The master summary is the entry point; task files contain code-level specification. Do not bypass the master summary when beginning a domain.

**Special case — PH7-Estimating-Feature-Plan.md:** This v1.0 monolithic file is explicitly superseded by `PH7-Estimating-Features.md` v2.0. It is retained as Superseded / Archived Reference only. Do not use it for implementation. See §10 below.

---

## 6. Active Delivery Streams (As of 2026-03-14)

| Stream | Entry Point | Status | Gate/Prerequisite |
|--------|-------------|--------|-------------------|
| PH7.12 Final Verification | `ph7-remediation/PH7.12-Final-Verification-and-Sign-Off.md` | Active gate plan | Must complete before feature expansion |
| PH7.13 Stub Detection | `ph7-remediation/PH7.13-Stub-Detection-Enforcement.md` | Active — independent of PH7.12 | ADR-0095 in place |
| SF22 Post-Bid Learning Loop | `shared-features/SF22-Post-Bid-Learning-Loop.md` | T01–T07 defined; T08–T09 pending | Pending PH7.12 |
| SF16 Search | `shared-features/SF16-Search.md` | Planning complete; ADR-0105 reserved | Pending PH7.12 |
| MVP Project Setup | `MVP/MVP-Project-Setup-Plan.md` | Plan authored; needs refinement per review | Review items must be resolved; ADR-0090 required |
| PH7 Feature Expansion | Multiple master plans (§3.2) | Plans authored; pending gate | PH7.12 sign-off + ADR-0090 on disk |

---

## 7. Shared-Feature Primitives Landscape

As of PH7.4, all Category C packages are **Tier-1 Platform Primitives** — mandatory use when their concern area is present in a feature. See [Platform Primitives Registry](../../reference/platform-primitives.md) for the decision tree and adoption matrix.

**Why this matters for blueprint reading:** Several older blueprint and plan documents pre-date the Tier-1 elevation of shared-feature primitives. Blueprint V4 does not enumerate all 22 shared-feature families (SF01–SF22) because they emerged after its authorship. The crosswalk fills this gap:

| Primitive Layer | Decision Source | Mandatory? |
|----------------|-----------------|------------|
| SF01–SF03 (sharepoint-docs, bic-next-move, complexity) | Original organic emergence; Tier-1 per PH7.4 | Yes |
| SF04–SF15 (acknowledgment through ai-assist) | Planned sequence; Tier-1 per PH7.4 | Yes |
| SF16+ (search, post-bid, etc.) | Extended platform primitives; Tier-1 upon completion | Yes |

The unified blueprint (`HB-Intel-Unified-Blueprint.md`, §11) will consolidate the full platform primitives landscape into the master architecture document.

---

## 8. MVP Plan Branch

The MVP plan branch (`docs/architecture/plans/MVP/`) represents the **next concrete implementation wave** — materializing the provisioning flow into a production-ready MVP.

| File | Role |
|------|------|
| `MVP-Plan-Review-2026-03-13.md` | Architecture review of the plan set; identifies 4 categories of issues to resolve before implementation |
| `MVP-Project-Setup-Plan.md` | Master plan: scope, locked decisions, T01–T09 index |
| `MVP-Project-Setup-T01-*` | Scaffold and documentation |
| `MVP-Project-Setup-T02-*` | Contracts and state model |
| `MVP-Project-Setup-T03-*` | Controller gate and request orchestration |
| `MVP-Project-Setup-T04-*` | Estimating requester surfaces |
| `MVP-Project-Setup-T05-*` | Provisioning orchestrator and status |
| `MVP-Project-Setup-T06-*` | SharePoint template and permissions |
| `MVP-Project-Setup-T07-*` | Admin recovery, notifications, and audit |
| `MVP-Project-Setup-T08-*` | Completion and getting started |
| `MVP-Project-Setup-T09-*` | Testing, operations, and pilot release |

**Important:** The MVP Plan Review (2026-03-13) identified four categories of issues that **must be corrected before a coding agent begins implementation**. The plans are directionally sound but not safe to execute as written. See `MVP-Plan-Review-2026-03-13.md` for the full correction list.

**Relationship to Phase 6:** The MVP plans are a refined, focused successor to the Phase 6 provisioning work. They build on the completed Phase 6 foundation (`@hbc/provisioning`, backend saga, SignalR, state engine) and extend it into a production-grade MVP delivery. They are not a duplicate of Phase 6; they are the next increment.

**Gate:** ADR-0090 (`Phase 7 Final Verification & Sign-Off`) must exist on disk before MVP implementation begins.

---

## 9. Preserved Historical Progress Notes

This section preserves meaningful progress notes, sequencing rationale, and completion commentary from documents that have been reframed or superseded as a result of this consolidation.

### 9.1 Notes Preserved From `HB-Intel-Feature-Phase-Mapping-Recommendation.md`

_Source file classification after consolidation: Superseded / Archived Reference (authored 2026-03-07; all Phase 6 content now complete; superseded by active PH7 plans and MVP plans)._
_Note type: Historical progress note + sequencing rationale_
_Original source: `docs/architecture/plans/HB-Intel-Feature-Phase-Mapping-Recommendation.md` §1–§7_

#### Phase 5C Completion Context

> All phases from the original foundation plan (Phases 0–9) and all Phase 4/5/5C sub-phases are **fully complete** as of 2026-03-07. Phase 5C was fully signed off by all 7 roles (Implementation Lead, Code Reviewer, Test Lead, Documentation Lead, Architecture Lead, Security Lead, QA Lead, Product Owner) on 2026-03-07. All 12 verification gates passed at 100% audit coverage. The system was in the optimal state to begin Phase 6 at that point.

#### Phase 6 Feature Sequencing Rationale (Historical)

Phase 6 scope was precisely bounded to provisioning modernization. The following sequencing decisions governed Phase 6 feature delivery:

- **Estimating Project Setup Request form (PH6.10)** — Required PH6.1–PH6.9 complete, especially `@hbc/provisioning` package (PH6.9). This was the first user-facing Phase 6 feature.
- **Accounting Project Setup form / Controller Inbox (PH6.11)** — The Controller-side complement to PH6.10; required all of PH6.1–PH6.10. The `projectNumber` field with `##-###-##` regex was required and editable only in `ReadyToProvision` state.
- **Cross-App Provisioning Notifications (PH6.12)** — Visible across all 7 apps; role-gated visibility (Admin: full 7-step checklist for all projects; Request Submitter: full checklist for own project; Other role-eligible: start/finish banners only; Leadership/Shared Services: no notifications).
- **Admin Provisioning Failures Dashboard (PH6.12)** — Delivered alongside cross-app notifications; satisfies Phase 6 success criterion 6.0.14.

#### Feature Deferral Rationale (Historical)

The following deferral decisions were made at Phase 6 planning time (2026-03-07) and are now historical context:

- **Estimating Tracking Table → Phase 7 (Estimating webpart):** All technical prerequisites were met (Phase 5C complete), but `PH7-Breakout-Webparts-Plan.md §7.2` mandated a full rewrite using TanStack Query, Zustand, and ui-kit rather than wrapping legacy code. Adding it to Phase 6 would have expanded scope and risked slipping the Phase 6 Definition of Done. An optional fast-track path (PH6.10a) was documented if needed before Phase 7.
- **Go/No-Go Scorecard → Phase 7 (Estimating webpart):** Unusually strong infrastructure support was already in place (`IScorecard` types, `useScorecard` hooks, `HbcApprovalStepper` in ui-kit, E2E spec `e2e/scorecard.spec.ts` from Phase 4B), but Phase 7's full-rewrite requirement was the binding constraint. An optional fast-track path (PH6.10b) was documented.
- **BD → Projects list integration → Phase 7:** Explicitly deferred per Phase 6 locked decision 8; BD integration required Phase 6 Projects list schema to stabilize first.
- **In-App Clarification Thread → Phase 7:** Out-of-band clarification (email/Teams) was sufficient for Phase 6 volume; `NeedsClarification` state with out-of-band note satisfied MVP needs.
- **Sage Intacct / Procore API → Phase 8+:** External systems remained manual during Phase 6; API integration classified as a separate initiative.
- **My Work Feed → Post-Phase 7 (PH9b):** Cannot be meaningfully populated until at least 2–3 data sources exist from Phase 7. Aggregators are defined (scorecards, Estimating kickoffs, etc.) but require Phase 7 modules to be live.

#### Phase 6 Locked Decisions (Historical Context — Now Complete)

| Decision | Source | Constraint |
|---|---|---|
| PH6 sequence: PH6.1→6.2→6.3→6.6→6.4→6.5→6.7→6.8→6.9→6.10→6.11 | PH6-Provisioning-Plan.md | Estimating form (6.10) and Accounting inbox (6.11) could not start until 6.9 (`@hbc/provisioning` package) was complete |
| `projectCode` elimination | PH6 Decision 8 | All features referencing project identifiers must use `projectId` (UUID) + `projectNumber` (##-###-##) exclusively — no `projectCode` anywhere |
| Frontend package architecture | PH6 Decision 5 | `@hbc/provisioning` owns headless logic only; visual UI lives in each consuming app |
| Sequential SPFx migration | PH7 Decision Option A | Phase 7 proceeds Accounting → Estimating → Project Hub → Leadership → BD; no webpart can skip ahead |

#### Phase 7 Foundation Readiness Assessment (Historical — Taken at Phase 5C Sign-Off)

At Phase 5C sign-off (2026-03-07), the foundation for all user-facing business features was assessed as complete:

- Auth/session management (production + dev bypass) ✅
- Data models for all domains ✅
- Query/mutation hooks for all domains ✅
- UI kit with module-specific patterns (including Scorecard, Estimating layouts) ✅
- Shell framework (full + simplified for SPFx) ✅
- Dev harness for iterative development ✅
- `@hbc/provisioning` — NOT yet built (was PH6.9 deliverable) ← now complete post-Phase 6

#### Risk Register (Historical — Phase 6 Risk Assessment, 2026-03-07)

The following risks were identified at Phase 6 planning time. Some remain relevant to Phase 7:

| Risk | Severity | Original Phase | Notes / Current Relevance |
|---|---|---|---|
| `projectCode` field in legacy data/components | High | PH6.1 | Resolved in Phase 6 via elimination |
| `@hbc/provisioning` compilation errors blocking PH6.10/11 | High | PH6.9–6.10 | Resolved — package shipped in Phase 6 |
| SignalR in SPFx iframe (cross-domain negotiation) | Medium | PH6.10, PH6.11 | Resolved in PH6.7; still relevant for Phase 7 SPFx work |
| Phase 7 Estimating Tracking Table blocked during Phase 6 | Low-Medium | Phase 6 | No longer relevant — Phase 6 complete |
| Go/No-Go Scorecard `ballInCourt` data insufficient for My Work Feed | Medium | Phase 7/9b | Still relevant — must confirm `IScorecard.currentReviewerRole` field before Phase 7 Estimating webpart begins |
| `##-###-##` projectNumber regex mismatch between backend and frontend | Low | PH6.11 | Resolved in Phase 6 |
| Phase 7 full-rewrite requirement introduces regression risk | Medium | Phase 7 | Still relevant — feature flags for rollout; rollback via git branches per PH7 plan |

### 9.2 Notes Preserved From `PH7-Estimating-Feature-Plan.md` (v1.0 Monolithic)

_Source file classification after consolidation: Superseded / Archived Reference (explicitly superseded by `PH7-Estimating-Features.md` v2.0)._
_Note type: Historical — retained in source file with supersession header_

The v1.0 monolithic plan contains detailed implementation instructions for the Estimating module that were split into task files in v2.0. The key locked decisions in v1.0 are fully preserved in `PH7-Estimating-Features.md` v2.0:

- **Q11:** All three tracking tables (Current Pursuits, Current Preconstruction, Estimate Tracking Log) live in Estimating; Project Hub is single-project context only (governing architectural rule)
- **Q12:** Kickoff/submission checklist lives in Project Hub at `/project-hub/:projectId/kickoff`; Estimating pursuit rows redirect there
- **Q13:** Bid Templates = Option B (curated, categorized SharePoint link library)
- **Q14:** Estimate Tracking Log analytics = Option C (dedicated analytics view with recharts charts, fiscal year comparisons, win-rate breakdown)
- **Q15:** External platform integration = Option B (contextual deep links to Building Connected & Procore)

### 9.3 Notes Preserved From Blueprint V4 (Not Superseded — Layer 2 Target Architecture)

_Blueprint V4 remains Canonical Normative Plan. The following is a summary of its target-architecture intent for quick reference — NOT a replacement for the locked document._
_Note type: Target-state intent summary_

Blueprint V4 defines the following target-architecture principles that remain binding:

- **Ports/adapters pattern** for all data access (not a god-interface)
- **Dual-mode auth:** MSAL for PWA; native SharePoint context for webparts
- **Single-build, two-deployment-target** model: pages live in `packages/features/[domain]/src/`; apps contain only routing, entry points, and bootstrapping
- **Azure Functions thin secure proxy** (Option A: intelligent caching, throttling, batching)
- **Zustand** for auth/shell state; **TanStack Query** for data fetching; **TanStack Router** for routing
- **@hbc/ui-kit** owns all reusable visual components — no package outside ui-kit may introduce new standalone presentational components

---

## 10. Superseded and Reframed Documents

### 10.1 HB-Intel-Feature-Phase-Mapping-Recommendation.md

| Property | Value |
|----------|-------|
| Original role | Pre-Phase-6 feature mapping recommendation; decision guide for which features go in Phase 6 vs Phase 7 |
| Current status | **Superseded / Archived Reference** |
| Why superseded | Written 2026-03-07 when Phase 6 was "NOT STARTED"; all Phase 6 recommendations are now complete; Phase 7 plans supersede its forward-looking Phase 7 section |
| Progress notes preserved | Yes — §9.1 of this document |
| Authoritative replacement | `current-state-map.md` (present truth); PH7 domain master plans (Phase 7 feature decisions); MVP plans (next-wave delivery) |
| Header action | Supersession notice added to file header |

### 10.2 PH7-Estimating-Feature-Plan.md

| Property | Value |
|----------|-------|
| Original role | v1.0 monolithic Estimating feature plan — all locked decisions and implementation detail in one file |
| Current status | **Superseded / Archived Reference** |
| Why superseded | Explicitly superseded by `PH7-Estimating-Features.md` v2.0 per that file's header: _"Supersedes: PH7-Estimating-Feature-Plan.md v1.0 (monolithic — retained as archive)"_ |
| Progress notes preserved | Key locked decisions preserved in `PH7-Estimating-Features.md` v2.0; summary in §9.2 of this document |
| Authoritative replacement | `PH7-Estimating-Features.md` v2.0 (master summary + task files index) |
| Header action | Supersession notice added to file header |

### 10.3 PH7-ReviewMode-Plan.md and PH7-RM-* Plans

| Property | Value |
|----------|-------|
| Original role | Review Mode master summary + 9 implementation task files; described as active work |
| Current status | **Deferred Scope** |
| Why deferred | PH7-RM-1 through PH7-RM-9 are classified Deferred Scope in current-state-map §2. The master plan shares this classification. Review Mode cannot begin without reclassification to Canonical Normative Plan and assignment to a named phase milestone |
| Progress notes preserved | Locked decisions (RM-1 through RM-8) in the source file; retained fully |
| Authoritative replacement | N/A — deferred; will need reclassification |
| Header action | Deferred Scope classification banner added to `PH7-ReviewMode-Plan.md` |

### 10.4 PH9b-UX-Enhancement-Plan.md

| Property | Value |
|----------|-------|
| Original role | Post-Phase-7 UX enhancements plan (My Work Feed, coaching, draft persistence, instrumentation) |
| Current status | **Deferred Scope** |
| Why deferred | Post-Phase-7 work not yet assigned to an active phase. PH7.12 sign-off is a prerequisite for activation. |
| Progress notes preserved | Fully retained in source file |
| Authoritative replacement | N/A — deferred |
| Header action | Deferred Scope classification banner added |

---

## 11. Bridge to HB-Intel-Unified-Blueprint.md

> **Status update (2026-03-14):** `HB-Intel-Unified-Blueprint.md` has been created. The unified blueprint is now the master summary architecture and program narrative for HB Intel. See `docs/architecture/blueprint/HB-Intel-Unified-Blueprint.md`. The program summary now lives there; this crosswalk remains authoritative for document family navigation, phase sequence, and historical notes.

The consolidation pass prepared the corpus for unified blueprint generation by reducing fragmentation, classifying all documents, and preserving historical notes. The unified blueprint synthesizes that work into the master summary narrative.

### What the Unified Blueprint Will Contain

The unified blueprint will synthesize into a single document:

1. **What HB Intel is** — vision, product definition, target user groups, platform positioning
2. **Target architecture** — from Blueprint V4, updated to reflect controlled evolution through PH7
3. **Platform primitives** — the full SF01–SF22 primitive layer (which Blueprint V4 did not anticipate)
4. **Package inventory** — all 50 workspace members with roles and dependencies
5. **Phase delivery summary** — what was built in each phase (synthesized from Historical Foundational plans)
6. **Active delivery roadmap** — current PH7 expansion plans + MVP + deferred scope
7. **Governance and classification** — the six-class document system and source-of-truth hierarchy
8. **ADR index reference** — pointer to the 111+ active ADRs

### What the Unified Blueprint Will NOT Replace

The following remain as separate authoritative sources even after the unified blueprint exists:

- `current-state-map.md` — Tier 1 present truth; cannot be collapsed into any other file
- `docs/architecture/adr/` — append-only decision records; cannot be merged
- Individual phase/task plans — detailed implementation instructions remain separate
- `docs/README.md` — navigation index; remains the entry point for all doc quadrants

### Readiness Assessment

The unified blueprint has been created (2026-03-14). The corpus preparation that made it possible:

- ✅ Summary-level fragmentation reduced (Feature-Phase-Mapping superseded; Estimating v1.0 superseded; ngx-tracker classified)
- ✅ Unclassified documents now classified (PH7 expansion plans, Review Mode, PH9b, MVP, ngx-tracker)
- ✅ Historical progress notes preserved (§9)
- ✅ Conflict resolution documented (§10, Consolidation Report)
- ✅ Navigation updated (docs/README.md)
- ✅ current-state-map §2 updated with new rows
- ✅ `HB-Intel-Unified-Blueprint.md` created — master summary now lives there

**Program summary:** `docs/architecture/blueprint/HB-Intel-Unified-Blueprint.md`

---

_End of HB-Intel Blueprint Crosswalk & Program Navigation Guide_
_Created during documentation consolidation pass: 2026-03-14_
_Consolidation report: `docs/architecture/blueprint/HB-Intel-Blueprint-Consolidation-Report.md`_
