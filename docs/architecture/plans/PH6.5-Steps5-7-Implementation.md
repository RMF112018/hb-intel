# PH6.5 — Steps 5–7 Real Implementations

**Version:** 2.0
**Purpose:** Implement real production code for Steps 5 (SPFx web parts installation), 6 (SharePoint group permissions), and 7 (hub site association). Step 5 includes the timeout/deferral logic that feeds the overnight timer trigger. Step 6 applies permissions based on the group members specified in the Project Setup Request.
**Audience:** Implementation agent(s), technical reviewers.
**Implementation Objective:** Steps 5–7 execute under Managed Identity with real PnPjs/Graph calls. Step 5 has a 90-second timeout and defers gracefully to the overnight timer. Step 6 applies project-specific permissions (Pursuit Team / Project Team members) plus the OpEx Manager. Step 7 associates the new site with the HB Intel hub site.

---

## Prerequisites

- PH6.4 complete and passing.
- `SHAREPOINT_HUB_SITE_ID` environment variable set in `local.settings.json` and Azure Portal.
- SPFx app package deployed to the SharePoint App Catalog (this is a prerequisite for Step 5 — confirm with SharePoint admin).

---

## 6.5.1 — Step 5: Install SPFx Web Parts (with Timeout/Deferral)

Update `backend/functions/src/functions/provisioningSaga/steps/step5-web-parts.ts`:

```typescript
import type { IServiceContainer } from '../../../services/service-factory.js';
import type { IProvisioningStatus, ISagaStepResult } from '@hbc/models';
import type { ILogger } from '../../../utils/logger.js';

const STEP5_TIMEOUT_MS = parseInt(process.env.PROVISIONING_STEP5_TIMEOUT_MS ?? '90000', 10);
const STEP5_MAX_ATTEMPTS = 2;

export async function executeStep5(
  services: IServiceContainer,
  status: IProvisioningStatus,
  logger: ILogger
): Promise<ISagaStepResult> {
  const result: ISagaStepResult = {
    stepNumber: 5, stepName: 'Install Web Parts',
    status: 'InProgress', startedAt: new Date().toISOString(),
  };

  if (!status.siteUrl) {
    result.status = 'Failed';
    result.errorMessage = 'siteUrl not set — Step 1 must complete before Step 5';
    return result;
  }

  for (let attempt = 1; attempt <= STEP5_MAX_ATTEMPTS; attempt++) {
    try {
      await Promise.race([
        services.sharePoint.installWebParts(status.siteUrl),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`Step 5 timed out after ${STEP5_TIMEOUT_MS}ms`)),
            STEP5_TIMEOUT_MS)
        ),
      ]);
      result.status = 'Completed';
      result.completedAt = new Date().toISOString();
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.warn(`Step 5 attempt ${attempt} failed`, {
        correlationId: status.correlationId,
        projectId: status.projectId,
        error: msg,
      });

      if (attempt === STEP5_MAX_ATTEMPTS) {
        // Defer to overnight timer
        logger.info('Step 5 deferred to overnight timer', {
          correlationId: status.correlationId,
          projectId: status.projectId,
        });
        status.step5DeferredToTimer = true;
        result.status = 'DeferredToTimer';
        result.completedAt = new Date().toISOString();
        result.errorMessage = msg;
        return result;
      }
      // Brief pause before retry
      await new Promise((r) => setTimeout(r, 5000));
    }
  }

  // Should not reach here
  result.status = 'DeferredToTimer';
  status.step5DeferredToTimer = true;
  return result;
}
```

Add `installWebParts` to `ISharePointService` and `SharePointService`:

```typescript
async installWebParts(siteUrl: string): Promise<void> {
  const sp = await this.getSP(siteUrl);
  // Get the App Catalog relative URL
  const appCatalogUrl = process.env.SHAREPOINT_APP_CATALOG_URL!;
  if (!appCatalogUrl) throw new Error('SHAREPOINT_APP_CATALOG_URL env var is required');

  // Install HB Intel app from tenant app catalog to this site
  const HB_INTEL_APP_ID = process.env.HB_INTEL_SPFX_APP_ID!;
  if (!HB_INTEL_APP_ID) throw new Error('HB_INTEL_SPFX_APP_ID env var is required');

  await sp.web.appcatalog.getAppById(HB_INTEL_APP_ID).install();

  // Wait for installation to complete (poll up to timeout)
  const deadline = Date.now() + 60_000;
  while (Date.now() < deadline) {
    const apps = await sp.web.appcatalog.filter(`ProductId eq '${HB_INTEL_APP_ID}'`)();
    if (apps[0]?.InstalledVersion) return;
    await new Promise((r) => setTimeout(r, 5000));
  }
  throw new Error('Web part installation did not complete within 60 seconds');
}
```

Add to `local.settings.json` documentation:
- `SHAREPOINT_APP_CATALOG_URL` — tenant app catalog URL
- `HB_INTEL_SPFX_APP_ID` — the GUID of the HB Intel SPFx app in the catalog

---

## 6.5.2 — Step 6: Set Permissions

Update `backend/functions/src/functions/provisioningSaga/steps/step6-permissions.ts`:

```typescript
import type { IServiceContainer } from '../../../services/service-factory.js';
import type { IProvisioningStatus, ISagaStepResult } from '@hbc/models';

const OPEX_UPN = process.env.OPEX_MANAGER_UPN!;

export async function executeStep6(
  services: IServiceContainer,
  status: IProvisioningStatus
): Promise<ISagaStepResult> {
  const result: ISagaStepResult = {
    stepNumber: 6, stepName: 'Set Permissions',
    status: 'InProgress', startedAt: new Date().toISOString(),
  };

  if (!status.siteUrl) {
    result.status = 'Failed';
    result.errorMessage = 'siteUrl not set — Step 1 must complete before Step 6';
    return result;
  }

  try {
    // groupMembers contains the UPNs selected by the Estimating Coordinator
    // plus any defaults pre-populated (BD user, OpEx Manager)
    // Ensure OpEx Manager is always included (deduplicate)
    const members = Array.from(new Set([...status.groupMembers, OPEX_UPN].filter(Boolean)));

    await services.sharePoint.setGroupPermissions(status.siteUrl, members, OPEX_UPN);

    result.status = 'Completed';
    result.completedAt = new Date().toISOString();
  } catch (err) {
    result.status = 'Failed';
    result.errorMessage = err instanceof Error ? err.message : String(err);
  }
  return result;
}

// No compensation needed — site deletion in Step 1 compensation removes the site and all permissions.
```

Add `OPEX_MANAGER_UPN` to `local.settings.json` documentation — this is the UPN of the OpEx Manager who is always pre-included in every project group.

**Permission tier mapping applied in `setGroupPermissions`:**

| Member Type | SharePoint Role | Notes |
|---|---|---|
| Pursuit Team / Project Team members | Contribute (1073741827) | Full read/write on designated site |
| OpEx Manager | Contribute (1073741827) | Always included by default |
| Site owner (Managed Identity) | Full Control | Set automatically at site creation |

The Admin, Leadership, and Shared Services permission tiers (read-only / read-limited-write on all sites) are granted through **SharePoint Hub Site inheritance and tenant-level group memberships** — not through the per-project provisioning saga. Those assignments are managed by the SharePoint admin as standing permissions and are out of scope for the per-project saga.

---

## 6.5.3 — Step 7: Associate Hub Site

Update `backend/functions/src/functions/provisioningSaga/steps/step7-hub-association.ts`:

