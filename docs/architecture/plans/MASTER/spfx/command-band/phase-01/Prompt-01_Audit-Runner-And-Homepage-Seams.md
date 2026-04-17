# Prompt 01 — Audit Runner And Homepage Seams

## Objective

Conduct a repo-truth audit of the existing local PnP runner, the current homepage utility/priority-actions seams, and the HBCentral homepage extraction path so the provisioning work is built on the **actual** code and not on assumptions.

## Why this exists

The requested implementation depends on three separate seams working together, and all of them must be aligned to the binding in-package schema files:

1. the local runner in `tools/pnp-runner-local/`
2. the current homepage utility contracts / normalization / `PriorityActionsRail`
3. the live HBCentral homepage Quick Links configuration that must be extracted and used to seed the new list
4. the two authoritative schema files included in this package:
   - `05-List-Schema-Priority-Actions-Band-Config.md`
   - `06-List-Schema-Priority-Actions-Band-Items.md`

Do not start by provisioning lists blindly. First establish exactly what already exists, what can be reused safely, what must be extended, and whether any repo-truth drift must be reconciled to the binding schema files in this package.

## Repo-truth files and seams to inspect

At minimum inspect:

- `tools/pnp-runner-local/package.json`
- `tools/pnp-runner-local/src/**`
- `tools/pnp-runner-local/scripts/invoke-pnp-extraction.ps1`
- `tools/pnp-runner-local/tests/**`
- `docs/architecture/plans/MASTER/spfx/pnp/phase-02/Prompt-01_PnpOps-Runner-Contract-Lock.md`
- `docs/architecture/plans/MASTER/spfx/pnp/phase-02/Prompt-03_PnpOps-Local-Runner-Setup-Guide.md`
- `apps/hb-webparts/src/homepage/webparts/utilityContracts.ts`
- `apps/hb-webparts/src/homepage/helpers/utilityConfig.ts`
- `apps/hb-webparts/src/webparts/priorityActionsRail/PriorityActionsRail.tsx`
- the strongest existing canonical SharePoint-backed config pattern:
  - `apps/hb-webparts/src/homepage/data/heroBannerListDescriptor.ts`
  - `apps/hb-webparts/src/homepage/data/heroBannerListSource.ts`
  - any companion writer/admin seams used by hero banner admin
- current documentation under:
  - `docs/reference/sharepoint/list-schemas/hbcentral/**`

Also inspect the actual HBCentral homepage composition path needed to identify where the current Quick Links webpart is hosted and how its configuration can be read.

Treat the two included schema files as mandatory audit inputs. The audit must explicitly compare current repo truth and planned provisioning behavior against those schema contracts rather than rediscovering the list model from scratch.

## Required audit outputs

Produce a concise but complete gap register covering:

### A. Runner reuse viability
- what existing local-runner code can be reused directly
- what runner seams must be extended for write/provisioning support
- whether the current HTTP/run/artifact model can support extraction + provisioning cleanly
- whether the existing PowerShell bridge can be extended safely or needs refactoring first

### B. Authentication posture
- confirm the Device Login path already exists
- confirm which env/config/settings are required to run locally with Device Login against HBCentral
- identify any hard blockers to executing provisioning through Device Login

### C. Homepage extraction seam
- determine how the current Quick Links webpart configuration will be discovered from the live HBCentral homepage
- determine what data can be extracted reliably:
  - title
  - URL
  - order
  - grouping if any
  - icon/image hints if any
  - whether external/open-in-new-tab can be inferred
- determine whether extracting only linked destinations is realistic or whether broader page/webpart config parsing is required

### D. Data-model mapping seam
- map the extracted Quick Links payload into the canonical `Priority Actions Band Items` schema included in this package
- identify any fields that must be defaulted during seeding
- identify any fields that should be introduced only after initial seeding, not forced from the legacy Quick Links source
- explicitly call out any repo-truth mismatch between existing descriptor/runtime assumptions and the included schema files

### E. Documentation seam
- determine which existing hbcentral list-schema docs already exist
- determine what must be added, replaced, or cross-linked so the new lists are fully documented

## Required deliverable from this prompt

Create an audit note in the repo that:
- names the files inspected
- describes the viable implementation path
- lists the exact runner changes required
- lists the exact documentation files that must be updated or created
- explicitly states whether the provisioning should be implemented **inside the existing local runner** (expected answer: yes unless repo truth proves otherwise)
- explicitly confirms whether the codebase can implement the two included schema files as-is or requires a deliberate migration/update

## Constraints

- Do not implement provisioning in this prompt unless a small refactor is absolutely required to enable the later prompts.
- Do not create a separate ad-hoc provisioning scaffold outside `tools/pnp-runner-local/` unless the existing runner architecture makes reuse impossible.
- Do not treat the list model as TBD; the included schema files are binding unless this prompt proves a required migration.
- Do not re-read files that are already in active context unless you need to verify drift, dependencies, or uncertainty after changes.

## What done really looks like

Done means there is no ambiguity left about:
- how the runner will be extended
- how Device Login will be used
- how Quick Links data will be extracted
- how that data will map into the new lists
- how the implementation will adhere to the included schema files
- what documentation surface will be updated

## Proof required

- audit note committed in repo
- explicit list of inspected files
- explicit list of required follow-on implementation tasks
- no vague or deferred “to be determined” items
