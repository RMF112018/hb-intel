# Mock Adapter

In-memory mock adapter for the dev-harness and unit tests. Provides all 11 domain repositories backed by seeded arrays — no network calls or external dependencies required.

## Status: Fully Implemented

## Repository Classes

| Class | Port Interface |
|---|---|
| `MockLeadRepository` | `ILeadRepository` |
| `MockScheduleRepository` | `IScheduleRepository` |
| `MockBuyoutRepository` | `IBuyoutRepository` |
| `MockEstimatingRepository` | `IEstimatingRepository` |
| `MockComplianceRepository` | `IComplianceRepository` |
| `MockContractRepository` | `IContractRepository` |
| `MockRiskRepository` | `IRiskRepository` |
| `MockScorecardRepository` | `IScorecardRepository` |
| `MockPmpRepository` | `IPmpRepository` |
| `MockProjectRepository` | `IProjectRepository` |
| `MockAuthRepository` | `IAuthRepository` |

Every class extends `BaseRepository<T>` and stores data in a plain array that is initialised from the corresponding `SEED_*` constant in `seedData.ts`.

## Key Helpers

| Export | Source | Purpose |
|---|---|---|
| `genId()` | `helpers.ts` | Auto-incrementing numeric ID (starts at 1000) |
| `paginate(items, options?)` | `helpers.ts` | Slices an array according to `IListQueryOptions` |
| `resetId(start?)` | `helpers.ts` | Resets the ID counter (default 1000) |
| `resetAllMockStores()` | `index.ts` | Resets counter to 1000 for test isolation |

## Constants

| Constant | Value |
|---|---|
| `MOCK_DEFAULT_PAGE_SIZE` | `25` |
| `MOCK_DELAY_MS` | `0` |

## Rules

1. **Never import mock adapters from production code.** They are only for the dev-harness (`apps/dev-harness`) and `*.test.ts` files.
2. Call `resetAllMockStores()` in `beforeEach` / `afterEach` blocks to guarantee test isolation.
3. Seed data lives in `seedData.ts` — add new fixtures there, not inline in repository files.
