# Blueprint Overview and Decision Lock

## Objective

Build a new **interactive SPFx Core Processes / Followed By All application** that functions as a **role-first operating system** for how Hedrick Brothers hands work off, starts work, buys work out, and controls work.

This application is not primarily a procedures-manual access tool.
It is an operating layer that helps users understand:

- what standards apply to their role
- where they are in the operating lifecycle
- what handoffs matter
- what artifacts and source references they need
- where to go next in the existing procedures-manual source layer

## Product posture

The MVP is:

- SPFx-hosted inside the SharePoint tenant
- delivered as a **full-bleed shell**
- effectively the only application/content on the site
- a **global standards administration** platform
- not yet a project-by-project workflow application
- future-proofed with a dormant seam for later project-context evolution

## MVP design center

Primary audience:

- Project Managers
- Superintendents
- Project Executives

Secondary audience:

- department leaders
- process owners
- central program administration

## Organizing logic

Priority order:

1. **Role**
2. **Lifecycle**
3. **Handoff**

This means users first understand the application through their operating role, then see where they are in the lifecycle, then see the upstream/downstream handoff implications.

## MVP operating corridor

The MVP must scaffold all of the following at launch:

- A. Preconstruction / estimating turnover into operations
- B. Project startup / mobilization / responsibility matrix setup
- C. Subcontractor buyout / procurement coordination
- D. Active execution controls

All four launch with meaningful scaffold depth.
A receives the most refined first pass, but the product architecture must already support all four at near parity.

## Supporting-domain strategy

Mixed-by-designation model.

First-class supporting packages at MVP launch:

- Safety
- Legal
- Project Accounting
- Quality Control

Other supporting domains may remain embedded as modules only.

## Content strategy

Hybrid content model:

- app-managed structure and curation
- existing SharePoint document library remains source layer

The current procedures-manual library is not discarded or fully rewritten in the MVP.
Instead, the application translates the legacy library structure into a new operating model.

## Governance model

MVP governance is centralized:

- central team drafts
- central team edits
- central team publishes

No distributed authoring for the MVP.

Package state model:

- Draft
- Review
- Published
- Superseded
- Archived

## Package model

Primary admin object:

- **Governed Process Package**

Hierarchy:

- corridor packages
- child sub-process packages/modules underneath

Child packages use mixed governance rules:

- some independently discoverable
- some nested only
- some independently publishable
- some locked to parent corridor publish state

## Public UX posture

- shared triad home
- role switching always visible
- prioritized dashboard view
- sequenced operating-path view
- package-first discovery
- command/search always available
- no personalization in MVP

## Source layer rules

Source references are:

- typed from day one
- canonical-first with controlled exceptions
- opened through a hybrid model by file type
- shown with public trust markers where appropriate

## Trust and freshness posture

Public users should see selective trust markers, not full governance metadata.

Visible public trust markers may include:

- effective date
- last reviewed date
- package status
- primary advisory owner
- source references
- caution / review-needed labeling for stale linked material

Companion freshness posture:

- warning-based enforcement
- central override allowed
- not a hard publish block

## Feedback posture

Users can submit structured feedback.

Feedback model:

- one master queue
- routed filtered views by package, role, lifecycle stage, issue type, and urgency

## Reinforcement posture

Reinforcement / Olympian-style training is not a core MVP priority.
The architecture should not depend on reinforcement features to justify the product.
