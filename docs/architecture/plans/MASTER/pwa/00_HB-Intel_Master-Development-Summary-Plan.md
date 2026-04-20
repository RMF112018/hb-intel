# HB Intel — Master Development Summary Plan

**Document ID:** 00
**Classification:** Program Execution Master Plan
**Status:** Active Reference — governing summary; updated as the program evolves
**Primary Role:** Governing summary plan for the HB Intel development program

## 1. Purpose

This summary plan translates the target-state architecture into an executable program of work. The attached target blueprint defines what HB Intel must become, while the current-state map defines what exists today. This plan set sits between those layers and tells the team how to move from present truth to finished platform state.

HB Intel is being planned as a **production-ready operating platform**, not as a demo shell. That means each phase must address not only feature buildout, but also data ownership, runtime reliability, permissions, search, field usability, deployment, support, and business adoption.

## 2. Governing Planning Assumptions

### 2.1 Source hierarchy for this plan set
1. **Current-state map** governs present implementation truth.
2. **Target architecture blueprint** governs destination architecture intent.
3. **ADRs / locked doctrine docs** govern non-negotiable architectural rules.
4. **This plan set** governs recommended sequencing, work packaging, and execution control.

### 2.2 Platform assumptions
- The **PWA** remains the main HB Intel operating surface.
- **Personal Work Hub** is the main user-centered operating layer.
- **Project Hub** is the main project-centered operating layer.
- **SharePoint companion views** remain focused companion surfaces rather than the primary experience.
- **HB Site Control** remains the field-first application experience using the same core platform foundations.
- Shared services and primitives remain the default path for cross-domain behavior.
- Reusable UI remains owned by the shared UI system and should not be recreated ad hoc in feature packages.

### 2.3 Delivery philosophy
- Treat the platform as a connected lifecycle system, not a set of isolated apps.
- Favor architectural completion over superficial breadth.
- Prevent scaffolds, placeholders, or mock-backed flows from being treated as production-ready.
- Require traceable ownership and acceptance gates at the end of each phase.

## 3. Program Objectives

### 3.1 Primary objective
Deliver HB Intel as the central operating layer for work, accountability, project context, connected documents, and guided execution across construction operations.

### 3.2 Secondary objectives
- Reduce friction created by fragmented spreadsheets, manual SharePoint navigation, and disconnected process handoffs.
- Create a clearer and calmer operating experience than incumbent construction-tech platforms.
- Provide durable platform continuity across pursuit, estimating, setup, execution, controls, field operations, and closeout.
- Establish a runtime and governance model that can support long-term enterprise growth.

## 4. Phase Stack

This plan set uses **8 execution phases** plus this governing summary plan.

### Phase list
- **Phase 0** — Program Control and Repo Truth
- **Phase 1** — Production Data Plane and Integration Backbone
- **Phase 2** — Personal Work Hub and PWA Shell Completion
- **Phase 3** — Project Hub and Project Context Completion
- **Phase 4** — Core Business Domain Completion
- **Phase 5** — Search, Connected Records, and Document Access
- **Phase 6** — Field-First HB Site Control Completion
- **Phase 7** — HBI Intelligence, Production Hardening, Security, and Rollout

### 4.1 Phase 1 active workstream extension

Phase 1 now includes a sixth workstream:

- **Workstream F — Native Integration Backbone Expansion and Reconciliation**

Workstream F is governed by the `P1-F1` family under `docs/architecture/plans/MASTER/phase-1-deliverables/`. It extends the original Phase 1 planning set with a wave-based native integration program grounded in current repo truth and the completed native-integration audit. This extension does not assert that the target Azure-first runtime is already implemented; it defines how the transition and future connector families must be governed.

Downstream planning is now expected to reference the named `P1-F` child families where consumer modules depend on them. Phase 3 through Phase 5 surfaces consume published read models or governed repositories produced by the integration backbone; they do not consume raw, normalized, or canonical connector layers directly.

## 5. Cross-Phase Dependency Logic

### 5.1 Non-negotiable dependency order
- Phase 0 must establish planning truth before major delivery acceleration.
- Phase 1 must complete enough of the real data layer before domain modules are treated as production-ready.
- Phase 2 and Phase 3 can partially overlap after Phase 1 reaches a stable staging baseline.
- Phase 4 should not scale aggressively until the operating hubs have stable attachment points.
- Phase 5 depends on both real data and meaningful project context.
- Phase 6 depends on stable platform services and selected field workflows being clearly defined.
- Phase 7 should finalize the system only after the business-critical paths are real.

