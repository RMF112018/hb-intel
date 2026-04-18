# Plan Summary — Priority Actions Research-Backed Seeding

## Objective
Create a repo-truth, research-backed, idempotent seeding path for the HBCentral `Priority Actions Band Items` and `Priority Actions Band Config` lists that uses the existing `tools/` runner seam, seeds the required 10 action targets, seeds 3 meaningful config profiles, validates the result, and refreshes the related documentation.

## Repo-Truth Summary
### Existing runner/tooling seam
- The Node runner calls `tools/pnp-runner-local/scripts/invoke-pnp-extraction.ps1`.
- That PowerShell script already:
  - provisions both Priority Actions lists,
  - upserts one canonical `homepage-primary` config row,
  - extracts homepage Quick Links,
  - seeds items into `Priority Actions Band Items`,
  - derives `ActionKey` deterministically from title + href slug,
  - and archives missing rows under the Quick Links authoritative-seed model.

### Existing public/admin runtime seam
- Public runtime reads list-backed config and items for `homepage-primary`.
- Public runtime uses:
  - status gating,
  - audience gating,
  - schedule gating,
  - device visibility gating,
  - grouping metadata,
  - breakpoint caps,
  - and overflow rules.
- Admin runtime already validates config and item drafts and already writes them back through explicit SharePoint write seams.

## Key Implementation Decision
Do **not** overwrite the existing homepage-Quick-Links seed action.
Instead, add a **curated research-backed seed path** inside the same local runner family.

### Why
The current Quick Links seed path is authoritative for homepage parity/cutover, but it intentionally writes only a minimal item model. This package needs richer data and 3 config profiles. Replacing the extraction-based seed would conflate two different operational purposes.

## Recommended Seeding Strategy
### 1. Add a curated seed definition file under the runner
Create a repo-owned seed file, for example:

`tools/pnp-runner-local/seeds/hbcentral/priority-actions-research-seed.json`

That file should hold:
- 3 config profile rows
- 10 item rows
- explicit stable action keys
- explicit launch URLs
- explicit descriptions
- explicit grouping metadata
- explicit sort order
- explicit external/new-tab flags
- schema-default-compatible values for everything else

### 2. Add a new curated runner action
Add a new runner action key dedicated to the curated seed path, for example:

- `sharepoint-control:provisioning:priority-actions-band-seed-curated`
- and optionally
- `sharepoint-control:provisioning:priority-actions-band-provision-and-seed-curated`

### 3. Keep config-row reconciliation safe
Because the config schema has no dedicated profile key field, reconcile the 3 seeded profile rows by:

`BandKey + Title`

The seeded titles are intentionally unique:
- `Homepage Priority Actions`
- `Homepage Priority Actions - Compact`
- `Homepage Priority Actions - Guided`

Do not auto-disable unrelated unknown config rows. Instead:
- upsert the 3 seeded rows,
- enforce the intended live profile among the seeded rows,
- and fail validation if another unknown active `homepage-primary` row remains.

### 4. Keep item reconciliation safe
Use explicit curated `ActionKey` values rather than regenerating them from long URLs.

Recommended stable keys:
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

#### Why explicit keys are preferred here
The existing runner already generates deterministic keys from title + href, but several researched launch URLs are long or query-heavy. Explicit repo-owned keys are safer for a curated catalog because they avoid brittle identity churn when non-semantic query parameters or redirect wrappers change.

### 5. Use non-destructive archive behavior
The curated seed path should not blindly archive all rows missing from the curated payload.
Instead:
- upsert the managed item set by `BandKey + ActionKey`
- only archive rows whose `ActionKey` belongs to the curated managed set but no longer appears in the curated payload
- leave unknown/manual rows untouched

## Recommended Grouping Strategy
Use the runtime’s grouping support.

### Groups
- `project-delivery` / `Project Delivery`
- `people-benefits` / `People & Benefits`
- `finance-payroll` / `Finance & Payroll`

### Why this grouping is the best fit
- It matches the actual action set composition.
- It gives the segmented/hybrid config variants a real benefit.
- It avoids overfitting to one user role.
- It does not require speculative audience-targeting on day one.

## Recommended Config Strategy
Seed 3 rows for the same live band key `homepage-primary`, but only 1 should be live.

### Live row
- `Homepage Priority Actions`
- `Enabled = true`
- `IsActive = true`

### Stored alternates
- `Homepage Priority Actions - Compact`
- `Homepage Priority Actions - Guided`
- `Enabled = false`
- `IsActive = false`

This preserves the canonical band key and keeps the alternatives available as governed presets.

## Fields that should remain defaulted or blank initially
### Default from repo/schema posture
- `ItemStatus = Enabled`
- `BadgeVariant = neutral`
- `Priority = primary`
- `OverflowOnly = false`
- `MobilePriority = 100`
- `AudienceMode = all`
- all device visibility flags = `true`
- `OpenExternalInNewTabByDefault = true` on config rows

### Intentionally blank
- `IconKey`
- `BadgeLabel`
- `StartsAtUtc`
- `EndsAtUtc`
- `AudienceKeys`
- item-level `AdminNotes`

### Why
These values are not required to make the curated catalog operational, and several are not evidence-driven from public research. The runtime already tolerates blank/omitted values for them.

## Validation Strategy
The code agent must prove all of the following:
1. Both lists exist and conform to the documented schema.
2. Exactly 3 curated config rows exist for `homepage-primary`.
3. Only the standard profile is active/live after seeding.
4. 10 curated item rows exist with the expected `ActionKey` values.
5. No duplicate `ActionKey` values exist for `homepage-primary`.
6. All curated items have valid title, href, and action key values.
7. External items open in a new tab; the internal HBCentral item does not.
8. The admin/runtime validators do not reject the seeded shapes.
9. The public runtime can consume the seeded rows without empty/error state.
10. Documentation is refreshed to reflect the new curated seed path.

## Acceptance Criteria
- A local operator can run the curated seed action with device login.
- The action is idempotent on rerun.
- Unknown manual rows are not destructively archived.
- The seeded config and item rows match the `Seed-Data-Appendix.md` payload.
- Resulting docs clearly distinguish:
  - extraction-based Quick Links parity seeding
  - curated research-backed seeding

## Questions this package resolves
- Which values are proven from source research vs recommended defaults
- Which fields should remain blank
- Which launch URLs should be preserved exactly
- Which launch URLs should be refined to cleaner/canonical login destinations
- Which config rows should be seeded and which should be live
- Which tool seam should own the operation
- What validation must be captured before the work is considered done
