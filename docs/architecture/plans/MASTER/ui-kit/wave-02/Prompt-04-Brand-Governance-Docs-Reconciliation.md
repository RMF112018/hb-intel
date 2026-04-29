# Prompt 04 — Brand Governance Docs Reconciliation

## Objective

Reconcile `docs/reference/brand/` with the UI-kit governance system so brand assets and fonts become governed inputs to UI development.

## Context

The brand kit and associated files have been saved to `docs/reference/brand/`. This prompt aligns those docs with ui-kit doctrine and prepares for asset/font curation in later prompts.

## Repo-Truth Files to Inspect

- Prompt 01 scope lock
- `docs/reference/brand/README.md`
- `docs/reference/brand/BRAND-ASSET-INVENTORY.md`
- `docs/reference/brand/BRAND-USAGE-GOVERNANCE.md`
- `docs/reference/brand/source/**` or actual brand kit path
- `docs/reference/ui-kit/README.md`
- `docs/reference/ui-kit/GOVERNANCE-MAP.md`
- `docs/reference/ui-kit/doctrine/**`
- `packages/ui-kit/src/branding/index.ts`

## Files Allowed to Modify

```text
docs/reference/brand/README.md
docs/reference/brand/BRAND-ASSET-INVENTORY.md
docs/reference/brand/BRAND-USAGE-GOVERNANCE.md
docs/reference/ui-kit/GOVERNANCE-MAP.md
docs/reference/ui-kit/GOVERNANCE-SUPERSESSION.md
docs/reference/ui-kit/doctrine/README.md
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

Do not copy/optimize logo assets or move font files in Prompt 04; that is Prompt 05/06.

## Required Work

- Confirm brand docs accurately describe source archive location, curated asset location, and product consumption path.
- State that `docs/reference/brand/` is reference/source-of-truth territory, not product import territory.
- State that stable implementation-ready assets belong in `packages/ui-kit/src/branding/assets/` and are exported from `@hbc/ui-kit/branding`.
- State that fonts are governed assets and may only be placed after documented license/internal-use review.
- Add usage rules for context-driven brand expression: strongest on flagship shells and command centers; restrained on routine controls.
- Add explicit rule that common controls should use governed primitives rather than bespoke brand-styled replacements.
- Cross-link brand governance from UI-kit governance map and doctrine README.

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
# markdown/link validation if available
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
docs(brand): align brand governance with ui-kit doctrine
```

## Recommended Commit Description

```text
Manifest: UI Kit Governance Cleanup

Version: no package or SPFx solution version change unless explicitly authorized by this prompt and confirmed in closeout.

Cleans up UI governance documentation and brand governance for HB Intel. Aligns doctrine, SPFx surface acceptance, brand asset usage, and font governance with the current flagship/benchmark standard. Does not implement product UI, PCC Wave 2 product code, backend routes, tenant mutation, Graph/PnP calls, Procore integrations, app-catalog deployment, CI/CD deployment changes, or package publishing.

```
