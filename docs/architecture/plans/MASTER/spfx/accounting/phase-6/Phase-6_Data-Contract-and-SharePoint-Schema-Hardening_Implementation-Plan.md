# Phase 6 — Data Contract and SharePoint Schema Hardening Implementation Plan

## Objective

Harden the persistence and schema contract for the Project Setup workflow so the Accounting app, backend, and connected provisioning flows operate against a stable, production-safe SharePoint-backed request-record model.

## Why this phase exists

The Project Setup workflow already depends on the SharePoint `Projects` list as the request record store, and the live repo already implements a mixed mapping strategy that includes legacy `field_N` columns plus newer named columns.

This phase exists to eliminate ambiguity in:

- what the canonical request record actually is
- how SharePoint fields are mapped
- how `requestId`, `projectId`, and `projectNumber` are really used
- what legacy compatibility is intentional vs accidental
- what schema shape production can safely rely on

## Critical repo-truth starting point

Phase 6 must begin from the real implementation state, not from an idealized target model.

Current repo truth includes all of the following:

- request persistence flows through:
  - `backend/functions/src/services/projects-list-contract.ts`
  - `backend/functions/src/services/projects-list-mapper.ts`
  - `backend/functions/src/services/project-requests-repository.ts`
- submit/read lifecycle flows through:
  - `backend/functions/src/functions/projectRequests/index.ts`
- canonical domain types live in:
  - `packages/models/src/provisioning/IProvisioning.ts`
- current persistence behavior aliases `requestId` and `projectId` in practice
- `projectNumber` remains a distinct human/business identifier
- the SharePoint schema is mixed:
  - legacy `field_1`..`field_24`
  - named columns such as `viewerUPNs`, `addOns`
  - named P2-07 columns
  - named identity columns

Any attempt to “freeze” a cleaner contract must explicitly decide whether it is:

- documenting current aliased behavior, or
- deliberately migrating the repo to a new separated-key contract

## Required outcomes

### 1. Canonical request-record contract

The repo must clearly define:

- persisted system-key semantics
  - `requestId`
  - `projectId`
- whether those keys are currently aliased or deliberately separated
- human/business identifiers
  - `projectNumber`
- workflow state fields
- submission/review fields
- clarification fields
- completion fields
- provisioning linkage fields
- optional metadata / enrichment fields

### 2. Canonical SharePoint mapping contract

The repo must clearly define:

- every SharePoint column used by Project Setup
- display name vs internal name
- type expectation
- required / optional status
- compatibility behavior for legacy/imported columns
- named-column coexistence behavior
- any migration assumptions

### 3. Persistence invariants

The repo must explicitly state and then enforce, to the degree claimed:

- how the durable persisted key works today
- whether `requestId` and `projectId` are expected to stay aliased or diverge
- that `projectNumber` is separately validated and must not be treated as the system key
- that mapper/repository behavior does not silently corrupt identifiers
- that lifecycle, clarification, completion, and site URL fields are not silently dropped

### 4. Compatibility / migration posture

If the production list still contains generic imported internal names, the repo must:

- document them explicitly
- map them deliberately
- avoid unsafe hidden assumptions
- define what is tolerated in production
- define what is optional normalization vs hard requirement

## Recommended execution order

### Stage 1 — Repo-truth audit
Audit the real implementation across models, mapper, repository, handlers, and consuming surfaces.

Primary output:
- a single evidence-backed review artifact describing the actual contract and actual risks

### Stage 2 — Canonical contract freeze
Freeze the canonical request-record contract from current repo truth.

Primary output:
- one authoritative request-record contract document
- one clear statement of identifier semantics

### Stage 3 — Mapper and repository hardening
Harden the SharePoint mapper/repository behavior to match the frozen contract.

Primary output:
- deterministic mapping behavior
- explicit compatibility handling
- targeted tests

### Stage 4 — Migration / compatibility and schema validation hardening
Define the production-safe schema posture and implement warning/blocking safeguards as appropriate.

Primary output:
- explicit production schema posture
- explicit legacy compatibility posture
- explicit operational risk statement

### Stage 5 — Cross-surface verification
Verify the hardened contract across Accounting, backend lifecycle, provisioning linkage, and shared client seams.

Primary output:
- clear consumer compatibility matrix
- controlled-gap list if anything remains

### Stage 6 — Final documentation reconciliation and closure
Reconcile all touched docs and produce the final readiness statement.

Primary output:
- final closure report in the same review artifact
- explicit go / no-go recommendation for downstream work

## Expected review artifact

Use and maintain:

`docs/architecture/reviews/project-setup-phase-6-data-contract-and-schema-audit.md`

If the file does not yet exist, create it in Prompt-01 and continue updating it throughout the phase.

## Completion standard

Phase 6 is complete only when:

- the repo has one authoritative Project Setup request-record contract
- the repo has one authoritative SharePoint mapping contract
- the current aliased or separated identifier model is explicit
- mapper/repository behavior matches the documented contract
- compatibility posture is explicit
- documentation reflects actual repo truth
- the closure report states whether downstream phases can rely on the contract without schema guesswork
