# Prompt 02 — Run Device-Login Seeding and Validate the Result

**Do not re-read files that are already in your current context or memory unless needed to resolve uncertainty or verify drift.**

## Current issue
After implementing the curated seed path, it still must be proven against the live HBCentral tenant. Package/build success is not enough. The actual lists must contain the intended rows and the runtime-facing values must match the researched seed package.

## Why this matters
The public `PriorityActionsRail` reads list data directly. If the seeded list rows drift from the intended payload, the homepage action layer will render the wrong links, invalid grouped metadata, or conflicting config rows.

## Intended future state
A device-login execution against the live HBCentral site proves:
- 3 curated config rows exist
- 10 curated item rows exist
- only the standard profile is live
- item fields match the appendix
- and the validation artifacts are captured

## Required execution posture
Use **device login** auth.
Target site:
- `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`

## Execution steps
1. Run the new curated provision+seed action if you created a combined action.
   - Otherwise:
     1. provision command-band lists
     2. run the curated seed action
2. Capture the run id and artifact bundle.
3. Review `raw.json`, `normalized.json`, summary output, and any curated seed summary output you added.
4. Prove all acceptance checks below.

## Validation checks
### Config validation
- Confirm exactly these 3 rows exist under `Priority Actions Band Config` for `BandKey=homepage-primary`:
  - `Homepage Priority Actions`
  - `Homepage Priority Actions - Compact`
  - `Homepage Priority Actions - Guided`
- Confirm row values match `Config-Options-Matrix.md`.
- Confirm only `Homepage Priority Actions` is `Enabled=true` and `IsActive=true`.
- Confirm there is no second unknown active `homepage-primary` row.
- If there is, fail the run and report it explicitly.

### Item validation
Confirm exactly these 10 curated keys exist under `Priority Actions Band Items` for `BandKey=homepage-primary`:
- `hb-projects`
- `bamboohr`
- `hh2`
- `my-adp`
- `procore`
- `employee-navigator`
- `concur`
- `document-crunch`
- `compass`
- `hb-university`

For each row, validate:
- `Title`
- `Href`
- `ActionDescription`
- `GroupKey`
- `GroupTitle`
- `SortOrder`
- `IsExternal`
- `OpenInNewTab`

Also validate the defaults:
- `ItemStatus = Enabled`
- `BadgeVariant = neutral`
- `Priority = primary`
- `OverflowOnly = false`
- `MobilePriority = 100`
- `AudienceMode = all`
- all device visibility flags = true
- `IconKey` blank
- `BadgeLabel` blank
- `AudienceKeys` blank
- `StartsAtUtc` blank
- `EndsAtUtc` blank

### Runtime-compatibility validation
Use repo-truth reasoning against the runtime contracts to prove:
- no duplicate `ActionKey` values exist
- no item is missing title / href / action key
- group key/title pairing is valid
- no breakpoint-cap validation issue exists on the config rows
- no duplicate active-config issue exists for the live row

### Destructive-safety validation
Confirm that the curated seed action did **not** archive or mutate rows outside the curated managed key set.

## Deliverables
Produce:
1. a concise run summary
2. the curated rows actually written
3. validation results against every expected key/title
4. any drift or mismatch discovered
5. the exact remediation applied if you had to fix anything during validation

## Acceptance criteria
- Live tenant data matches the package appendix.
- Validation passes without unresolved conflicts.
- Device-login execution path is proven.
- Artifacts are sufficient for another maintainer to audit the run.

## Done means
The curated seed path is not just implemented — it is proven on the live target site with reviewable evidence.
