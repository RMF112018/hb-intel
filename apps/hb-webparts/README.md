# @hbc/spfx-hb-webparts

Prompt-03 scaffold app for the HB Central homepage webpart system.

## Folder Conventions

- `src/homepage/shared/` shared homepage primitives used by multiple webparts.
- `src/homepage/helpers/` identity, greeting, visibility, and config seams.
- `src/homepage/webparts/` shared webpart-level contracts for top-band authoring/config seams.
- `src/homepage/models/` common content and view-model contracts.
- `src/homepage/__tests__/` shared-layer tests.
- `src/webparts/hbWebparts/` package-level scaffold manifest.
- `src/webparts/personalizedWelcomeHeader/` Prompt-04 welcome-header webpart contract.
- `src/webparts/hbHeroBanner/` Prompt-04 hero-banner webpart contract.

## Scaffolding Rules

- Reusable homepage visual primitives must consume `@hbc/ui-kit/homepage`.
- Do not import broad `@hbc/ui-kit` in shared homepage scaffolding.
- Keep property/config seams and data normalization helpers shared and deterministic.
- Tests for greeting, empty/loading, semantic rendering, and top-band authoring states are required.

## Scripts

- `pnpm --filter @hbc/spfx-hb-webparts check-types`
- `pnpm --filter @hbc/spfx-hb-webparts lint`
- `pnpm --filter @hbc/spfx-hb-webparts build`
- `pnpm --filter @hbc/spfx-hb-webparts test`
