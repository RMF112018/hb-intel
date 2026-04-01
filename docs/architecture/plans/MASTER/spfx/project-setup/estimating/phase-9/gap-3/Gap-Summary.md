# Gap Summary — Backend Boundary Enforcement Gap (Project Setup)

## Validated finding

The dedicated Project Setup host and the scoped Project Setup service factory both exist, but the current backend boundary is only enforced at **route-registration level**.

The retained Project Setup route handlers still import and call the monolithic:

- `createServiceFactory()`

instead of the scoped Project Setup factory:

- `createProjectSetupServiceFactory()`

## Why this matters

Today, the practical runtime risk is low because Project Setup handlers do not appear to access domain CRUD services, and those services are lazily initialized.

However, the current posture leaves a **future-drift risk**:

- a future handler change could reach monolithic CRUD services
- tests do not currently prove handler-level factory wiring
- prior closure docs overstate the actual level of enforcement

## Confirmed in-scope handler files

These are the 5 files identified by the validation report as needing remediation:

1. `backend/functions/src/functions/projectRequests/index.ts`
2. `backend/functions/src/functions/provisioningSaga/index.ts`
3. `backend/functions/src/functions/acknowledgments/index.ts`
4. `backend/functions/src/functions/cleanupIdempotency/index.ts`
5. `backend/functions/src/functions/timerFullSpec/handler.ts`

## Existing scoped artifacts that should be leveraged

- `backend/functions/src/hosts/project-setup/index.ts`
- `backend/functions/src/hosts/project-setup/service-factory.ts`
- `backend/functions/src/hosts/project-setup/RELEASE-SCOPE.md`
- `backend/functions/src/test/project-setup-host-boundary.test.ts`

## Main remediation complication

The same route modules are imported by:

- the dedicated Project Setup host
- the monolithic host

So the remediation must explicitly decide how both hosts should resolve services for Project Setup routes.

## Architectural options

### Option A — Recommended starting point
Use the scoped Project Setup factory for Project Setup route modules in **both** hosts.

### Option B
Create host-aware factory resolution or explicit dependency injection.

### Option C
Duplicate or fork route registrations / handlers by host.

## Recommended posture

Start by trying **Option A** unless repo truth disproves it.

Rationale:

- simplest implementation
- least intrusive
- preserves shared handler code
- keeps Project Setup behavior narrow even if the monolithic host still imports the same route modules
- aligns with the documented transitional nature of the monolithic host

## Required end state

The gap is not closed until all of the following are true:

- in-scope Project Setup handlers no longer import `createServiceFactory()`
- Project Setup handlers resolve services through `createProjectSetupServiceFactory()` or an equally narrow host-approved equivalent
- tests fail if handler-level wiring regresses
- docs and remediation reports no longer claim full closure unless runtime service-resolution enforcement is actually true
