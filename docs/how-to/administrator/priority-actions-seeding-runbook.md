# Priority Actions Seeding Runbook

## 1. Purpose
Use this runbook to choose and execute the correct Priority Actions seed model for HBCentral.

Target site: `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`

Runner seam: `tools/pnp-runner-local/`

## 2. Two Seed Models (Not Interchangeable)

### Extraction/parity seed (Quick Links source)
Use when you need list rows to mirror current homepage Quick Links behavior.

- `sharepoint-control:provisioning:priority-actions-band-seed-items`
- `sharepoint-control:provisioning:priority-actions-band-provision-and-seed`

Characteristics:
- source is homepage Quick Links extraction
- item keys are generated from title+href
- missing extracted rows may be archived by parity policy

### Curated base-catalog seed (repo-owned research payload)
Use when you need the governed baseline catalog and profile set.

- `sharepoint-control:provisioning:priority-actions-band-seed-curated`
- `sharepoint-control:provisioning:priority-actions-band-provision-and-seed-curated`

Characteristics:
- source is `tools/pnp-runner-local/seeds/hbcentral/priority-actions-research-seed.json`
- config identity: `BandKey + Title`
- item identity: `BandKey + ActionKey`
- archive is non-destructive for unknown/manual rows outside curated managed key set
- fails loudly if unknown active+enabled `homepage-primary` config rows conflict with curated active-row posture

## 3. Device-Login Execution
1. Start runner with HTTPS cert/key and local storage:
   - `PNP_RUNNER_CERT_PATH=<cert.pem> PNP_RUNNER_KEY_PATH=<key.pem> PNP_RUNNER_STORAGE_DIR=<dir> pnpm --filter @hbc/pnp-runner-local start`
2. Launch action through runner API (`POST /runs`) or mapped admin/operator surface.
3. Complete device-login in browser when code prompt appears.
4. Poll run status (`GET /runs/<runId>`) until `Completed` or `Failed`.

## 4. Post-Run Artifact Checks
Inspect these artifacts from `GET /runs/<runId>/evidence`:
- `summary.md`
- `raw.json`
- `normalized.json`
- `seed-summary.json`
- `provision-summary.json`

For curated runs, verify in `seed-summary.json`:
- `seedSource = curated`
- `seedDefinitionPath` points at repo seed JSON
- `configRowsWritten`, `itemRowsWritten`, `managedActionKeys`
- `conflictingUnknownActiveConfigRows` is empty
- `validationFailures` is empty
- `skippedUnmanagedRows` is informational only (no destructive mutation)

## 5. Prompt-02 Validated Evidence Snapshot
- Date: 2026-04-18
- Run id: `f671390c-bc35-46b0-9937-da9b77b1ac94`
- Action: `sharepoint-control:provisioning:priority-actions-band-provision-and-seed-curated`
- Auth mode: DeviceLogin
- Outcome:
  - 3 curated config profiles present (`Homepage Priority Actions`, `... - Compact`, `... - Guided`)
  - 10 curated item keys present
  - exactly one active+enabled `homepage-primary` config row
  - no managed/unmanaged destructive drift

Validation artifacts used in Prompt-02:
- `/tmp/p05p2-summary.md`
- `/tmp/p05p2-raw.json`
- `/tmp/p05p2-normalized.json`
- `/tmp/p05p2-seed-summary.json`
- `/tmp/p05p2-live-validation.json`
- `/tmp/p05p2-validation-report.json`
