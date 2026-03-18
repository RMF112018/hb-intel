# @hbc/data-access

Data access layer for HB Intel — ports/adapters architecture (ADR-0002) providing domain-agnostic data integration.

## Production Contract

### Public API Surface

| Export Path | Purpose | Stability |
|---|---|---|
| `@hbc/data-access` | Main entry: factory, adapter mode resolver | Stable |
| `@hbc/data-access/ports` | Port interfaces (repository contracts) | Stable |
| `@hbc/data-access/adapters/*` | Adapter implementations (mock, proxy, sharepoint) | Evolving |

### Exports

- `resolveAdapterMode()` — Detects runtime adapter mode (mock/sharepoint/proxy/api)
- `createDataAccessFactory(mode)` — Returns mode-aware adapter factory
- Port interfaces per domain: `ILeadRepository`, `IScheduleRepository`, `IBuyoutRepository`, `IEstimatingRepository`, etc.

### Breaking Change Policy

- Port interfaces are stable — breaking changes require an ADR
- Adapter implementations may evolve within a major version
- New adapters can be added without breaking changes
- Removal of an adapter mode requires deprecation notice + 1 minor version migration window

### Versioning Strategy

- Pre-1.0: `0.x.y` — port contracts stabilizing; breaking changes documented in CHANGELOG
- 1.0: Port interfaces locked; adapter implementations stable; production-grade
- Post-1.0: Semver strict — major for port breaks, minor for new adapters/domains, patch for fixes

### Integration Path Readiness (as of 2026-03-18)

| Adapter Mode | Classification | Phase Target | Current State |
|---|---|---|---|
| `mock` | **Production-ready** (dev/test) | Available now | 11 repositories fully implemented with CRUD, pagination, seed data, test isolation |
| `proxy` | **Partial** (7 of 11 repos) | Phase 1 (P1-B1) | Transport foundation (ProxyHttpClient, envelope parsers, error normalization, path builders) + 7 project-scoped repos (Schedule, Buyout, Compliance, Contract, Risk, Scorecard, PMP) implemented and factory-wired. Remaining: Lead, Project, Estimating, Auth. |
| `sharepoint` | **Not implemented** | Phase 5+ | No adapter directory exists; factory throws `AdapterNotImplementedError` |
| `api` | **Stub** (config only) | Phase 7+ | Types + constants in `adapters/api/`; zero repository implementations; factory throws `AdapterNotImplementedError` |

**Backend proxy handler** (`backend/functions/src/functions/proxy/`): Stub — validates auth and builds cache keys but returns `{ _mock: true }` hardcoded responses. Real Graph API forwarding is a Phase 1 deliverable.

### Phase 1 Adapter Strategy

Phase 1 delivers production proxy adapters (P1-B1) replacing mock adapters for domain data routes per ADR-0002:
- Mock adapters remain available for development and testing
- Production adapters use proxy-to-backend pattern with OBO token forwarding (see P1-B1)
- Domain source-of-record mapping per P1-A2

### Dependencies

- `@hbc/models` (workspace) — domain type contracts

### Coverage Requirements

- Minimum 85% line coverage for production adapter code
- Integration tests required for each production adapter pattern
- Mock adapter tests serve as contract verification

### Maturity

| Field | Value |
|---|---|
| **Version** | 0.1.0 |
| **Readiness** | usable-but-incomplete |
| **P0-B1 Label** | usable-but-incomplete |
| **Phase 1 Role** | Foundation data-plane package (ADR-0002) |

### Production Contract Approval

- **Approved by:** Architecture Lead, 2026-03-16
- **Contract scope:** Port interfaces and adapter factory pattern
- **Next review:** Phase 1 mid-point (after first production adapter ships)
