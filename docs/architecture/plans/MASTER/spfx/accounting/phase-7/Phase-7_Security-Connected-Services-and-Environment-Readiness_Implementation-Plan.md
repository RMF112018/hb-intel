# Phase 7 — Security, Connected Services, and Environment Readiness

## Implementation Plan

## Objective

Bring the Project Setup / Accounting / provisioning solution to a production-deployable security and environment-readiness posture by freezing the real inbound API auth contract, the real SPFx access model, the real CORS and environment-gating posture, the real downstream connected-service identity model, and the real tenant/admin prerequisites required before rollout.

## Why Phase 7 Must Happen

The live repo already contains a meaningful security and platform-readiness posture, but it is distributed across code, config, living docs, and older drift-prone references.

Current repo truth already shows:

- protected API auth is claims-based, not env-allowlist-based
- `API_AUDIENCE` and `AZURE_TENANT_ID` are production auth requirements
- the estimating-side SPFx package already declares a web API permission request
- the Project Setup host has its own narrower CORS posture distinct from the broader shared host
- startup validation is intentionally tiered rather than one monolithic fail-fast gate
- downstream service access uses app-only managed identity for SharePoint / Graph / storage but not for every service
- Sites.Selected governance and per-site grant readiness are already part of the live readiness model
- some older or broader docs still carry stale config and deployment assumptions

Without a deliberate Phase 7 reconciliation, later implementation and rollout work could still:

- blur inbound delegated auth with outbound managed identity
- flatten startup gating incorrectly
- document the wrong CORS posture
- overstate what is repo-complete versus tenant-blocked
- preserve stale config guidance
- miss actual SharePoint admin API-access dependencies

## Authority and Evidence Standard

Use this order whenever repo truth and docs differ:

1. live repo code and tests
2. current living repo docs that already describe Project Setup security and connected services
3. official Microsoft documentation
4. older or broader repo docs as drift evidence only

Every Phase 7 artifact must separate:

- confirmed repo fact
- confirmed repo-doc intent
- confirmed Microsoft-documented requirement or best practice
- inferred recommendation
- unresolved external dependency

## Current Repo-Truth Inputs To Verify

Phase 7 must ground itself in at least the following sources.

### Auth and authorization core
- `backend/functions/src/middleware/auth.ts`
- `backend/functions/src/middleware/validateToken.ts`
- `backend/functions/src/middleware/authorization.ts`

### Host and startup/config posture
- `backend/functions/src/hosts/project-setup/host.json`
- `backend/functions/host.json`
- `backend/functions/src/hosts/project-setup/service-factory.ts`
- `backend/functions/src/utils/validate-config.ts`
- `backend/functions/src/config/wave0-env-registry.ts`
- `backend/functions/src/utils/adapter-mode-guard.ts`

### Connected services
- `backend/functions/src/services/managed-identity-token-service.ts`
- `backend/functions/src/services/sharepoint-service.ts`
- `backend/functions/src/services/graph-service.ts`
- other Project Setup domain services that materially affect service access posture

### SPFx and frontend access contract
- `apps/estimating/config/package-solution.json`
- `apps/accounting/config/package-solution.json` (verify whether it participates in API access posture or remains non-calling)
- any current SPFx token-acquisition or API-client code directly implicated by the Project Setup domain

### Current living docs
- `docs/reference/developer/project-setup-connected-service-posture.md`
- `docs/reference/configuration/sites-selected-validation.md`

### Drift-risk docs and operational references
- `docs/reference/configuration/wave-0-config-registry.md`
- `backend/functions/README.md`

### Microsoft docs to use heavily
- SPFx access to Entra-secured APIs
- SharePoint admin API access approval model
- Azure Functions / App Service CORS configuration
- DefaultAzureCredential and user-assigned managed identity
- Microsoft Graph permission model
- Sites.Selected / selected permissions posture

## Phase 7 Scope

### In Scope

- repo-truth security and connected-service audit
- inbound API auth contract freeze
- SPFx permission-request and admin-approval posture
- CORS / origin posture
- environment readiness and startup-gating model
- managed identity and downstream service-readiness model
- tenant prerequisite matrix
- deployment-readiness docs, gates, and blocker register
- final documentation reconciliation and closure report

### Out Of Scope

- workflow redesign
- broad application feature work
- unrelated frontend refactors
- unrelated backend domain CRUD refactors
- tenant execution of approvals or grants themselves
- broad platform migration work beyond what must be documented for readiness

## Required Outcomes

By the end of Phase 7, the repo should have an explicit, evidence-backed answer for:

1. the real inbound API token contract
2. the real SPFx permission-request and approval model
3. the real Project Setup CORS posture
4. the real startup validation and runtime prerequisite model
5. the real downstream connected-service auth model
6. the minimum required permission posture for each connected service
7. the real code-vs-tenant blocker split
8. the authoritative doc set later phases must follow
9. the exact gates for staging, pilot, and production readiness

