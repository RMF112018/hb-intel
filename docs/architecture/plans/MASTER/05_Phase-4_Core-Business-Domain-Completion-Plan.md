# Phase 4 — Core Business Domain Completion Plan

**Document ID:** 05  
**Classification:** Phase Master Plan  
**Status:** Draft for working use  
**Primary Role:** Complete the first production-critical business domains and connect them to the operating hubs

## 1. Purpose

Phase 4 turns HB Intel from a strong platform foundation into a genuinely useful business system. This phase completes the first wave of production-critical domain modules and ensures they attach cleanly to Personal Work Hub, Project Hub, shared workflows, notifications, and traceability.

## 2. Phase Objectives

- Complete the initial production-critical domain modules with real workflow behavior.
- Attach domain work to the platform’s user-centered and project-centered operating layers.
- Standardize domain interaction patterns around shared primitives and UI doctrine.
- Prevent feature-package silos and preserve continuity across the lifecycle.
- Establish a clear expansion model for later domains.

## 3. Recommended Domain Order

Recommended completion order for this phase:
1. **Admin**
2. **Estimating**
3. **Business Development**
4. **Accounting**
5. Define and prepare next-wave domains: Safety, Risk, QC/Warranty, Operational Excellence, Leadership, HR

This order should still be validated against real business priority and dependency truth.

Phase 4 domain completion must also reconcile to the native integration backbone. Workforce-aware planning surfaces and future HR completion depend on [P1-F7 BambooHR](phase-1-deliverables/P1-F7-BambooHR-Connector-Family.md) as the governed workforce-truth family. Accounting and project-financial completion depend on [P1-F6 Sage Intacct](phase-1-deliverables/P1-F6-Sage-Intacct-Connector-Family.md) for financial/project-accounting backbone context and [P1-F5 Procore](phase-1-deliverables/P1-F5-Procore-Connector-Family.md) for project-control context. Phase 4 consumers stay behind published read models and governed repositories only.

## 4. Desired End State

At the end of Phase 4:
- the first core domains are materially usable in production-oriented pilot conditions
- each core domain publishes into Personal Work Hub and Project Hub where appropriate
- domain workflows use shared primitives instead of custom one-off patterns
- the platform starts to feel like one connected system rather than a set of feature islands

## 5. In Scope

- Admin domain production completion and oversight flows
- Estimating workflow completion and project setup/handoff linkage
- Business Development workflow completion and continuity into estimating/setup
- Accounting scaffolding uplift into real production-track capability
- Shared workflow, notification, acknowledgment, and related-item patterns across these domains
- Readiness planning for later lifecycle domains

## 6. Out of Scope

- Final completion of every later lifecycle domain
- Full field rollout for all domains
- Broad AI assistance activation beyond targeted uses

## 7. Phase Workstreams

### 7.1 Workstream A — Admin Completion
**Goal:** complete the administrative control layer needed to operate the platform responsibly.

**Activities**
- Complete approval oversight, support queues, exception handling, operational visibility, and administrative controls.
- Make admin surfaces suitable for real environment and support operations.
- Ensure admin users have traceable oversight rather than hidden backdoor behavior.

**Deliverables**
- Admin product completion backlog
- Support and exception workflow design
- Admin operational visibility requirements

### 7.2 Workstream B — Estimating Completion
**Goal:** complete estimating as a real connected workflow, not just a set of pages.

**Activities**
- Complete estimating setup, readiness, handoffs, and post-bid continuity behavior.
- Connect estimating work to Personal Work Hub and Project Hub.
- Confirm project setup/provisioning handoff points where appropriate.

**Deliverables**
- Estimating completion backlog
- Estimating-to-project continuity map
- Estimating acceptance checklist

### 7.3 Workstream C — Business Development Completion
**Goal:** complete BD with strong continuity into downstream work.

**Activities**
- Complete BD workflows with clear accountability and next-move behavior.
- Ensure continuity into estimating and setup instead of isolated workflow closure.
- Reduce fragile or unnecessary dependency sprawl.

