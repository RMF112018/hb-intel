# Phase 18 Wave 02 — Prompt 04 Closure

**Status:** Closed
**Closure date:** 2026-04-16
**Version change:** `hb-webparts` solution `1.0.0.303` → `1.0.0.304`
and feature `1f447e99-…` `1.0.0.277` → `1.0.0.304`. Publisher is
**not** bumped — this prompt is scoped to `hb-webparts` governance.

## What was drifted

`apps/hb-webparts/config/package-solution.json` carried a 26-version
delta:

```
solution.version   = 1.0.0.303
features[0].version = 1.0.0.277
```

The solution version had been bumped on every recent packaging
release while the feature version had stayed frozen. This adjacent
governance drift sat next to Publisher (`hb-publisher`), which keeps
solution and feature locked together at every release (currently
`1.0.0.67` for both). The drift did not break packaging — SharePoint
accepts arbitrary feature versions — but it muddied audits of which
feature SharePoint would treat as "the current version" vs what the
app catalog advertises.

## Why the split was not required

SPFx uses feature version to decide whether to run feature-scoped
upgrade actions on activation. That only matters when a feature has:

- `features[].assets` (site assets to provision), or
- `features[].elementManifests` (declarative CAML), or
- `features[].upgradeActions` (explicit upgrade steps), or
- a backing `sharepoint/solution/**` provisioning payload.

The `hb-webparts` feature declares none of these. It is a bare
registration alongside `skipFeatureDeployment: true`, so SharePoint
deploys the bundled web parts to the tenant app catalog without
running feature-activation upgrade semantics. The feature version
field is therefore cosmetic in this package — it does not drive any
runtime behavior. Publisher's config has the same shape, and
Publisher has always kept the two versions locked together.

## What changed

### `apps/hb-webparts/config/package-solution.json`

- `solution.version`: `1.0.0.303` → `1.0.0.304`.
- `features[0].version`: `1.0.0.277` → `1.0.0.304`.

No other fields changed. No ownership or provisioning surface was
added. Publisher's config is untouched.

## Verification — emitted package carries the normalized versions

Repackaged via `npx tsx tools/build-spfx-package.ts --domain hb-webparts`:

```
✅ hb-webparts.sppkg (3180.3 KB)
```

Extracted the emitted `.sppkg` and read the SharePoint metadata:

```
$ grep -oE 'Version="[^"]+"' AppManifest.xml | head -2
Version="16.0.0.0"        # SharePoint schema version
Version="1.0.0.304"       # solution version — normalized

$ grep -oE 'Version="[^"]+"' feature_1f447e99-….xml
Version="1.0.0.304"       # feature version — normalized
```

Both the App Manifest and the feature XML now carry `1.0.0.304`,
proving the normalized strategy is reflected in the deployed
artifact and not just the repo config.

## Publisher regression gate

`npx tsx tools/build-spfx-package.ts --domain hb-publisher` still
produces `hb-publisher.sppkg (355.1 KB)` with:

- Wave 02 Prompt 02 preflight green (Node 18 resolver + SPFx
  baselines).
- Wave 01 Prompt 02 package-truth proof — all four checks pass.
- Wave 01 Prompt 04 hosted-load proof — all four checks pass.

Publisher's config stayed on `1.0.0.67` (no bump). Publisher
ownership was not reintroduced into `hb-webparts`.

## Files changed

- `apps/hb-webparts/config/package-solution.json` — two version
  fields bumped in lockstep.
- `tools/spfx-shell/config/package-solution.json` — orchestrator-
  propagated version copy when `hb-webparts` packages.
- `docs/architecture/plans/MASTER/spfx/publisher/phase-18/wave-02/`
  — Prompt 04 source and Prompt 04 closure note.

## Governance forward

For future `hb-webparts` releases: bump both `solution.version` and
`features[0].version` in lockstep unless a deliberate upgrade-
actions change requires the feature version to move independently
(in which case document the upgrade model change in an ADR). This
matches the Publisher pattern and removes the drift vector going
forward.
