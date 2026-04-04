# 05 — Backend Contract and Source-of-Truth Map

## Relevant backend hosts in scope

| Host | Scope role | In-scope consumers | Evidence type |
|---|---|---|---|
| Project Setup host | Request lifecycle + provisioning execution host | Estimating, Accounting, Admin (oversight) | Confirmed repo doc |
| Admin Control Plane host | Generalized admin run/config/audit/evidence host | Admin | Confirmed repo doc |

## Project Setup host contract family

### In-scope route families
- `projectRequests`
- `provisioningSaga`
- `timerFullSpec`
- `signalr`
- `acknowledgments`
- `notifications`
- `health`
- `cleanupIdempotency`

### In-scope service/container resources
- `sharePoint`
- `tableStorage`
- `signalR`
- `managedIdentity`
- `projectRequests`
- `acknowledgments`
- `graph`
- `notifications`
- `idempotency`

### Shared contract surface relevant to this four-app subset
| Contract / model | Used by | Purpose |
|---|---|---|
| `IProjectSetupRequest` | Estimating, Accounting, indirectly Admin | request lifecycle |
| `IProvisionSiteRequest` | backend launch/input seam | provisioning trigger input |
| `IProvisioningStatus` | Estimating, Accounting, Admin | run/progress/result read model |
| `ISagaStepResult` | Estimating, Admin | step-by-step status |
| `IProvisioningProgressEvent` | Estimating | SignalR progress event |
| `IProvisioningAuditRecord` | backend/audit | completed/failed lifecycle record |

## Admin Control Plane host contract family

### In-scope route families
- `adminApi`
- `health`

### In-scope endpoint categories
- run launch/list/get/cancel/retry
- checkpoint decisions
- preflight
- preview
- config retrieval
- audit retrieval
- evidence retrieval
- action metadata

### Admin-specific storage
- `AdminRuns`
- `AdminAuditEvents`
- `AdminEvidence`

### Admin model family
| Model family | Role |
|---|---|
| `IAdminRunEnvelope` | generalized run wrapper |
| `IAdminStepResult` | generalized step result |
| `IAdminFailureSummary` | generalized failure/retry/escalation summary |
| audit/config/evidence/sharepoint-control/app-binding contracts | control-plane-specific action space |

## Source-of-truth boundary between the two host families

| Concern | Current authoritative owner | Notes |
|---|---|---|
| Project setup request lifecycle | Project Setup host + provisioning-domain models | clearly established |
| Provisioning execution status | Project Setup host + `IProvisioningStatus` | clearly established |
| Admin generalized operator runs | Admin Control Plane host + admin model family | clearly established for admin-native actions |
| Translation between provisioning runs and admin-native runs | Not fully formalized as a single published subset contract | governance gap |

## Important overlap finding

**Confirmed repo fact:** `IAdminRunEnvelope` explicitly states that it is a *translation target* and not a replacement for existing provisioning runs.  
**Assessment:** this is not accidental duplication. It is an intentional abstraction seam, but it is still a duplication seam and should be treated as such in governance.

## Shared auth/config posture

Both host manifests confirm:
- tenant-specific SharePoint CORS origin
- shared Entra/JWKS auth validation pattern
- startup dependence on core environment values such as:
  - `AZURE_TENANT_ID`
  - `AZURE_CLIENT_ID`
  - `AZURE_TABLE_ENDPOINT`
  - `APPLICATIONINSIGHTS_CONNECTION_STRING`
  - `HBC_ADAPTER_MODE`
  - `API_AUDIENCE`

## Governance recommendation

Document the Project Setup host as the **authoritative workflow backend** for this subset, and document the Admin Control Plane host as the **authoritative operator/control backend**. Then add one explicit translation-boundary document rather than letting that overlap remain implicit.
