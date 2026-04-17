# Prompt 01 Audit Report — Runner and Homepage Seams

## 1. Objective and verdict

This audit confirms the implementation path for Phase-01 command-band provisioning and seeding.

### Runner reuse verdict

- Verdict: **yes**
- Decision: implement provisioning/extraction/seeding **inside the existing** `tools/pnp-runner-local/` footprint.
- Reason: the runner already provides the canonical HTTPS server contract, preflight pipeline, run-step lifecycle, durable artifact storage, evidence manifesting, and zip bundling required for this workflow.

### Schema alignment verdict

- Verdict: the codebase can implement `05-List-Schema-Priority-Actions-Band-Config.md` and `06-List-Schema-Priority-Actions-Band-Items.md` **as-is**.
- No migration is required in Prompt 01.
- Existing homepage code currently does not own these list descriptors yet; implementation in Prompt 02+ must introduce them without drifting field internal names/defaults/choices.

## 2. Files inspected

### Binding schema and phase controls

- `docs/architecture/plans/MASTER/spfx/command-band/phase-01/README.md`
- `docs/architecture/plans/MASTER/spfx/command-band/phase-01/05-List-Schema-Priority-Actions-Band-Config.md`
- `docs/architecture/plans/MASTER/spfx/command-band/phase-01/06-List-Schema-Priority-Actions-Band-Items.md`
- `docs/architecture/plans/MASTER/spfx/command-band/phase-01/Prompt-01_Audit-Runner-And-Homepage-Seams.md`
- `docs/architecture/plans/MASTER/spfx/command-band/phase-01/Prompt-02_Extend-Runner-For-Provisioning-And-Extraction.md`
- `docs/architecture/plans/MASTER/spfx/command-band/phase-01/Prompt-03_Provision-Lists-And-Seed-From-QuickLinks.md`
- `docs/architecture/plans/MASTER/spfx/command-band/phase-01/Prompt-04_Update-SharePoint-List-Documentation.md`
- `docs/architecture/plans/MASTER/spfx/command-band/phase-01/Prompt-05_Final-Validation-And-Closure.md`

### Runner contract, execution, and bridge seams

- `tools/pnp-runner-local/package.json`
- `tools/pnp-runner-local/src/types.ts`
- `tools/pnp-runner-local/src/actionCatalog.ts`
- `tools/pnp-runner-local/src/preflight.ts`
- `tools/pnp-runner-local/src/runService.ts`
- `tools/pnp-runner-local/src/powershell.ts`
- `tools/pnp-runner-local/src/server.ts`
- `tools/pnp-runner-local/src/config.ts`
- `tools/pnp-runner-local/src/index.ts`
- `tools/pnp-runner-local/scripts/invoke-pnp-extraction.ps1`
- `tools/pnp-runner-local/tests/actionCatalog.test.ts`
- `tools/pnp-runner-local/tests/runService.test.ts`
- `tools/pnp-runner-local/tests/serverAuth.test.ts`

### Homepage seams and reference list-backed pattern

- `apps/hb-webparts/src/homepage/webparts/utilityContracts.ts`
- `apps/hb-webparts/src/homepage/helpers/utilityConfig.ts`
- `apps/hb-webparts/src/webparts/priorityActionsRail/PriorityActionsRail.tsx`
- `apps/hb-webparts/src/homepage/data/heroBannerListDescriptor.ts`
- `apps/hb-webparts/src/homepage/data/heroBannerListSource.ts`
- `apps/hb-webparts/src/homepage/data/heroBannerListWriter.ts`
- `apps/hb-webparts/src/homepage/data/toolLauncherListSource.ts`
- `apps/hb-webparts/src/homepage/data/toolLauncherNormalization.ts`
- `apps/hb-webparts/src/homepage/data/useToolLauncherData.ts`
- `apps/hb-webparts/src/webparts/pnp/pnpOpsActionCatalog.ts`
- `apps/hb-webparts/src/webparts/pnp/pnpOpsClient.ts`
- `apps/hb-webparts/src/webparts/pnp/pnpOpsRunnerClient.ts`

### Documentation surfaces

- `docs/reference/sharepoint/list-schemas/hbcentral/README.md`
- `docs/reference/sharepoint/list-schemas/hbcentral/List-Map.md`
- `docs/reference/sharepoint/list-schemas/hbcentral/List-Extraction-Rules.md`
- `docs/reference/sharepoint/list-schemas/hbcentral/lists/hero-banner-config.md`

