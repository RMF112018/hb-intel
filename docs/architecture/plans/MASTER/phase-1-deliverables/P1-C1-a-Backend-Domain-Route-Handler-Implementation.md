# P1-C1-a: Backend Domain Route Handler Implementation

| Field | Value |
|---|---|
| **Doc ID** | P1-C1-a |
| **Phase** | Phase 1 |
| **Workstream** | C — Backend Service Contracts and Hardening |
| **Document Type** | Implementation Plan |
| **Owner** | C-workstream lead |
| **Status** | Implementation-Ready — all transport decisions locked (D1–D6, A8); all domain model types confirmed in repo; service factory extension required |
| **Date** | 2026-03-19 |
| **Last Reviewed Against Repo Truth** | 2026-03-19 |
| **Audience** | Developers implementing Phase 1 target domain Azure Function route handlers |
| **References** | P1-C1 (Backend Service Contract Catalog), P1-C2 (Auth Hardening), P1-C2-a (Auth Model Extension and Proxy Adapter), P1-D1 (Write Safety), P1-E1 (Contract Test Suite) |

### Status Legend

| Marker | Meaning |
|---|---|
| **CURRENT** | Verified against live repo as of 2026-03-19 |
| **TARGET** | C1-a deliverable — implementation planned |
| **LOCKED** | Transport or contract decision is frozen; do not change without C-workstream review |

---

## Purpose

Implement all Phase 1 target domain HTTP route handlers in `backend/functions`. This plan covers every route cataloged as `TARGET` or `TARGET (PROVISIONAL)` in P1-C1, applying the locked transport conventions (D1–D6, A8) from day one. Routes are implemented in the pre-C2 pattern (inline `validateToken()`, manual validation, direct `jsonBody` construction) since P1-C2's response helpers and Zod schemas are not yet available. New routes conform to the target response envelope from the start — they do not follow the `{error: string}` shape used by pre-Phase-1 routes.

**Deliverables:**
- Domain table storage services for Lead, Project, and Estimating (critical-path domains)
- Domain table storage services for the 7 project-scoped provisional domains (Schedule, Buyout, Compliance, Contracts, Risk, Scorecard, PMP)
- `IServiceContainer` extension with all 10 domain services
- Route handler files for all 10 domains (70+ registered `app.http()` handlers)
- Updated `src/index.ts` barrel importing all new handler directories

**Not in scope for P1-C1-a:**
- Auth route handlers (`/api/auth/*`) — covered by P1-C2-a (ProxyAuthRepository) and the auth backend in P1-C2
- Response envelope normalization of pre-existing routes — covered by P1-C2
- Idempotency guard wiring — P1-D1 responsibility; the `Idempotency-Key` header is accepted but not yet enforced
- Contract tests and MSW mocks — P1-E1 responsibility
- P1-C2 `withAuth()` wrapper, Zod validation, standardized response helpers — C1-a handlers are written to be compatible with the C2 upgrade path

---

## Current Repo State (verified 2026-03-19)

- **CURRENT**: `backend/functions` has 7 implemented route groups; no domain CRUD routes exist (leads, projects, estimating, schedule, buyout, compliance, contracts, risk, scorecard, pmp)
- **CURRENT**: `IServiceContainer` in `service-factory.ts` has 9 services: `sharePoint`, `tableStorage`, `redisCache`, `signalR`, `msalObo`, `projectRequests`, `acknowledgments`, `graph`, `notifications` — none covering domain CRUD
- **CURRENT**: `@azure/data-tables` v13.3.2 is a backend dependency — Table Storage pattern verified in `RealTableStorageService`
- **CURRENT**: `@hbc/models` is a backend dependency — all domain model types available (`ILead`, `IActiveProject`, `IEstimatingTracker`, `IEstimatingKickoff`, `IScheduleActivity`, `IBuyoutEntry`, etc.)
- **CURRENT**: `validateToken()` / `unauthorizedResponse()` middleware available at `../../middleware/validateToken.js`
- **CURRENT**: `createLogger(context)` available at `../../utils/logger.js`
- **CURRENT**: Handler registration pattern: `app.http('name', { methods, authLevel: 'anonymous', route, handler })`
- **CURRENT**: `src/index.ts` barrel imports all handler directories; new directories must be added here
- **LOCKED**: All transport decisions resolved — D1 (plural paths), D2 (estimating sub-resources), D3 (`message` error field), D4 (pageSize=25), D5 (PUT-only), D6 (nested project paths), A8 (`/api/projects/summary`)

---

## Key Design Decisions

### Response Envelope (all target routes)

```typescript
// Collection
{ items: T[], total: number, page: number, pageSize: number }

// Single item
{ data: T }

// Error (D3 LOCKED: message, not error)
{ message: string, code: string, requestId?: string }

// Delete success
204 — empty body, no JSON (RFC 9110)

// Create success
201 — { data: T }
```

Error `requestId` is generated inline with `randomUUID()` from `node:crypto` until C2 middleware propagates the `X-Request-Id` header automatically.

### Handler Auth Pattern (pre-C2)

