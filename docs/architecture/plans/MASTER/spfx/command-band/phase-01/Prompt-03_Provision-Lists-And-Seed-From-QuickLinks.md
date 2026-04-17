# Prompt 03 — Provision Lists And Seed From Quick Links

## Objective

Use the extended local runner to provision the new command-band SharePoint lists at `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`, extract the currently configured homepage Quick Links destinations, and seed `Priority Actions Band Items` from that live data.

Treat these included files as the authoritative schema inputs for this prompt:
- `05-List-Schema-Priority-Actions-Band-Config.md`
- `06-List-Schema-Priority-Actions-Band-Items.md`

## Why this issue exists / current-state problem

The target data model does not exist yet in HBCentral, and the current homepage utility row is still the SharePoint Quick Links webpart. The new command-band implementation needs a real canonical SharePoint-backed starting dataset, and the most credible initial seed source is the live Quick Links configuration already being used on the homepage.

This prompt is where the list model becomes real in SharePoint. Do not improvise a looser schema during execution. Provision, seed, and validate against the included schema files unless Prompt 01 proved a required migration/update and that migration/update is being implemented now.

## Repo-truth evidence and exact files / seams to inspect

Use the runner implementation produced in Prompt 02 and the homepage/utility model files:

- `tools/pnp-runner-local/**`
- `apps/hb-webparts/src/homepage/webparts/utilityContracts.ts`
- `apps/hb-webparts/src/homepage/helpers/utilityConfig.ts`
- any new descriptor/writer/source files created for:
  - `Priority Actions Band Config`
  - `Priority Actions Band Items`
- the included schema files:
  - `05-List-Schema-Priority-Actions-Band-Config.md`
  - `06-List-Schema-Priority-Actions-Band-Items.md`

## Required implementation outcome

### A. Provision the two lists at HBCentral
Provision or normalize:

- `Priority Actions Band Config`
- `Priority Actions Band Items`

using the exact schema already defined in the included files, including:
- correct titles
- correct internal names
- correct field types
- correct required/default values
- correct choice values
- required indexed fields where appropriate
- attachments disabled / folder creation disabled where applicable
- versioning posture consistent with the schema docs

### B. Seed the config list
Create the canonical initial config row exactly as defined in `05-List-Schema-Priority-Actions-Band-Config.md`.

At minimum that means:
- `Title = Homepage Priority Actions`
- `BandKey = homepage-primary`
- `Enabled = Yes`
- `IsActive = Yes`
- `OverflowLabel = More tools`
- `ShowHeading = No`
- `StickyAfterHero = No`
- `ShowBadges = Yes`
- `DesktopLayoutMode = rail`
- `TabletLayoutMode = grid`
- `MobileLayoutMode = sheet-trigger`
- `MaxVisibleDesktop = 5`
- `MaxVisibleLaptop = 5`
- `MaxVisibleTabletLandscape = 4`
- `MaxVisibleTabletPortrait = 4`
- `MaxVisiblePhone = 4`
- `OpenExternalInNewTabByDefault = Yes`

Do not invent alternate band keys such as `homepage-entry` unless Prompt 01 and Prompt 02 already proved and implemented a deliberate migration/update.

### C. Extract existing Quick Links configuration
Extract the currently configured homepage Quick Links entries from the live HBCentral homepage and normalize them into deterministic artifacts.

The extraction artifacts must make it clear, row by row:
- source title
- source URL
- source order
- any source indication of grouping
- any source indication of icon/image
- whether external/open-in-new-tab can be inferred
- any source ambiguity that required a default during seeding

### D. Populate `Priority Actions Band Items`
Seed the items list from the extracted Quick Links data.

Map the extracted legacy data into the canonical item schema from `06-List-Schema-Priority-Actions-Band-Items.md` with explicit defaults for fields not present in the legacy source.

At minimum the seeded rows must align to these canonical fields:

- `Title` from extracted title
- `BandKey = homepage-primary`
- `ActionKey` generated deterministically from the source title/URL with stable slug logic
- `ItemStatus = Enabled`
- `ActionDescription = blank` unless a real source exists
- `Href` from extracted URL
- `IconKey = blank` unless a real source exists
- `BadgeLabel = blank` unless a real source exists
- `BadgeVariant = neutral`
- `Priority = primary` unless a different initial policy is explicitly justified
- `GroupKey = blank` unless a real source exists or a deterministic grouping rule is intentionally introduced now
- `GroupTitle = blank` unless a real source exists or a deterministic grouping rule is intentionally introduced now
- `SortOrder` derived from homepage Quick Links order if available, otherwise deterministic fallback
- `OverflowOnly = No`
- `MobilePriority = 100` unless a deterministic ranking rule is intentionally introduced now
- `AudienceMode = all`
- `AudienceKeys = blank`
- `IsExternal` inferred from URL
- `OpenInNewTab` inferred if possible, otherwise deterministic default consistent with config behavior
- `VisibleDesktop = Yes`
- `VisibleLaptop = Yes`
- `VisibleTabletLandscape = Yes`
- `VisibleTabletPortrait = Yes`
- `VisiblePhone = Yes`
- `StartsAtUtc = blank`
- `EndsAtUtc = blank`
- `AdminNotes = blank`

Use deterministic defaults for every field not present in the source Quick Links payload, and record those defaults in the seed summary.

### E. Ensure rerun safety
Re-running the workflow must not create uncontrolled duplicates.

That means:
- no duplicate config rows for the same `BandKey`
- no duplicate seeded item rows for the same source Quick Links entry
- stable `ActionKey` generation across reruns
- clear update-versus-insert behavior when source rows already exist

## Constraints / prohibitions

- Do not manually create lists in SharePoint UI.
- Do not seed dummy placeholder items instead of the extracted Quick Links source.
- Do not silently discard extraction failures.
- Do not leave the config list unseeded.
- Do not provision a schema that silently diverges from the included schema files.
- Do not create alternate field names or alternate defaults unless the same prompt also implements and documents the migration/update.
- Do not re-read files that are already in active context unless you need to verify drift, dependencies, or uncertainty after changes.

## What done really looks like

Done means:
- both lists exist in HBCentral
- the config list has the canonical initial row defined by the included schema file
- the items list is populated from the actual currently configured homepage Quick Links destinations
- the runner artifacts prove what was extracted and what was seeded
- the result is idempotent and rerunnable
- the live SharePoint result matches the included schema files

## Validation requirements

Validate all of the following:

- list titles exist exactly as expected
- required fields exist with the correct internal names from the included schema files
- the config row exists with `BandKey = homepage-primary`, `Enabled = Yes`, and `IsActive = Yes`
- item row count matches the extracted Quick Links count, or any mismatch is explicitly explained
- seeded item titles and `Href` values match the extracted source
- seeded `ActionKey` values are deterministic and stable
- repeated execution does not create duplicate rows unexpectedly
- schema validation output proves alignment to the included schema files

## Proof of closure required

- successful runner execution logs
- extraction artifact
- normalized seed artifact
- list schema validation output
- seeded row count and source row count comparison
- concise provisioning/seed report committed in repo
