# PH6.4 — Steps 1–4 Real PnPjs Implementations

**Version:** 2.0
**Purpose:** Replace the mock SharePoint service with real PnPjs/Graph implementations for Steps 1 through 4 of the provisioning saga: site creation, document library creation, template file upload, and data list creation. Each step includes an idempotency check, a compensation function, and full JSDoc.
**Audience:** Implementation agent(s), technical reviewers.
**Implementation Objective:** All four steps execute against a real SharePoint tenant using Managed Identity. Each step checks for existing SharePoint artefacts before creating them (idempotency). Each step has a tested compensation function that reverses its work cleanly.

---

## Prerequisites

- PH6.1, PH6.2, PH6.3 complete and passing.
- `@pnp/sp` and `@pnp/graph` installed in `backend/functions`.
- Managed Identity has `Sites.FullControl.All` permission (confirmed in PH6.2).

---

## 6.4.1 — Install PnPjs

```bash
cd backend/functions
npm install @pnp/sp @pnp/graph @pnp/nodejs-commonjs @pnp/logging
```

---

## 6.4.2 — Real `sharepoint-service.ts`

Replace `backend/functions/src/services/sharepoint-service.ts` with a full production implementation. The service is initialized with a PnPjs `SPFI` instance backed by the Managed Identity token.

