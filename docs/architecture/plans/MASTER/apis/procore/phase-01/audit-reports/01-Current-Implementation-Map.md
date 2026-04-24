# 01 – Current Implementation Map

## Architectural footprint relevant to Procore integration

### SharePoint / SPFx / app surfaces
The repo is a monorepo with SPFx apps, a PWA, shared auth/data-access packages, and a consolidated Azure Functions backend.

Material consumer surfaces already exist or are implied in repo truth:
- `apps/project-sites/` (SPFx project-facing surface)
- `apps/pwa/` (main multi-module shell consuming `@hbc/data-access`, `@hbc/query-hooks`, and feature packages)
- shared feature packages, especially project-hub / reports-adjacent planning
- admin/control-plane surfaces already pointing at backend-admin APIs

### Backend host
`backend/functions/` is a single Functions v4 Node/TypeScript host that already registers:
- health
- admin API routes
- domain CRUD routes
- proxy routes
- timer routes
- idempotency cleanup
- safety and provisioning-specific workflows
- observability/notification seams

This is not a greenfield backend; it is already the repo’s integration-capable host.

### Existing identity and auth posture
There are two distinct identity seams already in place:

#### A. Frontend / protected API seam
- frontend uses MSAL runtime bootstrap in the PWA path
- backend validates JWTs against Entra JWKS
- backend enforces an explicit `API_AUDIENCE`
- the repo has already separated `API_AUDIENCE` from `AZURE_CLIENT_ID` so the protected API audience is not conflated with managed-identity client IDs

#### B. Backend outbound Azure resource seam
- backend acquires app-only tokens via `DefaultAzureCredential`
- managed identity is already the intended production posture for Graph and SharePoint
- local dev may still use client-id/secret patterns for local execution, but production guidance is MI-first

### Existing data-access and consumer boundaries
The repo already has the correct high-level downstream boundary pattern:
- `@hbc/data-access` factory and repository ports
- `@hbc/query-hooks` as consumer-facing access layer
- feature packages should consume repositories/read models, not connector internals

However, the execution is incomplete:
- proxy mode exists but is not fully wired at startup
- route parity is incomplete
- project registry is still mock-only
- some PWA source assembly paths still use mock query functions

### Current storage reality
Repo truth is already hybrid:
- Azure Table-backed domain services exist for many business domains
- SharePoint remains real for provisioning, some operational request storage, and collaboration-facing behaviors
- there is no Procore-grade raw landing store
- there is no Procore-grade canonical relational store
- there is no governed Procore publication layer yet

### Observability and operational seams
Positive:
- host.json is set up for Application Insights logging
- the codebase already emits structured telemetry in several backend seams
- idempotency support exists
- there are admin/observability routes and patterns

Gap:
- there is no Procore-specific run ledger, replay framework, sync checkpoint model, rate-limit observability, or publication-health ledger yet

## Practical integration interpretation
The repo already contains the **control-plane and API-boundary ingredients** for Procore integration. It does **not** yet contain the **data-plane maturity** required for Procore.
