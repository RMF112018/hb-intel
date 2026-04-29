# UI Kit Governance Map

## Purpose

This map routes each consumer type to its current governing authority and supporting references.

## Consumer-to-Authority Map

| Consumer Type             | First Governing Doc                                                     | Supporting Docs                                                                                                                                                                              | Notes                                                                                                  |
| ------------------------- | ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Homepage SPFx webparts    | `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md` | `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`, `docs/reference/ui-kit/doctrine/UI-Doctrine-Acceptance-and-Scoring-Model.md`, `docs/reference/ui-kit/entry-points.md` | Homepage-specific rules apply only through the homepage overlay path.                                  |
| Full-page SPFx app/widget | `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md` | `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Full-Page-App-Widget-Overlay.md`, `docs/reference/ui-kit/doctrine/UI-Doctrine-Acceptance-and-Scoring-Model.md`                              | Non-homepage SPFx uses full-page/widget overlay and does not inherit homepage-only rules by default.   |
| PCC-style SPFx surfaces   | `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md` | `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Full-Page-App-Widget-Overlay.md`, `docs/reference/ui-kit/doctrine/UI-Doctrine-Acceptance-and-Scoring-Model.md`, lane references as needed   | Command-center and workbench governance is routed through the non-homepage SPFx overlay.               |
| Generic SPFx domain apps  | `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md` | `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Full-Page-App-Widget-Overlay.md` when applicable                                                                                            | Apply the overlay when surface characteristics match full-page/widget scope.                           |
| PWA surfaces              | `docs/reference/ui-kit/doctrine/UI-Doctrine-PWA-Governing-Standard.md`  | `docs/reference/ui-kit/entry-points.md`                                                                                                                                                      | PWA doctrine governs behavior and acceptance for PWA routes.                                           |
| Feature packages          | Runtime doctrine of consumer surface                                    | `docs/architecture/blueprint/package-relationship-map.md`, `docs/reference/ui-kit/UI-System-Layer-Model.md`                                                                                  | Packages must not override runtime doctrine through local conventions.                                 |
| Component reference usage | Runtime doctrine of consuming surface                                   | `docs/reference/ui-kit/Hbc*.md`, layout docs, lane docs                                                                                                                                      | Component docs are API/usage references only; they do not override doctrine.                           |
| Brand usage in UI         | Runtime doctrine of consuming surface                                   | `docs/reference/brand/README.md`, `docs/reference/brand/BRAND-USAGE-GOVERNANCE.md`, `docs/reference/brand/BRAND-ASSET-INVENTORY.md`                                                          | Reusable brand assets flow through `@hbc/ui-kit/branding`; no raw imports from brand source territory. |

## Doctrine Precedence Rule

Layer 1 runtime doctrine always wins over component/pattern/lane reference docs when conflict exists.

## Related

- `docs/reference/ui-kit/README.md`
- `docs/reference/ui-kit/doctrine/README.md`
- `docs/reference/ui-kit/GOVERNANCE-SUPERSESSION.md`
