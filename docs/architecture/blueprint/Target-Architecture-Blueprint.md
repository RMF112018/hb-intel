# Target-Architecture-Blueprint.md

> **Doc Classification:** Canonical Normative Plan — Target Architecture (Tier 2)
> 
> **Status:** Draft
> 
> **Purpose:** This document defines the finished destination architecture for **HB Intel**. It describes what the platform must become when fully realized. It does **not** describe current implementation status, migration sequencing, active-phase work, or historical progress.
> 
> **Reading Layer:** Tier 2 — Target Architecture
> 
> **Companion Documents:**
> - `docs/architecture/blueprint/HB-Intel-Unified-Blueprint.md` — program narrative / summary layer
> - `docs/architecture/blueprint/current-state-map.md` — present-state truth
> - `docs/architecture/adr/ADR-0116-ui-doctrine-and-visual-governance.md` — locked UI doctrine
> - `docs/architecture/plans/` — execution, phase, and wave plans

---

## 1. Document Role and Boundaries

### 1.1 What this document is

This file is the **target-state blueprint** for HB Intel.

It answers one question:

**What must HB Intel become when the platform reaches its intended architecture?**

This blueprint is meant to be durable. It should remain useful even as waves, phases, priorities, and implementation plans change.

### 1.2 What this document is not

This file is **not**:

- a current-state inventory
- a migration plan
- a wave roadmap
- a sprint or phase plan
- a feature-by-feature implementation manual
- a historical progress log
- a low-level engineering spec for every package
- a UI component standards manual

Those concerns belong in the current-state map, roadmap, ADRs, feature plans, transition architecture, and implementation documentation.

### 1.3 Audience

This document is written for a mixed audience:

- **developers and AI/code agents first**
- architecture/governance owners second
- leadership and non-technical stakeholders third

The language should stay plain enough for non-specialists to follow while still being precise enough to guide technical decisions.

---

## 2. Product Thesis

### 2.1 What HB Intel is

HB Intel is the **central operating layer** for Hedrick Brothers Construction.

It is not meant to be just another dashboard, launcher, or reporting shell. It is intended to become the main place where users:

- understand what needs attention
- move work forward
- see project and lifecycle context
- access connected documents and records
- act across departments and workflows
- receive guidance, visibility, and decision support

In early stages, HB Intel overlays existing systems and replaces fragmented legacy procedures that currently live in spreadsheets, Word files, email threads, manual SharePoint navigation, and disconnected point-processes.

In later stages, HB Intel is designed to **replace selected outside systems entirely** where doing so creates a better operating experience and stronger platform continuity.

### 2.2 Core strategic advantage

HB Intel’s long-term advantage is not simply feature count.

Its durable value comes from combining:

- **unified work and accountability**
- **connected lifecycle context**
- **clear ownership and next action**
- **lower-friction movement across systems and departments**
- **field-capable and office-capable experiences on one platform**
- **plain-language implementation trust**

The platform should feel calmer, clearer, and easier to work from than the category leaders it is benchmarked against.

---

## 3. Product Definition (Target State)

HB Intel’s finished target architecture delivers three integrated delivery surfaces:

### 3.1 Standalone PWA / Web App

The PWA is the **main HB Intel experience**.

It is the primary fluent environment for daily work outside SharePoint. It provides:

- Personal Work Hub as the main user operating layer
- Project Hub as the main project operating layer
- access to specialized work domains
- unified search and connected context
- integrated insight, visibility, and decision support
- installed, near-native confidence on desktop and tablet

### 3.2 SharePoint Companion Views

SharePoint web parts are **focused companion views** inside Microsoft 365.

They exist to serve departmental or project-specific contexts where SharePoint-native placement is useful, but they are not the primary definition of the HB Intel experience.

Their purpose is focused access, not duplication of the full operating platform.

### 3.3 HB Site Control

HB Site Control is a **separate field-first application experience** for site-oriented work.

It remains part of the same platform under the hood, using the same core services, permissions, connected records, and shared architecture principles, but it is optimized for:

- field readability
- mobile and tablet use
- selected offline-capable workflows
- job-site execution confidence
- simplified, context-sensitive interaction patterns

---

## 4. Core Operating Model

### 4.1 Two-center architecture

HB Intel is organized around a two-center model:

#### Personal Work Hub

The **Personal Work Hub** is the main user-centered operating layer.

It is an action-oriented command center first, with dashboard behavior second.

Its job is to tell a user:

- what needs attention now
- what changed
- what they own
- what is blocked
- what is waiting on someone else
- what is most important next

It should also provide jump-off points into deeper domain and project work.

#### Project Hub

The **Project Hub** is the main project-centered operating layer.

