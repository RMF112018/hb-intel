# Prompt 01 — Confirm Contracts, Schemas, Auth, and Source Resolution

## Objective
Lock the bridge's core contracts before implementation spreads. Confirm the annual source configuration, target library resolution rules, fallback registry schema, sync-run schema, parser assumptions, HBCentral host-site requirement for bridge lists, and the interim authentication posture using `HB SharePoint Creator`.

## Why this prompt exists
The rest of the implementation depends on this contract layer. If source resolution, schema shape, host-site location, or auth posture drift midstream, the later provisioning, discovery, and integration work will fracture.

## Governing files and authorities

Inspect and align to:

- `00-Legacy-Project-Fallback-Bridge-Spec-and-Implementation-Plan.md`
- `01-Implementation-Waves.md`
- the existing `project-sites` data and repository seams
- the existing auth / Graph client / backend patterns already in the repo
- the uploaded manifest context for `HB SharePoint Creator`

## Required repo inspection areas

Inspect the relevant live repo files and seams that govern:

- `project-sites` normalized project identity
- backend service patterns and function app seams
- Graph auth / app-only token seams if they already exist
- SharePoint list schema patterns and list-descriptor patterns
- any existing provisioning tooling or schema-automation seams worth reusing
- any existing HBCentral list documentation patterns worth reusing

Do not assume the exact destination paths. Identify the correct existing seams first and work from repo truth.

## Required outcomes

1. Create or lock a source configuration contract for annual legacy sites.
2. Define the fallback registry schema in implementation-ready form.
3. Define the sync-run schema in implementation-ready form.
4. Identify whether an override / review list is actually needed.
5. Confirm that all bridge lists are hosted at `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`.
6. Confirm the interim use of `HB SharePoint Creator` as the pilot identity.
7. Confirm how secret/config storage will be handled outside the repo.
8. Confirm the code location for the discovery service, list descriptors, and provisioning logic.

## Required implementation details

- Create a typed source configuration module for the annual sites.
- Create typed list-descriptor contracts for the fallback registry and sync-run list.
- Explicitly identify required field names, field types, and indexes where appropriate.
- Define the canonical record identity as `DriveId + DriveItemId`, not folder name only.
- Define `MatchStatus`, `MatchConfidence`, and `MatchMethod` enums / unions clearly.
- Explicitly document that the service is app-only.
- Explicitly document that `HB SharePoint Creator` is interim pilot auth, not assumed final production auth.

## Proof of closure

Provide:

- the exact files added or modified
- the final schema / type definitions
- the final source configuration contract
- the resolved implementation location for the discovery service
- the resolved implementation location for HBCentral list provisioning / alteration logic
- confirmation that no secrets were added to source control
- a brief note identifying any unresolved dependency that would block Prompt 02

## Constraints

- Do not start crawling or syncing annual sites yet.
- Do not provision or mutate lists yet.
- Do not build the full discovery implementation in this prompt.
- Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.
- Do not introduce speculative architecture that contradicts existing repo truth without explicitly justifying the deviation.
