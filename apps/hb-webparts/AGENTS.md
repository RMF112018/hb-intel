# HB Webparts / Homepage SPFx Routing — Codex

## Primary rule

Do not treat `apps/hb-webparts` as generic React/Vite work. It is a SharePoint-hosted SPFx homepage/webpart surface with manifest, package, runtime, authoring, ui-kit entry-point, and tenant constraints.

## Required starting sources

Use as applicable:

```text
apps/hb-webparts/package.json
apps/hb-webparts/README.md
apps/hb-webparts/config/**
apps/hb-webparts/src/webparts/**/*.manifest.json
docs/reference/ui-kit/entry-points.md
docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md
docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md
tools/validate-manifests.ts
docs/reference/developer/verification-commands.md
```

## Import policy

Homepage webparts must default to:

- `@hbc/ui-kit/homepage`
- `@hbc/ui-kit/theme`
- `@hbc/ui-kit/icons`

Do not use the full `@hbc/ui-kit` barrel, `@hbc/ui-kit/app-shell`, `@hbc/ui-kit/primitives`, or `@hbc/ui-kit/fluent` for homepage webpart code unless the governing docs explicitly change.

## SPFx checks

When changing source, manifests, packaging, runtime mounting, or homepage surface behavior, check:

- manifest adjacency;
- supported hosts;
- `preconfiguredEntries` and toolbox visibility;
- IIFE/global mount contract;
- CSS emission and bundle format;
- preview/fallback state preservation;
- authoring/edit-mode posture;
- breakpoint behavior;
- no unauthorized tenant/app catalog/package operations.

## Sensitive boundary

`.sppkg` generation, app catalog upload, hosted validation, tenant smoke tests, SharePoint mutation, Graph/PnP calls, and live endpoint probes require explicit user authorization.

## Validation

Prefer package-local validation first:

```bash
pnpm --filter @hbc/spfx-hb-webparts check-types
pnpm --filter @hbc/spfx-hb-webparts test
pnpm --filter @hbc/spfx-hb-webparts lint
pnpm --filter @hbc/spfx-hb-webparts build
```

Use manifest validation when manifest/package/runtime behavior changes:

```bash
pnpm turbo run validate-manifests
```

Use Playwright/webparts E2E only when runtime SharePoint-like behavior, page layout, or mounting changed and the task authorizes it.