```typescript
import { spfi } from '@pnp/sp';
import '@pnp/sp/sites/index.js';
import '@pnp/sp/webs/index.js';
import '@pnp/sp/lists/index.js';
import '@pnp/sp/files/index.js';
import '@pnp/sp/folders/index.js';
import '@pnp/sp/site-groups/index.js';
import '@pnp/sp/site-users/index.js';
import { DefaultAzureCredential } from '@azure/identity';
import type { IProvisioningAuditRecord } from '@hbc/models';

export interface ISharePointService {
  createSite(projectId: string, projectNumber: string, projectName: string): Promise<string>;
  siteExists(projectId: string): Promise<string | null>;
  deleteSite(siteUrl: string): Promise<void>;
  createDocumentLibrary(siteUrl: string, libraryName: string): Promise<void>;
  documentLibraryExists(siteUrl: string, libraryName: string): Promise<boolean>;
  uploadTemplateFiles(siteUrl: string, libraryName: string): Promise<void>;
  createDataLists(siteUrl: string, listDefinitions: IListDefinition[]): Promise<void>;
  listExists(siteUrl: string, listTitle: string): Promise<boolean>;
  setGroupPermissions(siteUrl: string, memberUpns: string[], opexUpn: string): Promise<void>;
  associateHubSite(siteUrl: string, hubSiteId: string): Promise<void>;
  isHubAssociated(siteUrl: string): Promise<boolean>;
  disassociateHubSite(siteUrl: string): Promise<void>;
  writeAuditRecord(record: IProvisioningAuditRecord): Promise<void>;
}

export interface IListDefinition {
  title: string;
  description: string;
  template: number; // SharePoint list template ID (100 = Generic list)
  fields: IFieldDefinition[];
}

export interface IFieldDefinition {
  internalName: string;
  displayName: string;
  type: 'Text' | 'Number' | 'DateTime' | 'Boolean' | 'Choice' | 'User' | 'URL';
  required?: boolean;
  choices?: string[]; // for Choice type
}

export class SharePointService implements ISharePointService {
  private readonly tenantUrl: string;
  private readonly credential = new DefaultAzureCredential();

  constructor() {
    this.tenantUrl = process.env.SHAREPOINT_TENANT_URL!;
    if (!this.tenantUrl) throw new Error('SHAREPOINT_TENANT_URL env var is required');
  }

  /** Derives the site URL from projectNumber for consistent naming. */
  private getSiteUrl(projectNumber: string, projectName: string): string {
    const slug = projectName.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 40);
    return `${this.tenantUrl}/sites/${projectNumber}-${slug}`;
  }

  async siteExists(projectId: string): Promise<string | null> {
    // Check the audit list first — fast lookup without hitting each site
    const sp = await this.getSP(this.tenantUrl);
    try {
      const items = await sp.web.lists
        .getByTitle('ProvisioningAuditLog')
        .items
        .filter(`ProjectId eq '${projectId}' and Event eq 'Completed'`)
        .select('SiteUrl')();
      if (items.length > 0 && items[0].SiteUrl) {
        return items[0].SiteUrl as string;
      }
    } catch {
      // Audit log may not exist yet on first run — ignore
    }
    return null;
  }

  async createSite(projectId: string, projectNumber: string, projectName: string): Promise<string> {
    const siteUrl = this.getSiteUrl(projectNumber, projectName);
    const sp = await this.getSP(this.tenantUrl);

    await sp.sites.createCommunicationSite({
      Title: `${projectNumber} — ${projectName}`,
      Url: siteUrl,
      Description: `HB Intel project site for ${projectNumber} — ${projectName}`,
      Lcid: 1033,
    });

    // Wait for site provisioning to complete (poll up to 60s)
    await this.waitForSite(siteUrl, 60_000);
    return siteUrl;
  }

  async deleteSite(siteUrl: string): Promise<void> {
    const sp = await this.getSP(this.tenantUrl);
    await sp.site.delete();
    // Note: Site deletion is asynchronous in SharePoint — the site enters a recycle bin.
    // Permanent deletion is deferred to a maintenance runbook.
  }

  async createDocumentLibrary(siteUrl: string, libraryName: string): Promise<void> {
    const sp = await this.getSP(siteUrl);
    await sp.web.lists.add(libraryName, '', 101 /* DocumentLibrary */, true);
  }

  async documentLibraryExists(siteUrl: string, libraryName: string): Promise<boolean> {
    const sp = await this.getSP(siteUrl);
    try {
      await sp.web.lists.getByTitle(libraryName).select('Id')();
      return true;
    } catch {
      return false;
    }
  }

  async uploadTemplateFiles(siteUrl: string, libraryName: string): Promise<void> {
    const sp = await this.getSP(siteUrl);
    const folder = sp.web.getFolderByServerRelativePath(
      `/${new URL(siteUrl).pathname.slice(1)}/Shared Documents`
    );
    // Upload placeholder README — real template files are defined per project type in PH6.5
    await folder.files.addUsingPath('README.txt',
      Buffer.from(`HB Intel Project Site — ${siteUrl}\nCreated by provisioning saga.`), {
        Overwrite: true,
      });
  }

  async createDataLists(siteUrl: string, listDefinitions: IListDefinition[]): Promise<void> {
    const sp = await this.getSP(siteUrl);
    for (const def of listDefinitions) {
      const alreadyExists = await this.listExists(siteUrl, def.title);
      if (alreadyExists) continue; // Idempotency: skip if already created

      const { list } = await sp.web.lists.add(def.title, def.description, def.template, true);
      for (const field of def.fields) {
        await list.fields.addText(field.internalName, { Required: field.required ?? false });
      }
    }
  }

  async listExists(siteUrl: string, listTitle: string): Promise<boolean> {
    const sp = await this.getSP(siteUrl);
    try {
      await sp.web.lists.getByTitle(listTitle).select('Id')();
      return true;
    } catch {
      return false;
    }
  }

  async setGroupPermissions(siteUrl: string, memberUpns: string[], opexUpn: string): Promise<void> {
    const sp = await this.getSP(siteUrl);
    // Break role inheritance so site has its own permissions
    await sp.web.breakRoleInheritance(false, true);
    // Add each member as a contributor (Edit permission level)
    for (const upn of [...memberUpns, opexUpn]) {
      await sp.web.siteUsers.getByEmail(upn).then(async (user) => {
        await sp.web.roleAssignments.add(user.Id, 1073741827 /* Contribute */);
      }).catch((err) => {
        throw new Error(`Failed to add user ${upn}: ${err instanceof Error ? err.message : String(err)}`);
      });
    }
  }

  async associateHubSite(siteUrl: string, hubSiteId: string): Promise<void> {
    const sp = await this.getSP(siteUrl);
    await sp.site.joinHubSiteById(hubSiteId);
  }

  async isHubAssociated(siteUrl: string): Promise<boolean> {
    const sp = await this.getSP(siteUrl);
    const siteInfo = await sp.site.select('HubSiteId')();
    return !!siteInfo.HubSiteId && siteInfo.HubSiteId !== '00000000-0000-0000-0000-000000000000';
  }

  async disassociateHubSite(siteUrl: string): Promise<void> {
    const sp = await this.getSP(siteUrl);
    await sp.site.unJoinHubSite();
  }

  async writeAuditRecord(record: IProvisioningAuditRecord): Promise<void> {
    const sp = await this.getSP(this.tenantUrl);
    const list = sp.web.lists.getByTitle('ProvisioningAuditLog');
    await list.items.add({
      Title: `${record.projectNumber} — ${record.event}`,
      ProjectId: record.projectId,
      ProjectNumber: record.projectNumber,
      ProjectName: record.projectName,
      CorrelationId: record.correlationId,
      Event: record.event,
      TriggeredBy: record.triggeredBy,
      SubmittedBy: record.submittedBy,
      Timestamp: record.timestamp,
      SiteUrl: record.siteUrl ?? '',
      ErrorSummary: record.errorSummary ?? '',
    });
  }

  private async getSP(siteUrl: string) {
    const token = await this.credential.getToken(
      `${new URL(this.tenantUrl).origin}/.default`
    );
    return spfi(siteUrl).using(/* bearer token binding */ {
      bind(instance) {
        instance.on.auth.replace(async (_, req, done) => {
          req.headers.set('Authorization', `Bearer ${token!.token}`);
          done(req);
        });
      }
    });
  }

  private async waitForSite(siteUrl: string, timeoutMs: number): Promise<void> {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      try {
        const sp = await this.getSP(siteUrl);
        await sp.web.select('Title')();
        return; // Site is ready
      } catch {
        await new Promise((r) => setTimeout(r, 3000));
      }
    }
    throw new Error(`Site at ${siteUrl} did not become available within ${timeoutMs}ms`);
  }
}
```