It is the authoritative place to understand and operate around project status, workflow state, risks, documents, linked work, team visibility, and cross-functional activity.

It is a project command center first and a project navigation wrapper second.

### 4.2 Deepest structural anchors

The platform is organized around two primary anchors:

- **people/work**
- **projects/work**

Departments, tools, and specialized domains connect back to one or both. The platform must not drift into a department-first or app-first model.

### 4.3 Connected lifecycle platform

HB Intel is a **single connected lifecycle platform**.

It must support work across the full project lifecycle, including pursuit, estimating, setup, execution, quality/safety, financial controls, closeout, and related operational functions.

The architecture should encourage natural continuity from one stage to the next rather than isolated stage-specific silos.

---

## 5. User Experience Doctrine

### 5.1 Category benchmark and mold-breaker intent

HB Intel should meet or exceed current construction-tech leaders on:

- professionalism
- system consistency
- core enterprise patterns
- data density where appropriate
- configurability where valuable
- responsive shell behavior

HB Intel should deliberately surpass the category on:

- clarity and scanability
- visual hierarchy
- anti-flatness and depth
- lower cognitive load
- field usability
- implementation transparency
- adaptive complexity
- selective signal over noise
- cross-device continuity
- intuitive document access

The goal is not to resemble incumbent platforms. The goal is to make them feel more cluttered, more fragile, and more tiring by comparison.

### 5.2 Task-first, not module-first

HB Intel should be experienced primarily as a **task-first operating environment**, not as a loose set of heavyweight modules.

Modules and domains exist, but they should support work movement rather than force users to reconstruct process by navigating through application boundaries.

### 5.3 Accountability and context as first-class objects

HB Intel must treat accountability and context as core product objects.

Users should be able to see:

- who owns the next move
- what changed
- what decision is needed
- what is related
- what system or workflow is involved
- what can be done next

### 5.4 Adaptive complexity

The platform must adapt complexity to the user, role, device, and situation.

It should support simpler, more guided experiences for lighter users and deeper controls for expert users without forcing one dense interface model on everyone.

This is a platform rule, not just a screen-level preference.

### 5.5 Signal over noise

HB Intel should be highly selective about attention.

It must prioritize urgency, ownership, and next actions while suppressing low-value noise. Personal Work Hub must become a trusted signal surface, not just another activity stream.

### 5.6 Plain-language trust and explainability

When something goes wrong, behaves differently, or becomes blocked, the platform must explain in plain language:

- what happened
- why it happened
- what rule, permission, workflow, or outside system is involved
- what the user can do next

Implementation trust is part of the product architecture, not a support afterthought.

### 5.7 Strong continuity across devices

HB Intel should preserve user continuity across desktop, tablet, and phone as much as reasonably possible.

The user should not feel like they are restarting their work every time they change devices. Context, session state, recent work, and mode should carry forward where appropriate.

---

## 6. Domain and Workspace Model

### 6.1 Specialized work domains inside one platform

HB Intel includes specialized work domains such as Estimating, Business Development, Accounting, Admin, and future operational tools.

These remain specialized domains, but they are not separate products. They must:

- feed back into Personal Work Hub where user attention is involved
- connect through Project Hub where project context matters
- use shared platform services by default
- participate in connected records, search, history, and permissions

### 6.2 Leadership visibility without a standalone Leadership app

Leadership is not a separate target application.

Leadership visibility should be delivered through:

- Personal Work Hub
- Project Hub
- role-based views inside domain surfaces
- embedded analytics and decision support where work actually happens

This keeps leadership insight tied to the same live operating environment as the rest of the platform.

### 6.3 Governed personalization

The platform supports **governed personalization**, not unrestricted customization.

Users may personalize things such as:

- layout choices
- pinned tools
- saved views
- certain work preferences
- selected display choices

But the core operating model, workflow rules, and platform consistency remain standardized and governable.

---

## 7. Shared Platform Services

HB Intel is a modular platform that grows by plugging new domains into shared services and standards.

The following capabilities are treated as **platform-wide shared services by default**:

- authentication and session state
- notifications and attention routing
- ownership and next-move logic
- workflow handoffs and acknowledgements
- search
- related items and connected records
- strategic intelligence and assistance
- health/status indicators
- project context persistence
- audit/history
- governed personalization and complexity handling

A new domain should integrate with these services by default unless there is a strong architectural reason not to.

---

## 8. Workflow and Process Doctrine

### 8.1 Structured where risk is high

Critical, high-risk, or compliance-sensitive processes should be:

- guided
- structured
- approval-aware
- auditable
- traceable

### 8.2 Flexible where risk is low

Lower-risk operating work may remain lighter and more flexible.

