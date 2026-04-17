# Plan Summary — Standalone HB Homepage SPFx Solution

## Target end state

Create a dedicated **HB Homepage** SPFx solution domain modeled on the Project Sites packaging pattern, while preserving the current homepage runtime behavior and current webpart identity unless a repo-truth blocker forces a different choice.

## Why this is needed

The repo already contains a current HB Homepage runtime inside `apps/hb-webparts`, but the user now wants:
- a dedicated app domain,
- a dedicated `.sppkg` pipeline,
- a clean packaging run,
- and output verification using the Project Sites solution as the packaging reference model.

The implementation must therefore solve **both**:
1. runtime ownership and solution ownership, and
2. build/package/verification ownership.

## Repo-truth reference points

Use these as primary authority during implementation:

- `tools/build-spfx-package.ts`
- `tools/spfx-shell/`
- `docs/architecture/reviews/spfx/spfx-pipeline-project-sites-hb-webparts-freshness-audit.md`
- `apps/project-sites/config/package-solution.json`
- `apps/project-sites/src/mount.tsx`
- `apps/project-sites/src/webparts/projectSites/ProjectSitesWebPart.manifest.json`
- `apps/hb-webparts/src/webparts/hbHomepage/`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageWebPart.manifest.json`
- `apps/hb-webparts/src/mount.tsx`

If the attached `hb-intel-project-sites.sppkg` is accessible in your local workspace, inspect it directly. If not, regenerate the Project Sites package locally from the authoritative pipeline and inspect that output instead.

## Decision lock

Treat the standalone homepage solution as the future authoritative owner of the HB Homepage webpart package.

That means the implementation must prevent both of these failure modes:
- the HB Homepage manifest id being packaged by both `hb-webparts` and the new standalone domain,
- or the new standalone domain producing a package whose internal structure drifts from the authoritative Project Sites pipeline model.

## Expected package conventions

Unless a stronger repo authority already exists, use these conventions:
- domain dir: `apps/hb-homepage/`
- package name: `@hbc/spfx-hb-homepage`
- solution/package title: `hb-intel-homepage`
- output archive: `dist/sppkg/hb-intel-homepage.sppkg`
- runtime global: `__hbIntel_hbHomepage`

## Verification standard

A successful close requires:
- real Vite build of the standalone app,
- real packaging via `tools/build-spfx-package.ts --domain hb-homepage`,
- real unzip / archive inspection of the generated `.sppkg`,
- and a persisted verification report in the repo.
