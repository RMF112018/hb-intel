# 15 — Tenant Validation Runbook

## Purpose

Validate the Foleon preview fallback after deployment without mistaking sample content for live content.

## Preconditions

- Package has been built and deployed.
- Target site: `/sites/HBCentral`.
- Foleon webpart property pane has valid:
  - `contentRegistryListId`
  - `placementsListId`
  - `eventsListId`
  - `acceptedFoleonOrigins`
  - `expectedManifestId`
  - `expectedPackageVersion`
- Current expected version after implementation: `1.0.17.0`.

## Step 1 — Deploy package

1. Upload `dist/sppkg/hb-intel-foleon.sppkg` to tenant App Catalog.
2. Do not tenant-wide deploy if provisioning assets are present.
3. Add/update app on `/sites/HBCentral`.
4. Confirm webpart loads.

## Step 2 — Validate empty Highlights fallback

1. Ensure `HB_FoleonContentRegistry` has no `Published` + `IsVisible` + `IsHomepageEligible` records.
2. Ensure `HB_FoleonHomepagePlacements` has no active placement resolving to live published content.
3. Open Highlights route:
   - default route, or
   - `?foleonRoute=highlights`.
4. Expected:
   - visible preview/sample label;
   - sample cards shown;
   - no fake Foleon URL opens;
   - no error state;
   - no generic dead empty state.

## Step 3 — Validate empty Hub fallback

1. Open `?foleonRoute=hub`.
2. Expected:
   - visible archive preview/sample label;
   - sample archive/card layout shown;
   - no fake reader/external opens.

## Step 4 — Validate runtime proof

Run:

```js
JSON.stringify(window.__hbIntel_foleonRuntimeBindingProof, null, 2)
```

Expected:

- `packageVersion: "1.0.17.0"`
- `manifestId: "2160edb3-675e-4451-92bb-8345f9d1c71e"`
- `hostMode: "sharepoint"`
- `canInitialize: true`
- `issueCodes: []`
- list ID presence booleans true where configured
- preview fallback does not appear as a fake route or fake data condition

## Step 5 — Validate diagnostics flag

Open same page with:

```text
?foleon-diagnostics=1
```

Expected:

- healthy proof still has empty `issueCodes`;
- admin diagnostics are present only because query flag is set;
- no raw GUIDs or sensitive config values are exposed.

## Step 6 — Validate live content precedence

1. Add or sync one real Foleon content registry record:
   - `IsVisible = true`
   - `PublishStatus = Published`
   - `IsHomepageEligible = true`
   - valid `FoleonDocId`
   - title/summary/content type
   - valid URL fields consistent with reader gate
2. If using placements, add active placement pointing to the record or populate `ContentIdCache`.
3. Reload Highlights.
4. Expected:
   - live card appears;
   - preview fallback disappears.
5. Open Hub.
6. Expected:
   - live archive appears;
   - preview fallback disappears.

## Step 7 — Validate filter no-result distinction

1. With at least one live record present, open Hub.
2. Search a nonsense string.
3. Expected:
   - filter-specific empty state;
   - no full preview fallback.

## Step 8 — Validate action safety

In preview state:

- click/attempt sample card action;
- expected no navigation to reader;
- expected no external window;
- expected no console errors;
- expected no production content telemetry writes.

In live state:

- live cards still route/open per existing behavior.

## Step 9 — Validate Manager guidance

1. Open `?foleonRoute=manage`.
2. If registry is empty, expected optional admin guidance panel.
3. If registry has content, guidance should disappear or remain clearly non-blocking only if intentionally accepted.
4. Sync and placement workflows remain usable.

## Step 10 — Capture evidence

Save:

- screenshots of empty Highlights preview;
- screenshots of empty Hub preview;
- screenshots after live content precedence;
- runtime proof JSON;
- diagnostics proof JSON;
- console output;
- package proof output;
- commit SHA.

## Pass/fail criteria

Pass only when:

- preview appears in configured-empty states;
- preview disappears when live content exists;
- config defects still show diagnostics/errors;
- Reader gate is unchanged;
- production telemetry is not polluted by preview cards;
- package proof and runtime proof remain truthful.
