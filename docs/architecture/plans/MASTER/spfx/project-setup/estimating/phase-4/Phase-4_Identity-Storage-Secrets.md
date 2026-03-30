# Phase 4 — Identity, Storage, and Secrets Posture

> Created: 2026-03-30
> Prompt: P4-03 Managed Identity, Storage, and Secrets Hardening

## Purpose

Documents the production identity posture, storage dependencies, and secret classification for the Project Setup deployment after hardening.

## Identity Model

### Managed Identity (DefaultAzureCredential)

All Azure resource access uses system-assigned Managed Identity via `DefaultAzureCredential`. No app-registration client secrets are used or required.

| Service | Credential Instance | Scope | Purpose |
|---------|-------------------|-------|---------|
| SharePointService | `sharepoint-service.ts:86` | `https://{tenant}.sharepoint.com/.default` | Site/list/doc/permission operations |
| GraphService | `graph-service.ts:69` | `https://graph.microsoft.com/.default` | Entra ID group management |
| AcknowledgmentService | `acknowledgment-service.ts:42` | `https://{tenant}.sharepoint.com/.default` | SharePoint acknowledgment list |
| ProjectRequestsRepository | `project-requests-repository.ts:37` | `https://{tenant}.sharepoint.com/.default` | SharePoint Projects list CRUD |
| ManagedIdentityTokenService | `managed-identity-token-service.ts:43` | Resource-specific | App-only token acquisition |
| TableClient (factory) | `table-client-factory.ts:28` | Implicit (SDK) | Azure Table Storage |

### SignalR Service

SignalR uses a connection-string-based authentication model (HMAC-SHA256 JWT), not Managed Identity. This is an Azure SignalR Service limitation — the data-plane REST API requires AccessKey-based signing.

**P4-03 change:** SignalR initialization is now conditional:
- **Connection string present:** `RealSignalRPushService` — full real-time push
- **Connection string absent:** `NoOpSignalRPushService` — logs events, no push (prevents startup failure)

## Storage Dependencies

### Azure Table Storage

| Table | Purpose | Service | Authentication |
|-------|---------|---------|----------------|
| `ProvisioningStatus` | Provisioning saga state machine | `RealTableStorageService` | DefaultAzureCredential |
| `IdempotencyRecords` | Write-safe deduplication (24h TTL) | `RealIdempotencyStorageService` | DefaultAzureCredential |

**Endpoint:** `AZURE_TABLE_ENDPOINT` (required core-tier setting)

### SharePoint Online

| Site / List | Purpose | Service |
|------------|---------|---------|
| Projects list (`SHAREPOINT_PROJECTS_SITE_URL`) | Request lifecycle persistence | `SharePointProjectRequestsAdapter` |
| Provisioned project sites | Created by saga Steps 1–7 | `SharePointService` |
| HbcAcknowledgmentEvents list | Step 6 acknowledgment tracking | `RealAcknowledgmentService` |

### Azure SignalR Service

| Hub | Groups | Purpose |
|-----|--------|---------|
| `provisioning` | `provisioning-{projectId}`, `provisioning-admin` | Real-time provisioning progress |

**Endpoint + AccessKey:** `AzureSignalRConnectionString` (optional — degrades gracefully)

## Secret Classification

### Removed (P4-03)

| Setting | Previous Status | Reason for Removal |
|---------|----------------|-------------------|
| `AZURE_CLIENT_SECRET` | Optional, never consumed | Pure Managed Identity deployment — no app-registration secret needed anywhere |

### Retained as Required Non-Secret Settings

| Setting | Type | Tier | Notes |
|---------|------|------|-------|
| `AZURE_TENANT_ID` | Non-secret | core | Tenant identifier (public knowledge) |
| `AZURE_CLIENT_ID` | Non-secret | core | MI client ID (not a secret) |
| `API_AUDIENCE` | Non-secret | core | App registration audience URI |
| `AZURE_TABLE_ENDPOINT` | Non-secret | core | Storage account URL |
| `APPLICATIONINSIGHTS_CONNECTION_STRING` | Connection string | core | Contains instrumentation key (consider Key Vault) |
| `HBC_ADAPTER_MODE` | Non-secret | core | `proxy` or `mock` |
| `SHAREPOINT_TENANT_URL` | Non-secret | sharepoint | Tenant URL |
| `SHAREPOINT_PROJECTS_SITE_URL` | Non-secret | sharepoint | Site URL |

### Retained as Secrets (Require Key Vault in Production)

| Setting | Type | Stored In | Notes |
|---------|------|-----------|-------|
| `AzureSignalRConnectionString` | Secret (contains AccessKey) | Key Vault reference | SignalR HMAC signing key |
| `APPLICATIONINSIGHTS_CONNECTION_STRING` | Semi-secret | Key Vault reference | Contains InstrumentationKey |

### Deferred Stubs (Not Consumed)

| Setting | Status | Notes |
|---------|--------|-------|
| `EMAIL_DELIVERY_API_KEY` | Stub — never consumed | Email delivery logs only; no SendGrid integration |
| `EMAIL_FROM_ADDRESS` | Stub — never consumed | Paired with EMAIL_DELIVERY_API_KEY |

## Notification Service Architecture Note

The `NotificationService` makes unauthenticated HTTP POST calls to an internal endpoint (`NOTIFICATION_API_BASE_URL`). This is a **service-to-service** call within the same Function App:
- Inbound requests to `/api/notifications/send` are protected by `withAuth()`
- But the internal `NotificationService.send()` bypasses auth since it's calling the endpoint from within the same process
- **Risk:** If `NOTIFICATION_API_BASE_URL` is misconfigured to point externally, the call has no auth header
- **Mitigation:** In production, this URL should remain internal or be validated at startup

## Changes Summary

| Change | Impact |
|--------|--------|
| Removed `AZURE_CLIENT_SECRET` from config registry | Simplifies deployment — pure MI |
| Added `NoOpSignalRPushService` | SignalR-less deployments boot cleanly |
| Conditional SignalR initialization | Uses real push when connection string present, no-op otherwise |
| Updated stub descriptions | Email/notification stubs clearly marked |
