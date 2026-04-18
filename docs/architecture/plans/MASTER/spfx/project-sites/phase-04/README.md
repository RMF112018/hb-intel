# Legacy Project Fallback Bridge — Spec + Implementation Prompt Package

## Package purpose

This package combines:

1. the full technical specification and implementation plan for the **Legacy Project Fallback Bridge**
2. an updated phased implementation prompt package for a local code agent

The objective is to let the `project-sites` application resolve a governed **legacy fallback folder link** for projects that have not yet migrated into the new tenant architecture and therefore do not yet have a primary site URL in the SharePoint `Projects` list.

## Important package update

This version adds comprehensive implementation instruction for the **additional Azure-hosted services** required to run the bridge as a real backend service, using the existing registered application:

- **HB SharePoint Creator**
- App ID: `08c399eb-a394-4087-b859-659d493f8dc7`

The package now explicitly requires the code agent to:

- implement the required backend execution host
- provision the minimum Azure resources needed for the service
- wire those resources to the existing registered application
- use CLI/IaC-backed provisioning rather than ad hoc manual steps where possible
- keep the bridge discovery workload out of the SPFx page runtime

## Important current-state note

**Prompts 01 and 02 have already been executed.**

They remain in this package as the authoritative contract and schema baseline, but the local code agent should resume execution at:

- `prompts/Prompt-03-Provision-Azure-Services-and-Service-Hosting.md`

Do not re-run Prompts 01 and 02 unless repo-truth inspection shows drift, failed closure, or dependency breakage that must be corrected before continuing.

## HBCentral list host requirement

All bridge lists for this solution are hosted at:

- `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`

Do not leave required list creation or schema mutation as a manual post-step unless repo-truth tooling proves there is no safe automated path.

## Package contents

- `00-Legacy-Project-Fallback-Bridge-Spec-and-Implementation-Plan.md`
- `01-Implementation-Waves.md`
- `prompts/Plan-Summary.md`
- `prompts/Prompt-01-Confirm-Contracts-Schemas-Auth-and-Source-Resolution.md`
- `prompts/Prompt-02-Provision-or-Alter-HBCentral-Lists.md`
- `prompts/Prompt-03-Provision-Azure-Services-and-Service-Hosting.md`
- `prompts/Prompt-04-Build-Legacy-Library-Discovery-Service.md`
- `prompts/Prompt-05-Build-Matching-Registry-and-Sync-State.md`
- `prompts/Prompt-06-Integrate-Project-Sites-Fallback-Launch-Resolution.md`
- `prompts/Prompt-07-Build-Admin-Review-and-Override-Workflow.md`
- `prompts/Prompt-08-Harden-Permissions-Operations-and-Production-Readiness.md`

## Recommended execution order

1. Read the full spec.
2. Review the implementation waves.
3. Treat Prompts 01 and 02 as already-completed baseline work.
4. Resume with Prompt 03 and continue in numeric order.
5. Do not skip Azure-service setup; the bridge must not remain a purely conceptual or manually hosted backend.

## Important implementation posture

- Use the existing **HB SharePoint Creator** app registration only as the interim pilot vehicle.
- Do not create a new Entra app registration unless repo truth proves the existing app cannot safely support the pilot implementation.
- Use canonical folder browser URLs (`webUrl`) captured from the legacy annual libraries.
- Do not depend on user-generated share links as the default fallback URL strategy.
- Keep the heavy cross-site discovery out of the SPFx runtime path.
- Treat the fallback registry as the secondary launch source behind the primary tenant-era project site URL.
- Provision missing lists and apply required field changes at **HBCentral** through repo-truth tooling where possible.
- Provision the Azure execution host and supporting services through CLI/IaC-backed repo changes where possible.
- Update list descriptors, service configuration, deployment notes, and documentation when provisioning or altering infrastructure.
- Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.

## Intended end state

For any project surfaced in `project-sites`:

- if a primary migrated site exists, open it
- else if a matched legacy fallback folder exists, expose `Open Legacy Project Files`
- else preserve the current non-launchable behavior

The bridge must run as a real backend service with scheduled and manual sync capability, not as an SPFx page-time crawler.
