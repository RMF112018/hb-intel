# Prompt 05 — Admin Runtime Configuration and Backend Connectivity Validation

## Objective

Validate and harden the runtime configuration and environment assumptions required for successful Admin SPFx deployment and backend connectivity in production.


## Non-Negotiable Working Rules

- Do not re-read files that are already in your current context or memory unless needed to verify a contradiction, confirm exact wording, inspect a newly changed file, or capture exact evidence for a report.
- Do not make assumptions about the package, build, or runtime contract. Prove every material conclusion.
- Distinguish clearly between:
  1. confirmed package fact
  2. confirmed repo fact
  3. confirmed doc intent
  4. inferred recommendation
  5. unresolved issue
- Prefer narrow, high-signal code changes over broad speculative edits.
- Do not collapse multiple unresolved root-cause areas into one mixed remediation step.
- Preserve forensic traceability from finding → code change → regenerated artifact → validation evidence.


## Required Focus Areas

Inspect and validate at minimum:

- Admin frontend runtime config inputs
- Function App URL resolution
- API audience resolution
- CORS assumptions
- tenant-specific SharePoint origin assumptions
- backend startup requirements
- any release-time environment variable or injected config seams
- docs describing production deployment assumptions

## Required Tasks

1. Identify every Admin production configuration dependency required for:
   - package install
   - asset resolution
   - frontend startup
   - backend connectivity
   - token audience validation
2. Determine which config values are:
   - build-time
   - deploy-time
   - runtime-resolved
3. Make the configuration model explicit and release-safe.
4. Add validation where missing so misconfiguration fails clearly and diagnostically.
5. Produce a precise deployment assumption matrix for Admin production deployment.

## Deliverables

Create or update:

- any required Admin runtime config files or validators
- `phase-14/config/admin-production-config-matrix.md`
- `phase-14/config/admin-backend-connectivity-validation.md`
- `phase-14/config/admin-cors-and-audience-assumptions.md`

## Hard Gates

This prompt is not complete unless:
- the production config model is explicit
- required environment assumptions are documented
- failure modes for misconfiguration are diagnosable
- the deployment team can tell exactly what must be set before release

## Required Final Report

Return:
- the final Admin production config matrix
- what is validated automatically vs manually
- any remaining deployment prerequisites outside the repo
