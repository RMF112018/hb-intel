# 06 — Implementation Plan

## Objective

Provide a staged implementation outline aligned to the finalized topology.

## Phase 1 — Foundation
- confirm site topology
- provision upload library on `/sites/Safety`
- provision authoritative safety lists on `/sites/HBCentral`
- lock checklist template version 1
- define parser contract

## Phase 2 — Ingestion backend
- upload submission endpoint / command
- template validation
- project resolution
- score recalculation
- record creation on HBCentral
- ingestion audit logging

## Phase 3 — Safety-site application UX
- upload page
- reporting-period dashboard
- review-required queue
- project-week completion view
- inspection history drill-in

## Phase 4 — Findings and corrective actions
- structured issue extraction
- manager review
- corrective-action assignment

## Phase 5 — Downstream publish model
- project-week rollups
- publish snapshots
- Safety Field Excellence integration

## Phase 6 — Template hardening / vNext
- correct formula-row mismatches
- introduce versioned normalized scoring
- maintain backward compatibility for v1 uploads

## Future phase — native offline field capture
- only after offline-first reliability is proven
- should write the same backend model as upload-first intake
