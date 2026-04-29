# Prompt 03 — SPFx Full-Page App / Widget Overlay and Scoring Model

## Objective

Create a binding SPFx full-page app/widget overlay for PCC-style surfaces and an acceptance/scoring model tied to the SPFx surface checklist, scorecard, and evidence appendix.

## Context

PCC Wave 2 needs governance that inherits SPFx host-aware doctrine but is not constrained by homepage-only rules. Major SPFx widgets and shells should target benchmark-grade where appropriate.

## Repo-Truth Files to Inspect

- Prompt 01 and Prompt 02 outputs
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-PWA-Governing-Standard.md`
- `docs/reference/spfx-surfaces/homepage-uiux-audit-checklist.md`
- `docs/reference/spfx-surfaces/homepage-uiux-audit-scorecard.md`
- `docs/reference/spfx-surfaces/homepage-uiux-audit-evidence.md`
- `docs/reference/spfx-surfaces/benchmark/**`

## Files Allowed to Modify

```text
docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Full-Page-App-Widget-Overlay.md
docs/reference/ui-kit/doctrine/UI-Doctrine-Acceptance-and-Scoring-Model.md
docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md     # limited cross-reference additions only
docs/reference/ui-kit/doctrine/README.md                                  # cross-reference update
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

- Create `UI-Doctrine-SPFx-Full-Page-App-Widget-Overlay.md` for Project Control Center and similar full-page SPFx/domain-app/widget surfaces.
- Define scope: PCC, Project Sites, operational SharePoint-hosted apps, major widgets, embedded app frames, and command-center shells.
- Clarify that homepage surfaces remain governed by the Homepage Overlay and PWA routes remain governed by the PWA Standard.
- Authorize application navigation, command-center headers, side rails, bento/cockpit grids, dashboards, and operational card systems when host-safe.
- Prohibit fake SharePoint shell duplication, direct host chrome competition, generic enterprise-card-grid outcomes, and row-height white-space traps.
- Define widget requirements: purpose, footprint, minimum width, preferred span, compact mode, state model, data seam, accessibility behavior, and evidence needs.
- Create `UI-Doctrine-Acceptance-and-Scoring-Model.md` that ties governance to scorecard thresholds, hard-stop failures, and evidence-backed closure.
- Encode tiered enforcement from interview decisions.

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
docs(ui-kit): add SPFx widget overlay and scoring model
```

## Recommended Commit Description

```text
Manifest: UI Kit Governance Cleanup

Version: no package or SPFx solution version change unless explicitly authorized by this prompt and confirmed in closeout.

Cleans up UI governance documentation and brand governance for HB Intel. Aligns doctrine, SPFx surface acceptance, brand asset usage, and font governance with the current flagship/benchmark standard. Does not implement product UI, PCC Wave 2 product code, backend routes, tenant mutation, Graph/PnP calls, Procore integrations, app-catalog deployment, CI/CD deployment changes, or package publishing.

```
