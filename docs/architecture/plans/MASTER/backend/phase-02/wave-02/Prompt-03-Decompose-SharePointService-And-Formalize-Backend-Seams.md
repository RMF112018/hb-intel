# Prompt 03 — Decompose SharePointService and Formalize Backend Seams

## Objective

Refactor the oversized mixed-authority backend service layer so production ownership is clearer, regression risk is lower, and future cutover work is easier to verify.

## Governing authorities

- current repo truth on `main`
- production-readiness requirement for maintainable service boundaries
- Graph-only direction of record for Safety data-plane operations
- existing control-plane / provisioning responsibilities that still legitimately require separate seams

## Files and seams to inspect

At minimum inspect:

- `backend/functions/src/services/sharepoint-service.ts`
- `backend/functions/src/services/safety-ingestion-graph-repository.ts`
- `backend/functions/src/services/safety-ingestion-graph-data-plane.ts`
- route handlers that consume `SharePointService`
- any service-factory or dependency-construction seams relevant to these classes

Do not re-read files that are already in your active context unless you need to confirm drift, dependencies, or uncertainty after making changes.

## Current gap to close

`SharePointService` still acts as a god-service and obscures which responsibilities are:
- Safety ingestion application logic
- Graph data-plane logic
- SharePoint/PnP provisioning logic
- preview/replay orchestration
- config/readiness enforcement

That is below production-ready maintainability standard.

## Required implementation outcome

Refactor toward clear seams such as:

- Safety ingestion application service
- Safety provisioning/control-plane service
- Graph data-plane service
- SharePoint/PnP provisioning service

Preserve external behavior where reasonable, but do not preserve bad boundaries merely to avoid moving code.

## Proof of closure required

- cleaner service ownership
- reduced mixed imports and mixed responsibilities
- no regression in Safety ingest/provision routes
- tests proving service-boundary behavior did not regress
- concise architecture note or README update describing the new boundary map

