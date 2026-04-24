# 00 – Integration Audit Summary

## Objective
Determine exactly what the live HB Intel / SharePoint codebase requires to integrate the attached Procore data model and the required Procore API connection into the existing application through a secure, maintainable, phased implementation plan.

## Bottom-line decisions

### 1. Primary integration host
**Use `backend/functions/` as the primary integration host.**

This is the correct choice because the repo already has:
- a consolidated Azure Functions host
- authenticated HTTP route patterns
- app-only managed-identity access to SharePoint and Microsoft Graph
- config validation, telemetry, idempotency, and service-factory seams
- an emerging connection-management surface

What must change is not the host choice; it is the maturity of the connection, storage, and publication layers inside that host.

### 2. Same Azure app posture
**Retain the existing Azure app registration for HB Intel’s Entra / protected-API posture. Do not introduce a second Azure app registration unless a future Microsoft-side separation requirement appears.**

However:
- the Azure app registration is **not** a substitute for a Procore developer application
- the Procore integration still requires a **Procore app** and, for the first enterprise sync wave, a **DMSA-backed client-credentials posture**
- the existing Azure app remains the right audience / JWT-validation / frontend-to-backend trust anchor
- Azure managed identity remains the right way for Functions to access Azure/Graph/Key Vault resources

This is the critical distinction:
- **Azure app registration** = HB Intel identity and protected API boundary
- **Procore app + DMSA credentials** = external-system connection identity inside Procore

### 3. Storage and materialization pattern
**Do not place the full Procore model in SharePoint lists.**

Use a four-layer model:
1. **Connection + control plane** in existing backend/admin seams
2. **Raw landing + replayable custody** in Azure Blob/object storage
3. **Canonical relational layer** in Azure SQL (or equivalent relational analytics store)
4. **Curated publications** exposed through backend APIs and selectively materialized into SharePoint lists/libraries where collaboration UX actually benefits

### 4. First implementation scope
**Build the architecture to support the package’s recommended practical model, but ship the first production slice with foundation masters + financial core + project-management core + current-state KPI publications.**

That means:
- include company/project/user/vendor/WBS masters
- include budget / commitments / prime / direct-cost / change subject areas
- include RFI / submittal / observation / punch / incident current-state views
- defer full binary replication, drawings at scale, telematics, and lower-value long-tail subjects

### 5. Strongest current seams
Most reusable seams today:
- `backend/functions/src/services/service-factory.ts`
- `backend/functions/src/services/managed-identity-token-service.ts`
- `backend/functions/src/services/graph-service.ts`
- `backend/functions/src/middleware/auth.ts`
- `backend/functions/src/middleware/validateToken.ts`
- `packages/data-access/src/factory.ts`
- `packages/query-hooks`
- the documented native-integration backbone doctrine under the PWA/Phase-1 planning stack

### 6. Most important redesign / extension seams
Highest-priority gaps:
- no durable Procore connection registry yet
- no real Procore connector runtime yet
- no raw custody / replay layer yet
- no canonical relational store yet
- project registry remains mock-only
- proxy startup wiring is still not completed in the PWA
- PWA source assembly still depends on mock query functions
- proxy route contracts remain partially unreconciled with backend routes

## Final architecture call
HB Intel is **directionally aligned** with the right integration architecture, but it is **not yet implementation-ready** for Procore without a real connection layer, external canonical storage, publication services, and first-wave consumer integration work.
