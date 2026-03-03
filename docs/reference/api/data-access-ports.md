# Data Access Ports — API Reference

**Package:** `@hbc/data-access`
**Blueprint Reference:** §1b, §2d

## Overview

The data access layer defines 11 domain-scoped repository port interfaces. Each port specifies the contract for data operations in its domain. Concrete adapters implement these ports for different runtime modes.

## Port Interfaces

### ILeadRepository

| Method | Signature | Description |
|--------|-----------|-------------|
| `getAll` | `(options?: IListQueryOptions) => Promise<IPagedResult<ILead>>` | List leads with pagination |
| `getById` | `(id: number) => Promise<ILead \| null>` | Get single lead |
| `create` | `(data: ILeadFormData) => Promise<ILead>` | Create new lead |
| `update` | `(id: number, data: Partial<ILeadFormData>) => Promise<ILead>` | Update existing lead |
| `delete` | `(id: number) => Promise<void>` | Delete lead |
| `search` | `(query: string, options?: IListQueryOptions) => Promise<IPagedResult<ILead>>` | Search leads by text |

### IEstimatingRepository

| Method | Signature | Description |
|--------|-----------|-------------|
| `getAllTrackers` | `(options?: IListQueryOptions) => Promise<IPagedResult<IEstimatingTracker>>` | List estimating trackers |
| `getTrackerById` | `(id: number) => Promise<IEstimatingTracker \| null>` | Get single tracker |
| `createTracker` | `(data: Omit<...>) => Promise<IEstimatingTracker>` | Create tracker |
| `updateTracker` | `(id: number, data: Partial<...>) => Promise<IEstimatingTracker>` | Update tracker |
| `deleteTracker` | `(id: number) => Promise<void>` | Delete tracker |
| `getKickoff` | `(projectId: string) => Promise<IEstimatingKickoff \| null>` | Get kickoff for project |
| `createKickoff` | `(data: Omit<...>) => Promise<IEstimatingKickoff>` | Create kickoff |

### IScheduleRepository

| Method | Signature | Description |
|--------|-----------|-------------|
| `getActivities` | `(projectId: string, options?: IListQueryOptions) => Promise<IPagedResult<IScheduleActivity>>` | List activities for project |
| `getActivityById` | `(id: number) => Promise<IScheduleActivity \| null>` | Get single activity |
| `createActivity` | `(data: Omit<...>) => Promise<IScheduleActivity>` | Create activity |
| `updateActivity` | `(id: number, data: Partial<...>) => Promise<IScheduleActivity>` | Update activity |
| `deleteActivity` | `(id: number) => Promise<void>` | Delete activity |
| `getMetrics` | `(projectId: string) => Promise<IScheduleMetrics>` | Get schedule metrics |

### IBuyoutRepository

| Method | Signature | Description |
|--------|-----------|-------------|
| `getEntries` | `(projectId: string, options?: IListQueryOptions) => Promise<IPagedResult<IBuyoutEntry>>` | List buyout entries |
| `getEntryById` | `(id: number) => Promise<IBuyoutEntry \| null>` | Get single entry |
| `createEntry` | `(data: Omit<...>) => Promise<IBuyoutEntry>` | Create entry |
| `updateEntry` | `(id: number, data: Partial<...>) => Promise<IBuyoutEntry>` | Update entry |
| `deleteEntry` | `(id: number) => Promise<void>` | Delete entry |
| `getSummary` | `(projectId: string) => Promise<IBuyoutSummary>` | Get buyout summary |

### IComplianceRepository

| Method | Signature | Description |
|--------|-----------|-------------|
| `getEntries` | `(projectId: string, options?: IListQueryOptions) => Promise<IPagedResult<IComplianceEntry>>` | List compliance entries |
| `getEntryById` | `(id: number) => Promise<IComplianceEntry \| null>` | Get single entry |
| `createEntry` | `(data: Omit<...>) => Promise<IComplianceEntry>` | Create entry |
| `updateEntry` | `(id: number, data: Partial<...>) => Promise<IComplianceEntry>` | Update entry |
| `deleteEntry` | `(id: number) => Promise<void>` | Delete entry |
| `getSummary` | `(projectId: string) => Promise<IComplianceSummary>` | Get compliance summary |

### IContractRepository

| Method | Signature | Description |
|--------|-----------|-------------|
| `getContracts` | `(projectId: string, options?: IListQueryOptions) => Promise<IPagedResult<IContractInfo>>` | List contracts |
| `getContractById` | `(id: number) => Promise<IContractInfo \| null>` | Get single contract |
| `createContract` | `(data: Omit<...>) => Promise<IContractInfo>` | Create contract |
| `updateContract` | `(id: number, data: Partial<...>) => Promise<IContractInfo>` | Update contract |
| `deleteContract` | `(id: number) => Promise<void>` | Delete contract |
| `getApprovals` | `(contractId: number) => Promise<ICommitmentApproval[]>` | List approvals for contract |
| `createApproval` | `(data: Omit<...>) => Promise<ICommitmentApproval>` | Create approval |

