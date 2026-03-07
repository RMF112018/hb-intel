# ADR-0060: Project Identifier Model — projectId + projectNumber

- **Status:** Accepted
- **Date:** 2026-03-07
- **Traceability:** D-PH6-16
- **Deciders:** HB Intel Architecture Working Group

## Context
Phase 6 provisioning requires a stable system key for orchestration and a business-visible identifier for users and SharePoint naming. Prior phase behavior used a mixed `projectCode` concept that created ambiguity and weak referential guarantees.

## Decision
Adopt a dual-identifier model:
- `projectId`: immutable UUID v4 generated at request submission and used as the primary internal key.
- `projectNumber`: controller-assigned business identifier (`##-###-##`) required before provisioning begins.

`projectId` is mandatory for storage keys, saga correlation, and API addressing. `projectNumber` is mandatory for site naming, user display, and business workflows.

## Consequences
- Removes `projectCode` ambiguity from Phase 6 runtime paths.
- Supports idempotent retries keyed by immutable internal identity.
- Preserves business-facing numbering and approval gates.

## Alternatives Considered
- Single identifier (`projectNumber` only): rejected due to delayed availability and mutable business timing.
- Single identifier (`projectId` only): rejected due to poor business usability and SharePoint naming needs.
