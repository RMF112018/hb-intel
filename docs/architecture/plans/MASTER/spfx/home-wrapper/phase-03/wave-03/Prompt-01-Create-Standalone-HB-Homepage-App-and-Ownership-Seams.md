# Prompt 01 — Create Standalone HB Homepage App and Ownership Seams

## Objective

Create a **standalone HB Homepage app domain** that becomes the authoritative runtime source for the homepage solution package, while eliminating duplicate package ownership risk with `hb-webparts`.

This is not a cosmetic reorganization.
This is a packaging-ownership and build-seam implementation.

## Required repo-truth inputs

Inspect at minimum:

- `apps/hb-webparts/src/webparts/hbHomepage/`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageWebPart.manifest.json`
- `apps/hb-webparts/src/mount.tsx`
- `apps/project-sites/`
- `apps/project-sites/src/mount.tsx`
- `apps/project-sites/src/webparts/projectSites/ProjectSitesWebPart.manifest.json`
- `apps/project-sites/config/package-solution.json`
- `tools/build-spfx-package.ts`
- `docs/architecture/reviews/spfx/spfx-pipeline-project-sites-hb-webparts-freshness-audit.md`

If the attached `hb-intel-project-sites.sppkg` is available in the workspace, inspect it too.
If it is not available, regenerate the Project Sites package locally and use that archive as the proof reference.

## Implementation requirements

### 1. Create the standalone domain
Create a dedicated homepage app domain, unless the repo already contains one:
- `apps/hb-homepage/`

Wire it as a real buildable app domain, not a placeholder folder.

### 2. Establish authoritative runtime ownership
The standalone domain must become the authoritative package owner for the HB Homepage runtime.

Do **not** leave the same webpart id ambiguously owned by both:
- `apps/hb-webparts`
- and the new standalone homepage domain

Resolve this cleanly.

### 3. Preserve or deliberately replace identity
Default requirement:
- preserve current HB Homepage webpart manifest id  
  `e0a11c44-e6d7-45d1-9af5-09ba0b68f5cf`

If you discover a hard repo-truth reason that the id cannot remain, document it, update every dependent seam atomically, and explain why preserving the current id was impossible or unsafe.

### 4. Avoid runtime duplication
Do not fork the HB Homepage runtime with copy-paste duplication unless absolutely unavoidable.

Preferred outcome:
- the standalone domain owns the app-host and solution build seams,
- while the homepage runtime logic is either moved once to the standalone domain or lifted into a shared seam consumed cleanly.

### 5. Create the standalone mount/runtime contract
Model the new app-host entry after Project Sites:
- standalone app entry
- IIFE-compatible mount contract
- stable global name for SPFx shell mounting
- clean `mount` / `unmount` behavior

Unless stronger repo authority exists, use:
- global name: `__hbIntel_hbHomepage`

### 6. Decide the `hb-webparts` coexistence posture
You must make and implement a real decision:
- either remove HB Homepage from `hb-webparts` package ownership,
- or exclude it from `hb-webparts` packaging if the source remains shared there,
- or otherwise enforce one authoritative package owner.

Do not leave this as future work.

## Constraints

- Do not re-read files that are already in your active context unless you need to confirm drift, dependencies, or uncertainty after changes.
- Do not leave duplicate packaging ownership unresolved.
- Do not implement a fake standalone domain that still secretly depends on `hb-webparts` package ownership.
- Do not stop at scaffolding. Produce a real runnable domain.

## Proof of closure

Return:
1. the exact files created or changed,
2. the final ownership decision for HB Homepage,
3. the runtime global name,
4. the final manifest id and whether it was preserved,
5. the exact seam that prevents duplicate package ownership,
6. and the exact command the agent expects to use to build the standalone homepage domain before packaging.
