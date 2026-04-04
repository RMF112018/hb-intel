# 01 — Executive Summary

## Objective

Map the shared backend resources, shared platform dependencies, shared contracts, shared configuration, shared data, source-of-truth boundaries, and overlap / redundancy risks for the four in-scope SPFx apps only.

## Repo-truth findings summary

### 1) In-scope app posture
- **Confirmed repo fact:** `apps/accounting`, `apps/admin`, `apps/estimating`, and `apps/project-sites` all exist as first-class workspace apps.
- **Confirmed repo fact:** the folder `apps/estimating` is functionally the Project Setup Requests app, not a generic estimating surface. Its package name is `@hbc/spfx-project-setup` and its SPFx solution name is `hb-intel-project-setup`.
- **Confirmed repo fact:** `apps/project-sites` is materially different from the other three apps. It reads directly from SharePoint using `@pnp/sp` and SPFx context and does not depend on the Functions host.

### 2) Shared-resource architecture
- **Confirmed repo fact:** all four apps sit in the same pnpm/turbo monorepo and share the HB Intel workspace foundation.
- **Confirmed repo fact:** all four apps share at least `@hbc/auth` and UI-layer dependencies.
- **Confirmed repo fact:** Estimating and Accounting share the same protected Function App permission declaration (`hb-intel-api-production / access_as_user`).
- **Confirmed repo fact:** Estimating and Accounting both implement runtime config seams for `functionAppUrl` and `apiAudience`.
- **Confirmed repo fact:** Estimating, Accounting, and Admin all consume provisioning-domain concepts and/or provisioning API surfaces.
- **Confirmed authoritative doc:** the backend is split into at least two relevant composition roots for this subset:
  - **Project Setup host** — request lifecycle, provisioning saga, SignalR, acknowledgments, notifications, timer work
  - **Admin Control Plane host** — admin runs, audit, evidence, config, preview, checkpoint, action metadata

### 3) Shared-data architecture
- **Confirmed repo fact:** the provisioning model family is the dominant shared data model for Estimating and Accounting and is also operationally consumed by Admin oversight:
  - `IProjectSetupRequest`
  - `IProvisioningStatus`
  - `ISagaStepResult`
  - `IProvisioningProgressEvent`
  - `IProvisioningAuditRecord`
- **Confirmed repo fact:** the Project Sites app consumes a separate SharePoint read model sourced from the HBCentral `Projects` list, but that read model overlaps directly with Project Setup / Provisioning data.
- **Confirmed repo fact:** the `Projects` list mapping used by Project Sites includes:
  - `field_1` = `ProjectId`
  - `field_2` = `ProjectNumber`
  - `field_3` = `ProjectName`
  - `field_12` = `Department`
  - `field_23` = `SiteUrl`
  - `Year`
- **Confirmed repo fact:** `IProjectSetupRequest.year` is explicitly documented in code as stored in the SharePoint `Projects` list `Year` column and used by `project-sites`.

### 4) Most important overlap / redundancy findings
- **Intentional shared workflow model:** Estimating and Accounting share the same request and provisioning lifecycle.
- **Intentional shared operations view:** Admin provisioning oversight still operates on provisioning-domain data and provisioning API routes.
- **Intentional shared read model:** Project Sites depends on a SharePoint projection of project identity and site-link data that overlaps with Project Setup / Provisioning.
- **Intentional bounded identifier duplication:** the repo deliberately uses both `projectId` (UUID) and `projectNumber` (human identifier), while workflow-family SharePoint lists use `pid = projectNumber`.
- **Transitional duplication:** the Admin Control Plane introduces a generalized `IAdminRunEnvelope` model that mirrors provisioning run semantics and failure vocabulary rather than fully replacing provisioning status.
- **Weakly governed schema overlap:** Project Sites depends on imported SharePoint internal names (`field_N` columns), which is documented but fragile.
- **Documentation drift:** the Project Sites SPFx manifest description says filtering is based on the hosting page `Year` property, but the live UI code uses a year selector and direct list queries.
- **Configuration / auth ambiguity:** Admin's SPFx solution does not declare `webApiPermissionRequests`, yet `ProvisioningOversightPage` constructs a provisioning API client and invokes retry/archive/escalation/state-change operations.

### 5) Resource-coupling conclusion
This subset is best understood as a **four-app federation with two different data-access patterns**:
1. **API-driven workflow surfaces** — Estimating, Accounting, Admin Oversight
2. **SharePoint-native read surface** — Project Sites

Treating all four as one backend pattern would hide the main source-of-truth and ownership risks.

## What this package recommends

1. Preserve the current split in documentation rather than flattening it.
2. Explicitly document the `Projects` list as a cross-app read model, not merely a Project Sites implementation detail.
3. Add a focused source-of-truth contract for:
   - `projectId`
   - `projectNumber`
   - `pid`
   - `siteUrl`
   - `year`
   - `department`
4. Resolve the Admin auth / API-permission posture as an explicit documented decision rather than leaving it implicit in page code.
5. Treat the Admin run model vs provisioning status model as a governed translation boundary, not an accidental duplication.
