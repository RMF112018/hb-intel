# Delivery Waves, Backlog, and Validation

## Objective

Provide a practical phased path from concept to implementation without turning the MVP into a document-library reskin or over-scoping it into a workflow engine.

## Delivery philosophy

Build the product in this order:

1. operating model and data model
2. shell and package framework
3. content governance and source integration
4. corridor and child-package implementation
5. search and trust behavior
6. validation hardening
7. dormant future seam for project context

## Wave 0 — Blueprint to backlog

Deliverables:

- approved blueprint package
- object schema
- package hierarchy design
- taxonomy design
- SharePoint list/library design
- wireframe scope
- implementation backlog structure

Example epics:

- EPIC-01: Package Model
- EPIC-02: Public Shell
- EPIC-03: Companion Governance
- EPIC-04: Source Integration
- EPIC-05: Search and Trust
- EPIC-06: Feedback and Reporting
- EPIC-07: Corridor Content Implementation

## Wave 1 — Foundation

Deliverables:

- dedicated SPFx solution boundary
- public shell webpart scaffold
- companion webpart scaffold
- shared contracts/helpers
- SharePoint list structure
- basic seed/test data

## Wave 2 — Public shell MVP

Deliverables:

- triad landing experience
- role switching
- shell navigation
- corridor cards
- package page scaffold
- operating-path view
- package-first search shell

## Wave 3 — Companion MVP

Deliverables:

- admin home
- package library
- package editor
- source reference manager
- feedback queue
- content health and coverage views
- freshness warning/override support

## Wave 4 — Source integration and trust

Deliverables:

- source item typing
- canonical/derivative logic
- hybrid file-open behavior
- trust markers
- stale-source caution behavior
- source-item lifecycle metadata

## Wave 5 — Corridor and package implementation

Deliverables:

- A corridor deep implementation
- B/C/D near-parity implementation
- first-class supporting packages:
  - Safety
  - Legal
  - Project Accounting
  - Quality Control
- promoted child standards where designated

## Wave 6 — Search/discovery hardening

Deliverables:

- package-first ranking
- command search refinement
- filters/facets
- promoted child-package discovery behavior
- adjacent-reference patterns
- search struggle instrumentation

## Wave 7 — Validation and hardening

Deliverables:

- public harness
- companion harness
- seeded scenario model
- Playwright flows
- package/build validation
- role access tests
- search regression tests
- trust/freshness regression tests

## Recommended validation model

Match the rigor pattern proven in the existing Kudos work:

- unit tests for contracts and rules
- adapter tests for SharePoint seams
- harness for public and companion runtime
- seeded scenarios across package states
- browser tests against harness
- packaging freshness and inclusion validation

## Suggested initial backlog slices

### Slice 1
- package object schema
- package spine schema
- source type taxonomy
- role/lifecycle associations

### Slice 2
- public shell scaffold
- triad landing page
- shell navigation
- role switcher

### Slice 3
- corridor package view
- child package view
- supporting package view

### Slice 4
- companion admin home
- package library
- package editor scaffold

### Slice 5
- source reference ingestion model
- canonical/derivative relationships
- trust markers
- freshness fields

### Slice 6
- search/command layer
- package-first ranking
- child-package promotion behavior

### Slice 7
- structured feedback intake
- master queue
- routed companion views

### Slice 8
- A corridor deep implementation
- B/C/D near-parity scaffold
- Safety/Legal/Accounting/QC support elevation

## Definition of done for MVP blueprint execution

The blueprint should be considered successfully translated into implementation when:

- the new SPFx solution boundary exists
- public and companion shells are real, not placeholder docs
- packages are the primary governed object
- source item typing is enforced
- package-first search works
- trust/freshness markers work
- feedback intake works
- corridor/child package hierarchy works
- A is deeply implemented
- B/C/D are credible at near parity
- the dormant project-context seam exists but remains inactive