**Deliverables**
- BD continuity map
- BD completion backlog
- Dependency refinement actions

### 7.4 Workstream D — Accounting Uplift
**Goal:** move accounting from scaffold trajectory to production-track domain.

**Activities**
- Define accounting’s minimum production-relevant workflow set.
- Complete the highest-value accounting paths first.
- Ensure accounting follows the same shared platform model as the other domains.
- Reconcile accounting authority splits against `P1-F5` / `P1-F6` so downstream surfaces consume published read models rather than direct ERP or connector contracts.

**Deliverables**
- Accounting MVP-to-production domain definition
- Accounting uplift backlog
- Dependency and readiness checklist

### 7.5 Workstream E — Cross-Domain Continuity and Standards
**Goal:** make the domains feel like one system.

**Activities**
- Standardize how domains publish work items, project context, notifications, audit trails, and related records.
- Confirm role and permission models behave consistently across domains.
- Document the template that later domains must follow.

**Deliverables**
- Domain integration standard
- Shared workflow usage matrix
- Next-wave domain onboarding template

## 8. Key Milestones

### M4.1 — Admin domain materially complete
Admin surfaces are viable for operational oversight.

### M4.2 — Estimating continuity live
Estimating connects cleanly into work and project context.

### M4.3 — BD continuity live
BD can hand off into downstream work without losing context.

### M4.4 — Accounting uplift baseline live
Accounting is no longer just a scaffold trajectory.

### M4.5 — Cross-domain standard published
The platform has a repeatable domain integration pattern.

## 9. Deliverables

Mandatory deliverables for Phase 4:
- Admin Completion Backlog and Acceptance Criteria
- Estimating Continuity Map
- Business Development Continuity Map
- Accounting Uplift Definition and Backlog
- Cross-Domain Integration Standard
- Next-Wave Domain Onboarding Template

## 10. Dependencies

### Incoming dependencies
- Phase 1 stable backbone
- Phase 2 Personal Work Hub baseline
- Phase 3 Project Hub baseline
- Named integration dependencies where relevant: `P1-F5` Procore, `P1-F6` Sage Intacct, and `P1-F7` BambooHR

### Outgoing dependencies
Phase 4 enables:
- meaningful search and connected-record value
- stronger adoption and pilot use
- AI assistance on real workflows
- later domain buildout using a proven template

## 11. Acceptance Gates

Phase 4 is complete only when:
- each core domain has real workflows, not page-level shells
- domain work appears in shared user/project operating layers where appropriate
- domain behavior uses shared primitives and UI patterns consistently
- domain continuity into downstream work is explicit and testable
- Accounting is on a real production trajectory, not a placeholder path

## 12. Recommended Team Ownership

### Primary owner
Business Domains Team

### Supporting owners
- Platform / Core Services
- Experience / Shell
- Project / Documents

### Required reviewers
- Domain executive sponsors
- Architecture lead
- Program/product lead

## 13. Decisions / Idea Curation Required

- Is the proposed domain completion order correct for business value and technical dependency truth?
- What is the minimum acceptable production scope for Accounting in this phase?
- Which Phase 4 HR/staffing and accounting surfaces must explicitly depend on `P1-F7`, `P1-F6`, and `P1-F5` published read models at first release?
- Which domain workflows are required for first pilot release versus later enrichment?
- What must be universal across domains and what can remain domain-specific?
- Which later lifecycle domains should be queued next and why?

## 14. Risks if Under-executed

- the platform remains broad but shallow
- shared hubs feel disconnected from real work
- teams may create custom domain patterns that break coherence
- rollout value will be limited because only the shell feels complete

## 15. Recommended First Actions

1. Validate the domain completion order with real business owners.
2. Define the smallest truly valuable production workflow set for each domain.
3. Force continuity mapping between domains before polishing isolated screens.
4. Publish the standard domain template before onboarding later domains.
