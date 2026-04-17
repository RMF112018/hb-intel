# Prompt 05 — Add persisted shell-layout groundwork for future governed configuration

## Objective
Introduce the persisted model and validation seam that a future tenant-maintainer control panel will depend on, without building the control panel UI yet.

## Governing authority
- `docs/reference/shell/HB-Shell-Entry-Breakpoint-Spec.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`

## Inspect these files first
- `apps/hb-webparts/src/webparts/hbHomepage/shell/shellSchema.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/shellValidation.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/protectedDecisions.ts`
- any existing homepage list/config seams that could host persisted layout state
- relevant docs under `docs/reference/sharepoint/list-schemas/` if a new list or config object is required

Do not re-read files that are still in active context unless you need to confirm drift, dependencies, or uncertainty after changes.

## Current gap
The shell can parse and validate layout input, but there is no canonical persisted representation for a future governed editor or preview workflow.

## Required implementation outcome
- define the persisted shell-layout contract
- add versioning/migration awareness if needed
- make protected decisions impossible to override through persisted input
- document what becomes configurable later vs what remains system-authored

## Closure proof required
Provide:
- proposed storage model
- schema shape
- validation boundaries
- proof that protected rules cannot be overridden by persisted input

## Prohibited
- no maintainer-facing control panel UI
- no unbounded freeform layout model
