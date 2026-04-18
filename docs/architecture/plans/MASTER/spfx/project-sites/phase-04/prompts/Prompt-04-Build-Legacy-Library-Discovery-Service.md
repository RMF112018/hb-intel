# Prompt 04 — Build Legacy Library Discovery Service

## Objective
Implement the pilot discovery service on the provisioned backend host so it authenticates app-only with the existing registered application, resolves the configured annual sites and target libraries, enumerates project folders, captures canonical browser URLs, and writes normalized raw discovery records into the provisioned HBCentral fallback registry.

## Current gap to close
The bridge still has no working discovery engine. Until the service can run in the hosted backend environment, resolve the annual sites, and produce real fallback records in the live HBCentral registry, the rest of the solution remains theoretical.

## Governing files and authorities

Inspect and align to:

- `00-Legacy-Project-Fallback-Bridge-Spec-and-Implementation-Plan.md`
- `01-Implementation-Waves.md`
- output of Prompts 01, 02, and 03
- existing backend function patterns
- existing Graph client/auth seams

## Required repo inspection areas

Inspect the live repo for the correct places to implement:

- backend service entrypoint(s)
- Graph auth / token provider seams
- HTTP client and retry conventions
- logging conventions
- SharePoint list write conventions
- config/env handling
- Azure Function trigger and deployment patterns established in the repo, if any

## Required implementation outcome

Build a working discovery path that can:

1. acquire an app-only Graph token using the existing registered application through the hosted service config
2. resolve an annual site from the configured source definition
3. resolve the target drive/library for that site
4. enumerate root children
5. retain folder items only
6. capture folder metadata, including canonical browser URL
7. upsert raw discovery records into the HBCentral fallback registry
8. create sync-run trace data in the HBCentral sync-run list
9. run through the provisioned backend service rather than a local-only/manual-only path

## Required implementation details

- Parameterize the year/source selection; do not hardcode a single year into core logic.
- Prefer explicit drive resolution rules from configuration.
- Capture at minimum:
  - `DriveId`
  - `DriveItemId`
  - `FolderName`
  - `FolderPath`
  - `FolderWebUrl`
  - `LegacyYear`
  - source site/library metadata
  - discovery run metadata
- Filter out obvious non-folder records.
- Log and surface resolution failures clearly.
- Keep the discovery path cleanly separated from the later matching engine.
- Ensure the discovery path uses the hosted configuration produced in Prompt 03 rather than introducing a second auth/config pattern.

## Proof of closure

Provide:

- exact files added or modified
- the final discovery entrypoint(s)
- evidence that one or more configured annual sources can be resolved end to end
- evidence that records are written to the HBCentral fallback registry
- evidence that sync-run trace data is written
- a sample normalized raw discovery record shape
- a brief note on retry/error handling
- confirmation that the discovery path runs in the provisioned service host

## Constraints

- Do not add share-link generation as part of discovery.
- Do not build heuristic project matching yet beyond what is necessary to preserve raw discovery data.
- Do not move the discovery flow into the SPFx runtime.
- Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.
