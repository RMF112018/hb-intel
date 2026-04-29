# UI Kit Governance Index

## Purpose

This file is the authoritative starting point for UI governance routing in HB Intel.

It defines which documents govern decisions by runtime/surface and what reference material is non-governing.

## Authority Hierarchy

### Layer 1 (Highest Authority)

Runtime-specific doctrine governs product behavior and acceptance:

- [UI Doctrine — SPFx Governing Standard](./doctrine/UI-Doctrine-SPFx-Governing-Standard.md)
- [UI Doctrine — SPFx Homepage Overlay](./doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md)
- [UI Doctrine — SPFx Full-Page App and Widget Overlay](./doctrine/UI-Doctrine-SPFx-Full-Page-App-Widget-Overlay.md)
- [UI Doctrine — Acceptance and Scoring Model](./doctrine/UI-Doctrine-Acceptance-and-Scoring-Model.md)
- [UI Doctrine — PWA Governing Standard](./doctrine/UI-Doctrine-PWA-Governing-Standard.md)

### Layer 2 (Cross-Runtime Obligations)

Cross-runtime constraints apply in all surfaces:

- accessibility and interaction safety
- token and theme discipline
- package boundary and import discipline
- host/runtime fit requirements

### Layer 3 (Reference, Not Governing Authority)

Component, lane, pattern, and composition docs support implementation but do not override Layer 1 doctrine.

If any Layer 3 guidance conflicts with Layer 1 doctrine, Layer 1 doctrine wins.

## Consumer Routing (Current Authority)

- Homepage SPFx webparts (`apps/hb-webparts`):
  - SPFx Governing Standard -> SPFx Homepage Overlay -> Acceptance and Scoring Model -> [entry-points.md](./entry-points.md)
- Full-page SPFx app/widget and PCC-style SPFx work:
  - SPFx Governing Standard -> SPFx Full-Page App and Widget Overlay -> Acceptance and Scoring Model
- PWA surfaces:
  - PWA Governing Standard
- Feature packages and shared libraries:
  - Runtime doctrine for consuming surface + package boundary governance
- Brand usage:
  - `docs/reference/brand/README.md`
  - `docs/reference/brand/BRAND-USAGE-GOVERNANCE.md`

See [GOVERNANCE-MAP.md](./GOVERNANCE-MAP.md) for the full matrix.

## Entry-Point Governance

`@hbc/ui-kit` entry-point rules and homepage import policy are governed by:

- [entry-points.md](./entry-points.md)

## Supersession and Legacy Status

Legacy, historical, and deprecated UI-kit docs are tracked centrally in:

- [GOVERNANCE-SUPERSESSION.md](./GOVERNANCE-SUPERSESSION.md)

## Related Governance

- [Doctrine Index](./doctrine/README.md)
- [GOVERNANCE-MAP.md](./GOVERNANCE-MAP.md)
- [GOVERNANCE-SUPERSESSION.md](./GOVERNANCE-SUPERSESSION.md)
- [GOVERNANCE-CLEANUP-SCOPE-LOCK.md](./GOVERNANCE-CLEANUP-SCOPE-LOCK.md)