---

## 6.4.3 — Step 1: Create Site (Real Implementation)

Update `backend/functions/src/functions/provisioningSaga/steps/step1-create-site.ts`:

```typescript
import type { IServiceContainer } from '../../../services/service-factory.js';
import type { IProvisioningStatus, ISagaStepResult } from '@hbc/models';

export async function executeStep1(
  services: IServiceContainer,
  status: IProvisioningStatus
): Promise<ISagaStepResult> {
  const result: ISagaStepResult = {
    stepNumber: 1, stepName: 'Create Site',
    status: 'InProgress', startedAt: new Date().toISOString(),
  };
  try {
    // Idempotency: check if site was already created in a prior run
    const existingUrl = await services.sharePoint.siteExists(status.projectId);
    if (existingUrl) {
      status.siteUrl = existingUrl;
      result.status = 'Completed';
      result.idempotentSkip = true;
      result.completedAt = new Date().toISOString();
      return result;
    }
    const siteUrl = await services.sharePoint.createSite(
      status.projectId, status.projectNumber, status.projectName
    );
    status.siteUrl = siteUrl;
    result.status = 'Completed';
    result.completedAt = new Date().toISOString();
  } catch (err) {
    result.status = 'Failed';
    result.errorMessage = err instanceof Error ? err.message : String(err);
  }
  return result;
}

/** Compensation: delete the site. Site enters SharePoint recycle bin — not permanently deleted. */
export async function compensateStep1(
  services: IServiceContainer, status: IProvisioningStatus
): Promise<void> {
  if (status.siteUrl) {
    await services.sharePoint.deleteSite(status.siteUrl);
  }
}
```

---

## 6.4.4 — Step 2: Create Document Library

Update `step2-document-library.ts`:

```typescript
const LIBRARY_NAME = 'Project Documents';

export async function executeStep2(
  services: IServiceContainer, status: IProvisioningStatus
): Promise<ISagaStepResult> {
  const result: ISagaStepResult = {
    stepNumber: 2, stepName: 'Create Document Library',
    status: 'InProgress', startedAt: new Date().toISOString(),
  };
  try {
    const alreadyExists = await services.sharePoint.documentLibraryExists(status.siteUrl!, LIBRARY_NAME);
    if (!alreadyExists) {
      await services.sharePoint.createDocumentLibrary(status.siteUrl!, LIBRARY_NAME);
    }
    result.status = 'Completed';
    result.idempotentSkip = alreadyExists;
    result.completedAt = new Date().toISOString();
  } catch (err) {
    result.status = 'Failed';
    result.errorMessage = err instanceof Error ? err.message : String(err);
  }
  return result;
}

/** Compensation: cascaded by site deletion in Step 1 compensation. No-op here. */
export async function compensateStep2(): Promise<void> { /* no-op */ }
```

