# Phase 6 — Data Contract and SharePoint Schema Hardening Implementation Plan

## Objective

Harden the persistence and schema contract for the Project Setup workflow so the Accounting app and backend operate against a stable, production-safe SharePoint data model.

## Phase intent

The Project Setup workflow currently depends on the SharePoint `Projects` list as the request record store, and the repo has already documented that the list originated from CSV import with generic internal field names in some places. This phase exists to eliminate ambiguity in how request records are persisted and retrieved.

## Primary goals

- freeze the canonical request-record contract
- validate actual SharePoint field mappings against repo truth
- harden mapper/repository logic against schema drift and legacy internal names
- preserve production data compatibility while improving safety
- reconcile all documentation to the final contract

## Required outcomes

### 1. Canonical request-record contract
The repo must clearly define:
- immutable identifiers
  - `requestId`
  - `projectId`
- human / business identifiers
  - `projectNumber`
- lifecycle fields
  - state
  - timestamps
  - actor fields
- clarification / review fields
- provisioning linkage fields
- completion / site URL fields

### 2. Canonical SharePoint mapping contract
The repo must clearly define:
- every SharePoint column used by Project Setup
- display name vs internal name
- type expectation
- required / optional status
- fallback or compatibility behavior for legacy fields
- any migration assumptions

### 3. Persistence invariants
The repo must explicitly guarantee:
- `requestId` remains stable across reads/writes
- `projectId` remains the durable system key used for provisioning
- `projectNumber` is human-assigned and separately validated
- no mapper behavior silently corrupts or aliases these identifiers

### 4. Compatibility / migration posture
If the production list still contains generic imported internal names, the repo must:
- document them explicitly
- map them deliberately
- avoid unsafe hidden assumptions
- define when migration is required vs optional

## Recommended execution order

1. Repo-truth audit
2. Canonical contract freeze
3. Mapper / repository hardening
4. Migration + schema validation hardening
5. Cross-surface verification
6. Final documentation reconciliation and closure report

## Completion standard

This phase is complete only when:
- the repo has one authoritative Project Setup data contract
- the mapper/repository behavior matches that contract
- documentation reflects actual repo truth
- legacy/internal-name ambiguity is either resolved or explicitly governed
- the closure report states whether downstream phases can rely on the contract without schema guesswork
