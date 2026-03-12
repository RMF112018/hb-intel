PH7-SF-20: BD Heritage Panel & Living Strategic Intelligence — Cross-Module Project Context (Enhanced)

Priority Tier: 2 — Application Layer (BD and cross-module differentiator)
Module: Business Development (with cross-module surface in Project Hub + Estimating)
Interview Decision: Q11 (Option B — BD Heritage Panel with cross-module context) + Q12/Q13 (approval role config + contributor permissions for Living Strategic Intelligence)
Mold Breaker Source: UX-MB §3 (Unified Work Graph); ux-mold-breaker.md Signature Solution #3; con-tech-ux-study §4 (BD context loss post-handoff)

⸻

Problem Solved

When a BD lead converts to a project, the BD team’s institutional knowledge — why they pursued the client, what competitive pressures existed, what relationship history predates the project, what the client’s strategic priorities are — is trapped in the BD module and invisible to the Project team.

Project Managers who won the work often don’t know why the project was pursued, what commitments were made during business development, or what relationship context exists with the client.

This creates two compounding problems:
	1.	Context loss at handoff
	2.	Dead-end BD knowledge

The BD Heritage Panel solves context loss by surfacing BD intelligence directly in project views and pursuit views across the platform.

Living Strategic Intelligence solves knowledge stagnation by allowing project teams to continuously enrich the knowledge base during delivery.

⸻

Mold Breaker Rationale

Traditional construction platforms treat BD knowledge as static documents.

HB Intel treats BD knowledge as structured operational intelligence.

The BD Heritage Panel ensures that:

• the strategic reasoning behind a pursuit is preserved
• the delivery team understands client context
• knowledge becomes reusable for future pursuits

This aligns with the Unified Work Graph principle:

The relationship between a project and its BD origin must remain visible and actionable throughout the project lifecycle.

⸻

Core Concept

The system intentionally separates two knowledge layers.

Heritage Snapshot (Immutable)

The Heritage Snapshot captures the strategic context of the pursuit at the moment of Go/No-Go decision and handoff to delivery.

Snapshot contents include:

• decision rationale
• client priorities
• competitive context
• relationship intelligence
• risk assumptions
• pursuit strategy

The snapshot becomes immutable historical context and cannot be edited after handoff.

It is preserved using @hbc/versioned-record.

⸻

Living Strategic Intelligence (Additive)

After handoff, teams can contribute intelligence observations throughout the lifecycle:

• estimating
• preconstruction
• project execution
• post-project review
• market observation

Entries are additive and versioned.

Historical intelligence is never overwritten.

⸻

Entry Trust & Reliability Signals

Each intelligence entry includes trust signals.

Reliability Tier

Entries display a reliability indicator:

• High confidence
• Moderate confidence
• Low confidence
• Review required

Provenance

Entries identify their source:

• firsthand observation
• meeting summary
• project outcome learning
• inferred observation
• AI-assisted draft

Recency

Entries include timestamps:

• last validated date
• review-by date
• stale-content warnings

These signals help users quickly judge reliability.

⸻

Commitment Register

The Commitment Register records commitments made during pursuit.

Examples:

• schedule assurances
• staffing promises
• reporting expectations
• coordination sensitivities

Each commitment includes:

• description
• source of commitment
• responsible role
• fulfillment status
• related BIC item if unresolved

This prevents delivery teams from unknowingly breaking promises made during pursuit.

⸻

Heritage Handoff Workflow

A structured Handoff Review Mode ensures the delivery team actively reviews pursuit context.

Participants:

• Project Manager
• Project Executive
• Estimating Lead
• BD Lead

Review steps:
	1.	Heritage snapshot walkthrough
	2.	Commitment register verification
	3.	Strategic risk discussion
	4.	acknowledgment confirmation

Each participant records review acknowledgment.

⸻

Strategic Intelligence Contribution Workflow

Users can contribute new intelligence entries during project execution.

Each entry includes:

• entry type
• title
• detailed description
• tags and metadata
• supporting references

Lifecycle states:
	1.	submitted
	2.	pending approval
	3.	approved
	4.	rejected
	5.	revision requested

Approved entries become reusable intelligence assets.

⸻

Structured Metadata Model

To enable intelligence reuse, entries include normalized metadata:

• client
• owner organization
• project type
• sector
• delivery method
• geography
• competitor references
• lifecycle phase
• risk category
• confidence tier

Metadata supports similarity matching for reuse.

⸻

Supersession & Conflict Handling

Intelligence may evolve or conflict.

The system supports:

• supersedes relationships
• contradiction flags
• resolution notes

When conflicts exist, users see both entries and the resolution explanation.

⸻

Proactive Intelligence Reuse

Intelligence reuse is proactive rather than search-dependent.

The system surfaces suggested intelligence when:

• a similar client appears
• a similar project type is pursued
• the same competitor appears
• similar market conditions exist

Suggestions appear directly in pursuit workflows.

⸻

Explainability Layer

Every surfaced intelligence entry includes explainability context:

• why the entry was shown
• which metadata triggered the match
• historical reuse instances

Users no longer need to infer relevance.

⸻

Integration Points

Package	Integration
@hbc/strategic-intelligence	Core intelligence primitive
@hbc/bic-next-move	Ownership and accountability
@hbc/project-canvas	My Work lane integration
@hbc/versioned-record	Immutable heritage snapshots
@hbc/related-items	Deep linking
@hbc/complexity	Progressive disclosure
@hbc/acknowledgment	Approval workflow


⸻

Offline / PWA Resilience

The Heritage Panel supports full offline usage.

Capabilities include:

• IndexedDB local storage
• offline draft persistence
• background synchronization
• optimistic UI updates

Project teams can review heritage intelligence on tablets at job sites.

⸻

Priority & ROI

Priority: P1 — eliminates strategic context loss between BD and project delivery.

Estimated build effort: 5–6 sprint weeks

Expected benefits:

• preserved institutional knowledge
• improved client relationship continuity
• reusable strategic intelligence
• reduced onboarding friction for project teams

⸻

## Definition of Done

• Heritage snapshot captured at Go/No-Go
• Commitment register implemented
• Living intelligence workflow active
• Trust indicators implemented
• Metadata normalization enforced
• Handoff workflow operational
• Supersession/conflict handling implemented
• Suggested intelligence reuse operational
• Offline functionality validated

⸻

## ADR Reference

Create `docs/architecture/adr/ADR-0109-bd-heritage-living-strategic-intelligence.md` (and companion ADR for the new `@hbc/strategic-intelligence` primitive) documenting the BD Heritage Panel data sourcing strategy, the Living Strategic Intelligence contributor permission model, the approval authority configuration approach, granular BIC integration for gaps, complexity-adaptive disclosure, offline strategy, AI Action Layer embedding, cross-module deep-linking, versioning/governance, and telemetry KPIs.

---
