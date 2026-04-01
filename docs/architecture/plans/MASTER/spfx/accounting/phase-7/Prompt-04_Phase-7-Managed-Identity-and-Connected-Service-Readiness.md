# Prompt-04 — Phase 7 Managed Identity and Connected-Service Readiness

## Objective

Validate and harden the backend’s downstream service-access posture for production use across SharePoint, Graph, Table Storage, SignalR, notifications, telemetry, and other Project Setup dependencies. Freeze the service-by-service identity model, minimum permission posture, and code-gap versus tenant-blocker split.

Use the outputs from:

- `docs/architecture/reviews/project-setup-phase-7-security-and-connected-services-audit.md`
- `docs/reference/configuration/project-setup-api-auth-contract.md`
- `docs/reference/configuration/project-setup-environment-readiness.md`

## Critical Working Rules

- Treat live repo code and current living docs as authoritative for what is implemented.
- Use official Microsoft documentation where managed identity, Graph, SharePoint, or Sites.Selected behavior needs confirmation.
- Do not re-read files already in active context unless needed to verify contradiction, retrieve exact evidence, or confirm a change.
- This is a service-readiness and least-privilege prompt, not a broad service redesign prompt.
- Do not claim least privilege unless you show the actual dependency and permission rationale.

## Required Source Review

At minimum, review and reconcile:

- `backend/functions/src/hosts/project-setup/service-factory.ts`
- `backend/functions/src/services/managed-identity-token-service.ts`
- `backend/functions/src/services/sharepoint-service.ts`
- `backend/functions/src/services/graph-service.ts`
- Project Setup storage / repository services actually used in this domain
- SignalR push service currently used by Project Setup
- notification services currently used by Project Setup
- `docs/reference/developer/project-setup-connected-service-posture.md`
- `docs/reference/configuration/sites-selected-validation.md`
- `docs/reference/configuration/wave-0-config-registry.md`
- `backend/functions/README.md`
- the Phase 7 audit report

Also use official Microsoft docs for:

- DefaultAzureCredential with user-assigned managed identity
- Microsoft Graph permissions
- Sites.Selected / selected permissions
- SharePoint / Graph permission considerations relevant to the repo’s actual model

## Required Decisions To Freeze

You must explicitly freeze and document, for each active Project Setup dependency:

1. service name
2. identity type used today
3. token scope, credential type, or connection mechanism used today
4. whether the service is active, optional, stubbed, or unresolved
5. minimum permission posture intended for production
6. whether the dependency is code-ready, tenant-blocked, or code-incomplete
7. which exact tenant/admin action is required before production use
8. whether the dependency is least-privilege aligned, broad, or governed-exception
9. what evidence in repo supports the classification

At minimum, do this for:

- SharePoint request persistence
- SharePoint provisioning operations
- Microsoft Graph group operations
- Microsoft Graph / SharePoint site-grant operations
- Azure Table Storage
- SignalR
- notifications
- telemetry, if it materially affects readiness

## Hard Requirements

Make all of the following explicit:

- inbound user tokens are not used for downstream service calls in production
- downstream SharePoint / Graph / storage operations are app-only
- SignalR remains connection-string based unless repo truth proves otherwise
- Sites.Selected is the preferred least-privilege path where the repo says so
- broader access such as `Sites.FullControl.All` must be treated as governed fallback, not default
- `GRAPH_GROUP_PERMISSION_CONFIRMED` and related env gates are operational readiness gates, not proof that permissions have been technically validated in repo

## Required Deliverables

Create or update:

- `docs/reference/configuration/project-setup-connected-services-readiness.md`
- `docs/architecture/reviews/project-setup-phase-7-security-and-connected-services-audit.md`

If `project-setup-connected-services-readiness.md` does not yet exist, create it and record that fact in the audit report.

## Required Contents For `project-setup-connected-services-readiness.md`

- Executive Summary
- Identity Model Overview
- Service-by-Service Readiness Matrix
- Minimum Permission Posture by Service
- Sites.Selected / Fallback Governance
- Code-Ready Versus Tenant-Blocked Split
- External Admin / Tenant Prerequisites
- Least-Privilege Rationale
- Known Broad or Exception Paths
- Remaining Service-Access Blockers
- Files and Docs This Readiness Model Depends On

## Completion Standard

This prompt is complete only when later rollout work can tell, for every active Project Setup dependency, what identity it uses, what permissions it needs, and whether the remaining blocker is code or tenant-side.
