# ADR-0002: Ports/Adapters Pattern for Data Access

**Status:** Accepted
**Date:** 2026-03-03
**Context:** Blueprint §1b, §2d

## Decision

Replace the monolithic `IDataService` (250+ methods) with domain-scoped repository port interfaces and swappable adapter implementations following the ports/adapters (hexagonal architecture) pattern.

## Structure

- **Ports** (`src/ports/`): One abstract interface per domain (11 total). Each defines CRUD + domain-specific query methods using `@hbc/models` types.
- **Adapters** (`src/adapters/`): Four adapter directories, one per runtime mode:
  - `mock/` — In-memory implementations for dev-harness and unit tests (3 implemented: leads, schedule, buyout).
  - `sharepoint/` — PnPjs-based implementations for SPFx webparts (Phase 5).
  - `proxy/` — Azure Functions proxy implementations for PWA with MSAL on-behalf-of (Phase 4).
  - `api/` — Future REST API implementations for Azure SQL migration (Phase 7+).
- **Factory** (`src/factory.ts`): Mode-aware factory functions that return the correct adapter based on `HBC_ADAPTER_MODE` environment variable. Defaults to `mock`.

## Rationale

- Eliminates the god-interface anti-pattern; each domain has a focused, testable contract.
- Adapters are swappable at runtime — the same UI code works across SPFx, PWA, and dev-harness.
- Mock adapters enable development and testing without SharePoint or Azure dependencies.
- Factory pattern centralizes adapter resolution, making mode switching explicit and predictable.

## Consequences

- Every new domain must define a port interface before any adapter implementation.
- Adapter implementations must satisfy the full port contract (enforced by TypeScript).
- The factory must be updated when new adapters or domains are added.
