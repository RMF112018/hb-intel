# Plan Summary — Legacy Project Fallback Bridge

## Objective
Implement a governed migration bridge that lets `project-sites` open a stable legacy project folder URL when a project has not yet migrated into the new tenant architecture and therefore does not yet have a primary site URL.

## Current execution status

- Prompts 01 and 02 are already executed.
- Resume with Prompt 03 unless repo truth shows closure drift that must be corrected first.

## Host site for bridge lists

All required bridge lists for this solution are hosted at:

- `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`

This package explicitly requires provisioning any missing lists and altering any existing lists that require schema changes.

## Execution posture

- Build the bridge as a backend-driven discovery and registry solution.
- Do not make the SPFx runtime crawl annual project sites on page load.
- Use the existing `HB SharePoint Creator` app registration as the interim pilot identity.
- Treat that app as an implementation accelerator, not as the assumed final production permission model.
- Implement the additional Azure services needed to run the bridge as a real backend service.
- Provision those services through CLI/IaC-backed repo changes where possible.
- Use canonical folder browser URLs captured from the legacy annual libraries; do not default to generated share links.
- Provision or alter required lists at HBCentral through repo-truth tooling where possible.
- Align list descriptors, schemas, infrastructure config, and documentation to the live provisioned shape.
- Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.

## Required Azure service footprint

At minimum, the implementation must provide a credible backend host for discovery and sync. The default recommended footprint is:

- Azure Function App
- required Function runtime Storage Account
- Application Insights resource linked to the Function App
- Key Vault decision and implementation if required by repo-truth standards or the final security posture

Use the existing registered application for pilot auth wiring rather than creating a new app registration by default.

## Required lists

- `Legacy Project Fallback Registry`
- `Legacy Project Fallback Sync Runs`

If equivalent lists already exist, alter them to the governed shape instead of creating competing duplicates.

## Prompt sequence

1. `Prompt-01-Confirm-Contracts-Schemas-Auth-and-Source-Resolution.md` *(already executed)*
2. `Prompt-02-Provision-or-Alter-HBCentral-Lists.md` *(already executed)*
3. `Prompt-03-Provision-Azure-Services-and-Service-Hosting.md`
4. `Prompt-04-Build-Legacy-Library-Discovery-Service.md`
5. `Prompt-05-Build-Matching-Registry-and-Sync-State.md`
6. `Prompt-06-Integrate-Project-Sites-Fallback-Launch-Resolution.md`
7. `Prompt-07-Build-Admin-Review-and-Override-Workflow.md`
8. `Prompt-08-Harden-Permissions-Operations-and-Production-Readiness.md`

## Closure standard

The work is not complete until:

- required HBCentral lists exist with the correct fields and field types
- required Azure services are provisioned or provisionable from repo-truth scripts/templates
- discovery works against the configured annual sites
- fallback registry records exist with stable folder URLs
- high-confidence matches auto-bind correctly
- `project-sites` resolves fallback launch behavior cleanly
- low-confidence records are reviewable
- pilot auth is secure and explicit
- production hardening path is documented and actionable
