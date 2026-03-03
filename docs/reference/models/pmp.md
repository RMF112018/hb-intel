# PMP Models Reference

> Project Management Plan documents and signature workflows.

**Package:** `@hbc/models` | **Module:** `pmp`
**Data-access port:** `IPmpRepository`

## Interfaces

### `IProjectManagementPlan`

| Field | Type | Description |
|-------|------|-------------|
| `id` | `number` | PMP identifier |
| `projectId` | `string` | Project identifier |
| `version` | `number` | Document version |
| `status` | `string` | PMP status |
| `createdAt` | `string` | ISO-8601 creation timestamp |
| `updatedAt` | `string` | ISO-8601 updated timestamp |

### `IPMPSignature`

| Field | Type | Description |
|-------|------|-------------|
| `id` | `number` | Signature identifier |
| `pmpId` | `number` | PMP being signed |
| `signerName` | `string` | Signer name |
| `role` | `string` | Signer role |
| `signedAt` | `string` | ISO-8601 signed timestamp |
| `status` | `string` | Signature status |

### Form Data

`IPmpFormData`, `IPmpSignatureFormData`

## Enums

### `PmpStatus`

`Draft` | `InReview` | `Approved` | `Superseded`

### `SignatureStatus`

`Pending` | `Signed` | `Declined`

## Constants

| Constant | Description |
|----------|-------------|
| `PMP_STATUS_LABELS` | Human-readable PMP status labels |
| `SIGNATURE_STATUS_LABELS` | Human-readable signature status labels |

## Import Examples

```ts
import type { IProjectManagementPlan, IPMPSignature } from '@hbc/models';
import { PmpStatus, SignatureStatus } from '@hbc/models/pmp';
```
