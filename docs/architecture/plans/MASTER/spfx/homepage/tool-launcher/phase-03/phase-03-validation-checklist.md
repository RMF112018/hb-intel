# Phase 03 — Validation Checklist

## Flagship-stage validation

- [x] A dedicated flagship stage now exists and is not just a styled grouped-tile list.
- [x] Featured platforms render at materially greater visual weight than workflow shelf entries.
- [x] The flagship stage is clearly primary relative to the utility rail and workflow shelves.
- [x] The flagship stage remains subordinate to the Signature Hero and fits the Utility zone cleanly.

## Data-seam validation

- [x] Featured platforms are selected from the normalized launcher seam rather than raw SharePoint field names.
- [x] Featured ordering is explicit and stable.
- [x] The featured stage suppresses cleanly when no valid featured records exist.
- [x] Any new selectors or helpers were added to the normalized seam rather than bypassing it.

## Asset / brand validation

- [x] Flagship cards use real logo/asset treatment where available.
- [x] The tool-launcher asset manifest is used as the preferred governance source for supported platforms.
- [x] Degraded states exist for missing or partial logo scenarios.
- [x] Missing assets do not collapse the flagship stage into generic pseudo-brand clutter.

## Homepage / doctrine validation

- [x] `@hbc/ui-kit/homepage` import discipline remains intact.
- [x] No faux app-shell chrome or duplicate navigation was introduced.
- [x] Empty / loading / partial-data behavior exists for the flagship region.
- [x] The launcher remains host-aware and author-safe.

## Composition proof validation

- [x] Reference composition or equivalent proof was updated.
- [x] The flagship stage fits cleanly alongside Priority Actions in the Utility zone.
- [x] The launcher does not become a second hero.
- [x] Remaining visual or data debt is documented rather than hidden.

## Packaging / regression validation

- [x] `apps/hb-webparts` still builds cleanly after the Phase 03 changes.
- [x] No mount/dispatch seam regressions were introduced.
- [x] No unrelated homepage webparts were materially regressed.