The platform should not impose unnecessary ceremony where it slows useful day-to-day work.

### 8.3 Standardized by default, with controlled exceptions

HB Intel should push common workflow structures, statuses, and handoff patterns across departments and projects.

Exceptions are allowed where they create real value and are properly governed, not simply because a team prefers a local variant.

---

## 9. Traceability, Freshness, and Operational Trust

### 9.1 Traceability as a core platform rule

Important actions, approvals, handoffs, changes, and status movements should leave a clear history trail.

Users should be able to understand:

- what changed
- who changed it
- when it changed
- why it changed
- what happened next

### 9.2 Near real-time where it matters

HB Intel should feel near real-time where it matters most, especially for:

- assignments
- approvals
- status changes
- handoffs
- project issues
- important user and project signals

Less critical information may refresh on more normal patterns.

### 9.3 Unified working view with source transparency

HB Intel should present a unified working view to the user even when data comes from different systems.

At the same time, the platform must clearly show source ownership when it matters for:

- record authority
- approvals
- trust
- provenance
- integration behavior

---

## 10. Data, Records, and Connected Context

### 10.1 Connected records are a core architectural trait

HB Intel should strongly emphasize connected records and connected context.

Users should be able to move naturally between:

- work items
- related records
- approvals
- documents
- project context
- people and accountability context

The platform should reduce hunting across modules and systems to reconstruct meaning.

### 10.2 Search model

HB Intel uses a hybrid search model:

- one strong platform-wide search experience
- deeper domain-specific search tools where needed

Global search should support finding important work, records, documents, people, and project context quickly, while specialized domains may provide deeper filtering and domain-aware search behavior.

### 10.3 Source-of-record model

HB Intel is the **main working layer** across the platform.

In early production stages, some outside systems remain the source of record for selected domains. Over time, HB Intel should be designed so it can take ownership of selected domains directly where that creates a better platform outcome.

---

## 11. Document and File Experience

### 11.1 HB Central / SharePoint remains the main document system

HB Central / SharePoint remains the primary enterprise document storage system.

HB Intel does not need to become a separate enterprise file store to succeed.

### 11.2 HB Intel solves the access problem

HB Intel’s target role is to make SharePoint-based file access feel:

- intuitive
- consistent
- easier than the current mix of SharePoint Online, OneDrive, Teams, and local sync habits

The platform should reduce confusion and friction around document access by making file interaction part of the operating experience rather than a separate, fragmented storage experience.

### 11.3 Documents as part of connected work

Documents should not sit outside the operating model.

They should participate in:

- project context
- related-item context
- search
- visibility
- workflows where relevant
- accountability and recent activity where appropriate

---

## 12. UI and Experience Governance

### 12.1 High-level UI doctrine

HB Intel must present one coherent operating environment across all UI-bearing surfaces.

The target architecture requires:

- strong visual hierarchy
- anti-flatness and purposeful depth
- premium but restrained visual language
- field-capable readability and interaction
- adaptive density
- clear action emphasis
- composition quality in full pages, not just isolated components
- consistency across PWA, companion views, and field-first experiences

### 12.2 Ownership model

`@hbc/ui-kit` is the owner of:

- reusable visual primitives
- reusable layout/composition primitives
- shared visual language
- theme and token contracts
- cross-app presentational standards

UI-bearing components may exist outside the UI kit only as **governed exceptions** when tightly coupled to package-specific behavior, runtime state, or workflow mechanics.

Package location does not exempt any UI-bearing surface from the same standards for:

- visual quality
- hierarchy
- accessibility
- theming
- field readiness
- responsiveness
- documentation
- verification

### 12.3 Detailed UI governance location

This blueprint states the architectural doctrine at a high level.

Detailed UI rules, release gates, and governance are delegated to:

- `ADR-0116-ui-doctrine-and-visual-governance.md`
- UI-kit reference documentation
- component maturity and consumer mapping artifacts
- visual benchmark and mold-breaker reference docs

---

## 13. Identity, Permissions, and Access Control

### 13.1 Central permission model

HB Intel uses a **central role-and-permission model**.

Base access is driven by:

- role
- team
- project assignment
- platform rules

### 13.2 Controlled adjustments

The architecture also allows governed exceptions:

- app-level granular adjustments approved by admins
- project-level permission adjustments requested by the Project Manager and approved by the Project Executive

### 13.3 Internal-first, expandable externally

HB Intel is designed **internal-first**, but it must remain expandable to controlled outside-party access later where that creates value.

The target architecture should allow controlled support for selected external participants such as owners, clients, consultants, vendors, or trade partners without assuming they are a primary initial audience.

---

## 14. Automation, Intelligence, and Assistance

