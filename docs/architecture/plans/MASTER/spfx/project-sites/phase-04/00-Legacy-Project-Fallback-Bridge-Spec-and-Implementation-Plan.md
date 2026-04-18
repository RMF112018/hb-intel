# Legacy Project Fallback Bridge
## Full Specification and Implementation Plan

## 1. Objective

Design and implement a migration-bridge solution that allows the `project-sites` application to open a **legacy project folder** when a project has not yet migrated into the new tenant architecture and therefore has no primary site URL in the SharePoint `Projects` list.

The bridge must scan the annual SharePoint project libraries for years **2019 through 2026**, normalize legacy project-folder records into a governed fallback registry, and let `project-sites` resolve a stable legacy launch target when no migrated site exists.

## 2. Business context

The organization is transitioning from a fragmented and low-value legacy SharePoint architecture to a new architecture where the `project-sites` application is hosted.

During that transition:

- not every project will yet exist in the new SharePoint `Projects` list in a way that supports a migrated site launch
- the current system of record for many older or not-yet-migrated project files remains the annual project sites and their document libraries
- users still need a fast, credible, governed way to reach project documents from `project-sites`

The fallback bridge is intended to solve that continuity gap without weakening the long-term architecture.

## 3. In-scope source systems

The target legacy annual project sites are:

- `https://hedrickbrotherscom.sharepoint.com/sites/2019Projects/...`
- `https://hedrickbrotherscom.sharepoint.com/sites/2020Projects/...`
- `https://hedrickbrotherscom.sharepoint.com/sites/2021Projects/...`
- `https://hedrickbrotherscom.sharepoint.com/sites/2022Projects/...`
- `https://hedrickbrotherscom.sharepoint.com/sites/2023Projects/...`
- `https://hedrickbrotherscom.sharepoint.com/sites/2024Projects/...`
- `https://hedrickbrotherscom.sharepoint.com/sites/2025Projects/...`
- `https://hedrickbrotherscom.sharepoint.com/sites/2026Projects/...`

Assumed target library concept:

- one primary annual project document library per site
- project folders stored in a sufficiently consistent top-level pattern to support deterministic or review-assisted matching

## 4. Core design decision

The solution will **not** use generated share links as the default fallback strategy.

Instead, it will:

- discover legacy project folders from the annual libraries
- capture the folder's canonical browser URL (`webUrl`)
- store that URL in a governed fallback registry
- let `project-sites` use that URL as the fallback target when no primary site exists

### Why this is the correct default

- it preserves native SharePoint permissions
- it avoids unnecessary sharing operations
- it avoids governance complications around broad link creation
- it keeps the solution aligned with folder-as-record discovery instead of share-link lifecycle management

## 5. Registry host site and provisioning posture

All new or altered SharePoint lists for this bridge are hosted at:

- `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`

This is a hard implementation requirement.

The implementation must:

- provision any required list that does not already exist
- alter any existing equivalent list that lacks required fields or uses the wrong field types
- align live list schema with code descriptors
- update list documentation and descriptors when schema changes are introduced

Do not leave required list creation or schema mutation as a manual post-step unless the repo has no safe automated provisioning path and that limitation is documented explicitly.

## 6. Desired end state

For any project shown in `project-sites`:

1. if a **primary migrated site URL** exists, the app opens that site
2. else if a **legacy fallback folder URL** exists, the app shows `Open Legacy Project Files`
3. else the project remains non-launchable or incomplete according to existing app rules

The bridge must be:

- governed
- performant
- deterministic where possible
- reviewable where certainty is low
- easy to disable or refine over time

## 7. Non-goals

This effort must not:

- replace the new architecture as the primary source of truth
- broaden user access to legacy sites beyond existing SharePoint permissions
- depend on runtime crawling of all annual sites during normal page load
- generate organization-wide share links as the baseline behavior
- permanently merge the legacy annual architecture into the core `Projects` list model
- force every legacy folder into an automatic match even when confidence is weak

## 8. Governing architectural principles

### 8.1 Primary vs secondary source of truth

The new architecture remains authoritative.

- **Primary source:** `Projects` list + migrated project site URL
- **Secondary source:** legacy fallback registry

### 8.2 Discovery must be backend-driven

The annual library scan must run in a backend job or controlled admin-triggered sync.

It must not run in the SPFx web part during ordinary user page loads.

### 8.3 Least-friction launch behavior

The user-facing app must not expose the complexity of the bridge.

Users should simply see the correct launch action:

- `Open Site`
- or `Open Legacy Project Files`

### 8.4 Explicit matching confidence

The system must distinguish between:

- high-confidence automatic matches
- medium-confidence matches
- low-confidence or ambiguous matches requiring review

### 8.5 Preserve permissions

The bridge must route users to native SharePoint URLs and allow SharePoint permissions to govern access.

## 9. Authentication and permission strategy

### 9.1 Interim pilot identity

Use the existing Entra app registration:

- **Display name:** `HB SharePoint Creator`
- **App ID:** `08c399eb-a394-4087-b859-659d493f8dc7`

as the interim pilot identity for the backend discovery and sync service.

