# PH6.6 — Dual Store Persistence

**Version:** 2.0
**Purpose:** Implement real Azure Table Storage for authoritative per-step provisioning state and a SharePoint `ProvisioningAuditLog` list for lifecycle-event audit records. Define exact schemas, write rules, and error handling for both stores.
**Audience:** Implementation agent(s), technical reviewers.
**Implementation Objective:** Every saga step writes its result to Azure Table Storage immediately. Three lifecycle events (started, completed, failed) write a summary record to SharePoint. The SharePoint write is always fire-and-forget and never blocks or fails the provisioning run.

---

## Prerequisites

- PH6.1–PH6.5 complete and passing.
- Azure Storage Account created; connection string stored in `local.settings.json` and Azure Key Vault / App Settings.
- `@azure/data-tables` installed.

---

## 6.6.1 — Install Azure Data Tables SDK

```bash
cd backend/functions
npm install @azure/data-tables
```

---

## 6.6.2 — Azure Table Storage Schema

Table name: `ProvisioningStatus`

| Property | Type | Notes |
|---|---|---|
| `partitionKey` | string | `projectId` (UUID v4) — enables fast lookup by project |
| `rowKey` | string | `correlationId` (UUID v4) — unique per provisioning run |
| `projectNumber` | string | `##-###-##` format |
| `projectName` | string | Display name |
| `overallStatus` | string | Enum: NotStarted / InProgress / BaseComplete / Completed / Failed / WebPartsPending |
| `currentStep` | int | 0–7 |
| `stepsJson` | string | JSON-serialized `ISagaStepResult[]` — Azure Tables don't support arrays natively |
| `siteUrl` | string | Set after Step 1 completes; empty until then |
| `triggeredBy` | string | UPN from validated Bearer token |
| `submittedBy` | string | UPN of Estimating Coordinator |
| `groupMembersJson` | string | JSON-serialized UPN array |
| `startedAt` | string | ISO timestamp |
| `completedAt` | string | ISO timestamp or empty |
| `failedAt` | string | ISO timestamp or empty |
| `step5DeferredToTimer` | bool | true when Step 5 deferred |
| `retryCount` | int | Number of manual retries |
| `escalatedBy` | string | UPN or empty |

---

## 6.6.3 — Real `table-storage-service.ts`

Replace the mock with a full `RealTableStorageService`:

```typescript
import { TableClient, AzureNamedKeyCredential, odata } from '@azure/data-tables';
import type { IProvisioningStatus } from '@hbc/models';

const TABLE_NAME = 'ProvisioningStatus';

export interface ITableStorageService {
  upsertProvisioningStatus(status: IProvisioningStatus): Promise<void>;
  getProvisioningStatus(projectId: string): Promise<IProvisioningStatus | null>;
  getLatestRun(projectId: string): Promise<IProvisioningStatus | null>;
  listPendingStep5Jobs(): Promise<IProvisioningStatus[]>;
  escalateProvisioning(projectId: string, escalatedBy: string): Promise<void>;
}

export class RealTableStorageService implements ITableStorageService {
  private readonly client: TableClient;

  constructor() {
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING!;
    if (!connectionString) throw new Error('AZURE_STORAGE_CONNECTION_STRING is required');
    this.client = TableClient.fromConnectionString(connectionString, TABLE_NAME);
  }

  async upsertProvisioningStatus(status: IProvisioningStatus): Promise<void> {
    await this.client.createTableIfNotExists();
    await this.client.upsertEntity({
      partitionKey: status.projectId,
      rowKey: status.correlationId,
      projectNumber: status.projectNumber,
      projectName: status.projectName,
      overallStatus: status.overallStatus,
      currentStep: status.currentStep,
      stepsJson: JSON.stringify(status.steps),
      siteUrl: status.siteUrl ?? '',
      triggeredBy: status.triggeredBy,
      submittedBy: status.submittedBy,
      groupMembersJson: JSON.stringify(status.groupMembers),
      startedAt: status.startedAt,
      completedAt: status.completedAt ?? '',
      failedAt: status.failedAt ?? '',
      step5DeferredToTimer: status.step5DeferredToTimer,
      retryCount: status.retryCount,
      escalatedBy: status.escalatedBy ?? '',
    }, 'Replace');
  }

  async getProvisioningStatus(projectId: string): Promise<IProvisioningStatus | null> {
    return this.getLatestRun(projectId);
  }

  async getLatestRun(projectId: string): Promise<IProvisioningStatus | null> {
    const entities = this.client.listEntities<Record<string, unknown>>({
      queryOptions: { filter: odata`PartitionKey eq ${projectId}` },
    });

    let latest: (Record<string, unknown> & { startedAt: string }) | null = null;
    for await (const entity of entities) {
      if (!latest || (entity.startedAt as string) > latest.startedAt) {
        latest = entity as typeof latest;
      }
    }

    if (!latest) return null;
    return this.deserialize(latest);
  }

  async listPendingStep5Jobs(): Promise<IProvisioningStatus[]> {
    const entities = this.client.listEntities<Record<string, unknown>>({
      queryOptions: {
        filter: odata`step5DeferredToTimer eq true and overallStatus eq 'WebPartsPending'`,
      },
    });
    const results: IProvisioningStatus[] = [];
    for await (const entity of entities) {
      results.push(this.deserialize(entity as Record<string, unknown>));
    }
    return results;
  }

  async escalateProvisioning(projectId: string, escalatedBy: string): Promise<void> {
    const status = await this.getLatestRun(projectId);
    if (!status) throw new Error(`No record found for projectId ${projectId}`);
    status.escalatedBy = escalatedBy;
    await this.upsertProvisioningStatus(status);
  }

  private deserialize(entity: Record<string, unknown>): IProvisioningStatus {
    return {
      projectId: entity.partitionKey as string,
      correlationId: entity.rowKey as string,
      projectNumber: entity.projectNumber as string,
      projectName: entity.projectName as string,
      overallStatus: entity.overallStatus as IProvisioningStatus['overallStatus'],
      currentStep: entity.currentStep as number,
      steps: JSON.parse(entity.stepsJson as string ?? '[]'),
      siteUrl: (entity.siteUrl as string) || undefined,
      triggeredBy: entity.triggeredBy as string,
      submittedBy: entity.submittedBy as string,
      groupMembers: JSON.parse(entity.groupMembersJson as string ?? '[]'),
      startedAt: entity.startedAt as string,
      completedAt: (entity.completedAt as string) || undefined,
      failedAt: (entity.failedAt as string) || undefined,
      step5DeferredToTimer: entity.step5DeferredToTimer as boolean,
      retryCount: entity.retryCount as number,
      escalatedBy: (entity.escalatedBy as string) || undefined,
    };
  }
}
```

