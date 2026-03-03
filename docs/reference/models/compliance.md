# Compliance Models Reference

> Vendor regulatory tracking and compliance management.

**Package:** `@hbc/models` | **Module:** `compliance`
**Data-access port:** `IComplianceRepository`

## Interfaces

### `IComplianceEntry`

| Field | Type | Description |
|-------|------|-------------|
| `id` | `number` | Entry identifier |
| `projectId` | `string` | Project identifier |
| `vendorName` | `string` | Vendor name |
| `requirementType` | `string` | Requirement type |
| `status` | `string` | Compliance status |
| `expirationDate` | `string` | ISO-8601 expiration date |

### `IComplianceSummary`

| Field | Type | Description |
|-------|------|-------------|
| `projectId` | `string` | Project identifier |
| `totalEntries` | `number` | Total entries |
| `compliant` | `number` | Compliant count |
| `nonCompliant` | `number` | Non-compliant count |
| `expiringSoon` | `number` | Expiring soon count |

### Form Data

`IComplianceEntryFormData`

## Enums

### `ComplianceStatus`

`Compliant` | `NonCompliant` | `ExpiringSoon` | `PendingReview`

### `ComplianceRequirementType`

`Insurance` | `License` | `SafetyCertification` | `Bond` | `WorkersComp`

## Constants

| Constant | Description |
|----------|-------------|
| `COMPLIANCE_STATUS_LABELS` | Human-readable status labels |
| `COMPLIANCE_EXPIRY_WARNING_DAYS` | Days before expiry warning (30) |

## Import Examples

```ts
import type { IComplianceEntry } from '@hbc/models';
import { ComplianceStatus, ComplianceRequirementType } from '@hbc/models/compliance';
```
