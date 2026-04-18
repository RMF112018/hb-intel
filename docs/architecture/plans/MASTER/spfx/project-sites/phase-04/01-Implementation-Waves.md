# Legacy Project Fallback Bridge — Implementation Waves

## Current execution status

- **Prompt 01:** executed
- **Prompt 02:** executed
- **Resume execution at Prompt 03**

## Wave 1 — Contracts, schemas, source resolution, and auth lock

### Objective
Lock the solution shape before implementation spreads. Define the source configuration, registry schemas, sync-run schemas, field descriptors, parser assumptions, host site, and pilot authentication posture.

### Includes

- annual source configuration module
- fallback registry schema
- sync-run schema
- any required override / review schema decisions
- explicit declaration that bridge lists live at `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`
- auth seam using `HB SharePoint Creator`
- provisioning and alteration plan for required lists

### Status
Completed by Prompts 01 and 02, unless repo-truth drift is discovered.

### Exit criteria

- schema and descriptor contracts are implementation-ready
- HBCentral is confirmed as the list host site
- any missing or altered lists are explicitly identified
- auth posture is documented
- no secrets are stored in code

## Wave 2 — Azure service hosting and execution model

### Objective
Provision the minimum Azure services required to run the bridge as a real backend job using the existing registered application, and wire the repo to those services through documented, repeatable CLI/IaC-backed setup.

### Includes

- Azure Function App execution host
- required runtime Storage Account
- Application Insights resource and Function linkage
- Key Vault decision and implementation if required by repo standards or production posture
- secure app/config wiring to the existing `HB SharePoint Creator` registration
- deployment/config scripts or IaC for the service host
- environment/config contracts for timer-triggered and HTTP-triggered bridge execution

### Exit criteria

- required Azure resources are provisioned or provisionable from repo-truth CLI/IaC
- the Function/service host is wired to the existing app registration without secrets in source control
- config and deployment posture are documented
- the bridge has a credible execution environment for discovery work

## Wave 3 — Pilot discovery service

### Objective
Use the provisioned backend host to resolve at least one annual legacy library end to end and write real discovery records into the HBCentral registry.

### Includes

- app-only token acquisition using the existing app registration
- site resolution
- drive resolution
- root folder enumeration
- initial registry writer
- pilot sync-run logging

### Exit criteria

- at least one pilot annual source is discoverable end to end
- registry records contain stable folder URLs
- sync-run trace data is persisted

## Wave 4 — Matching, normalization, and multi-year sync maturity

### Objective
Turn raw discovery into usable fallback records tied to project identity.

### Includes

- project-number parser
- normalized title comparison
- confidence model
- multi-year processing
- stale record behavior
- sync traceability
- any required registry-field backfill or alteration if the matching model needs it

### Exit criteria

- all in-scope years can be scanned
- high-confidence records auto-match correctly
- ambiguous records are flagged for review, not silently misbound

## Wave 5 — `project-sites` integration and fallback launch behavior

### Objective
Expose legacy fallback launch behavior inside the app without degrading the primary migrated-site experience.

### Includes

- fallback registry read seam
- normalized fallback fields in the `project-sites` data model
- launch precedence logic
- `Open Legacy Project Files` action state
- factual helper messaging

### Exit criteria

- projects with primary sites still launch normally
- projects without primary sites but with fallback records expose the legacy action
- projects with no launch target remain non-launchable

## Wave 6 — Review workflow, operations, and production hardening

### Objective
Make the bridge maintainable and production-ready.

### Includes

- admin review and override workflow
- manual bind / ignore / disable
- sync operations and rerun posture
- monitoring and run logging
- permission-rightsizing path
- production readiness checklist
- any final list alterations required by the review workflow
- final Azure service hardening and operational guidance

### Exit criteria

- maintainers can review and correct low-confidence records
- sync runs are observable and repeatable
- production auth/permission hardening decision is documented
- all required HBCentral lists and fields are provisioned and documented
- Azure hosting and operational posture are documented and supportable