```typescript
let claims;
try {
  claims = await validateToken(request);
} catch {
  return unauthorizedResponse('Invalid token');
}
```

The `unauthorizedResponse()` helper currently returns `{ error: 'Unauthorized', reason }` (pre-C2 shape). C2 will normalize this. C1-a does not refactor `unauthorizedResponse()` — that is a C2 responsibility.

### Storage Strategy

All new domain services use Azure Table Storage (`@azure/data-tables`) following the `RealTableStorageService` pattern:
- `TableClient.fromConnectionString(connectionString, tableName)`
- `upsertEntity(entity, 'Replace')` for create and update
- `odata` template literals for query filters
- JSON serialization for array/object fields
- `PartitionKey`: entity-type constant (flat domains) or `projectId` (project-scoped domains)
- `RowKey`: `String(id)` for numeric IDs; `id` directly for UUID IDs
- Numeric IDs generated with `Date.now()` (sufficient for Phase 1 isolation)

### Service Layer Pattern

Each domain gets a typed service file in `backend/functions/src/services/` following this structure:

```typescript
// {domain}-service.ts
export interface I{Domain}Service {
  // Methods matching the IXxxRepository port interface, with simpler signatures
}

export class Real{Domain}Service implements I{Domain}Service {
  private readonly client: TableClient;
  constructor() { /* TableClient.fromConnectionString */ }
}

export class Mock{Domain}Service implements I{Domain}Service {
  // In-memory array for unit testing; used when ADAPTER_MODE=mock
}
```

The 7 provisional project-scoped domains (Schedule, Buyout, Compliance, Contracts, Risk, Scorecard, PMP) share an identical structural pattern — only the entity types, field mappings, and table names differ. The plan describes the pattern in detail for Schedule and states "follow the same pattern" for the remaining six.

### Pagination

All collection handlers parse `?page=` and `?pageSize=` from `request.query`:

```typescript
const page = Math.max(1, parseInt(request.query.get('page') ?? '1', 10));
const pageSize = Math.min(100, Math.max(1, parseInt(request.query.get('pageSize') ?? '25', 10)));
```

### Route Registration Order

Azure Functions v4 matches routes in registration order. For the `projects` domain, the `projects/summary` handler MUST be registered before `projects/{id}` to prevent the `{id}` wildcard from absorbing the static path.

---

## Plan Status and Deliverable Table

| Chunk | Tasks | Surface | Status | Dependency |
|---|---|---|---|---|
| 1 — Lead, Project, Estimating Services | 1–3 | `backend/functions/src/services/` | **TARGET** | `@hbc/models` + `@azure/data-tables` (both present) |
| 2 — Provisional Domain Services | 4 | `backend/functions/src/services/` | **TARGET** | Same as Chunk 1 |
| 3 — Service Factory Extension | 5 | `backend/functions/src/services/service-factory.ts` | **TARGET** | Chunks 1–2 complete |
| 4 — Lead Route Handlers | 6 | `backend/functions/src/functions/leads/` | **TARGET** | Chunk 3 complete |
| 5 — Project Route Handlers | 7 | `backend/functions/src/functions/projects/` | **TARGET** | Chunk 3 complete |
| 6 — Estimating Route Handlers | 8 | `backend/functions/src/functions/estimating/` | **TARGET** | Chunk 3 complete |
| 7 — Project-Scoped Domain Handlers | 9–15 | `backend/functions/src/functions/{domain}/` | **TARGET** | Chunk 3 complete |
| 8 — Index Barrel + Verification | 16–17 | `backend/functions/src/index.ts` | **TARGET** | Chunks 4–7 complete |

---

## Chunk 1: Critical-Path Domain Services (Tasks 1–3)

### Task 1: Create `lead-service.ts`

**File:** `backend/functions/src/services/lead-service.ts`

**Purpose:** Typed service backing the Lead route handlers. Implements list, search, getById, create, update, and delete operations against an Azure Table Storage table named `HBLeads`.

**Interface:**

```typescript
import type { ILead, ILeadFormData } from '@hbc/models';

export interface ILeadService {
  list(page: number, pageSize: number): Promise<{ items: ILead[]; total: number }>;
  search(query: string, page: number, pageSize: number): Promise<{ items: ILead[]; total: number }>;
  getById(id: number): Promise<ILead | null>;
  create(data: ILeadFormData): Promise<ILead>;
  update(id: number, data: Partial<ILeadFormData>): Promise<ILead | null>;
  delete(id: number): Promise<void>;
}
```

**`RealLeadService` implementation notes:**

- `TableClient.fromConnectionString(process.env.AZURE_TABLE_ENDPOINT!, 'HBLeads')`
- `PartitionKey = 'lead'` (flat domain — all leads share one partition for Phase 1)
- `RowKey = String(entity.id)`
- `list()`: use `listEntities()` with no filter; collect all, sort by `createdAt` descending; apply page/pageSize slice; return `{ items, total: allItems.length }`
- `search()`: filter in-memory after listing all entities; match `title.toLowerCase().includes(query)` or `clientName.toLowerCase().includes(query)`
- `create()`: generate `id = Date.now()`, `createdAt = new Date().toISOString()`, `updatedAt = createdAt`; upsert with `'Replace'`; return constructed `ILead`
- `update()`: read existing via `getEntity()`; throw `NotFoundError` if missing; merge partial fields; set `updatedAt = new Date().toISOString()`; upsert; return updated entity
- `delete()`: call `deleteEntity('lead', String(id))`; no 404 guard required (idempotent delete)
- All method implementations are wrapped in `try/catch` that re-throws as `Error` with a descriptive message; handlers catch at the route level and return 500

