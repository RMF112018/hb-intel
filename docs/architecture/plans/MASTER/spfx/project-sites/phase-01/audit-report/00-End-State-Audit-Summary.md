# Phase 1 — Framing

## Objective

Conduct a forward-looking repo-truth audit of the live `main`-branch **Project Sites** implementation and determine what still has to change for the product to become a premium, trustworthy, low-friction SharePoint project-site discovery and launch surface.

This is not a closure recitation. It is a delta analysis between:

- the current repo-truth implementation under `apps/project-sites/` and `packages/spfx/src/webparts/projectSites/`
- the attached doctrine / benchmark package
- the desired end state described in the attached prompt

## Source of truth used

Implementation truth was taken from the live repo footprint, especially:

- `apps/project-sites/src/mount.tsx`
- `apps/project-sites/src/webparts/projectSites/ProjectSitesWebPart.manifest.json`
- `apps/project-sites/config/package-solution.json`
- `apps/project-sites/vite.config.ts`
- `packages/spfx/src/webparts/projectSites/ProjectSitesRoot.tsx`
- `packages/spfx/src/webparts/projectSites/ProjectSitesWebPart.ts`
- `packages/spfx/src/webparts/projectSites/hooks/useAvailableYears.ts`
- `packages/spfx/src/webparts/projectSites/hooks/useProjectSites.ts`
- `packages/spfx/src/webparts/projectSites/types.ts`
- `packages/spfx/src/webparts/projectSites/normalizeProjectSiteEntry.ts`
- `packages/spfx/src/webparts/projectSites/projectSitesFilter.ts`
- `packages/spfx/src/webparts/projectSites/components/ProjectSiteCard.tsx`
- `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts`

Context-only closure material was also reviewed to avoid backward-looking busywork:

- `docs/architecture/reviews/spfx/project-sites/project-sites-ui-kit-compliance-closure.md`
- `docs/architecture/reviews/spfx/project-sites/project-sites-search-filter-sort-enhancement.md`
- `docs/architecture/reviews/spfx/project-sites/project-sites-full-width-horizontal-spacing-update.md`
- `docs/architecture/reviews/spfx/spfx-pipeline-project-sites-hb-webparts-freshness-audit.md`

## Governing doctrine applied

Primary:
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`

Supplementary / benchmark:
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- benchmark package README + plan summary + conformance standard + scoring matrix + closure checklist + persona rule

Important interpretation:
- Project Sites was **not** audited as though it were literally a homepage webpart.
- The homepage benchmark package was used to judge maturity, seriousness, host quality, and persona-fit discipline.
- Homepage-only structural rules were not forced onto the surface when repo truth did not justify them.

## Audit posture

Hosted screenshots were not attached, so this audit is repo-first and inference-aware.  
Where a conclusion depends on rendered behavior, it is derived from confirmed implementation details rather than visual guesswork.

## Desired product end state

Project Sites should help users:

- reach the correct project site quickly
- trust that scope and year context are correct
- understand why a project appears or does not appear
- distinguish live, archived, provisioning, and data-deficient records honestly
- use the surface comfortably across desktop, laptop, tablet, phone, split-window, and zoom-constrained conditions

## Executive framing judgment

The current implementation is **directionally good but not end-state close**.

It already behaves like a deliberate product surface rather than a plain list query.  
But it still has foundational trust gaps in year authority, configuration plumbing, launch-state truthfulness, and responsive contract definition.


# Phase 6 — Executive Summary

Project Sites is **not** a weak implementation. It is already a materially improved SPFx product surface with real control-bar logic, typed normalization, differentiated cards, and credible host-light packaging discipline.

But it is **not truly close to the intended end state**.

The biggest remaining friction points are:

1. **Year authority is not trustworthy enough.** The repo still advertises host-page `Year` behavior and a `yearOverride`, but the live app resolves scope internally and drops shell-passed runtime config.
2. **Launch-state truth is too coarse.** The product still infers too much from `siteUrl` presence and a narrow stage check.
3. **Data rigor is transitional, not final.** Full raw-item fetches and defensive normalization were reasonable stabilization steps, but the end-state surface needs a stronger canonical adapter.
4. **Responsive behavior is not explicitly governed.** It wraps and scales, but it does not yet satisfy the updated breakpoint doctrine as a defined, container-aware product.
5. **Card identity is still a bit too thin.** Users can scan the surface, but not always with maximum click confidence at portfolio scale.

The fastest high-impact wins are:
- restore authoritative year/context plumbing
- define an explicit launch-state model
- add truthful partial-data messaging
- strengthen compact-mode behavior and breakpoint documentation

The most important strengths to preserve are:
- the typed normalization seam
- the pure pipeline architecture
- the premium productive tone
- the full-width host-aware presentation
- the differentiated card-state concept
