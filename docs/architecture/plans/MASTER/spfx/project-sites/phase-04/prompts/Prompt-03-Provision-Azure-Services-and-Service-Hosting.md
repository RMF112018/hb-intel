# Prompt 03 — Provision Azure Services and Service Hosting

## Objective
Implement the additional Azure services necessary to run the Legacy Project Fallback Bridge as a real backend service using the existing registered application `HB SharePoint Creator`, and do so through repo-truth CLI/IaC-backed setup rather than undocumented portal-only steps.

## Current gap to close
Prompts 01 and 02 locked the contracts and the HBCentral list host, but the bridge still has no real execution environment. The registered application provides identity and permissions; it does not provide a place for the discovery code to run, schedule, log, or store secure runtime configuration. Until the Azure service host exists, the bridge cannot operate as designed.

## Governing files and authorities

Inspect and align to:

- `00-Legacy-Project-Fallback-Bridge-Spec-and-Implementation-Plan.md`
- `01-Implementation-Waves.md`
- output of Prompts 01 and 02
- live repo deployment/config/infrastructure conventions
- existing backend hosting patterns already in the repo, if any
- the requirement to use the existing registered application:
  - `HB SharePoint Creator`
  - App ID: `08c399eb-a394-4087-b859-659d493f8dc7`

## Required repo inspection areas

Inspect the live repo for the correct place and pattern to implement:

- Azure resource provisioning scripts
- IaC templates (Bicep, ARM, scripts, or equivalent) if already used
- Function App or backend-service hosting patterns
- environment/config conventions
- secret handling conventions
- Application Insights / monitoring conventions
- deployment readme/runbook conventions

## Required implementation outcome

Provision and wire the minimum Azure service footprint required for the bridge.

Required outcomes:

1. establish the backend execution host for the bridge
2. use the existing registered application for pilot auth wiring
3. provision the minimum required Azure resources through CLI/IaC-backed repo changes where possible
4. document how the service is configured and deployed
5. ensure the discovery service can be run on a schedule and manually triggered

## Required Azure service footprint

At minimum, implement a credible service-hosting solution using:

- **Azure Function App** as the default execution host
- **Azure Storage Account** required by the Function runtime
- **Application Insights** for logs/telemetry
- **Key Vault** if required by repo-truth standards or the final secret-handling posture

If the repo has a stronger existing backend-hosting standard, align to it, but do not downgrade the bridge into a manual-only local script.

## Required implementation details

- Prefer **CLI/IaC-backed** setup committed to the repo over ad hoc portal-only instructions.
- Use the existing registered application rather than creating a new Entra app registration by default.
- Do not commit secrets to source control.
- Use secure runtime configuration for:
  - tenant ID
  - client ID
  - client secret or approved equivalent secret reference
  - HBCentral site URL
  - annual source site map
  - any bridge-specific execution settings
- Implement or document both:
  - **timer-triggered sync** posture
  - **HTTP-triggered manual rerun/admin** posture
- If any Graph site-specific grant step must be executed through CLI-driven Graph calls, implement or document that explicitly instead of leaving it implicit.
- Add or update deployment/config documentation so the hosting model is supportable by the team.
- If the repo already has naming, folder, or deployment conventions for Azure assets, follow them.

## Strong preference on provisioning method

The code agent should prefer one of these two patterns, in order:

1. extend the repo with **repeatable IaC/scripts** for the required Azure resources
2. if full IaC is not yet practical, add **repeatable CLI scripts plus runbook documentation**

Do not leave the package dependent on undocumented one-time portal clicks unless that is absolutely unavoidable and explicitly called out.

## Expected artifacts from this prompt

The code agent should aim to leave behind some or all of the following, depending on repo standards:

- infrastructure scripts/templates for Azure resources
- deployment/config scripts for the Function App
- environment variable contract documentation
- service-hosting readme/runbook
- any necessary backend host scaffolding in the repo
- updated package/deployment docs describing how the bridge host is provisioned and wired to the existing app registration

## Proof of closure

Provide:

- exact files added or modified
- the final chosen Azure hosting pattern
- the final list of Azure resources required for the pilot implementation
- the provisioning path used (CLI, IaC, or both)
- the Function/service config contract
- confirmation that the existing registered application is used for pilot auth
- confirmation that no secrets were committed to source control
- a concise deployment/run sequence showing how the service host is created and configured

## Constraints

- Do not create a new Entra app registration by default.
- Do not leave the bridge as a browser/runtime crawler.
- Do not skip secure configuration handling.
- Do not skip documentation of how the Azure services are provisioned and used.
- Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.
