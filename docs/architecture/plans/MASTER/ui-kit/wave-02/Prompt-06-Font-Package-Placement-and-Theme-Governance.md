# Prompt 06 — Font Package Placement and Theme Governance

## Objective

Place and govern the HB font package inside the UI-kit layer only if license/internal-use review permits it, then expose font usage through approved theme/font tokens rather than raw app imports.

## Context

The brand kit includes a font package. Font files must be handled carefully: do not paste contents, do not redistribute them in generated artifacts, and do not duplicate them across app folders.

## Repo-Truth Files to Inspect

- Prompt 01 scope lock
- `docs/reference/brand/README.md`
- `docs/reference/brand/BRAND-ASSET-INVENTORY.md`
- `docs/reference/brand/BRAND-USAGE-GOVERNANCE.md`
- actual font archive path under `docs/reference/brand/`
- `packages/ui-kit/src/theme/**`
- `packages/ui-kit/src/branding/**`
- existing CSS/theme/font files and any `@font-face` definitions
- `packages/ui-kit/package.json`, tsconfig, asset declarations, build config

## Files Allowed to Modify

Preferred, only after documented license/internal-use clearance:

```text
packages/ui-kit/src/branding/fonts/**
packages/ui-kit/src/theme/fonts/**
packages/ui-kit/src/theme/**
packages/ui-kit/src/branding/index.ts                         # only if exposing font metadata there is repo-correct
docs/reference/brand/BRAND-ASSET-INVENTORY.md
docs/reference/brand/BRAND-USAGE-GOVERNANCE.md
docs/reference/ui-kit/doctrine/**                             # limited cross-reference if needed
docs/architecture/plans/MASTER/ui-kit/governance-cleanup-2026-04/**
```

If license/internal-use clearance is not documented, modify docs only and record blocker.

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

Do not place font files in `apps/**`. Do not include font files in generated documentation/prompt packages. Do not base64-embed fonts in Markdown.

## Required Work

- Inspect brand governance docs for license/internal-use clearance. If absent or unclear, stop before copying font files and update docs with a required clearance gate.
- Identify the repo-correct location for governed fonts: prefer `packages/ui-kit/src/theme/fonts/` if fonts are theme-level, or `packages/ui-kit/src/branding/fonts/` if repo convention treats them as brand assets.
- If authorized, extract/copy only approved web font formats needed by the app. Do not copy unnecessary source/archive material into product bundles.
- Create a font registry or CSS module that defines approved font family names through UI-kit theme tokens/CSS variables.
- Update theme exports so apps consume font families through UI-kit theme/font tokens, not raw paths.
- Document fallback font stack and where each font should be used: brand/display/headline vs body/UI text.
- Add explicit guidance that routine UI controls should remain readable and conventional; brand fonts should not damage legibility or density.
- Update brand inventory with font placement status, allowed usage, and license gate result without exposing font file contents.
- Validate build/typecheck so font imports resolve in the UI-kit package.

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
# run tests/lint if available
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
feat(ui-kit): govern HB brand font placement
```

## Recommended Commit Description

```text
Manifest: UI Kit Governance Cleanup

Version: no package or SPFx solution version change unless explicitly authorized by this prompt and confirmed in closeout.

Cleans up UI governance documentation and brand governance for HB Intel. Aligns doctrine, SPFx surface acceptance, brand asset usage, and font governance with the current flagship/benchmark standard. Does not implement product UI, PCC Wave 2 product code, backend routes, tenant mutation, Graph/PnP calls, Procore integrations, app-catalog deployment, CI/CD deployment changes, or package publishing.

```
