# Phase 04 — Validation Checklist

## Utility-rail hierarchy validation

- [x] A dedicated utility rail now exists and reads as secondary to the flagship stage.
- [x] The utility rail supports the flagship stage without competing with it for primary attention.
- [x] The utility rail remains subordinate to the Signature Hero and fits the Utility zone cleanly.
- [x] The launcher still reads as a curated marketplace, not two unrelated panels.

## Data-seam validation

- [x] Help / support / access-request actions are derived from the normalized launcher seam rather than raw SharePoint fields.
- [x] Any new selectors or helpers required for support actions were added to the normalized seam rather than bypassing it.
- [x] The utility rail suppresses or degrades cleanly when support metadata is absent.
- [x] Partial support metadata does not break layout or CTA clarity.

## Support-action validation

- [x] Help-link behavior is implemented and uses normalized routing data.
- [x] Access-request behavior is implemented and uses normalized routing data.
- [x] Support-owner or owner-reference information is rendered only when it improves utility and remains visually quiet.
- [x] The utility rail does not become a second grouped launcher.

## Notice / maintenance validation

- [x] Notices render only when valid normalized notice data exists.
- [x] Notice treatment remains visually subordinate to the flagship cards.
- [x] Missing notice metadata does not leave broken placeholders.
- [x] Maintenance / outage states do not turn the rail into a noisy alerts panel.

## Homepage / doctrine validation

- [x] `@hbc/ui-kit/homepage` import discipline remains intact.
- [x] No faux app-shell chrome or duplicate navigation was introduced.
- [x] Empty / loading / partial-data behavior exists for the utility-rail region.
- [x] The launcher remains host-aware and author-safe.

## Composition proof validation

- [x] Reference composition or equivalent proof was updated.
- [x] The utility rail fits cleanly beside the flagship stage in the Utility zone.
- [x] The rail reinforces, rather than weakens, the launcher hierarchy.
- [x] Remaining visual or data debt is documented rather than hidden.

## Packaging / regression validation

- [x] `apps/hb-webparts` still builds cleanly after the Phase 04 changes.
- [x] No mount/dispatch seam regressions were introduced.
- [x] No unrelated homepage webparts were materially regressed.
