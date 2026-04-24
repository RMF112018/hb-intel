# Prompt-01 — Establish Procore Connection Control Plane

## Objective
Implement a production-capable Procore connection control plane inside the existing admin/backend architecture without introducing a second Azure app registration.

## Governing authorities
- `backend/functions/src/functions/adminApi/connection-routes.ts`
- `backend/functions/src/services/connection-registry-service.ts`
- `backend/functions/src/middleware/auth.ts`
- `backend/functions/src/middleware/validateToken.ts`
- `backend/functions/src/services/service-factory.ts`
- `backend/functions/src/config/wave0-env-registry.ts`
- `docs/how-to/developer/native-integration-backbone-implementation-guide.md`
- `docs/architecture/plans/MASTER/pwa/phase-1-deliverables/P1-F5-Procore-Connector-Family.md`
- `docs/architecture/plans/MASTER/pwa/phase-1-deliverables/P1-F5-T03-Auth-Tenancy-Permissions-Paging-Throttling-and-Webhook-Profile.md`

## Repo seams to inspect
- `backend/functions/src/functions/adminApi/connection-routes.ts`
- `backend/functions/src/services/connection-registry-service.ts`
- `backend/functions/src/hosts/admin-control-plane/**`
- `backend/functions/src/services/**`
- `backend/functions/src/utils/**`
- any existing Key Vault / managed-identity helper seams already in the backend

## Current gap to close
The repo already has authenticated connection routes and a registry service, but the registry is still in-memory and generic. There is no durable Procore connector class, no Key Vault secret-reference posture, no Procore health test, and no production-grade admin control for Procore connection metadata.

## Required implementation outcome
1. Extend the connection registry to support a first-class Procore connector type.
2. Persist connection records durably instead of in-memory.
3. Store only non-secret connection metadata in the durable registry.
4. Store secret references, not raw Procore client secrets, in the registry.
5. Resolve the actual Procore client secret through managed identity + Key Vault at runtime.
6. Add a real Procore connection test path that:
   - acquires a Procore token using client credentials
   - performs a minimal safe verification call
   - records health/test metadata without leaking credentials
7. Preserve the existing Azure app registration posture for frontend-to-backend auth. Do not add a second Azure app registration.
8. Make the admin API responses safe and explicit:
   - no secret values returned
   - health, last-tested metadata, and connector scope returned
   - structured validation failures returned

## Proof of closure
Return:
- exact files changed
- durable storage design used for connection records
- secret-reference design used for Procore credentials
- the new Procore connector class / types introduced
- the exact admin route contract for create/update/test/list
- evidence that no raw secret can be returned by the API
- evidence that existing auth middleware and `API_AUDIENCE` posture remain intact

## Guardrails
- Do not add direct Procore calls to frontend packages.
- Do not create a second Azure app registration flow.
- Do not store raw secrets in source, logs, tables, or API responses.
- Do not re-read files already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.
- Do not wander into unrelated homepage, shell, or non-integration work.
