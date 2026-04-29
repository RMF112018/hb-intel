# Prompt 05 — Curated Web-Ready Brand Assets

## Objective

Create the curated web-ready brand asset set from the saved HB brand kit and expose stable assets through `@hbc/ui-kit/branding`.

## Context

The full brand kit is stored under `docs/reference/brand/` for reference. Product code must consume stable web-ready assets through the UI-kit brand registry, not raw source-package paths.

## Repo-Truth Files to Inspect

- Prompt 01 scope lock
- `docs/reference/brand/README.md`
- `docs/reference/brand/BRAND-ASSET-INVENTORY.md`
- `docs/reference/brand/BRAND-USAGE-GOVERNANCE.md`
- `docs/reference/brand/source/**` or actual brand kit source path
- `packages/ui-kit/src/branding/index.ts`
- `packages/ui-kit/src/branding/assets/**`
- `packages/ui-kit/package.json`
- relevant Vite/TypeScript asset declaration files for image imports

## Files Allowed to Modify

```text
packages/ui-kit/src/branding/assets/**
packages/ui-kit/src/branding/index.ts
packages/ui-kit/src/branding/README.md                         # if useful
docs/reference/brand/BRAND-ASSET-INVENTORY.md                  # update curated-status table
docs/reference/brand/BRAND-USAGE-GOVERNANCE.md                 # update implementation path if needed
docs/architecture/plans/MASTER/ui-kit/governance-cleanup-2026-04/**
```

## Files Forbidden to Modify

```text
apps/** product source, except read-only inspection
backend/**
infra/**
.github/**
*.sppkg
SPFx package-solution files
SPFx manifests
package version fields
```

Do not modify app UI, product implementation, backend, tenant/provisioning code, CI/CD, deployment scripts, or generated distribution files unless this prompt explicitly authorizes a narrow exception.

Do not copy font files in Prompt 05. Do not place brand assets directly in app folders.

## Required Work

- Locate the saved brand kit under `docs/reference/brand/` and inspect its logo files and image formats.
- Select stable reusable corporate brand assets for UI-kit curation: HB Construction primary/reverse/icon variants, HB Development, HB Environmental, Reef Arches, and any other approved stable marks identified in inventory.
- Do not curate editorial/campaign-specific imagery into UI-kit branding.
- Create web-ready assets under `packages/ui-kit/src/branding/assets/` using repo-accepted formats. Prefer SVG where source is vector and suitable; otherwise use optimized PNG/JPG with clear names.
- Use lowercase kebab-case filenames with brand and variant, for example `hb-construction-logo-left-reverse.png`.
- Preserve source files under `docs/reference/brand/`; do not delete source assets.
- Update `packages/ui-kit/src/branding/index.ts` to import and export the curated assets and include them in `brandAssets` with typed keys.
- Add comments documenting that stable reusable corporate assets belong here and app code should import from `@hbc/ui-kit/branding`.
- Update `BRAND-ASSET-INVENTORY.md` with curated asset status, source file, target file, registry key, and intended usage.
- Add a small smoke test or typecheck proof if the repo has ui-kit tests for asset exports. If no test pattern exists, document why and rely on build/typecheck.

## Required Guardrails

- Treat the live repo as authoritative and verify every referenced file on the current working branch before editing.
- Do not re-read files that are still within the coding agent's active context or memory; only re-open files when context has expired or proof is required.
- Separate evidence from recommendation in notes and closeout.
- Do not implement product UI, PCC Wave 2 product code, homepage UI, backend logic, tenant mutation, provisioning, Graph/PnP calls, Procore calls, app-catalog deployment, CI/CD changes, or package publishing.
- This effort is governance, documentation, brand asset curation, and UI-kit brand/font infrastructure only.
- Do not redistribute font files in generated prompt packages, exported docs zips, public issue bodies, screenshots, or summaries. Font files may only be moved/copied inside the repo if the internal-use/license review documented in `docs/reference/brand/` permits it.
- Stable brand assets belong in `@hbc/ui-kit/branding`, not app-local folders, unless explicitly categorized as editorial/campaign/surface-local.
- Product code must not import raw brand images or raw font files from `docs/reference/brand/`.
- Preserve `docs/reference/brand/source/` as source-of-truth archive territory.
- If license or brand-use permission is unclear, stop before copying font files and record a blocker.
- Add clear supersession headers rather than deleting historical material unless the prompt explicitly authorizes deletes.


## Required Validation

```bash
git status --short
pnpm --filter @hbc/ui-kit check-types
pnpm --filter @hbc/ui-kit build
# run @hbc/ui-kit tests/lint if available
pnpm --filter @hbc/ui-kit test
pnpm --filter @hbc/ui-kit lint
```

## Required Closeout Response Format

Return exactly these sections:

1. `Objective Completed` — yes/no, with one sentence.
2. `Files Changed` — grouped by added/modified/deleted and binary/text.
3. `Repo-Truth Evidence` — files inspected and facts confirmed.
4. `Governance Decisions Applied` — list the decisions implemented.
5. `Brand / Font Handling` — state exactly whether brand assets were copied, optimized, exported, or deferred; do not print font contents.
6. `Validation Results` — command, result, and any warnings.
7. `Guardrail Confirmation` — yes/no for no product UI, no backend, no tenant mutation, no Graph/PnP, no Procore, no CI/CD/deployment, no unauthorized font redistribution.
8. `Open Decisions / Blockers`.
9. `Recommended Commit Summary`.
10. `Recommended Commit Description`.


## Recommended Commit Summary

```text
feat(ui-kit): curate HB brand assets
```

## Recommended Commit Description

```text
Manifest: UI Kit Governance Cleanup

Version: no package or SPFx solution version change unless explicitly authorized by this prompt and confirmed in closeout.

Cleans up UI governance documentation and brand governance for HB Intel. Aligns doctrine, SPFx surface acceptance, brand asset usage, and font governance with the current flagship/benchmark standard. Does not implement product UI, PCC Wave 2 product code, backend routes, tenant mutation, Graph/PnP calls, Procore integrations, app-catalog deployment, CI/CD deployment changes, or package publishing.

```
