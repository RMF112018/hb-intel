# Data Access Adapters — API Reference

**Package:** `@hbc/data-access`
**Blueprint Reference:** §1b, §2d
**ADR:** [ADR-0013](../../architecture/adr/0013-data-access-comprehensive-rebuild.md)

## Overview

Adapters are concrete implementations of the port interfaces. Each adapter slot (mock, SharePoint, proxy, API) provides the same domain repository interface but connects to a different data source.

## Error Hierarchy

All data-access errors extend `HbcDataAccessError`:

| Error Class | Code | Constructor | Use Case |
|-------------|------|-------------|----------|
| `HbcDataAccessError` | varies | `(message, code, cause?)` | Base class for all data-access errors |
| `NotFoundError` | `NOT_FOUND` | `(entityType, id)` | Entity lookup returned no result |
| `ValidationError` | `VALIDATION_ERROR` | `(message, field?)` | Invalid input (e.g., bad ID) |
| `AdapterNotImplementedError` | `ADAPTER_NOT_IMPLEMENTED` | `(adapterMode, domain)` | Non-mock adapter requested but not built |

### wrapError(err: unknown): HbcDataAccessError

Wraps any thrown value into an `HbcDataAccessError`. If the value is already an `HbcDataAccessError`, it is returned as-is.

## BaseRepository\<T\>

Abstract class providing shared helpers for all adapters:

| Method | Visibility | Description |
|--------|-----------|-------------|
| `wrapAsync<R>(fn, context?)` | protected | Try/catch wrapper; converts non-HBC errors via `wrapError()` |
| `validateId(id, entityName)` | protected | Throws `ValidationError` if id is falsy/NaN/non-positive |
| `throwNotFound(entityName, id)` | protected | Throws `NotFoundError` |

## Mock Adapters

All 11 mock adapters extend `BaseRepository` and operate on in-memory arrays initialized from seed data.

### Shared Infrastructure

| File | Exports | Description |
|------|---------|-------------|
| `helpers.ts` | `paginate<T>()`, `genId()`, `resetId()` | Pagination and ID generation |
| `seedData.ts` | `SEED_LEADS`, `SEED_PROJECTS`, etc. | Initial data constants (11 domains) |
| `types.ts` | `MockAdapterConfig` | Config interface (delay, errorProbability) |
| `constants.ts` | `MOCK_DEFAULT_PAGE_SIZE`, `MOCK_DELAY_MS` | Default values |

### Mock Repository Classes

| Class | Implements | Seed Records |
|-------|-----------|-------------|
| `MockLeadRepository` | `ILeadRepository` | 2 leads |
| `MockEstimatingRepository` | `IEstimatingRepository` | 2 trackers, 1 kickoff |
| `MockScheduleRepository` | `IScheduleRepository` | 2 activities |
| `MockBuyoutRepository` | `IBuyoutRepository` | 2 entries |
| `MockComplianceRepository` | `IComplianceRepository` | 2 entries |
| `MockContractRepository` | `IContractRepository` | 2 contracts, 1 approval |
| `MockRiskRepository` | `IRiskRepository` | 2 risk items |
| `MockScorecardRepository` | `IScorecardRepository` | 1 scorecard, 1 version |
| `MockPmpRepository` | `IPmpRepository` | 1 PMP, 1 signature |
| `MockProjectRepository` | `IProjectRepository` | 2 projects |
| `MockAuthRepository` | `IAuthRepository` | 1 user, 2 roles |

### resetAllMockStores()

Resets the ID counter to 1000. Useful for deterministic test setups.

## Stub Adapters

### SharePoint Adapter (`adapters/sharepoint/`)

| Export | Type | Description |
|--------|------|-------------|
| `SharePointConfig` | interface | `siteUrl`, `spfi` (PnPjs instance) |
| `SharePointAdapterOptions` | interface | `batchSize`, `caching` |
| `DEFAULT_BATCH_SIZE` | `100` | Default list query batch size |
| `SHAREPOINT_LIST_NAMES` | const object | Maps domains to SP list names |

### Proxy Adapter (`adapters/proxy/`)

| Export | Type | Description |
|--------|------|-------------|
| `ProxyConfig` | interface | `baseUrl`, `accessToken`, `timeout`, `retryCount` |
| `DEFAULT_TIMEOUT_MS` | `30000` | Default request timeout |
| `DEFAULT_RETRY_COUNT` | `3` | Default retry count |

### API Adapter (`adapters/api/`)

| Export | Type | Description |
|--------|------|-------------|
| `ApiConfig` | interface | `baseUrl`, `apiVersion`, `accessToken` |
| `DEFAULT_API_VERSION` | `'v1'` | Default API version string |

## Factory Functions

All 11 factory functions follow the same pattern:

```ts
function create*Repository(mode?: AdapterMode): I*Repository
```

| Factory | Returns | Mock Status |
|---------|---------|-------------|
| `createLeadRepository` | `ILeadRepository` | Implemented |
| `createEstimatingRepository` | `IEstimatingRepository` | Implemented |
| `createScheduleRepository` | `IScheduleRepository` | Implemented |
| `createBuyoutRepository` | `IBuyoutRepository` | Implemented |
| `createComplianceRepository` | `IComplianceRepository` | Implemented |
| `createContractRepository` | `IContractRepository` | Implemented |
| `createRiskRepository` | `IRiskRepository` | Implemented |
| `createScorecardRepository` | `IScorecardRepository` | Implemented |
| `createPmpRepository` | `IPmpRepository` | Implemented |
| `createProjectRepository` | `IProjectRepository` | Implemented |
| `createAuthRepository` | `IAuthRepository` | Implemented |

Non-mock modes (`sharepoint`, `proxy`, `api`) throw `AdapterNotImplementedError` until concrete implementations are added in Phases 4/5/7.
