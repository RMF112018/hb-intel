# Priority Actions Band Config

## 1. Objective
- Canonical schema reference for the command-band configuration list backing homepage Priority Actions behavior.
- Site: `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`.
- Contract authority: phase-01 binding schema (`05-List-Schema-Priority-Actions-Band-Config.md`) plus runner provisioning contract in `tools/pnp-runner-local/scripts/invoke-pnp-extraction.ps1`.

## 2. List-Level Metadata
- List title: `Priority Actions Band Config`
- URL: `/sites/HBCentral/Lists/Priority Actions Band Config/AllItems.aspx`
- Template: Generic list (`BaseTemplate=100`)
- Attachments: `false`
- Folder creation: `false`
- Versioning: `true`
- Content types enabled: `false`
- Operating posture: one active config row per `BandKey`
- Initial seeded canonical row: `BandKey=homepage-primary`

## 3. Runtime Ownership and Consumption
- Provisioning owner: local PnP runner action `sharepoint-control:provisioning:priority-actions-band-lists`.
- Seed/orchestration owner: local PnP runner actions:
  - extraction/parity seed:
    - `sharepoint-control:provisioning:priority-actions-band-seed-items`
    - `sharepoint-control:provisioning:priority-actions-band-provision-and-seed`
  - curated base-catalog seed:
    - `sharepoint-control:provisioning:priority-actions-band-seed-curated`
    - `sharepoint-control:provisioning:priority-actions-band-provision-and-seed-curated`
- Public runtime seam intent: `PriorityActionsRail` consumes normalized config row for active band rendering policy.
- Current repo status: list is provisioned, schema-governed, and the public list-read adapter is live. `fetchPriorityActionsConfig` (see `apps/hb-webparts/src/homepage/data/priorityActionsConfigListSource.ts`) is consumed by `usePriorityActionsData` to resolve the active band config row.

## 4. Active Row Resolution Rule
Runtime/admin resolution order is expected to remain:
1. `BandKey` exact match
2. `Enabled = true`
3. `IsActive = true`
4. newest `Modified`
5. highest `ID`

Admin workflows must still treat duplicate active rows for the same `BandKey` as invalid.

## 5. Field Schema

| Display Name | Internal Name | Type | Required | Indexed | Default | Choices | Semantic Purpose |
|---|---|---|---:|---:|---|---|---|
| Config Name | `Title` | Single line of text | Yes | No | `Homepage Priority Actions` |  | Human-readable config row name. |
| Band Key | `BandKey` | Single line of text | Yes | Yes | `homepage-primary` |  | Stable band identifier and join key to items list. |
| Enabled | `Enabled` | Yes/No | Yes | Yes | `Yes` |  | Global on/off gate for this config row. |
| Is Active | `IsActive` | Yes/No | Yes | Yes | `Yes` |  | Marks canonical active row for a band. |
| Heading Text | `HeadingText` | Single line of text | No | No | blank |  | Optional visible command-band heading text. |
| Overflow Label | `OverflowLabel` | Single line of text | Yes | No | `More tools` |  | Label for overflow affordance. |
| Show Heading | `ShowHeading` | Yes/No | Yes | No | `No` |  | Enables/disables heading rendering. |
| Sticky After Hero | `StickyAfterHero` | Yes/No | Yes | No | `No` |  | Controls sticky behavior after signature hero. |
| Show Badges | `ShowBadges` | Yes/No | Yes | No | `Yes` |  | Global badge-render toggle. |
| Desktop Layout Mode | `DesktopLayoutMode` | Choice | Yes | No | `rail` | `rail`, `segmented`, `hybrid` | Desktop presentation mode. |
| Tablet Layout Mode | `TabletLayoutMode` | Choice | Yes | No | `grid` | `grid`, `rail`, `hybrid` | Tablet presentation mode. |
| Mobile Layout Mode | `MobileLayoutMode` | Choice | Yes | No | `sheet-trigger` | `grid`, `scroll`, `sheet-trigger` | Phone presentation mode. |
| Max Visible Desktop | `MaxVisibleDesktop` | Number (integer) | Yes | No | `5` |  | Visible item cap for desktop width. |
| Max Visible Laptop | `MaxVisibleLaptop` | Number (integer) | Yes | No | `5` |  | Visible item cap for laptop width. |
| Max Visible Tablet Landscape | `MaxVisibleTabletLandscape` | Number (integer) | Yes | No | `4` |  | Visible item cap for tablet landscape. |
| Max Visible Tablet Portrait | `MaxVisibleTabletPortrait` | Number (integer) | Yes | No | `4` |  | Visible item cap for tablet portrait. |
| Max Visible Phone | `MaxVisiblePhone` | Number (integer) | Yes | No | `4` |  | Visible item cap for phone. |
| Open External In New Tab By Default | `OpenExternalInNewTabByDefault` | Yes/No | Yes | No | `Yes` |  | Default launch target behavior for external links. |
| Admin Notes | `AdminNotes` | Multiple lines of text (plain) | No | No | blank |  | Maintainer-only notes; not public UI content. |

## 6. Provisioning and Seed Provenance
- Provisioned through local runner PowerShell bridge: `tools/pnp-runner-local/scripts/invoke-pnp-extraction.ps1`.
- List settings and field contract are enforced idempotently on rerun.
- Two seed intents now exist and are not interchangeable:
  - extraction/parity seed intent: preserve homepage Quick Links parity and default single-row config posture
  - curated seed intent: upsert governed profile set from repo-owned payload and enforce explicit active-row posture for curated profiles
- Curated config-row identity:
  - reconcile by `BandKey + Title`
  - curated profiles are `Homepage Priority Actions`, `Homepage Priority Actions - Compact`, `Homepage Priority Actions - Guided`
  - curated run enforces `Homepage Priority Actions` as `Enabled=true` + `IsActive=true`; alternates are set `Enabled=false` + `IsActive=false`
- Curated conflict handling:
  - unknown rows are not auto-disabled
  - when unknown `homepage-primary` rows remain both active and enabled, curated run fails loudly and records conflicts in `seed-summary.json`

## 7. Idempotency and Safe Reruns
- Re-running provisioning actions does not create duplicate list definitions.
- Extraction/parity seed keeps the original quick-links parity behavior.
- Curated seed is deterministic by `BandKey + Title` for managed profiles.
- Curated seed preserves unknown/manual rows outside managed profile set and only fails when conflicting active unknown rows violate the single-active-row posture.

## 8. Prompt-02 Validation Evidence (2026-04-18)
- Validated run id: `f671390c-bc35-46b0-9937-da9b77b1ac94`
- Action: `sharepoint-control:provisioning:priority-actions-band-provision-and-seed-curated`
- Device-login execution: pass
- Config result:
  - exactly 3 expected `homepage-primary` profile rows present
  - only `Homepage Priority Actions` is active+enabled
  - conflicting unknown active rows: none
- Validation artifact references:
  - `/tmp/p05p2-seed-summary.json`
  - `/tmp/p05p2-live-validation.json`
  - `/tmp/p05p2-validation-report.json`

## 9. Maintenance Guidance
- Preferred long-term maintenance path: friendly admin surface (`PriorityActionsRailAdmin`) once delivered.
- Temporary caveat during pre-admin phase: edits may occur directly in SharePoint list UI, but must preserve this documented field contract and active-row rules.
- Avoid ad hoc internal-name changes; any schema migration must update runtime seams and this doc in the same change.
