# Prompt 04 — Decide and Implement the Discovery / WorkHub Strategy

## Objective

Resolve the current gap between the richer reference homepage story and the narrower production HB Homepage shell by deciding how `SmartSearchWayfinding` and `ToolLauncherWorkHub` should participate in the flagship homepage.

## Governing authorities

- `apps/hb-webparts/src/homepage/ReferenceHomepageComposition.tsx`
- `apps/hb-webparts/src/mount.tsx`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`

## Exact files / seams to inspect

- `apps/hb-webparts/src/homepage/ReferenceHomepageComposition.tsx`
- `apps/hb-webparts/src/mount.tsx`
- `apps/hb-webparts/src/webparts/toolLauncherWorkHub/`
- `apps/hb-webparts/src/webparts/smartSearchWayfinding/`
- `apps/hb-webparts/src/webparts/hbHomepage/` shell files

Do not re-read files still in active context unless needed to confirm drift, dependencies, or uncertainty after changes.

## Required implementation outcome

Choose one explicit path and implement/document it:

### Option A — flagship inclusion
Bring one or both surfaces into the governed flagship page with shell-fit-safe placement.

### Option B — governed exclusion
Keep them outside the flagship shell, but document the reason, page role, and placement rules so the reference composition no longer overpromises a page story the live product does not intend to deliver.

A half-state is not acceptable.

## Proof of closure

Provide:
- chosen product direction
- code and/or documentation changes
- shell or page placement rules
- files changed
