# Public App Blueprint

## Public app objective

Deliver a role-first operating shell for PM / Superintendent / PX that helps users:

- discover the right standard quickly
- understand where they are in the operating corridor
- understand what artifacts and source items matter
- see handoff implications
- move efficiently into source templates, forms, checklists, logs, and references

## Shell posture

The public app is a:

- full-bleed SPFx shell
- single primary app surface on the site
- hybrid navigation experience
- standards-first application, not a project-instance workflow tool

## Landing experience

The MVP landing experience should be a **shared triad home** with role switching always visible.

Recommended elements:

- application title / purpose banner
- visible role switcher
- role cards for PM / Superintendent / PX
- top corridor cards for A/B/C/D
- search/command bar
- supporting-package access
- “browse by lifecycle” entry
- “operating path” entry

## Movement patterns

The app should support:

- persistent shell navigation
- card-based corridor and package movement
- command/search movement
- direct entry into promoted child packages

## Primary public views

### 1. Triad Home

Shared landing page for PM / Superintendent / PX.

Purpose:

- establish operating model
- make role switching easy
- point users toward top-priority corridors and packages

### 2. Role Workspace

Role-specific view for PM, Superintendent, or PX.

Purpose:

- show relevant corridor priorities
- show key packages for that role
- show supporting packages most relevant to that role
- keep role context visible while still enabling exploration

### 3. Operating Path View

Sequenced view of packages across the lifecycle corridor.

Purpose:

- teach continuity
- reinforce recommended order
- show how packages relate across turnover, startup, buyout, and controls

### 4. Corridor Package View

Parent package experience.

Purpose:

- give users a governed operating brief
- show the main standard and logic of the corridor
- expose child packages
- show role overlays and supporting dependencies

### 5. Child Package View

Focused sub-process standard.

Purpose:

- help users act on a narrower standard quickly
- provide immediate curated guidance and source references

### 6. Supporting Package View

First-class supporting-package experience for:

- Safety
- Legal
- Project Accounting
- Quality Control

Purpose:

- surface support standards that cut across the main corridors

## Package page structure

Every package page should begin with an **operating brief** above the linked source documents.

Recommended public layout:

1. package title
2. parent corridor context
3. role tags
4. lifecycle location
5. trust markers
6. purpose
7. trigger / when to use
8. roles involved
9. key handoffs
10. required artifacts
11. start-here steps
12. common misses / escalation points
13. linked source items
14. adjacent references
15. feedback entry point

## Role overlays inside packages

The standard itself stays shared.
Role overlays interpret the standard for each role.

### PM overlay
Focus on:

- coordination and accountability
- approvals and routing
- required artifacts
- management cadence
- commercial/control implications

### Superintendent overlay
Focus on:

- field setup
- site control rhythm
- checklists and logs
- safety and quality startup
- execution-readiness implications

### PX overlay
Focus on:

- oversight checkpoints
- risk review
- handoff completeness
- commercial/strategic visibility
- escalation posture

## File-opening behavior

Hybrid by file type.

Suggested behavior:

- preview-friendly PDFs: in-app preview first
- simple Word/PDF references: preview or panel when practical
- Excel trackers/logs/templates: native open preferred
- M365 forms/templates needing active editing: native open preferred
- legal/complex operational forms: native open preferred unless high-value preview exists

## Public trust markers

Show selectively, not excessively.

Recommended:

- Published / Superseded indicator
- Effective date
- Last reviewed date
- Primary advisory owner
- caution / review-needed badge where needed

## Search and command behavior

Search should always be present and strong, but package-first.

Default search behavior:

- governed packages first
- child packages next
- typed source items nested under the most relevant package context
- users should understand they are using an operating system, not raw document search

## Personalization posture

None in MVP.

No personal dashboarding.
No pinned favorites.
No saved role preferences beyond what the shell may infer or centrally set.

The app should remain governed and standardized.
