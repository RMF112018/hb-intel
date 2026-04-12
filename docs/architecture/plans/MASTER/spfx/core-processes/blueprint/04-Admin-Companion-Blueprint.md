# Admin Companion Blueprint

## Companion objective

Deliver a centralized governance workspace for the standards system.

The companion should allow a central admin team to:

- draft packages
- edit packages
- publish packages
- manage corridor/child relationships
- attach and classify source references
- manage lifecycle/role associations
- track trust/freshness
- triage structured feedback
- monitor coverage and content health

## Governance posture

Centralized only for MVP.

No distributed authoring.
No process-owner self-publishing.
No broad contributor editing.

## Core admin views

### 1. Admin command home

Balanced command view combining:

- content health
- coverage gaps
- usage/feedback signals

Weighted toward content health at launch.

### 2. Package library

Main management view of all packages.

Recommended filters:

- corridor vs child
- state
- role association
- lifecycle stage
- supporting domain
- freshness warning
- promoted child status
- parent-locked vs independently publishable

### 3. Package editor

Structured editor for:

- required package spine
- optional modules
- role overlays
- lifecycle associations
- supporting package relationships
- source item references
- trust metadata
- advisory ownership

### 4. Source reference manager

View for:

- canonical source references
- derivatives / exceptions
- source item typing
- freshness tracking
- package reuse relationships

### 5. Feedback center

Feedback intake management using:

- master queue
- routed views

Routed views by:

- package
- role
- lifecycle stage
- issue type
- urgency

### 6. Coverage and health view

Admin reporting view that highlights:

- missing packages by corridor
- weak coverage by role
- stale packages
- missing required package-spine fields
- over-dependent packages with too many uncategorized references
- high-friction packages from search/feedback patterns

## Package state model

Required states:

- Draft
- Review
- Published
- Superseded
- Archived

Recommended operational behavior:

- Draft: editable, not public
- Review: ready for central decision, not public
- Published: visible in public app
- Superseded: no longer current, but retained for traceability
- Archived: retired and hidden from normal public discovery

## Freshness model

Warning with override.

Recommended behavior:

- freshness thresholds configured centrally
- stale linked source references trigger warnings
- stale package warnings visible in companion
- central admin can override to keep live
- override reason captured internally

## Feedback model

Users can submit structured feedback from the public app.
Companion must support:

- master intake queue
- routed views
- status tracking
- linkage to package
- linkage to child package if applicable
- triage notes
- resolution notes
- possible follow-up actions

## Advisory ownership model

Each package should record:

- one primary advisory owner
- required secondary stakeholders where relevant

This metadata supports governance clarity and future growth, without changing centralized publishing control.

## Child-package governance model

Mixed relationship model.

Companion should allow central admins to mark child packages as:

- independently discoverable or nested only
- independently publishable or parent-locked
- promoted “key standards” or ordinary nested modules

## Minimum editor capabilities

Recommended editor sections:

- Basic package info
- Role associations
- Lifecycle associations
- Parent/child hierarchy
- Public operating brief
- Role overlays
- Required artifacts
- Common misses / escalation notes
- Source references
- Trust/freshness fields
- Advisory ownership
- Package state controls
- Feedback summary