**`MockLeadService` implementation notes:**

- In-memory `Map<number, ILead>` initialized with 3 seed entries
- All methods operate against the in-memory store
- Used when `assertAdapterModeValid()` detects `ADAPTER_MODE=mock` in `service-factory.ts`

**Exports:** `ILeadService`, `RealLeadService`, `MockLeadService`

---

### Task 2: Create `project-service.ts`

**File:** `backend/functions/src/services/project-service.ts`

**Purpose:** Typed service for the Project domain. Implements list, getById, create, update, delete, and portfolio summary against `HBProjects` table. Project IDs are UUIDs (strings), not numeric.

**Interface:**

```typescript
import type { IActiveProject, IPortfolioSummary } from '@hbc/models';

export interface IProjectService {
  list(page: number, pageSize: number): Promise<{ items: IActiveProject[]; total: number }>;
  getById(id: string): Promise<IActiveProject | null>;
  create(data: Omit<IActiveProject, 'id'>): Promise<IActiveProject>;
  update(id: string, data: Partial<IActiveProject>): Promise<IActiveProject | null>;
  delete(id: string): Promise<void>;
  getPortfolioSummary(): Promise<IPortfolioSummary>;
}
```

**`RealProjectService` implementation notes:**

- Table: `HBProjects`
- `PartitionKey = 'project'`, `RowKey = id` (UUID)
- `create()`: generate `id = randomUUID()` (import `{ randomUUID } from 'node:crypto'`); no timestamps on `IActiveProject` model
- `getPortfolioSummary()`: list all projects; compute:
  - `totalProjects`: count
  - `activeProjects`: count where `status === 'Active'`
  - `totalContractValue`: sum of `estimatedValue` if present; if field absent on `IActiveProject`, return 0
  - `averagePercentComplete`: 0 for Phase 1 (field not on `IActiveProject`)
- Note: `IActiveProject` has no `estimatedValue` field (checking the model — it has `id, name, number, status, startDate, endDate`). `totalContractValue` returns 0; `averagePercentComplete` returns 0. These are placeholder summaries until the domain model expands.

**`MockProjectService`:** In-memory `Map<string, IActiveProject>` with 2 seed entries.

**Exports:** `IProjectService`, `RealProjectService`, `MockProjectService`

---

### Task 3: Create `estimating-service.ts`

**File:** `backend/functions/src/services/estimating-service.ts`

**Purpose:** Typed service for the Estimating domain. Two sub-resources: trackers (Table `HBEstimatingTrackers`) and kickoffs (Table `HBEstimatingKickoffs`).

**Interface:**

```typescript
import type { IEstimatingTracker, IEstimatingKickoff } from '@hbc/models';

export interface IEstimatingService {
  // Trackers
  listTrackers(page: number, pageSize: number): Promise<{ items: IEstimatingTracker[]; total: number }>;
  getTrackerById(id: number): Promise<IEstimatingTracker | null>;
  createTracker(data: Omit<IEstimatingTracker, 'id' | 'createdAt' | 'updatedAt'>): Promise<IEstimatingTracker>;
  updateTracker(id: number, data: Partial<IEstimatingTracker>): Promise<IEstimatingTracker | null>;
  deleteTracker(id: number): Promise<void>;
  // Kickoffs
  getKickoff(projectId: string): Promise<IEstimatingKickoff | null>;
  createKickoff(data: Omit<IEstimatingKickoff, 'id' | 'createdAt'>): Promise<IEstimatingKickoff>;
}
```

**`RealEstimatingService` implementation notes:**

- Two `TableClient` instances: one for `HBEstimatingTrackers`, one for `HBEstimatingKickoffs`
- Trackers: `PartitionKey = 'tracker'`, `RowKey = String(id)`, `id = Date.now()`
- `attendees` on `IEstimatingKickoff` is `string[]` — JSON-serialize to `attendeesJson` field, deserialize on read
- Kickoffs: `PartitionKey = projectId`, `RowKey = 'kickoff'` (one kickoff per project)
- `getKickoff()`: `getEntity(projectId, 'kickoff')` — catch `RestError` with status 404 and return `null`

**`MockEstimatingService`:** Two in-memory maps (trackers and kickoffs) with seed data.

**Exports:** `IEstimatingService`, `RealEstimatingService`, `MockEstimatingService`

---

## Chunk 2: Provisional Domain Services (Task 4)

### Task 4: Create Project-Scoped Domain Services (7 files)

Each provisional domain (Schedule, Buyout, Compliance, Contracts, Risk, Scorecard, PMP) gets its own service file. All 7 follow an identical structural pattern — only the entity types, table names, field mappings, and aggregate method differ.

