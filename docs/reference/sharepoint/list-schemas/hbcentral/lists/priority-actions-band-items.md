# Priority Actions Band Items

## 1. Objective
- Canonical schema reference for command-band item rows used by homepage Priority Actions.
- Site: `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`.
- Contract authority: phase-01 binding schema (`06-List-Schema-Priority-Actions-Band-Items.md`) plus runner provisioning/seed contract in `tools/pnp-runner-local/scripts/invoke-pnp-extraction.ps1`.

## 2. List-Level Metadata
- List title: `Priority Actions Band Items`
- URL: `/sites/HBCentral/Lists/Priority Actions Band Items/AllItems.aspx`
- Template: Generic list (`BaseTemplate=100`)
- Attachments: `false`
- Folder creation: `false`
- Versioning: `true`
- Content types enabled: `false`
- Operational join key: `BandKey`
- Stable per-item key: `ActionKey`

## 3. Runtime Ownership and Consumption
- Provisioning owner: local PnP runner action `sharepoint-control:provisioning:priority-actions-band-lists`.
- Seed owner: local PnP runner actions:
  - extraction/parity seed:
    - `sharepoint-control:provisioning:priority-actions-band-seed-items`
    - `sharepoint-control:provisioning:priority-actions-band-provision-and-seed`
  - curated base-catalog seed:
    - `sharepoint-control:provisioning:priority-actions-band-seed-curated`
    - `sharepoint-control:provisioning:priority-actions-band-provision-and-seed-curated`
- Source provenance intents:
  - extraction/parity source: homepage Quick Links payload (`HBCentral.aspx`)
  - curated source: `tools/pnp-runner-local/seeds/hbcentral/priority-actions-research-seed.json`
- Public runtime seam intent: `PriorityActionsRail` consumes normalized enabled rows for rendering and overflow behavior.
- Current repo status: list contract, seed pipeline, and public list-read adapter are all live. `fetchPriorityActionsItems` (see `apps/hb-webparts/src/homepage/data/priorityActionsItemsListSource.ts`) is consumed by `usePriorityActionsData` and feeds the live `PriorityActionsRail`.

## 4. Field Schema

| Display Name | Internal Name | Type | Required | Indexed | Default | Choices | Semantic Purpose |
|---|---|---|---:|---:|---|---|---|
| Action Title | `Title` | Single line of text | Yes | No | blank |  | Public action label. |
| Band Key | `BandKey` | Single line of text | Yes | Yes | `homepage-primary` |  | Joins item to active config row. |
| Action Key | `ActionKey` | Single line of text | Yes | Yes | blank |  | Stable app-level identifier for idempotent upsert and runtime lookup. |
| Item Status | `ItemStatus` | Choice | Yes | Yes | `Enabled` | `Enabled`, `Disabled`, `Archived` | Publication state and render gate. |
| Action Description | `ActionDescription` | Multiple lines of text (plain) | No | No | blank |  | Optional supporting text for admin/runtime contexts. |
| Href | `Href` | Single line of text | Yes | No | blank |  | Canonical navigation target URL. |
| Icon Key | `IconKey` | Single line of text | No | No | blank |  | Optional icon registry key. |
| Badge Label | `BadgeLabel` | Single line of text | No | No | blank |  | Optional badge text. |
| Badge Variant | `BadgeVariant` | Choice | Yes | No | `neutral` | `neutral`, `info`, `warning`, `success`, `critical` | Visual badge style variant. |
| Priority | `Priority` | Choice | Yes | No | `primary` | `primary`, `secondary`, `overflow` | Primary/secondary/overflow treatment intent. |
| Group Key | `GroupKey` | Single line of text | No | No | blank |  | Optional grouping key. |
| Group Title | `GroupTitle` | Single line of text | No | No | blank |  | Optional grouping label. |
| Sort Order | `SortOrder` | Number (integer) | Yes | Yes | `100` |  | Deterministic order for rendering. |
| Overflow Only | `OverflowOnly` | Yes/No | Yes | No | `No` |  | Forces item into overflow treatment. |
| Mobile Priority | `MobilePriority` | Number (integer) | No | No | `100` |  | Tie-break ordering for phone layouts. |
| Audience Mode | `AudienceMode` | Choice | Yes | No | `all` | `all`, `include-only`, `exclude`, `role-driven` | Audience evaluation strategy. |
| Audience Keys | `AudienceKeys` | Multiple lines of text (plain) | No | No | blank |  | Newline-delimited audience key payload. |
| Is External | `IsExternal` | Yes/No | Yes | No | `No` |  | Explicit external-link marker. |
| Open In New Tab | `OpenInNewTab` | Yes/No | Yes | No | `No` |  | Item-level target behavior. |
| Visible Desktop | `VisibleDesktop` | Yes/No | Yes | No | `Yes` |  | Desktop visibility gate. |
| Visible Laptop | `VisibleLaptop` | Yes/No | Yes | No | `Yes` |  | Laptop visibility gate. |
| Visible Tablet Landscape | `VisibleTabletLandscape` | Yes/No | Yes | No | `Yes` |  | Tablet landscape visibility gate. |
| Visible Tablet Portrait | `VisibleTabletPortrait` | Yes/No | Yes | No | `Yes` |  | Tablet portrait visibility gate. |
| Visible Phone | `VisiblePhone` | Yes/No | Yes | No | `Yes` |  | Phone visibility gate. |
| Starts At UTC | `StartsAtUtc` | Date and time | No | Yes | blank |  | Optional scheduled visibility start (UTC). |
| Ends At UTC | `EndsAtUtc` | Date and time | No | Yes | blank |  | Optional scheduled visibility end (UTC). |
| Admin Notes | `AdminNotes` | Multiple lines of text (plain) | No | No | blank |  | Maintainer-only notes; not public UI content. |

