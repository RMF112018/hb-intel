# HB Intel — Focused SPFx Shared Resource and Shared Data Mapping Package

**Audit basis:** main branch repo-truth review of `RMF112018/hb-intel` as of 2026-04-03  
**Prompt basis:** `Focused_SPFx_Shared_Resources_and_Data_Mapping_Prompt.md`  
**In-scope apps only:** Accounting, Admin, Estimating, Project Sites

## Objective

This package documents the current shared-resource model, shared-data model, source-of-truth boundaries, overlap/redundancy findings, and governance implications for the four in-scope SPFx apps only.

## Scope boundaries

Included:
- `apps/accounting`
- `apps/admin`
- `apps/estimating`
- `apps/project-sites`
- shared packages and backend hosts materially consumed by those apps
- SharePoint, Entra ID, Azure Functions, and configuration dependencies directly relevant to those apps
- overlapping data entities and source-of-truth boundaries affecting those apps

Excluded unless needed to explain a direct dependency:
- PWA
- dev harness
- hb-site-control
- non-target feature modules and apps

## Evidence model used in this package

Each conclusion is labeled as one of:
- **Confirmed repo fact** — directly confirmed from current code or package/config files
- **Confirmed authoritative doc** — directly confirmed from current authoritative repo documentation
- **Stale/conflicting doc** — current repo docs or manifests that conflict with code or stronger current-state documentation
- **Inference / recommendation** — reasoned conclusion based on confirmed facts
- **Open question** — materially relevant ambiguity not fully resolved by current repo truth

## Primary repo evidence audited

### Monorepo / current-state authority
- `pnpm-workspace.yaml`
- `package.json`
- `docs/architecture/blueprint/current-state-map.md`

### App/package/config files
- `apps/accounting/package.json`
- `apps/accounting/config/package-solution.json`
- `apps/accounting/src/config/runtimeConfig.ts`
- `apps/accounting/src/backend/AccountingBackendContext.tsx`
- `apps/accounting/src/pages/ProjectReviewQueuePage.tsx`
- `apps/accounting/src/pages/ProjectReviewDetailPage.tsx`

- `apps/admin/package.json`
- `apps/admin/config/package-solution.json`
- `apps/admin/src/App.tsx`
- `apps/admin/src/pages/ProvisioningOversightPage.tsx`

- `apps/estimating/package.json`
- `apps/estimating/config/package-solution.json`
- `apps/estimating/src/config/runtimeConfig.ts`
- `apps/estimating/src/pages/NewRequestPage.tsx`
- `apps/estimating/src/pages/RequestDetailPage.tsx`

- `apps/project-sites/package.json`
- `apps/project-sites/config/package-solution.json`
- `apps/project-sites/src/mount.tsx`
- `apps/project-sites/vite.config.ts`
- `packages/spfx/src/webparts/projectSites/ProjectSitesRoot.tsx`
- `packages/spfx/src/webparts/projectSites/hooks/useAvailableYears.ts`
- `packages/spfx/src/webparts/projectSites/hooks/useProjectSites.ts`
- `packages/spfx/src/webparts/projectSites/types.ts`
- `packages/spfx/src/webparts/projectSites/normalizeProjectSiteEntry.ts`

### Backend / shared contract / reference docs
- `backend/functions/src/hosts/project-setup/RELEASE-SCOPE.md`
- `backend/functions/src/hosts/admin-control-plane/RELEASE-SCOPE.md`
- `packages/models/src/provisioning/IProvisioning.ts`
- `packages/models/src/admin-control-plane/index.ts`
- `packages/models/src/admin-control-plane/IAdminRun.ts`
- `docs/reference/data-model/pid-contract.md`
- `docs/reference/data-model/workflow-family-map.md`
- `docs/reference/configuration/wave-0-config-registry.md`
- `docs/reference/provisioning/site-template.md`
- `docs/reference/provisioning/entra-id-group-model.md`

## Best-practice validation references used
- Microsoft Learn — SPFx `webApiPermissionRequests`
- PnPjs — SPFx context/auth behavior
- Microsoft Support — SharePoint list view threshold / indexed-column guidance

## Package contents

1. `01_Executive_Summary.md`
2. `02_In-Scope_SPFx_System_Context_Map.md`
3. `03_Shared_Resource_Map.md`
4. `04_App_to_Resource_Dependency_Map.md`
5. `05_Backend_Contract_and_Source_of_Truth_Map.md`
6. `06_Shared_Data_and_Source_of_Truth_Map.md`
7. `07_Data_Overlap_Redundancy_and_Gap_Matrix.md`
8. `08_Configuration_and_Environment_Dependency_Matrix.md`
9. `09_Ownership_and_Governance_Matrix.md`
10. `10_Gaps_Risks_and_Open_Questions.md`
11. `11_Recommended_Repo_Documentation_Updates.md`
12. `12_Closure_and_Validation_Checklist.md`

## High-level conclusion

The four-app subset is not a single uniform SPFx suite. It is two coupled clusters:

1. **Project Setup / Provisioning cluster**  
   Estimating, Accounting, and part of Admin all share the same workflow family, shared provisioning contracts, shared provisioning API client patterns, and the Project Setup backend host.

2. **Project Directory / SharePoint read-model cluster**  
   Project Sites reads directly from the HBCentral `Projects` list by SPFx/PnPjs and does not depend on the Azure Functions host. It overlaps with Project Setup / Provisioning through mirrored project identity and site-link data, especially `projectId`, `projectNumber`, `projectName`, `department`, `siteUrl`, and `year`.

That split is the central architectural fact that should govern future documentation, configuration, and source-of-truth work for this subset.