**Pattern established for Schedule; repeat for remaining six.**

**File:** `backend/functions/src/services/schedule-service.ts`

**Interface:**

```typescript
import type { IScheduleActivity, IScheduleMetrics } from '@hbc/models';

export interface IScheduleService {
  listActivities(projectId: string, page: number, pageSize: number): Promise<{ items: IScheduleActivity[]; total: number }>;
  getActivityById(id: number): Promise<IScheduleActivity | null>;
  createActivity(data: Omit<IScheduleActivity, 'id'>): Promise<IScheduleActivity>;
  updateActivity(id: number, data: Partial<IScheduleActivity>): Promise<IScheduleActivity | null>;
  deleteActivity(id: number): Promise<void>;
  getMetrics(projectId: string): Promise<IScheduleMetrics>;
}
```

**`RealScheduleService` notes:**
- Table: `HBScheduleActivities`
- `PartitionKey = projectId`, `RowKey = String(id)`
- `listActivities()`: filter `PartitionKey eq ${projectId}` via `odata` template; paginate in-memory
- `getMetrics()`: list all activities for projectId; compute:
  - `totalActivities`, `completedActivities` (where `percentComplete === 100`)
  - `criticalPathVariance = 0` (Phase 1 placeholder — no actual schedule engine)
  - `overallPercentComplete`: average of all `percentComplete` values

**Remaining 6 service files follow the same structural pattern:**

| File | Interface Name | Table Name | PartitionKey | Aggregate Method |
|---|---|---|---|---|
| `buyout-service.ts` | `IBuyoutService` | `HBBuyoutEntries` | projectId | `getSummary(projectId)` → `IBuyoutSummary` |
| `compliance-service.ts` | `IComplianceService` | `HBComplianceEntries` | projectId | `getSummary(projectId)` → `IComplianceSummary` |
| `contract-service.ts` | `IContractService` | `HBContracts` + `HBContractApprovals` | projectId / contractId | `getApprovals(contractId)`, `createApproval(data)` |
| `risk-service.ts` | `IRiskService` | `HBRiskItems` | projectId | `getManagement(projectId)` → `IRiskCostManagement` |
| `scorecard-service.ts` | `IScorecardService` | `HBScorecards` + `HBScorecardVersions` | projectId / scorecardId | `getVersions(scorecardId)` |
| `pmp-service.ts` | `IPmpService` | `HBPmpPlans` + `HBPmpSignatures` | projectId / pmpId | `getSignatures(pmpId)`, `createSignature(data)` |

**Aggregate computation notes for each:**

- **Buyout summary**: sum `budgetAmount` → `totalBudget`; sum `committedAmount` → `totalCommitted`; `totalRemaining = totalBudget - totalCommitted`; `percentBoughtOut = totalCommitted / totalBudget * 100` (guard divide-by-zero)
- **Compliance summary**: count total, count `status === 'Compliant'`, `status === 'NonCompliant'`; `expiringSoon`: entries where `expirationDate` within 30 days of now
- **Risk management**: aggregate `IRiskCostManagement` with items array; `totalExposure = sum(impact * probability)`; `mitigatedAmount` and `contingencyBudget` are Phase 1 placeholders (0)
- **Scorecard versions**: `snapshot` field on `IScorecardVersion` is `Record<string, unknown>` — JSON-serialize to `snapshotJson`
- **Contract approvals**: separate table `HBContractApprovals`, PartitionKey = String(contractId), RowKey = String(id)
- **PMP signatures**: separate table `HBPmpSignatures`, PartitionKey = String(pmpId), RowKey = String(id)

**Mock implementations:** All 7 services get `Mock{Domain}Service` with in-memory seed data.

---

## Chunk 3: Service Factory Extension (Task 5)

### Task 5: Extend `IServiceContainer` and `service-factory.ts`

**File:** `backend/functions/src/services/service-factory.ts`

**Changes:**

1. Import all 10 new service interfaces and their Real/Mock implementations
2. Add 10 fields to `IServiceContainer`:

```typescript
export interface IServiceContainer {
  // existing fields...
  leads: ILeadService;
  projects: IProjectService;
  estimating: IEstimatingService;
  schedule: IScheduleService;
  buyout: IBuyoutService;
  compliance: IComplianceService;
  contracts: IContractService;
  risk: IRiskService;
  scorecards: IScorecardService;
  pmp: IPmpService;
}
```

3. In `createServiceFactory()`, construct the real or mock instances based on `assertAdapterModeValid()`:

```typescript
const isMock = process.env.ADAPTER_MODE === 'mock';

return {
  // existing services...
  leads: isMock ? new MockLeadService() : new RealLeadService(),
  projects: isMock ? new MockProjectService() : new RealProjectService(),
  estimating: isMock ? new MockEstimatingService() : new RealEstimatingService(),
  schedule: isMock ? new MockScheduleService() : new RealScheduleService(),
  // ... remaining 6
};
```

**Verification after Task 5:** Run `pnpm --filter @hbc/functions check-types` — should pass with no errors before adding handlers.

---

## Chunk 4: Lead Route Handlers (Task 6)

