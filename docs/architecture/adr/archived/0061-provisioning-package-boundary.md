# ADR-0061: @hbc/provisioning Package Boundary

- **Status:** Accepted
- **Date:** 2026-03-07
- **Traceability:** D-PH6-16
- **Deciders:** HB Intel Architecture Working Group

## Context
Provisioning UI concerns (API client, state store, SignalR integration, visibility helpers) were previously at risk of being duplicated across apps, increasing drift and release risk.

## Decision
Define `@hbc/provisioning` as the canonical frontend package boundary for Phase 6 provisioning behavior. The package owns:
- API client contracts for provisioning/request lifecycle endpoints.
- Provisioning state store and event handling.
- SignalR hook and group-aware progress subscription behavior.
- Visibility and notification helper logic used across apps.

Apps consume this package and do not re-implement provisioning core behavior locally.

## Consequences
- Reduces duplicate logic and cross-app inconsistency.
- Improves testability and CI gate enforcement at package level.
- Enables consistent release/version management for provisioning UX behavior.

## Alternatives Considered
- Keep logic per app: rejected due to duplication and divergent behavior risk.
- Move all provisioning logic into backend-only flows: rejected because app UX still requires shared client behavior.
