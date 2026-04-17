# Prompt 02 — Wire the Authoritative SPFx Packaging Pipeline

## Objective

Wire the new standalone HB Homepage domain into the **authoritative SPFx `.sppkg` pipeline** so it packages the same way Project Sites does:
- Vite bundle build
- asset staging into `tools/spfx-shell`
- manifest cloning
- shell-entry shim generation
- gulp `package-solution --ship`
- final archive collection into `dist/sppkg/`
- package verification

## Required repo-truth inputs

Inspect at minimum:

- `tools/build-spfx-package.ts`
- `tools/spfx-shell/gulpfile.js`
- `tools/spfx-shell/`
- `apps/project-sites/config/package-solution.json`
- `apps/project-sites/src/mount.tsx`
- `apps/project-sites/src/webparts/projectSites/ProjectSitesWebPart.manifest.json`
- the new `apps/hb-homepage/` domain created in Prompt 01
- current HB Homepage manifest/runtime seams
- `docs/architecture/reviews/spfx/spfx-pipeline-project-sites-hb-webparts-freshness-audit.md`

## Implementation requirements

### 1. Add the new packaging domain
Extend `tools/build-spfx-package.ts` so `hb-homepage` is a first-class domain in `ALL_DOMAINS`.

Unless stronger repo authority already exists, use a Project Sites-like single-webpart packaging model.

### 2. Add package-solution config
Create and wire the new solution config for the standalone homepage domain.

Unless stronger repo authority exists, use:
- solution/package name: `hb-intel-homepage`
- output archive: `hb-intel-homepage.sppkg`

Use a real solution GUID and keep it stable.

### 3. Ensure manifest and entry-module correctness
The generated package must produce:
- a cloned homepage manifest,
- a package feature folder containing `WebPart_{HB_HOMEPAGE_ID}.xml`,
- a `loaderConfig.entryModuleId` of `{HB_HOMEPAGE_ID}_1.0.0`,
- a shell-entry shim file whose name is hash-bearing,
- a main app bundle whose name is hash-bearing,
- and a manifest `scriptResources` map pointing at the correct generated shim.

### 4. Preserve full-bleed posture
HB Homepage is intended as a flagship homepage surface.
Ensure `supportsFullBleed: true` remains preserved through packaging.

### 5. Make the pipeline verifiable
Do not rely on “build seems okay.”
Add or reuse the same level of package verification discipline used by the Project Sites / HB Webparts pipeline:
- structure verification
- shell asset verification
- manifest verification
- global mount name verification where applicable

If a new homepage-specific proof artifact is useful, generate one.
If the existing verifier already covers the needed scope, prove that and reuse it.

### 6. Eliminate packaging drift
If HB Homepage is now standalone, ensure `hb-webparts` no longer packages it.
This must be proven in code, not assumed.

## Constraints

- Do not re-read files that are already in your active context unless you need to confirm drift, dependencies, or uncertainty after changes.
- Do not create a one-off packaging path outside `tools/build-spfx-package.ts`.
- Do not hand-edit final package contents.
- Do not leave solution naming, IDs, or output naming inconsistent across manifests, config, logs, and output archive names.

## Proof of closure

Return:
1. the exact new domain registration added to `tools/build-spfx-package.ts`,
2. the final solution name and GUID,
3. the expected archive path under `dist/sppkg/`,
4. the generated main app bundle naming convention,
5. the generated shell-entry shim naming convention,
6. and the exact files/seams that now prove HB Homepage is packaged by the standalone solution and not duplicated elsewhere.
