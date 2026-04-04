# 11 — Recommended Repo Documentation Updates

## Recommended documentation placement strategy

Do **not** solve this by duplicating large portions of:
- `docs/architecture/blueprint/current-state-map.md`
- provisioning reference docs
- admin phase plans
- data-model reference docs

Instead, add a **focused subset map** that cross-references those existing authorities.

## Recommended placement

### Create a new focused subset documentation pocket
Recommended path:
- `docs/reference/spfx-subsets/four-app-shared-resource-map/`

Recommended files:
- `README.md`
- `focused-four-app-shared-resource-map.md`
- `focused-four-app-shared-data-map.md`
- `focused-four-app-ownership-and-source-of-truth.md`

### Update existing authoritative docs
1. **`docs/architecture/blueprint/current-state-map.md`**
   - add one short pointer to the focused four-app subset map
   - do not embed all subset tables into current-state-map

2. **Project Sites app/package docs**
   - correct the description that currently says filtering is based on page `Year` property
   - align wording with the live year-selector behavior

3. **Admin release-scope / packaging docs**
   - document how the admin SPFx surface is expected to authenticate when invoking provisioning API actions
   - explicitly say whether the current package manifest is correct by design

4. **Provisioning/data-model reference**
   - add a short field ownership note for the `Projects` list projection, especially:
     - `ProjectId`
     - `ProjectNumber`
     - `ProjectName`
     - `Department`
     - `SiteUrl`
     - `Year`

## Suggested document responsibilities

| Doc | Purpose |
|---|---|
| current-state-map | top-level current-state inventory and pointer to focused subset map |
| focused four-app subset map | one-stop governance map for these four SPFx apps |
| provisioning reference docs | low-level provisioning behavior and backend rules |
| admin control-plane docs | admin-native host/model boundaries |
| data-model docs | authoritative identity/join-field contracts |

## Anti-patterns to avoid

- creating a new giant architecture doc that competes with `current-state-map`
- duplicating provisioning schema details already governed elsewhere
- burying `Projects` list ownership rules inside Project Sites-only docs
- documenting admin/provisioning overlap only in phase-plan prose

## Recommended doc update order

1. subset README + system/resource/data map
2. source-of-truth/ownership table
3. Project Sites wording correction
4. Admin auth/packaging clarification
5. current-state-map pointer update