### 14.1 HBI as a broad platform layer

HBI assistance and automation should be built broadly into the platform where they add value.

This includes:

- summarization
- intelligent search and retrieval support
- task and workflow assistance
- contextual recommendations
- drafting and generation support
- prioritization and attention shaping
- structured guidance in selected flows

### 14.2 Human control on important actions

Important actions must remain human-governed.

The architecture should support intelligent assistance without making users surrender control of approvals, significant changes, or sensitive business actions.

---

## 15. Integration Architecture

### 15.1 Integration posture

HB Intel begins as an operating layer on top of multiple outside systems and is designed to internalize selected capabilities later.

### 15.2 Integration model

The target integration model is **hybrid**, with a strong default toward a shared integration layer.

This means:

- common integration patterns should be centralized and governed where practical
- domains may own specialized integrations where the use case truly requires it
- the platform should avoid every domain inventing its own ad hoc integration style

### 15.3 Integration trust

Where outside systems remain involved, users should be able to understand:

- what system is being used
- what that system owns
- what sync or dependency exists
- what limitations or failure conditions apply

---

## 16. Hosting, Runtime, and Delivery Model

### 16.1 Main hosting model

The target architecture is built around a cloud-first delivery model with:

- PWA/web application as the primary experience
- companion SharePoint surfaces where helpful
- a separate field-first application for Site Control
- shared backend and service architecture underneath

### 16.2 Connectivity model

HB Intel is cloud-first overall, with strong offline support for selected workflows.

The platform should not assume perfect connectivity in field conditions.

Selected workflows, especially field-heavy ones, must be designed to continue gracefully during weak connectivity or delayed sync conditions.

### 16.3 Device-intelligent delivery

Different surfaces may optimize differently by device and context, but they should all remain part of one coherent platform.

---

## 17. Analytics, Insight, and Decision Support

Analytics and leadership visibility are embedded into the main operating surfaces rather than isolated into a standalone reporting product.

This means:

- Personal Work Hub includes prioritized visibility for the individual user
- Project Hub includes project-centered insight and risk understanding
- role-based domain views include contextual metrics and decision support where work happens
- analytics should support action, not create a separate universe of passive dashboards

---

## 18. Growth and Extensibility

### 18.1 Modular platform growth

HB Intel must grow as a **modular platform**.

New departments, tools, and workflows should plug into the same:

- shared services
- permission model
- UI standards
- search model
- connected-record model
- traceability rules
- personalization and complexity rules

### 18.2 Company-first, future-expandable

The platform is designed for Hedrick Brothers first.

At the same time, the architecture should remain clean enough to support multi-company expansion later if that ever becomes desirable.

The target architecture should not over-engineer for that future today, but it should avoid closing the door unnecessarily.

---

## 19. Non-Goals

HB Intel is **not** intended to become:

- just a dashboard layer
- just a SharePoint wrapper
- just a launcher for other systems
- a pile of disconnected departmental apps
- a visually inconsistent platform with separate mini design systems
- a document storage replacement for its own sake
- a rigid workflow engine for every kind of work
- a system that hides source ownership or implementation behavior from the user
- a product that treats field users as second-class compared to office users
- a platform that confuses raw activity volume with meaningful signal

---

## 20. Architecture Guardrails

The target architecture should preserve the following guardrails over time:

1. **Personal Work Hub remains the primary user operating layer.**
2. **Project Hub remains the primary project operating layer.**
3. **People/work and projects/work remain the two structural anchors.**
4. **Shared services remain the default for cross-platform capabilities.**
5. **UI coherence and visual governance are treated as architecture concerns, not styling preferences.**
6. **Critical workflows remain auditable and explainable.**
7. **HB Intel remains the central operating layer even when outside systems remain source-of-record in selected domains.**
8. **Connected records and connected context remain first-class platform traits.**
9. **The platform continues to optimize for lower-friction work movement, not feature sprawl.**
10. **Growth happens by modular extension, not by adding disconnected products.**

---

## 21. Summary Statement

HB Intel’s finished target architecture is a **connected, modular, people-and-project-centered operating platform** for the full construction lifecycle.

It is built around:

- **Personal Work Hub** as the main user command center
- **Project Hub** as the main project command center
- **shared platform services** by default
- **connected records and lifecycle continuity**
- **clear accountability and traceability**
- **field-capable and office-capable experiences on one platform**
- **plain-language implementation trust**
- **visual and experiential coherence strong enough to break from the current category standard**

The architecture is successful when HB Intel feels like the easiest, clearest, and most trustworthy place to work from — not because it hides complexity, but because it organizes it intelligently.

---

*End of Target-Architecture-Blueprint.md*
