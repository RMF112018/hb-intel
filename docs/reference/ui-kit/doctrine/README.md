# UI Doctrine Index

## Purpose

This index defines the current doctrine set, doctrine reading order, and applicability by runtime and surface type.

## Doctrine Set

- [UI Doctrine — SPFx Governing Standard](./UI-Doctrine-SPFx-Governing-Standard.md)
- [UI Doctrine — SPFx Homepage Overlay](./UI-Doctrine-SPFx-Homepage-Overlay.md)
- [UI Doctrine — SPFx Full-Page App and Widget Overlay](./UI-Doctrine-SPFx-Full-Page-App-Widget-Overlay.md)
- [UI Doctrine — Acceptance and Scoring Model](./UI-Doctrine-Acceptance-and-Scoring-Model.md)
- [UI Doctrine — PWA Governing Standard](./UI-Doctrine-PWA-Governing-Standard.md)

## Reading Order

1. SPFx work: SPFx Governing Standard first.
2. Homepage SPFx work: apply Homepage Overlay and acceptance model.
3. Non-homepage SPFx full-page/widget/PCC work: apply Full-Page App and Widget Overlay and acceptance model.
4. PWA work: PWA Governing Standard.
5. In mixed/shared scenarios, apply runtime doctrine first, then cross-runtime obligations.

## Applicability Matrix

| Surface Type                                | Primary Doctrine        | Secondary Doctrine/Notes                                        |
| ------------------------------------------- | ----------------------- | --------------------------------------------------------------- |
| Homepage SPFx webparts (`apps/hb-webparts`) | SPFx Governing Standard | Homepage Overlay + Acceptance and Scoring Model                 |
| Full-page SPFx app/widget                   | SPFx Governing Standard | Full-Page App and Widget Overlay + Acceptance and Scoring Model |
| PCC-style SPFx surfaces                     | SPFx Governing Standard | Full-Page App and Widget Overlay + Acceptance and Scoring Model |
| Generic SPFx domain apps                    | SPFx Governing Standard | Apply full-page/widget overlay when surface fits that scope     |
| PWA surfaces                                | PWA Governing Standard  | SPFx overlays do not govern PWA routes                          |
| Shared UI-kit component docs                | Not primary doctrine    | Component docs are Layer 3 API/usage references only            |

## Binding vs Overlay

- SPFx Governing Standard and PWA Governing Standard are runtime-level governing standards.
- Homepage Overlay is scoped to homepage surfaces.
- Full-Page App and Widget Overlay is scoped to non-homepage full-page/widget/PCC surfaces.
- Acceptance and Scoring Model defines closure/scoring enforcement across SPFx surface types.
- Component/pattern/lane docs are references and cannot override doctrine.