---

## 6.4.5 — Step 3: Upload Template Files

Update `step3-template-files.ts`:

```typescript
export async function executeStep3(
  services: IServiceContainer, status: IProvisioningStatus
): Promise<ISagaStepResult> {
  const result: ISagaStepResult = {
    stepNumber: 3, stepName: 'Upload Template Files',
    status: 'InProgress', startedAt: new Date().toISOString(),
  };
  try {
    await services.sharePoint.uploadTemplateFiles(status.siteUrl!, 'Project Documents');
    result.status = 'Completed';
    result.completedAt = new Date().toISOString();
  } catch (err) {
    result.status = 'Failed';
    result.errorMessage = err instanceof Error ? err.message : String(err);
  }
  return result;
}
// No compensation needed — site deletion in Step 1 compensation removes all files.
```

---

## 6.4.6 — Step 4: Create Data Lists

Update `step4-data-lists.ts` with the standard HB Intel list definitions:

```typescript
import { HB_INTEL_LIST_DEFINITIONS } from '../../../config/list-definitions.js';

export async function executeStep4(
  services: IServiceContainer, status: IProvisioningStatus
): Promise<ISagaStepResult> {
  const result: ISagaStepResult = {
    stepNumber: 4, stepName: 'Create Data Lists',
    status: 'InProgress', startedAt: new Date().toISOString(),
  };
  try {
    // createDataLists has internal idempotency — skips lists that already exist
    await services.sharePoint.createDataLists(status.siteUrl!, HB_INTEL_LIST_DEFINITIONS);
    result.status = 'Completed';
    result.completedAt = new Date().toISOString();
  } catch (err) {
    result.status = 'Failed';
    result.errorMessage = err instanceof Error ? err.message : String(err);
  }
  return result;
}
```

Create `backend/functions/src/config/list-definitions.ts` with the list schema for each standard HB Intel project list (RFI Log, Submittal Log, Meeting Minutes, Daily Reports, Issues Log, etc.). Define each list's `IListDefinition` with all required fields. **The exact field list must be confirmed with the product owner before Phase 6 implementation begins** — this file is the single source of truth for project site list schema.

---

## 6.4 Success Criteria Checklist

- [ ] 6.4.1 `@pnp/sp`, `@pnp/graph`, `@azure/identity` installed in `backend/functions`.
- [ ] 6.4.2 `SharePointService` class implemented with all required interface methods.
- [ ] 6.4.3 `siteExists` idempotency check uses `ProvisioningAuditLog` list.
- [ ] 6.4.4 `createSite` includes a `waitForSite` poll loop (60s timeout).
- [ ] 6.4.5 Steps 1–4 all have idempotency checks (`siteExists`, `documentLibraryExists`, `listExists`).
- [ ] 6.4.6 `HB_INTEL_LIST_DEFINITIONS` array defined in `config/list-definitions.ts`.
- [ ] 6.4.7 `compensateStep1` (delete site) and `compensateStep2` (no-op) implemented.
- [ ] 6.4.8 `pnpm turbo run build --filter=backend-functions` passes.
- [ ] 6.4.9 Layer 1 unit tests for Steps 1–4 pass with mocked `SharePointService`.

## PH6.4 Progress Notes

_(To be completed during implementation)_

### Verification Evidence

- `pnpm turbo run build --filter=backend-functions` → EXIT 0 — PASS / FAIL
- `pnpm turbo run test --filter=backend-functions` → Steps 1–4 unit tests pass — PASS / FAIL
- Layer 2 smoke test: Step 1 creates real SharePoint site in test tenant — PASS / FAIL
- Layer 2 smoke test: Re-running Step 1 with same `projectId` returns idempotent skip — PASS / FAIL
