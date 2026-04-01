# Prompt-03 — Phase 7 CORS, Origin, and Environment Configuration Hardening

## Objective

Make the Project Setup domain’s browser-to-API access posture and environment-readiness model explicit and production-ready by freezing the real CORS posture, the real environment-variable classification model, and the real startup-versus-runtime gating behavior.

Use the outputs from:

- `docs/architecture/reviews/project-setup-phase-7-security-and-connected-services-audit.md`
- `docs/reference/configuration/project-setup-api-auth-contract.md`

## Critical Working Rules

- Treat live repo code and config as authoritative for what is implemented.
- Use official Microsoft documentation where Azure Functions / App Service CORS behavior needs confirmation.
- Do not re-read files already in active context unless needed to verify contradiction, retrieve exact evidence, or confirm a change.
- This is a hardening and documentation-reconciliation prompt, not a generic infrastructure redesign prompt.
- Preserve reasonable local development ergonomics, but do not let local-friendly behavior silently define production posture.

## Required Source Review

At minimum, reconcile:

- `backend/functions/src/hosts/project-setup/host.json`
- `backend/functions/host.json`
- `backend/functions/src/hosts/project-setup/service-factory.ts`
- `backend/functions/src/utils/validate-config.ts`
- `backend/functions/src/config/wave0-env-registry.ts`
- `backend/functions/src/utils/adapter-mode-guard.ts`
- `docs/reference/developer/project-setup-connected-service-posture.md`
- `docs/reference/configuration/wave-0-config-registry.md`
- `backend/functions/README.md`
- the Phase 7 audit report

Also use official Microsoft docs for Azure Functions/App Service CORS behavior.

## Required Decisions To Freeze

You must explicitly freeze and document:

1. the authoritative Project Setup CORS posture
2. the difference between the Project Setup host and the shared host
3. which origin posture is intended for Project Setup production deployment
4. whether CORS is fully enforced in repo code/config or partly at the Azure Function App resource layer
5. whether credentials support is required and why
6. whether wildcard origins are permitted anywhere in the authoritative production posture
7. which environment variables are:
   - required core startup gates
   - warning-only at startup
   - provisioning-time prerequisites
   - optional / deferred
   - local-only
   - mock-only
8. which environment variables are infrastructure-controlled versus business-controlled
9. what exact startup failure behavior is intended for each tier
10. which current docs still misdescribe the configuration contract

## Hard Requirements

At the end of this prompt there must be one unambiguous answer to:

- what exact Project Setup production origin posture is authoritative
- what exact settings block startup
- what exact settings only warn at startup
- what exact settings block provisioning only
- what exact settings are optional or deferred

Also make explicit:

- repo host.json posture versus Azure-applied resource posture
- project-setup host posture versus broader shared-host posture
- local/mock allowances versus production contract

## Required Deliverables

Create or update:

- `docs/reference/configuration/project-setup-environment-readiness.md`
- `docs/architecture/reviews/project-setup-phase-7-security-and-connected-services-audit.md`

If `project-setup-environment-readiness.md` does not yet exist, create it and record that fact in the audit report.

## Required Contents For `project-setup-environment-readiness.md`

- Executive Summary
- Authoritative CORS Posture
- Project Setup Host Versus Shared Host
- Repo Config Versus Azure Resource Config
- Environment Variable Classification Matrix
- Startup-Gated Core Settings
- Warning-Only Startup Settings
- Provisioning-Time Prerequisites
- Optional / Deferred / Local-Only Settings
- Infrastructure-Controlled Versus Business-Controlled Settings
- Known Drift Docs and Reconciled Decisions
- Release-Gate Consequences

## Completion Standard

This prompt is complete only when later deployment or infrastructure work can tell exactly what belongs in repo, what belongs in Azure configuration, and what blocks which level of readiness.
