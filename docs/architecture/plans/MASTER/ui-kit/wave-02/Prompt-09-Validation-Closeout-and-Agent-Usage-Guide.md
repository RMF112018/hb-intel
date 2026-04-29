# Prompt 09 — Validation, Closeout, and Agent Usage Guide

## Objective

Validate the complete governance cleanup, produce closeout evidence, and create a concise usage guide for future agents/developers.

## Context

This prompt completes the governance cleanup. It should not add new scope. It should verify that doctrine, brand governance, curated assets, font governance, standards, and component references are coherent.

## Repo-Truth Files to Inspect

- All files changed by Prompts 01-08
- `docs/reference/ui-kit/README.md`
- `docs/reference/ui-kit/GOVERNANCE-MAP.md`
- `docs/reference/ui-kit/GOVERNANCE-SUPERSESSION.md`
- `docs/reference/ui-kit/doctrine/**`
- `docs/reference/ui-kit/standards/**`
- `docs/reference/ui-kit/patterns/**`
- `docs/reference/brand/**`
- `packages/ui-kit/src/branding/**`
- `packages/ui-kit/src/theme/**` if fonts/theme were changed
- package scripts and validation outputs

## Files Allowed to Modify

```text
docs/reference/ui-kit/**
docs/reference/brand/**
docs/architecture/plans/MASTER/ui-kit/governance-cleanup-2026-04/**
packages/ui-kit/src/branding/**       # only for final docs/comments fixes if already touched
packages/ui-kit/src/theme/**          # only for final docs/comments fixes if already touched
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

Do not add new asset/font moves in Prompt 09 unless fixing validation errors from prior prompts.

## Required Work

- Create or update a final closeout file under the governance-cleanup plan path.
- Create a concise `AGENT-USAGE-GUIDE.md` or equivalent telling future agents the reading order for UI work.
- Verify there is a clear path for PCC Wave 2: SPFx Governing Standard → Full-Page App/Widget Overlay → Acceptance/Scoring Model → SPFx scorecard/evidence → brand governance → relevant patterns/components.
- Verify brand assets are consumed through `@hbc/ui-kit/branding` and docs do not encourage app-local raw imports.
- Verify font guidance does not expose font files and requires license/internal-use gate.
- Verify component docs are classified as reference only.
- Run all applicable validation from `Validation-Matrix.md`.
- Record any remaining blockers or exceptions.

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
pnpm --filter @hbc/ui-kit test
pnpm --filter @hbc/ui-kit lint
pnpm format:check
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
docs(ui-kit): close governance cleanup
```

## Recommended Commit Description

```text
Manifest: UI Kit Governance Cleanup

Version: no package or SPFx solution version change unless explicitly authorized by this prompt and confirmed in closeout.

Cleans up UI governance documentation and brand governance for HB Intel. Aligns doctrine, SPFx surface acceptance, brand asset usage, and font governance with the current flagship/benchmark standard. Does not implement product UI, PCC Wave 2 product code, backend routes, tenant mutation, Graph/PnP calls, Procore integrations, app-catalog deployment, CI/CD deployment changes, or package publishing.

```
