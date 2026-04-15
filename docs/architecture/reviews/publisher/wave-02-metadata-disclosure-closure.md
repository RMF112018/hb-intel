# Wave 02 — Metadata burden reduction and progressive disclosure closure

Scope: Phase 13 Prompt 05. Reduce the visible metadata surface on the primary authoring path, strengthen progressive disclosure for low-frequency controls, and keep the existing intelligent defaults intact.

## Shared primitive added

`sharedChrome/DisclosureSection.tsx` — a thin wrapper around the native `<details>` / `<summary>` element. Native semantics give us keyboard activation (Enter / Space on the summary), focus ring, and screen-reader announcement for free, which matches the posture adopted for `ChooserGroup` and avoids reinventing accessibility work. Accepts `label`, optional `summaryHint`, and a `defaultOpen` flag so callers can open the section when a seeded draft already contains non-default values. Styled in `article-publisher.module.css` using token-backed colours; exports added to `sharedChrome/index.ts`.

## Fields moved behind disclosure, and why

**`HeroPanel.tsx` — `Advanced hero options` disclosure:**

- `HeroTitle` (override) — rarely diverges from the article headline.
- `HeroEyebrow` — occasional editorial polish.
- `HeroCategoryLabel` — already defaulted from the bound project name by `defaultHeroCategoryLabel`; the placeholder now shows the project name so authors see what will be filled if they leave it blank.
- `HeroThemeVariant` — almost always the default.
- `HeroShowMetadata` — occasional toggle.

Remaining on the primary path: `HeroPrimaryImage` and `HeroPrimaryImageAltText` — both required on every article and the routinely-edited hero fields.

**`TeamPresentationPanel.tsx` — `Team layout options` disclosure:**

- `TeamViewerIntro` — optional editorial intro.
- `TeamViewerMode`, `TeamViewerGroupingMode`, `TeamViewerSortMode` — layout/grouping/sort; the defaults cover the vast majority of published articles.
- `TeamViewerMaxInitialVisible` and `TeamViewerAllowExpand` — secondary layout plumbing.

Remaining on the primary path: the `ShowTeamViewer` toggle and `TeamViewerTitle` (heading), which already surfaces the live `defaultTeamHeading(projectName)` as its placeholder.

`MetadataPanel.tsx` was intentionally left unchanged. `SpotlightType`, `ProjectStage`, and `ArticleSubject` are editorial discriminators that affect the published content model — they stay visible and are not moved behind disclosure.

## Defaults preserved and strengthened

- `metadataDefaults.ts` is unchanged. `intelligentDefaultsForSave` continues to fill blank `TeamViewerTitle` and `HeroCategoryLabel` at save-time; author-entered values are never overwritten.
- The Team heading input continues to surface `defaultTeamHeading(ProjectName)` as its live placeholder.
- The Hero category label input now shows `ProjectName` as its placeholder when bound, reinforcing the default without mutating state.

## Author intent preserved

Each disclosure computes a one-time `initialAdvancedOpen` flag on mount using a `useRef`. If any advanced field already carries a non-default value on render (seeded draft, prior save, draft switch), the section starts **open** — so authors never lose sight of values they set. Once the author opens or closes the section, the native `<details>` element owns the state; re-evaluating on every keystroke would fight the author and snap the section shut, so the ref is read once at mount.

## Regression checks

- Typecheck clean for the publisher package.
- Vitest: all pre-existing tests continue to pass. New coverage: `DisclosureSection` (4 tests), `HeroPanel` (5 tests), `TeamPresentationPanel` (5 tests) — 14 new passing tests. The six pre-existing `publisherEndToEnd.test.ts` failures are unchanged and unrelated to this seam.
- No adapter, row-mapper, writer, or contract changes — persistence round-trip for hero/team fields is unaffected.
- `@hbc/ui-kit`, `@hbc/sharepoint-platform`, and package-relationship boundaries are unchanged. The new primitive lives feature-local under `sharedChrome` alongside `ChooserGroup`, `Field`, `StatusBanner`, etc.; promotion to `@hbc/ui-kit` is a future call if a second consumer appears.

## Summary

The primary authoring path for Hero and Team now shows only the fields authors usually touch. Everything else stays one keyboard-accessible summary click away, and default-driven values retain their existing guarantees. No schema, persistence, or shared-UI boundary changes.
