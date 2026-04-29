# Prompt 07 — Pattern Standards and PCC Layout Governance

## Objective

Create pattern and standard docs that govern PCC-style command-center, bento, cockpit, widget, breakpoint, and state-model layouts.

## Context

The user wants PCC and similar flagship SPFx shells to avoid fixed homepage row-height traps and support a flexible, high-density, project-controls cockpit feel where appropriate.

## Repo-Truth Files to Inspect

- Prior prompt outputs
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Full-Page-App-Widget-Overlay.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-Acceptance-and-Scoring-Model.md`
- `docs/reference/spfx-surfaces/homepage-uiux-audit-checklist.md`
- `docs/reference/spfx-surfaces/homepage-uiux-audit-scorecard.md`
- existing `DashboardLayout.md`, `WorkspacePageShell.md`, and related pattern docs
- existing PCC planning docs if needed for reference only

## Files Allowed to Modify

```text
docs/reference/ui-kit/standards/SPFx-Surface-Quality-Standard.md
docs/reference/ui-kit/standards/SPFx-Breakpoint-and-Container-Fit-Standard.md
docs/reference/ui-kit/standards/SPFx-State-Model-Standard.md
docs/reference/ui-kit/standards/SPFx-Host-Runtime-Validation-Standard.md
docs/reference/ui-kit/patterns/SPFx-Widget-and-Bento-Layout-Patterns.md
docs/reference/ui-kit/patterns/SPFx-Command-Center-Dashboard-Patterns.md
docs/reference/ui-kit/GOVERNANCE-MAP.md
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


## Required Work

- Create standards for SPFx surface quality, breakpoint/container fit, state models, and hosted runtime validation.
- Create pattern docs for SPFx widget/bento layouts and command-center dashboards.
- Encode context-driven hybrid layout decision: bento/cockpit for overviews; structured workbench for workflows/forms/logs/reviews.
- Define widget footprint variants: compact, standard, wide, hero, tall, full, rail, detail.
- Define requirements for each widget: purpose, minimum width, preferred span, height behavior, compact mode, states, data source/freshness, accessibility.
- Require container-aware behavior and warn against fixed equal-height row systems where they create white-space or compression problems.
- Require device experiences with equivalent design depth across desktop, tablet, and mobile, not degraded mobile afterthoughts.
- Tie pattern acceptance to the scoring model and hard-stop failures.
- Do not implement PCC or any product UI.

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
docs(ui-kit): add SPFx command-center layout standards
```

## Recommended Commit Description

```text
Manifest: UI Kit Governance Cleanup

Version: no package or SPFx solution version change unless explicitly authorized by this prompt and confirmed in closeout.

Cleans up UI governance documentation and brand governance for HB Intel. Aligns doctrine, SPFx surface acceptance, brand asset usage, and font governance with the current flagship/benchmark standard. Does not implement product UI, PCC Wave 2 product code, backend routes, tenant mutation, Graph/PnP calls, Procore integrations, app-catalog deployment, CI/CD deployment changes, or package publishing.

```