### Task 6: Create `functions/leads/index.ts`

**File:** `backend/functions/src/functions/leads/index.ts`

**Imports:**

```typescript
import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions';
import { randomUUID } from 'node:crypto';
import type { ILeadFormData } from '@hbc/models';
import { validateToken, unauthorizedResponse } from '../../middleware/validateToken.js';
import { createServiceFactory } from '../../services/service-factory.js';
import { createLogger } from '../../utils/logger.js';
```

**Handlers to implement (5 registered functions, 1 handler covers list + search):**

#### `getLeads` — `GET leads`

Route: `leads` | Methods: `['GET']`

```
1. validateToken — 401 on failure
2. Parse ?q, ?page, ?pageSize from query params
3. If q is present and non-empty: services.leads.search(q, page, pageSize)
   Else: services.leads.list(page, pageSize)
4. Return 200 { items, total, page, pageSize }
5. Catch all errors → 500 { message: 'Internal server error', code: 'INTERNAL_ERROR', requestId: randomUUID() }
```

#### `getLeadById` — `GET leads/{id}`

Route: `leads/{id}` | Methods: `['GET']`

```
1. validateToken
2. id = parseInt(request.params.id, 10); if isNaN → 400 { message: 'id must be a number', code: 'VALIDATION_ERROR' }
3. lead = await services.leads.getById(id); if null → 404 { message: 'Lead not found', code: 'NOT_FOUND' }
4. Return 200 { data: lead }
```

#### `createLead` — `POST leads`

Route: `leads` | Methods: `['POST']`

```
1. validateToken
2. Parse JSON body as Partial<ILeadFormData>; catch parse errors → 400
3. Validate required fields: title, stage, clientName, estimatedValue
   Missing → 400 { message: 'title, stage, clientName, and estimatedValue are required', code: 'VALIDATION_ERROR' }
4. lead = await services.leads.create(body as ILeadFormData)
5. logger.info('Lead created', { id: lead.id, by: claims.upn })
6. Return 201 { data: lead }
```

#### `updateLead` — `PUT leads/{id}`

Route: `leads/{id}` | Methods: `['PUT']`

```
1. validateToken
2. Parse id (numeric); parse JSON body
3. updated = await services.leads.update(id, body); if null → 404
4. Return 200 { data: updated }
```

#### `deleteLead` — `DELETE leads/{id}`

Route: `leads/{id}` | Methods: `['DELETE']`

```
1. validateToken
2. Parse id; if isNaN → 400
3. await services.leads.delete(id)
4. Return 204 — status: 204, body: undefined (empty body per RFC 9110)
```

**Important for DELETE 204:**

```typescript
return { status: 204 };  // Azure Functions HttpResponseInit: no jsonBody field
```

---

## Chunk 5: Project Route Handlers (Task 7)

### Task 7: Create `functions/projects/index.ts`

**File:** `backend/functions/src/functions/projects/index.ts`

**CRITICAL REGISTRATION ORDER:** `getPortfolioSummary` (`projects/summary`) must be registered BEFORE `getProjectById` (`projects/{id}`) to prevent the wildcard from absorbing the static path.

**Handlers (6 registered functions):**

#### `getProjects` — `GET projects`

Same pattern as `getLeads`. No search parameter. Returns `{ items: IActiveProject[], total, page, pageSize }`.

#### `getPortfolioSummary` — `GET projects/summary` *(registered first)*

Route: `projects/summary` | Methods: `['GET']`

```
1. validateToken
2. summary = await services.projects.getPortfolioSummary()
3. Return 200 { data: summary }
```

#### `getProjectById` — `GET projects/{id}` *(registered after summary)*

Route: `projects/{id}` | Methods: `['GET']`

```
1. validateToken
2. id = request.params.id (string — UUIDs)
3. project = await services.projects.getById(id); if null → 404
4. Return 200 { data: project }
```

#### `createProject` — `POST projects`

Route: `projects` | Methods: `['POST']`

Required body fields: `name`, `number`, `status`, `startDate`, `endDate`

Returns 201 `{ data: project }`.

#### `updateProject` — `PUT projects/{id}`

Route: `projects/{id}` | Methods: `['PUT']`

Parse string ID; call `services.projects.update()`; 404 if null.

#### `deleteProject` — `DELETE projects/{id}`

Route: `projects/{id}` | Methods: `['DELETE']`

Returns 204 empty body.

---

## Chunk 6: Estimating Route Handlers (Task 8)

### Task 8: Create `functions/estimating/index.ts`

**File:** `backend/functions/src/functions/estimating/index.ts`

**Handlers (7 registered functions across 2 sub-resource paths):**

#### Tracker Sub-Resource (`estimating/trackers`)

- `getTrackers` — `GET estimating/trackers` — paginated list → `{ items, total, page, pageSize }`
- `getTrackerById` — `GET estimating/trackers/{id}` — parse numeric id; 404 if null → `{ data: tracker }`
- `createTracker` — `POST estimating/trackers` — required: `projectId`, `bidNumber`, `status`, `dueDate` → 201 `{ data: tracker }`
- `updateTracker` — `PUT estimating/trackers/{id}` → `{ data: updated }`
- `deleteTracker` — `DELETE estimating/trackers/{id}` → 204

