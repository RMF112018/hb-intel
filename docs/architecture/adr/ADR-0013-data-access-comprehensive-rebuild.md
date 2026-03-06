# ADR-0013: Data Access Comprehensive Rebuild (Phase 2.2)

**Status:** Accepted
**Date:** 2026-03-03
**Deciders:** HB Intel Architecture Team

## Context

Phase 2.1 (`@hbc/models`) established 13 domain type definitions. The `@hbc/data-access` package had 11 port interfaces defined but only 3 of 11 domains had mock adapters and factory functions (Lead, Schedule, Buyout). The remaining 8 domains had port interfaces only — no mock adapters, no factory functions, and no error handling infrastructure.

This left downstream packages (`@hbc/query-hooks/project`, `@hbc/query-hooks/scorecard`) blocked, unable to compile because `createProjectRepository` and `createScorecardRepository` did not exist.

## Decision

Perform a comprehensive rebuild of `@hbc/data-access` to:

1. **Add a typed error hierarchy** — `HbcDataAccessError` base class with `NotFoundError`, `ValidationError`, `AdapterNotImplementedError`, and `wrapError()` utility.

2. **Introduce `BaseRepository<T>`** — Abstract class providing `wrapAsync()`, `validateId()`, and `throwNotFound()` helpers for all adapters.

3. **Decompose the monolithic mock file** — Split `adapters/mock/index.ts` (3 classes + helpers + seed data) into per-domain files with shared infrastructure (`helpers.ts`, `seedData.ts`, `types.ts`, `constants.ts`).

4. **Implement all 11 mock adapters** — Add 8 missing mock adapters (Estimating, Compliance, Contract, Risk, Scorecard, PMP, Project, Auth) with realistic seed data.

5. **Expand factory to 11 domains** — Add 8 new `create*Repository()` functions using `AdapterNotImplementedError` for non-mock modes.

6. **Add stub adapter typed configs** — SharePoint, Proxy, and API adapters get `types.ts` and `constants.ts` files ready for Phase 4/5/7.

## Consequences

### Positive
- All 11 domains have mock adapters and factory functions — downstream packages unblocked
- Typed error hierarchy enables consistent error handling across adapters
- `BaseRepository` reduces boilerplate in concrete adapter implementations
- Per-domain mock files are independently testable and easier to maintain
- Seed data is centralized and reusable for tests
- Backward compatible — all existing imports resolve identically

### Negative
- Increased file count in the mock adapter directory (15 new files)
- Seed data duplication between mock adapters and potential future test fixtures

## Alternatives Considered

1. **Keep monolithic mock file** — Rejected: difficult to navigate, test, and maintain as domains grow.
2. **Skip error hierarchy** — Rejected: raw `throw new Error()` provides poor error discrimination for consumers.
3. **Generate mock adapters from port interfaces** — Rejected: over-engineered for 11 domains; manual implementation provides better seed data quality.

## References

- Blueprint §1b (data access layer), §2d (domain-scoped repositories)
- [ADR-0002: Ports/Adapters for Data Access](0002-ports-adapters-data-access.md)
- [PH2-Shared-Packages-Plan §2.2](../plans/PH2-Shared-Packages-Plan.md)