### 9.2 Pilot posture

This app is acceptable for pilot work because it already exists and is broad enough to support cross-site discovery and registry writeback.

### 9.3 Production posture

The long-term target remains:

- app-only
- least privilege
- site-scoped where feasible
- distinct from unrelated provisioning/admin workflows if needed

Preferred production hardening path:

- dedicated fallback-sync identity, or
- tightened use of `HB SharePoint Creator` after rightsizing and explicit governance approval

### 9.4 Secret handling

No secrets may be committed to source control.

The implementation must use repo-truth secret/config handling patterns and document the pilot credential rotation and production hardening posture.



## 9A. Service hosting and execution model

### 9A.1 Required runtime posture

The bridge must run as a **backend service**, not inside the SPFx browser runtime.

The annual-site discovery and registry sync workload must execute in an Azure-hosted service that supports:

- scheduled runs
- manual admin-triggered reruns
- app-only authentication
- secure configuration
- observable failures and retries

### 9A.2 Recommended Azure footprint

The minimum recommended Azure-hosted service footprint is:

- **Azure Function App** as the discovery/sync execution host
- **Azure Storage Account** required by the Function runtime and available for operational state if needed
- **Application Insights** for run visibility, failures, and operational telemetry
- **Key Vault** when required by repo-truth security posture or final production handling of secrets/configuration

### 9A.3 Trigger model

The service should support both:

- **timer-triggered sync** for scheduled execution
- **HTTP-triggered operations** for targeted manual runs such as sync-one-year, full resync, or rerun of a specific record/year

### 9A.4 Why Azure hosting is required

The registered application provides identity and permissions, but it does not provide:

- a place for code to run
- a scheduler
- a retryable background host
- observability
- operational configuration management

The bridge must therefore provision and use actual Azure services in addition to the registered application.

### 9A.5 Provisioning posture

Provision the required Azure resources through repo-truth CLI/IaC-backed implementation where possible.

Preferred posture:

- Azure CLI-backed scripts and/or Bicep templates committed to the repo
- no undocumented ad hoc portal-only setup if a repeatable scripted path is viable
- explicit wiring to the existing `HB SharePoint Creator` registration for pilot execution

### 9A.6 Interim identity use

Use the existing Entra application `HB SharePoint Creator` as the pilot service identity.

Do not create a new Entra app registration by default unless repo truth proves the existing registration cannot safely support the pilot implementation.

### 9A.7 Production hardening path

The bridge should retain a documented path toward narrower production auth, but the implementation may use the existing registered application during pilot execution while the Function/service host is being established.

## 9B. Azure service implementation requirements

### 9B.1 Required implementation outcomes

The repo must gain a credible implementation path for:

- resource group selection or creation
- Function App provisioning
- Storage Account provisioning
- Application Insights provisioning and linkage
- Key Vault decision and provisioning if required
- Function App configuration settings for the existing app registration and bridge execution

### 9B.2 Existing registered application wiring

The service host must be wired to the existing app registration using secure runtime configuration.

No client secret or equivalent credential may be committed to source control.

### 9B.3 CLI requirement

The code agent should prefer CLI/IaC-backed setup using repo-truth scripts/templates.

Where site-specific Graph grants or other steps are not available through a single native Azure resource command, implement the repeatable step through documented CLI-driven Graph calls rather than leaving the step implicit.

## 10. Required SharePoint lists at HBCentral

### 10.1 Required list: `Legacy Project Fallback Registry`

This is the canonical secondary registry used by `project-sites`.

Recommended fields:

- `Title`
- `ProjectNumber`
- `ProjectNameRaw`
- `ProjectNameNormalized`
- `LegacyYear`
- `SourceSiteName`
- `SourceSitePath`
- `SourceLibraryName`
- `DriveId`
- `DriveItemId`
- `FolderName`
- `FolderPath`
- `FolderWebUrl`
- `MatchStatus`
- `MatchConfidence`
- `MatchedProjectListItemId`
- `MatchedProjectTitle`
- `MatchMethod`
- `LastSeenUtc`
- `LastValidatedUtc`
- `DiscoveryRunId`
- `Notes`
- `IsActive`

If an equivalent list already exists at HBCentral, alter it to this governed shape rather than creating a competing duplicate.

### 10.2 Required list: `Legacy Project Fallback Sync Runs`

This list is strongly recommended and should be treated as required unless repo-truth operational patterns provide a better authoritative run-log seam.

Recommended fields:

- `Title`
- `RunId`
- `StartedUtc`
- `CompletedUtc`
- `Status`
- `YearsProcessed`
- `FoldersScanned`
- `RecordsCreated`
- `RecordsUpdated`
- `RecordsUnmatched`
- `ErrorCount`
- `SummaryJson`

### 10.3 Optional list

An additional override / review list may be introduced only if the implementation truly needs a separate persistence seam beyond the registry itself.

Do not proliferate lists casually. Prefer keeping manual-review and override state in the registry unless a strong architectural reason requires separation.

## 11. Matching model

### 11.1 Folder-name parsing rules

Primary parser should try to extract a project number from the folder name.

