# Prompt-05 — Phase 7 Deployment Gates, Runbooks, and Tenant Readiness Verification

## Objective

Translate the Phase 7 auth, CORS, environment, and connected-service findings into a production deployment package: explicit deployment gates, tenant prerequisites, operational dependencies, readiness verification checklists, and blocker registers suitable for implementation planning and IT coordination.

Use the outputs from:

- `docs/architecture/reviews/project-setup-phase-7-security-and-connected-services-audit.md`
- `docs/reference/configuration/project-setup-api-auth-contract.md`
- `docs/reference/configuration/project-setup-environment-readiness.md`
- `docs/reference/configuration/project-setup-connected-services-readiness.md`

## Critical Working Rules

- Treat live repo truth as authoritative for what is code-complete today.
- Use official Microsoft docs where admin approval and tenant-readiness behavior needs confirmation.
- Do not re-read files already in active context unless needed to verify contradiction, retrieve exact evidence, or confirm a change.
- This is a rollout-readiness prompt, not a broad implementation prompt.
- Keep the distinction explicit between:
  - code-complete
  - environment-ready
  - tenant-ready
  - production-approved

## Required Work

1. Create or reconcile the deployment-readiness checklist for the Project Setup / Accounting / provisioning solution.
2. Identify every tenant-admin or platform-admin dependency required before pilot or production rollout.
3. Reconcile operational and runbook guidance against the final auth / CORS / config / connected-service posture.
4. Define go/no-go gates for:
   - staging
   - pilot
   - production
5. Produce a blocker register with explicit owner types and resolution paths.

## Required Source Review

At minimum, review and reconcile:

- the Phase 7 audit report
- `docs/reference/configuration/project-setup-api-auth-contract.md`
- `docs/reference/configuration/project-setup-environment-readiness.md`
- `docs/reference/configuration/project-setup-connected-services-readiness.md`
- `docs/reference/developer/project-setup-connected-service-posture.md`
- `docs/reference/configuration/sites-selected-validation.md`
- `backend/functions/README.md`
- any current deployment or admin-runbook docs already in repo that directly affect Project Setup rollout

## Required Deliverables

Create or update:

- `docs/maintenance/project-setup-deployment-readiness-checklist.md`
- `docs/maintenance/project-setup-tenant-prerequisites.md`
- `docs/architecture/reviews/project-setup-phase-7-security-and-connected-services-audit.md`

If either maintenance doc does not yet exist, create it and record that fact in the audit report.

## Required Contents For `project-setup-deployment-readiness-checklist.md`

- Executive Summary
- Code-Complete Criteria
- Environment-Ready Criteria
- Tenant-Ready Criteria
- Staging Go/No-Go Gates
- Pilot Go/No-Go Gates
- Production Go/No-Go Gates
- Verification Steps
- Evidence Required Before Signoff
- Blockers That Must Be Closed Before Each Gate

## Required Contents For `project-setup-tenant-prerequisites.md`

- Executive Summary
- Entra App Registration / API Audience Prerequisites
- SharePoint Admin API Access Approval Prerequisites
- Managed Identity Assignment Prerequisites
- Graph Permission Prerequisites
- SharePoint / Sites.Selected Grant Prerequisites
- Azure Resource Configuration Prerequisites
- CORS / Origin Configuration Prerequisites
- Operational Ownership Matrix
- Explicit External Blocker Register

## Completion Standard

This prompt is complete only when the repo contains a rollout-ready package that makes it clear which remaining tasks belong to code owners versus tenant/platform administrators.
