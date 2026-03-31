+----------------------------------------------------------------------------------+
| SharePoint Online                                                                |
|                                                                                  |
|  Admin SPFx App                                                                  |
|  - Setup wizard                                                                  |
|  - Input validation                                                              |
|  - Run history / logs / status                                                   |
|  - "Install Backend" trigger                                                     |
|                                                                                  |
+------------------------------------|---------------------------------------------+
                                     | HTTPS (authenticated trigger / status)
                                     v
+----------------------------------------------------------------------------------+
| Orchestration Backend (separate privileged control plane)                        |
|                                                                                  |
|  API Layer                                                                       |
|  - Start setup run                                                               |
|  - Get run status                                                                |
|  - Cancel / retry / repair                                                       |
|                                                                                  |
|  Durable Orchestrator                                                            |
|  - workflow state                                                                |
|  - step sequencing                                                               |
|  - retries / checkpoints                                                         |
|  - compensation / repair decisions                                               |
|                                                                                  |
|  Activity Adapters                                                               |
|  - Azure Deployment Adapter (Bicep/ARM)                                          |
|  - Entra Adapter (Graph)                                                         |
|  - SharePoint ALM Adapter                                                        |
|  - SharePoint API Access Adapter                                                 |
|  - Validation Adapter                                                            |
|                                                                                  |
|  Run Store / Audit Store                                                         |
|  - input snapshot                                                                |
|  - step results                                                                  |
|  - final outputs                                                                 |
|                                                                                  |
+-------------------|------------------------|------------------------|-------------+
                    |                        |                        |
                    v                        v                        v
         +-------------------+   +-------------------------+   +------------------+
         | Azure Resource    |   | Microsoft Entra / Graph |   | SharePoint Admin |
         | Manager / Bicep   |   | - app registrations     |   | - App Catalog    |
         | - RG              |   | - service principals    |   | - ALM APIs       |
         | - Storage         |   | - app role assignments  |   | - API approvals  |
         | - Function App    |   | - scopes / audience     |   | - site install   |
         +-------------------+   +-------------------------+   +------------------+