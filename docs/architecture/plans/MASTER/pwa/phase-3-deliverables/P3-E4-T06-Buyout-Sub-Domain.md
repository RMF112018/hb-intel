# P3-E4 — Financial Module: Buyout Sub-Domain

| Property | Value |
|----------|-------|
| **Doc ID** | P3-E4-T06 |
| **Parent** | [P3-E4 Financial Module Field Specification](P3-E4-Financial-Module-Field-Specification.md) |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Part** | T06: Buyout Sub-Domain |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-23 |

---

*This file covers: buyout line item record, procurement status enumeration, the ContractExecuted gate rule (P3-E12 integration), the dollar-weighted completion metric, buyout savings tracking, savings disposition workflow and destination types. See [T07](P3-E4-T07-Business-Rules-and-Calculations.md) for sign convention on buyout over/under and [T08](P3-E4-T08-Platform-Integration-and-Annotation-Scope.md) for spine and work queue events.*

---

## 8. Buyout Sub-Domain

Buyout is a **procurement / commitment-control surface**, not a work-complete or invoiced-complete tracker. The buyout headline metric is dollar-weighted against subcontract value, not count-based. Buyout savings are explicitly tracked and require PM disposition before they affect the project forecast.

### 8.1 Buyout line item record

| Field Name (camelCase) | TypeScript Type | Required | Calculated | Source (Buyout Log Excel) | Business Rule |
|------------------------|-----------------|----------|------------|---------------------------|---------------|
| `buyoutLineId` | `string` | Yes | Yes | — | UUID; stable identifier |
| `projectId` | `string` | Yes | No | — | FK to project |
| `divisionCode` | `string` | Yes | No | DIVISION # | CSI division number; validated against cost-code-dictionary |
| `divisionDescription` | `string` | Yes | No | DIVISION DESCRIPTION | CSI division name |
| `lineItemDescription` | `string` | Yes | No | (sub-category) | Specific scope line |
| `subcontractorVendorName` | `string` | Yes | No | SUBCONTRACTOR / VENDOR | Name of subcontractor or vendor |
| `originalBudget` | `number` | Yes | No | ORIGINAL BUDGET | Budget line amount from budget model (T02 §3.1); immutable reference |
| `contractAmount` | `number \| null` | No | No | CONTRACT AMOUNT | Executed contract or PO amount; USD; null until negotiated/executed |
| `overUnder` | `number \| null` | No | Yes | — | **Calculated when `contractAmount` is non-null**: `contractAmount - originalBudget`. **Positive = over budget (unfavorable); negative = under budget (favorable / savings)** — see T07 §7.3 |
| `buyoutSavingsAmount` | `number` | Yes | Yes | — | **Calculated**: `max(0, originalBudget - contractAmount)` when `contractAmount` is non-null and < `originalBudget`; 0 otherwise. Represents recognized savings from below-budget execution. |
| `savingsDispositionStatus` | `BuyoutSavingsDispositionStatus` | Yes | No | — | Enum: `NoSavings` \| `Undispositioned` \| `PartiallyDispositioned` \| `FullyDispositioned`; see §8.5 |
| `loiDateToBeSent` | `string \| null` | No | No | LOI DATE TO BE SENT | ISO 8601 date; planned LOI send date |
| `loiReturnedExecuted` | `string \| null` | No | No | LOI Returned Executed | ISO 8601 date; actual LOI return date |
| `contractExecutedDate` | `string \| null` | No | No | (tracking column) | ISO 8601 date; formal contract execution date |
| `status` | `BuyoutLineStatus` | Yes | No | (tracking column) | Procurement workflow status; see §8.2 |
| `subcontractChecklistId` | `string \| null` | No | No | — | FK to `ISubcontractChecklist.checklistId` in P3-E12; MUST be set and checklist satisfied before `ContractExecuted` — see gate rule §8.3 |
| `notes` | `string \| null` | No | No | — | PM commentary |
| `lastEditedBy` | `string \| null` | No | No | — | userId of PM who last edited |
| `lastEditedAt` | `string \| null` | No | No | — | ISO 8601 timestamp of last edit |

### 8.2 Buyout status enumeration

| Enum Value | Description | Procurement interpretation |
|------------|-------------|---------------------------|
| `NotStarted` | Scope identified; solicitation not yet issued | Pre-procurement |
| `LoiPending` | LOI issued; awaiting subcontractor execution | Active procurement |
| `LoiExecuted` | LOI signed by both parties | Commitment intent established |
| `ContractPending` | Formal contract in drafting/review | Final commitment in progress |
| `ContractExecuted` | Formal subcontract signed; commitment finalized | Commitment locked |
| `Complete` | Subcontract work finished; final invoice reconciled | Scope closed |
| `Void` | Cancelled or scope eliminated | No commitment |

### 8.3 ContractExecuted gate rule (P3-E12 integration)

Transition to `ContractExecuted` is subject to the Subcontract Compliance gate (P3-E12):

```typescript
// IBuyoutLineItem.status MUST NOT transition to 'ContractExecuted' UNLESS:
//   1. subcontractChecklistId is non-null
//   2. ISubcontractChecklist.status === 'Complete'
//   3. ISubcontractChecklist.complianceWaiver === null
//      OR ISubcontractChecklist.complianceWaiver.status === 'Approved'
```

