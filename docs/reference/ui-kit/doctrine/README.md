# UI Doctrine Index

## Purpose

This index defines the current doctrine set, doctrine reading order, and applicability by runtime/surface.

## Doctrine Set

- [UI Doctrine — SPFx Governing Standard](./UI-Doctrine-SPFx-Governing-Standard.md)
- [UI Doctrine — SPFx Homepage Overlay](./UI-Doctrine-SPFx-Homepage-Overlay.md)
- [UI Doctrine — PWA Governing Standard](./UI-Doctrine-PWA-Governing-Standard.md)

## Reading Order

1. SPFx work: SPFx Governing Standard first.
2. Homepage SPFx work: apply SPFx Homepage Overlay on top of SPFx Governing Standard.
3. PWA work: PWA Governing Standard.
4. In mixed/shared scenarios, apply runtime doctrine first, then cross-runtime obligations.

## Applicability Matrix

| Surface Type                                | Primary Doctrine        | Secondary Doctrine/Notes                                         |
| ------------------------------------------- | ----------------------- | ---------------------------------------------------------------- |
| Homepage SPFx webparts (`apps/hb-webparts`) | SPFx Governing Standard | SPFx Homepage Overlay applies additional homepage-specific rules |
| Full-page SPFx app/widget                   | SPFx Governing Standard | Current authority remains SPFx Governing Standard                |
| PCC-style SPFx surfaces                     | SPFx Governing Standard | Current authority remains SPFx Governing Standard                |
| Generic SPFx domain apps                    | SPFx Governing Standard | Use host-aware constraints and import policy discipline          |
| PWA surfaces                                | PWA Governing Standard  | Apply PWA runtime expectations                                   |
| Shared UI-kit component docs                | Not primary doctrine    | Component docs are Layer 3 API/usage references only             |

## Binding vs Overlay

- SPFx Governing Standard and PWA Governing Standard are runtime-level governing standards.
- SPFx Homepage Overlay is a runtime overlay scoped to homepage surfaces.
- Component/pattern/lane docs are references and cannot override doctrine.

## Future Doctrine Artifact (Planned)

A dedicated full-page SPFx app/widget overlay is a future governance target for a later prompt.

It is not currently active authority and is intentionally not linked as a live governing document in Prompt 02.