Likely pattern family:

- `22-112-01 PGA The Modern & Garage`
- `22-141-01 BIM - Caretta`
- `22-300-01 Biden Residence`

Recommended regex family:

- `^\d{2}-\d{3}-\d{2}\b`

### 11.2 Normalization rules

Normalize all candidate names by:

- trimming whitespace
- converting repeated spaces to single space
- lowercasing
- removing decorative punctuation where appropriate
- replacing `&` with `and` for comparison
- stripping leading project number tokens
- collapsing known prefixes only when validated during pilot

### 11.3 Confidence model

#### High confidence
- exact parsed project number match to the project identity source

#### Medium confidence
- no exact number match, but strong normalized title match and same year

#### Low confidence
- weak heuristic match only

#### No confidence
- unmatched

## 12. Discovery algorithm

### 12.1 Site resolution
Resolve each annual site from configuration.

### 12.2 Drive resolution
For each site, enumerate available drives or resolve the configured target document library.

### 12.3 Folder enumeration
Enumerate root children and retain only folder items.

### 12.4 Metadata capture
Persist at minimum:

- source site and library metadata
- `DriveId`
- `DriveItemId`
- `FolderName`
- `FolderPath`
- `FolderWebUrl`
- `LegacyYear`
- sync-run metadata

### 12.5 Incremental refresh
After initial load, move to change-aware refresh if repo-truth backend patterns support it cleanly.

## 13. Runtime integration specification for `project-sites`

### 13.1 New normalized fields

Add to normalized entry model:

- `primarySiteUrl`
- `legacyFallbackFolderUrl`
- `legacyFallbackMatchStatus`
- `legacyFallbackSourceYear`
- `launchTargetKind`

### 13.2 Resolver precedence

1. `primarySiteUrl`
2. `legacyFallbackFolderUrl`
3. none

### 13.3 UI treatment

#### If primary site exists
- `Open Site`

#### If only fallback exists
- `Open Legacy Project Files`
- optional muted `Legacy` badge if helpful

#### If neither exists
- preserve existing non-launchable behavior

## 14. Admin / review workflow

The bridge must support a maintainer workflow for:

- filtering unmatched records
- filtering low-confidence records
- manual bind
- ignore
- disable
- open source folder
- revalidate a record or year where appropriate
- preserving notes and auditability

## 15. Failure modes and mitigation

### 15.1 Folder naming inconsistency
Mitigation:
- regex + normalization + review queue

### 15.2 Wrong drive selected
Mitigation:
- per-site drive override config

### 15.3 Duplicate project numbers
Mitigation:
- send to review
- no automatic bind

### 15.4 User lacks access to old site
Mitigation:
- show factual access-dependent message
- do not attempt automatic sharing

### 15.5 Large library scan cost
Mitigation:
- initial full crawl
- then incremental refresh where supported

## 16. Implementation plan

### Phase 1 — Contracts, schemas, auth, and provisioning lock

Deliverables:

- source configuration contract
- list-descriptor contracts
- fallback registry schema
- sync-run schema
- explicit declaration that lists live at HBCentral
- provisioning/alteration plan for required lists
- interim pilot auth lock using `HB SharePoint Creator`

### Phase 2 — Provision / alter HBCentral lists and build pilot discovery

Deliverables:

- required lists exist at HBCentral or equivalent lists are altered to the governed shape
- descriptors align to live schema
- pilot discovery service works against at least one annual source
- raw discovery records persist to the registry
- sync-run traces persist

### Phase 3 — Matching and multi-year maturity

Deliverables:

- parser
- normalization utilities
- confidence model
- deterministic upsert logic
- stale record handling
- all in-scope years supported
- any required registry-field backfill or alteration applied

### Phase 4 — `project-sites` integration

Deliverables:

- registry read seam
- normalized fallback fields in app model
- launch precedence logic
- truthful fallback action label and helper messaging

### Phase 5 — Review workflow and production hardening

Deliverables:

- maintainer review workflow
- manual bind / ignore / disable
- sync operations and rerun posture
- monitoring / operational note
- pilot-vs-production permission model documentation
- readiness checklist
- any final list alterations required by the review workflow

## 17. Acceptance criteria

The solution is complete when:

- required HBCentral lists exist in the correct schema or documented equivalent
- list descriptors match the live provisioned schema
- all 2019–2026 annual sites are scannable
- fallback registry records are created with stable folder URLs
- high-confidence matches auto-bind correctly
- low-confidence records are reviewable
- `project-sites` launches the primary site when available
- `project-sites` launches the legacy folder when no primary site exists but fallback does
- no live page load depends on scanning all annual sites
- sync runs are logged and repeatable
- pilot auth and production hardening posture are both explicit

## 18. Final recommendation

Proceed with the bridge using this layered posture:

- **Now:** use `HB SharePoint Creator` to get the fallback indexer working
- **Next:** provision the required HBCentral lists and build the registry, matching engine, and `project-sites` fallback resolution
- **Then:** harden permissions and move to a narrower production auth model

That delivers the continuity bridge now without pretending the current pilot permission posture is the ideal long-term design.
