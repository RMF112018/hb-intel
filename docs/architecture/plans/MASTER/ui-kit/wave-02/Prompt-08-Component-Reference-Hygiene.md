# Prompt 08 — Component Reference Hygiene

## Objective

Classify component reference docs as Layer 3 usage references and add governance-status headers so they no longer compete with binding doctrine.

## Context

`docs/reference/ui-kit/` contains many `Hbc*.md` component docs beside governing doctrine. These should remain useful, but their authority needs to be explicit.

## Repo-Truth Files to Inspect

- Prompt 01 classification matrix
- all `docs/reference/ui-kit/Hbc*.md`
- `docs/reference/ui-kit/DashboardLayout.md`
- `docs/reference/ui-kit/WorkspacePageShell.md`
- `docs/reference/ui-kit/ListLayout.md`
- `docs/reference/ui-kit/deprecated-tokens.md`
- any other direct component/pattern reference docs identified by Prompt 01

## Files Allowed to Modify

```text
docs/reference/ui-kit/*.md
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

Do not rewrite component APIs or implementation code. Do not delete docs unless Prompt 01 explicitly authorized an archive/delete move.

## Required Work

- Add a standard governance-status header to component reference docs: “Component reference only; does not override Layer 1 doctrine or runtime overlays.”
- For layout/pattern docs such as DashboardLayout and WorkspacePageShell, classify whether they are active pattern docs, Layer 3 references, or superseded guidance.
- For deprecated docs, add or confirm a deprecation/supersession notice pointing to current governing docs.
- Update `GOVERNANCE-MAP.md` and `GOVERNANCE-SUPERSESSION.md` with classifications.
- Avoid content churn: add headers and targeted clarifications only unless a doc contains a direct conflict requiring correction.
- Ensure links to new doctrine/standards are relative and valid.

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
# run markdown/link validation if available
# optional grep proof that headers exist across component docs
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
docs(ui-kit): classify component references
```

## Recommended Commit Description

```text
Manifest: UI Kit Governance Cleanup

Version: no package or SPFx solution version change unless explicitly authorized by this prompt and confirmed in closeout.

Cleans up UI governance documentation and brand governance for HB Intel. Aligns doctrine, SPFx surface acceptance, brand asset usage, and font governance with the current flagship/benchmark standard. Does not implement product UI, PCC Wave 2 product code, backend routes, tenant mutation, Graph/PnP calls, Procore integrations, app-catalog deployment, CI/CD deployment changes, or package publishing.

```
