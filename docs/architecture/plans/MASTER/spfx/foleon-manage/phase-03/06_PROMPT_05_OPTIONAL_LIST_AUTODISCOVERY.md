# Prompt 05 — Optional Foleon List Auto-Discovery Follow-Up

You are working in the live `RMF112018/hb-intel` repository on `main`.

Do not re-read files that are already within your current context or memory unless verifying a specific line, contradiction, or diff.

## Objective

Evaluate and, only if approved by evidence and design fit, implement controlled SharePoint list GUID auto-discovery for the Foleon webpart to reduce manual configuration burden.

This is optional. Execute only after Prompts 01–04 are complete and the manual GUID configuration path has been proven.

## Why This Exists

The current architecture requires admins to manually capture and configure list GUIDs even though the package provisions lists with known internal URLs:

```text
Lists/HB_FoleonContentRegistry
Lists/HB_FoleonHomepagePlacements
Lists/HB_FoleonInteractionEvents
Lists/HB_FoleonSyncRuns
```

Manual GUID wiring is operationally fragile. Auto-discovery could improve first-run setup, but it must not hide tenant drift, ambiguous list state, or provisioning failures.

## Required Starting Commands

Run and record:

```bash
git status --short
git branch --show-current
git log -3 --oneline
rg "SPHttpClient|_api/web/lists|getbytitle|getByTitle|contentRegistryListId|placementsListId|eventsListId|resolveFoleonRuntimeContract|FoleonContentService|FoleonPlacementService" apps/hb-intel-foleon packages tools -n
```

## Required Files to Inspect

Inspect at minimum:

```text
apps/hb-intel-foleon/src/mount.tsx
apps/hb-intel-foleon/src/runtime/foleonRuntimeContract.ts
apps/hb-intel-foleon/src/services/FoleonContentService.ts
apps/hb-intel-foleon/src/services/FoleonPlacementService.ts
apps/hb-intel-foleon/src/services/FoleonEventSink.ts
apps/hb-intel-foleon/src/types/foleon-runtime.types.ts
apps/hb-intel-foleon/docs/provisioning.md
```

## Decision Gate

Before coding, return a short plan answering:

1. Should auto-discovery run before `resolveFoleonRuntimeContract()` or should the contract support a `pendingDiscovery` state?
2. Should discovery use list title or server-relative URL?
3. How will explicit property overrides remain authoritative?
4. How will ambiguous or missing lists fail clearly?
5. How will discovered GUIDs be cached, if at all?
6. How will this work without creating async render flicker or false red states?
7. Does this require SPFx context only, and how should mock mode behave?

Do not implement until these are answered.

## Recommended Design

### 1. Explicit config remains authoritative

If `contentRegistryListId`, `placementsListId`, or `eventsListId` are provided explicitly, do not override them.

### 2. Discover only by known list titles or URLs

Recommended list titles:

```text
HB_FoleonContentRegistry
HB_FoleonHomepagePlacements
HB_FoleonInteractionEvents
```

Optional backend/admin proof list:

```text
HB_FoleonSyncRuns
```

### 3. Fail clearly

If discovery fails:

- Add issue code such as:
  - `missing-content-registry-list-id`
  - `missing-placements-list-id`
  - or new specific codes:
    - `content-registry-list-discovery-failed`
    - `placements-list-discovery-failed`
    - `events-list-discovery-failed`

Do not silently fall back to mock data on SharePoint pages.

### 4. Preserve diagnostics

Runtime proof should distinguish:

```json
{
  "listBindingSource": {
    "contentRegistry": "explicit" | "discovered" | "missing",
    "placements": "explicit" | "discovered" | "missing",
    "events": "explicit" | "discovered" | "missing"
  }
}
```

Do not expose actual GUIDs unless already permitted by existing diagnostics posture.

### 5. Keep route-specific blocking

Highlights needs content registry and placements.

Manager likely needs content registry and placements. If it writes/reads events or sync proof, define exact requirements based on source.

Events may be optional for read-only display but should be required for production telemetry unless the product decision says otherwise.

## Required Tests

Add tests for:

1. Explicit GUIDs bypass discovery.
2. Missing GUIDs attempt discovery in SharePoint mode.
3. Discovery success produces `canInitialize: true`.
4. Discovery failure produces stable issue codes.
5. Mock mode does not attempt SharePoint discovery.
6. Diagnostics reports binding source without exposing raw GUIDs.

## Required Validation

Run:

```bash
pnpm --filter @hbc/spfx-hb-intel-foleon lint
pnpm --filter @hbc/spfx-hb-intel-foleon check-types
pnpm --filter @hbc/spfx-hb-intel-foleon test
pnpm --filter @hbc/spfx-hb-intel-foleon build
pnpm --filter @hbc/spfx-hb-intel-foleon schema:validate
npx tsx tools/build-spfx-package.ts --domain hb-intel-foleon
pnpm --filter @hbc/spfx-hb-intel-foleon package:proof
```

## Required Closure Report

Return:

1. Whether auto-discovery was implemented or rejected.
2. Decision rationale.
3. Files changed.
4. Discovery algorithm.
5. Explicit override behavior.
6. Diagnostics changes.
7. Tests/validation results.
8. Tenant validation steps.
