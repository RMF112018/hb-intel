# 13 — SPFx Runtime and Manifest Routing

## Primary Rule

Do not treat SPFx work as generic React/Vite work. SPFx surfaces have host, manifest, package, runtime, and tenant constraints.

## Required Sources

Use as applicable:

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Full-Page-App-Widget-Overlay.md`
- nearest app README and `package.json`
- app `config/**`
- adjacent `*.manifest.json`
- `tools/validate-manifests.ts`
- `docs/reference/developer/verification-commands.md`

## Checks

Confirm:

- manifest adjacency;
- supported hosts;
- package/manifest version posture;
- IIFE/global mount contract where applicable;
- CSS emission and bundle format when applicable;
- preview/fallback state preservation;
- authoring/edit-mode posture;
- breakpoint behavior;
- no unauthorized tenant/app catalog/package operations.

## Sensitive Boundary

`.sppkg` generation, app catalog upload, hosted validation, and tenant smoke tests require explicit authorization and gatekeeper review.
