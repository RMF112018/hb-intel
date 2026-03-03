# Buyout Models Reference

> Procurement and commitment tracking.

**Package:** `@hbc/models` | **Module:** `buyout`
**Data-access port:** `IBuyoutRepository`

## Interfaces

### `IBuyoutEntry`

| Field | Type | Description |
|-------|------|-------------|
| `id` | `number` | Entry identifier |
| `projectId` | `string` | Project identifier |
| `costCode` | `string` | Cost code |
| `description` | `string` | Scope / trade description |
| `budgetAmount` | `number` | Budget amount (USD) |
| `committedAmount` | `number` | Committed amount (USD) |
| `status` | `string` | Buyout status |

### `IBuyoutSummary`

| Field | Type | Description |
|-------|------|-------------|
| `projectId` | `string` | Project identifier |
| `totalBudget` | `number` | Total budget (USD) |
| `totalCommitted` | `number` | Total committed (USD) |
| `totalRemaining` | `number` | Remaining budget (USD) |
| `percentBoughtOut` | `number` | Buyout percentage (0–100) |

### Form Data

`IBuyoutEntryFormData`

## Enums

### `BuyoutStatus`

`Pending` | `InProgress` | `Committed` | `Complete`

## Constants

| Constant | Description |
|----------|-------------|
| `BUYOUT_STATUS_LABELS` | Human-readable status labels |
| `BUYOUT_AT_RISK_THRESHOLD` | Percentage below which buyout is at-risk (50) |

## Import Examples

```ts
import type { IBuyoutEntry, IBuyoutSummary } from '@hbc/models';
import { BuyoutStatus } from '@hbc/models/buyout';
```
