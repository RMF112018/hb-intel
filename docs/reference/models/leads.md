# Leads Models Reference

> Business development pipeline tracking — from identification through award.

**Package:** `@hbc/models` | **Module:** `leads`
**Data-access port:** `ILeadRepository`

## Interfaces

### `ILead`

A construction lead tracked through the BD pipeline.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `number` | Unique lead identifier |
| `title` | `string` | Lead / opportunity title |
| `stage` | `LeadStage` | Current pipeline stage |
| `clientName` | `string` | Prospective client name |
| `estimatedValue` | `number` | Estimated contract value (USD) |
| `createdAt` | `string` | ISO-8601 creation timestamp |
| `updatedAt` | `string` | ISO-8601 last-updated timestamp |

### `ILeadFormData`

Form input shape for creating or editing a lead.

| Field | Type | Description |
|-------|------|-------------|
| `title` | `string` | Lead title |
| `stage` | `LeadStage` | Pipeline stage |
| `clientName` | `string` | Client name |
| `estimatedValue` | `number` | Estimated value (USD) |

## Enums

### `LeadStage`

| Value | Description |
|-------|-------------|
| `Identified` | Lead identified, not yet evaluated |
| `Qualifying` | Being qualified for fit/feasibility |
| `BidDecision` | Decision point: pursue or decline |
| `Bidding` | Actively preparing a bid |
| `Awarded` | Bid awarded — converts to project |
| `Lost` | Bid lost to competitor |
| `Declined` | Declined internally |

## Type Aliases

| Type | Definition | Description |
|------|-----------|-------------|
| `LeadId` | `number` | Lead record identifier |
| `LeadSearchCriteria` | `object` | Filters for lead queries |

## Constants

| Constant | Type | Description |
|----------|------|-------------|
| `LEAD_STAGE_LABELS` | `Record<LeadStage, string>` | Human-readable stage labels |
| `ACTIVE_LEAD_STAGES` | `readonly LeadStage[]` | Stages representing open leads |

## Import Examples

```ts
import { ILead, LeadStage, ILeadFormData } from '@hbc/models';
import { LEAD_STAGE_LABELS } from '@hbc/models/leads';
```