### IRiskRepository

| Method | Signature | Description |
|--------|-----------|-------------|
| `getItems` | `(projectId: string, options?: IListQueryOptions) => Promise<IPagedResult<IRiskCostItem>>` | List risk items |
| `getItemById` | `(id: number) => Promise<IRiskCostItem \| null>` | Get single risk item |
| `createItem` | `(data: Omit<...>) => Promise<IRiskCostItem>` | Create risk item |
| `updateItem` | `(id: number, data: Partial<...>) => Promise<IRiskCostItem>` | Update risk item |
| `deleteItem` | `(id: number) => Promise<void>` | Delete risk item |
| `getManagement` | `(projectId: string) => Promise<IRiskCostManagement>` | Get risk management summary |

### IScorecardRepository

| Method | Signature | Description |
|--------|-----------|-------------|
| `getScorecards` | `(projectId: string, options?: IListQueryOptions) => Promise<IPagedResult<IGoNoGoScorecard>>` | List scorecards |
| `getScorecardById` | `(id: number) => Promise<IGoNoGoScorecard \| null>` | Get single scorecard |
| `createScorecard` | `(data: Omit<...>) => Promise<IGoNoGoScorecard>` | Create scorecard |
| `updateScorecard` | `(id: number, data: Partial<...>) => Promise<IGoNoGoScorecard>` | Update scorecard |
| `deleteScorecard` | `(id: number) => Promise<void>` | Delete scorecard |
| `getVersions` | `(scorecardId: number) => Promise<IScorecardVersion[]>` | List scorecard versions |

### IPmpRepository

| Method | Signature | Description |
|--------|-----------|-------------|
| `getPlans` | `(projectId: string, options?: IListQueryOptions) => Promise<IPagedResult<IProjectManagementPlan>>` | List PMPs |
| `getPlanById` | `(id: number) => Promise<IProjectManagementPlan \| null>` | Get single PMP |
| `createPlan` | `(data: Omit<...>) => Promise<IProjectManagementPlan>` | Create PMP |
| `updatePlan` | `(id: number, data: Partial<...>) => Promise<IProjectManagementPlan>` | Update PMP |
| `deletePlan` | `(id: number) => Promise<void>` | Delete PMP |
| `getSignatures` | `(pmpId: number) => Promise<IPMPSignature[]>` | List signatures |
| `createSignature` | `(data: Omit<...>) => Promise<IPMPSignature>` | Create signature |

### IProjectRepository

| Method | Signature | Description |
|--------|-----------|-------------|
| `getProjects` | `(options?: IListQueryOptions) => Promise<IPagedResult<IActiveProject>>` | List projects |
| `getProjectById` | `(id: string) => Promise<IActiveProject \| null>` | Get single project |
| `createProject` | `(data: Omit<...>) => Promise<IActiveProject>` | Create project |
| `updateProject` | `(id: string, data: Partial<...>) => Promise<IActiveProject>` | Update project |
| `deleteProject` | `(id: string) => Promise<void>` | Delete project |
| `getPortfolioSummary` | `() => Promise<IPortfolioSummary>` | Get portfolio summary |

### IAuthRepository

| Method | Signature | Description |
|--------|-----------|-------------|
| `getCurrentUser` | `() => Promise<ICurrentUser>` | Get authenticated user |
| `getRoles` | `() => Promise<IRole[]>` | List all roles |
| `getRoleById` | `(id: string) => Promise<IRole \| null>` | Get single role |
| `getPermissionTemplates` | `() => Promise<IPermissionTemplate[]>` | List permission templates |
| `assignRole` | `(userId: string, roleId: string) => Promise<void>` | Assign role to user |
| `removeRole` | `(userId: string, roleId: string) => Promise<void>` | Remove role from user |

## Factory Functions

| Function | Returns | Description |
|----------|---------|-------------|
| `resolveAdapterMode()` | `AdapterMode` | Reads `HBC_ADAPTER_MODE` env var; defaults to `'mock'` |
| `createLeadRepository(mode?)` | `ILeadRepository` | Creates lead adapter for given mode |
| `createScheduleRepository(mode?)` | `IScheduleRepository` | Creates schedule adapter for given mode |
| `createBuyoutRepository(mode?)` | `IBuyoutRepository` | Creates buyout adapter for given mode |

## Adapter Modes

| Mode | Source | Status |
|------|--------|--------|
| `mock` | In-memory seed data | Implemented (3 domains) |
| `sharepoint` | PnPjs / SPFx | Stub (Phase 5) |
| `proxy` | Azure Functions / MSAL | Stub (Phase 4) |
| `api` | REST API / Azure SQL | Stub (Phase 7+) |
