# 03 — Shared Resource Map

## Shared resource inventory

| Resource | Type | Shared by | Classification | Why it matters | Evidence posture |
|---|---|---|---|---|---|
| pnpm/turbo workspace | Monorepo runtime/build foundation | All 4 apps | Confirmed repo fact | Common package resolution, build, test, release sequencing | repo file |
| `@hbc/auth` | Shared auth/session package | All 4 apps | Confirmed repo fact | Common SPFx/session auth seam | repo file |
| `@hbc/ui-kit` | Shared UI/design system | All 4 apps | Confirmed repo fact | Shared visual and component contracts | repo file |
| `@hbc/complexity` | Shared density/complexity package | Estimating, Accounting, Admin | Confirmed repo fact | Shared progressive-disclosure behavior | repo file |
| `@hbc/shell` | Shared shell/navigation package | Estimating, Accounting, Admin | Confirmed repo fact | Shared shell/runtime composition seam | repo file |
| `@tanstack/react-query` | Shared query/cache library | All 4 apps | Confirmed repo fact | Common client-side data-query pattern | repo file |
| `@hbc/query-hooks` | Shared query abstraction | Estimating, Accounting, Admin | Confirmed repo fact | Standardized query behaviors | repo file |
| `@hbc/models` | Shared contract package | Estimating, Accounting, Admin | Confirmed repo fact | Shared domain interfaces | repo file |
| `@hbc/provisioning` | Shared provisioning package | Estimating, Accounting, Admin | Confirmed repo fact | API client, store, labels, SignalR, shared workflow logic | repo file |
| Project Setup Functions host | Backend composition root | Estimating, Accounting, Admin | Confirmed authoritative doc + repo fact | Request lifecycle and provisioning execution | host manifest + current-state |
| Admin Control Plane host | Backend composition root | Admin only (directly) | Confirmed authoritative doc | Generalized admin run/config/audit backend | host manifest + current-state |
| Azure Table Storage (`AdminRuns`, `AdminAuditEvents`, `AdminEvidence`) | Durable storage | Admin | Confirmed authoritative doc | Admin run/audit/evidence persistence | current-state |
| SharePoint `Projects` list on HBCentral | SharePoint list / read model | Project Sites directly; Project Setup indirectly | Confirmed repo fact + authoritative doc | Project identity, site link, year filtering, cross-app overlap | project-sites code + model doc |
| Provisioned project sites | SharePoint sites | Estimating, Accounting, Admin, Project Sites | Confirmed authoritative doc | Target artifact of provisioning and destination of site links | provisioning docs |
| Core project-site libraries and lists | SharePoint resources | Project Setup/Provisioning cluster | Confirmed authoritative doc | Workflow and document resources provisioned per site | site-template doc |
| Entra ID project groups (`Leaders`, `Team`, `Viewers`) | Identity / authorization resource | Project Setup/Provisioning cluster | Confirmed authoritative doc | Access model for provisioned sites | group model doc |
| PnPjs SPFx context (`spfi().using(SPFx(context))`) | SharePoint access pattern | Project Sites | Confirmed repo fact | Direct SharePoint list access without Functions host | project-sites hooks |
| SPFx web API permission request (`hb-intel-api-production`) | SPFx permission declaration | Estimating, Accounting | Confirmed repo fact | Required explicit AAD/API scope request for protected API use | package-solution files |

## App-specific resources inside the subset

| Resource | App | Why it is app-specific |
|---|---|---|
| `@hbc/features-estimating`, `@hbc/session-state`, `@hbc/step-wizard`, `@hbc/workflow-handoff`, SignalR request/detail UI | Estimating | Requester/coordinator workflow surface |
| `AccountingBackendContext`, review queue/detail pages | Accounting | Controller/reviewer workflow surface |
| `@hbc/features-admin`, generalized admin control-plane models, admin durable stores | Admin | Admin-only operator/control-plane concerns |
| Project Sites card grid, year selector, HBCentral `Projects` list field mapping | Project Sites | SharePoint-native project directory surface |

## Resources intended to be shared but not yet fully normalized

| Resource / concern | Current condition | Assessment |
|---|---|---|
| Provisioning run model vs Admin run model | Two different but overlapping run vocabularies | Transitional duplication; needs explicit projection contract |
| Project identity fields across request, provisioning status, Projects list, workflow lists | Same business object represented via `projectId`, `projectNumber`, and `pid` | Intentional bounded duplication but under-documented at subset level |
| Admin backend/API auth posture | Admin page uses provisioning client, but manifest lacks explicit web API permission request | Material config/auth ambiguity |

## Best-practice validation notes

- Microsoft documents that secured API access from SPFx is declared through `webApiPermissionRequests` in `package-solution.json`.  
- PnPjs documents the SPFx pattern of supplying the SPFx context to `spfi().using(SPFx(context))` for SharePoint access.  
- SharePoint guidance recommends indexed/filter-reducing columns for large lists; that aligns with the repo’s explicit `pid` indexing contract for workflow-family lists.

These best-practice references support the repo-truth reading; they do not override it.
