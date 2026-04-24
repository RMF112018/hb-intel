# 04 – Identity and Connection Strategy

## End-to-end connection model

### First-wave connection posture
Use **Procore client credentials + DMSA** for the first enterprise sync wave.

Reason:
- this is the preferred Procore posture for data-connection workloads
- it avoids uneven data coverage tied to individual user permissions
- it fits backend-driven scheduled sync and replay better than per-user delegated auth

### Where the flow terminates
All Procore token acquisition must terminate in **Azure Functions**.
The frontend should never:
- hold Procore client secrets
- exchange Procore auth codes
- store Procore refresh tokens
- call Procore directly

## Same-Azure-app reuse plan

### Keep using the existing Azure app registration for:
- frontend-to-backend token issuance
- `API_AUDIENCE` validation
- Entra-based user auth
- role/scope enforcement on HB Intel APIs

### Do not create a new Azure app registration just for Procore
There is no repo-truth or platform-truth reason to do that in Wave 1.

### What must be added instead
- Procore app registration in Procore Developer Portal
- DMSA install / permissions in each relevant Procore company
- Key Vault secret(s) for Procore client secret
- Procore connector configuration metadata in a durable registry
- backend connector class `procore-data-connection`

## Credential and secret storage
### Store in Key Vault
Store:
- Procore client secret
- any future webhook signing secret or callback secret if used
- any connector-specific sensitive configuration that must not live in plain app settings

### Store in durable connection registry
Store non-secret metadata such as:
- connector id / class
- display name
- company scope / tenant scope
- Procore base region or environment metadata if needed
- install/company identifiers
- policy toggles
- last successful test
- last sync watermark
- health state
- secret reference name/URI, not the secret value

### Use managed identity to resolve Key Vault secrets
Functions should use managed identity to read Key Vault references, not embed secrets in code or return them through admin APIs.

## Authorization-code posture
### Wave 1
Do **not** start with Procore authorization-code flow for enterprise sync.

### Later wave
If HB Intel later needs user-context actions inside specific interactive experiences, add a second Procore connector mode:
- backend-terminated auth-code callback
- encrypted refresh-token storage
- user-to-connection mapping
- narrow surface area where user-context is truly required

That later mode should coexist with, not replace, the DMSA data-connection posture.

## Admin/control-plane design
Extend the existing `/api/admin/connections` family so it can:
- create/update Procore connection records
- store secret references, not raw secrets
- test Procore token acquisition and a minimal “list companies / list projects” connectivity call
- expose health, last test, last sync, and last failure
- enforce admin-only mutation and delegated-scope checks
- eventually drive rollout gates for subject-area activation

## Frontend ownership rules
### Frontend may own
- connection-management UI
- test connection button
- sync-status dashboards
- current-state project summaries and drilldowns from backend APIs

### Frontend must not own
- Procore secrets
- Procore token exchange
- Procore refresh-token storage
- direct calls to Procore APIs
- canonical mapping logic
- replay logic
- publication orchestration