### 5.2 Parallel work that is acceptable
- UX planning and shell refinement can begin while Phase 1 is underway.
- Domain discovery and workflow design can continue before full runtime completion.
- Security, telemetry, and rollout planning can begin early, but final production readiness belongs in Phase 7.

## 6. Standing Workstreams

The program should be managed through the following standing workstreams.

### 6.1 Platform / Core Services
Owns data access, backend contracts, auth, permission propagation, notifications, provisioning, environment integrity, and technical governance.

### 6.2 Experience / Shell
Owns the PWA shell, Personal Work Hub composition, navigation, global search entry points, and cross-domain operating experience.

### 6.3 Project / Documents
Owns Project Hub, project-centered views, connected records, project-level document access, and context-linked document journeys.

### 6.4 Business Domains
Owns Admin, Estimating, Business Development, Accounting, and later domain packages such as Safety, Risk, QC/Warranty, Operational Excellence, HR, and Leadership.

### 6.5 Field Experience
Owns HB Site Control, mobile/tablet interaction patterns, degraded connectivity behavior, and selected offline-capable workflows.

### 6.6 DevSecOps / Enterprise Enablement
Owns CI/CD, runtime operations, deployment pipelines, tenant and environment enablement, secrets, monitoring, incident response readiness, and rollout support.

## 7. Master Milestones and Executive Gates

### Gate A — Program Truth Locked
- Phase 0 complete
- Canonical readiness matrix approved
- Production path restrictions defined

### Gate B — Real Data Plane Live in Staging
- Phase 1 materially complete
- Critical read/write paths use real adapters
- Contract tests and integration reliability checks in place

### Gate C — User Operating Layer Live
- Phase 2 complete
- Personal Work Hub is the default post-login experience

### Gate D — Project Operating Layer Live
- Phase 3 complete
- Project Hub becomes the authoritative project command center

### Gate E — Core Domains Ready for Pilot Production Use
- Phase 4 materially complete
- Core domain modules publish into shared work and project context

### Gate F — Search and Document Access Unified
- Phase 5 complete
- Connected records and document journeys are materially simplified

### Gate G — Field Experience Ready
- Phase 6 complete
- Selected field workflows are stable on tablet/mobile with recovery behavior

### Gate H — Enterprise Production Ready
- Phase 7 complete
- Intelligence, hardening, security, support, and rollout gates satisfied

## 8. Deliverables Expected Across the Plan Set

Each phase plan should generate, at minimum:
- a scoped work breakdown
- milestone definitions
- package/app ownership assignments
- dependency map
- acceptance gates
- risk register
- explicit decision / curation backlog
- required architecture and engineering artifacts

## 9. Program-Level Risks

### 9.1 Over-trusting repo breadth
Risk that teams mistake the size of the monorepo for production completeness.

### 9.2 Mock-to-production confusion
Risk that mock-backed or scaffold-backed paths leak into production assumptions.

### 9.3 Feature sprawl before platform completion
Risk that new feature work outruns data, search, project context, or supportability.

### 9.4 Document access failure
Risk that HB Intel does not actually solve SharePoint/OneDrive/Teams confusion in practice.

### 9.5 Cross-package drift
Risk that teams bypass shared primitives or UI governance and re-fragment the platform.

### 9.6 Adoption mismatch
Risk that the platform technically works but does not become the easiest place to move work.

## 10. Program-Level Decision and Idea-Curation Backlog

The following items should be explicitly curated, not left implicit:
- Final production-readiness definition for packages, apps, and integrations
- Source-of-record model by domain and data class
- Project identity model and cross-system key strategy
- Native-integration custody, publication, and connector-wave governance
- Degree of personalization allowed in Personal Work Hub and Project Hub
- Search scope, ranking, and permission-trimming strategy
- Offline behavior policy for HB Site Control
- AI assistance boundaries, confirmation rules, and explainability model
- Production support ownership model and incident handling process
- Enterprise rollout order by department and project type

## 11. Recommended Use of This Plan Set

### 11.1 For leadership
Use the summary plan to understand phase sequencing, gate structure, and decision load.

### 11.2 For architects and technical leads
Use the summary plan to keep phase plans aligned and prevent local optimizations that damage the platform model.

### 11.3 For delivery teams
Use the phase plans as the real working controls for scope, dependencies, ownership, and gates.

## 12. Immediate Next Actions

1. Approve the phase model and document set structure.
2. Convert each phase plan into tracked delivery epics/workstreams.
3. Assign a primary owner and review group to each phase.
4. Begin with Phase 0 as a short, disciplined control phase.
5. Do not allow broad new production-facing scope to accelerate ahead of Phase 0 and Phase 1 entry gates.