## Ordered Stages

### Stage 1 — Repo-Truth Security and Connected-Services Audit

**Prompt:** `Prompt-01_Phase-7-Repo-Truth-Security-and-Connected-Services-Audit.md`

Purpose:

- establish the current auth, CORS, config, managed-identity, and service-access truth
- identify real drift between code and docs
- classify gaps by severity and downstream risk

Primary outputs:

- `docs/architecture/reviews/project-setup-phase-7-security-and-connected-services-audit.md`
- severity-ranked gap inventory
- recommended remediation order for the rest of the phase

Exit condition:

- all major auth, CORS, config-tier, connected-service, and drift-doc issues are evidenced and classified

### Stage 2 — API Auth Contract and SPFx Access Alignment

**Prompt:** `Prompt-02_Phase-7-API-Auth-Contract-and-SPFx-Access-Alignment.md`

Purpose:

- freeze the inbound API auth contract
- align SPFx permission requests and admin approval posture with the protected API contract
- eliminate ambiguity around audience, issuer, token shape, claims, and required delegated scope

Primary outputs:

- create or update `docs/reference/configuration/project-setup-api-auth-contract.md`
- update the Phase 7 audit report with resolved auth-contract decisions

Exit condition:

- one coherent auth contract exists for protected API access, including admin approval dependencies

### Stage 3 — CORS, Origin, and Environment Configuration Hardening

**Prompt:** `Prompt-03_Phase-7-CORS-Origin-and-Environment-Configuration-Hardening.md`

Purpose:

- freeze the real CORS posture
- freeze the real environment readiness model
- explicitly distinguish startup core gates, startup warnings, and provisioning-time prerequisites

Primary outputs:

- create or update `docs/reference/configuration/project-setup-environment-readiness.md`
- update the Phase 7 audit report with resolved CORS/config decisions

Exit condition:

- later deployment work can tell exactly what is blocked at startup, what is warning-only, and what blocks provisioning only

### Stage 4 — Managed Identity and Connected-Service Readiness

**Prompt:** `Prompt-04_Phase-7-Managed-Identity-and-Connected-Service-Readiness.md`

Purpose:

- freeze the service-by-service access model
- define minimum permission posture and tenant dependencies
- separate code-ready from tenant-blocked dependencies

Primary outputs:

- create or update `docs/reference/configuration/project-setup-connected-services-readiness.md`
- update the Phase 7 audit report with the connected-service matrix and blocker split

Exit condition:

- each active Project Setup dependency has an explicit identity model, permission posture, and readiness classification

### Stage 5 — Deployment Gates, Runbooks, and Tenant Readiness Verification

**Prompt:** `Prompt-05_Phase-7-Deployment-Gates-Runbooks-and-Tenant-Readiness-Verification.md`

Purpose:

- convert the technical posture into rollout-ready documentation
- define staging, pilot, and production gates
- define the blocker register and tenant prerequisite matrix

Primary outputs:

- `docs/maintenance/project-setup-deployment-readiness-checklist.md`
- `docs/maintenance/project-setup-tenant-prerequisites.md`
- updated audit report with blocker register

Exit condition:

- later deployment work has a decision-ready checklist instead of vague readiness claims

### Stage 6 — Final Documentation Reconciliation and Readiness Report

**Prompt:** `Prompt-06_Phase-7-Final-Documentation-Reconciliation-and-Readiness-Report.md`

Purpose:

- confirm internal consistency across all updated code comments, docs, and review artifacts
- formally state what is complete, what is tenant-dependent, and what remains blocked

Primary outputs:

- `docs/architecture/reviews/project-setup-phase-7-final-readiness-report.md`

Exit condition:

- the repo has a final Phase 7 readiness statement or a clear explanation of why Phase 7 cannot yet close

## Working Standards For All Stages

- prefer repo-truth verification over stale documentation preservation
- distinguish inbound delegated auth from outbound managed identity
- distinguish repo-coded config validation from platform resource configuration
- distinguish code-complete from environment-ready from tenant-ready from production-approved
- prefer reconciliation of existing authority docs over uncontrolled creation of duplicates
- create missing target docs deliberately when required and record that they were created
- do not force certainty where the repo still leaves a legitimate question open
- do not claim production readiness while tenant-admin blockers remain unresolved

## Completion Check

Phase 7 should not be considered closed until the final readiness report can state, with evidence:

- the inbound auth contract is frozen
- the SPFx access posture is frozen
- the CORS posture is frozen
- the environment validation model is frozen
- the downstream connected-service model is frozen
- the tenant-admin prerequisite model is explicit
- the authoritative documentation set for later phases is explicit
- unresolved dependencies are accurately classified rather than hidden
