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
- `src/webparts/priorityActionsRail/` Prompt-05 utility priority actions webpart contract.
- `src/webparts/toolLauncherWorkHub/` Prompt-05 grouped launcher/work-hub webpart contract.
- `src/webparts/companyPulse/` Prompt-06 curated company pulse webpart contract.
- `src/webparts/leadershipMessage/` Prompt-06 leadership message webpart contract.
- `src/webparts/peopleCulture/` Prompt-06 people/culture webpart contract.

## Scaffolding Rules

- Reusable homepage visual primitives must consume `@hbc/ui-kit/homepage`.
- Do not import broad `@hbc/ui-kit` in shared homepage scaffolding.
- Keep property/config seams and data normalization helpers shared and deterministic.
- Tests for greeting, empty/loading, semantic rendering, and top-band authoring states are required.
- Utility-zone prompts should reuse shared normalization/grouping seams for visibility, ordering, and malformed-config fallbacks.
- Awareness-zone prompts should reuse curated hierarchy/media normalization seams and preserve featured-vs-secondary editorial weighting.

## Scripts

- `pnpm --filter @hbc/spfx-hb-webparts check-types`
- `pnpm --filter @hbc/spfx-hb-webparts lint`
- `pnpm --filter @hbc/spfx-hb-webparts build`
- `pnpm --filter @hbc/spfx-hb-webparts test`
