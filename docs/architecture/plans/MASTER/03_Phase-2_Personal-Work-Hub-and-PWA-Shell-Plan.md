# Phase 2 — Personal Work Hub and PWA Shell Plan

**Document ID:** 03  
**Classification:** Phase Master Plan  
**Status:** Draft for working use  
**Primary Role:** Make the PWA a task-first operating environment centered on Personal Work Hub

## 1. Purpose

Phase 2 turns the PWA from a broad application surface into the actual user operating layer envisioned by the target architecture. The central idea is simple: when a user opens HB Intel, the platform should quickly tell them what matters, what changed, what they own, what is blocked, and what should happen next.

## 2. Phase Objectives

- Make Personal Work Hub the default post-login operating surface.
- Consolidate work, accountability, and change visibility into one coherent command center.
- Refine shell composition so movement across domains feels connected rather than app-switched.
- Support role-aware experiences without fragmenting the platform into separate mini-products.
- Establish a calm, high-signal, task-first experience that becomes the daily habit layer.

## 3. Desired End State

At the end of Phase 2:
- the PWA opens into a meaningful Personal Work Hub
- users can see ownership, blockers, changes, and next steps from one place
- navigation and context switching feel deliberate and lightweight
- at least the first set of domain modules feed real work into the hub

## 4. In Scope

- Personal Work Hub composition and information architecture
- PWA shell and landing behavior refinement
- Role-aware layout and personalization rules
- Integration of shared workflow primitives into the hub
- Work visibility patterns: assigned to me, blocked, waiting, changed, next action, priority signals
- Cross-domain navigation and context retention

## 5. Out of Scope

- Final completion of all domain modules
- Full project operating layer completion
- Full search and document completion beyond the shell entry experience

## 6. Phase Workstreams

### 6.1 Workstream A — Personal Work Hub Definition
**Goal:** define the hub as a real product, not just a dashboard.

**Activities**
- Define core hub zones: attention now, changed since last view, assigned work, blocked work, waiting on others, suggested next actions, quick jump-offs.
- Define the minimum set of cross-domain work item types that must appear in the hub.
- Establish how urgency, importance, and accountability are displayed without noise overload.

**Deliverables**
- Personal Work Hub product brief
- Hub information architecture
- Work-item taxonomy for hub aggregation

### 6.2 Workstream B — Shell and Navigation Refinement
**Goal:** make movement through the platform feel fluent.

**Activities**
- Refine PWA landing, shell layout, navigation patterns, and remembered context.
- Ensure module entry/exit preserves user context where appropriate.
- Reduce heavy navigation hops for common daily work.
- Confirm responsive behavior across desktop and tablet.

**Deliverables**
- Shell refinement backlog
- Navigation rules and context-retention guide
- Cross-device shell behavior note

### 6.3 Workstream C — Shared Work Integration
**Goal:** attach real work sources to the hub.

**Activities**
- Integrate work-producing primitives and domain feeds into one aggregation surface.
- Standardize how work items expose ownership, due signals, state, originating module, and next action.
- Ensure the hub can route users into the right detail experience with preserved context.

**Deliverables**
- Hub feed contract
- Work-item display standard
- Initial module integration tracker

### 6.4 Workstream D — Personalization and Experience Controls
**Goal:** allow useful configuration without creating chaos.

**Activities**
- Define what users may personalize versus what remains fixed.
- Establish saved views, pinned tools, density options, and ordering rules.
- Prevent personalization from damaging supportability or visual coherence.

**Deliverables**
- Personalization policy
- Saved view / pinning requirements
- Experience-governance note

### 6.5 Workstream E — Adoption and Habit Design
**Goal:** make the hub worth opening every day.

**Activities**
- Define what makes the hub a daily-use destination instead of a passive summary page.
- Identify quick wins that reduce existing workflow friction immediately.
- Create measurement ideas for hub usefulness, not just page visits.

**Deliverables**
- Hub adoption hypothesis set
- Behavioral success metrics
- First-release usage validation plan

## 7. Key Milestones

### M2.1 — Personal Work Hub definition approved
The hub has a clear product definition and work taxonomy.

### M2.2 — PWA landing experience reoriented around work
The default landing surface is task-first.

### M2.3 — Multi-module feed integration live
At least the first core modules publish into the hub.

### M2.4 — Contextual navigation and personalization baseline live
Users can work fluidly without excessive switching friction.

## 8. Deliverables

Mandatory deliverables for Phase 2:
- Personal Work Hub Product Brief
- Hub Information Architecture
- Work-Item Aggregation Contract
- Shell and Navigation Refinement Backlog
- Personalization Policy
- Adoption / Habit Success Metrics Draft

## 9. Dependencies

### Incoming dependencies
- Phase 1 staging-ready data backbone
- Stable auth, session, and shell foundations

### Outgoing dependencies
Phase 2 enables:
- Project Hub attachment to user work
- more effective domain completion
- better search and document entry points
- stronger adoption during rollout

## 10. Acceptance Gates

Phase 2 is complete only when:
- Personal Work Hub is the default user operating surface
- users can understand what they own and what needs attention without opening multiple modules first
- the hub is fed by real work items, not placeholder content
- shell behavior is consistent across desktop/tablet and preserves context appropriately
- personalization is useful but governed

## 11. Recommended Team Ownership

### Primary owner
Experience / Shell Team

### Supporting owners
- Platform / Core Services
- Business Domains

### Required reviewers
- Product/design lead
- Architecture lead
- Support/adoption representative

## 12. Decisions / Idea Curation Required

- What is the minimum viable set of work zones that make the hub genuinely useful?
- How much personalization is beneficial before the experience becomes fragmented?
- How should urgency, priority, and blocked status be ranked or surfaced?
- Which modules must be integrated for the first meaningful release?
- What should the platform do when there is low work volume or ambiguous next actions?

## 13. Risks if Under-executed

- the PWA remains a shell instead of a working habit layer
- users still reconstruct their day manually from multiple tools
- platform value is diluted into a general dashboard experience
- later domains integrate inconsistently into the user operating layer

## 14. Recommended First Actions

1. Define the hub as a product before refining individual widgets.
2. Standardize work-item shape early so domain modules can plug in predictably.
3. Use real work scenarios from Admin / Estimating / BD first.
4. Optimize for clarity and movement, not maximum information density on day one.
