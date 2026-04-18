# Priority Actions Research-and-Seeding Prompt Package

## Purpose
This package executes the attached objective by turning the researched findings into an implementation-ready prompt set for a local code agent. It is designed to seed `Priority Actions Band Items` and `Priority Actions Band Config` on the HBCentral site through the existing repo-owned tooling seams, while preserving idempotency and avoiding speculative field population.

## What this package assumes
- Target site: `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`
- Canonical initial band: `homepage-primary`
- Existing repo runner seam: `tools/pnp-runner-local/`
- Existing authoritative PowerShell bridge: `tools/pnp-runner-local/scripts/invoke-pnp-extraction.ps1`
- Existing public/admin runtime contracts live in `apps/hb-webparts/src/homepage/data/**` and `apps/hb-webparts/src/webparts/**`

## What was researched
1. The attached list schema/package files, including:
   - `README.md`
   - `List-Map.md`
   - `List-Extraction-Rules.md`
   - `priority-actions-band-config.md`
   - `priority-actions-band-items.md`
2. The live `RMF112018/hb-intel` repo seams that actually provision, read, normalize, validate, and write Priority Actions data.
3. Public official/help sources for each required action target to determine:
   - canonical title,
   - correct launch URL to preserve or refine,
   - external vs internal behavior,
   - likely new-tab posture,
   - safe description language,
   - and where values should intentionally remain blank/defaulted.

## Most important repo-truth conclusions
- The existing local runner already provisions both lists and already seeds items from homepage Quick Links, but that seed path only writes a minimal item model: no descriptions, no grouping metadata, no icons, no badges, and only one default config row.
- The public runtime and admin runtime both fully support richer seeded data, including:
  - `ActionDescription`
  - `GroupKey` / `GroupTitle`
  - `AudienceMode` / `AudienceKeys`
  - schedule windows
  - device visibility flags
  - layout-mode and per-breakpoint config caps
- Validation rules already exist for:
  - duplicate active config rows for the same band,
  - missing title / href / action key,
  - invalid date windows,
  - invalid icon keys,
  - inconsistent group metadata,
  - inconsistent audience mode,
  - and non-increasing breakpoint caps.

## Package file map
- `README.md` — this file
- `Plan-Summary.md` — recommended implementation strategy and acceptance posture
- `Research-Confidence-Matrix.md` — field-level recommended values and confidence by action target
- `Config-Options-Matrix.md` — the 3 recommended config rows
- `Seed-Data-Appendix.md` — exact proposed config/item payloads for implementation
- `Prompt-01_Implement-Research-Backed-Priority-Actions-Seeding.md`
- `Prompt-02_Run-Device-Login-Seeding-and-Validate.md`
- `Prompt-03_Refresh-Docs-and-Capture-Evidence.md`

## Recommended execution order
1. Execute `Prompt-01_Implement-Research-Backed-Priority-Actions-Seeding.md`
2. Execute `Prompt-02_Run-Device-Login-Seeding-and-Validate.md`
3. Execute `Prompt-03_Refresh-Docs-and-Capture-Evidence.md`

## Prompt-02 execution evidence (2026-04-18)
- Validated run id: `f671390c-bc35-46b0-9937-da9b77b1ac94`
- Action: `sharepoint-control:provisioning:priority-actions-band-provision-and-seed-curated`
- Auth mode: DeviceLogin
- Outcome summary:
  - config profiles written: 3 (`Homepage Priority Actions`, `... - Compact`, `... - Guided`)
  - curated items written: 10
  - conflicts: none (`conflictingUnknownActiveConfigRows=[]`)
  - destructive drift outside managed set: none

## Why this package does not just reuse the current Quick Links seed as-is
The current runner seed path is intentionally narrow: it extracts Quick Links and writes a minimal action model. That is appropriate for parity cutover, but not for a curated, research-backed base action catalog. This package therefore instructs the code agent to keep the existing extraction-based seed path intact, while adding a non-destructive curated seed path through the same tool family.

## Safety / idempotency posture
- Items should be reconciled by `BandKey + ActionKey`.
- Config rows should be reconciled by `BandKey + Title` for the 3 seeded profile rows.
- The curated seed path should be **upsert-first and non-destructive by default**.
- Unknown manually-authored rows should not be archived just because they are absent from the curated payload.
- Validation should fail loudly on conflicting active `homepage-primary` config rows rather than auto-mutating unknown rows.

## Code-agent directive
Every prompt in this package includes the required directive:

**Do not re-read files that are already in your current context or memory unless needed to resolve uncertainty or verify drift.**