## 5. Normalization and Visibility Intent
- Runtime normalization is expected to:
  - trim string inputs
  - normalize `AudienceKeys` into key arrays
  - enforce status/schedule/device visibility gates
  - honor `OverflowOnly=true` regardless of base priority
  - apply deterministic sort by `SortOrder` then stable key
- Public rendering is intended to include only `ItemStatus=Enabled` rows that pass schedule, audience, and device gates.

## 6. Provisioning and Seed Provenance
- List contract is provisioned idempotently by the local runner PowerShell bridge.
- Extraction/parity seed source intent is homepage Quick Links directly below the signature hero on `HBCentral.aspx`.
- Curated seed source intent is repo-owned research payload with explicit action keys and grouped metadata.
- Deterministic defaults applied by seed workflow when source payload omits command-band-specific metadata:
  - `BandKey=homepage-primary`
  - `ItemStatus=Enabled`
  - `BadgeVariant=neutral`
  - `Priority=primary`
  - `MobilePriority=100`
  - `AudienceMode=all`
  - device visibility defaults all `Yes`
- Identity/upsert rules:
  - extraction/parity path uses generated deterministic action keys from title+href
  - curated path uses explicit short action keys from payload
  - curated reconcile key is `BandKey + ActionKey`

## 7. Idempotency and Safe Reruns
- Reruns reconcile by `BandKey + ActionKey` and update existing rows instead of creating duplicates.
- Extraction/parity seed may archive rows absent from current extracted Quick Links source.
- Curated seed archive is non-destructive by default:
  - archive only rows whose `ActionKey` belongs to curated managed key set and is absent from current curated payload
  - do not mutate/archive rows outside curated managed key set
- Expected curated rerun posture: deterministic, repeatable catalog state with stable explicit keys.

## 8. Prompt-02 Validation Evidence (2026-04-18)
- Validated run id: `f671390c-bc35-46b0-9937-da9b77b1ac94`
- Action: `sharepoint-control:provisioning:priority-actions-band-provision-and-seed-curated`
- Device-login execution: pass
- Item result:
  - exactly 10 expected curated keys present
  - required identity/content fields match curated payload
  - defaults (`ItemStatus`, `BadgeVariant`, `Priority`, visibility, audience, schedule blanks) match expected posture
  - destructive-safety drift (rows outside managed key set): none
- Validation artifact references:
  - `/tmp/p05p2-seed-summary.json`
  - `/tmp/p05p2-live-validation.json`
  - `/tmp/p05p2-validation-report.json`

## 9. Maintenance Guidance
- Preferred long-term maintenance path: friendly admin UI (`PriorityActionsRailAdmin`) once available.
- Temporary caveat during pre-admin phase: direct SharePoint edits are possible but should preserve key stability (`ActionKey`) and visibility semantics.
- Avoid unmanaged key renames; `ActionKey` changes are contract changes and should be planned as migrations.
