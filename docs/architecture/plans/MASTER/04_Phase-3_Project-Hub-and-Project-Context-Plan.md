# Phase 3 — Project Hub and Project Context Plan

**Document ID:** 04  
**Classification:** Phase Master Plan  
**Status:** Draft for working use  
**Primary Role:** Make Project Hub the authoritative project-centered operating layer

## 1. Purpose

Phase 3 completes the project-centered half of HB Intel’s two-center architecture. The goal is to make Project Hub the place where a user can understand and operate around a project without stitching together status, documents, workflow state, and ownership manually.

## 2. Phase Objectives

- Complete Project Hub as the main project command center.
- Establish consistent project context across apps, domains, and documents.
- Connect project-level status, work, records, team visibility, and recent changes.
- Create clear project jump-off points into deeper workflows without losing context.
- Support configurable project views while maintaining shared platform structure.

## 3. Desired End State

At the end of Phase 3:
- Project Hub is a real operational destination, not just a route or shell wrapper
- project context follows the user across core interactions
- users can see status, risk, linked work, key documents, and ownership from one place
- domain modules can publish project-linked activity into a consistent structure

## 4. In Scope

- Project Hub information architecture and product definition
- Project context model and state propagation
- Project dashboard/canvas composition and widget framework usage
- Project-linked work, activity, and recent changes
- Team / ownership visibility and accountability display
- Entry points to project documents, records, and domain workflows

## 5. Out of Scope

- Final completion of all domain-specific project workflows
- Full enterprise search behavior beyond project-surface needs
- Broad field workflow completion

## 6. Phase Workstreams

### 6.1 Workstream A — Project Hub Product Definition
**Goal:** define what Project Hub must answer immediately for a user.

**Activities**
- Define the must-answer questions: current status, active risks, open work, recent changes, document relevance, ownership, and current stage.
- Identify the minimum required project widgets/views for first production use.
- Define what is universal across projects versus configurable by project type.

**Deliverables**
- Project Hub product brief
- Project widget taxonomy
- Project-type variation rules

### 6.2 Workstream B — Project Context Continuity
**Goal:** keep project context stable and portable.

**Activities**
- Define the project context object used across the shell, domain modules, document flows, and project-linked actions.
- Standardize how project switching works and how the system remembers context.
- Define safe behavior for users who work across many projects.

**Deliverables**
- Project context model
- Context propagation rules
- Project switching behavior note

### 6.3 Workstream C — Activity and Ownership Surfaces
**Goal:** show what is happening and who owns it.

**Activities**
- Create project-level feeds or surfaces for recent activity, linked work, and responsibility signals.
- Define project-level ownership, responsibility, and team visibility rules.
- Ensure cross-domain items roll up into project context cleanly.

**Deliverables**
- Project activity rollup design
- Ownership display standard
- Cross-domain project publication contract

### 6.4 Workstream D — Configurable Project Views
**Goal:** allow meaningful project-specific adaptation without losing coherence.

**Activities**
- Use the project canvas/widget system to support configurable but governed project views.
- Determine which widgets are default, optional, restricted, or role-specific.
- Define persistence rules for layout and visibility settings.

**Deliverables**
- Project canvas configuration policy
- Widget governance note
- Layout persistence requirements

### 6.5 Workstream E — Linked Documents and Records Entry
**Goal:** make project context the natural door to documents and records.

**Activities**
- Define how Project Hub surfaces key documents, recent files, and related records.
- Align project-level navigation with later Phase 5 search/document work.
- Ensure users can move from project summary to relevant detail without reconstructing context.

**Deliverables**
- Project document-entry design
- Related-record linkage requirements
- Project-to-domain navigation map

## 7. Key Milestones

### M3.1 — Project Hub product definition approved
The hub has a clear product purpose and minimum experience definition.

### M3.2 — Project context model standardized
Project state is portable across core surfaces.

### M3.3 — Project activity and ownership rollups live
Users can see meaningful project-linked activity.

### M3.4 — First governed configurable project views live
Canvas/widget use is real and controlled.

## 8. Deliverables

Mandatory deliverables for Phase 3:
- Project Hub Product Brief
- Project Context Model
- Widget / Canvas Governance Note
- Project Activity Rollup Design
- Ownership Visibility Standard
- Project-to-Domain Navigation Map

## 9. Dependencies

### Incoming dependencies
- Phase 1 stable data backbone
- Phase 2 stable shell/context behaviors

### Outgoing dependencies
Phase 3 enables:
- stronger domain integration
- effective project-linked search and document access
- cleaner field-to-project linkage
- better rollout value for project teams

## 10. Acceptance Gates

Phase 3 is complete only when:
- Project Hub can answer the primary “what is happening on this project?” questions
- project context is stable across relevant core surfaces
- users can reach linked work and documents without manual reconstruction
- configurable views remain governed and supportable
- at least the first set of core domain modules publish project-relevant data into the hub

## 11. Recommended Team Ownership

### Primary owner
Project / Documents Team

### Supporting owners
- Experience / Shell
- Business Domains
- Platform / Core Services

### Required reviewers
- Architecture lead
- Product/design lead
- Project operations stakeholder

## 12. Decisions / Idea Curation Required

- What is the minimum universal project view that every project should have?
- How much project configurability is beneficial before the experience fragments?
- Which project health/risk signals are truly worth surfacing first?
- What is the right balance between project summary and deep navigation?
- How should project type differences be expressed without creating separate products?

## 13. Risks if Under-executed

- Project Hub becomes another dashboard wrapper instead of a command center
- domain modules expose project information inconsistently
- users still depend on manual SharePoint and email navigation for project awareness
- later search and document work will have weak project anchors

## 14. Recommended First Actions

1. Define the must-answer project questions before selecting widgets.
2. Lock the project context object and switching behavior early.
3. Start with a disciplined universal project view, then expand carefully.
4. Make ownership visibility explicit; ambiguity here weakens the entire hub.
