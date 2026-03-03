# Ports & Adapters Architecture

**Blueprint Reference:** §1b, §2d

## Why Ports/Adapters?

HB Intel runs in multiple runtime contexts — SPFx webparts inside SharePoint, a standalone PWA, a mobile app (HB Site Control), and a local dev-harness. Each context communicates with backend data differently:

- **SPFx** uses PnPjs to call SharePoint REST/Graph APIs directly.
- **PWA** routes through Azure Functions proxy endpoints with MSAL on-behalf-of tokens.
- **Dev-harness** uses in-memory mock data with no external dependencies.
- **API** (future) will connect to Azure SQL via REST endpoints.

The ports/adapters pattern (also called hexagonal architecture) solves this by separating the *what* (port interface) from the *how* (adapter implementation).

## How It Works

```
┌─────────────────────────────────────────────┐
│              UI / Feature Code              │
│  (imports port types, calls factory once)   │
└──────────────────┬──────────────────────────┘
                   │
          createLeadRepository(mode)
                   │
         ┌─────────┼─────────┐
         ▼         ▼         ▼
    ┌─────────┐ ┌───────┐ ┌──────┐
    │  Mock   │ │SharePt│ │Proxy │
    │ Adapter │ │Adapter│ │Adapt.│
    └─────────┘ └───────┘ └──────┘
```

1. **Ports** are TypeScript interfaces (e.g., `ILeadRepository`) that define the contract for data operations in a domain. They import model types from `@hbc/models` and return typed results.

2. **Adapters** are concrete classes that implement a port interface for a specific runtime context. Each adapter directory (`mock/`, `sharepoint/`, `proxy/`, `api/`) contains implementations that satisfy the same contract.

3. **The Factory** (`factory.ts`) resolves which adapter to instantiate based on the `HBC_ADAPTER_MODE` environment variable. UI code calls the factory once at initialization and receives a fully-typed repository instance.

## Domain Scoping

The previous `IDataService` had 250+ methods in a single interface — a classic god-interface anti-pattern. The new architecture scopes repositories by domain:

| Domain | Port Interface | Key Methods |
|--------|---------------|-------------|
| Leads | `ILeadRepository` | getAll, getById, create, update, delete, search |
| Estimating | `IEstimatingRepository` | getAllTrackers, getKickoff, createKickoff |
| Schedule | `IScheduleRepository` | getActivities, getMetrics |
| Buyout | `IBuyoutRepository` | getEntries, getSummary |
| Compliance | `IComplianceRepository` | getEntries, getSummary |
| Contracts | `IContractRepository` | getContracts, getApprovals |
| Risk | `IRiskRepository` | getItems, getManagement |
| Scorecard | `IScorecardRepository` | getScorecards, getVersions |
| PMP | `IPmpRepository` | getPlans, getSignatures |
| Project | `IProjectRepository` | getProjects, getPortfolioSummary |
| Auth | `IAuthRepository` | getCurrentUser, getRoles |

Each port is independently testable, mockable, and replaceable without affecting other domains.

## Testing Strategy

Mock adapters serve dual purpose:

1. **Dev-harness**: Provides realistic seed data for local development without SharePoint or Azure.
2. **Unit tests**: Inject mock repositories directly into components or hooks under test.

Because adapters implement the same port interface, tests written against mocks validate the same contract that production adapters must satisfy.