### Governing reference docs used for routing and verification posture

- `docs/reference/developer/agent-authority-map.md`
- `docs/reference/developer/verification-commands.md`
- `docs/reference/developer/documentation-authoring-standard.md`
- `docs/architecture/plans/MASTER/spfx/pnp/phase-02/Prompt-01_PnpOps-Runner-Contract-Lock.md`
- `docs/architecture/plans/MASTER/spfx/pnp/phase-02/Prompt-03_PnpOps-Local-Runner-Setup-Guide.md`

## 3. Gap register and viable path

## A. Runner reuse viability

- Reusable as-is:
  - HTTPS server and route contract (`/actions`, `/preflight`, `/runs`, `/runs/{id}`, `/runs/{id}/evidence`, artifact download).
  - Run lifecycle and evidence packaging in `runService`.
  - Storage workspace and manifest/bundle generation.
  - Preflight shell + module checks and SharePoint URL validation.
- Required extension:
  - Add new canonical action keys for provisioning, quick links extraction, and seeding.
  - Expand action descriptor and preflight intent model beyond current extraction-only posture.
  - Extend PowerShell bridge from extraction-only switch cases to mixed extraction/provisioning operations.
  - Preserve existing artifact model but include provision and seed summaries.
- Safety/refactor need:
  - Bridge can be extended safely in place by introducing action-specific workflow functions and shared field schema declarations; no blocking refactor required first.

## B. Authentication posture

- `tools/pnp-runner-local/src/config.ts` already defaults `PNP_RUNNER_AUTH_MODE` to `DeviceLogin` unless explicitly set to `Interactive`.
- `invoke-pnp-extraction.ps1` already branches to `Connect-PnPOnline -DeviceLogin` and passes `ClientId` and `Tenant`.
- Required local env posture for execution:
  - `PNP_RUNNER_CERT_PATH`, `PNP_RUNNER_KEY_PATH`, `PNP_RUNNER_ALLOWED_ORIGINS`, runner host/port settings.
  - Optional API key only when non-loopback mode is enabled.
- No hard blocker found in repo code for Device Login based provisioning/extraction path.

## C. Homepage extraction seam

- Existing runner includes `page-layout` and `page-webpart-inventory` extraction seams over `Site Pages` and `CanvasContent1`, including webpart ID capture.
- For this phase, Quick Links extraction must parse homepage page canvas/control payload, identify the live Quick Links instance, then normalize links.
- Reliable extraction targets from source payload:
  - title/text
  - URL
  - order/index (from link sequence)
- Not reliably guaranteed from Quick Links source alone:
  - explicit group labels
  - icon keys compatible with command-band schema
  - badge metadata
  - explicit open-in-new-tab flag for each link in all variants
- Therefore broader page/webpart config parsing is required, with deterministic defaults for missing dimensions.

## D. Data-model mapping seam (Quick Links → Priority Actions Band Items)

- Canonical item mapping is feasible with deterministic defaults:
  - `Title` from link title
  - `Href` from link URL
  - `SortOrder` from source sequence (or deterministic fallback)
  - `ActionKey` deterministic slug from title/url (stable across reruns)
  - `BandKey=homepage-primary`
  - `ItemStatus=Enabled`
  - `BadgeVariant=neutral`
  - `Priority=primary`
  - `MobilePriority=100`
  - `AudienceMode=all`
  - device visibility defaults all `Yes`
  - schedule fields blank
  - notes blank
  - grouping/icon/badge label blank unless source provides real values
  - `IsExternal` inferred from URL
  - `OpenInNewTab` inferred when possible, otherwise deterministic default aligned to config (`OpenExternalInNewTabByDefault=Yes`)
- Repo-truth mismatch found:
  - current `PriorityActionsRail` runtime uses prop-driven config model (`actions/groups/maxItems`) and is not yet bound to list descriptors matching the new schema.
  - this is an expected implementation gap, not a schema conflict requiring migration in Prompt 01.

## E. Documentation seam

