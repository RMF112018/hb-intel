# Prompt 02 — Doctrine Index and Supersession Cleanup

## Objective

Rewrite the UI-kit governance indexes and supersession map so developers can determine current authority without ambiguity.

## Context

The current doctrine README reads like a temporary breakpoint update note and the top-level UI-kit README references planned/missing lane documents. This prompt fixes the map before changing doctrine substance.

## Repo-Truth Files to Inspect

- Prompt 01 scope lock
- `docs/reference/ui-kit/README.md`
- `docs/reference/ui-kit/doctrine/README.md`
- `docs/reference/ui-kit/entry-points.md`
- all current docs classified by Prompt 01

## Files Allowed to Modify

```text
docs/reference/ui-kit/README.md
docs/reference/ui-kit/doctrine/README.md
docs/reference/ui-kit/GOVERNANCE-MAP.md
docs/reference/ui-kit/GOVERNANCE-SUPERSESSION.md
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

Do not move/delete docs in this prompt unless Prompt 01 scope lock explicitly authorizes it.

## Required Work

- Rewrite top-level `docs/reference/ui-kit/README.md` around current authority, not aspirational missing files.
- Rewrite `docs/reference/ui-kit/doctrine/README.md` as a real doctrine index with reading order and applicability matrix.
- Create `GOVERNANCE-MAP.md` mapping consumer types to governing docs: homepage SPFx, full-page SPFx app/widget, PWA, feature package, component reference, brand usage.
- Create `GOVERNANCE-SUPERSESSION.md` listing older docs and their current status: active, Layer 3 reference, historical, superseded, deprecated, unknown.
- Clearly state Layer 1 doctrine wins over component/pattern docs.
- State that component docs are API/usage references and do not override doctrine.

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
docs(ui-kit): clarify governance map and supersession
```

## Recommended Commit Description

```text
Manifest: UI Kit Governance Cleanup

Version: no package or SPFx solution version change unless explicitly authorized by this prompt and confirmed in closeout.

Cleans up UI governance documentation and brand governance for HB Intel. Aligns doctrine, SPFx surface acceptance, brand asset usage, and font governance with the current flagship/benchmark standard. Does not implement product UI, PCC Wave 2 product code, backend routes, tenant mutation, Graph/PnP calls, Procore integrations, app-catalog deployment, CI/CD deployment changes, or package publishing.

```
