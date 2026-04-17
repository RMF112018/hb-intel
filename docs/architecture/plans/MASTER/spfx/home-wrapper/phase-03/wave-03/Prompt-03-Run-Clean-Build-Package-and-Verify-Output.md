# Prompt 03 — Run Clean Build, Package, and Verify Output

## Objective

Run the real build and packaging flow for the standalone homepage solution, then inspect the resulting `.sppkg` directly and prove the output is correct.

This prompt is only complete when there is direct post-build package evidence.

## Required repo-truth inputs

Inspect at minimum:

- the final standalone homepage domain created in Prompts 01–02
- `tools/build-spfx-package.ts`
- `docs/architecture/reviews/spfx/spfx-pipeline-project-sites-hb-webparts-freshness-audit.md`
- the generated `dist/sppkg/hb-intel-homepage.sppkg`
- and, if accessible, the attached `hb-intel-project-sites.sppkg` or a locally regenerated Project Sites package for structure comparison

## Required execution

### 1. Run the standalone homepage app build
Run the actual app build command for the new domain.

Unless the repo’s package name differs for a grounded reason, this should be equivalent to:
```bash
pnpm --filter @hbc/spfx-hb-homepage build
```

### 2. Run the authoritative packaging command
Run the actual packaging command:
```bash
npx tsx tools/build-spfx-package.ts --domain hb-homepage
```

### 3. Verify the output archive exists
Confirm the final output exists under:
- `dist/sppkg/hb-intel-homepage.sppkg`

If the naming differs because repo truth demanded a different canonical name, document it explicitly.

### 4. Inspect the `.sppkg` directly
Unzip or otherwise inspect the archive contents directly.

At minimum, prove the presence of:
- `AppManifest.xml`
- `_rels/.rels`
- `[Content_Types].xml`
- a feature XML for the solution
- a feature folder containing `WebPart_e0a11c44-e6d7-45d1-9af5-09ba0b68f5cf.xml` if the manifest id was preserved
- `ClientSideAssets/`
- a main bundle like `hb-homepage-app-{hash}.js`
- a shell-entry shim like `shell-entry-e0a11c44-e6d7-45d1-9af5-09ba0b68f5cf-{hash}.js`
- the compiled shell webpart asset

### 5. Inspect the packaged WebPart XML
Extract the packaged WebPart XML and prove:
- the webpart id is correct,
- the alias/title are correct,
- `supportsFullBleed` is preserved,
- `entryModuleId` is correct,
- and `scriptResources` points at the correct new shim file.

### 6. Inspect the asset freshness
Prove the packaged main bundle and shim correspond to the current build, not stale leftovers.
Use content hashes, timestamps, and/or whatever existing verifier output the pipeline already writes.

### 7. Persist a build verification report
Write a new report in the repo, for example:
- `docs/architecture/reviews/spfx/hb-homepage/hb-homepage-sppkg-build-verification.md`

The report must capture:
- commands run,
- output archive path,
- file sizes / timestamps,
- archive file list,
- packaged manifest proof,
- packaged asset proof,
- and any remaining risks.

## Constraints

- Do not re-read files that are already in your active context unless you need to confirm drift, dependencies, or uncertainty after changes.
- Do not declare success based only on build logs.
- Do not stop after package generation without direct archive inspection.
- Do not leave verification only in terminal output; persist it in the repo.

## Proof of closure

Return:
1. the exact commands run,
2. whether the build passed,
3. whether the packaging passed,
4. the final `.sppkg` path,
5. the exact packaged main bundle filename,
6. the exact packaged shell-entry shim filename,
7. the exact packaged WebPart XML path inside the archive,
8. the path to the persisted verification report,
9. and a concise statement confirming whether the output is tenant-deployable and free of duplicate-ownership drift.