- Hbcentral list-schema docs currently include existing list reports and index/map files, but do not include the two new command-band list docs yet.
- Required additions/updates:
  - add list references for `Priority Actions Band Config` and `Priority Actions Band Items` under `docs/reference/sharepoint/list-schemas/hbcentral/lists/`.
  - update `docs/reference/sharepoint/list-schemas/hbcentral/README.md` inventory and usage notes.
  - update `docs/reference/sharepoint/list-schemas/hbcentral/List-Map.md` relationship map and key matrix entries.
  - keep extraction/provenance guidance aligned in `List-Extraction-Rules.md` if workflow details change materially.

## 4. Exact required changes by next prompts

## Prompt 02 required implementation tasks

- Extend `tools/pnp-runner-local/src/types.ts`:
  - add provisioning/seeding action keys.
  - expand action descriptor typing for non-read-only actions.
  - extend execution intent typing beyond `read-only-export`.
- Extend `tools/pnp-runner-local/src/actionCatalog.ts`:
  - register new actions with required input and expected artifacts.
  - add action aliases if needed.
- Extend `tools/pnp-runner-local/src/preflight.ts`:
  - validate execution intent per action class.
  - keep existing PowerShell/PnP/storage checks.
- Extend `tools/pnp-runner-local/src/runService.ts`:
  - keep 6-step run/evidence pipeline.
  - route provisioning/seeding actions through bridge while preserving artifact generation.
- Extend bridge script (`tools/pnp-runner-local/scripts/invoke-pnp-extraction.ps1`) to:
  - provision/normalize both lists per binding schemas.
  - extract homepage Quick Links configuration.
  - normalize extraction payload for seeding.
  - seed config row and items idempotently.
  - emit summaries consumed by manifest/bundle evidence model.
- Update runner tests (`tools/pnp-runner-local/tests/**`) for:
  - new action catalog expectations.
  - run-service success path with new outputs.
  - any preflight intent rule changes.

## Prompt 03 required implementation tasks

- Execute runner actions live against `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral` using Device Login.
- Provision exact field contracts for:
  - `Priority Actions Band Config`
  - `Priority Actions Band Items`
- Seed canonical config row for `BandKey=homepage-primary` with binding defaults.
- Extract homepage Quick Links and seed items with deterministic defaults + idempotent upsert behavior.
- Produce committed provisioning report containing:
  - extracted count,
  - seeded count,
  - mismatch explanation if any,
  - rerun/idempotency outcome.

## Prompt 04 required documentation tasks

- Create:
  - `docs/reference/sharepoint/list-schemas/hbcentral/lists/priority-actions-band-config.md`
  - `docs/reference/sharepoint/list-schemas/hbcentral/lists/priority-actions-band-items.md`
- Update:
  - `docs/reference/sharepoint/list-schemas/hbcentral/README.md`
  - `docs/reference/sharepoint/list-schemas/hbcentral/List-Map.md`
- Include full field-level contracts and runtime/provisioning/seed provenance.

## Prompt 05 required closure tasks

- Validate runner integrity and touched tests/typecheck.
- Validate live schema/result fidelity against binding schema docs.
- Validate extraction-to-seed fidelity.
- Validate doc completeness/discoverability.
- Commit final closure report in phase-01 folder with explicit command/output evidence and residual risk statement.

## 5. Quick Links extraction and seeding defaults lock

- Extraction source: live HBCentral homepage modern page configuration (`Site Pages` canvas/control payload), not static repo configuration.
- Seed defaults are deterministic and must be recorded in seed summary:
  - `ActionDescription`, `IconKey`, `BadgeLabel`, `GroupKey`, `GroupTitle`, `StartsAtUtc`, `EndsAtUtc`, `AdminNotes` => blank unless real source data exists.
  - `BadgeVariant=neutral`
  - `Priority=primary`
  - `OverflowOnly=No`
  - `MobilePriority=100`
  - `AudienceMode=all`
  - `AudienceKeys=blank`
  - all device visibility fields `Yes`
  - `IsExternal` inferred
  - `OpenInNewTab` inferred when available; otherwise deterministic fallback aligned to config default behavior.

## 6. Prompt 01 closure statement

- Ambiguity is resolved for:
  - runner extension shape,
  - Device Login path,
  - live homepage extraction seam,
  - canonical schema mapping and defaults,
  - required documentation surfaces.
- Provisioning remains intentionally unimplemented in Prompt 01, per prompt constraint.
