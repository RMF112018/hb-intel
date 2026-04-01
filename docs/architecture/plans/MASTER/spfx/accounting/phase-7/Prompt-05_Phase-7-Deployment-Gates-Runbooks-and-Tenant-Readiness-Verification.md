# Prompt-05 — Phase 7 Deployment Gates, Runbooks, and Tenant Readiness Verification

## Objective

Translate the Phase 7 security and connected-service findings into a production deployment package: explicit deployment gates, tenant prerequisites, operational dependencies, and readiness verification docs.

## Core instructions

- Treat the live repo as authoritative implementation truth.
- Do not re-read files that are still within your current context or memory unless needed to verify a contradiction or retrieve exact evidence.
- Use official Microsoft documentation where platform/security behavior needs confirmation.
- Distinguish clearly between:
  - confirmed repo fact
  - confirmed repo-doc intent
  - confirmed Microsoft-documented requirement / best practice
  - inferred recommendation
  - unresolved dependency
- Keep scope constrained to this prompt’s task.

## Required work

1. Create or reconcile the deployment-readiness checklist for the Project Setup / Accounting / provisioning solution.
2. Identify every tenant-admin or platform-admin dependency required before production launch or pilot launch.
3. Reconcile the runbook / support / operational documentation against the final security and connected-service posture.
4. Document staging, pilot, and production go/no-go gates tied to real repo truth and platform dependencies.
5. Produce an explicit blocker register for anything that remains unresolved after this prompt.

## Required outputs

- A deployment-readiness checklist
- A tenant prerequisite matrix
- A blocker register and go/no-go gate definition for staging, pilot, and production

## Documentation / report targets to update

- `docs/maintenance/project-setup-deployment-readiness-checklist.md`
- `docs/maintenance/project-setup-tenant-prerequisites.md`
- `docs/architecture/reviews/project-setup-phase-7-security-and-connected-services-audit.md`

## Additional requirements

- Keep the distinction clear between code-complete, environment-ready, tenant-ready, and production-approved.