This gate is enforced in the Financial module's Buyout status update API. If the gate is not satisfied, the API MUST reject the status transition with a specific error identifying which condition is unmet.

**UI behavior:** When a PM attempts to advance to `ContractExecuted` and the gate is not satisfied, a clear error must display with a direct link to the Subcontract Compliance record.

### 8.4 Buyout completion metric (dollar-weighted)

The buyout completion headline is **dollar-weighted**, not count-based. Dollar weighting is required because a $5M subcontract executing has materially different significance than a $50K PO.

```typescript
interface IBuyoutSummaryMetrics {
  totalBudget: number;             // Sum of originalBudget across all non-Void lines
  totalContractAmount: number;     // Sum of contractAmount across all ContractExecuted + Complete lines
  totalOverUnder: number;          // Sum of overUnder across executed lines; sign per T07 §7.3
  totalRealizedBuyoutSavings: number; // Sum of buyoutSavingsAmount across all executed lines
  totalUndispositionedSavings: number; // Sum of undispositioned savings awaiting PM action

  // Dollar-weighted completion metric
  percentBuyoutCompleteDollarWeighted: number;
  // = totalContractAmount / totalBudget × 100
  // Reflects actual commitment value secured vs. total budgeted subcontract value

  // Count metrics (secondary)
  linesNotStarted: number;
  linesInProgress: number;      // status in [LoiPending, LoiExecuted, ContractPending, ContractExecuted]
  linesComplete: number;
  linesVoid: number;
  totalLinesActive: number;     // total lines minus Void
}
```

### 8.5 Buyout savings tracking and disposition

When a subcontract is executed below its original budget amount, the savings are **recognized immediately** and **reported immediately**, but are **not silently absorbed into the live forecast**. They remain in a tracked savings bucket until PM/PX explicitly dispositions them.

**Savings are recognized** when `status` transitions to `ContractExecuted` (or is already `ContractExecuted` or `Complete`) and `contractAmount < originalBudget`.

**Disposition destinations:**

| Disposition | Meaning |
|-------------|---------|
| `AppliedToForecast` | Savings reduce the project's estimated cost at completion; PM updates relevant forecast line(s) |
| `HeldInContingency` | Savings transferred to project contingency / reserve; `currentContingency` in T04 §5.4 increases accordingly |
| `ReleasedToGoverned` | Savings released to a governed margin / release bucket managed by PE/Leadership; Financial records the release event |

**Buyout savings record:**

```typescript
interface IBuyoutSavingsDisposition {
  dispositionId: string;                          // UUID
  buyoutLineId: string;
  projectId: string;
  totalSavingsAmount: number;                     // Total savings from this line
  dispositionedAmount: number;                    // Amount dispositioned so far
  undispositionedAmount: number;                  // totalSavingsAmount - dispositionedAmount
  dispositionItems: IBuyoutSavingsDispositionItem[];
  createdAt: string;
  lastUpdatedAt: string;
}

interface IBuyoutSavingsDispositionItem {
  itemId: string;
  destination: BuyoutSavingsDestination;          // 'AppliedToForecast' | 'HeldInContingency' | 'ReleasedToGoverned'
  amount: number;
  dispositionedBy: string;                        // userId
  dispositionedAt: string;                        // ISO 8601 timestamp
  notes: string | null;
  linkedForecastVersionId: string | null;         // If AppliedToForecast, the version receiving the savings
}

type BuyoutSavingsDestination = 'AppliedToForecast' | 'HeldInContingency' | 'ReleasedToGoverned';
type BuyoutSavingsDispositionStatus = 'NoSavings' | 'Undispositioned' | 'PartiallyDispositioned' | 'FullyDispositioned';
```

### 8.6 Savings disposition workflow

1. When `contractAmount < originalBudget` and `status` transitions to `ContractExecuted`, the system creates an `IBuyoutSavingsDisposition` record with `undispositionedAmount = totalSavingsAmount`.
2. A Work Queue item "Undispositioned buyout savings require action" is created and assigned to the PM.
3. PM selects a disposition for all or part of the savings (one or more destinations may be used).
4. Until all savings are dispositioned, the forecast checklist conditional item `buyout_savings_dispositioned` must be marked complete (PM attestation) before version confirmation.
5. If PM selects `AppliedToForecast`, the relevant budget line `forecastToComplete` values in the current working version are updated accordingly (PM action; system does not auto-apply).
6. If PM selects `HeldInContingency`, `currentContingency` in the forecast summary is increased by the dispositioned amount (system applies when PM confirms the disposition).
7. If PM selects `ReleasedToGoverned`, a `BuyoutSavingsReleased` activity event is published with PE notified.

### 8.7 Buyout reconciliation to budget

The Financial module publishes a buyout reconciliation metric to the Health spine:
- `buyoutToCommittedCostsReconciliation`: Compares total `contractAmount` from executed lines against `committedCosts` total from budget line model.
- Acceptable tolerance: within 5%.
- If variance exceeds tolerance: Health spine flags "Buyout discrepancy — contract amounts do not reconcile to budget. Review and investigate."

---

*Navigation: [← T05 Cash Flow Working Model](P3-E4-T05-Cash-Flow-Working-Model.md) | [Master Index](P3-E4-Financial-Module-Field-Specification.md) | [T07 Business Rules and Calculations →](P3-E4-T07-Business-Rules-and-Calculations.md)*
