# Prompt 01 — Governance Inventory and Scope Lock

## Objective

Perform a repo-truth inventory of UI governance, SPFx surface standards, brand governance, existing branding registry, and font/asset conventions. Create a scope lock before any cleanup work proceeds.

## Context

This is a gate prompt. Do not rewrite doctrine or move assets yet. Produce evidence and a precise scope lock for the remaining prompts.

## Repo-Truth Files to Inspect

- `docs/reference/ui-kit/README.md`
- `docs/reference/ui-kit/doctrine/README.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-PWA-Governing-Standard.md`
- `docs/reference/ui-kit/entry-points.md`
- all `docs/reference/ui-kit/*.md` component, layout, pattern, audit, and deprecated-token references
- `docs/reference/spfx-surfaces/homepage-uiux-audit-checklist.md`
- `docs/reference/spfx-surfaces/homepage-uiux-audit-scorecard.md`
- `docs/reference/spfx-surfaces/homepage-uiux-audit-evidence.md`
- `docs/reference/spfx-surfaces/benchmark/**`
- `docs/reference/brand/README.md`
- `docs/reference/brand/BRAND-ASSET-INVENTORY.md`
- `docs/reference/brand/BRAND-USAGE-GOVERNANCE.md`
- `docs/reference/brand/source/**` or the actual checked-in brand-kit location under `docs/reference/brand/`
- `packages/ui-kit/src/branding/index.ts`
- `packages/ui-kit/src/branding/assets/**`
- `packages/ui-kit/src/theme/**`
- `packages/ui-kit/package.json`, `packages/ui-kit/tsconfig.json`, and relevant build/test config
- relevant SPFx consumers for import-policy proof only: `apps/hb-webparts/**`, `apps/project-sites/**`, `packages/spfx/**`


## Files Allowed to Modify

```text
docs/architecture/plans/MASTER/ui-kit/governance-cleanup-2026-04/**
docs/reference/ui-kit/GOVERNANCE-CLEANUP-SCOPE-LOCK.md
```

Only documentation/inventory files may be created or modified in this prompt.

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

Do not modify `packages/ui-kit/src/branding/**` or font files in Prompt 01.

## Required Work

- Verify the brand kit and brand governance files exist under `docs/reference/brand/`.
- Verify the exact path of the original brand kit archive and associated logo/font files.
- Inspect current `@hbc/ui-kit/branding` registry and asset path conventions.
- Inspect whether the repo has existing font conventions or `@font-face` definitions.
- Classify all `docs/reference/ui-kit/` files as binding doctrine, runtime overlay, standard, pattern, component reference, audit/evidence, historical/planning, deprecated, or unknown.
- Identify missing docs currently referenced by `docs/reference/ui-kit/README.md`.
- Create a scope-lock document listing allowed paths, forbidden paths, asset handling rules, and validation commands for prompts 02-09.
- Do not perform the cleanup yet.

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
# run markdown/link validation only if a repo-supported command exists
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
docs(ui-kit): audit governance cleanup scope
```

## Recommended Commit Description

```text
Manifest: UI Kit Governance Cleanup

Version: no package or SPFx solution version change unless explicitly authorized by this prompt and confirmed in closeout.

Cleans up UI governance documentation and brand governance for HB Intel. Aligns doctrine, SPFx surface acceptance, brand asset usage, and font governance with the current flagship/benchmark standard. Does not implement product UI, PCC Wave 2 product code, backend routes, tenant mutation, Graph/PnP calls, Procore integrations, app-catalog deployment, CI/CD deployment changes, or package publishing.

```