```typescript
export async function executeStep7(
  services: IServiceContainer,
  status: IProvisioningStatus
): Promise<ISagaStepResult> {
  const result: ISagaStepResult = {
    stepNumber: 7, stepName: 'Associate Hub Site',
    status: 'InProgress', startedAt: new Date().toISOString(),
  };

  if (!status.siteUrl) {
    result.status = 'Failed';
    result.errorMessage = 'siteUrl not set — Step 1 must complete before Step 7';
    return result;
  }

  try {
    const hubSiteId = process.env.SHAREPOINT_HUB_SITE_ID!;
    if (!hubSiteId) throw new Error('SHAREPOINT_HUB_SITE_ID env var is required');

    // Idempotency: check if already associated
    const alreadyAssociated = await services.sharePoint.isHubAssociated(status.siteUrl);
    if (!alreadyAssociated) {
      await services.sharePoint.associateHubSite(status.siteUrl, hubSiteId);
    }

    result.status = 'Completed';
    result.idempotentSkip = alreadyAssociated;
    result.completedAt = new Date().toISOString();
  } catch (err) {
    result.status = 'Failed';
    result.errorMessage = err instanceof Error ? err.message : String(err);
  }
  return result;
}

/** Compensation: remove hub association. */
export async function compensateStep7(
  services: IServiceContainer,
  status: IProvisioningStatus
): Promise<void> {
  if (status.siteUrl) {
    await services.sharePoint.disassociateHubSite(status.siteUrl);
  }
}
```

---

## 6.5.4 — Update `service-factory.ts`

Ensure `createServiceFactory` returns the real `SharePointService` in production and the `MockSharePointService` only when `NODE_ENV === 'test'` or `HBC_ADAPTER_MODE === 'mock'`:

```typescript
import { SharePointService } from './sharepoint-service.js';
import { MockSharePointService } from './mock-sharepoint-service.js';
import { RealTableStorageService } from './table-storage-service.js';
import { MockTableStorageService } from './mock-table-storage-service.js';
import { RealSignalRPushService } from './signalr-push-service.js';
import { MockSignalRPushService } from './mock-signalr-push-service.js';
import { ManagedIdentityOboService } from './msal-obo-service.js';

export function createServiceFactory(): IServiceContainer {
  const isMock = process.env.HBC_ADAPTER_MODE === 'mock' || process.env.NODE_ENV === 'test';
  return {
    sharePoint: isMock ? new MockSharePointService() : new SharePointService(),
    tableStorage: isMock ? new MockTableStorageService() : new RealTableStorageService(),
    signalR: isMock ? new MockSignalRPushService() : new RealSignalRPushService(),
    obo: isMock ? null : new ManagedIdentityOboService(),
  };
}
```

---

## 6.5 Success Criteria Checklist

- [ ] 6.5.1 Step 5 attempts real `installWebParts`; defers after 2 failed attempts or 90s timeout.
- [ ] 6.5.2 `status.step5DeferredToTimer = true` is set on deferral; result status is `DeferredToTimer`.
- [ ] 6.5.3 Step 6 `setGroupPermissions` applies correct SharePoint role to all group members.
- [ ] 6.5.4 OpEx Manager UPN is always included in Step 6 group members (deduplicated).
- [ ] 6.5.5 Step 7 checks `isHubAssociated` before calling `associateHubSite` (idempotency).
- [ ] 6.5.6 `compensateStep7` disassociates hub if Step 7 was the failure point.
- [ ] 6.5.7 `createServiceFactory` returns real services in production, mocks in test mode.
- [ ] 6.5.8 `SHAREPOINT_APP_CATALOG_URL`, `HB_INTEL_SPFX_APP_ID`, `SHAREPOINT_HUB_SITE_ID`, `OPEX_MANAGER_UPN` documented in `backend/functions/README.md`.
- [ ] 6.5.9 All Step 5–7 unit tests pass with mock services.

## PH6.5 Progress Notes

_(To be completed during implementation)_

### Verification Evidence

- `pnpm turbo run build --filter=backend-functions` → EXIT 0 — PASS / FAIL
- Step 5 timeout simulation (set `PROVISIONING_STEP5_TIMEOUT_MS=100`) → `DeferredToTimer` result — PASS / FAIL
- Layer 2 smoke test: Step 7 associates site with hub in real SharePoint tenant — PASS / FAIL
- Layer 2 smoke test: Re-running Step 7 returns idempotent skip — PASS / FAIL