#### Kickoff Sub-Resource (`estimating/kickoffs`)

- `getKickoff` — `GET estimating/kickoffs` — query param `?projectId=` required; if missing → 400; if not found → 404 → `{ data: kickoff }`
- `createKickoff` — `POST estimating/kickoffs` — required body: `projectId`, `kickoffDate`, `attendees[]`, `notes` → 201 `{ data: kickoff }`

**Attendees validation note:** `body.attendees` must be an array; check `Array.isArray(body.attendees)`.

---

## Chunk 7: Project-Scoped Domain Handlers (Tasks 9–15)

All project-scoped handlers share the same structural pattern. The `projectId` is always a route parameter (`{projectId}`). All routes are nested under `/api/projects/{projectId}/`.

**Common header for all project-scoped handlers:**

```typescript
import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions';
import { randomUUID } from 'node:crypto';
import { validateToken, unauthorizedResponse } from '../../middleware/validateToken.js';
import { createServiceFactory } from '../../services/service-factory.js';
import { createLogger } from '../../utils/logger.js';
```

**projectId extraction pattern:**

```typescript
const projectId = request.params.projectId;
if (!projectId) return { status: 400, jsonBody: { message: 'projectId is required', code: 'VALIDATION_ERROR' } };
```

---

### Task 9: Create `functions/schedule/index.ts`

**Handlers (6 registered functions):**

| Function Name | Method | Route | Notes |
|---|---|---|---|
| `getScheduleActivities` | `GET` | `projects/{projectId}/schedule/activities` | Collection; `?page=&pageSize=` |
| `getScheduleActivityById` | `GET` | `projects/{projectId}/schedule/activities/{id}` | Numeric id; 404 guard |
| `createScheduleActivity` | `POST` | `projects/{projectId}/schedule/activities` | Required: name, startDate, endDate, percentComplete, isCriticalPath; 201 |
| `updateScheduleActivity` | `PUT` | `projects/{projectId}/schedule/activities/{id}` | 200 or 404 |
| `deleteScheduleActivity` | `DELETE` | `projects/{projectId}/schedule/activities/{id}` | 204 |
| `getScheduleMetrics` | `GET` | `projects/{projectId}/schedule/metrics` | `{ data: IScheduleMetrics }` |

**`createScheduleActivity` body validation:** `percentComplete` must be 0–100; `isCriticalPath` must be boolean.

---

### Task 10: Create `functions/buyout/index.ts`

**Handlers (6 registered functions):**

| Function Name | Method | Route | Notes |
|---|---|---|---|
| `getBuyoutEntries` | `GET` | `projects/{projectId}/buyout/entries` | Collection |
| `getBuyoutEntryById` | `GET` | `projects/{projectId}/buyout/entries/{id}` | Numeric id; 404 |
| `createBuyoutEntry` | `POST` | `projects/{projectId}/buyout/entries` | Required: costCode, description, budgetAmount, committedAmount, status; 201 |
| `updateBuyoutEntry` | `PUT` | `projects/{projectId}/buyout/entries/{id}` | 200 or 404 |
| `deleteBuyoutEntry` | `DELETE` | `projects/{projectId}/buyout/entries/{id}` | 204 |
| `getBuyoutSummary` | `GET` | `projects/{projectId}/buyout/summary` | `{ data: IBuyoutSummary }` — computed from all entries |

---

### Task 11: Create `functions/compliance/index.ts`

**Handlers (6 registered functions):**

| Function Name | Method | Route | Notes |
|---|---|---|---|
| `getComplianceEntries` | `GET` | `projects/{projectId}/compliance/entries` | Collection |
| `getComplianceEntryById` | `GET` | `projects/{projectId}/compliance/entries/{id}` | Numeric id; 404 |
| `createComplianceEntry` | `POST` | `projects/{projectId}/compliance/entries` | Required: vendorName, requirementType, status, expirationDate; 201 |
| `updateComplianceEntry` | `PUT` | `projects/{projectId}/compliance/entries/{id}` | 200 or 404 |
| `deleteComplianceEntry` | `DELETE` | `projects/{projectId}/compliance/entries/{id}` | 204 |
| `getComplianceSummary` | `GET` | `projects/{projectId}/compliance/summary` | `{ data: IComplianceSummary }` — expiringSoon: within 30 days of now |

---

### Task 12: Create `functions/contracts/index.ts`

**Handlers (7 registered functions — contracts CRUD + 2 approval sub-resource routes):**

| Function Name | Method | Route | Notes |
|---|---|---|---|
| `getContracts` | `GET` | `projects/{projectId}/contracts` | Collection |
| `getContractById` | `GET` | `projects/{projectId}/contracts/{id}` | Numeric id; 404 |
| `createContract` | `POST` | `projects/{projectId}/contracts` | Required: contractNumber, vendorName, amount, status, executedDate; 201 |
| `updateContract` | `PUT` | `projects/{projectId}/contracts/{id}` | 200 or 404 |
| `deleteContract` | `DELETE` | `projects/{projectId}/contracts/{id}` | 204 |
| `getContractApprovals` | `GET` | `projects/{projectId}/contracts/{contractId}/approvals` | Returns `{ data: ICommitmentApproval[] }` |
| `createContractApproval` | `POST` | `projects/{projectId}/contracts/{contractId}/approvals` | Required: approverName, approvedAt, status, notes; 201 `{ data: approval }` |

