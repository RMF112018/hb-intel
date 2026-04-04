# 02 — In-Scope SPFx System Context Map

## System context

```mermaid
flowchart LR
    subgraph SPFx Apps
        EST[Estimating\nProject Setup Requests]
        ACC[Accounting\nController Review]
        ADM[Admin\nOversight + Control Plane]
        PS[Project Sites\nProject Directory]
    end

    subgraph Shared Front-End Foundation
        AUTH[@hbc/auth]
        UI[@hbc/ui-kit]
        CX[@hbc/complexity]
        SHELL[@hbc/shell]
        QUERY[@hbc/query-hooks]
    end

    subgraph Shared Workflow / Provisioning Layer
        PROV[@hbc/provisioning]
        MODELSP[Provisioning models\nIProjectSetupRequest / IProvisioningStatus]
        PSHOST[Project Setup Functions Host]
        SIG[SignalR progress]
    end

    subgraph Admin Control Layer
        MODELSA[Admin control-plane models\nIAdminRunEnvelope / audit / config]
        ACP[Admin Control Plane Host]
        TABLES[AdminRuns / AdminAuditEvents / AdminEvidence]
    end

    subgraph SharePoint / M365
        PROJECTS[HBCentral Projects list]
        SITE[Provisioned project sites]
        LISTS[Core libraries + workflow lists]
        GROUPS[Entra ID groups]
    end

    EST --> AUTH
    EST --> UI
    EST --> CX
    EST --> SHELL
    EST --> QUERY
    EST --> PROV
    EST --> MODELSP
    EST --> PSHOST
    EST --> SIG

    ACC --> AUTH
    ACC --> UI
    ACC --> CX
    ACC --> SHELL
    ACC --> QUERY
    ACC --> PROV
    ACC --> MODELSP
    ACC --> PSHOST

    ADM --> AUTH
    ADM --> UI
    ADM --> CX
    ADM --> SHELL
    ADM --> QUERY
    ADM --> PROV
    ADM --> MODELSP
    ADM --> MODELSA
    ADM --> ACP
    ADM --> TABLES

    PS --> AUTH
    PS --> UI
    PS --> PROJECTS

    PSHOST --> SITE
    PSHOST --> LISTS
    PSHOST --> GROUPS
    PROJECTS --> SITE
```

## Reading this map

### Cluster A — Project Setup / Provisioning
- **Estimating** is the requester / coordinator surface.
- **Accounting** is the controller review surface.
- **Admin** includes provisioning oversight that still uses provisioning-domain routes and data.

### Cluster B — Project directory / site discovery
- **Project Sites** is a SharePoint-native query surface over the HBCentral `Projects` list.
- It overlaps with Cluster A through project identity and site-link fields, but not through the same API host.

## Evidence posture by app

| App | Primary access pattern | Shared backend dependency | Primary overlapping data |
|---|---|---|---|
| Estimating | API + SignalR + draft/session helpers | Project Setup host | request, provisioning status, siteUrl, projectNumber, department, year |
| Accounting | API reviewer surface | Project Setup host | request, provisioning status, projectNumber, clarification / approval state |
| Admin | Mixed: provisioning API + admin control plane | Project Setup host and Admin Control Plane host | provisioning status, failure class, retries, run/audit metadata |
| Project Sites | SPFx + PnPjs + SharePoint list | none required for runtime | projectId, projectNumber, projectName, department, siteUrl, year |

## Confirmed naming reconciliation

| Prompt intent | Repo truth |
|---|---|
| Estimating | folder is `apps/estimating`, but package and SPFx solution are still Project Setup-oriented |
| Project Sites | repo and package naming align |
| Accounting | repo and package naming align |
| Admin | repo and package naming align |

## Architecture implication

The four-app mapping should be governed as a **subset map with two access domains**, not as one uniform “shared backend” diagram.
