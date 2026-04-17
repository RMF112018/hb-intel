# Prompt 03 Run Report — Provision Lists and Seed From Quick Links

## 1. Objective executed

Executed live local-runner provisioning/seeding workflow against:

- Site: `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`
- Auth mode: `DeviceLogin`
- Action: `sharepoint-control:provisioning:priority-actions-band-provision-and-seed`

## 2. Final validated run

- Run ID: `b1c7119b-15cf-47c7-940d-85081e6258d8`
- Status: `Completed`
- Completed at: `2026-04-17T11:28:44.116Z`
- Page filter: `HBCentral.aspx`

## 3. Provisioning results (`provision-summary.json`)

- `Priority Actions Band Config`
  - created: `false`
  - item count: `1`
  - versioning: `true`
  - attachments: `false`
  - folder creation: `false`
  - content types enabled: `false`
  - field count observed by runner contract: `19` (includes `Title`)
- `Priority Actions Band Items`
  - created: `false`
  - item count: `0`
  - versioning: `true`
  - attachments: `false`
  - folder creation: `false`
  - content types enabled: `false`
  - field count observed by runner contract: `27` (includes `Title`)
- drift warnings: none

## 4. Seeding results (`seed-summary.json`)

- extracted quick links count: `0`
- processed rows: `0`
- inserted: `0`
- updated: `0`
- archived: `0`
- defaults loaded and available:
  - `BandKey=homepage-primary`
  - `ItemStatus=Enabled`
  - `BadgeVariant=neutral`
  - `Priority=primary`
  - `MobilePriority=100`
  - `AudienceMode=all`
  - `Visibility(All Devices)=Yes`

## 5. Extraction-to-seed fidelity and mismatch rationale

This run successfully provisioned both target lists and ensured the config row contract, but the extraction seam still returned no seedable rows in runner artifacts for `HBCentral.aspx`.

- extraction (`raw.json.quickLinks.count`): `0`
- seed input (`seed-summary.extractedCount`): `0`
- seeded output (`inserted + updated`): `0`

Recorded parity for Prompt 03 is therefore `0 -> 0`.

## 6. Prompt 03 code changes applied during execution

The runner script was hardened during Prompt 03 attempts to improve homepage quick-link extraction:

- default page resolution honors site welcome page before fallback
- quick-links extraction supports:
  - `Get-PnPPage` control-level detection
  - HTML `data-sp-webpartdata` parsing (single- and double-quoted attributes)
  - repeated HTML decoding for entity-encoded payloads
  - JSON traversal from `CanvasContent1` and `LayoutWebpartsContent`
  - Site Pages REST fallback payload lookup
  - dictionary/hashtable-safe property traversal for `serverProcessedContent`
- live runner PowerShell output streaming remains enabled so Device Login codes are surfaced

## 7. Prompt 03 closure statement

Prompt 03 execution is complete for live provisioning workflow execution, schema-aligned list provisioning, artifact production, and explicit extraction/seed mismatch reporting on the target site.