**Approval route notes:**
- `contractId` comes from route param `{contractId}` (same slot as `{id}` — use consistent param name)
- Route for approvals: `projects/{projectId}/contracts/{contractId}/approvals`
- Use `services.contracts.getApprovals(contractId)` and `services.contracts.createApproval(data)`

---

### Task 13: Create `functions/risk/index.ts`

**Handlers (6 registered functions):**

| Function Name | Method | Route | Notes |
|---|---|---|---|
| `getRiskItems` | `GET` | `projects/{projectId}/risk/items` | Collection |
| `getRiskItemById` | `GET` | `projects/{projectId}/risk/items/{id}` | Numeric id; 404 |
| `createRiskItem` | `POST` | `projects/{projectId}/risk/items` | Required: description, category, estimatedImpact, probability, status; 201 |
| `updateRiskItem` | `PUT` | `projects/{projectId}/risk/items/{id}` | 200 or 404 |
| `deleteRiskItem` | `DELETE` | `projects/{projectId}/risk/items/{id}` | 204 |
| `getRiskManagement` | `GET` | `projects/{projectId}/risk/management` | `{ data: IRiskCostManagement }` — includes items array + aggregate fields |

**`getRiskManagement` note:** The `IRiskCostManagement.items` field is a full array of `IRiskCostItem[]`. Populate by listing all risk items for the project and including them in the management aggregate response. `mitigatedAmount` and `contingencyBudget` are Phase 1 placeholder 0 values.

---

### Task 14: Create `functions/scorecards/index.ts`

**Handlers (6 registered functions):**

| Function Name | Method | Route | Notes |
|---|---|---|---|
| `getScorecards` | `GET` | `projects/{projectId}/scorecards` | Collection |
| `getScorecardById` | `GET` | `projects/{projectId}/scorecards/{id}` | Numeric id; 404 |
| `createScorecard` | `POST` | `projects/{projectId}/scorecards` | Required: projectId (from route), version, overallScore, recommendation; 201 |
| `updateScorecard` | `PUT` | `projects/{projectId}/scorecards/{id}` | 200 or 404 |
| `deleteScorecard` | `DELETE` | `projects/{projectId}/scorecards/{id}` | 204 |
| `getScorecardVersions` | `GET` | `projects/{projectId}/scorecards/{scorecardId}/versions` | Returns `{ data: IScorecardVersion[] }` |

**`getScorecardVersions` note:** `snapshot` is `Record<string, unknown>` — stored as JSON string `snapshotJson` in Table Storage; deserialize on read. Route param: `{scorecardId}`.

---

### Task 15: Create `functions/pmp/index.ts`

**Handlers (7 registered functions — plans CRUD + 2 signature sub-resource routes):**

| Function Name | Method | Route | Notes |
|---|---|---|---|
| `getPmpPlans` | `GET` | `projects/{projectId}/pmp/plans` | Collection |
| `getPmpPlanById` | `GET` | `projects/{projectId}/pmp/plans/{id}` | Numeric id; 404 |
| `createPmpPlan` | `POST` | `projects/{projectId}/pmp/plans` | Required: projectId (from route), version, status; 201 |
| `updatePmpPlan` | `PUT` | `projects/{projectId}/pmp/plans/{id}` | 200 or 404 |
| `deletePmpPlan` | `DELETE` | `projects/{projectId}/pmp/plans/{id}` | 204 |
| `getPmpSignatures` | `GET` | `projects/{projectId}/pmp/plans/{pmpId}/signatures` | Returns `{ data: IPMPSignature[] }` |
| `createPmpSignature` | `POST` | `projects/{projectId}/pmp/plans/{pmpId}/signatures` | Required: signerName, role, signedAt, status; 201 `{ data: signature }` |

---

## Chunk 8: Index Barrel + Verification (Tasks 16–17)

### Task 16: Update `src/index.ts`

**File:** `backend/functions/src/index.ts`

Add imports for all 10 new handler directories (after existing imports):

```typescript
// Phase 1 domain route handlers
import './functions/leads/index.js';
import './functions/projects/index.js';
import './functions/estimating/index.js';
import './functions/schedule/index.js';
import './functions/buyout/index.js';
import './functions/compliance/index.js';
import './functions/contracts/index.js';
import './functions/risk/index.js';
import './functions/scorecards/index.js';
import './functions/pmp/index.js';
```

Note: Registration order within each file handles route-level conflicts (`projects/summary` before `projects/{id}`). The directory import order in `index.ts` does not affect route resolution since each domain occupies distinct path prefixes.

---

### Task 17: Typecheck and Verify

**Command:** `pnpm --filter @hbc/functions check-types`

**Expected result:** Zero TypeScript errors.