---

## 6.6.4 — SharePoint `ProvisioningAuditLog` List Schema

This list is created manually by the SharePoint admin (or via a one-time provisioning script) in the root HB Intel site collection before Phase 6 goes live.

List name: `ProvisioningAuditLog`

| Column Internal Name | Display Name | Type | Required |
|---|---|---|---|
| `Title` | Title (auto) | Single line of text | Yes |
| `ProjectId` | Project ID | Single line of text | Yes |
| `ProjectNumber` | Project Number | Single line of text | Yes |
| `ProjectName` | Project Name | Single line of text | Yes |
| `CorrelationId` | Correlation ID | Single line of text | Yes |
| `Event` | Event | Choice: Started / Completed / Failed | Yes |
| `TriggeredBy` | Triggered By | Single line of text | Yes |
| `SubmittedBy` | Submitted By | Single line of text | Yes |
| `Timestamp` | Timestamp | Date and Time | Yes |
| `SiteUrl` | Site URL | Hyperlink | No |
| `ErrorSummary` | Error Summary | Multiple lines of text | No |

Create a setup script `scripts/create-audit-list.ts` that creates this list programmatically using PnPjs — document this script in `docs/how-to/administrator/create-audit-list.md`.

---

## 6.6.5 — Write Rules Summary

| Event | Azure Table | SharePoint Audit List |
|---|---|---|
| Saga triggered | Write (upsert) — creates initial record | Write (fire-and-forget) — `Started` event |
| Each step completes or fails | Write (upsert) — updates step result | No write |
| Step 5 deferred to timer | Write (upsert) — sets `step5DeferredToTimer = true`, `overallStatus = WebPartsPending` | No write |
| Saga completes (all steps) | Write (upsert) — sets `overallStatus = Completed`, `completedAt` | Write (fire-and-forget) — `Completed` event |
| Saga fails | Write (upsert) — sets `overallStatus = Failed`, `failedAt` | Write (fire-and-forget) — `Failed` event |
| Timer completes Step 5 overnight | Write (upsert) — sets `overallStatus = Completed`, `step5DeferredToTimer = false` | Write (fire-and-forget) — `Completed` event |

---

## 6.6 Success Criteria Checklist

- [ ] 6.6.1 `@azure/data-tables` installed.
- [ ] 6.6.2 `RealTableStorageService` implemented: `upsertProvisioningStatus`, `getProvisioningStatus`, `getLatestRun`, `listPendingStep5Jobs`, `escalateProvisioning`.
- [ ] 6.6.3 Azure Table `partitionKey = projectId`, `rowKey = correlationId`.
- [ ] 6.6.4 `stepsJson` and `groupMembersJson` serialize/deserialize correctly.
- [ ] 6.6.5 `ProvisioningAuditLog` SharePoint list schema documented and setup script created.
- [ ] 6.6.6 SharePoint audit writes are always fire-and-forget with `.catch` — never throw.
- [ ] 6.6.7 `listPendingStep5Jobs` returns only records with `step5DeferredToTimer = true` and `overallStatus = WebPartsPending`.
- [ ] 6.6.8 Unit tests for `RealTableStorageService` pass using Azurite emulator.

## PH6.6 Progress Notes

_(To be completed during implementation)_

### Verification Evidence

- `pnpm turbo run build --filter=backend-functions` → EXIT 0 — PASS / FAIL
- Azurite emulator running locally: `upsertProvisioningStatus` then `getProvisioningStatus` returns matching record — PASS / FAIL
- `listPendingStep5Jobs` returns records where `step5DeferredToTimer = true` — PASS / FAIL
- Layer 2 smoke test: `writeAuditRecord` creates real SharePoint list item in test tenant — PASS / FAIL
