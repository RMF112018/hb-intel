# Prompt 01 — Implement Research-Backed Priority Actions Seeding

**Do not re-read files that are already in your current context or memory unless needed to resolve uncertainty or verify drift.**

## Current issue
The repo already has a working Priority Actions provisioning + seed seam, but the existing seed path is deliberately narrow: it extracts homepage Quick Links and writes a minimal item model. That is not sufficient for the researched base action catalog because it does not seed:
- 3 governed config profiles,
- curated descriptions,
- curated grouping metadata,
- curated stable short action keys,
- or refined launch URLs where the supplied target is not the best canonical login/page URL.

## Why this matters
The homepage action layer now has a real list-backed public runtime and a permission-aware admin surface. If the initial base catalog is under-modeled, the runtime can still render, but maintainers start from weak data and the grouped/segmented variants have little value.

## Intended future state
A local operator can use the existing `tools/pnp-runner-local/` seam to run a dedicated curated seed action that:
1. provisions the lists if needed,
2. upserts 3 config profiles for `homepage-primary`,
3. upserts the 10 researched item rows,
4. preserves stable `ActionKey` identity,
5. leaves unknown/manual rows alone,
6. and emits reviewable artifacts proving what was written.

## Repo/file scope
Inspect and work within:
- `tools/pnp-runner-local/src/powershell.ts`
- `tools/pnp-runner-local/scripts/invoke-pnp-extraction.ps1`
- any runner action catalog / type definitions that register new action keys
- `apps/hb-webparts/src/homepage/data/priorityActionsConfigListSource.ts`
- `apps/hb-webparts/src/homepage/data/priorityActionsItemsListSource.ts`
- `apps/hb-webparts/src/homepage/data/usePriorityActionsData.ts`
- `apps/hb-webparts/src/homepage/data/priorityActionsContracts.ts`
- `apps/hb-webparts/src/homepage/data/priorityActionsNormalization.ts`
- `apps/hb-webparts/src/homepage/data/priorityActionsValidation.ts`
- `apps/hb-webparts/src/homepage/data/priorityActionsListWriter.ts`
- `apps/hb-webparts/src/homepage/data/priorityActionsAdminState.ts`
- `apps/hb-webparts/src/homepage/data/priorityActionsGovernance.ts`
- `apps/hb-webparts/src/webparts/priorityActionsRail/PriorityActionsRail.tsx`
- `apps/hb-webparts/src/webparts/priorityActionsRailAdmin/PriorityActionsRailAdmin.tsx`
- `docs/reference/sharepoint/list-schemas/hbcentral/lists/priority-actions-band-config.md`
- `docs/reference/sharepoint/list-schemas/hbcentral/lists/priority-actions-band-items.md`

Also use the package files:
- `Plan-Summary.md`
- `Research-Confidence-Matrix.md`
- `Config-Options-Matrix.md`
- `Seed-Data-Appendix.md`

## Implementation expectations
### 1. Add a curated seed definition file
Create a repo-owned curated seed data file under the runner tree, for example:
- `tools/pnp-runner-local/seeds/hbcentral/priority-actions-research-seed.json`

Populate it from `Seed-Data-Appendix.md`.

### 2. Add a dedicated curated runner action
Add a new canonical action key for curated seeding, for example:
- `sharepoint-control:provisioning:priority-actions-band-seed-curated`

If you want a combined provision+seed action, add:
- `sharepoint-control:provisioning:priority-actions-band-provision-and-seed-curated`

### 3. Keep the existing Quick Links seed intact
Do not repurpose or break:
- `sharepoint-control:provisioning:priority-actions-band-seed-items`
- `sharepoint-control:provisioning:priority-actions-band-provision-and-seed`

Those actions serve the homepage Quick Links parity path and should remain available.

### 4. Implement curated config-row upsert logic
Use the curated seed file and upsert the 3 config rows by:
- `BandKey + Title`

Do not auto-disable unrelated unknown rows.
Instead:
- upsert the 3 seeded rows,
- set only `Homepage Priority Actions` to `Enabled=true` and `IsActive=true`,
- set the 2 alternates to `Enabled=false` and `IsActive=false`,
- then validate that no other unknown `homepage-primary` row remains both enabled and active.

If such a conflicting unknown active row exists, fail the curated seed action loudly and emit a clear validation error in the artifacts.

### 5. Implement curated item-row upsert logic
Use the curated seed file and upsert item rows by:
- `BandKey + ActionKey`

Use the explicit short action keys from the appendix.
Do not regenerate new keys from long URLs for this curated path.

### 6. Use non-destructive archive behavior
Do **not** reuse the extraction-seed archive model that archives every missing row under `homepage-primary`.

For the curated path:
- archive only rows whose `ActionKey` belongs to the curated managed set and no longer appears in the curated payload
- do not mutate rows outside the curated managed key set

### 7. Preserve schema/runtime-compatible defaults
Ensure the curated write path produces rows consistent with the live validation/runtime contracts:
- config breakpoint caps must remain valid and non-increasing
- each item must have title, href, and action key
- group key and group title must appear together
- audience mode `all` must not emit audience keys
- blank icon keys must remain valid
- internal SharePoint item must stay `IsExternal=false` / `OpenInNewTab=false`
- external items should be `IsExternal=true` / `OpenInNewTab=true`

### 8. Emit reviewable seed artifacts
Have the curated runner action emit at minimum:
- curated config rows written
- curated item rows written
- inserted / updated / archived counts
- validation failures
- any conflicting existing active config rows
- any rows skipped because they are outside the curated managed set

## Acceptance criteria
- The new curated seed action exists and is wired through the local runner.
- The curated seed action reads a repo-owned seed definition file.
- The curated seed action preserves the legacy Quick Links seed path.
- Config rows are reconciled by `BandKey + Title`.
- Item rows are reconciled by `BandKey + ActionKey`.
- Only the standard profile is live after seeding.
- Unknown/manual rows are not blindly archived.
- The resulting data shape remains valid for both the public runtime and admin runtime.

## Done means
- A fresh device-login run can seed the researched catalog without hand-editing SharePoint rows.
- Rerunning the curated action is stable and idempotent.
- The artifacts clearly show what changed and why.
