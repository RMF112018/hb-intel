# Prompt — Fix Invalid App Catalog Package Version for `hb-webparts` Proof Case

## Objective

Fix the SharePoint App Catalog upload failure for `hb-webparts.sppkg` by correcting the invalid solution/package version format, then rebuild the package.

The current upload is failing because the app manifest `Version` attribute is being emitted as `01.000.014`, which SharePoint rejects as invalid. The minimum correct fix is to change the package version format to a valid SharePoint app version string such as `1.0.0.14`.

This is a narrow packaging-metadata remediation only. Do not alter the proof-case loader-contract architecture.

---

## Scope

Make only the minimum required changes to restore valid package upload behavior for the current `HbHeroBannerWebPart` proof case.

Primary file:
- `apps/hb-webparts/config/package-solution.json`

Also inspect for any other place where the same invalid zero-padded solution version might be emitted into the final `.sppkg`, but do not broaden the change unless necessary.

---

## Required change

Update the `hb-webparts` solution/package version fields from:

- `01.000.014`

to:

- `1.0.0.14`

At minimum, correct:

- `solution.version`
- `solution.features[0].version`

If any other package-level version metadata for this same solution is being sourced from a mirrored or derived location, correct that too — but only if it is necessary for the final emitted `.sppkg`.

---

## Hard constraints

Do **not** change any of the following:

- proof-case webpart ID
- `entryModuleId`
- `scriptResources`
- `ShellWebPart.ts`
- `mount-hero-proof-case.tsx`
- `mount.tsx`
- `vite.config.ts`
- proof-case loader path
- bundle global name
- shim-removal logic
- manifest identity logic

This prompt is **not** about loader behavior.
This prompt is **not** about runtime rendering.
This prompt is **only** about fixing invalid app package version metadata so the `.sppkg` can be uploaded to the App Catalog.

Do not re-read files that are already in your active context unless needed for verification.

---

## Implementation steps

1. Open `apps/hb-webparts/config/package-solution.json`.
2. Change:
   - `solution.version` → `1.0.0.14`
   - `solution.features[0].version` → `1.0.0.14`
3. Check whether the build pipeline or packaging flow derives the same version from anywhere else for `hb-webparts`.
4. If so, correct only the matching package-version source needed for the emitted `.sppkg`.
5. Rebuild the package:
   - `npx tsx tools/build-spfx-package.ts --domain hb-webparts`
6. Verify the rebuilt `.sppkg` no longer emits the invalid zero-padded version format in the app manifest/package metadata.

---

## Validation requirements

You must validate all of the following before concluding:

### A. Source validation
Confirm the version values in `apps/hb-webparts/config/package-solution.json` are:
- `1.0.0.14`

### B. Package validation
Inspect the rebuilt `dist/sppkg/hb-webparts.sppkg` and confirm the emitted app/package version is no longer `01.000.014`.

### C. Non-regression validation
Confirm the proof-case loader contract remains unchanged:
- proof-case webpart ID unchanged
- no neutral shell manifest reintroduced
- no shim files reintroduced
- no loader identity rewrites introduced by this change

---

## Deliverable

Provide a concise completion note with:

1. files changed
2. exact version values before/after
3. rebuild result
4. confirmation that the emitted package no longer uses `01.000.014`
5. confirmation that no proof-case loader-contract logic was changed

If you find that more than this minimal metadata fix is required, stop and explain exactly why before broadening the remediation.