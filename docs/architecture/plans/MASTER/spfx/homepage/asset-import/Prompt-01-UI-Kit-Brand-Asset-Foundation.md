# Prompt-01 — UI Kit Brand Asset Foundation

## Objective

Audit the current live repo state of `packages/ui-kit` and implement the shared brand asset foundation required to ingest the following local files into `@hbc/ui-kit` as canonical reusable brand assets:

- `/Users/bobbyfetting/Library/CloudStorage/SynologyDrive-BFmacSync/Work/Logos/GRIT-LOGO.jpg`
- `/Users/bobbyfetting/Library/CloudStorage/SynologyDrive-BFmacSync/Work/Logos/hb_icon_blueBG.jpg`
- `/Users/bobbyfetting/Library/CloudStorage/SynologyDrive-BFmacSync/Work/Logos/hb_logo_icon.jpg`
- `/Users/bobbyfetting/Library/CloudStorage/SynologyDrive-BFmacSync/Work/Logos/hedrick-logo.png`

Do not re-read files that are already in your current context or memory.

---

## Repo-truth constraints

You must respect the live repo truth that:

- `@hbc/ui-kit` is the shared reusable UI package.
- `apps/hb-webparts` is a consuming package and should not become the canonical owner of master HB brand assets.
- shared asset ownership should remain disciplined; do not turn the UI kit into a dumping ground for all imagery.
- the implementation must preserve package cleanliness, predictable exports, and maintainable reuse boundaries.

Do not invent a giant branding subsystem if the repo only needs a focused, disciplined asset lane.

---

## Required work

### 1. Audit current `packages/ui-kit` posture
Confirm the current repo state around:
- whether a branding asset directory already exists
- whether there is already a reusable branding export surface
- whether current docs mention shared brand assets
- whether current package exports need extension to support a new branding entry point

### 2. Ingest the local files into repo truth
Using the exact local source paths above:

- verify that each file exists locally
- stop and report the exact missing path if any file is absent
- copy the files into a new governed directory under `packages/ui-kit/src/branding/assets/`
- normalize the filenames into clean repo-safe kebab-case names

Recommended repo filenames:

- `grit-logo.jpg`
- `hb-icon-blue-bg.jpg`
- `hb-logo-icon.jpg`
- `hedrick-logo.png`

### 3. Create the branding registry
Create a clear shared registry / barrel for these assets.

Recommended shape:

- `packages/ui-kit/src/branding/index.ts`

It should export named constants for:
- `gritLogo`
- `hbIconBlueBg`
- `hbLogoIcon`
- `hedrickLogo`

Also export a small branded registry object if that improves consumption ergonomics.

### 4. Create a dedicated package export
Expose the new branding surface in package exports so consuming apps can import from a stable path such as:

- `@hbc/ui-kit/branding`

Update the relevant barrel/export files and package configuration as needed.

### 5. Keep the scope disciplined
Treat only stable reusable corporate brand assets as shared kit assets.

Do not move homepage-specific editorial imagery into the kit in this prompt.

### 6. Update docs
Update relevant `@hbc/ui-kit` docs/readmes to explain:
- what belongs in shared branding assets
- how consuming apps should import the assets
- what should remain app-local instead of entering the shared kit

---

## Hard gates

- Do not turn `@hbc/ui-kit` into a general image library.
- Do not break existing package exports.
- Do not move homepage-specific or rotating editorial assets into the kit.
- Do not force format conversion unless technically necessary.
- Do not re-read files already in your current context or memory.

---

## Deliverables

- shared branding asset directory in `packages/ui-kit`
- branding registry/barrel
- package export path for branding assets
- updated docs explaining shared-vs-local asset ownership
- concise final notes summarizing:
  - files added
  - exact local source paths used
  - export path created
  - any missing-file issue encountered

---

## Acceptance criteria

- all source files are either copied successfully or exact missing-path failure is reported
- `packages/ui-kit` contains a governed shared branding asset lane
- consuming packages can import from a stable branding entry point
- docs clearly define what belongs in shared brand assets vs app-local imagery
