# Prompt 01 — Prove Hosted Runtime Parity and Rebuild the SPPKG

## Objective
Prove whether the hosted SharePoint page is actually rendering the current flagship `PriorityActionsRail` path from `main`, and if it is not, correct the package/export/deployment drift before any further UI/UX remediation is trusted.

## Why this prompt exists
The attached screenshot shows a sparse, weak command band that does **not** look like the stronger homepage-flagship render path already present in the repo.

That means the first closure question is not “how do we redesign the strip?”
It is:

- is the current tenant actually rendering the current code,
- current CSS,
- current exports,
- and current flagship context path?

Until that is proven, additional redesign work is at risk of solving the wrong problem.

## Current failure being addressed
Repo truth already shows:
- wrapper-owned embed order
- explicit `surfaceContext="homepage-flagship"`
- a flagship-specific shared surface context
- substantial flagship tile/treatment CSS
- container-query degradation rules

The screenshot does not materially reflect that sophistication.

Treat that mismatch as a P0 closure blocker.

## Governing authority
Apply directly:
- `UI-Doctrine-SPFx-Governing-Standard.md`
- `UI-Doctrine-SPFx-Homepage-Overlay.md`
- benchmark package closure/checklist materials
- `docs/architecture/plans/MASTER/spfx/command-band/PriorityActionsRail-and-Admin-Spec.md`

## Inspect at minimum
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageEntryStack.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageEntryStack.module.css`
- `apps/hb-webparts/src/webparts/priorityActionsRail/PriorityActionsRail.tsx`
- `packages/ui-kit/src/HbcPriorityRail/HbcPriorityRailSurface.tsx`
- `packages/ui-kit/src/HbcPriorityRail/priority-rail.module.css`
- `apps/hb-webparts/config/package-solution.json`
- the export chain backing `@hbc/ui-kit/homepage`
- any build/package wiring that determines which CSS/assets land in the final `.sppkg`

## Required implementation outcome
1. Prove whether the current hosted runtime is stale or drifted.
2. If there is drift:
   - correct it,
   - rebuild the package,
   - redeploy the correct package,
   - and verify the hosted DOM and visuals reflect the intended flagship path.
3. If there is no drift:
   - prove that clearly,
   - and identify the exact current-code reason the hosted result still looks weak.

## Required proof of closure
Return:
- the package/build path used
- the final `.sppkg` evidence
- version/redeployment evidence where relevant
- hosted runtime screenshots after deployment
- runtime DOM evidence showing:
  - wrapper entry-stack markers
  - `homepage-flagship` rail context markers
  - any device/shell state markers available
- a short statement answering:
  - was the screenshot caused by stale deployment or by current code behavior?

## Done means
This prompt is complete only when the hosted SharePoint page is proven to be rendering the intended current flagship path, or the exact remaining live-code cause is proven with evidence.
## Working rules
- Do not reopen already-correct wrapper ownership unless repo truth proves a real defect.
- Do not migrate the rail into shell-occupant semantics.
- Do not drift into unrelated homepage modules.
- Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.
- Return concrete proof of closure, not just a description of the changes.