**What to verify:**
- All 10 service files implement their interfaces without type errors
- `IServiceContainer` extension compiles with all 10 new fields
- All handler files use correct `@hbc/models` types without casting
- All `app.http()` registrations have correct `HttpResponseInit` return types
- `import type` is used for all model imports (no value-only imports from `@hbc/models`)

**What is NOT verified by this task:**
- Runtime behavior — integration tests are P1-E1 scope
- Storage connectivity — requires deployed Azure environment
- Route conflict resolution — requires live Azure Functions runtime test or smoke test suite
- Idempotency header behavior — P1-D1 scope

**Secondary check:** `pnpm --filter @hbc/functions build` — confirms the TypeScript compilation produces output without errors that only surface during emit (e.g., missing `.js` extensions on imports).

---

## Route Inventory Summary

| Domain | Routes | Handler Count | Locked Paths |
|---|---|---|---|
| **Lead** | GET list/search, GET by id, POST, PUT, DELETE | 5 handlers | `leads`, `leads/{id}` |
| **Project** | GET list, GET summary, GET by id, POST, PUT, DELETE | 6 handlers | `projects`, `projects/summary`, `projects/{id}` |
| **Estimating** | Trackers CRUD (5) + Kickoff (2) | 7 handlers | `estimating/trackers`, `estimating/trackers/{id}`, `estimating/kickoffs` |
| **Schedule** | Activity CRUD (5) + metrics | 6 handlers | `projects/{projectId}/schedule/activities`, `/metrics` |
| **Buyout** | Entry CRUD (5) + summary | 6 handlers | `projects/{projectId}/buyout/entries`, `/summary` |
| **Compliance** | Entry CRUD (5) + summary | 6 handlers | `projects/{projectId}/compliance/entries`, `/summary` |
| **Contracts** | Contract CRUD (5) + approvals (2) | 7 handlers | `projects/{projectId}/contracts`, `/{contractId}/approvals` |
| **Risk** | Item CRUD (5) + management | 6 handlers | `projects/{projectId}/risk/items`, `/management` |
| **Scorecard** | Scorecard CRUD (5) + versions | 6 handlers | `projects/{projectId}/scorecards`, `/{scorecardId}/versions` |
| **PMP** | Plan CRUD (5) + signatures (2) | 7 handlers | `projects/{projectId}/pmp/plans`, `/{pmpId}/signatures` |
| **Total** | | **62 handlers** | All paths C1 locked |

---

## Dependencies and Acceptance Gates

### C1-a Unblocks

- **P1-E1 (Contract Test Suite)**: All 62 route paths are now defined; E1 can implement Zod schemas and MSW mocks against these contracts
- **P1-B1 proxy completion**: Proxy adapters for Lead, Project, Estimating already exist; the 7 provisional proxy adapters now have confirmed route paths for their Table Storage-backed backend counterparts
- **P1-D1 write safety**: D1 can wire idempotency guard middleware onto the new `POST`, `PUT`, and `DELETE` handlers once those are implemented

### C1-a Gate Criteria

C1-a is complete when:
1. All 10 service files exist and compile without type errors
2. `IServiceContainer` compiles with all 10 new fields in both real and mock modes
3. All 10 handler directories exist with correct `app.http()` registrations
4. `src/index.ts` imports all 10 directories
5. `pnpm --filter @hbc/functions check-types` passes with zero errors
6. No duplicate `app.http()` handler names across the entire codebase (Azure Functions throws at startup)

### Relationship to P1-C2

P1-C2 will add `withAuth()`, Zod schemas, `successResponse()`, `errorResponse()`, and `X-Request-Id` middleware. C1-a handlers are written to be compatible with this upgrade:
- Inline `validateToken()` calls will be replaced by `withAuth()` wrapper
- Manual `{ message, code }` error construction will be replaced by `errorResponse()`
- Manual `{ data: T }` and `{ items, total, page, pageSize }` construction will be replaced by `successResponse()` and `collectionResponse()` helpers
- `randomUUID()` for `requestId` in errors will be replaced by the middleware-propagated `X-Request-Id`

No C1-a handler needs to be rewritten — C2 changes are additive wrappers, not structural rewrites.

---

## Governing Sources Used

| Source | Used For |
|---|---|
| `P1-C1-Backend-Service-Contract-Catalog.md` | Route paths, response envelopes, locked transport conventions (D1–D6, A8) |
| `packages/data-access/src/ports/I*Repository.ts` (all 10) | Service interface method signatures and entity types |
| `packages/models/src/*/I*.ts` (all domains) | Entity type shapes and field names |
| `backend/functions/src/functions/projectRequests/index.ts` | Primary handler implementation pattern |
| `backend/functions/src/functions/acknowledgments/index.ts` | Secondary handler pattern (multi-handler per file, business logic inline) |
| `backend/functions/src/services/table-storage-service.ts` | Table Storage implementation pattern (upsert, odata, JSON serialization) |
| `backend/functions/src/services/service-factory.ts` | IServiceContainer shape and mock/real toggle pattern |
| `backend/functions/package.json` | Confirmed available dependencies |
