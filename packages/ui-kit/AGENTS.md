# UI Kit Routing — Codex

## Primary rule

`@hbc/ui-kit` owns reusable visual primitives, theme tokens, brand assets, icons, and governed presentation patterns. Do not create one-off UI systems in apps or feature packages when a governed ui-kit primitive or extension path applies.

## Required starting sources

Use as applicable:

```text
packages/ui-kit/package.json
packages/ui-kit/README.md
docs/reference/ui-kit/entry-points.md
docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md
docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md
docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Full-Page-App-Widget-Overlay.md
docs/reference/ui-kit/doctrine/UI-Doctrine-Acceptance-and-Scoring-Model.md
docs/reference/brand/BRAND-USAGE-GOVERNANCE.md
```

## Entry-point discipline

Use the narrowest supported entry point:

- `@hbc/ui-kit/theme` for tokens only.
- `@hbc/ui-kit/icons` for icons only.
- `@hbc/ui-kit/branding` for brand assets only.
- `@hbc/ui-kit/primitives` for Layer-2 primitives.
- `@hbc/ui-kit/homepage` for HB Central homepage webparts.
- `@hbc/ui-kit/app-shell` for SPFx shell-adjacent surfaces.
- Full `@hbc/ui-kit` only for PWA/dev-harness/non-constrained contexts.

For `apps/hb-webparts`, do not import full `@hbc/ui-kit`, `@hbc/ui-kit/app-shell`, `@hbc/ui-kit/primitives`, or `@hbc/ui-kit/fluent` unless a governing doc is explicitly changed to allow it.

## Brand and font assets

Do not expose, copy, move, extract, or redistribute raw font files or brand assets unless the task explicitly authorizes it and brand governance permits it. Prefer curated web-ready assets and ui-kit registry exports.

## SPFx doctrine

SPFx surfaces must be host-aware, authoring-safe, breakpoint-governed, and resilient in partial/missing configuration states. Do not treat SPFx as generic React/Vite work.

## Validation

Prefer local commands:

```bash
pnpm --filter @hbc/ui-kit check-types
pnpm --filter @hbc/ui-kit test
pnpm --filter @hbc/ui-kit lint
pnpm --filter @hbc/ui-kit build
```

Use Storybook only when component behavior, visual state coverage, or UI acceptance requires it:

```bash
pnpm --filter @hbc/ui-kit build-storybook
```

Do not run browser/storybook servers or Playwright without approval.
