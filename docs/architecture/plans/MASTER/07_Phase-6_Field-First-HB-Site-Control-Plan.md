# Phase 6 — Field-First HB Site Control Plan

**Document ID:** 07  
**Classification:** Phase Master Plan  
**Status:** Draft for working use  
**Primary Role:** Complete HB Site Control as a field-first operating experience on the shared HB Intel platform

## 1. Purpose

Phase 6 is where HB Intel proves it can serve real site conditions, not just office workflows. The objective is to make HB Site Control a true field-first application experience that is optimized for readability, touch use, jobsite context, and selected degraded-connectivity scenarios while still remaining part of the shared platform model.

## 2. Phase Objectives

- Define and complete the first set of production-worthy field workflows.
- Optimize the field experience for tablet/mobile use and lower-connectivity realities.
- Preserve connected project context and traceability back into the main platform.
- Introduce controlled offline/deferred-sync behavior where it materially helps field execution.
- Validate that the field experience feels simpler and safer than office-oriented views.

## 3. Desired End State

At the end of Phase 6:
- HB Site Control supports a focused set of real field workflows well
- field users can complete important actions without excessive friction
- selected workflows survive degraded connectivity with clear recovery behavior
- field-originated work and records flow back into Project Hub and Personal Work Hub appropriately

## 4. In Scope

- Selection and definition of first-release field workflows
- Mobile/tablet UX simplification and contextual interaction patterns
- Field-specific data entry, review, and handoff behaviors
- Offline/deferred sync policy for selected workflows
- Project and user context linkage back into the shared platform
- Field validation and usability testing

## 5. Out of Scope

- Every possible field workflow in one phase
- Broad offline support for the entire platform
- Replacement of all existing site tools in the first release

## 6. Phase Workstreams

### 6.1 Workstream A — Field Workflow Selection and Definition
**Goal:** choose the right first workflows.

**Activities**
- Identify the highest-value field workflows for first release.
- Define who performs each workflow, on what device, in what setting, and under what connectivity conditions.
- Confirm what data must be captured on-site versus completed later.

**Deliverables**
- First-release field workflow list
- Field workflow scenario definitions
- User/device/context matrix

### 6.2 Workstream B — Field UX Simplification
**Goal:** make the experience usable under jobsite conditions.

**Activities**
- Simplify layout, tap targets, navigation depth, and content density for field users.
- Remove unnecessary office-oriented complexity from field surfaces.
- Define quick-complete, save/resume, and confirmation patterns.

**Deliverables**
- Field UX design principles
- Simplification backlog
- Save/resume interaction rules

### 6.3 Workstream C — Offline / Deferred Sync Strategy
**Goal:** define realistic resilience under degraded connectivity.

**Activities**
- Identify which workflows benefit from offline/deferred sync and which do not.
- Define queueing, conflict, retry, and user-visible sync status behavior.
- Prevent false confidence when data has not fully synced.

**Deliverables**
- Offline/deferred sync policy
- Sync status UX requirements
- Conflict and recovery handling note

### 6.4 Workstream D — Platform Reconnection and Traceability
**Goal:** keep field work integrated into the shared platform.

**Activities**
- Ensure field actions publish into project context, work visibility, and audit history where appropriate.
- Define field-originated record provenance and display cues.
- Align field flows with downstream office review or handoff where needed.

**Deliverables**
- Field-to-platform traceability model
- Provenance display requirements
- Field-to-office handoff map

### 6.5 Workstream E — Validation in Real Conditions
**Goal:** test where the work actually happens.

**Activities**
- Validate on actual device classes and representative connectivity conditions.
- Test readability in outdoor/active-use conditions where relevant.
- Gather feedback from real field-oriented users, not just office proxies.

**Deliverables**
- Field validation plan
- Device/connectivity test matrix
- Field release readiness report

## 7. Key Milestones

### M6.1 — First field workflow set approved
The first-release scope is intentionally focused and valuable.

### M6.2 — Simplified field UX baseline live
Core field screens behave credibly on target devices.

### M6.3 — Offline/deferred sync behavior proven for selected workflows
Recovery behavior is visible and reliable.

### M6.4 — Field-to-platform traceability live
Field work connects back into shared project/user context.

## 8. Deliverables

Mandatory deliverables for Phase 6:
- First-Release Field Workflow List
- User/Device/Context Matrix
- Field UX Design Principles
- Offline / Deferred Sync Policy
- Field-to-Platform Traceability Model
- Field Release Readiness Report

## 9. Dependencies

### Incoming dependencies
- Phase 1 stable data/integration backbone
- Phase 3 project context baseline
- Relevant domain workflows complete enough to support field use

### Outgoing dependencies
Phase 6 enables:
- credible field adoption
- stronger project-level continuity
- better real-world validation of the platform promise

## 10. Acceptance Gates

Phase 6 is complete only when:
- the selected first-release field workflows are materially usable in real conditions
- field users can understand sync state and recovery behavior clearly
- field-originated work remains traceable in the broader platform
- the experience is measurably simpler than office-oriented alternatives for the same tasks

## 11. Recommended Team Ownership

### Primary owner
Field Experience Team

### Supporting owners
- Platform / Core Services
- Project / Documents
- Business Domains

### Required reviewers
- Field operations stakeholders
- Architecture lead
- Support/release lead

## 12. Decisions / Idea Curation Required

- Which field workflows deserve first-release priority?
- How aggressive should offline behavior be in the first production version?
- Which workflows require supervisor review or office-side completion after field capture?
- What device mix should be treated as the actual target standard?
- What field behaviors should be intentionally omitted to keep the experience safe and simple?

## 13. Risks if Under-executed

- the field app feels like a shrunk office interface
- sync failures erode trust quickly
- field records do not reconnect cleanly to project and user context
- adoption stalls because the experience is not genuinely jobsite-friendly

## 14. Recommended First Actions

1. Pick a focused field workflow set rather than over-scoping.
2. Validate on real devices early.
3. Treat sync status and recovery design as core product work.
4. Make provenance and project traceability visible from the start.
