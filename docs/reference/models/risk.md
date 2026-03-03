# Risk Models Reference

> Risk cost tracking and management.

**Package:** `@hbc/models` | **Module:** `risk`
**Data-access port:** `IRiskRepository`

## Interfaces

### `IRiskCostItem`

| Field | Type | Description |
|-------|------|-------------|
| `id` | `number` | Risk item identifier |
| `projectId` | `string` | Project identifier |
| `description` | `string` | Risk description |
| `category` | `string` | Risk category |
| `estimatedImpact` | `number` | Financial impact (USD) |
| `probability` | `number` | Probability (0–1) |
| `status` | `string` | Risk status |

### `IRiskCostManagement`

| Field | Type | Description |
|-------|------|-------------|
| `projectId` | `string` | Project identifier |
| `totalExposure` | `number` | Total exposure (USD) |
| `mitigatedAmount` | `number` | Mitigated amount (USD) |
| `contingencyBudget` | `number` | Contingency budget (USD) |
| `items` | `IRiskCostItem[]` | Individual risk items |

### Form Data

`IRiskCostItemFormData`

## Enums

### `RiskCategory`

`Safety` | `Financial` | `Schedule` | `Quality` | `Regulatory` | `Environmental`

### `RiskStatus`

`Identified` | `Open` | `Mitigating` | `Mitigated` | `Realized` | `Closed`

## Constants

| Constant | Description |
|----------|-------------|
| `RISK_CATEGORY_LABELS` | Human-readable category labels |
| `RISK_STATUS_LABELS` | Human-readable status labels |
| `HIGH_RISK_PROBABILITY_THRESHOLD` | High-priority probability threshold (0.7) |

## Import Examples

```ts
import type { IRiskCostItem, IRiskCostManagement } from '@hbc/models';
import { RiskCategory, RiskStatus } from '@hbc/models/risk';
```
