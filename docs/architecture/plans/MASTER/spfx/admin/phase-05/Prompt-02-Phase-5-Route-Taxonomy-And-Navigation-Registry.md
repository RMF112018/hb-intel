# Prompt-02 — Phase 5 Route Taxonomy and Navigation Registry

## Objective

Create the canonical **route / lane taxonomy** for the Admin operator console and implement the first route-registry/navigation-metadata layer that Phase 5 will use.

This prompt should freeze:
- lane names,
- route names,
- navigation labels,
- route ordering,
- and ownership of current vs scaffolded surfaces.

## Important execution rules

- Do not re-read files still in active context unless necessary.
- Use the Phase 5 baseline from Prompt-01 as the controlling input.
- Prefer a route registry / metadata model over scattered hard-coded strings.
- Do not overbuild a dynamic CMS-style navigation system.

## Inputs

Use:
- `docs/architecture/plans/MASTER/spfx/admin/phase-5/admin-spfx-phase-5-operator-console-baseline.md`
- `apps/admin/src/router/root-route.tsx`
- `apps/admin/src/router/routes.ts`
- `apps/admin/src/pages/**` relevant current pages

## Required work

### A. Create canonical route/lane docs
Create:
- `docs/architecture/plans/MASTER/spfx/admin/phase-5/admin-spfx-phase-5-route-taxonomy.md`
- `docs/architecture/plans/MASTER/spfx/admin/phase-5/admin-spfx-phase-5-page-ownership-map.md`

### B. Implement a route registry / metadata layer in the app
Create a route registry / navigation metadata file under `apps/admin/src/router/` or `apps/admin/src/constants/` that becomes the single source of truth for:
- route ids
- paths
- labels
- lane grouping
- visibility / nav intent
- mapping of existing pages vs scaffold pages

Use the smallest clean structure the repo needs.

## Lane set to model

The route taxonomy must support, at minimum:

- Setup / Install
- Validation
- Runs / History
- SharePoint Control
- Entra Control
- Standards / Config
- Health / Alerts
- Error / Audit

Also preserve current access-control / approval-authority administration in a coherent place.
If the cleanest answer is to place this under Standards / Config or a secondary admin utilities area, document that choice explicitly.

## Required output quality

The docs and registry must make clear:
- which lanes already have real page content,
- which lanes are Phase 5 scaffolds only,
- which existing pages are being rehomed,
- and which route names/labels must be preserved for compatibility vs changed.

## Implementation guardrails

- Do not delete working routes yet unless Prompt-05 later makes replacement safe.
- Prefer adding a stable canonical route layer first.
- Keep names explicit and operator-facing.
- Avoid overly cute route names.

## Validation

Before finishing:
- verify the taxonomy and registry agree,
- verify path names are intentional and future-friendly,
- verify every current page has an ownership slot in the new map,
- verify this prompt does not yet overreach into page-shell implementation.

## Completion condition

Stop after the route taxonomy docs and route registry / nav metadata are in place.
Do not perform the full shell refactor in this prompt.
