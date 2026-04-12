# SharePoint / SPFx Architecture and Solution Shape

## Technical objective

Create a dedicated SPFx application boundary for Core Processes / FBA that is separate from `hb-webparts.sppkg` while still following the same design and implementation discipline demonstrated in the current Kudos public/companion pattern.

## Recommended solution boundary

Create a **new dedicated SPFx solution**.

Suggested package/output:

- `hbc-core-processes.sppkg`

This should contain:

- one public operating shell webpart
- one admin companion webpart
- shared contracts/helpers/data adapters
- dedicated dev harness
- dedicated package/build validation

## Why separate from hb-webparts

Reasons to keep it separate:

- clearer product ownership
- cleaner deployment and versioning
- reduced risk to existing homepage packages
- easier long-term evolution into a future project-context product
- avoids forcing a large global standards application into a homepage-webparts package boundary

## Recommended SPFx components

### Public webpart
Full-bleed operating shell.

Suggested alias concept:
- `HbcCoreProcessesWebPart`

### Companion webpart
Central governance/admin workspace.

Suggested alias concept:
- `HbcCoreProcessesCompanionWebPart`

## Shared code areas

Recommended shared layers:

- contracts
- content-model mappers
- SharePoint adapters
- source-item metadata helpers
- trust/freshness helpers
- role/lifecycle association helpers
- search/ranking helpers
- feedback intake helpers

## SharePoint storage model

Keep existing procedures-manual document library as the source layer.

Add new structured objects through SharePoint lists/libraries such as:

- `Core Process Packages`
- `Core Process Child Packages`
- `Core Process Source References`
- `Core Process Feedback`
- `Core Process Advisory Ownership`
- optional lookup/taxonomy support lists if needed

## Recommended list responsibilities

### Core Process Packages
Stores parent corridor packages and designated first-class supporting packages.

### Core Process Child Packages
Stores sub-process packages and promoted child standards.

### Core Process Source References
Stores typed references to source files and their metadata.

### Core Process Feedback
Stores user-submitted package feedback.

### Core Process Advisory Ownership
Stores package-owner/stakeholder metadata if not embedded directly into package lists.

## Dormant project seam

Build a dormant project-context seam into contracts now, but do not activate project-specific behavior in MVP.

Suggested dormant fields may include:

- `projectContextMode`
- `projectTypeApplicability`
- `phaseContextHint`
- `projectSpecificEligible`
- `projectBindingRequired` (false in MVP)

These should remain inactive in the MVP public UI and governance logic.

## Search architecture

Search should operate at the application layer, not just raw library search.

Minimum search domains:

- packages
- child packages
- source item references

Search ranking should remain package-first.

## Security posture

MVP public app:

- broad visibility with role-targeted landing and browse-first emphasis
- package visibility driven by governance and permitted access patterns as needed

MVP companion:

- central-admin access only
- no distributed editing access

## Recommended testing architecture

Match the discipline of the current Kudos product pattern:

- unit tests for contracts and helpers
- data-adapter tests for SharePoint seams
- dev harness for public and companion
- seeded test data
- Playwright against the harness
- package/build freshness validation

## Recommended repository structure

Suggested high-level structure:

- `apps/core-processes-spfx/`
  - public webpart
  - companion webpart
  - mount/runtime registration
  - config
- `packages/core-processes-shared/`
  - contracts
  - helpers
  - adapters
  - ranking/search helpers
  - trust/freshness logic
- `apps/core-processes-dev-harness/`
  - public shell harness
  - companion harness
  - seeded content scenarios
- `e2e/core-processes/`
  - public shell tests
  - companion tests
  - search/navigation tests
  - package-governance tests

If monorepo separation is unnecessary at first, keep all inside one SPFx app domain but preserve clear module boundaries so later extraction remains easy.
