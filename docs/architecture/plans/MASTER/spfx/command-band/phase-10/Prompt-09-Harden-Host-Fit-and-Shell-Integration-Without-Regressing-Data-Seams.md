# Prompt-09 — Harden Host-Fit and Shell Integration Without Regressing Data Seams

## Objective

Lock the redesigned launcher into the real homepage entry stack cleanly, while preserving the strong data and wrapper seams already present.

## Governing authority

Treat the following as controlling implementation authority for this prompt:

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- `docs/reference/spfx-surfaces/benchmark/01-Homepage-Webpart-Conformance-Standard.md`
- `docs/reference/spfx-surfaces/benchmark/07-Persona-and-Design-Symmetry-Rule.md`

The doctrine and benchmark materials are binding. Do not preserve a weak launcher decision merely because it compiles, currently renders, or resembles a prior package recommendation.

## Inspect these exact seams

- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageEntryStack.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageEntryStack.module.css`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageLauncherBand.tsx`
- `apps/hb-webparts/src/homepage/data/usePriorityActionsData.ts`
- `apps/hb-webparts/src/homepage/data/priorityActionsNormalization.ts`
- `apps/hb-webparts/src/homepage/data/priorityActionsPresentation.ts`
- `packages/ui-kit/src/HbcHomepageLauncher/*` only where shell-fit integration requires it

## Current problem to solve

The wrapper-owned entry-stack and data seams are among the strongest parts of the current implementation. Launcher redesign work must not accidentally solve the UX problem by breaking wrapper ownership, host-fit assumptions, or data-pipeline discipline.

## Required implementation work

1. Validate the redesigned launcher inside the existing actions region, wrapper envelope, and entry-stack order.
2. Preserve canonical list-host resolution, cache behavior, and audience/schedule/device filtering.
3. Confirm the redesigned surface still responds to the actual actions-region container width, not an invented outer viewport assumption.
4. Keep loading / empty / error states credible after the redesign.
5. Keep the launcher wrapper-owned and outside shell-occupant territory.
6. Fix any host-fit regressions introduced by the redesign rather than compensating with layout hacks.

## Required future state

The launcher should feel materially better while still behaving like a well-disciplined homepage entry-stack surface that respects the SharePoint host and the HB homepage shell boundaries.

## Proof of closure required

- no new overflow, clipping, or misalignment appears in the actions region
- data loading, filtering, loading, empty, and error states still work
- wrapper ownership and entry-stack order remain intact

## Prohibitions

- Do not redesign the hero or shell lanes.
- Do not move the launcher into shell occupancy just to gain layout freedom.
- Do not regress canonical list-host behavior or cache behavior.

## Working rule

Do not re-read files that are already in your active context unless you need to confirm drift, dependencies, or uncertainty after making changes.
