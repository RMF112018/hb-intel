# Contracts Models Reference

> Contract management and commitment approval workflows.

**Package:** `@hbc/models` | **Module:** `contracts`
**Data-access port:** `IContractRepository`

## Interfaces

### `IContractInfo`

| Field | Type | Description |
|-------|------|-------------|
| `id` | `number` | Contract identifier |
| `projectId` | `string` | Project identifier |
| `contractNumber` | `string` | Contract number |
| `vendorName` | `string` | Vendor name |
| `amount` | `number` | Contract amount (USD) |
| `status` | `string` | Contract status |
| `executedDate` | `string` | ISO-8601 execution date |

### `ICommitmentApproval`

| Field | Type | Description |
|-------|------|-------------|
| `id` | `number` | Approval identifier |
| `contractId` | `number` | Contract being approved |
| `approverName` | `string` | Approver name |
| `approvedAt` | `string` | ISO-8601 approval timestamp |
| `status` | `string` | Approval status |
| `notes` | `string` | Approver notes |

### Form Data

`IContractFormData`, `ICommitmentApprovalFormData`

## Enums

### `ContractStatus`

`Draft` | `UnderReview` | `Executed` | `Amended` | `Terminated`

### `ApprovalStatus`

`Pending` | `Approved` | `Rejected` | `ReturnedForInfo`

## Constants

| Constant | Description |
|----------|-------------|
| `CONTRACT_STATUS_LABELS` | Human-readable contract status labels |
| `APPROVAL_STATUS_LABELS` | Human-readable approval status labels |

## Import Examples

```ts
import type { IContractInfo, ICommitmentApproval } from '@hbc/models';
import { ContractStatus, ApprovalStatus } from '@hbc/models/contracts';
```
